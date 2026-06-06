import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const cwd = process.cwd();
const repoRoot = path.resolve(cwd, '../..');

export async function runRestoreValidation() {
  const backupRoot = process.env.LVTP_BACKUP_ROOT ?? path.resolve(repoRoot, 'backups');
  const dbPath = process.env.LVTP_RUNTIME_DB_PATH ?? path.resolve(cwd, '.data/runtime.sqlite');
  const snapshots = fs.existsSync(backupRoot)
    ? fs.readdirSync(backupRoot).map((e) => path.join(backupRoot, e)).filter((p) => fs.statSync(p).isDirectory()).sort()
    : [];
  const latestSnapshot = snapshots.at(-1);

  const checks: Array<{ id: string; status: 'pass' | 'fail' | 'warn'; message: string; details?: Record<string, unknown> }> = [];

  if (!latestSnapshot) {
    checks.push({ id: 'backup.verification', status: 'warn', message: 'No backup snapshot available.', details: { backupRoot } });
  } else {
    try {
      const verify = await execFileAsync('bash', ['scripts/backup/lvtp-verify-backup.sh', latestSnapshot], { cwd });
      checks.push({ id: 'backup.verification', status: 'pass', message: 'Backup verification passed.', details: { latestSnapshot, output: verify.stdout.trim() } });
      const restoreCheck = await execFileAsync('bash', ['scripts/backup/lvtp-restore-check.sh', latestSnapshot], { cwd });
      checks.push({ id: 'restore.dry-run', status: 'pass', message: 'Restore dry-run passed.', details: { output: restoreCheck.stdout.trim() } });
      const lineageValid = /LVTP backup snapshot/i.test(fs.readFileSync(path.join(latestSnapshot, 'manifest.txt'), 'utf8'));
      checks.push({ id: 'restore.lineage-validation', status: lineageValid ? 'pass' : 'fail', message: lineageValid ? 'Restore lineage marker verified.' : 'Restore lineage marker missing.', details: { manifest: path.join(latestSnapshot, 'manifest.txt') } });
    } catch (error) {
      checks.push({ id: 'restore.dry-run', status: 'fail', message: 'Restore validation script failed.', details: { latestSnapshot, error: String(error) } });
    }
  }

  if (fs.existsSync(dbPath)) {
    const signature = fs.readFileSync(dbPath).subarray(0, 16).toString('utf8');
    checks.push({ id: 'corruption.detection', status: signature.startsWith('SQLite format 3') ? 'pass' : 'fail', message: signature.startsWith('SQLite format 3') ? 'No corruption signature detected.' : 'SQLite corruption signature detected.', details: { dbPath, signature } });
  } else {
    checks.push({ id: 'corruption.detection', status: 'warn', message: 'Runtime DB file missing; corruption check skipped.', details: { dbPath } });
  }

  const failed = checks.filter((c) => c.status === 'fail').length;
  return { generatedAt: new Date().toISOString(), status: failed ? 'blocked' : 'ready', checks };
}
