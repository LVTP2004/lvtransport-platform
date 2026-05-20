import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { eventBus } from '../events/event-bus.js';
import { WS_EVENTS } from '../constants/app.constants.js';

export const bootstrapHttpAndWebSocketServer = (app: Express) => {
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  const broadcast = (event: string, payload: unknown) => {
    const message = JSON.stringify({ event, payload, emittedAt: new Date().toISOString() });
    wss.clients.forEach((client) => client.send(message));
  };

  eventBus.on(WS_EVENTS.BOOKING_UPDATED, (payload) => broadcast(WS_EVENTS.BOOKING_UPDATED, payload));

  wss.on('connection', (socket) => {
    logger.info('WebSocket client connected');
    socket.send(JSON.stringify({ event: WS_EVENTS.CONNECTION, payload: { ok: true } }));
    socket.on('close', () => logger.info('WebSocket client disconnected'));
  });

  const start = (): void => {
    server.listen(env.PORT, () => logger.info(`API + WebSocket server listening on port ${env.PORT}`));
  };

  return { server, wss, start };
};
