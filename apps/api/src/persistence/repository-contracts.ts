export type { RideStatus } from '@lvtransport/shared';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'retrying' | 'abandoned';
export type RecoveryStatus = 'pending' | 'in_progress' | 'resolved' | 'failed';

export type RideRecord = {
  id: string;
  code: string;
  customerName: string;
  pickup: string;
  destination: string;
  scheduledAt: string;
  status: RideStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = { id: string; rideId: string; amount: number; currency: string; status: PaymentStatus; invoiceReference?: string; createdAt: string; updatedAt: string };
export type AuditEvent = { id: string; entityType: string; entityId: string; action: string; actor: string; at: string; metadata?: Record<string, unknown> };
export type MessageEvent = { id: string; rideId: string; channel: string; direction: 'inbound' | 'outbound'; body: string; at: string; metadata?: Record<string, unknown> };
export type NotificationAttempt = { id: string; channel: string; target: string; template: string; status: NotificationStatus; errorMessage?: string; createdAt: string; updatedAt: string };
export type RecoveryEvent = { id: string; scope: string; referenceId: string; reason: string; status: RecoveryStatus; createdAt: string; updatedAt: string; resolvedAt?: string };

export interface RideRepository {
  createRide(ride: RideRecord): Promise<RideRecord>;
  getRideById(id: string): Promise<RideRecord | null>;
  getRideByCode(code: string): Promise<RideRecord | null>;
  updateRideStatus(id: string, status: RideStatus): Promise<RideRecord | null>;
  assignDriver(id: string, driverId: string, driverName: string): Promise<RideRecord | null>;
}

export interface PaymentRepository {
  listPayments(): Promise<PaymentRecord[]>;
  getPaymentById(id: string): Promise<PaymentRecord | null>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentRecord | null>;
  attachInvoiceReference(id: string, invoiceReference: string): Promise<PaymentRecord | null>;
}

export interface AuditRepository { recordAuditEvent(event: AuditEvent): Promise<AuditEvent>; listAuditEvents(): Promise<AuditEvent[]>; }
export interface MessageRepository { createMessageEvent(event: MessageEvent): Promise<MessageEvent>; listMessageEvents(): Promise<MessageEvent[]>; }
export interface NotificationRepository {
  createNotificationAttempt(attempt: NotificationAttempt): Promise<NotificationAttempt>;
  updateNotificationStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<NotificationAttempt | null>;
  listFailedNotifications(): Promise<NotificationAttempt[]>;
}
export interface RecoveryRepository {
  createRecoveryEvent(event: RecoveryEvent): Promise<RecoveryEvent>;
  listRecoveryEvents(): Promise<RecoveryEvent[]>;
  updateRecoveryStatus(id: string, status: RecoveryStatus): Promise<RecoveryEvent | null>;
}
