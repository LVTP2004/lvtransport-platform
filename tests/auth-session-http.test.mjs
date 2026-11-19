import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { once } from 'node:events';

const root = process.cwd();
const apiRequire = createRequire(path.join(root, 'apps/api/package.json'));
const adminRequire = createRequire(path.join(root, 'apps/admin/package.json'));
const { build } = createRequire(adminRequire.resolve('vite'))('esbuild');
const result = await build({
  entryPoints: [path.join(root, 'apps/api/src/routes/v1/auth-session.routes.ts')],
  bundle: true, write: false, platform: 'node', format: 'cjs', external: ['express'],
});
const module = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(apiRequire, module, module.exports);
const express = apiRequire('express');

test('HTTP session endpoint requires verified identity and never returns the bearer', async () => {
  const app = express();
  let calls = 0;
  app.use('/api/v1/auth', module.exports.createAuthSessionRoutes(async token => {
    calls++;
    if (token !== 'synthetic-valid-token') throw new Error('synthetic verification rejection');
    return { userId: 'synthetic-driver', role: 'driver', status: 'active' };
  }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const endpoint = `http://127.0.0.1:${server.address().port}/api/v1/auth/session`;
  try {
    const absent = await fetch(endpoint + '?role=super_admin');
    assert.equal(absent.status, 401);
    assert.equal(calls, 0);
    assert.equal(absent.headers.get('cache-control'), 'no-store');
    const rejected = await fetch(endpoint, { headers: { Authorization: 'Bearer synthetic-invalid' } });
    assert.equal(rejected.status, 401);
    const accepted = await fetch(endpoint + '?role=super_admin', {
      headers: { Authorization: 'Bearer synthetic-valid-token' },
    });
    assert.equal(accepted.status, 200);
    const body = await accepted.json();
    assert.deepEqual(body, { success: true, identity: {
      userId: 'synthetic-driver', role: 'driver', status: 'active', permissions: ['driver:update_status'],
    } });
    assert.doesNotMatch(JSON.stringify(body), /synthetic-valid-token|super_admin/);
    assert.equal(accepted.headers.get('cache-control'), 'no-store');
    const method = await fetch(endpoint, { method: 'POST' });
    assert.equal(method.status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('scoped customer session cannot unlock the strict operational session', async () => {
  const app = express();
  app.use('/api/v1/auth', module.exports.createAuthSessionRoutes(
    async () => { throw new Error('Synthetic account has no operational grant'); },
    async token => {
      if (token !== 'synthetic-customer-token') throw new Error('Synthetic invalid identity');
      return { userId:'synthetic-customer',role:'customer',status:'active' };
    },
  ));
  const server = app.listen(0,'127.0.0.1'); await once(server,'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/v1/auth`;
  try {
    const options = { headers:{Authorization:'Bearer synthetic-customer-token'} };
    const customer = await fetch(base + '/customer-session?role=admin', options);
    assert.equal(customer.status,200);
    const body = await customer.json();
    assert.equal(body.identity.scope,'customer');
    assert.equal(body.identity.role,'customer');
    assert.deepEqual(body.identity.permissions,['book:ride','manage:profile']);
    assert.equal((await fetch(base + '/session',options)).status,401);
    assert.equal((await fetch(base + '/customer-session')).status,401);
  } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
});
