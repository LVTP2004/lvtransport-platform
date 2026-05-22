export type ExecutionState =
  | 'staged'
  | 'approved'
  | 'dry_run_validated'
  | 'execution_requested'
  | 'executed'
  | 'rejected'
  | 'blocked';

export type ExecutionResult = 'executed' | 'rejected' | 'blocked';

export interface OperatorApprovalRecord {
  approval_id: string;
  action_type: string;
  target_entity_type: string;
  target_entity_id: string;
  operator_id: string;
  approval_reason: string;
  approval_timestamp: string;
  dry_run_reference: string;
  correlation_id?: string;
  request_id?: string;
  source_lineage_references: string[];
  execution_status: ExecutionState;
}

export interface DryRunArtifact {
  dry_run_reference: string;
  dry_run_timestamp: string;
  deterministic_evidence_set: string[];
  lineage_references: string[];
}

export interface ExecutionHistoryRecord {
  execution_id: string;
  approval_id: string;
  execution_timestamp: string;
  execution_result: ExecutionResult;
  operator_id: string;
  deterministic_evidence_snapshot: string[];
  lineage_snapshot: string[];
}

export interface ExecutionValidationError {
  error: 'EXECUTION_VALIDATION_ERROR';
  code:
    | 'APPROVAL_MISSING'
    | 'APPROVAL_INCOMPLETE'
    | 'DRY_RUN_ABSENT'
    | 'EVIDENCE_MISSING'
    | 'LINEAGE_INCOMPLETE'
    | 'INVALID_TRANSITION'
    | 'OPERATOR_REASON_ABSENT';
  message: string;
}
