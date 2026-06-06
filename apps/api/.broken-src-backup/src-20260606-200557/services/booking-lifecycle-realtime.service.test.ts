import test from 'node:test';
import assert from 'node:assert/strict';
import { BookingLifecycleRealtimeService } from './booking-lifecycle-realtime.service.js';

test('booking lifecycle diagnostics track apply, duplicate, stale and invalid transitions', () => {
  const service = new BookingLifecycleRealtimeService();
  const occurredAt = new Date().toISOString();

  const created = service.applyLifecycleEvent({
    bookingId: 'booking-1',
    customerId: 'customer-1',
    status: 'pending',
    occurredAt,
    version: 1
  });

  assert.ok(created);

  const duplicate = service.applyLifecycleEvent({
    bookingId: 'booking-1',
    customerId: 'customer-1',
    status: 'pending',
    occurredAt,
    version: 1
  });

  assert.equal(duplicate, null);

  const stale = service.applyLifecycleEvent({
    bookingId: 'booking-1',
    customerId: 'customer-1',
    status: 'assigned',
    occurredAt: new Date(Date.now() + 1000).toISOString(),
    version: 1
  });

  assert.equal(stale, null);

  const invalidTransition = service.applyLifecycleEvent({
    bookingId: 'booking-1',
    customerId: 'customer-1',
    status: 'completed',
    occurredAt: new Date(Date.now() + 2000).toISOString(),
    version: 3
  });

  assert.equal(invalidTransition, null);

  const diagnostics = service.getDiagnostics();
  assert.equal(diagnostics.appliedEvents, 1);
  assert.equal(diagnostics.duplicateEventsSuppressed, 1);
  assert.equal(diagnostics.staleEventsRejected, 1);
  assert.equal(diagnostics.invalidTransitionsRejected, 1);
});
