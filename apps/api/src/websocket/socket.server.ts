import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import type { Express } from 'express';

export const bootstrapHttpAndWebSocketServer = (
  app: Express
) => {
  const server = createServer(app);

  const wss = new WebSocketServer({
    server,
    path: '/ws'
  });

  const start = () => {};

  const stop = async () => {
    wss.close();
  };

  return {
    server,
    wss,
    start,
    stop
  };
};
