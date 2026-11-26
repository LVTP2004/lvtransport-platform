import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: { workspace: { type: 'string' }, help: { type: 'boolean' } },
});
if (values.help) {
  console.log('Usage: node tools/release/bootstrap-payment-acceptance.mjs [--workspace <checkout>]');
  process.exit(0);
}

const workspace = values.workspace
  ? resolve(values.workspace)
  : fileURLToPath(new URL('../..', import.meta.url));
if (!existsSync(join(workspace, 'pnpm-workspace.yaml')) || !existsSync(join(workspace, 'tests'))) {
  throw Error('Select an LVTransport workspace with its test files and installed dependencies.');
}

const reportDirectory = mkdtempSync(join(tmpdir(), 'lvtp-payment-acceptance-'));
const buildDirectory = join(reportDirectory, 'builds');
mkdirSync(buildDirectory);
const testFiles = readdirSync(join(workspace, 'tests'))
  .filter(name => name.endsWith('.test.mjs')).sort().map(name => 'tests/' + name);
const checkoutTest = 'apps/api/src/modules/payments/staging-checkout.test.ts';
const paymentTest = 'apps/api/src/modules/payments/staging-payments.test.ts';
const firebaseTest = 'apps/api/src/auth/services/firebase-staging.test.ts';
const required = [checkoutTest, paymentTest];
if (!testFiles.length || required.some(file => !existsSync(join(workspace, file)))) {
  throw Error('The selected checkout is missing the required operations or payment suites.');
}

const tasks = [
  ['node-tests', process.execPath, ['--import', 'tsx', '--test', ...testFiles, ...required,
    ...(existsSync(join(workspace, firebaseTest)) ? [firebaseTest] : [])]],
  ['python-tests', 'python3', ['-B', '-m', 'unittest', 'discover', '-s', 'tests']],
  ['typecheck', 'pnpm', ['run', 'typecheck']],
  ['api-build', 'pnpm', ['--filter', '@lvtransport/api', 'exec', 'tsc', '-p', 'tsconfig.json', '--outDir', join(buildDirectory, 'api')]],
  ['web-build', 'pnpm', ['--filter', '@lvtransport/web', 'exec', 'vite', 'build', '--outDir', join(buildDirectory, 'web')]],
];

const runs = [];
for (const [name, command, args] of tasks) {
  const result = spawnSync(command, args, { cwd: workspace, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const log = join(reportDirectory, name + '.log');
  writeFileSync(log, [result.stdout, result.stderr, result.error?.message].filter(Boolean).join('\n'));
  const status = result.status === 0 && !result.error ? 'passed' : 'failed';
  runs.push({ name, status, exitCode: result.status, log });
  console.log(status.toUpperCase() + ' ' + name);
}

const passed = runs.every(run => run.status === 'passed');
const report = join(reportDirectory, 'result.json');
writeFileSync(report, JSON.stringify({
  workspace, checkedAt: new Date().toISOString(), automated: passed ? 'passed' : 'failed',
  acceptanceChecklist: 'docs/architecture/LVTRANSPORT_PAYMENT_ACCEPTANCE.md',
  requiredExternalAcceptance: 'not_run',
  productionReleaseVerified: false,
  runs,
}, null, 2) + '\n');
console.log('Report ' + report);
process.exitCode = passed ? 0 : 1;
