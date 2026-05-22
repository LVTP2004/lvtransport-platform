import type {
  AuditEvent,
  AuditRepository,
  DeliveryStatus,
  MessageEventRecord,
  MessageRepository,
  NotificationAttemptRecord,
  NotificationRepository,
  PaymentRecord,
  PaymentRepository,
  PaymentStatus,
  RecoveryEvent,
  RecoveryRepository,
  RideRecord,
  RideRepository,
  RideStatus
} from './contracts.js';

class EmptyPersistenceRepository
  implements RideRepository, PaymentRepository, AuditRepository, MessageRepository, NotificationRepository, RecoveryRepository {
  async createRide(record: RideRecord): Promise<RideRecord> { return record; }
  async getRideById(_id: string): Promise<RideRecord | null> { return null; }
  async getRideByCode(_code: string): Promise<RideRecord | null> { return null; }
  async updateRideStatus(_id: string, _status: RideStatus): Promise<RideRecord | null> { return null; }
  async assignDriver(_id: string, _driverId: string): Promise<RideRecord | null> { return null; }

  async listPayments(): Promise<PaymentRecord[]> { return []; }
  async getPaymentById(_id: string): Promise<PaymentRecord | null> { return null; }
  async updatePaymentStatus(_id: string, _status: PaymentStatus): Promise<PaymentRecord | null> { return null; }
  async attachInvoiceReference(_id: string, _invoiceReference: string): Promise<PaymentRecord | null> { return null; }

  async recordAuditEvent(_event: AuditEvent): Promise<void> {}
  async listAuditEvents(): Promise<AuditEvent[]> { return []; }

  async createMessageEvent(event: MessageEventRecord): Promise<MessageEventRecord> { return event; }
  async listMessageEvents(): Promise<MessageEventRecord[]> { return []; }

  async createNotificationAttempt(event: NotificationAttemptRecord): Promise<NotificationAttemptRecord> { return event; }
  async updateNotificationStatus(_id: string, _status: DeliveryStatus, _failureReason?: string): Promise<NotificationAttemptRecord | null> { return null; }
  async listFailedNotifications(): Promise<NotificationAttemptRecord[]> { return []; }

  async recordRecoveryEvent(event: RecoveryEvent): Promise<RecoveryEvent> { return event; }
  async listRecoveryEvents(): Promise<RecoveryEvent[]> { return []; }
}

export const emptyPersistenceRepository = new EmptyPersistenceRepository();
