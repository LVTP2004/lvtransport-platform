import test from 'node:test';
import assert from 'node:assert/strict';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';

const progressToCompleted = (bookingId: string, actor: 'driver' | 'admin' = 'driver') => {
  realtimeOrchestratorService.transitionStatus({ bookingId, status: 'en_route', actor });
  realtimeOrchestratorService.transitionStatus({ bookingId, status: 'arrived', actor });
  realtimeOrchestratorService.transitionStatus({ bookingId, status: 'in_progress', actor });
  return realtimeOrchestratorService.transitionStatus({ bookingId, status: 'completed', actor });
};

test('repeated sequential rides preserve canonical lifecycle and terminal immutability', () => {
  const rideCount = 6;
  for (let i = 0; i < rideCount; i += 1) {
    const driverId = `driver-repeat-${i}`;
    const booking = realtimeOrchestratorService.createBooking({ pickup: `P${i}`, destination: `D${i}` });
    realtimeOrchestratorService.updateDriverState({ driverId, state: 'available' });
    realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Repeat Driver ${i}` });
    const accepted = realtimeOrchestratorService.driverRespondToAssignment({ bookingId: booking.id, driverId, action: 'accept' });
    const acceptedStatus = accepted.status;
    const completed = progressToCompleted(booking.id);

    assert.equal(acceptedStatus, 'accepted');
    assert.equal(completed.status, 'completed');

    assert.throws(
      () => realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, status: 'in_progress', actor: 'system' }),
      /(TERMINAL_STATE_IMMUTABLE|INVALID_TRANSITION)/
    );
  }
});

test('duplicate assignment replay is idempotent and does not corrupt lifecycle', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'Replay P', destination: 'Replay D' });
  const driverId = 'driver-replay';
  realtimeOrchestratorService.updateDriverState({ driverId, state: 'available' });

  const first = realtimeOrchestratorService.assignDriver({
    bookingId: booking.id,
    driverId,
    driverName: 'Replay Driver',
    idempotencyKey: `assign-${booking.id}`
  });

  const replay = realtimeOrchestratorService.assignDriver({
    bookingId: booking.id,
    driverId,
    driverName: 'Replay Driver',
    idempotencyKey: `assign-${booking.id}`
  });

  assert.equal(first.version, replay.version);
  assert.equal(replay.status, 'assigned');
  assert.equal(replay.assignedDriverId, driverId);
});

test('driver reconnect recovery remains deterministic after completion', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'Reconnect P', destination: 'Reconnect D' });
  const driverId = 'driver-recover-repeat';
  realtimeOrchestratorService.updateDriverState({ driverId, state: 'available' });
  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: 'Recover Driver' });
  realtimeOrchestratorService.driverRespondToAssignment({ bookingId: booking.id, driverId, action: 'accept' });
  progressToCompleted(booking.id);

  const recovery = realtimeOrchestratorService.restoreDriverAssignments(driverId);

  assert.equal(recovery.recoveredBookings.length, 0);
  assert.equal(recovery.driverState?.activeBookingId, undefined);
  assert.equal(recovery.driverState?.state, 'available');
});
