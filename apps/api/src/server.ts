import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { createSocketServer } from './websocket/socketServer.js';

const app = createApp();
const server = createServer(app);

createSocketServer(server);

server.listen(env.port, () => {
  console.log(`API server listening on port ${env.port}`);
});
