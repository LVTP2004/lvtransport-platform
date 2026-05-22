import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
type CheckStatus = 'pass' | 'fail' | 'warn';
type RuntimeCheck = { id: string; status: CheckStatus; message: string; details?: Record<string, unknown> };

const cwd = process.cwd();
const repoRoot = path.resolve(cwd, '../..');
const defaultDbPath = path.resolve(cwd, '.data/runtime.sqlite');
const defaultLedgerPath = path.resolve(cwd, '.data/execution-ledger.json');
const defaultBackupRoot = path.resolve(repoRoot, 'backups');

const hashFile = (filePath: string) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

async function verifyBackup() {
  const root = process.env.LVTP_BACKUP_ROOT ?? defaultBackupRoot;
  if (!fs.existsSync(root)) return { status: 'warn' as const, message: 'Backup root does not exist.', details: { root } };
  const snapshots = fs.readdirSync(root).map((e) => path.join(root, e)).filter((p) => fs.statSync(p).isDirectory()).sort();
  if (!snapshots.length) return { status: 'warn' as const, message: 'No backup snapshots found.', details: { root } };
  const latest = snapshots[snapshots.length - 1];
  try {
    const { stdout } = await execFileAsync('bash', ['scripts/backup/lvtp-verify-backup.sh', latest], { cwd });
    return { status: 'pass' as const, message: 'Backup verification passed.', details: { latestSnapshot: latest, output: stdout.trim() } };
  } catch (error) {
    return { status: 'fail' as const, message: 'Backup verification failed.', details: { latestSnapshot: latest, error: String(error) } };
  }
}

export async function runRuntimeVerification() {
  const dbPath = process.env.LVTP_RUNTIME_DB_PATH ?? defaultDbPath;
  const ledgerPath = process.env.LVTP_EXECUTION_LEDGER_PATH ?? defaultLedgerPath;
  const expectedSchemaVersion = Number.parseInt(process.env.RUNTIME_EXPECTED_SCHEMA_VERSION ?? '1', 10);
  const checks: RuntimeCheck[] = [];

  const dbExists = fs.existsSync(dbPath);
  checks.push({ id: 'sqlite.file-present', status: dbExists ? 'pass' : 'warn', message: dbExists ? 'SQLite file detected.' : 'SQLite file missing.', details: { dbPath } });
  if (dbExists) {
    const walPath = `${dbPath}-wal`;
    const header = fs.readFileSync(dbPath).subarray(0, 16).toString('utf8');
    checks.push({ id: 'sqlite.wal-mode', status: fs.existsSync(walPath) ? 'pass' : 'warn', message: fs.existsSync(walPath) ? 'WAL artifact present.' : 'No WAL artifact detected.', details: { walPath } });
    checks.push({ id: 'sqlite.integrity', status: header.startsWith('SQLite format 3') ? 'pass' : 'fail', message: header.startsWith('SQLite format 3') ? 'SQLite signature valid.' : 'SQLite signature mismatch.', details: { header } });
  }

  const migrationsPath = path.resolve(cwd, 'src/migrations');
  const migrationFiles = fs.existsSync(migrationsPath) ? fs.readdirSync(migrationsPath).filter((n) => /\.(sql|ts)$/.test(n)) : [];
  checks.push({ id: 'migration.consistency', status: migrationFiles.length > 0 ? 'pass' : 'warn', message: migrationFiles.length > 0 ? 'Migration artifacts detected.' : 'No migration artifacts found.', details: { migrationsPath, count: migrationFiles.length } });

  checks.push({ id: 'schema.version', status: Number.isFinite(expectedSchemaVersion) && expectedSchemaVersion > 0 ? 'pass' : 'fail', message: expectedSchemaVersion > 0 ? 'Schema version configured.' : 'Invalid schema version.', details: { expectedSchemaVersion } });

  checks.push({ id: 'backup.availability', ...(await verifyBackup()) });

  if (fs.existsSync(ledgerPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) as { entries?: Array<{ id?: string; hash?: string }> };
      const invalid = (parsed.entries ?? []).some((e) => !e.id || !e.hash);
      checks.push({ id: 'execution-ledger.consistency', status: invalid ? 'fail' : 'pass', message: invalid ? 'Malformed execution ledger entries detected.' : 'Execution ledger is consistent.', details: { ledgerPath, digest: hashFile(ledgerPath) } });
    } catch (error) {
      checks.push({ id: 'execution-ledger.consistency', status: 'fail', message: 'Execution ledger JSON parsing failed.', details: { ledgerPath, error: String(error) } });
    }
  } else {
    checks.push({ id: 'execution-ledger.consistency', status: 'warn', message: 'Execution ledger missing.', details: { ledgerPath } });
  }

  const failures = checks.filter((c) => c.status === 'fail');
  const warnings = checks.filter((c) => c.status === 'warn');
  return {
    generatedAt: new Date().toISOString(),
    status: failures.length ? 'blocked' : warnings.length ? 'degraded' : 'ready',
    checks,
    deterministicCorruptionEscalation: {
      escalated: failures.some((f) => f.id.startsWith('sqlite') || f.id.startsWith('execution-ledger')),
      reasons: failures.filter((f) => f.id.startsWith('sqlite') || f.id.startsWith('execution-ledger')).map((f) => f.id),
    },
    runtimeHealthReport: { total: checks.length, failed: failures.length, warning: warnings.length, localFirstArchitecture: true },
  };
}
