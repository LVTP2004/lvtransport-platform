/** Isolated real HTTP/file tests. All people/trips are synthetic; no external calls. */
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const apiRequire = createRequire(path.join(root, 'apps/api/package.json'));
const appRequire = createRequire(path.join(root, 'apps/admin/package.json'));
const { build } = createRequire(appRequire.resolve('vite'))('esbuild');
const express = apiRequire('express');
const source = name => JSON.stringify(path.join(root, name));
const bundle = await build({ stdin: { contents: `
export { createBookingFlowService } from ${source('apps/api/src/modules/bookings/service.ts')};
export { FileBookingRepository } from ${source('apps/api/src/modules/bookings/repository.ts')};
export { createCustomerBookingRoutes } from ${source('apps/api/src/routes/v1/customer-booking.routes.ts')};
export { realtimeOrchestratorService } from ${source('apps/api/src/services/realtime-orchestrator.service.ts')};
`, resolveDir: root, loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'cjs', external: ['express'] });
function load() {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(apiRequire, module, module.exports);
  return module.exports;
}
async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'lvtp-booking-http-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, filename: path.join(directory, 'bookings.json') };
}
async function http(t, module, service) {
  const app = express(); app.use(express.json());
  app.use('/api/v1', module.createCustomerBookingRoutes(service));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  return { base, create: (payload, key) => fetch(base + '/bookings', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(payload),
  }) };
}
const payload = { customerName: 'Synthetic integration customer', customerEmail: 'synthetic@example.invalid',
  pickup: 'Synthetic pickup', destination: 'Synthetic destination',
  scheduleAt: '2030-01-01T12:00:00Z', serviceType: 'standard' };

test('public HTTP booking is persisted before projection, retains identity and survives intake replay after assignment', async t => {
  const f = await fixture(t); const m = load();
  const repository = new m.FileBookingRepository(f.filename);
  const service = m.createBookingFlowService(repository);
  const api = await http(t, m, service);
  const response = await api.create(payload, 'synthetic-idempotency-key');
  assert.equal(response.status, 201);
  const body = await response.json();
  const store = JSON.parse(await readFile(f.filename, 'utf8'));
  assert.equal(store.bookings.length, 1);
  const saved = store.bookings[0];
  const projected = m.realtimeOrchestratorService.listBookings()[0];
  assert.equal(projected.id, saved.id);
  assert.equal(projected.code, body.booking.referenceCode);
  assert.equal(projected.scheduledAt, saved.scheduleAt);
  const eventsBefore = projected.lifecycleEventLog.length;
  const duplicate = await api.create(payload, 'synthetic-idempotency-key');
  assert.equal(duplicate.status, 201);
  assert.deepEqual(await duplicate.json(), body);
  assert.equal(projected.lifecycleEventLog.length, eventsBefore);
  m.realtimeOrchestratorService.updateDriverState({ driverId: 'synthetic-driver', state: 'available' });
  m.realtimeOrchestratorService.assignDriver({ bookingId: saved.id, driverId: 'synthetic-driver', driverName: 'Synthetic driver' });
  const version = projected.version;
  await api.create(payload, 'synthetic-idempotency-key');
  assert.equal(projected.assignedDriverId, 'synthetic-driver');
  assert.equal(projected.status, 'assigned');
  assert.equal(projected.version, version);
  assert.equal(m.realtimeOrchestratorService.listBookings().length, 1);
  const tracking = await fetch(api.base + '/tracking/booking/' + encodeURIComponent(saved.referenceCode));
  assert.equal(tracking.status, 200);
  // Tracking remains authoritative JSON, not the separate in-memory assignment.
  assert.deepEqual((await tracking.json()).booking, { referenceCode: saved.referenceCode, status: 'pending' });
});

test('fingerprint duplicate also reuses persisted identity; a fresh runtime rebuilds pending intake from disk once', async t => {
  const f = await fixture(t); const m = load();
  const service = m.createBookingFlowService(new m.FileBookingRepository(f.filename));
  const first = await service.createBooking(payload, 'synthetic-first');
  const second = await service.createBooking(payload, 'synthetic-second');
  assert.equal(first.id, second.id);
  assert.equal(m.realtimeOrchestratorService.listBookings().length, 1);
  const restarted = load();
  assert.equal(restarted.realtimeOrchestratorService.listBookings().length, 0);
  const recovered = restarted.createBookingFlowService(new restarted.FileBookingRepository(f.filename));
  await recovered.listBookings();
  assert.equal(restarted.realtimeOrchestratorService.listBookings()[0].id, first.id);
  const count = restarted.realtimeOrchestratorService.listBookings()[0].lifecycleEventLog.length;
  await recovered.listBookings();
  assert.equal(restarted.realtimeOrchestratorService.listBookings()[0].lifecycleEventLog.length, count);
});

test('projection failure after durable write still acknowledges the booking and retries without duplicate persistence', async t => {
  const f = await fixture(t); const m = load();
  const repository = new m.FileBookingRepository(f.filename);
  let calls = 0;
  const failing = m.createBookingFlowService(repository, booking => {
    assert.ok(booking.id); calls++; throw new Error('Synthetic unavailable projection');
  });
  const api = await http(t, m, failing);
  const response = await api.create(payload, 'synthetic-recovery-key');
  assert.equal(response.status, 201);
  const original = await response.json();
  assert.equal(calls, 1);
  const store = JSON.parse(await readFile(f.filename, 'utf8'));
  const recovered = await m.createBookingFlowService(repository).createBooking(payload, 'synthetic-recovery-key');
  assert.equal(recovered.id, store.bookings[0].id);
  assert.equal(recovered.referenceCode, original.booking.referenceCode);
  assert.equal((await repository.list()).length, 1);
  assert.equal(m.realtimeOrchestratorService.listBookings()[0].id, recovered.id);
});

test('failed persistence never projects or returns successful HTTP confirmation', async t => {
  const m = load(); let projected = false;
  const repository = {
    findByIdempotencyKey: async () => null,
    findRecentDuplicateFingerprint: async () => null,
    create: async () => { throw new Error('Synthetic disk failure'); },
    list: async () => [], update: async () => { throw new Error('unused'); },
  };
  const api = await http(t, m, m.createBookingFlowService(repository, () => { projected = true; }));
  assert.equal((await api.create(payload, 'synthetic-disk-key')).status, 500);
  assert.equal(projected, false);
  assert.equal(m.realtimeOrchestratorService.listBookings().length, 0);
});

test('rehydration never manufactures an assigned booking without persisted driver identity', async t => {
  const f = await fixture(t); const m = load();
  const repository = new m.FileBookingRepository(f.filename);
  const service = m.createBookingFlowService(repository);
  const booking = await service.createBooking(payload, 'synthetic-old-key');
  booking.status = 'assigned'; booking.lifecycle.state = 'assigned'; await repository.update(booking);
  const restarted = load();
  await restarted.createBookingFlowService(new restarted.FileBookingRepository(f.filename)).listBookings();
  assert.equal(restarted.realtimeOrchestratorService.listBookings().length, 0);
  assert.equal((await repository.list())[0].id, booking.id);
});
