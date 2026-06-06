import test from 'node:test';
import assert from 'node:assert/strict';
import { realtimeOrchestratorService } from './realtime-orchestrator.service.js';

test('controlled snapshot refresh is bounded and deterministic', () => {
  const a = realtimeOrchestratorService.createBooking({ pickup: 'SYNC-A', destination: 'SYNC-B' });
  const b = realtimeOrchestratorService.createBooking({ pickup: 'SYNC-C', destination: 'SYNC-D' });

  realtimeOrchestratorService.transitionStatus({ bookingId: a.id, status: 'assigned', actor: 'admin' });
  realtimeOrchestratorService.transitionStatus({ bookingId: b.id, status: 'assigned', actor: 'admin' });

  const sync = realtimeOrchestratorService.refreshControlledSnapshot({ nowAt: new Date().toISOString(), windowMs: 5 * 60_000, limit: 2 });

  assert.equal(sync.bookings.length <= 2, true);
  assert.equal(sync.audit.bookingCount, sync.bookings.length);
  assert.equal(sync.audit.lineagePreserved, true);

  const versions = [...sync.audit.versions];
  assert.deepEqual(versions, sync.bookings.map((booking) => booking.version));
});

test('deterministic sync window yields stable ordering and audit entries', () => {
  const c = realtimeOrchestratorService.createBooking({ pickup: 'WIN-1', destination: 'WIN-2' });
  realtimeOrchestratorService.transitionStatus({ bookingId: c.id, status: 'assigned', actor: 'admin' });

  const now = Date.now();
  const windowStartAt = new Date(now - 2 * 60_000).toISOString();
  const windowEndAt = new Date(now + 1_000).toISOString();

  const first = realtimeOrchestratorService.synchronizeDeterministically({ windowStartAt, windowEndAt, limit: 10 });
  const second = realtimeOrchestratorService.synchronizeDeterministically({ windowStartAt, windowEndAt, limit: 10 });

  assert.deepEqual(first.bookings.map((booking) => booking.id), second.bookings.map((booking) => booking.id));
  assert.equal(first.audit.type, 'deterministic_sync_window');

  const audits = realtimeOrchestratorService.listSynchronizationAudits(5);
  assert.equal(audits.length > 0, true);
  assert.equal(audits[audits.length - 1]?.type, 'deterministic_sync_window');
});
