import { Server as HttpServer } from 'node:http';
import { WebSocketServer } from 'ws';

export function createSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'connection.ack', message: 'WebSocket scaffold ready' }));
  });

  return wss;
}
