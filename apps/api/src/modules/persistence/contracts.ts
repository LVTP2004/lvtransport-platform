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
export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'manual' | 'push' | 'system';
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retry_pending';
export type NotificationStatus = DeliveryStatus | 'retrying' | 'abandoned';
export type RecoveryStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'failed';

export interface RideRecord {
  id: string;
  code?: string;
  rideCode?: string | null;
  bookingId?: string;
  customerId?: string;
  customerName?: string;
  pickup?: string;
  destination?: string;
  scheduledAt?: string;
  status: RideStatus;
  assignedDriverId?: string | null;
  assignedDriverName?: string | null;
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
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  status: PaymentStatus;
  invoiceStatus?: InvoiceStatus;
  invoiceReference?: string | null;
  payloadJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  entityType?: string | null;
  entityId: string;
  action: string;
  actor?: string;
  actorId?: string | null;
  payload?: string | null;
  metadata?: Record<string, unknown>;
  at?: string;
  createdAt?: string;
}

export interface AuditEventRecord {
  id: string;
  entityType: string | null;
  entityId: string | null;
  action?: string;
  actorId?: string | null;
  payload?: string | null;
  eventType?: string;
  payloadJson?: string;
  timestamp?: string;
  createdAt: string;
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
  status?: 'accepted' | 'failed' | 'created' | 'sent';
  failureReason?: string | null;
  eventType?: string;
  payloadJson?: string;
  timestamp?: string;
  createdAt: string;
}

export interface NotificationAttemptRecord {
  id: string;
  bookingId?: string;
  notificationType?: string;
  recipient?: string;
  channel?: NotificationChannel | string;
  status: NotificationStatus;
  failureReason?: string | null;
  errorMessage?: string | null;
  retryCount?: number;
  nextAction?: 'none' | 'manual_retry' | 'system_retry';
  payloadJson?: string;
  timestamp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryEventRecord {
  id: string;
  incidentCode?: string;
  scenario?: string;
  scope?: string;
  referenceId?: string;
  status: RecoveryStatus;
  reason?: string;
  notes?: string | null;
  nextAction?: string;
  payloadJson?: string;
  timestamp?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
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
  listAuditEvents(entityType?: string, entityId?: string): Promise<Array<AuditEvent | AuditEventRecord>>;
}

export interface MessageRepository {
  createMessageEvent(event: MessageEventRecord): Promise<MessageEventRecord>;
  recordMessageEvent(event: MessageEventRecord): Promise<MessageEventRecord>;
  listMessageEvents(rideId?: string): Promise<MessageEventRecord[]>;
}

export interface NotificationRepository {
  createNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord>;
  recordNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord>;
  updateNotificationStatus(id: string, status: NotificationStatus, failureReason?: string | null, updatedAt?: string): Promise<NotificationAttemptRecord | null>;
  listNotificationAttempts(bookingId?: string): Promise<NotificationAttemptRecord[]>;
  listFailedNotifications(): Promise<NotificationAttemptRecord[]>;
}

export interface RecoveryRepository {
  createRecoveryEvent(event: RecoveryEventRecord): Promise<RecoveryEventRecord>;
  recordRecoveryEvent(event: RecoveryEventRecord): Promise<RecoveryEventRecord>;
  listRecoveryEvents(status?: RecoveryStatus): Promise<RecoveryEventRecord[]>;
  updateRecoveryStatus(id: string, status: RecoveryStatus, notes?: string | null, updatedAt?: string): Promise<RecoveryEventRecord | null>;
}
