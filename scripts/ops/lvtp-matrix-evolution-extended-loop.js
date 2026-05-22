#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const phases = [
  'runtimeEvolutionLoop',
  'weaknessAlignmentEngine',
  'operationalTruthMatrix',
  'immersiveMapEvolution',
  'moniCoreEvolution',
  'moniRideEvolution',
  'moniExperimentalEvolutionLab',
  'lvMessengerEvolution',
  'lvPayEvolution',
  'airportIntelligenceEvolution',
  'failureRecoveryEvolution',
  'pwaImmersionEvolution',
  'premiumSimplicityEvolution',
  'continuousScorecardEvolution',
  'realWorldPilotEvolution',
  'matrixEvolutionFinalState'
];

const defaults = {
  owner: 'unassigned',
  emotionalImpact: 'medium',
  operationalRisk: 'medium',
  rootCauseChain: []
};

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
  return String(value).split('|').map((item) => item.trim()).filter(Boolean);
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

function parseWeaknesses(raw) {
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error('Invalid --weaknesses JSON payload.');
  }
  if (!Array.isArray(parsed)) throw new Error('--weaknesses must be a JSON array.');

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Weakness #${index + 1} must be an object.`);
    }
    if (!entry.id || !entry.summary) {
      throw new Error(`Weakness #${index + 1} must include id and summary.`);
    }
    return {
      id: String(entry.id),
      summary: String(entry.summary),
      subsystemOwner: String(entry.subsystemOwner || defaults.owner),
      emotionalImpact: String(entry.emotionalImpact || defaults.emotionalImpact),
      operationalRisk: String(entry.operationalRisk || defaults.operationalRisk),
      connectedWeaknesses: Array.isArray(entry.connectedWeaknesses) ? entry.connectedWeaknesses : [],
      rootCauseChain: Array.isArray(entry.rootCauseChain) ? entry.rootCauseChain : defaults.rootCauseChain
    };
  });
}

const args = parseArgs(process.argv);
const timestamp = new Date().toISOString();
const phaseScores = {};
for (const phase of phases) {
  const score = args[phase] ?? args[phase.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)];
  if (score == null) {
    console.error(`Missing --${phase} score.`);
    process.exit(1);
  }
  phaseScores[phase] = toPct(score, phase);
}

const lifecycleTruth = toPct(args.lifecycleTruth ?? args['lifecycle-truth'] ?? 0, 'lifecycleTruth');
const realtimeSync = toPct(args.realtimeSync ?? args['realtime-sync'] ?? 0, 'realtimeSync');
const emotionalCalmness = toPct(args.emotionalCalmness ?? args['emotional-calmness'] ?? 0, 'emotionalCalmness');
const resilience = toPct(args.resilience ?? 0, 'resilience');
const founderVisibility = toPct(args.founderVisibility ?? args['founder-visibility'] ?? 0, 'founderVisibility');
const controlledAiEvolution = toPct(args.controlledAiEvolution ?? args['controlled-ai-evolution'] ?? 0, 'controlledAiEvolution');

const anomaliesObserved = parseList(args.anomaliesObserved ?? args['anomalies-observed']);
const anomaliesResolved = parseList(args.anomaliesResolved ?? args['anomalies-resolved']);
const refinementActions = parseList(args.refinementActions ?? args['refinement-actions']);
const simplificationWins = parseList(args.simplificationWins ?? args['simplification-wins']);
const nextCycleFocus = parseList(args.nextCycleFocus ?? args['next-cycle-focus']);
const weaknesses = parseWeaknesses(args.weaknesses);

const phaseAverage = avg(Object.values(phaseScores));
const convergenceIndex = Math.round(((weaknesses.length ? anomaliesResolved.length / weaknesses.length : 1) * 100) * 100) / 100;
const systemPulse = Math.round((
  (phaseAverage * 0.55) +
  (lifecycleTruth * 0.12) +
  (realtimeSync * 0.09) +
  (emotionalCalmness * 0.08) +
  (resilience * 0.08) +
  (founderVisibility * 0.04) +
  (controlledAiEvolution * 0.04)
) * 100) / 100;

const state = systemPulse >= 94
  ? 'Continuously evolving premium SaaS intelligence system'
  : systemPulse >= 85
    ? 'Operationally mature and self-refining'
    : systemPulse >= 74
      ? 'Pilot-capable with targeted hardening required'
      : 'Convergence and stabilization required';

const report = {
  generatedAt: timestamp,
  protocol: 'LVTP MATRIX EVOLUTION EXTENDED',
  pulse: {
    systemPulse,
    state,
    lifecycleTruth,
    realtimeSync,
    emotionalCalmness,
    resilience,
    founderVisibility,
    controlledAiEvolution,
    phaseAverage,
    convergenceIndex
  },
  phases: phaseScores,
  runtimeEvolution: {
    anomaliesObserved,
    anomaliesResolved,
    weaknesses,
    refinementActions,
    simplificationWins,
    nextCycleFocus
  }
};

const outDir = path.join(process.cwd(), 'docs', 'reports');
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, 'LVTP_MATRIX_EVOLUTION_EXTENDED_REPORT.json');
const mdPath = path.join(outDir, 'LVTP_MATRIX_EVOLUTION_EXTENDED_REPORT.md');

fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const md = [
  '# LVTP MATRIX EVOLUTION EXTENDED Report',
  '',
  `Generated at: ${timestamp}`,
  '',
  `**System Pulse:** ${systemPulse.toFixed(2)}%`,
  `**State:** ${state}`,
  `**Convergence Index:** ${convergenceIndex.toFixed(2)}%`,
  '',
  '## Core Signals',
  '',
  `- Lifecycle truth: ${lifecycleTruth.toFixed(2)}%`,
  `- Realtime synchronization: ${realtimeSync.toFixed(2)}%`,
  `- Emotional calmness: ${emotionalCalmness.toFixed(2)}%`,
  `- Runtime resilience: ${resilience.toFixed(2)}%`,
  `- Founder visibility: ${founderVisibility.toFixed(2)}%`,
  `- Controlled AI evolution: ${controlledAiEvolution.toFixed(2)}%`,
  '',
  '## Phase Scores',
  '',
  '| Phase | Score |',
  '|---|---:|'
];

for (const [name, score] of Object.entries(phaseScores)) {
  md.push(`| ${name} | ${score.toFixed(2)}% |`);
}

md.push('', '## Weakness Alignment Chains', '');
if (!weaknesses.length) {
  md.push('- No weaknesses submitted for this cycle.');
} else {
  for (const weakness of weaknesses) {
    md.push(`- **${weakness.id}** — ${weakness.summary}`);
    md.push(`  - Owner: ${weakness.subsystemOwner}`);
    md.push(`  - Emotional impact: ${weakness.emotionalImpact}`);
    md.push(`  - Operational risk: ${weakness.operationalRisk}`);
    md.push(`  - Connected weaknesses: ${weakness.connectedWeaknesses.length ? weakness.connectedWeaknesses.join(', ') : 'None'}`);
    md.push(`  - Root-cause chain: ${weakness.rootCauseChain.length ? weakness.rootCauseChain.join(' → ') : 'Not provided'}`);
  }
}

function addSection(title, items, fallback) {
  md.push('', `## ${title}`, '');
  if (!items.length) {
    md.push(`- ${fallback}`);
    return;
  }
  for (const item of items) md.push(`- ${item}`);
}

addSection('Observed Anomalies', anomaliesObserved, 'No anomalies observed in input.');
addSection('Resolved Anomalies', anomaliesResolved, 'No anomalies resolved in input.');
addSection('Refinement Actions', refinementActions, 'No refinement actions submitted.');
addSection('Premium Simplicity Wins', simplificationWins, 'No simplification wins submitted.');
addSection('Next Cycle Focus', nextCycleFocus, 'No next-cycle focus submitted.');

fs.writeFileSync(mdPath, `${md.join('\n')}\n`);

console.log(`Generated:\n- ${jsonPath}\n- ${mdPath}`);
console.log(`System Pulse: ${systemPulse.toFixed(2)}% (${state})`);
