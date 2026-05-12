export enum ActorRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin',
  OPS = 'ops',
}

export enum AuditActionType {
  LOGIN = 'login',
  PAYMENT_UPDATE = 'payment_update',
  REFUND_APPROVAL = 'refund_approval',
  ADMIN_OVERRIDE = 'admin_override',
}
