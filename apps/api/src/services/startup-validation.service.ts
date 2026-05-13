import { env } from '../config/env.js';
import { operationalObservabilityService } from './operational-observability.service.js';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';

type ValidationSeverity = 'critical' | 'warning';

type StartupValidationCheck = {
  id: string;
  status: 'pass' | 'fail';
  severity: ValidationSeverity;
  message: string;
  details?: Record<string, unknown>;
};

const threshold = {
  maxReplayDepthWarning: 240,
  maxTelemetryTrackedWarning: 300,
  maxActiveAssignmentAttemptsWarning: 30,
};

const asCheck = (check: StartupValidationCheck) => check;

export const startupValidationService = {
  runOperationalStartupValidation() {
    const dispatch = realtimeOrchestratorService.getDispatchDiagnostics();
    const diagnostics = realtimeOrchestratorService.getOperationalDiagnostics();
    const observability = operationalObservabilityService.getOperationalSnapshot();

    const checks: StartupValidationCheck[] = [
      asCheck({
        id: 'env.cors-production-safety',
        status: env.isProduction && env.corsOrigin === '*' ? 'fail' : 'pass',
        severity: 'critical',
        message: env.isProduction && env.corsOrigin === '*' ? 'CORS wildcard detected in production mode.' : 'CORS origin policy accepted for current environment.',
        details: { env: env.nodeEnv, corsOrigin: env.corsOrigin },
      }),
      asCheck({
        id: 'realtime.stale-assignment-lock',
        status: dispatch.staleAssignments.length > 0 ? 'fail' : 'pass',
        severity: 'critical',
        message: dispatch.staleAssignments.length > 0 ? 'Stale assignments exist and require cleanup before startup validation passes.' : 'No stale assignment lock leakage detected.',
        details: { staleAssignments: dispatch.staleAssignments },
      }),
      asCheck({
        id: 'realtime.stale-driver-drift',
        status: dispatch.staleDrivers.length > 0 ? 'fail' : 'pass',
        severity: 'warning',
        message: dispatch.staleDrivers.length > 0 ? 'Driver realtime drift detected; requires reconnect recovery verification.' : 'No stale driver drift detected.',
        details: { staleDrivers: dispatch.staleDrivers },
      }),
      asCheck({
        id: 'realtime.replay-buffer-headroom',
        status: dispatch.replayBufferSize >= threshold.maxReplayDepthWarning ? 'fail' : 'pass',
        severity: 'warning',
        message: dispatch.replayBufferSize >= threshold.maxReplayDepthWarning ? 'Replay buffer near configured ceiling; review event fan-out behavior.' : 'Replay buffer operating with safe headroom.',
        details: { replayBufferSize: dispatch.replayBufferSize, maxReplayDepthWarning: threshold.maxReplayDepthWarning },
      }),
      asCheck({
        id: 'lifecycle.stale-booking-recovery',
        status: diagnostics.staleBookings.length > 0 ? 'fail' : 'pass',
        severity: 'critical',
        message: diagnostics.staleBookings.length > 0 ? 'Stale active bookings detected; lifecycle recovery automation may be lagging.' : 'No stale active booking drift detected.',
        details: { staleBookings: diagnostics.staleBookings },
      }),
      asCheck({
        id: 'observability.socket-coverage',
        status: observability.observedSockets < observability.activeConnections ? 'fail' : 'pass',
        severity: 'warning',
        message: observability.observedSockets < observability.activeConnections ? 'Socket observation counters are inconsistent.' : 'Socket observation counters are coherent.',
        details: { observedSockets: observability.observedSockets, activeConnections: observability.activeConnections },
      }),
      asCheck({
        id: 'realtime.assignment-storm-control',
        status: dispatch.activeAssignmentAttempts > threshold.maxActiveAssignmentAttemptsWarning ? 'fail' : 'pass',
        severity: 'warning',
        message: dispatch.activeAssignmentAttempts > threshold.maxActiveAssignmentAttemptsWarning ? 'Assignment storm control threshold exceeded.' : 'Assignment attempt volume within startup threshold.',
        details: { activeAssignmentAttempts: dispatch.activeAssignmentAttempts, maxActiveAssignmentAttemptsWarning: threshold.maxActiveAssignmentAttemptsWarning },
      }),
      asCheck({
        id: 'realtime.telemetry-pressure',
        status: dispatch.telemetryRateLimitedDrivers > threshold.maxTelemetryTrackedWarning ? 'fail' : 'pass',
        severity: 'warning',
        message: dispatch.telemetryRateLimitedDrivers > threshold.maxTelemetryTrackedWarning ? 'Telemetry ingestion pressure high for founder-operation baseline.' : 'Telemetry ingestion pressure within founder-operation baseline.',
        details: { telemetryRateLimitedDrivers: dispatch.telemetryRateLimitedDrivers, maxTelemetryTrackedWarning: threshold.maxTelemetryTrackedWarning },
      }),
    ];

    const criticalFailures = checks.filter((check) => check.status === 'fail' && check.severity === 'critical');
    const warningFailures = checks.filter((check) => check.status === 'fail' && check.severity === 'warning');

    return {
      generatedAt: new Date().toISOString(),
      status: criticalFailures.length > 0 ? 'blocked' : warningFailures.length > 0 ? 'degraded' : 'ready',
      summary: {
        totalChecks: checks.length,
        passed: checks.filter((check) => check.status === 'pass').length,
        failed: checks.filter((check) => check.status === 'fail').length,
        criticalFailures: criticalFailures.length,
        warningFailures: warningFailures.length,
      },
      checks,
      diagnostics: {
        dispatch,
        lifecycle: diagnostics,
        observability,
      },
    };
  },
};
