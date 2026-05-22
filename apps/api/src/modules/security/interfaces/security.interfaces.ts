import { ActorRole, ApprovalBoundary, AuditActionType, DenialReasonCode } from '../enums/security.enums';

export interface AuthSessionContext {
  subjectId: string;
  role: ActorRole;
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
  scopes: string[];
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  role: ActorRole;
  action: AuditActionType;
  targetType: string;
  targetId: string;
  correlationId: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface RateLimitPolicy {
  key: string;
  windowSeconds: number;
  maxRequests: number;
  blockDurationSeconds?: number;
}

export interface SecureAdminActionPolicy {
  actionName: string;
  requiresStepUpAuth: boolean;
  requiresReasonCode: boolean;
  dualApprovalThresholdMinor?: number;
}

export interface ApprovalRequirement {
  boundary: ApprovalBoundary;
  minApprovers: number;
  approverRoles: ActorRole[];
}

export interface RoleExecutionPolicy {
  role: ActorRole;
  canExecute: boolean;
  approvalBoundaries: ApprovalBoundary[];
  requiresHumanSupervision: boolean;
}

export interface ExecutionPermissionRequest {
  actorId: string;
  role: ActorRole;
  boundary: ApprovalBoundary;
  requestedApproverRoles: ActorRole[];
  humanSupervised: boolean;
  correlationId: string;
  targetType: string;
  targetId: string;
}

export interface ExecutionPermissionDecision {
  allowed: boolean;
  reasonCode?: DenialReasonCode;
  deterministicKey: string;
  requiredApprovers: ActorRole[];
}

export interface RoleAuditLineageEntry {
  lineageId: string;
  role: ActorRole;
  assignedByActorId: string;
  assignedAt: string;
  assignmentReason: string;
  immutable: true;
}
