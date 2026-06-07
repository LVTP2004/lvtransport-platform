export enum ActorRole {
  FOUNDER = 'founder',
  OPERATOR = 'operator',
  AUDITOR = 'auditor',
  OBSERVER = 'observer',
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin',
  OPS = 'ops',
}

export enum AuditActionType {
  ROLE_ASSIGNED = 'role_assigned',
  EXECUTION_REQUESTED = 'execution_requested',
  EXECUTION_APPROVED = 'execution_approved',
  EXECUTION_DENIED = 'execution_denied',
  EXECUTION_COMPLETED = 'execution_completed',
  LOGIN = 'login',
  PAYMENT_UPDATE = 'payment_update',
  REFUND_APPROVAL = 'refund_approval',
  ADMIN_OVERRIDE = 'admin_override',
}

export enum ApprovalBoundary {
  PLATFORM_CONFIGURATION = 'platform_configuration',
  FINANCIAL_DISBURSEMENT = 'financial_disbursement',
  CUSTOMER_DATA_EXPORT = 'customer_data_export',
  PRODUCTION_EXECUTION = 'production_execution',
}

export enum DenialReasonCode {
  UNKNOWN_ROLE = 'UNKNOWN_ROLE',
  OUTSIDE_APPROVAL_BOUNDARY = 'OUTSIDE_APPROVAL_BOUNDARY',
  MISSING_REQUIRED_APPROVERS = 'MISSING_REQUIRED_APPROVERS',
  HUMAN_SUPERVISION_REQUIRED = 'HUMAN_SUPERVISION_REQUIRED',
  INSUFFICIENT_EXECUTION_PERMISSION = 'INSUFFICIENT_EXECUTION_PERMISSION',
}
