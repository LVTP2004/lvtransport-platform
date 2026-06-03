import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';
import { bookingLifecycleRealtimeService } from '../services/booking-lifecycle-realtime.service.js';
import { realtimeOrchestratorService } from '../services/realtime-orchestrator.service.js';

export const bootstrapHttpAndWebSocketServer = (app: Express) => {
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clientHeartbeats = new WeakMap<object, number>();

  const heartbeatInterval = setInterval(() => {
    const threshold = Date.now() - 45_000;

    for (const client of wss.clients) {
      const lastBeat = clientHeartbeats.get(client) ?? Date.now();

      if (lastBeat < threshold) {
        logger.warn('WebSocket stale client terminated', { staleMs: Date.now() - lastBeat });
        client.terminate();
        continue;
      }

      if (client.readyState === client.OPEN) {
        client.ping();
      }
    }
  }, 15_000);

  const broadcast = (event: string, payload: unknown): void => {
    const message = JSON.stringify({
      event,
      payload,
      emittedAt: new Date().toISOString(),
    });

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  };

  eventBus.on(WS_EVENTS.BOOKING_UPDATED, (payload) => {
    broadcast(WS_EVENTS.BOOKING_UPDATED, payload);
  });

  wss.on('connection', (socket) => {
    logger.info('WebSocket client connected');

    clientHeartbeats.set(socket, Date.now());

    socket.send(JSON.stringify({
      event: WS_EVENTS.CONNECTION,
      payload: { ok: true },
    }));

    socket.send(JSON.stringify({
      type: 'connection.ack',
      message: 'WebSocket realtime channel ready',
      lifecycleSnapshots: bookingLifecycleRealtimeService.getAllSnapshots(),
    }));

    socket.on('message', (message) => {
      const raw = message.toString();
      logger.info('WebSocket message received', { message: raw });

      try {
        const payload = JSON.parse(raw) as { type?: string; bookingId?: string };
        clientHeartbeats.set(socket, Date.now());

        if (payload.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', serverTime: new Date().toISOString() }));
          return;
        }

        if (payload.type === 'booking.lifecycle.recover' && payload.bookingId) {
          const snapshot = bookingLifecycleRealtimeService.getSnapshot(payload.bookingId);
          socket.send(JSON.stringify({
            type: 'booking.lifecycle.snapshot',
            payload: snapshot ?? null,
          }));
        }
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'invalid.message' }));
      }
    });

    realtimeOrchestratorService.registerClient(socket);

    socket.on('pong', () => clientHeartbeats.set(socket, Date.now()));
    socket.on('close', () => logger.info('WebSocket client disconnected'));
  });

  const start = (): void => {
    server.listen(env.port, () => {
      logger.info(`API + WebSocket server listening on port ${env.port}`);
    });
  };

  const stop = async (): Promise<void> => {
    clearInterval(heartbeatInterval);
    realtimeOrchestratorService.shutdown?.();
    wss.close();

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  };

  return { start, stop };
};
