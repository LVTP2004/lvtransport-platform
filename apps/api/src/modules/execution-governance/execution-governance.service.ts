import { randomUUID } from 'node:crypto';
import {
  DryRunArtifact,
  ExecutionHistoryRecord,
  ExecutionState,
  ExecutionValidationError,
  OperatorApprovalRecord
} from './execution-governance.types.js';

const TERMINAL_STATES: ReadonlySet<ExecutionState> = new Set(['executed', 'rejected', 'blocked']);
const STATE_TRANSITIONS: Readonly<Record<ExecutionState, ReadonlySet<ExecutionState>>> = {
  staged: new Set(['approved']),
  approved: new Set(['dry_run_validated', 'blocked']),
  dry_run_validated: new Set(['execution_requested', 'blocked']),
  execution_requested: new Set(['executed', 'rejected', 'blocked']),
  executed: new Set(),
  rejected: new Set(),
  blocked: new Set()
};

export interface CreateApprovalInput {
  approval_id?: string;
  action_type: string;
  target_entity_type: string;
  target_entity_id: string;
  operator_id: string;
  approval_reason: string;
  dry_run_reference: string;
  correlation_id?: string;
  request_id?: string;
  source_lineage_references: string[];
}

export class ExecutionGovernanceService {
  private readonly approvals = new Map<string, OperatorApprovalRecord>();
  private readonly dryRuns = new Map<string, DryRunArtifact>();
  private readonly executionHistory: ExecutionHistoryRecord[] = [];

  constructor() {
    this.seedFixtureData();
  }

  createApproval(input: CreateApprovalInput): OperatorApprovalRecord {
    const approval: OperatorApprovalRecord = {
      approval_id: input.approval_id ?? randomUUID(),
      action_type: input.action_type,
      target_entity_type: input.target_entity_type,
      target_entity_id: input.target_entity_id,
      operator_id: input.operator_id,
      approval_reason: input.approval_reason,
      approval_timestamp: new Date().toISOString(),
      dry_run_reference: input.dry_run_reference,
      correlation_id: input.correlation_id,
      request_id: input.request_id,
      source_lineage_references: [...input.source_lineage_references],
      execution_status: 'approved'
    };

    this.approvals.set(approval.approval_id, approval);
    return { ...approval, source_lineage_references: [...approval.source_lineage_references] };
  }

  registerDryRun(artifact: DryRunArtifact): DryRunArtifact {
    this.dryRuns.set(artifact.dry_run_reference, {
      ...artifact,
      deterministic_evidence_set: [...artifact.deterministic_evidence_set],
      lineage_references: [...artifact.lineage_references]
    });
    return this.getDryRun(artifact.dry_run_reference)!;
  }

  validateExecution(approvalId: string): { ok: true } | ExecutionValidationError {
    const approval = this.approvals.get(approvalId);
    if (!approval) return this.error('APPROVAL_MISSING', 'Approval record is required before execution.');
    if (!approval.approval_reason.trim()) return this.error('OPERATOR_REASON_ABSENT', 'Approval reason is required.');
    if (!approval.dry_run_reference) return this.error('DRY_RUN_ABSENT', 'Dry-run reference is required.');
    if (!approval.source_lineage_references.length) return this.error('LINEAGE_INCOMPLETE', 'Approval lineage references are required.');

    const dryRun = this.dryRuns.get(approval.dry_run_reference);
    if (!dryRun) return this.error('DRY_RUN_ABSENT', 'Dry-run artifact is required before execution.');
    if (!dryRun.dry_run_timestamp) return this.error('DRY_RUN_ABSENT', 'Dry-run timestamp is required before execution.');
    if (!dryRun.deterministic_evidence_set.length) return this.error('EVIDENCE_MISSING', 'Deterministic evidence set is required.');
    if (!dryRun.lineage_references.length) return this.error('LINEAGE_INCOMPLETE', 'Dry-run lineage references are required.');

    if (!this.isTransitionValid(approval.execution_status, 'dry_run_validated') && approval.execution_status !== 'dry_run_validated') {
      return this.error('INVALID_TRANSITION', `Invalid state transition from ${approval.execution_status} to dry_run_validated.`);
    }

    return { ok: true };
  }

  requestExecution(approvalId: string): { execution: ExecutionHistoryRecord } | ExecutionValidationError {
    const validation = this.validateExecution(approvalId);
    if ('error' in validation) return validation;

    const approval = this.approvals.get(approvalId)!;
    if (TERMINAL_STATES.has(approval.execution_status)) {
      return this.error('INVALID_TRANSITION', `Approval ${approvalId} is in immutable terminal state ${approval.execution_status}.`);
    }

    this.transitionApproval(approval, 'dry_run_validated');
    this.transitionApproval(approval, 'execution_requested');

    const dryRun = this.getDryRun(approval.dry_run_reference)!;
    const history: ExecutionHistoryRecord = {
      execution_id: randomUUID(),
      approval_id: approval.approval_id,
      execution_timestamp: new Date().toISOString(),
      execution_result: 'executed',
      operator_id: approval.operator_id,
      deterministic_evidence_snapshot: [...dryRun.deterministic_evidence_set],
      lineage_snapshot: [...dryRun.lineage_references]
    };

    this.executionHistory.push(history);
    this.transitionApproval(approval, 'executed');
    return { execution: { ...history, deterministic_evidence_snapshot: [...history.deterministic_evidence_snapshot], lineage_snapshot: [...history.lineage_snapshot] } };
  }

  listExecutionHistory(targetEntityType: string, targetEntityId: string): ExecutionHistoryRecord[] {
    const validApprovalIds = [...this.approvals.values()]
      .filter((approval) => approval.target_entity_type === targetEntityType && approval.target_entity_id === targetEntityId)
      .map((approval) => approval.approval_id);

    return this.executionHistory
      .filter((item) => validApprovalIds.includes(item.approval_id))
      .sort((a, b) => a.execution_timestamp.localeCompare(b.execution_timestamp))
      .map((item) => ({ ...item, deterministic_evidence_snapshot: [...item.deterministic_evidence_snapshot], lineage_snapshot: [...item.lineage_snapshot] }));
  }

  getApproval(approvalId: string): OperatorApprovalRecord | undefined {
    const approval = this.approvals.get(approvalId);
    return approval ? { ...approval, source_lineage_references: [...approval.source_lineage_references] } : undefined;
  }

  private getDryRun(dryRunReference: string): DryRunArtifact | undefined {
    const dryRun = this.dryRuns.get(dryRunReference);
    return dryRun
      ? { ...dryRun, deterministic_evidence_set: [...dryRun.deterministic_evidence_set], lineage_references: [...dryRun.lineage_references] }
      : undefined;
  }

  private transitionApproval(approval: OperatorApprovalRecord, nextState: ExecutionState): void {
    if (!this.isTransitionValid(approval.execution_status, nextState)) {
      throw new Error(`Invalid transition from ${approval.execution_status} to ${nextState}`);
    }
    approval.execution_status = nextState;
  }

  private isTransitionValid(current: ExecutionState, next: ExecutionState): boolean {
    return STATE_TRANSITIONS[current].has(next);
  }

  private error(code: ExecutionValidationError['code'], message: string): ExecutionValidationError {
    return { error: 'EXECUTION_VALIDATION_ERROR', code, message };
  }

  private seedFixtureData(): void {
    this.createApproval({
      approval_id: 'test',
      action_type: 'assign_driver',
      target_entity_type: 'ride',
      target_entity_id: 'test',
      operator_id: 'operator:test',
      approval_reason: 'Manual dispatch override approved by operations lead',
      dry_run_reference: 'dry-run:test',
      request_id: 'req:test',
      correlation_id: 'corr:test',
      source_lineage_references: ['booking:test', 'dispatch-policy:v3']
    });

    this.registerDryRun({
      dry_run_reference: 'dry-run:test',
      dry_run_timestamp: new Date().toISOString(),
      deterministic_evidence_set: ['policy-hash:abc123', 'route-hash:def456'],
      lineage_references: ['booking:test', 'driver:test']
    });
  }
}

export const executionGovernanceService = new ExecutionGovernanceService();
