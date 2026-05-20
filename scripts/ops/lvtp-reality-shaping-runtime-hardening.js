#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const requiredPhaseKeys = [
  'phase1RuntimeStressHardening',
  'phase2LifecycleTruthStabilization',
  'phase3AirportRealityHardening',
  'phase4MoniCalmnessValidation',
  'phase5PaymentTrustHardening',
  'phase6ReconnectDiscipline',
  'phase7WeaknessChainPrioritization',
  'phase8FounderVisibilitySimplification',
  'phase9ProductionDiscipline',
  'phase10OperationalCalmnessEnforcement',
  'phase11PilotReadiness',
  'phase12FinalRuntimeScorecard'
];

const requiredScoreKeys = [
  'realtimeResilience',
  'reconnectDiscipline',
  'airportMaturity',
  'paymentTrust',
  'lifecycleIntegrity',
  'moniCalmness',
  'emotionalStability',
  'operationalSimplicity',
  'runtimeRecoveryQuality',
  'founderVisibilityClarity',
  'productionReadiness'
];

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

function toPercent(v, key) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error(`Invalid percentage for ${key}: ${v}`);
  }
  return Math.round(n * 100) / 100;
}

function parseList(v) {
  if (!v) return [];
  return String(v).split('|').map((x) => x.trim()).filter(Boolean);
}

function average(values) {
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function band(score) {
  if (score >= 92) return 'Pilot-ready with premium calmness';
  if (score >= 85) return 'Operationally resilient with targeted hardening';
  if (score >= 75) return 'Controlled operation possible with active oversight';
  return 'Not ready for pilot runtime truth';
}

const args = parseArgs(process.argv);
const now = new Date().toISOString();

const phaseScores = {};
for (const k of requiredPhaseKeys) {
  if (args[k] == null) {
    console.error(`Missing required phase score --${k}`);
    process.exit(1);
  }
  phaseScores[k] = toPercent(args[k], k);
}

const finalScores = {};
for (const k of requiredScoreKeys) {
  if (args[k] == null) {
    console.error(`Missing required score --${k}`);
    process.exit(1);
  }
  finalScores[k] = toPercent(args[k], k);
}

const weakChains = parseList(args.weaknessChains);
const highRisks = parseList(args.highRisks);
const simplifications = parseList(args.simplifications);
const recoveryValidations = parseList(args.recoveryValidations);
const pilotGuards = parseList(args.pilotGuards);

const phaseAverage = average(Object.values(phaseScores));
const scoreAverage = average(Object.values(finalScores));
const runtimeMaturity = Math.round(((phaseAverage * 0.45) + (scoreAverage * 0.55)) * 100) / 100;

const payload = {
  generatedAt: now,
  protocol: 'LV Transport Platform — Reality Shaping & Runtime Hardening',
  objective: 'Calm, resilient, trustworthy realtime runtime under stress.',
  runtimeMaturity,
  maturityBand: band(runtimeMaturity),
  phaseScores,
  scorecard: finalScores,
  anomalies: {
    weaknessChains: weakChains,
    highRisks,
    simplifications,
    recoveryValidations,
    pilotGuards
  }
};

const outDir = path.join(process.cwd(), 'docs', 'runtime-validation');
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'LVTP_REALITY_SHAPING_RUNTIME_HARDENING_REPORT.json');
const mdPath = path.join(outDir, 'LVTP_REALITY_SHAPING_RUNTIME_HARDENING_REPORT.md');

fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const lines = [
  '# LVTP Reality Shaping & Runtime Hardening Report',
  '',
  `Generated at: ${now}`,
  '',
  `**Runtime Maturity:** ${runtimeMaturity.toFixed(2)}% (${band(runtimeMaturity)})`,
  '',
  '## Phase Progress',
  '',
  '| Phase | Score |',
  '|---|---:|'
];

for (const [k, v] of Object.entries(phaseScores)) {
  const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  lines.push(`| ${label} | ${v.toFixed(2)}% |`);
}

lines.push('', '## Final Runtime Scorecard', '', '| Dimension | Score |', '|---|---:|');
for (const [k, v] of Object.entries(finalScores)) {
  const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  lines.push(`| ${label} | ${v.toFixed(2)}% |`);
}

function addList(title, items, fallback) {
  lines.push('', `## ${title}`, '');
  if (!items.length) {
    lines.push(`- ${fallback}`);
    return;
  }
  for (const i of items) lines.push(`- ${i}`);
}

addList('Weakness Chains', weakChains, 'No weakness chains logged.');
addList('High Risks', highRisks, 'No high risks logged.');
addList('Simplification Actions', simplifications, 'No simplification actions logged.');
addList('Recovery Validations', recoveryValidations, 'No recovery validations logged.');
addList('Pilot Guardrails', pilotGuards, 'No pilot guardrails logged.');

lines.push('', '## Philosophy Gate', '', '- Reality before expansion', '- Recovery before innovation', '- Trust before spectacle', '- Calmness before complexity');

fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

console.log(`Generated ${jsonPath}`);
console.log(`Generated ${mdPath}`);
