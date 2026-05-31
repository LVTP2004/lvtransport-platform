export type PersistenceActorRole = 'customer' | 'driver' | 'admin' | 'founder' | 'system';

export type RideStatus =
  | 'requested'
  | 'created'
  | 'assigned'
  | 'driver_en_route'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type InvoiceStatus = 'missing' | 'pending' | 'issued' | 'failed';

export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'manual' | 'push';

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retry_pending';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'retrying';

export type RecoveryStatus = 'open' | 'resolved' | 'failed';

export interface RideRecord {
  id: string;
  bookingId?: string;
  code?: string;
  rideCode?: string | null;
  customerId?: string;
  status: RideStatus;
  assignedDriverId: string | null;
  payloadJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId?: string;
  rideId: string | null;
  subtotal?: number;
  btwPercent?: number;
  btwAmount?: number;
  total?: number;
  amountMinor?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  status: PaymentStatus;
  invoiceStatus?: InvoiceStatus;
  invoiceReference: string | null;
  payloadJson?: string;
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
  createdAt?: string;
}

export interface AuditEventRecord {
  id: string;
  entityType: string | null;
  entityId: string | null;
  action: string;
  actorId: string | null;
  payload: string | null;
  createdAt: string;
  eventType?: string;
  payloadJson?: string;
  timestamp?: string;
}

export interface MessageEventRecord {
  id: string;
  bookingId?: string;
  rideId?: string;
  source?: 'driver' | 'customer' | 'moni_assistant' | 'fallback';
  channel?: string;
  direction?: 'inbound' | 'outbound';
  body?: string;
  content?: string;
  status: 'accepted' | 'failed' | string;
  failureReason?: string | null;
  eventType?: string;
  payloadJson?: string;
  createdAt: string;
  timestamp?: string;
}

export interface NotificationAttemptRecord {
  id: string;
  bookingId?: string;
  notificationType?: string;
  recipient?: string;
  channel: NotificationChannel;
  status: DeliveryStatus | NotificationStatus | string;
  failureReason?: string | null;
  errorMessage?: string | null;
  retryCount?: number;
  nextAction?: 'none' | 'manual_retry' | 'system_retry';
  payloadJson?: string;
  createdAt: string;
  updatedAt?: string;
  timestamp?: string;
}

export interface RecoveryEvent {
  id: string;
  scenario:
    | 'booking_notification_failed'
    | 'driver_tracking_unavailable'
    | 'payment_invoice_missing'
    | 'admin_publish_failed'
    | 'moniride_fallback_triggered';
  status: 'open' | 'resolved';
  reason: string;
  nextAction: string;
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
  updateRideStatus(id: string, status: RideStatus, updatedAt?: string): Promise<RideRecord | null>;
  assignDriver(id: string, driverId: string, updatedAt?: string): Promise<RideRecord | null>;
}

export interface PaymentRepository {
  listPayments(rideId?: string): Promise<PaymentRecord[]>;
  getPaymentById(id: string): Promise<PaymentRecord | null>;
  updatePaymentStatus(id: string, status: PaymentStatus, updatedAt?: string): Promise<PaymentRecord | null>;
  attachInvoiceReference(id: string, invoiceReference: string, updatedAt?: string): Promise<PaymentRecord | null>;
}

export interface AuditRepository {
  recordAuditEvent(event: AuditEvent | AuditEventRecord): Promise<void | AuditEventRecord>;
  listAuditEvents(): Promise<Array<AuditEvent | AuditEventRecord>>;
}

export interface MessageRepository {
  recordMessageEvent(event: MessageEventRecord): Promise<MessageEventRecord>;
  listMessageEvents(rideId?: string): Promise<MessageEventRecord[]>;
}

export interface NotificationRepository {
  recordNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord>;
  listNotificationAttempts(bookingId?: string): Promise<NotificationAttemptRecord[]>;
}

export interface RecoveryRepository {
  recordRecoveryEvent(event: RecoveryEventRecord): Promise<RecoveryEventRecord>;
  listRecoveryEvents(): Promise<RecoveryEventRecord[]>;
}
