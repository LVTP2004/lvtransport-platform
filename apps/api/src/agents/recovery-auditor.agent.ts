import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const BACKUP = '.broken-src-backup/src-20260606-200557';
const REPORT_DIR = '.recovery-agent';
const REPORT_FILE = path.join(REPORT_DIR, 'audit-report.json');

function sh(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function listFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return sh(`find ${root} -type f | sed 's#${root}/##' | sort`).split('\n').filter(Boolean);
}

function classify(file: string): string {
  if (file.endsWith('.test.ts') || file.includes('.spec.')) return 'test';
  if (file.endsWith('.bak')) return 'backup_artifact';
  if (file.includes('payment.routes') || file.includes('payments/README')) return 'risky_legacy_payment';
  if (file.includes('routes/v1/bookings') || file.includes('routes/v1/notifications')) return 'legacy_route';
  if (file.includes('booking-notification') || file.includes('notification-orchestrator')) return 'candidate_restore';
  if (file.includes('booking.service.ts')) return 'possible_duplicate_booking_service';
  return 'needs_review';
}

function importsOf(abs: string): string[] {
  if (!existsSync(abs)) return [];
  const text = readFileSync(abs, 'utf8');
  return [...text.matchAll(/from ['"]([^'"]+)['"]/g)].map(m => m[1]);
}

const backupFiles = listFiles(BACKUP);
const currentFiles = listFiles('src');

const missing = backupFiles.filter(f => !currentFiles.includes(f));
const classified = missing.map(file => ({
  file,
  class: classify(file),
  imports: importsOf(path.join(BACKUP, file))
}));

let typecheck = 'unknown';
try {
  sh('../../node_modules/.bin/tsc --noEmit');
  typecheck = 'pass';
} catch {
  typecheck = 'fail';
}

const report = {
  generatedAt: new Date().toISOString(),
  cwd: process.cwd(),
  typecheck,
  counts: {
    backupFiles: backupFiles.length,
    currentFiles: currentFiles.length,
    missing: missing.length
  },
  priority: {
    safeToInspectFirst: classified.filter(x => x.class === 'candidate_restore'),
    doNotBlindRestore: classified.filter(x =>
      ['risky_legacy_payment', 'possible_duplicate_booking_service', 'legacy_route'].includes(x.class)
    ),
    testsLater: classified.filter(x => x.class === 'test')
  },
  allMissing: classified
};

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  ok: true,
  report: REPORT_FILE,
  typecheck,
  missing: missing.length,
  next: 'cat .recovery-agent/audit-report.json'
}, null, 2));
