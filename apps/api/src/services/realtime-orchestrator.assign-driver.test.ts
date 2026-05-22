import test from 'node:test';
import assert from 'node:assert/strict';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';

test('assign-driver is idempotent for same driver on assigned booking', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'A', destination: 'B', customerName: 'T' });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-idem', state: 'available' });
  const first = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-idem', driverName: 'Driver A' });
  const second = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-idem', driverName: 'Driver A' });
  assert.equal(first.id, second.id);
  assert.equal(second.status, 'assigned');
  assert.equal(second.assignedDriverId, 'driver-idem');
});

test('assign-driver rejects assigning another driver to active assignment', () => {
  const booking = realtimeOrchestratorService.createBooking({ pickup: 'C', destination: 'D', customerName: 'T2' });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-main', state: 'available' });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-other', state: 'available' });
  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-main', driverName: 'Main Driver' });
  assert.throws(
    () => realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-other', driverName: 'Other Driver' }),
    /BOOKING_ALREADY_ASSIGNED/
  );
});

test('assign-driver rejects orphan assigned state hydration', () => {
  const bookingId = `hydrated-${Date.now()}`;
  realtimeOrchestratorService.upsertExternalBooking({
    id: bookingId,
    referenceCode: `REF-${Date.now()}`,
    pickup: 'E',
    destination: 'F',
    serviceType: 'standard',
    scheduledAt: new Date().toISOString(),
    status: 'assigned'
  });
  realtimeOrchestratorService.updateDriverState({ driverId: 'driver-hydrated', state: 'available' });
  assert.throws(
    () => realtimeOrchestratorService.assignDriver({ bookingId, driverId: 'driver-hydrated', driverName: 'Hydrated Driver' }),
    /INVALID_ASSIGNMENT_STATE/
  );
});
