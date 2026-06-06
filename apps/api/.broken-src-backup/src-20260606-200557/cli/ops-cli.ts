import { IncidentCognitionEngine } from '../ai/incident-cognition/incident-cognition.engine';
import { SnapshotEngine } from '../snapshots/snapshot.engine';

const [,, command] = process.argv;
if (!command) throw new Error('Command required');

if (command === 'incident:cognition' || command === 'incident:explain') {
  const engine = new IncidentCognitionEngine();
  const result = engine.analyze({
    incidentId: 'demo-incident',
    operationalMemoryIndex: [{ source: 'memory', id: 'm1' }],
    executionLedger: [{ source: 'ledger', id: 'l1' }],
    incidentTimeline: [{ source: 'timeline', id: 't1' }],
    evidenceGraph: [{ source: 'graph', id: 'g1' }],
    governanceApprovals: [{ source: 'approval', id: 'a1' }],
    lineageRefs: [{ source: 'lineage', id: 'ln1' }]
  });
  console.log(JSON.stringify(result, null, 2));
} else if (command.startsWith('snapshot:')) {
  const snapshots = new SnapshotEngine();
  if (command === 'snapshot:create') console.log(JSON.stringify(snapshots.create({ operationalMemory: [], executionLedger: [], approvals: [], timelines: [], evidenceGraph: [], telemetryState: {}, governanceState: {} }), null, 2));
  if (command === 'snapshot:list') console.log(JSON.stringify(snapshots.list(), null, 2));
  if (command === 'snapshot:verify') console.log(JSON.stringify(snapshots.verify(process.argv[3] ?? ''), null, 2));
  if (command === 'snapshot:restore-dry-run') console.log(JSON.stringify({ dryRun: true, restorable: true }, null, 2));
} else {
  console.log(`Unsupported command: ${command}`);
}
