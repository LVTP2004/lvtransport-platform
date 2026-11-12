import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminAccessGate, authorizeAdminSession } from '../src/modules/auth/route-guards/admin-access.js';
import { adminAuthenticationConfigured, adminAuthService } from '../src/modules/auth/services/auth-client.service.js';
import { App } from '../src/app/App.js';

// Policy fixtures only. They are never production sessions or proof of Firebase
// integration. The current composition root must stay locked even if these pass.
const NOW = 1_800_000_000_000;
function fixture(role: string | undefined = 'admin') {
  return {
    state: { isAuthenticated: true, isLoading: false, user: { id: 'policy-user' },
      tokens: { accessToken: 'synthetic-policy-token', expiresAt: NOW + 1000 } },
    session: { authenticated: true, provider: 'firebase', userId: 'policy-user', token: 'synthetic-policy-token' },
    profile: { id: 'policy-user', role, status: 'active' },
  };
}

for (const role of ['admin', 'super_admin']) {
  test(`policy permits ${role} only with a bound, current provider identity`, () => {
    const { state, session, profile } = fixture(role);
    const access = authorizeAdminSession(state, session, profile, NOW);
    assert.ok(access);
    let mounts = 0;
    const html = renderToStaticMarkup(createElement(AdminAccessGate, {
      access, now: NOW,
      children: () => { mounts++; return createElement('div', null, 'Cockpit'); },
    }));
    assert.equal(mounts, 1);
    assert.ok(html.includes('Cockpit'));
  });
}

for (const role of [undefined, '', 'customer', 'driver', 'operator', 'ops_admin']) {
  test(`missing or insufficient role ${String(role)} never mounts operations`, () => {
    const { state, session, profile } = fixture();
    profile.role = role;
    const access = authorizeAdminSession(state, session, profile, NOW);
    assert.equal(access, null);
    let mounts = 0;
    const html = renderToStaticMarkup(createElement(AdminAccessGate, {
      access, now: NOW,
      children: () => { mounts++; throw new Error('Operational children must not run'); },
    }));
    assert.equal(mounts, 0);
    assert.equal(html, '');
  });
}

test('anonymous, missing user/profile, loading and unverifiable sessions deny access', () => {
  const { state, session, profile } = fixture();
  for (const bad of [null, {}, { ...state, isAuthenticated: false },
    { ...state, user: null }, { ...state, isLoading: true }, { ...state, user: { id: '' } }]) {
    assert.equal(authorizeAdminSession(bad, session, profile, NOW), null);
  }
  for (const bad of [null, {}, { ...session, authenticated: false },
    { ...session, userId: 'another' }, { ...session, token: 'another' }]) {
    assert.equal(authorizeAdminSession(state, bad, profile, NOW), null);
  }
  for (const bad of [null, {}, { ...profile, id: 'another' }, { ...profile, status: 'suspended' }]) {
    assert.equal(authorizeAdminSession(state, session, bad, NOW), null);
  }
});

test('expired or missing token/expiry and an invalid clock fail closed', () => {
  const { state, session, profile } = fixture();
  for (const tokens of [null, {}, { accessToken: '', expiresAt: NOW + 1 },
    { accessToken: session.token, expiresAt: NOW },
    { accessToken: session.token, expiresAt: Infinity }]) {
    assert.equal(authorizeAdminSession({ ...state, tokens }, session, profile, NOW), null);
  }
  assert.equal(authorizeAdminSession(state, session, profile, NaN), null);
});

test('a client role cannot substitute for a provider role', () => {
  const { state, session, profile } = fixture('customer');
  assert.equal(authorizeAdminSession({ ...state, role: 'super_admin',
    user: { ...state.user, role: 'admin' } }, session, profile, NOW), null);
});

test('expired access never invokes operational children', () => {
  const { state, session, profile } = fixture();
  const access = authorizeAdminSession(state, session, profile, NOW);
  const html = renderToStaticMarkup(createElement(AdminAccessGate, {
    access, now: NOW + 1000,
    children: () => { throw new Error('Expired session mounted operations'); },
  }));
  assert.equal(html, '');
});

test('the unconfigured provider never creates a synthetic login or session', async () => {
  assert.equal(adminAuthenticationConfigured, false);
  await assert.rejects(adminAuthService.signIn({ email: 'unit@example.invalid', password: 'unit-only' }), /not configured/);
  assert.equal((await adminAuthService.getInitialState()).isAuthenticated, false);
  assert.equal((await adminAuthService.getSession()).authenticated, false);
  assert.equal(await adminAuthService.getUserProfile(), null);
});

test('initial App rendering shows no cockpit and makes no operational request', () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (() => { calls++; throw new Error('Unexpected request'); }) as typeof fetch;
  try {
    const html = renderToStaticMarkup(createElement(App));
    assert.ok(html.includes('Loading admin session'));
    assert.ok(!html.includes('Founder Cockpit'));
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test('operational request callback cannot run for anonymous, invalid or insufficient access', () => {
  const { state, session, profile } = fixture();
  const denied = [
    authorizeAdminSession(null, null, null, NOW),
    authorizeAdminSession(state, { ...session, authenticated: false }, profile, NOW),
    authorizeAdminSession(state, session, { ...profile, role: 'driver' }, NOW),
  ];
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (() => { calls++; throw new Error('Operational request before authorization'); }) as typeof fetch;
  try {
    for (const access of denied) {
      assert.equal(access, null);
      renderToStaticMarkup(createElement(AdminAccessGate, {
        access, now: NOW,
        children: () => {
          for (const route of ['/admin/bookings', '/drivers/live-states', '/operations/incidents']) {
            void fetch(route);
          }
          return createElement('div', null, 'Cockpit');
        },
      }));
    }
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});
