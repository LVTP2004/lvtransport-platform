#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const phases = [
  'runtimeMatrixLoop',
  'operationalTruthEngine',
  'immersiveMapMatrix',
  'moniCoreMatrix',
  'moniRideEvolutionLoop',
  'moniExperimentalMatrixLab',
  'lvMessengerMatrix',
  'lvPayMatrix',
  'airportIntelligenceMatrix',
  'pwaImmersionMatrix',
  'founderControlMatrix',
  'failureRecoveryMatrix',
  'continuousRefinementLoop',
  'realWorldPilotMatrix',
  'matrixReloadedFinalState'
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

function parseList(value) {
  if (!value) return [];
  return String(value).split('|').map((v) => v.trim()).filter(Boolean);
}

function toPct(value, key) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0 || n > 100) {
    throw new Error(`Invalid ${key} score "${value}". Expected 0-100.`);
  }
  return Math.round(n * 100) / 100;
}

function avg(values) {
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

const args = parseArgs(process.argv);
const timestamp = new Date().toISOString();

const phaseScores = {};
for (const phase of phases) {
  const raw = args[phase] ?? args[phase.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)];
  if (raw == null) {
    console.error(`Missing --${phase} score.`);
    process.exit(1);
  }
  phaseScores[phase] = toPct(raw, phase);
}

const lifecycleTruth = toPct(args.lifecycleTruth ?? args['lifecycle-truth'] ?? 0, 'lifecycleTruth');
const realtimeSync = toPct(args.realtimeSync ?? args['realtime-sync'] ?? 0, 'realtimeSync');
const emotionalCalmness = toPct(args.emotionalCalmness ?? args['emotional-calmness'] ?? 0, 'emotionalCalmness');
const resilience = toPct(args.resilience ?? 0, 'resilience');

const anomaliesObserved = parseList(args.anomaliesObserved ?? args['anomalies-observed']);
const anomaliesResolved = parseList(args.anomaliesResolved ?? args['anomalies-resolved']);
const priorityFixes = parseList(args.priorityFixes ?? args['priority-fixes']);
const nextCycleFocus = parseList(args.nextCycleFocus ?? args['next-cycle-focus']);

const phaseAverage = avg(Object.values(phaseScores));
const systemPulse = Math.round(((phaseAverage * 0.6) + (lifecycleTruth * 0.15) + (realtimeSync * 0.1) + (emotionalCalmness * 0.075) + (resilience * 0.075)) * 100) / 100;

const state = systemPulse >= 92
  ? 'Operationally alive'
  : systemPulse >= 82
    ? 'Stable and maturing'
    : systemPulse >= 70
      ? 'Pilot-capable with hardening required'
      : 'Consolidation required';

const report = {
  generatedAt: timestamp,
  protocol: 'LVTP MATRIX RELOADED',
  pulse: {
    systemPulse,
    state,
    lifecycleTruth,
    realtimeSync,
    emotionalCalmness,
    resilience,
    phaseAverage
  },
  phases: phaseScores,
  runtimeLoop: {
    anomaliesObserved,
    anomaliesResolved,
    priorityFixes,
    nextCycleFocus
  }
};

const outDir = path.join(process.cwd(), 'docs', 'reports');
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'LVTP_MATRIX_RELOADED_REPORT.json');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const md = [
  '# LVTP MATRIX RELOADED Runtime Report',
  '',
  `Generated at: ${timestamp}`,
  '',
  `**System Pulse:** ${systemPulse.toFixed(2)}%`,
  `**State:** ${state}`,
  '',
  '## Operational Signals',
  '',
  `- Lifecycle truth: ${lifecycleTruth.toFixed(2)}%`,
  `- Realtime synchronization: ${realtimeSync.toFixed(2)}%`,
  `- Emotional calmness: ${emotionalCalmness.toFixed(2)}%`,
  `- Runtime resilience: ${resilience.toFixed(2)}%`,
  '',
  '## Phase Scores',
  '',
  '| Phase | Score |',
  '|---|---:|'
];

for (const [name, score] of Object.entries(phaseScores)) {
  md.push(`| ${name} | ${score.toFixed(2)}% |`);
}

function section(title, items, fallback) {
  md.push('', `## ${title}`, '');
  if (!items.length) {
    md.push(`- ${fallback}`);
    return;
  }
  for (const item of items) md.push(`- ${item}`);
}

section('Observed Anomalies', anomaliesObserved, 'No anomalies provided.');
section('Resolved Anomalies', anomaliesResolved, 'No resolved anomalies provided.');
section('Priority Fixes', priorityFixes, 'No priority fixes provided.');
section('Next Cycle Focus', nextCycleFocus, 'No next-cycle focus provided.');

const mdPath = path.join(outDir, 'LVTP_MATRIX_RELOADED_REPORT.md');
fs.writeFileSync(mdPath, `${md.join('\n')}\n`);

console.log(`Generated:\n- ${jsonPath}\n- ${mdPath}`);
console.log(`System Pulse: ${systemPulse.toFixed(2)}% (${state})`);
