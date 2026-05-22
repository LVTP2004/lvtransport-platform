import { OperationalKnowledgeGraph } from './knowledge-graph/operational-knowledge-graph.js';
import { SimulationSandboxEngine } from './simulation/simulation-sandbox-engine.js';
import { IntegrityScoringEngine } from './integrity/integrity-scoring-engine.js';
import { OperationalForecastEngine } from './forecasting/operational-forecast-engine.js';
import { ComplianceArchiveService } from './archive/compliance-archive-service.js';
import { PolicyReasoningEngine } from './policy/policy-reasoning-engine.js';

const cmd = process.argv[2];

if (cmd === 'graph:build' || cmd === 'graph:verify' || cmd === 'graph:query') {
  const graph = new OperationalKnowledgeGraph();
  graph.addEntity({ id: 'exec:1', type: 'execution', label: 'Execution 1' });
  graph.addEntity({ id: 'replay:1', type: 'replay', label: 'Replay 1' });
  graph.appendEvidenceEdge({ from: 'exec:1', to: 'replay:1', type: 'replay_ref', evidenceId: 'e-1', provenance: { source: 'explicit-log' } });
  console.log(graph.serialize());
} else if (cmd === 'simulation:run' || cmd === 'simulation:verify') {
  const engine = new SimulationSandboxEngine();
  console.log(JSON.stringify(engine.run({ mode: 'transition', evidence: ['ev:2', 'ev:1'], stateSnapshotId: 'snapshot:1' }), null, 2));
} else if (cmd === 'integrity:score') {
  const engine = new IntegrityScoringEngine();
  console.log(JSON.stringify(engine.score({ lineageCompleteness: 100, replayConsistency: 100, approvalIntegrity: 95, synchronizationConsistency: 98, cognitionEvidenceQuality: 90, telemetryCompleteness: 96, violations: [] }), null, 2));
} else if (cmd === 'forecast:generate') {
  const engine = new OperationalForecastEngine();
  console.log(JSON.stringify(engine.generate({ key: 'incident-accumulation', values: [2, 3, 4, 5], evidenceRefs: ['inc:1', 'inc:2'] }), null, 2));
} else if (cmd === 'archive:create' || cmd === 'archive:verify') {
  const engine = new ComplianceArchiveService();
  const archive = engine.create({ approvals: ['a1'], executionLedger: ['x1'] });
  console.log(JSON.stringify({ archive, verification: engine.verify(archive.manifest, archive.signature) }, null, 2));
} else if (cmd === 'policy:lookup' || cmd === 'policy:explain') {
  const engine = new PolicyReasoningEngine([{ id: 'p-1', title: 'Approval Boundary', constraints: ['No live mutation', 'Read only governance surfaces'] }]);
  console.log(JSON.stringify({ lookup: engine.lookup('approval'), explain: engine.explain('p-1') }, null, 2));
} else {
  console.error('Unknown command');
  process.exit(1);
}
