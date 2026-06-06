import test from 'node:test';
import assert from 'node:assert/strict';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';

type ValidationMetrics = {
  total: number;
  success: number;
  non2xx: number;
  staleRejected: number;
  invalidRejected: number;
  syncSnapshots: number;
};

const runMixedInteractions = (count: number): ValidationMetrics => {
  const metrics: ValidationMetrics = { total: 0, success: 0, non2xx: 0, staleRejected: 0, invalidRejected: 0, syncSnapshots: 0 };

  for (let i = 0; i < count; i += 1) {
    const booking = realtimeOrchestratorService.createBooking({ pickup: `P-${count}-${i}`, destination: `D-${count}-${i}` });
    const driverId = `validation-driver-${count}-${i}`;

    realtimeOrchestratorService.updateDriverState({ driverId, state: 'available' });

    const expectedVersion = booking.version;
    const assign = () => realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Driver ${i}`, idempotencyKey: `assign:${booking.id}` });
    const accept = () => realtimeOrchestratorService.driverRespondToAssignment({ bookingId: booking.id, driverId, action: 'accept', expectedVersion: expectedVersion + 1, idempotencyKey: `accept:${booking.id}` });

    for (const op of [assign, assign, accept]) {
      metrics.total += 1;
      try {
        op();
        metrics.success += 1;
      } catch (error) {
        metrics.non2xx += 1;
        if ((error as Error).message === 'STALE_EVENT_REJECTED') metrics.staleRejected += 1;
        if ((error as Error).message === 'INVALID_TRANSITION') metrics.invalidRejected += 1;
      }
    }

    const progressed = ['en_route', 'arrived', 'in_progress', 'completed'] as const;
    for (const state of progressed) {
      metrics.total += 1;
      try {
        realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, status: state, actor: 'driver' });
        metrics.success += 1;
      } catch (error) {
        metrics.non2xx += 1;
        if ((error as Error).message === 'STALE_EVENT_REJECTED') metrics.staleRejected += 1;
        if ((error as Error).message === 'INVALID_TRANSITION') metrics.invalidRejected += 1;
      }
    }

    const recovered = realtimeOrchestratorService.restoreDriverAssignments(driverId);
    if (recovered.driverState?.state === 'available' && recovered.recoveredBookings.length === 0) metrics.syncSnapshots += 1;
  }

  return metrics;
};

test('controlled mixed-traffic validation remains stable from 25 to 100 interactions', () => {
  const scenarios = [25, 50, 75, 100].map(runMixedInteractions);

  for (const scenario of scenarios) {
    assert.equal(scenario.non2xx, 0, `expected zero operational errors for scenario of ${scenario.total} operations`);
    assert.equal(scenario.syncSnapshots > 0, true);
    assert.equal(scenario.success, scenario.total);
  }
});
