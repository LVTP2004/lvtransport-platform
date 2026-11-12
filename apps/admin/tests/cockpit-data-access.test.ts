import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadAuthorizedCockpit, AdminAuthorizationError } from '../src/modules/auth/services/cockpit-access.service.js';
import { adminAuthService, adminAuthenticationBlocker } from '../src/modules/auth/services/auth-client.service.js';

// Trusted-reader doubles for sequencing tests, not an identity provider or live
// sessions. No production service can be selected from browser-supplied data.
function fixture(role = 'admin') {
  const expected = { userId: 'fixture-user', accessToken: 'fixture-token', expiresAt: Date.now() + 60_000 };
  const state = { isAuthenticated: true, isLoading: false, user: { id: expected.userId },
    tokens: { accessToken: expected.accessToken, expiresAt: expected.expiresAt } };
  const session = { authenticated: true, provider: 'firebase', userId: expected.userId, token: expected.accessToken };
  const profile = { id: expected.userId, role, status: 'active' };
  const service = {
    getInitialState: async () => state,
    getSession: async () => session,
    getUserProfile: async () => profile,
  };
  return { expected, state, session, profile, service };
}

async function withRequests(run: (requests: Array<{ url: string; options?: RequestInit }>) => Promise<void>) {
  const original = globalThis.fetch;
  const requests: Array<{ url: string; options?: RequestInit }> = [];
  globalThis.fetch = (async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response(JSON.stringify({ bookings: [], drivers: [], incidents: [] }), { status: 200 });
  }) as typeof fetch;
  try { await run(requests); } finally { globalThis.fetch = original; }
}

for (const scenario of ['anonymous', 'invalid-session', 'insufficient-role', 'missing-role']) {
  test(`${scenario}: no operational request is emitted`, async () => {
    const f = fixture();
    if (scenario === 'anonymous') f.state.isAuthenticated = false;
    if (scenario === 'invalid-session') f.session.authenticated = false;
    if (scenario === 'insufficient-role') f.profile.role = 'driver';
    if (scenario === 'missing-role') f.profile.role = '';
    await withRequests(async (requests) => {
      await assert.rejects(loadAuthorizedCockpit(f.service, f.expected, 'https://unit.invalid',
        new AbortController().signal), AdminAuthorizationError);
      assert.equal(requests.length, 0);
    });
  });
}

for (const role of ['admin', 'super_admin']) {
  test(`${role}: requests start only after the reader verifies session/profile`, async () => {
    const f = fixture(role);
    await withRequests(async (requests) => {
      let finishSession!: (session: typeof f.session) => void;
      f.service.getSession = () => new Promise((resolve) => { finishSession = resolve; });
      const pending = loadAuthorizedCockpit(f.service, f.expected, 'https://unit.invalid', new AbortController().signal);
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(requests.length, 0, 'authentication is pending');
      finishSession(f.session);
      const snapshot = await pending;
      assert.deepEqual(snapshot, { bookings: [], drivers: [], incidents: [] });
      assert.deepEqual(requests.map((r) => r.url), [
        'https://unit.invalid/admin/bookings', 'https://unit.invalid/drivers/live-states',
        'https://unit.invalid/operations/incidents',
      ]);
      for (const request of requests) assert.equal(
        (request.options?.headers as Record<string, string>).Authorization, `Bearer ${f.expected.accessToken}`);
    });
  });
}

test('provider failure, expired session, token change and aborted load cannot request data', async () => {
  for (const scenario of ['provider-failure', 'expired', 'expected-expired', 'different-token', 'aborted']) {
    const f = fixture();
    const controller = new AbortController();
    if (scenario === 'provider-failure') f.service.getSession = async () => { throw new Error('verification failed'); };
    if (scenario === 'expired') f.state.tokens.expiresAt = Date.now() - 1;
    if (scenario === 'expected-expired') f.expected.expiresAt = Date.now() - 1;
    if (scenario === 'different-token') f.expected.accessToken = 'another-fixture';
    if (scenario === 'aborted') controller.abort();
    await withRequests(async (requests) => {
      await assert.rejects(loadAuthorizedCockpit(f.service, f.expected, 'https://unit.invalid',
        controller.signal), AdminAuthorizationError);
      assert.equal(requests.length, 0);
    });
  }
});

test('the actual unconfigured composition root blocks even a forged expected access object', async () => {
  const f = fixture();
  assert.equal(adminAuthenticationBlocker, 'VERIFIED_FIREBASE_PROVIDER_NOT_IMPLEMENTED');
  await withRequests(async (requests) => {
    await assert.rejects(loadAuthorizedCockpit(adminAuthService, f.expected, 'https://unit.invalid',
      new AbortController().signal), AdminAuthorizationError);
    assert.equal(requests.length, 0);
  });
});

test('API authorization failure is an authorization error, never operational data', async () => {
  const f = fixture();
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response('{}', { status: 403 })) as typeof fetch;
  try {
    await assert.rejects(loadAuthorizedCockpit(f.service, f.expected, 'https://unit.invalid',
      new AbortController().signal), AdminAuthorizationError);
  } finally { globalThis.fetch = original; }
});
