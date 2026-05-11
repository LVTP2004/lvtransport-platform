import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { createSocketServer } from './websocket/socketServer.js';

const app = createApp();
const server = createServer(app);

createSocketServer(server);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${env.port}`);
});
import { createApp } from './app.js';
import { bootstrapHttpAndWebSocketServer } from './websocket/socket.server.js';
import { realtimeOrchestratorService } from './services/realtime-orchestrator.service.js';

const app = createApp();
realtimeOrchestratorService.initialize();

const { start } = bootstrapHttpAndWebSocketServer(app);
start();
