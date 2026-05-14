import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('simulation');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const personas = load('clients/personas.json');
const scenarios = load('scenarios/operational-scenarios.json');
const policy = load('agents/moni-ride-policy.json');

const eventImpact = {
  'new booking': { success: 1, stress: 0, misunderstanding: 0 },
  'booking confirmation': { success: 1, stress: -1, misunderstanding: 0 },
  'driver assigned': { success: 1, stress: 0, misunderstanding: 0 },
  'delayed driver': { success: 0, stress: 2, misunderstanding: 1 },
  'route recalculation': { success: 0, stress: 1, misunderstanding: 0 },
  'airport delay': { success: 0, stress: 2, misunderstanding: 1 },
  'traffic issue': { success: 0, stress: 2, misunderstanding: 1 },
  'booking cancellation': { success: -1, stress: 2, misunderstanding: 1 },
  'payment issue': { success: -1, stress: 2, misunderstanding: 1 },
  'tracking request': { success: 0, stress: 1, misunderstanding: 0 },
  'missing booking code': { success: 0, stress: 1, misunderstanding: 1 },
  'VIP recurring route': { success: 1, stress: 0, misunderstanding: 0 },
  'business client scheduling': { success: 1, stress: 1, misunderstanding: 0 },
  'API unavailable': { success: -1, stress: 3, misunderstanding: 1, fallback: 1 },
  'delayed response': { success: 0, stress: 2, misunderstanding: 1, fallback: 1 },
  'missing route data': { success: -1, stress: 2, misunderstanding: 1, fallback: 1 },
  'invalid customer input': { success: 0, stress: 1, misunderstanding: 1 },
  'interrupted booking flow': { success: 0, stress: 2, misunderstanding: 1, fallback: 1 },
  'pricing concern': { success: 0, stress: 1, misunderstanding: 1 }
};

const memory = {};
const run = [];
let totals = {
  bookingsCompleted: 0,
  simulatedSatisfaction: 0,
  fallbackCount: 0,
  misunderstandingCount: 0,
  multilingualQuality: 0,
  continuity: 0
};

for (const scn of scenarios) {
  const customer = personas.find((p) => p.id === scn.customerId);
  const memoryState = memory[customer.id] ?? {
    repeatCount: 0,
    languagePreference: customer.defaultLanguage,
    airportHabits: customer.type === 'airport' ? ['check-in +90m'] : [],
    vipPreferences: customer.type === 'vip' ? ['quiet ride', 'invoice by email'] : [],
    history: []
  };

  memoryState.repeatCount += 1;
  let score = 6;
  let fallbacks = 0;
  let misunderstandings = 0;
  let timeline = [];

  for (const event of scn.events) {
    const impact = eventImpact[event] ?? { success: 0, stress: 0, misunderstanding: 0 };
    score += impact.success - impact.stress * 0.3;
    fallbacks += impact.fallback ?? 0;
    misunderstandings += impact.misunderstanding ?? 0;
    timeline.push({ event, agentAction: resolveAgentAction(event, customer.type) });
  }

  const multilingualBonus = customer.type === 'multilingual' ? 0.8 : 0.4;
  const continuity = Math.max(0, Math.min(10, 8 - fallbacks - misunderstandings * 0.3));
  const satisfaction = Math.max(0, Math.min(10, score));
  const completed = scn.events.includes('booking confirmation') ? 1 : 0;

  totals.bookingsCompleted += completed;
  totals.simulatedSatisfaction += satisfaction;
  totals.fallbackCount += fallbacks;
  totals.misunderstandingCount += misunderstandings;
  totals.multilingualQuality += multilingualBonus;
  totals.continuity += continuity;

  memoryState.history.push({ scenarioId: scn.id, satisfaction, completed, channel: scn.channel });
  memory[customer.id] = memoryState;

  run.push({
    scenarioId: scn.id,
    customerType: customer.type,
    channel: scn.channel,
    stressLevel: scn.stressLevel,
    completed,
    satisfaction,
    fallbacks,
    misunderstandings,
    timeline
  });
}

const n = scenarios.length;
const readiness = (
  (totals.bookingsCompleted / n) * 35 +
  (totals.simulatedSatisfaction / (n * 10)) * 25 +
  (1 - totals.fallbackCount / (n * 4)) * 15 +
  (1 - totals.misunderstandingCount / (n * 6)) * 10 +
  (totals.multilingualQuality / n) * 5 +
  (totals.continuity / (n * 10)) * 10
) * 100 / 100;

const summary = {
  generatedAt: new Date().toISOString(),
  policy: policy.agent,
  metrics: {
    successfulBookingCompletion: `${totals.bookingsCompleted}/${n}`,
    avgSatisfaction: round(totals.simulatedSatisfaction / n),
    fallbackActivationCount: totals.fallbackCount,
    misunderstandingCount: totals.misunderstandingCount,
    multilingualHandlingQuality: round(totals.multilingualQuality / n),
    operationalContinuityScore: round(totals.continuity / n),
    operationalReadinessPercent: round(readiness)
  },
  run,
  memory
};

fs.writeFileSync(path.join(root, 'logs/latest-run.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(root, 'logs/latest-run-summary.md'), renderSummary(summary));

console.log('Simulation completed. Output written to simulation/logs/latest-run.json');

function resolveAgentAction(event, customerType) {
  const base = {
    'new booking': 'verzamelt ritgegevens en bevestigt stap-voor-stap',
    'booking confirmation': 'bevestigt status en deelt duidelijke samenvatting',
    'driver assigned': 'deelt chauffeurstatus en verwachte aankomsttijd',
    'delayed driver': 'biedt empathie, transparante ETA-update en alternatief',
    'route recalculation': 'legt nieuwe route kort uit zonder technisch jargon',
    'airport delay': 'past ophaaltijd proactief aan op vluchtwijziging',
    'traffic issue': 'biedt realtime update met herberekende timing',
    'booking cancellation': 'bevestigt annulering en biedt herboeking aan',
    'payment issue': 'biedt veilige alternatieve betaalstap',
    'tracking request': 'deelt trackingstatus en referentiepunt',
    'missing booking code': 'verifieert met naam/telefoon en herstelt dossier',
    'VIP recurring route': 'activeert premiumprotocol en terugkerend schema',
    'business client scheduling': 'structureert planning en facturatiegegevens',
    'API unavailable': 'schakelt naar handmatige flow met status-updates',
    'delayed response': 'excuseert vertraging en houdt context vast',
    'missing route data': 'vraagt minimale extra data voor herstel',
    'invalid customer input': 'herformuleert vraag eenvoudiger en valideert',
    'interrupted booking flow': 'hervat gesprek vanaf laatste bevestigde stap',
    'pricing concern': 'legt prijsopbouw beknopt en rustig uit'
  };

  if (customerType === 'elderly') {
    return `${base[event] ?? 'handelt gebeurtenis af'} in eenvoudige taal`;
  }

  if (customerType === 'multilingual') {
    return `${base[event] ?? 'handelt gebeurtenis af'} met taaladaptatie (NL/EN/ES)`;
  }

  return base[event] ?? 'handelt gebeurtenis af';
}

function renderSummary(data) {
  return `# Moni Ride Simulation Run\n\n- Generated: ${data.generatedAt}\n- Agent: ${data.policy}\n\n## Metrics\n\n- Successful booking completion: ${data.metrics.successfulBookingCompletion}\n- Avg satisfaction: ${data.metrics.avgSatisfaction}/10\n- Fallback activations: ${data.metrics.fallbackActivationCount}\n- Misunderstandings: ${data.metrics.misunderstandingCount}\n- Multilingual quality: ${data.metrics.multilingualHandlingQuality}/1\n- Continuity score: ${data.metrics.operationalContinuityScore}/10\n- Operational readiness: ${data.metrics.operationalReadinessPercent}%\n`;
}

function round(v) {
  return Math.round(v * 100) / 100;
}
