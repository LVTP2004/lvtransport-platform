import { createApp } from './app.js';
import { bootstrapHttpAndWebSocketServer } from './websocket/socket.server.js';
import { realtimeOrchestratorService } from './services/realtime-orchestrator.service.js';
import { logger } from './utils/logger.js';
import { env, logEnvironmentDiagnostics } from './config/env.js';

const registerProcessSafetyHandlers = (): void => {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: reason instanceof Error ? reason.message : String(reason) });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { message: error.message, stack: error.stack });
  });
};

const runStartupValidation = (): void => {
  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error(`PORT must be a valid TCP port, received ${env.port}`);
  }
  if (!env.wsPath.startsWith('/')) {
    throw new Error(`WS_PATH must start with "/", received "${env.wsPath}"`);
  }
  logEnvironmentDiagnostics();
};

const app = createApp();
registerProcessSafetyHandlers();
runStartupValidation();
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
