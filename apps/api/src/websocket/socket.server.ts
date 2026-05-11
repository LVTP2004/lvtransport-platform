import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import type { Express } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { realtimeOrchestratorService } from '../services/realtime-orchestrator.service.js';

export const bootstrapHttpAndWebSocketServer = (app: Express) => {
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    logger.info('WebSocket client connected');
    realtimeOrchestratorService.registerClient(socket);
    socket.on('close', () => logger.info('WebSocket client disconnected'));
  });

  const start = (): void => {
    server.listen(env.port, () => logger.info(`API + WebSocket server listening on port ${env.port}`));
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
