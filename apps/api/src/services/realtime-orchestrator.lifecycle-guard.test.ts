import test from 'node:test';
import assert from 'node:assert/strict';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';

test('driver cannot accept when booking already in terminal state', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'P1', destination: 'D1' });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-terminal', state: 'available' });
  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-terminal', driverName: 'Driver Terminal' });
  realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, status: 'failed', actor: 'system' });

  assert.throws(
    () => realtimeOrchestratorService.driverRespondToAssignment({ bookingId: booking.id, driverId: 'driver-terminal', action: 'accept' }),
    /BOOKING_IMMUTABLE/
  );
});

test('driver cannot accept from non-assigned lifecycle states', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'P2', destination: 'D2' });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-invalid-accept', state: 'available' });
  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-invalid-accept', driverName: 'Driver Invalid Accept' });
  realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, status: 'accepted', actor: 'driver' });

  assert.throws(
    () => realtimeOrchestratorService.driverRespondToAssignment({ bookingId: booking.id, driverId: 'driver-invalid-accept', action: 'accept' }),
    /INVALID_TRANSITION/
  );
});

test('restoreDriverAssignments recovers accepted rides after restart', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'P3', destination: 'D3' });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-restore', state: 'available' });
  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-restore', driverName: 'Driver Restore' });
  realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, status: 'accepted', actor: 'driver' });

  const recovery = realtimeOrchestratorService.restoreDriverAssignments('driver-restore');

  assert.equal(recovery.recoveredBookings.some((entry) => entry.id === booking.id), true);
  assert.equal(recovery.driverState?.activeBookingId, booking.id);
  assert.equal(recovery.driverState?.state, 'en_route');
});
