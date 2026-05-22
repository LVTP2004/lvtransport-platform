import { randomUUID } from 'node:crypto';

export type ExecutionType = 'replay' | 'notification-retry';
export type ExecutionStatus = 'executed' | 'rejected';

export interface AuditedExecutionRequest {
  operationId: string;
  operatorId: string;
  approvalId: string;
  approvalReason: string;
  dryRunId: string;
  lineage: {
    rootOperationId: string;
    parentDryRunId: string;
    chain: string[];
    snapshotVersion: number;
  };
  evidence: Array<{ id: string; checksum: string; type: string }>;
  transition: {
    from: string;
    to: string;
    allowed: boolean;
  };
  metadata?: Record<string, unknown>;
}

export interface AuditedExecutionRecord {
  auditId: string;
  type: ExecutionType;
  status: ExecutionStatus;
  requestedAt: string;
  operatorId: string;
  request: AuditedExecutionRequest;
  result: {
    code: 'EXECUTION_ACCEPTED' | 'EXECUTION_REJECTED';
    message: string;
    rejectedReasons?: string[];
  };
  lineageSnapshot: AuditedExecutionRequest['lineage'];
  dryRunReference: string;
  approvalReference: string;
}

const VALID_TRANSITIONS = new Set(['dry_run_completed->execution_pending', 'execution_pending->executed']);

class AuditedOperationalExecutionService {
  private readonly history: AuditedExecutionRecord[] = [];

  execute(type: ExecutionType, request: AuditedExecutionRequest): AuditedExecutionRecord {
    const rejectedReasons: string[] = [];

    if (!request.approvalId.trim() || !request.approvalReason.trim()) rejectedReasons.push('APPROVAL_MISSING');
    if (!request.dryRunId.trim()) rejectedReasons.push('DRY_RUN_MISSING');

    const lineageComplete =
      Boolean(request.lineage?.rootOperationId?.trim()) &&
      Boolean(request.lineage?.parentDryRunId?.trim()) &&
      Array.isArray(request.lineage?.chain) &&
      request.lineage.chain.length > 0;
    if (!lineageComplete) rejectedReasons.push('LINEAGE_INCOMPLETE');

    const hasEvidence = Array.isArray(request.evidence) && request.evidence.length > 0 &&
      request.evidence.every((item) => item.id.trim() && item.checksum.trim() && item.type.trim());
    if (!hasEvidence) rejectedReasons.push('EVIDENCE_MISSING');

    const transitionKey = `${request.transition?.from ?? ''}->${request.transition?.to ?? ''}`;
    if (!request.transition?.allowed || !VALID_TRANSITIONS.has(transitionKey)) rejectedReasons.push('INVALID_TRANSITION');

    const rejected = rejectedReasons.length > 0;
    const record: AuditedExecutionRecord = {
      auditId: randomUUID(),
      type,
      status: rejected ? 'rejected' : 'executed',
      requestedAt: new Date().toISOString(),
      operatorId: request.operatorId,
      request,
      result: rejected
        ? {
            code: 'EXECUTION_REJECTED',
            message: 'Execution request rejected by deterministic safety checks',
            rejectedReasons
          }
        : {
            code: 'EXECUTION_ACCEPTED',
            message: 'Execution request accepted with immutable approval and dry-run lineage'
          },
      lineageSnapshot: request.lineage,
      dryRunReference: request.dryRunId,
      approvalReference: request.approvalId
    };

    this.history.push(record);
    return record;
  }

  listHistory(): ReadonlyArray<AuditedExecutionRecord> {
    return this.history;
  }
}

export const auditedOperationalExecutionService = new AuditedOperationalExecutionService();
