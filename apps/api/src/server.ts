import './modules/persistence/index.js';
import { createApp } from './app.js';
import { bootstrapHttpAndWebSocketServer } from './websocket/socket.server.js';
import { realtimeOrchestratorService } from './services/realtime-orchestrator.service.js';
import { logger } from './utils/logger.js';

const app = createApp();
realtimeOrchestratorService.initialize();

const { start, stop } = bootstrapHttpAndWebSocketServer(app);

const handleShutdown = async (signal: string): Promise<void> => {
  logger.info('Shutdown signal received', { signal });
  await stop();
  process.exit(0);
};

process.on('SIGINT', () => {
  void handleShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void handleShutdown('SIGTERM');
});

start();
