export type RideStatus = 'requested' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'retrying';
export type RecoveryStatus = 'open' | 'resolved' | 'failed';

export interface RideRecord {
  id: string;
  code: string;
  customerId: string;
  status: RideStatus;
  assignedDriverId: string | null;
export type RideStatus = string;
export type PaymentStatus = string;

export interface RideRecord {
  id: string;
  rideCode: string | null;
  status: RideStatus;
  payloadJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  rideId: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  invoiceReference: string | null;
  rideId: string | null;
  status: PaymentStatus;
  payloadJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEventRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string | null;
  payload: string | null;
  createdAt: string;
  entityType: string | null;
  entityId: string | null;
  eventType: string;
  payloadJson: string;
  timestamp: string;
}

export interface MessageEventRecord {
  id: string;
  rideId: string;
  channel: string;
  direction: 'inbound' | 'outbound';
  content: string;
  createdAt: string;
  eventType: string;
  payloadJson: string;
  timestamp: string;
}

export interface NotificationAttemptRecord {
  id: string;
*  notificationType: string;
  recipient: string;
  status: NotificationStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  payloadJson: string;
  timestamp: string;
}

export interface RecoveryEventRecord {
  id: string;
  incidentCode: string;
  status: RecoveryStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RideRepository {
  createRide(record: RideRecord): Promise<RideRecord>;
  getRideById(id: string): Promise<RideRecord | null>;
  getRideByCode(code: string): Promise<RideRecord | null>;
  updateRideStatus(id: string, status: RideStatus, updatedAt: string): Promise<RideRecord | null>;
  assignDriver(id: string, driverId: string, updatedAt: string): Promise<RideRecord | null>;
}

export interface PaymentRepository {
  listPayments(rideId?: string): Promise<PaymentRecord[]>;
  getPaymentById(id: string): Promise<PaymentRecord | null>;
  updatePaymentStatus(id: string, status: PaymentStatus, updatedAt: string): Promise<PaymentRecord | null>;
  attachInvoiceReference(id: string, invoiceReference: string, updatedAt: string): Promise<PaymentRecord | null>;
}

export interface AuditRepository {
  recordAuditEvent(event: AuditEventRecord): Promise<AuditEventRecord>;
  listAuditEvents(entityType?: string, entityId?: string): Promise<AuditEventRecord[]>;
}

export interface MessageRepository {
  createMessageEvent(event: MessageEventRecord): Promise<MessageEventRecord>;
  listMessageEvents(rideId?: string): Promise<MessageEventRecord[]>;
}

export interface NotificationRepository {
  createNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord>;
  updateNotificationStatus(id: string, status: NotificationStatus, errorMessage: string | null, updatedAt: string): Promise<NotificationAttemptRecord | null>;
  listFailedNotifications(): Promise<NotificationAttemptRecord[]>;
}

export interface RecoveryRepository {
  createRecoveryEvent(event: RecoveryEventRecord): Promise<RecoveryEventRecord>;
  listRecoveryEvents(status?: RecoveryStatus): Promise<RecoveryEventRecord[]>;
  updateRecoveryStatus(id: string, status: RecoveryStatus, notes: string | null, updatedAt: string): Promise<RecoveryEventRecord | null>;
  status: string;
  payloadJson: string;
  timestamp: string;
}
