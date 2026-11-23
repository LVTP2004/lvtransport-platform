import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { assertStagingFirebaseCredentials, resolveFirebaseProject } from './firebase-admin-bootstrap.js';

const project = 'lvtp-synthetic-staging';
const staging = { LVTP_FIREBASE_MODE: 'staging', LVTP_STAGING_FIREBASE_PROJECT_ID: project };

test('API selects the project explicitly and rejects incomplete or production staging configuration', () => {
  assert.equal(resolveFirebaseProject({}), 'lv-tranport');
  assert.equal(resolveFirebaseProject(staging), project);
  for (const invalid of [
    { NODE_ENV: 'staging' },
    { LVTP_FIREBASE_MODE: 'staging' },
    { LVTP_STAGING_FIREBASE_PROJECT_ID: project },
    { ...staging, LVTP_STAGING_FIREBASE_PROJECT_ID: 'lv-tranport' },
    { ...staging, GOOGLE_CLOUD_PROJECT: 'lv-tranport' },
    { ...staging, FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' },
  ]) assert.throws(() => resolveFirebaseProject(invalid), /staging configuration/);
});

test('API staging requires a service account file for the selected project', t => {
  const directory = mkdtempSync(join(tmpdir(), 'lvtp-firebase-config-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, 'account.json');
  assert.throws(() => assertStagingFirebaseCredentials(project, undefined), /required/);
  writeFileSync(file, JSON.stringify({ type: 'service_account', project_id: 'lv-tranport' }));
  assert.throws(() => assertStagingFirebaseCredentials(project, file), /mismatch/);
  writeFileSync(file, JSON.stringify({ type: 'service_account', project_id: project }));
  assert.doesNotThrow(() => assertStagingFirebaseCredentials(project, file));
});
