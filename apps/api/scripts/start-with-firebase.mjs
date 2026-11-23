import { spawn } from 'node:child_process';
import { constants, closeSync, fstatSync, openSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(apiRoot, '../..');
const args = process.argv.slice(2);
const checkOnly = args[0] === '--check';
const credentialPath = args[checkOnly ? 1 : 0];

function validateCredential() {
  if (args.length !== (checkOnly ? 2 : 1) || !credentialPath || !path.isAbsolute(credentialPath)) {
    throw new Error('Expected an absolute credentials path');
  }
  const resolved = realpathSync(credentialPath);
  if (resolved !== credentialPath || resolved === repoRoot || resolved.startsWith(repoRoot + path.sep)) {
    throw new Error('Credentials must be outside the repository, without symlinks');
  }
  const fd = openSync(resolved, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = fstatSync(fd);
    if (!info.isFile() || info.nlink !== 1 || info.uid !== process.getuid()
      || (info.mode & 0o077) !== 0 || info.size > 32768) {
      throw new Error('Credentials must be a private regular file owned by the operator');
    }
    const key = JSON.parse(readFileSync(fd, 'utf8'));
    if (key.type !== 'service_account' || key.project_id !== 'lv-tranport'
      || typeof key.private_key !== 'string' || !key.private_key
      || key.client_email !== 'firebase-adminsdk-fbsvc@lv-tranport.iam.gserviceaccount.com') {
      throw new Error('Credentials do not match the configured project/account');
    }
    return resolved;
  } finally { closeSync(fd); }
}

try {
  const validatedPath = validateCredential();
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Emulator mode is not allowed');
  if (checkOnly) {
    console.log(JSON.stringify({ status: 'LOCAL_CONFIG_VALID', project: 'lv-tranport', server_started: false }));
  } else {
    // Set ADC only in the child process. No .env, shell profile or service edits.
    const child = spawn('pnpm', ['exec', 'tsx', 'src/server.ts'], {
      cwd: apiRoot, stdio: 'inherit',
      env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: validatedPath },
    });
    child.on('error', () => { console.error('API process could not start'); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code ?? 1; });
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  }
} catch {
  console.error('Firebase local configuration rejected. Check project, ownership, permissions and absolute path.');
  process.exitCode = 1;
}
