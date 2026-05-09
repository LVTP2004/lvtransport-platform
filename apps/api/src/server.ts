import { createApp } from './app.js';
import { bootstrapHttpAndWebSocketServer } from './websocket/socket.server.js';
import { realtimeOrchestratorService } from './services/realtime-orchestrator.service.js';

const app = createApp();
realtimeOrchestratorService.initialize();

const { start } = bootstrapHttpAndWebSocketServer(app);
start();
