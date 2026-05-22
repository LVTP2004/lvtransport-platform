export type PersistenceActorRole = 'customer' | 'driver' | 'admin' | 'founder' | 'system';

export type RideStatus = 'created' | 'assigned' | 'driver_en_route' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
export type InvoiceStatus = 'missing' | 'pending' | 'issued' | 'failed';
export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'manual';
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retry_pending';

export interface RideRecord {
  id: string;
  bookingId: string;
  rideCode: string;
  status: RideStatus;
  assignedDriverId: string | null;
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
  bookingId: string;
  subtotal: number;
  btwPercent: number;
  btwAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  invoiceReference: string | null;
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

export interface AuditEvent {
  id: string;
  scope: 'admin_change' | 'driver_action' | 'ride_lifecycle' | 'payment_event' | 'moniride_event';
  entityId: string;
  actorRole: PersistenceActorRole;
  action: string;
  reason: string | null;
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
  bookingId: string;
  source: 'driver' | 'customer' | 'moni_assistant' | 'fallback';
  body: string;
  status: 'accepted' | 'failed';
  failureReason: string | null;
  createdAt: string;
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
  bookingId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  failureReason: string | null;
  retryCount: number;
  nextAction: 'none' | 'manual_retry' | 'system_retry';
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryEvent {
  id: string;
  scenario: 'booking_notification_failed' | 'driver_tracking_unavailable' | 'payment_invoice_missing' | 'admin_publish_failed' | 'moniride_fallback_triggered';
  status: 'open' | 'resolved';
  reason: string;
  nextAction: string;
  timestamp: string;
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
  updateRideStatus(id: string, status: RideStatus): Promise<RideRecord | null>;
  assignDriver(id: string, driverId: string): Promise<RideRecord | null>;
}

export interface PaymentRepository {
  listPayments(): Promise<PaymentRecord[]>;
  getPaymentById(id: string): Promise<PaymentRecord | null>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentRecord | null>;
  attachInvoiceReference(id: string, invoiceReference: string): Promise<PaymentRecord | null>;
}

export interface AuditRepository {
  recordAuditEvent(event: AuditEvent): Promise<void>;
  listAuditEvents(): Promise<AuditEvent[]>;
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
  listMessageEvents(): Promise<MessageEventRecord[]>;
  listMessageEvents(rideId?: string): Promise<MessageEventRecord[]>;
}

export interface NotificationRepository {
  createNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord>;
  updateNotificationStatus(id: string, status: DeliveryStatus, failureReason?: string): Promise<NotificationAttemptRecord | null>;
  updateNotificationStatus(id: string, status: NotificationStatus, errorMessage: string | null, updatedAt: string): Promise<NotificationAttemptRecord | null>;
  listFailedNotifications(): Promise<NotificationAttemptRecord[]>;
}

export interface RecoveryRepository {
  recordRecoveryEvent(event: RecoveryEvent): Promise<RecoveryEvent>;
  listRecoveryEvents(): Promise<RecoveryEvent[]>;
  createRecoveryEvent(event: RecoveryEventRecord): Promise<RecoveryEventRecord>;
  listRecoveryEvents(status?: RecoveryStatus): Promise<RecoveryEventRecord[]>;
  updateRecoveryStatus(id: string, status: RecoveryStatus, notes: string | null, updatedAt: string): Promise<RecoveryEventRecord | null>;
  status: string;
  payloadJson: string;
  timestamp: string;
}
