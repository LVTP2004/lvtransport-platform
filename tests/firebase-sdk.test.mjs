import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const authRequire = createRequire(path.join(root, 'packages/auth/package.json'));
const adminRequire = createRequire(path.join(root, 'apps/admin/package.json'));
const { build } = createRequire(adminRequire.resolve('vite'))('esbuild');
const compiled = await build({
  entryPoints: [path.join(root, 'packages/auth/src/providers/firebase-browser.adapter.ts')],
  bundle: true, write: false, platform: 'node', format: 'cjs',
  external: ['firebase/app', 'firebase/auth'],
});
const module = { exports: {} };
new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(authRequire, module, module.exports);
const { createFirebaseBrowserProvider } = module.exports;
const configured = await build({
  entryPoints: [path.join(root, 'packages/auth/src/config/lvtp-firebase.ts')],
  define: { 'import.meta.env': '{}' },
  bundle: true, write: false, platform: 'node', format: 'cjs',
  external: ['firebase/app', 'firebase/auth'],
});
const configModule = { exports: {} };
new Function('require', 'module', 'exports', configured.outputFiles[0].text)(authRequire, configModule, configModule.exports);

test('official SDK factory rejects missing project configuration', () => {
  assert.throws(() => createFirebaseBrowserProvider({}, 'synthetic-test'), /configuration is required/);
});

test('official SDK starts signed out with memory persistence, without Google requests', async () => {
  const oldFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Network forbidden in SDK test'); };
  const name = 'synthetic-lvtp-sdk-test';
  const { getApps, deleteApp } = authRequire('firebase/app');
  try {
    const provider = createFirebaseBrowserProvider({ projectId: 'synthetic-project',
      apiKey: 'synthetic-key', appId: 'synthetic-app' }, name);
    assert.equal((await provider.getInitialState()).isAuthenticated, false);
    await assert.rejects(provider.getSession(), /Authentication required/);
    await assert.rejects(provider.refresh(), /Authentication required/);
    await provider.signOut();
    assert.equal(requests, 0);
  } finally {
    const app = getApps().find(app => app.name === name);
    if (app) await deleteApp(app);
    globalThis.fetch = oldFetch;
  }
});

test('owner-supplied project initializes both portal factories without login or network', async () => {
  const { LVTP_FIREBASE_PROJECT_ID, LVTP_FIREBASE_WEB_OPTIONS, createLVTransportFirebaseProvider } = configModule.exports;
  assert.equal(LVTP_FIREBASE_PROJECT_ID, 'lv-tranport');
  assert.equal(LVTP_FIREBASE_WEB_OPTIONS.authDomain, 'lv-tranport.firebaseapp.com');
  assert.equal(LVTP_FIREBASE_WEB_OPTIONS.appId, '1:393610391278:web:d56b1d17ae54a9df3ccdff');
  assert.deepEqual(Object.keys(LVTP_FIREBASE_WEB_OPTIONS).sort(), ['apiKey', 'appId', 'authDomain', 'projectId']);
  assert.ok(Object.isFrozen(LVTP_FIREBASE_WEB_OPTIONS));
  assert.throws(() => createLVTransportFirebaseProvider('unknown'), /Unknown portal/);
  const oldFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Network forbidden in initialization test'); };
  const { getApps, deleteApp } = authRequire('firebase/app');
  try {
    for (const portal of ['admin', 'driver']) {
      const provider = createLVTransportFirebaseProvider(portal);
      assert.equal((await provider.getInitialState()).isAuthenticated, false);
      await assert.rejects(provider.getSession(), /Authentication required/);
    }
    assert.equal(requests, 0);
  } finally {
    for (const portal of ['admin', 'driver']) {
      const app = getApps().find(app => app.name === `lvtransport-${portal}-auth`);
      if (app) await deleteApp(app);
    }
    globalThis.fetch = oldFetch;
  }
});

test('Google adapter requests account selection and propagates popup failure without fake success', async () => {
  // This case uses a synthetic popup driver, not a Google login or signature proof.
  const mockSource = `
    export const inMemoryPersistence = {};
    export const indexedDBLocalPersistence = {};
    export const browserLocalPersistence = {};
    export async function setPersistence() {}
    export class OAuthProvider {}
    export async function linkWithPopup() { throw new Error('unexpected account linking'); }
    export async function sendSignInLinkToEmail() { throw new Error('unexpected email link'); }
    export function isSignInWithEmailLink() { return false; }
    export async function signInWithEmailLink() { throw new Error('unexpected email sign-in'); }
    export const browserPopupRedirectResolver = { synthetic: true };
    export function initializeAuth() { return {}; }
    export class GoogleAuthProvider {
      setCustomParameters(parameters) { this.parameters = parameters; }
    }
    export async function signInWithPopup(auth, provider, resolver) {
      const state = globalThis.__lvtpGoogleAdapterTest;
      state.calls.push({ parameters: provider.parameters, resolver: resolver.synthetic });
      if (state.fail) throw new Error('synthetic popup cancelled');
      return { user: { uid: 'synthetic-user', email: 'synthetic@example.invalid' } };
    }
    export async function getIdTokenResult() {
      return { token: 'synthetic-token', expirationTime: '2026-11-15T15:00:00Z' };
    }
    export async function signInWithEmailAndPassword() { throw new Error('unexpected password login'); }
    export async function signOut() {}
    export async function sendPasswordResetEmail() {}
    export async function sendEmailVerification() {}
  `;
  const compiled = await build({
    entryPoints: [path.join(root, 'packages/auth/src/providers/firebase-browser.adapter.ts')],
    bundle: true, write: false, format: 'cjs', platform: 'node', external: ['firebase/app'],
    plugins: [{ name: 'synthetic-google-popup', setup(build) {
      build.onResolve({ filter: /^firebase\/auth$/ }, () => ({ path: 'synthetic-auth', namespace: 'synthetic' }));
      build.onLoad({ filter: /.*/, namespace: 'synthetic' }, () => ({ contents: mockSource, loader: 'js' }));
    } }],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(authRequire, module, module.exports);
  const previous = globalThis.__lvtpGoogleAdapterTest;
  globalThis.__lvtpGoogleAdapterTest = { calls: [], fail: false };
  try {
    const adapter = new module.exports.FirebaseBrowserAdapter({});
    const result = await adapter.signInWithGoogle();
    assert.equal(result.isAuthenticated, true);
    assert.equal(result.user.id, 'synthetic-user');
    assert.equal(result.tokens.accessToken, 'synthetic-token');
    assert.equal(result.user.role, undefined);
    assert.deepEqual(globalThis.__lvtpGoogleAdapterTest.calls, [{ parameters: { prompt: 'select_account' }, resolver: true }]);
    globalThis.__lvtpGoogleAdapterTest.fail = true;
    await assert.rejects(adapter.signInWithGoogle(), /synthetic popup cancelled/);
  } finally {
    if (previous === undefined) delete globalThis.__lvtpGoogleAdapterTest;
    else globalThis.__lvtpGoogleAdapterTest = previous;
  }
});

test('browser staging mode requires its own project, app, key and local API', () => {
  const { resolveFirebaseWebOptions, LVTP_FIREBASE_WEB_OPTIONS } = configModule.exports;
  const staging = {
    MODE: 'staging',
    VITE_API_BASE_URL: 'http://127.0.0.1:49153/api/v1',
    VITE_LVTP_STAGING_FIREBASE_PROJECT_ID: 'lvtp-synthetic-staging',
    VITE_LVTP_STAGING_FIREBASE_API_KEY: 'synthetic-key',
    VITE_LVTP_STAGING_FIREBASE_APP_ID: 'synthetic-app',
  };
  assert.equal(resolveFirebaseWebOptions({ MODE: 'production' }), LVTP_FIREBASE_WEB_OPTIONS);
  assert.equal(resolveFirebaseWebOptions(staging).authDomain, 'lvtp-synthetic-staging.firebaseapp.com');
  for (const invalid of [
    { MODE: 'staging' },
    { ...staging, MODE: 'production' },
    { ...staging, VITE_LVTP_STAGING_FIREBASE_PROJECT_ID: LVTP_FIREBASE_WEB_OPTIONS.projectId },
    { ...staging, VITE_LVTP_STAGING_FIREBASE_API_KEY: LVTP_FIREBASE_WEB_OPTIONS.apiKey },
    { ...staging, VITE_LVTP_STAGING_FIREBASE_APP_ID: LVTP_FIREBASE_WEB_OPTIONS.appId },
    { ...staging, VITE_API_BASE_URL: 'https://api.lvtransport.be/api/v1' },
  ]) assert.throws(() => resolveFirebaseWebOptions(invalid), /staging/i);
});
