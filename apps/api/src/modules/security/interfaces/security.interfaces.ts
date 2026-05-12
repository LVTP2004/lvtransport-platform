import { ActorRole, AuditActionType } from '../enums/security.enums';

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
