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
}

export interface MessageRepository {
  createMessageEvent(event: MessageEventRecord): Promise<MessageEventRecord>;
  listMessageEvents(): Promise<MessageEventRecord[]>;
}

export interface NotificationRepository {
  createNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord>;
  updateNotificationStatus(id: string, status: DeliveryStatus, failureReason?: string): Promise<NotificationAttemptRecord | null>;
  listFailedNotifications(): Promise<NotificationAttemptRecord[]>;
}

export interface RecoveryRepository {
  recordRecoveryEvent(event: RecoveryEvent): Promise<RecoveryEvent>;
  listRecoveryEvents(): Promise<RecoveryEvent[]>;
}
