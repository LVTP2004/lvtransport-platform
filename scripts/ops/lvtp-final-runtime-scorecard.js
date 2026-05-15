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

function parseCsv(value) {
  if (!value) return [];
  return String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
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
const productionRiskLevel = transformationReadiness >= 90
  ? 'Low'
  : transformationReadiness >= 80
    ? 'Moderate'
    : transformationReadiness >= 70
      ? 'High'
      : 'Critical';

const observed = parseCsv(resolveArg(args, 'observed'));
const failed = parseCsv(resolveArg(args, 'failed'));
const improved = parseCsv(resolveArg(args, 'improved'));
const simplified = parseCsv(resolveArg(args, 'simplified'));
const hardened = parseCsv(resolveArg(args, 'hardened'));
const remainsWeak = parseCsv(resolveArg(args, 'remainsWeak'));
const nextTopPriorities = parseCsv(resolveArg(args, 'nextTopPriorities'));
const founderPilotRecommendation = resolveArg(args, 'founderPilotRecommendation') ?? 'Continue controlled founder-operated pilot with monitored fallback paths.';

const payload = {
  generatedAt: now,
  protocol: 'LVTP Final Transformation Protocol',
  aggregates: {
    scoreAverage,
    phaseAverage,
    transformationReadiness,
    readinessBand: readinessBand(transformationReadiness),
    productionRiskLevel
  },
  scores,
  phases,
  loopReport: {
    observed,
    failed,
    improved,
    simplified,
    hardened,
    remainsWeak,
    nextTopPriorities,
    founderPilotRecommendation
  }
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

lines.push(
  '',
  '## Final Decision Loop',
  '',
  `- Runtime stability stronger: ${scores.runtimeStability >= 85 ? 'Yes' : 'No'}`,
  `- User simplicity stronger: ${scores.mobileExperience >= 85 ? 'Yes' : 'No'}`,
  `- Realtime reliability stronger: ${scores.bookingFlowReadiness >= 85 ? 'Yes' : 'No'}`,
  `- Moni calmer and useful: ${scores.moniRideRuntimeMaturity >= 85 ? 'Yes' : 'No'}`,
  `- Maps alive and coherent: ${scores.driverFlowReadiness >= 85 ? 'Yes' : 'No'}`,
  `- Payments clear and synchronized: ${scores.lvPayReadiness >= 85 ? 'Yes' : 'No'}`,
  `- Airport operation smarter: ${scores.airportWorkflowReadiness >= 85 ? 'Yes' : 'No'}`,
  `- Communications coherent: ${scores.lvMessengerReadiness >= 85 ? 'Yes' : 'No'}`,
  `- Founder visibility improved: ${scores.adminFlowReadiness >= 85 ? 'Yes' : 'No'}`,
  `- Pilot readiness increased: ${scores.founderPilotReadiness >= 85 ? 'Yes' : 'No'}`,
  '',
  `**Production Risk Level:** ${productionRiskLevel}`
);

function pushListSection(title, items, fallback) {
  lines.push('', `## ${title}`, '');
  if (!items.length) {
    lines.push(`- ${fallback}`);
    return;
  }
  items.forEach((item) => lines.push(`- ${item}`));
}

pushListSection('Loop Report — What Was Observed', observed, 'No observations were provided for this cycle.');
pushListSection('Loop Report — What Failed', failed, 'No failed flows were reported for this cycle.');
pushListSection('Loop Report — What Improved', improved, 'No explicit improvements were reported for this cycle.');
pushListSection('Loop Report — What Was Simplified', simplified, 'No simplifications were reported for this cycle.');
pushListSection('Loop Report — What Was Hardened', hardened, 'No hardening updates were reported for this cycle.');
pushListSection('Loop Report — What Remains Weak', remainsWeak, 'No remaining weaknesses were reported for this cycle.');
pushListSection('Loop Report — Next Top 5 Priorities', nextTopPriorities.slice(0, 5), 'No priorities were provided for the next cycle.');
lines.push('', '## Founder Pilot Recommendation', '', `- ${founderPilotRecommendation}`);

const mdPath = path.join(outDir, 'LVTP_FINAL_RUNTIME_SCORECARD.md');
fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
