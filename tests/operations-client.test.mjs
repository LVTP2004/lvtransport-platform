import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const require = createRequire(path.join(process.cwd(), 'apps/admin/package.json'));
const { build } = createRequire(require.resolve('vite'))('esbuild');
const result = await build({ entryPoints: [path.join(process.cwd(), 'packages/auth/src/services/operations-client.ts')],
  bundle: true, write: false, platform: 'node', format: 'cjs' });
const module = { exports: {} };
const artifact = process.argv.find(arg => arg.startsWith('--artifact='))?.slice('--artifact='.length);
new Function('require', 'module', 'exports', artifact ? readFileSync(artifact, 'utf8') : result.outputFiles[0].text)(require, module, module.exports);
const { VerifiedOperationsClient } = module.exports;
const identity = { userId: 'synthetic-driver', role: 'driver', status: 'active', permissions: ['driver:update_status'] };
function provider() {
  return { signInWithGoogle: async () => ({ isAuthenticated: true }),
    getSession: async () => ({ authenticated: true, token: 'synthetic-token' }),
    signOut: async () => {} };
}
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('Google success alone does not open operations without verified server identity', async () => {
  for (const body of [{ success: true }, { success: true, identity: { ...identity, role: 'admin' } },
    { success: true, identity: { ...identity, status: 'inactive' } }]) {
    const client = new VerifiedOperationsClient(provider(), 'https://synthetic.invalid/api/v1', 'driver', async () => response(body));
    await assert.rejects(client.connect());
  }
  const denied = new VerifiedOperationsClient(provider(), 'https://synthetic.invalid/api/v1', 'driver', async () => response({ success: false }, 401));
  await assert.rejects(denied.connect());
});

test('browser fetch is called without the operations client as receiver', async () => {
  const admin = { ...identity, role: 'admin' };
  const client = new VerifiedOperationsClient(provider(), 'https://synthetic.invalid/api/v1', 'admin',
    async function () {
      assert.equal(this, undefined);
      return response({ success: true, identity: admin });
    });
  assert.deepEqual(await client.connect(), admin);
});

test('verified requests use the current SDK bearer, no-store and stable operation key', async () => {
  const p = provider(); const calls = [];
  const client = new VerifiedOperationsClient(p, 'https://synthetic.invalid/api/v1', 'driver', async (url, options) => {
    calls.push({ url, options }); return response(url.endsWith('/auth/session') ? { success: true, identity } : { success: true });
  });
  assert.deepEqual(await client.connect(), identity);
  p.getSession = async () => ({ authenticated: true, token: 'synthetic-refreshed' });
  await client.request('/operations/bookings/synthetic/status', { body: { status: 'accepted', expectedVersion: 2 }, key: 'synthetic-stable-key' });
  assert.equal(calls[1].options.headers.Authorization, 'Bearer synthetic-refreshed');
  assert.equal(calls[1].options.headers['Idempotency-Key'], 'synthetic-stable-key');
  assert.equal(calls[1].options.cache, 'no-store');
  assert.equal(calls[1].options.method, 'POST');
  assert.doesNotMatch(calls[1].options.body, /synthetic-refreshed|role/);
  await assert.rejects(client.request('https://other.invalid/'));
  await assert.rejects(client.request('/operations/../secret'));
});

test('revoked session unmount callback fires and subsequent requests fail closed', async () => {
  let revoked = false, closed = 0;
  const client = new VerifiedOperationsClient(provider(), 'https://synthetic.invalid/api/v1', 'driver', async () =>
    revoked ? response({ success: false }, 401) : response({ success: true, identity }), () => closed++);
  await client.connect(); revoked = true;
  await assert.rejects(client.request('/operations/bookings'));
  assert.equal(closed, 1);
  await assert.rejects(client.request('/operations/bookings'), error => error.code === 'SESSION_CLOSED');
});

test('non-JSON unauthorized responses revoke the session before parsing the body', async () => {
  for (const content of ['<html>Unauthorized</html>', '', '{invalid']) {
    let closed = 0, signedOut = 0, calls = 0;
    const p = provider(); p.signOut = async () => { signedOut++; };
    const client = new VerifiedOperationsClient(p, 'https://synthetic.invalid/api/v1', 'driver', async () => {
      calls++;
      return new Response(content, { status: 401 });
    }, () => { closed++; });
    await assert.rejects(client.request('/operations/bookings'));
    assert.equal(closed, 1);
    assert.equal(signedOut, 1);
    await assert.rejects(client.request('/operations/bookings'), error => error.code === 'SESSION_CLOSED');
    assert.equal(calls, 1);
  }
});

test('a failing unauthorized callback cannot prevent provider sign-out', async () => {
  let signedOut = 0;
  const p = provider(); p.signOut = async () => { signedOut++; };
  const client = new VerifiedOperationsClient(p, 'https://synthetic.invalid/api/v1', 'driver',
    async () => response({ success: false }, 401), () => { throw new Error('synthetic presentation failure'); });
  await assert.rejects(client.request('/operations/bookings'), /synthetic presentation failure/);
  assert.equal(signedOut, 1);
  await assert.rejects(client.request('/operations/bookings'), error => error.code === 'SESSION_CLOSED');
});

test('logout cancels delayed login; driver availability is withdrawn before sign-out', async () => {
  let release;
  const p = provider(); p.signInWithGoogle = () => new Promise(resolve => { release = resolve; });
  const client = new VerifiedOperationsClient(p, 'https://synthetic.invalid/api/v1', 'driver', async () => assert.fail('closed login must not fetch'));
  const pending = client.connect(); await client.disconnect(); release({ isAuthenticated: true }); await assert.rejects(pending);
  const calls = [];
  const q = provider(); q.signOut = async () => { calls.push('signout'); };
  const driver = new VerifiedOperationsClient(q, 'https://synthetic.invalid/api/v1', 'driver', async (url, options) => {
    if (url.endsWith('/auth/session')) return response({ success: true, identity });
    calls.push(JSON.parse(options.body).availability);
    return response({ success: true, driver: { vehicleId: 'synthetic-vehicle' } });
  });
  await driver.connect();
  await driver.request('/operations/drivers/me/presence', { body: { availability: 'available', vehicleId: 'synthetic-vehicle' } });
  await driver.disconnect();
  assert.deepEqual(calls, ['available', 'unavailable', 'signout']);
});

test('customer sign-in uses the explicitly scoped session endpoint before requesting own resources', async () => {
  const calls = [];
  const client = new VerifiedOperationsClient(provider(), 'https://synthetic.invalid/api/v1', 'customer', async (url) => {
    calls.push(url);
    return response(url.endsWith('/auth/customer-session')
      ? { success:true, identity: { ...identity, role:'customer', permissions:['book:ride'], scope:'customer' } }
      : { success:true,bookings:[] });
  });
  assert.equal((await client.connect()).role, 'customer');
  await client.request('/customer/bookings');
  assert.ok(calls[0].endsWith('/auth/customer-session'));
  assert.ok(calls[1].endsWith('/customer/bookings'));
});

test('failed GPS stop does not skip availability withdrawal or local sign-out', async () => {
  const calls = [];
  const p = provider();
  p.signOut = async () => { calls.push('signout'); };
  const client = new VerifiedOperationsClient(p, 'https://synthetic.invalid/api/v1', 'driver', async (url, options) => {
    if (url.endsWith('/auth/session')) return response({ success: true, identity });
    const body = JSON.parse(options.body);
    if (url.endsWith('/location')) {
      if (body.sharing) return response({ success: true, sharing: true, sessionId: 'synthetic-session' });
      calls.push('stop-gps');
      throw new TypeError('synthetic network failure');
    }
    calls.push(body.availability);
    return response({ success: true, driver: { vehicleId: 'synthetic-vehicle' } });
  });
  await client.connect();
  await client.request('/operations/drivers/me/presence', { body: { availability: 'available', vehicleId: 'synthetic-vehicle' } });
  await client.request('/operations/bookings/synthetic-booking/location', { body: { sharing: true } });
  await client.disconnect();
  assert.deepEqual(calls, ['available', 'stop-gps', 'unavailable', 'signout']);
  await assert.rejects(client.request('/operations/bookings'), error => error.code === 'SESSION_CLOSED');
});
