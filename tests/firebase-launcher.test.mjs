import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const launcher = path.resolve('apps/api/scripts/start-with-firebase.mjs');
test('local launcher checks private config without starting a server or printing keys', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'lvtp-launcher-test-'));
  try {
    const file = path.join(dir, 'synthetic.json');
    const key = { type: 'service_account', project_id: 'lv-tranport',
      client_email: 'firebase-adminsdk-fbsvc@lv-tranport.iam.gserviceaccount.com',
      private_key: 'SYNTHETIC_SECRET_MUST_NOT_APPEAR' };
    writeFileSync(file, JSON.stringify(key), { mode: 0o600 });
    const run = () => {
      const result = spawnSync(process.execPath, [launcher, '--check', file], {
        encoding: 'utf8', timeout: 5000, env: { ...process.env, FIREBASE_AUTH_EMULATOR_HOST: '' },
      });
      assert.ifError(result.error);
      return result;
    };
    let result = run();
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).server_started, false);
    assert.doesNotMatch(result.stdout + result.stderr, /SYNTHETIC_SECRET_MUST_NOT_APPEAR/);
    chmodSync(file, 0o644);
    assert.notEqual(run().status, 0);
    chmodSync(file, 0o600);
    writeFileSync(file, JSON.stringify({ ...key, project_id: 'other-project' }));
    assert.notEqual(run().status, 0);
    assert.doesNotMatch(run().stdout + run().stderr, /SYNTHETIC_SECRET_MUST_NOT_APPEAR/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
