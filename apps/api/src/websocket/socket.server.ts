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
  const wss = new WebSocketServer({ server, path: env.wsPath });

  const broadcast = (payload: Record<string, unknown>): void => {
    let encoded: string;
    try {
      encoded = JSON.stringify(payload);
    } catch {
      logger.error('Failed to encode websocket payload for broadcast');
      return;
    }
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(encoded);
      }
    }
  };

  eventBus.on(WS_EVENTS.BOOKING_UPDATED, (snapshot) => {
    broadcast({ type: WS_EVENTS.BOOKING_UPDATED, payload: snapshot });
  });

  wss.on('connection', (socket, request) => {
    logger.info('WebSocket client connected', { remoteAddress: request.socket.remoteAddress, path: request.url });
    socket.send(JSON.stringify({
      type: 'connection.ack',
      message: 'WebSocket realtime channel ready',
      lifecycleSnapshots: bookingLifecycleRealtimeService.getAllSnapshots(),
    }));

    socket.on('error', (error) => {
      logger.warn('WebSocket client error', { message: error.message });
    });

    socket.on('message', (message) => {
      const raw = message.toString();
      if (raw.length > 8_000) {
        socket.send(JSON.stringify({ type: 'error', message: 'message.too_large' }));
        return;
      }

      try {
        const payload = JSON.parse(raw) as { type?: string; bookingId?: string };
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
    socket.on('close', () => logger.info('WebSocket client disconnected'));
  });

  const start = (): void => {
    server.listen(env.port, () => logger.info(`API + WebSocket server listening on port ${env.port}`));
    server.on('error', (error) => {
      logger.error('HTTP/WebSocket server failed', { message: error.message });
    });
  };

  const stop = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      wss.close(() => {
        server.close(() => resolve());
      });
    });
  };

  return { server, wss, start, stop };
};
