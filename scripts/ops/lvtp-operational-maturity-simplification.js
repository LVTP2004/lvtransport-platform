#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dimensions = [
  ['ecosystemCoherence', 'Ecosystem coherence'],
  ['runtimeResilience', 'Runtime resilience'],
  ['lifecycleTruth', 'Lifecycle truth'],
  ['moniDiscipline', 'Moni discipline'],
  ['airportCoordination', 'Airport coordination'],
  ['paymentTrust', 'Payment trust'],
  ['realtimeSynchronization', 'Realtime synchronization'],
  ['founderVisibility', 'Founder visibility'],
  ['operationalCalmness', 'Operational calmness'],
  ['simplificationSuccess', 'Simplification success'],
  ['productionReadiness', 'Production readiness'],
  ['emotionalTrustPreservation', 'Emotional trust preservation']
];

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith('--')) continue;
    const [k, inline] = t.slice(2).split('=');
    const v = inline ?? argv[i + 1];
    if (inline == null) i += 1;
    out[k] = v;
  }
  return out;
}

function toPct(v, key) {
  const n = Number(v);
  if (Number.isNaN(n) || n < 0 || n > 100) {
    throw new Error(`Invalid percentage for ${key}: ${v}`);
  }
  return Math.round(n * 100) / 100;
}

function parseList(v) {
  if (!v) return [];
  return String(v).split('|').map((x) => x.trim()).filter(Boolean);
}

function avg(nums) {
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function band(score) {
  if (score >= 92) return 'Founder pilot ready';
  if (score >= 82) return 'Pilot-capable with targeted hardening';
  if (score >= 70) return 'Operationally viable but unstable';
  return 'Not pilot ready';
}

const args = parseArgs(process.argv);
const now = new Date().toISOString();
const scores = {};
for (const [key] of dimensions) {
  if (args[key] == null) {
    console.error(`Missing required score: --${key}`);
    process.exit(1);
  }
  scores[key] = toPct(args[key], key);
}

const freeze = parseList(args.freeze || 'new protocol creation|new AI branches|speculative architecture');
const simplifications = parseList(args.simplifications);
const weaknessChains = parseList(args.weaknessChains);
const founderNow = parseList(args.founderNow);
const nextActions = parseList(args.nextActions);
const productionItems = parseList(args.productionItems);
const experimentalItems = parseList(args.experimentalItems);

const maturity = avg(Object.values(scores));

const outDir = path.join(process.cwd(), 'docs', 'reports');
fs.mkdirSync(outDir, { recursive: true });

const payload = {
  generatedAt: now,
  protocol: 'LVTP Operational Maturity & Simplification',
  expansionFreeze: freeze,
  scorecard: scores,
  maturity,
  maturityBand: band(maturity),
  simplifications,
  weaknessChains,
  founderVisibilityNow: founderNow,
  nextActions,
  productionDiscipline: productionItems,
  experimentalDiscipline: experimentalItems
};

const jsonPath = path.join(outDir, 'LVTP_OPERATIONAL_MATURITY_SIMPLIFICATION_SCORECARD.json');
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const lines = [
  '# LVTP Operational Maturity & Simplification Scorecard',
  '',
  `Generated at: ${now}`,
  '',
  `**Maturity Score:** ${maturity.toFixed(2)}% (${band(maturity)})`,
  '',
  '## Phase 1 — Expansion Freeze',
  ...freeze.map((i) => `- ${i}`),
  '',
  '## Phase 13 — Final Maturity Scorecard',
  '',
  '| Dimension | Score |',
  '|---|---:|',
  ...dimensions.map(([k, label]) => `| ${label} | ${scores[k].toFixed(2)}% |`),
  '',
  '## Ecosystem Cleanup Simplifications',
  ...(simplifications.length ? simplifications.map((i) => `- ${i}`) : ['- No simplifications recorded.']),
  '',
  '## Weakness Convergence Chains',
  ...(weaknessChains.length ? weaknessChains.map((i) => `- ${i}`) : ['- No weakness chains recorded.']),
  '',
  '## Founder Visibility — What Needs Attention Right Now',
  ...(founderNow.length ? founderNow.map((i) => `- ${i}`) : ['- No critical anomalies listed.']),
  '',
  '## Production vs Experimental Discipline',
  '',
  '### Production',
  ...(productionItems.length ? productionItems.map((i) => `- ${i}`) : ['- Stable/calm/reliable systems only.']),
  '',
  '### Experimental',
  ...(experimentalItems.length ? experimentalItems.map((i) => `- ${i}`) : ['- Isolated, controlled, founder-approved only.']),
  '',
  '## Next Required Actions',
  ...(nextActions.length ? nextActions.slice(0, 5).map((i) => `- ${i}`) : ['- Define next 5 operational actions.'])
];

const mdPath = path.join(outDir, 'LVTP_OPERATIONAL_MATURITY_SIMPLIFICATION_SCORECARD.md');
fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
