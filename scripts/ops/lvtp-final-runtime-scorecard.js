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

const transformationPhases = [
  { key: 'phase01SystemConsolidation', label: 'Phase 01 — System Consolidation' },
  { key: 'phase02RuntimeHardening', label: 'Phase 02 — Runtime Hardening' },
  { key: 'phase03ImmersiveMapEngine', label: 'Phase 03 — Immersive Map Engine' },
  { key: 'phase04MoniCoreEcosystem', label: 'Phase 04 — Moni Core Ecosystem' },
  { key: 'phase05MoniRideMaturity', label: 'Phase 05 — Moni Ride Premium Maturity' },
  { key: 'phase06LvMessengerInfrastructure', label: 'Phase 06 — LV Messenger Infrastructure' },
  { key: 'phase07LvPayOrchestration', label: 'Phase 07 — LV Pay Orchestration' },
  { key: 'phase08AirportIntelligence', label: 'Phase 08 — Airport Intelligence System' },
  { key: 'phase09InstallablePwaApps', label: 'Phase 09 — Installable PWA Applications' },
  { key: 'phase10PremiumUxEmotionalDesign', label: 'Phase 10 — Premium UX + Emotional Design' },
  { key: 'phase11FounderPilotExecution', label: 'Phase 11 — Operational Pilot Execution' },
  { key: 'phase12EnterpriseHardening', label: 'Phase 12 — Enterprise Hardening' },
  { key: 'phase13SaasMetricsDashboard', label: 'Phase 13 — SaaS Metrics + Founder Dashboard' },
  { key: 'phase14PremiumSimplicityOptimization', label: 'Phase 14 — Premium Simplicity Optimization' },
  { key: 'phase15FinalSaasValidation', label: 'Phase 15 — Final SaaS Validation' }
];

function toPct(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0 || n > 100) {
    throw new Error(`Invalid percentage "${value}". Expected 0-100.`);
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

function resolveArg(args, key) {
  const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return args[kebab] ?? args[key] ?? args[kebabToCamel(kebab)];
}

function average(values) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

function readinessBand(score) {
  if (score >= 95) return 'Enterprise-grade premium readiness';
  if (score >= 85) return 'Strong SaaS operational maturity';
  if (score >= 70) return 'Pilot-capable with targeted hardening required';
  return 'Pre-production — consolidation required';
}

const args = parseArgs(process.argv);
const now = new Date().toISOString();

const scores = {};
for (const key of scoreKeys) {
  const raw = resolveArg(args, key);
  scores[key] = raw == null ? null : toPct(raw);
}

const missingScores = scoreKeys.filter((k) => scores[k] == null);
if (missingScores.length > 0) {
  console.error('Missing score inputs. Provide all percentages as flags, e.g. --runtime-stability 87');
  console.error(`Missing: ${missingScores.join(', ')}`);
  process.exit(1);
}

const phases = {};
for (const phase of transformationPhases) {
  const raw = resolveArg(args, phase.key);
  phases[phase.key] = raw == null ? null : toPct(raw);
}

const missingPhases = transformationPhases.filter((phase) => phases[phase.key] == null);
if (missingPhases.length > 0) {
  console.error('Missing phase maturity inputs. Provide all 15 phases as percentages.');
  console.error(`Missing: ${missingPhases.map((phase) => phase.key).join(', ')}`);
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'docs', 'reports');
fs.mkdirSync(outDir, { recursive: true });

const scoreValues = Object.values(scores);
const phaseValues = Object.values(phases);
const scoreAverage = average(scoreValues);
const phaseAverage = average(phaseValues);
const transformationReadiness = Math.round(((scoreAverage * 0.65) + (phaseAverage * 0.35)) * 100) / 100;

const payload = {
  generatedAt: now,
  protocol: 'LVTP Final Transformation Protocol',
  aggregates: {
    scoreAverage,
    phaseAverage,
    transformationReadiness,
    readinessBand: readinessBand(transformationReadiness)
  },
  scores,
  phases
};

const jsonPath = path.join(outDir, 'LVTP_FINAL_RUNTIME_SCORECARD.json');
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const lines = [
  '# LVTP Final Runtime Scorecard',
  '',
  `Generated at: ${now}`,
  '',
  `**Transformation Readiness:** ${transformationReadiness.toFixed(2)}% (${readinessBand(transformationReadiness)})`,
  '',
  '## Core Operational Dimensions',
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

lines.push('', '## Transformation Phase Maturity', '', '| Phase | Percentage |', '|---|---:|');
for (const phase of transformationPhases) {
  lines.push(`| ${phase.label} | ${phases[phase.key].toFixed(2)}% |`);
}

const mdPath = path.join(outDir, 'LVTP_FINAL_RUNTIME_SCORECARD.md');
fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
