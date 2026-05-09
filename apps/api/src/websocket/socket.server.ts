import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const bootstrapHttpAndWebSocketServer = (app: Express) => {
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    logger.info('WebSocket client connected');
    socket.on('message', (message) => logger.info('WebSocket message received', { message: message.toString() }));
    socket.on('close', () => logger.info('WebSocket client disconnected'));
  });

  const start = (): void => {
    server.listen(env.PORT, () => logger.info(`API + WebSocket server listening on port ${env.PORT}`));
  };

  return { server, wss, start };
};
