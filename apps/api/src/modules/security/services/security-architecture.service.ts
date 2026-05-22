import { RecordAuditEntryDto, RecordFraudSignalDto } from '../dto/security.dto';
import { securityArchitectureConfig } from '../config/security.config';
import { ActorRole, ApprovalBoundary, AuditActionType, DenialReasonCode } from '../enums/security.enums';
import { ExecutionPermissionDecision, ExecutionPermissionRequest, RoleAuditLineageEntry } from '../interfaces/security.interfaces';

export class SecurityArchitectureService {
  private readonly roleAuditLineage: RoleAuditLineageEntry[] = [];

  recordFraudSignal(dto: RecordFraudSignalDto) {
    return {
      implementation: 'placeholder',
      queuedForAnalysis: true,
      normalizedSignal: dto.signalType,
      source: dto.source,
    };
  }

  recordAuditEntry(dto: RecordAuditEntryDto) {
    return {
      implementation: 'placeholder',
      stored: true,
      action: dto.action,
    };
  }

  assignOperationalRoleLineage(role: ActorRole, assignedByActorId: string, assignmentReason: string): RoleAuditLineageEntry {
    const entry: RoleAuditLineageEntry = {
      lineageId: `lineage:${role}:${assignedByActorId}:${this.roleAuditLineage.length + 1}`,
      role,
      assignedByActorId,
      assignedAt: new Date().toISOString(),
      assignmentReason,
      immutable: true,
    };
    this.roleAuditLineage.push(entry);
    return entry;
  }

  getRoleAuditLineage(): readonly RoleAuditLineageEntry[] {
    return this.roleAuditLineage;
  }

  evaluateExecutionPermission(request: ExecutionPermissionRequest): ExecutionPermissionDecision {
    const deterministicKey = `${request.role}|${request.boundary}|${request.requestedApproverRoles.slice().sort().join(',')}|${request.humanSupervised}`;
    const rolePolicies = securityArchitectureConfig.governance.roleExecutionPolicies as Partial<
      Record<ActorRole, { canExecute: boolean; approvalBoundaries: readonly ApprovalBoundary[]; requiresHumanSupervision: boolean }>
    >;
    const rolePolicy = rolePolicies[request.role];

    if (!rolePolicy) {
      return { allowed: false, reasonCode: DenialReasonCode.UNKNOWN_ROLE, deterministicKey, requiredApprovers: [] };
    }

    if (!rolePolicy.canExecute) {
      return { allowed: false, reasonCode: DenialReasonCode.INSUFFICIENT_EXECUTION_PERMISSION, deterministicKey, requiredApprovers: [] };
    }

    if (!rolePolicy.approvalBoundaries.includes(request.boundary)) {
      return { allowed: false, reasonCode: DenialReasonCode.OUTSIDE_APPROVAL_BOUNDARY, deterministicKey, requiredApprovers: [] };
    }

    const requirement = securityArchitectureConfig.governance.approvalRequirements[request.boundary as ApprovalBoundary];
    const allowedApproverRoles = requirement.approverRoles as readonly ActorRole[];
    const presentApprovers = request.requestedApproverRoles.filter((role) => allowedApproverRoles.includes(role));
    if (presentApprovers.length < requirement.minApprovers) {
      return {
        allowed: false,
        reasonCode: DenialReasonCode.MISSING_REQUIRED_APPROVERS,
        deterministicKey,
        requiredApprovers: [...requirement.approverRoles],
      };
    }

    if (rolePolicy.requiresHumanSupervision && !request.humanSupervised) {
      return { allowed: false, reasonCode: DenialReasonCode.HUMAN_SUPERVISION_REQUIRED, deterministicKey, requiredApprovers: [...requirement.approverRoles] };
    }

    return {
      allowed: true,
      deterministicKey,
      requiredApprovers: [...requirement.approverRoles],
    };
  }

  recordExecutionDecision(request: ExecutionPermissionRequest, decision: ExecutionPermissionDecision) {
    const action = decision.allowed ? AuditActionType.EXECUTION_APPROVED : AuditActionType.EXECUTION_DENIED;
    return this.recordAuditEntry({
      action,
      actorId: request.actorId,
      targetType: request.targetType,
      targetId: request.targetId,
      reason: decision.reasonCode ?? 'approved',
    });
  }
}
