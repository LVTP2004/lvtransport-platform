import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { env } from '../config/env.js';
import { realtimeOrchestratorService } from '../services/realtime-orchestrator.service.js';
import { operationalObservabilityService } from '../services/operational-observability.service.js';

export const healthController = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    service: env.appName,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

export const readinessController = (_req: Request, res: Response): void => {
  const dispatch = realtimeOrchestratorService.getDispatchDiagnostics();
  const observability = operationalObservabilityService.getOperationalSnapshot();
  const hasCriticalDrift = dispatch.staleAssignments.length > 0;
  const status = hasCriticalDrift ? 'degraded' : 'ready';
  res.status(hasCriticalDrift ? HTTP_STATUS.INTERNAL_SERVER_ERROR : HTTP_STATUS.OK).json({
    success: !hasCriticalDrift,
    service: env.appName,
    status,
    timestamp: new Date().toISOString(),
    checks: {
      realtime: {
        websocketClients: dispatch.websocketClients,
        replayBufferSize: dispatch.replayBufferSize,
        staleDrivers: dispatch.staleDrivers,
      },
      bookingLifecycle: {
        staleAssignments: dispatch.staleAssignments,
        activeAssignmentAttempts: dispatch.activeAssignmentAttempts,
      },
      observability,
    },
  });
};
