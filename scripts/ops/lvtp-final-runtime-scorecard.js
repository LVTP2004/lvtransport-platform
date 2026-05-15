#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const scoreKeys = [
  'runtimeStability',
  'pwaInstallQuality',
  'bookingFlowReadiness',
  'driverFlowReadiness',
  'adminFlowReadiness',
  'moniRideRuntimeMaturity',
  'lvPayReadiness',
  'lvMessengerReadiness',
  'airportWorkflowReadiness',
  'reconnectRecovery',
  'backupRollbackReadiness',
  'mobileExperience',
  'operationalMetricsReadiness',
  'founderPilotReadiness',
  'overallProductionReadiness'
];

function toPct(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0 || n > 100) {
    throw new Error(`Invalid percentage \"${value}\". Expected 0-100.`);
  }
  return Math.round(n * 100) / 100;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [key, inlineValue] = token.slice(2).split('=');
    const value = inlineValue ?? argv[i + 1];
    if (inlineValue == null) i += 1;
    args[key] = value;
  }
  return args;
}

function kebabToCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

const args = parseArgs(process.argv);
const now = new Date().toISOString();

const scores = {};
for (const key of scoreKeys) {
  const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  const raw = args[kebab] ?? args[key] ?? args[kebabToCamel(kebab)];
  scores[key] = raw == null ? null : toPct(raw);
}

const missing = scoreKeys.filter((k) => scores[k] == null);
if (missing.length > 0) {
  console.error('Missing score inputs. Provide all percentages as flags, e.g. --runtime-stability 87');
  console.error(`Missing: ${missing.join(', ')}`);
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'docs', 'reports');
fs.mkdirSync(outDir, { recursive: true });

const payload = {
  generatedAt: now,
  protocol: 'LVTP Final Runtime Reality + Operational Productization Protocol',
  scores
};

const jsonPath = path.join(outDir, 'LVTP_FINAL_RUNTIME_SCORECARD.json');
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const lines = [
  '# LVTP Final Runtime Scorecard',
  '',
  `Generated at: ${now}`,
  '',
  '| Dimension | Percentage |',
  '|---|---:|'
];

for (const [key, value] of Object.entries(scores)) {
  const label = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
  lines.push(`| ${label} | ${value.toFixed(2)}% |`);
}

const mdPath = path.join(outDir, 'LVTP_FINAL_RUNTIME_SCORECARD.md');
fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
