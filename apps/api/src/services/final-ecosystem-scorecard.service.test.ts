import test from 'node:test';
import assert from 'node:assert/strict';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';
import { finalEcosystemScorecardService } from './final-ecosystem-scorecard.service.js';

const buildCompletedRide = (suffix: string): void => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: `Airport-${suffix}`, destination: `City-${suffix}` });
  const driverId = `driver-${suffix}`;

  realtimeOrchestratorService.updateDriverState({ driverId, state: 'available' });
  const assigned = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Driver ${suffix}` });
  realtimeOrchestratorService.driverRespondToAssignment({ bookingId: booking.id, driverId, action: 'accept', expectedVersion: assigned.version });

  for (const status of ['en_route', 'arrived', 'in_progress', 'completed'] as const) {
    realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, status, actor: 'driver' });
  }
};

test('final ecosystem scorecard returns all 15 readiness dimensions with bounded scores', () => {
  for (const suffix of ['A', 'B', 'C']) buildCompletedRide(suffix);

  const scorecard = finalEcosystemScorecardService.getScorecard();

  assert.equal(scorecard.metrics.length, 15);
  assert.ok(scorecard.metrics.every((metric) => metric.score >= 0 && metric.score <= 100));
  assert.ok(scorecard.metrics.some((metric) => metric.key === 'lv_pay_readiness'));
  assert.ok(scorecard.metrics.some((metric) => metric.key === 'overall_production_maturity'));
  assert.ok(scorecard.overallProductionMaturity >= 0 && scorecard.overallProductionMaturity <= 100);
});
