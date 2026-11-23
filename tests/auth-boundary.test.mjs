import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const require = createRequire(path.join(root, 'apps/admin/package.json'));
const { build } = createRequire(require.resolve('vite'))('esbuild');
async function load(file) {
  const result = await build({ entryPoints: [path.join(root, file)], bundle: true,
    write: false, platform: 'node', format: 'cjs' });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
const { authenticate, createAuthenticationMiddleware } = await load('apps/api/src/auth/middleware/authenticate.ts');
const { createFirebaseIdentityVerifier } = await load('apps/api/src/auth/services/firebase-identity-verifier.ts');
const { requirePermissions, ownsResource } = await load('apps/api/src/auth/middleware/authorize.ts');
const { FirebaseAuthProvider } = await load('packages/auth/src/providers/firebase-auth.provider.ts');
const now = 1800000000000;
function fixture(overrides = {}, accountOverrides = {}) {
  const decoded = { uid: 'synthetic-user', aud: 'synthetic-project',
    iss: 'https://securetoken.google.com/synthetic-project',
    exp: now / 1000 + 100, iat: now / 1000 - 100, auth_time: now / 1000 - 100, ...overrides };
  const calls = [];
  return { calls, sdk: {
    async verifyIdToken(token, checkRevoked) { calls.push([token, checkRevoked]); return decoded; },
    async getUser() { return { uid: 'synthetic-user', disabled: false,
      customClaims: { role: 'driver', status: 'active' }, ...accountOverrides }; },
  } };
}

test('unconfigured provider never issues fixed tokens or sessions', async () => {
  const provider = new FirebaseAuthProvider();
  assert.equal((await provider.getInitialState()).isAuthenticated, false);
  await assert.rejects(provider.signIn('synthetic@example.invalid', 'synthetic'), /not configured/);
  await assert.rejects(provider.signInWithGoogle(), /not configured/);
  await assert.rejects(provider.refresh(), /not configured/);
  await assert.rejects(provider.getSession(), /not configured/);
  await assert.rejects(provider.getUserProfile(), /not configured/);
});

test('Base64 admin claim and pre-populated auth cannot bypass verification', async () => {
  const token = Buffer.from(JSON.stringify({ sub: 'attacker', role: 'super_admin' })).toString('base64');
  const req = { headers: { authorization: `Bearer ${token}` }, auth: { role: 'super_admin' } };
  await authenticate(req);
  assert.equal(req.auth, undefined);
  await authenticate(req, async () => { throw new Error('invalid signature'); });
  assert.equal(req.auth, undefined);
});

test('malformed credentials never reach the SDK', async () => {
  for (const header of ['', 'Basic test', 'Bearer a b', ['Bearer a'], 'Bearer ' + 'a'.repeat(17000)]) {
    const req = { headers: { authorization: header } };
    await authenticate(req, async () => { assert.fail('verifier must not be called'); });
    assert.equal(req.auth, undefined);
  }
});

test('SDK is called with revocation checking; current account determines role', async () => {
  const f = fixture({ role: 'super_admin' });
  const verify = createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now);
  const req = await authenticate({ headers: { authorization: 'Bearer synthetic-token' } }, verify);
  assert.equal(req.auth.role, 'driver');
  assert.deepEqual(f.calls, [['synthetic-token', true]]);
});

test('wrong project, expiry and future timestamps are denied', async () => {
  for (const changed of [{ aud: 'other' }, { iss: 'other' }, { exp: now / 1000 },
    { iat: now / 1000 + 1 }, { auth_time: now / 1000 + 1 }, { exp: NaN }, { uid: '' }]) {
    const f = fixture(changed);
    await assert.rejects(createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now)('synthetic'));
  }
});

test('disabled, missing, revoked or deprivileged accounts fail closed', async () => {
  for (const changed of [{ disabled: true }, { uid: 'different' }, { customClaims: {} },
    { customClaims: { role: 'unknown', status: 'active' } },
    { customClaims: { role: 'admin', status: 'inactive' } }]) {
    const f = fixture({}, changed);
    await assert.rejects(createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now)('synthetic'));
  }
  const f = fixture();
  f.sdk.verifyIdToken = async () => { throw new Error('revoked'); };
  await assert.rejects(createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now)('synthetic'));
});

function response() {
  return { code: 200, body: null, status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; } };
}
test('Express adapters reject anonymous and driver access to admin operations', async () => {
  const anonymous = response();
  await createAuthenticationMiddleware()({ headers: {} }, anonymous, () => assert.fail('next'));
  assert.equal(anonymous.code, 401);
  const f = fixture();
  const req = { headers: { authorization: 'Bearer synthetic' } };
  let authenticated = false;
  await createAuthenticationMiddleware(createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now))(
    req, response(), () => { authenticated = true; });
  assert.equal(authenticated, true);
  const denied = response();
  requirePermissions(['admin:read'], ['admin', 'super_admin'])(req, denied, () => assert.fail('next'));
  assert.equal(denied.code, 403);
  let allowed = false;
  requirePermissions(['driver:update_status'], ['driver'])(req, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

test('resource access checks stored owner, ignoring body-supplied owner', async () => {
  const f = fixture();
  const req = await authenticate({ headers: { authorization: 'Bearer synthetic' },
    body: { owner: 'synthetic-user' } }, createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now));
  assert.equal(ownsResource(req, 'synthetic-user'), true);
  assert.equal(ownsResource(req, 'another-user'), false);
  assert.equal(ownsResource(req, undefined), false);
});

test('unassigned Firebase accounts can identify as customers only through the explicit customer verifier', async () => {
  const f = fixture({}, { customClaims: {} });
  await assert.rejects(createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now)('synthetic'));
  const customer = createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now, { allowUnassignedCustomer: true });
  assert.deepEqual(await customer('synthetic'), { userId: 'synthetic-user', role: 'customer', status: 'active' });
  for (const customClaims of [{ role: 'unknown' }, { status: 'inactive' }, { status: 'pending' },
    ...['admin', 'super_admin', 'driver', 'founder'].map(role => ({ role, status: 'active' }))]) {
    const denied = fixture({}, { customClaims });
    await assert.rejects(createFirebaseIdentityVerifier(denied.sdk, 'synthetic-project', () => now,
      { allowUnassignedCustomer: true })('synthetic'));
  }
  const disabled = fixture({}, { customClaims: {}, disabled: true });
  await assert.rejects(createFirebaseIdentityVerifier(disabled.sdk, 'synthetic-project', () => now,
    { allowUnassignedCustomer: true })('synthetic'));
});

test('Founder requires a verified mailbox and receives only Founder reads', async () => {
  const customClaims = { role: 'founder', status: 'active' };
  const f = fixture({}, { customClaims, emailVerified: true });
  const verify = createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now);
  const req = await authenticate({ headers: { authorization: 'Bearer synthetic-token' } }, verify);
  assert.equal(req.auth.role, 'founder');
  assert.deepEqual(req.auth.permissions, ['founder:read']);
  await assert.rejects(createFirebaseIdentityVerifier(f.sdk, 'synthetic-project', () => now,
    { allowUnassignedCustomer: true })('synthetic'));
  const unverified = fixture({}, { customClaims, emailVerified: false });
  await assert.rejects(createFirebaseIdentityVerifier(unverified.sdk, 'synthetic-project', () => now)('synthetic'));
});
