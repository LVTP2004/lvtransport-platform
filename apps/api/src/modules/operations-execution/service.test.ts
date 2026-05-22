import test from 'node:test';
import assert from 'node:assert/strict';
import { auditedOperationalExecutionService } from './service.js';

const validRequest = () => ({
  operationId: 'op-1',
  operatorId: 'operator-1',
  approvalId: 'approval-1',
  approvalReason: 'Incident validated by human operator',
  dryRunId: 'dry-run-1',
  lineage: {
    rootOperationId: 'root-1',
    parentDryRunId: 'dry-run-1',
    chain: ['dry-run-1', 'exec-ready-1'],
    snapshotVersion: 1
  },
  evidence: [{ id: 'ev-1', checksum: 'abc123', type: 'log' }],
  transition: { from: 'dry_run_completed', to: 'execution_pending', allowed: true }
});

test('execution succeeds only with immutable approval and dry-run lineage present', () => {
  const record = auditedOperationalExecutionService.execute('replay', validRequest());
  assert.equal(record.status, 'executed');
  assert.equal(record.result.code, 'EXECUTION_ACCEPTED');
});

test('execution rejects deterministically when mandatory controls are missing', () => {
  const record = auditedOperationalExecutionService.execute('notification-retry', {
    ...validRequest(),
    approvalId: '',
    dryRunId: '',
    evidence: [],
    lineage: { ...validRequest().lineage, chain: [] },
    transition: { from: 'unknown', to: 'executed', allowed: false }
  });

  assert.equal(record.status, 'rejected');
  assert.deepEqual(record.result.rejectedReasons, [
    'APPROVAL_MISSING',
    'DRY_RUN_MISSING',
    'LINEAGE_INCOMPLETE',
    'EVIDENCE_MISSING',
    'INVALID_TRANSITION'
  ]);
});

test('execution history is append-only and preserves lineage snapshots', () => {
  const historyBefore = auditedOperationalExecutionService.listHistory().length;
  const accepted = auditedOperationalExecutionService.execute('replay', validRequest());
  const historyAfter = auditedOperationalExecutionService.listHistory();

  assert.equal(historyAfter.length, historyBefore + 1);
  assert.equal(historyAfter.at(-1)?.auditId, accepted.auditId);
  assert.deepEqual(historyAfter.at(-1)?.lineageSnapshot, validRequest().lineage);
});
