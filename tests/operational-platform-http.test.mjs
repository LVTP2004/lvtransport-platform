/** Real loopback HTTP and file persistence; synthetic identities only in tests. */
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const require = createRequire(path.join(root, 'apps/api/package.json'));
const uiRequire = createRequire(path.join(root, 'apps/admin/package.json'));
const { build } = createRequire(uiRequire.resolve('vite'))('esbuild');
const express = require('express');
const src = file => JSON.stringify(path.join(root, file));
const bundle = await build({ stdin: { resolveDir: root, loader: 'ts', contents: `
export { default as healthRoutes } from ${src('apps/api/src/routes/v1/health.routes.ts')};
export { FileBookingRepository } from ${src('apps/api/src/modules/bookings/repository.ts')};
export { createBookingFlowService } from ${src('apps/api/src/modules/bookings/service.ts')};
export { createCustomerBookingRoutes } from ${src('apps/api/src/routes/v1/customer-booking.routes.ts')};
export { createBookingOperations } from ${src('apps/api/src/modules/bookings/operations.ts')};
export { createCustomerAccountRoutes } from ${src('apps/api/src/routes/v1/customer-account.routes.ts')};
export { createBookingOperationsRoutes } from ${src('apps/api/src/routes/v1/booking-operations.routes.ts')};
` }, bundle: true, write: false, platform: 'node', format: 'cjs', external: ['express'] });
function load() {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
const input = { pickup: 'Synthetic pickup', destination: 'Synthetic destination',
  customerName: 'Synthetic customer', customerEmail: 'synthetic@example.invalid',
  scheduleAt: '2030-01-01T12:00:00Z', serviceType: 'standard' };
async function setup(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'lvtp-platform-http-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const m = load();
  const file = path.join(directory, 'bookings.json');
  const repository = new m.FileBookingRepository(file);
  const authorizedDrivers = new Set(['driver-one', 'driver-two']);
  let clock = new Date('2026-11-15T12:00:00Z');
  const resolveDriver = async id => { if (!authorizedDrivers.has(id)) throw new Error('Synthetic revoked account'); return { id, name: id }; };
  const operations = m.createBookingOperations(repository, resolveDriver, () => clock);
  const app = express(); app.use(express.json());
  app.use('/api/v1', m.createCustomerBookingRoutes(m.createBookingFlowService(repository)));
  const verify = async token => {
    const role = token === 'admin' || token === 'founder' ? token : token.startsWith('customer') ? 'customer' : authorizedDrivers.has(token) ? 'driver' : null;
    if (!role) throw new Error('Synthetic rejected token');
    return { userId: token, role, status: 'active' };
  };
  app.use('/api/v1/operations', m.createBookingOperationsRoutes(verify, operations));
  app.use('/api/v1/health', m.healthRoutes);
  app.use('/api/v1/customer', m.createCustomerAccountRoutes(verify, m.createBookingFlowService(repository), operations));
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  async function request(route, actor, body, key) {
    const headers = { ...(actor ? { Authorization: `Bearer ${actor}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}) };
    const response = await fetch(base + route, { method: body ? 'POST' : 'GET', headers, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, headers: response.headers, body: await response.json() };
  }
  const bookingResponse = await request('/bookings', null, input, 'synthetic-public-key');
  assert.equal(bookingResponse.status, 201);
  const saved = JSON.parse(await readFile(file, 'utf8')).bookings[0];
  return { m, file, repository, operations, request, saved, authorizedDrivers,
    advance(ms) { clock = new Date(clock.getTime() + ms); },
    async ready(driver = 'driver-one', registration = 'SYN-1') {
      const vehicle = await request('/operations/vehicles', 'admin', { registration, name: 'Synthetic vehicle', fleetType: 'own' });
      assert.equal(vehicle.status, 200);
      const presence = await request('/operations/drivers/me/presence', driver, { availability: 'available', vehicleId: vehicle.body.vehicle.id });
      assert.equal(presence.status, 200);
      return vehicle.body.vehicle;
    },
  };
}

test('public booking -> admin assignment -> assigned driver -> completed trip -> real persisted tracking and restart', async t => {
  const f = await setup(t); const { request, saved } = f;
  const vehicle = await f.ready();
  const list = await request('/operations/bookings', 'admin');
  assert.equal(list.body.bookings[0].id, saved.id);
  const assigned = await request(`/operations/bookings/${saved.id}/assignment`, 'admin', { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-assignment');
  assert.equal(assigned.status, 200);
  assert.equal(assigned.body.booking.assignment.vehicleId, vehicle.id);
  const operationId = assigned.body.operation.id;
  const replay = await request(`/operations/bookings/${saved.id}/assignment`, 'admin', { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-assignment');
  assert.equal(replay.status, 200); assert.equal(replay.body.operation.id, operationId);
  assert.equal(replay.body.replayed, true);
  const own = await request('/operations/bookings', 'driver-one');
  assert.equal(own.body.bookings[0].id, saved.id);
  let version = 2;
  for (const status of ['accepted', 'en_route', 'arrived', 'in_progress', 'completed']) {
    const result = await request(`/operations/bookings/${saved.id}/status`, 'driver-one', { status, expectedVersion: version }, `synthetic-${status}`);
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(result.body.operation.state, status);
    assert.equal(result.body.booking.version, ++version);
  }
  const tracking = await request('/tracking/booking/' + saved.referenceCode);
  assert.equal(tracking.body.booking.status, 'completed');
  const restarted = f.m.createBookingOperations(new f.m.FileBookingRepository(f.file));
  const recovered = restarted.listBookings({ userId: 'driver-one', role: 'driver', status: 'active' })[0];
  assert.equal(recovered.id, saved.id); assert.equal(recovered.status, 'completed');
  assert.equal(recovered.assignment.vehicleId, vehicle.id);
  assert.equal(recovered.transitions.at(-1).metadata.actor_id, 'driver-one');
  assert.ok(recovered.transitions.at(-1).metadata.operation_id);
  assert.equal((await request('/operations/drivers', 'admin')).body.drivers[0].status, 'available');
  assert.equal(JSON.parse(await readFile(f.file, 'utf8')).bookings.length, 1);
});

test('backend denies forged roles, another driver, invalid transitions and stale versions', async t => {
  const f = await setup(t); const { request, saved } = f; await f.ready();
  assert.equal((await request('/operations/bookings')).status, 401);
  assert.equal((await request('/operations/bookings?role=admin', 'customer')).status, 403);
  assert.equal((await request('/operations/vehicles', 'driver-one', { registration: 'SYN-X', name: 'No', fleetType: 'own' })).status, 403);
  assert.equal((await request(`/operations/bookings/${saved.id}/assignment`, 'driver-one', { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-forged')).status, 403);
  assert.equal((await request(`/operations/bookings/${saved.id}/assignment`, 'admin', { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-admin')).status, 200);
  assert.deepEqual((await request('/operations/bookings', 'driver-two')).body.bookings, []);
  assert.equal((await request(`/operations/bookings/${saved.id}/status`, 'driver-two', { status: 'accepted', expectedVersion: 2 }, 'synthetic-other')).status, 403);
  assert.equal((await request(`/operations/bookings/${saved.id}/status`, 'driver-one', { status: 'completed', expectedVersion: 2 }, 'synthetic-skipped')).status, 409);
  assert.equal((await request(`/operations/bookings/${saved.id}/status`, 'driver-one', { status: 'accepted', expectedVersion: 1 }, 'synthetic-stale')).status, 409);
  assert.equal((await request(`/operations/bookings/${saved.id}/status`, 'driver-one', { status: 'accepted', expectedVersion: 2, actor: 'admin' }, 'synthetic-injected')).status, 400);
  assert.equal((await request(`/operations/bookings/${saved.id}/status`, 'admin', { status: 'completed', expectedVersion: 2 }, 'synthetic-bypass')).status, 403);
  assert.equal((await request('/operations/bookings', 'admin')).headers.get('cache-control'), 'no-store');
});

test('Founder can inspect operations with no booking contact details or mutation rights', async t => {
  const f = await setup(t);
  const { request, saved } = f;
  const vehicle = await f.ready();
  const bookings = await request('/operations/bookings', 'founder');
  assert.equal(bookings.status, 200);
  assert.equal(bookings.body.bookings[0].id, saved.id);
  for (const field of ['customerName', 'customerEmail', 'customerPhone', 'notes']) {
    assert.equal(Object.hasOwn(bookings.body.bookings[0], field), false);
  }
  assert.equal((await request('/operations/vehicles', 'founder')).body.vehicles[0].id, vehicle.id);
  assert.equal((await request('/operations/drivers', 'founder')).body.drivers[0].id, 'driver-one');
  assert.equal((await request('/operations/vehicles', 'founder', {})).status, 403);
  assert.equal((await request('/operations/drivers/me', 'founder')).status, 403);
  for (const action of ['assignment', 'status', 'location']) {
    assert.equal((await request(`/operations/bookings/${saved.id}/${action}`, 'founder', {})).status, 403);
  }
});

test('presence freshness is separate from desired availability; revoked drivers cannot be assigned', async t => {
  const f = await setup(t); await f.ready();
  f.advance(120_001);
  const list = await f.request('/operations/drivers', 'admin');
  assert.equal(list.body.drivers[0].desired_state, 'available');
  assert.equal(list.body.drivers[0].status, 'unknown');
  assert.equal((await f.request(`/operations/bookings/${f.saved.id}/assignment`, 'admin', { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-expired')).status, 409);
  f.authorizedDrivers.delete('driver-one');
  assert.equal((await f.request(`/operations/bookings/${f.saved.id}/assignment`, 'admin', { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-revoked')).status, 503);
  assert.equal((await f.request('/operations/drivers/me/presence', 'driver-one', { availability: 'available', vehicleId: 'none' })).status, 401);
});

test('idempotency conflict and concurrent booking assignments cannot double-book a driver or vehicle', async t => {
  const f = await setup(t); await f.ready();
  const second = await f.request('/bookings', null, { ...input, scheduleAt: '2030-01-02T12:00:00Z' }, 'synthetic-another');
  assert.equal(second.status, 201);
  const records = (await f.request('/operations/bookings', 'admin')).body.bookings;
  const results = await Promise.all(records.map((booking, i) => f.request(`/operations/bookings/${booking.id}/assignment`, 'admin',
    { driverId: 'driver-one', expectedVersion: 1 }, `synthetic-race-${i}`)));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  const winningIndex = results.findIndex(result => result.status === 200);
  const record = records[winningIndex];
  assert.equal((await f.request(`/operations/bookings/${record.id}/assignment`, 'admin',
    { driverId: 'driver-one', expectedVersion: 2 }, `synthetic-race-${winningIndex}`)).status, 409);
  assert.equal(JSON.parse(await readFile(f.file, 'utf8')).bookings.filter(booking => booking.assignment).length, 1);
});

test('a delayed heartbeat cannot turn desired availability back on after withdrawal', async t => {
  const f = await setup(t); const vehicle = await f.ready();
  const original = (await f.request('/operations/drivers', 'admin')).body.drivers[0];
  f.advance(1000);
  assert.equal((await f.request('/operations/drivers/me/presence', 'driver-one', { availability: 'unavailable', vehicleId: vehicle.id })).status, 200);
  const changed = (await f.request('/operations/drivers', 'admin')).body.drivers[0];
  assert.notEqual(changed.lastChangeAt, original.lastChangeAt);
  f.advance(1000);
  assert.equal((await f.request('/operations/drivers/me/heartbeat', 'driver-one', { vehicleId: vehicle.id })).status, 200);
  const final = (await f.request('/operations/drivers', 'admin')).body.drivers[0];
  assert.equal(final.status, 'unavailable');
  assert.equal(final.lastChangeAt, changed.lastChangeAt);
  assert.notEqual(final.lastSeenAt, changed.lastSeenAt);
});

test('two different drivers cannot be assigned the same active vehicle', async t => {
  const f = await setup(t); await f.ready('driver-one'); await f.ready('driver-two');
  await f.request('/bookings', null, { ...input, scheduleAt: '2030-01-03T12:00:00Z' }, 'synthetic-vehicle-booking');
  const records = (await f.request('/operations/bookings', 'admin')).body.bookings;
  assert.equal((await f.request(`/operations/bookings/${records[0].id}/assignment`, 'admin',
    { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-vehicle-first')).status, 200);
  assert.equal((await f.request(`/operations/bookings/${records[1].id}/assignment`, 'admin',
    { driverId: 'driver-two', expectedVersion: 1 }, 'synthetic-vehicle-second')).status, 409);
});

test('customer ownership comes from verified UID; public claims/contact cannot create or claim an account booking', async t => {
  const f = await setup(t);
  const body = { ...input, customerId: 'customer-one', customerIdentityVerified: true, scheduleAt: '2030-02-01T12:00:00Z' };
  const forged = await f.request('/bookings', null, body, 'synthetic-forged-owner');
  assert.equal(forged.status, 201);
  assert.deepEqual((await f.request('/customer/bookings', 'customer-one')).body.bookings, []);
  const created = await f.request('/customer/bookings', 'customer-one', { ...body, customerId: 'customer-two' }, 'synthetic-own-key');
  assert.equal(created.status, 201);
  const own = (await f.request('/customer/bookings?customerId=customer-two', 'customer-one')).body.bookings;
  assert.equal(own.length, 1);
  assert.notEqual(own[0].referenceCode, forged.body.booking.referenceCode);
  assert.deepEqual((await f.request('/customer/bookings', 'customer-two')).body.bookings, []);
  assert.equal((await f.request('/customer/bookings')).status, 401);
  const duplicate = await f.request('/customer/bookings', 'customer-one', body, 'synthetic-own-key');
  assert.equal(duplicate.body.booking.referenceCode, created.body.booking.referenceCode);
  const record = JSON.parse(await readFile(f.file, 'utf8')).bookings.find(booking => booking.referenceCode === created.body.booking.referenceCode);
  assert.equal(record.customerId, 'customer-one');
  assert.equal(record.customerIdentityVerified, true);
  // Even a known stored key cannot make the anonymous endpoint return an owned record.
  const crossScope = await f.request('/bookings', null, body, record.lifecycle.initIdempotencyKey);
  assert.equal(crossScope.status, 500);
  assert.equal(crossScope.body.booking, undefined);
});

test('customers can cancel only their own verified pending booking, with durable idempotency', async t => {
  const f = await setup(t);
  await f.request('/customer/bookings', 'customer-one', input, 'synthetic-customer-cancel');
  const booking = (await f.request('/customer/bookings', 'customer-one')).body.bookings[0];
  const route = `/customer/bookings/${booking.id}/cancel`;
  assert.equal((await f.request(route, 'customer-two', { expectedVersion: 1 }, 'synthetic-other-cancel')).status, 403);
  const cancelled = await f.request(route, 'customer-one', { expectedVersion: 1 }, 'synthetic-pending-cancel');
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.booking.status, 'cancelled');
  const replay = await f.request(route, 'customer-one', { expectedVersion: 1 }, 'synthetic-pending-cancel');
  assert.equal(replay.body.operation.id, cancelled.body.operation.id);
  assert.equal((await f.request('/tracking/booking/' + booking.referenceCode)).body.booking.status, 'cancelled');
  assert.equal((await f.request(`/customer/bookings/${f.saved.id}/cancel`, 'customer-one', { expectedVersion: 1 }, 'synthetic-guest-cancel')).status, 403);
});

test('health handlers respond over HTTP without falsely certifying providers as ready', async t => {
  const f = await setup(t);
  const live = await f.request('/health');
  assert.equal(live.status, 200); assert.equal(live.body.ok, true);
  const ready = await f.request('/health/readiness');
  assert.equal(ready.status, 503); assert.equal(ready.body.health, 'UNKNOWN');
  assert.equal(ready.body.verification, 'NOT_EVALUATED');
  const startup = await f.request('/health/startup-validation');
  assert.equal(startup.status, 503); assert.equal(startup.body.verification, 'NOT_EVALUATED');
});

test('GPS is opt-in, scoped to the assigned driver/customer and never exposed by anonymous tracking', async t => {
  const f = await setup(t); await f.ready();
  await f.request('/customer/bookings', 'customer-one', input, 'synthetic-gps-booking');
  const booking = (await f.request('/customer/bookings', 'customer-one')).body.bookings[0];
  await f.request(`/operations/bookings/${booking.id}/assignment`, 'admin', { driverId:'driver-one',expectedVersion:1 }, 'synthetic-gps-assign');
  const route = `/operations/bookings/${booking.id}/location`;
  const position = {lat:51.2,lng:4.4,accuracy:5,capturedAt:'2026-11-15T12:00:00Z'};
  assert.equal((await f.request(route,'driver-two',{sharing:true})).status,403);
  assert.equal((await f.request(route,'driver-one',{sessionId:'not-enabled',position})).status,409);
  const start = await f.request(route,'driver-one',{sharing:true}); assert.equal(start.status,200);
  const sessionId = start.body.sessionId;
  assert.equal((await f.request(route,'driver-one',{sessionId,position})).status,200);
  const own = (await f.request('/customer/bookings','customer-one')).body.bookings[0];
  assert.equal(own.location.lat,position.lat);
  assert.equal(own.location.evidence,'DEVICE_REPORTED');
  assert.deepEqual((await f.request('/customer/bookings','customer-two')).body.bookings,[]);
  assert.equal((await f.request('/tracking/booking/'+booking.referenceCode)).body.booking.location,undefined);
  assert.equal((await f.request(route,'driver-one',{sessionId,position:{...position,lat:999}})).status,400);
  f.advance(120_001);
  assert.equal((await f.request('/customer/bookings','customer-one')).body.bookings[0].location,null);
  assert.equal((await f.request(route,'driver-one',{sessionId,position})).status,409);
});

test('stopping/restarting GPS invalidates old samples and delayed stop requests', async t => {
  const f = await setup(t); await f.ready();
  await f.request(`/operations/bookings/${f.saved.id}/assignment`, 'admin', {driverId:'driver-one',expectedVersion:1}, 'synthetic-gps-session');
  const route=`/operations/bookings/${f.saved.id}/location`;
  const first=(await f.request(route,'driver-one',{sharing:true})).body.sessionId;
  await f.request(route,'driver-one',{sharing:false,sessionId:first});
  const second=(await f.request(route,'driver-one',{sharing:true})).body.sessionId;
  const position={lat:51.2,lng:4.4,capturedAt:'2026-11-15T12:00:00Z'};
  assert.equal((await f.request(route,'driver-one',{sessionId:first,position})).status,409);
  await f.request(route,'driver-one',{sharing:false,sessionId:first});
  assert.equal((await f.request(route,'driver-one',{sessionId:second,position})).status,200);
  await f.request(route,'driver-one',{sharing:false,sessionId:second});
  assert.equal((await f.request('/operations/bookings','driver-one')).body.bookings[0].location,null);
  assert.equal((await f.request(route,'driver-one',{sessionId:second,position})).status,409);
  // Exact coordinates are ephemeral observations, not written into booking storage.
  const store=JSON.parse(await readFile(f.file,'utf8'));
  assert.equal(store.bookings[0].location,undefined);
  assert.equal(store.bookings[0].lifecycle.version,2);
});

test('failed terminal write preserves active GPS until the terminal transition commits', async t => {
  const f = await setup(t);
  await f.ready();
  const bookingPath = `/operations/bookings/${f.saved.id}`;
  const assigned = await f.request(bookingPath + '/assignment', 'admin',
    { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-gps-write-assignment');
  assert.equal(assigned.status, 200);
  const locationPath = bookingPath + '/location';
  const start = await f.request(locationPath, 'driver-one', { sharing: true });
  assert.equal(start.status, 200);
  const { sessionId } = start.body;
  const position = { lat: 51.2, lng: 4.4, capturedAt: '2026-11-15T12:00:00Z' };
  assert.equal((await f.request(locationPath, 'driver-one', { sessionId, position })).status, 200);

  const transact = f.repository.transact;
  f.repository.transact = change => {
    change(f.repository.snapshot());
    throw new Error('Synthetic pre-commit storage failure');
  };
  const cancel = () => f.request(bookingPath + '/status', 'admin',
    { status: 'cancelled', expectedVersion: 2 }, 'synthetic-gps-write-cancel');
  try {
    assert.equal((await cancel()).status, 503);
  } finally {
    f.repository.transact = transact;
  }

  const current = (await f.request('/operations/bookings', 'admin')).body.bookings[0];
  assert.equal(current.status, 'assigned');
  assert.equal(current.location?.lat, position.lat);
  assert.equal((await f.request(locationPath, 'driver-one', { sessionId, position })).status, 200);

  const completed = await cancel();
  assert.equal(completed.status, 200);
  assert.equal(completed.body.booking.status, 'cancelled');
  assert.equal(completed.body.booking.location, null);
  assert.equal((await f.request(locationPath, 'driver-one', { sessionId, position })).status, 409);
});

test('one verified Ride booking is traceable through Tower, Driver and Founder', async t => {
  const f = await setup(t);
  await f.ready();

  const intake = await f.request('/customer/bookings', 'customer-one', input, 'synthetic-419-intake');
  assert.equal(intake.status, 201);
  const [booking] = (await f.request('/customer/bookings', 'customer-one')).body.bookings;
  const route = '/operations/bookings/' + booking.id;
  const tower = await f.request('/operations/bookings', 'admin');
  assert.ok(tower.body.bookings.some(item => item.id === booking.id));
  const assignment = await f.request(route + '/assignment', 'admin',
    { driverId: 'driver-one', expectedVersion: 1 }, 'synthetic-419-assignment');
  assert.equal(assignment.status, 200);

  const sharing = await f.request(route + '/location', 'driver-one', { sharing: true });
  assert.equal(sharing.status, 200);
  const sample = await f.request(route + '/location', 'driver-one', {
    sessionId: sharing.body.sessionId,
    position: { lat: 51.2, lng: 4.4, capturedAt: '2026-11-15T12:00:00Z' },
  });
  assert.equal(sample.status, 200);
  assert.deepEqual((await f.request('/customer/bookings', 'customer-one')).body.bookings[0].location, sample.body.location);
  assert.deepEqual((await f.request('/customer/bookings', 'customer-two')).body.bookings, []);
  const tracking = '/tracking/booking/' + booking.referenceCode;
  assert.equal((await f.request(tracking)).body.booking.location, undefined);

  const denied = await f.request(route + '/status', 'founder',
    { status: 'accepted', expectedVersion: 2 }, 'synthetic-419-denied');
  assert.equal(denied.status, 403);
  let version = 2;
  for (const status of ['accepted', 'en_route', 'arrived', 'in_progress', 'completed']) {
    const response = await f.request(route + '/status', 'driver-one',
      { status, expectedVersion: version }, 'synthetic-419-' + status);
    assert.equal(response.status, 200);
    assert.equal(response.body.booking.version, ++version);
  }

  const founder = await f.request('/operations/bookings', 'founder');
  const observed = founder.body.bookings.find(item => item.id === booking.id);
  assert.equal(observed.status, 'completed');
  assert.equal(observed.location, null);
  assert.equal(Object.hasOwn(observed, 'customerEmail'), false);
  assert.equal((await f.request(tracking)).body.booking.status, 'completed');
  const recovered = f.m.createBookingOperations(new f.m.FileBookingRepository(f.file));
  const persisted = recovered.listCustomerBookings({ userId: 'customer-one', role: 'customer', status: 'active' });
  assert.equal(persisted[0].id, booking.id);
  assert.equal(persisted[0].status, 'completed');
  assert.equal(persisted[0].location, null);
});
