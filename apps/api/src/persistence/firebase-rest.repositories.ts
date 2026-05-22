import type {
  AuditEvent,
  AuditRepository,
  MessageEvent,
  MessageRepository,
  NotificationAttempt,
  NotificationRepository,
  NotificationStatus,
  PaymentRecord,
  PaymentRepository,
  PaymentStatus,
  RecoveryEvent,
  RecoveryRepository,
  RecoveryStatus,
  RideRecord,
  RideRepository,
  RideStatus,
} from './repository-contracts.js';

type FirebaseRoot = {
  rides?: Record<string, RideRecord>;
  payments?: Record<string, PaymentRecord>;
  audit_events?: Record<string, AuditEvent>;
  message_events?: Record<string, MessageEvent>;
  notification_attempts?: Record<string, NotificationAttempt>;
  recovery_events?: Record<string, RecoveryEvent>;
};

const requiredEnv = ['FIREBASE_DATABASE_URL'] as const;

const requireDbUrl = () => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Persistence unavailable: missing env ${missing.join(', ')}`);
  return process.env.FIREBASE_DATABASE_URL as string;
};

const dbFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const base = requireDbUrl().replace(/\/$/, '');
  const response = await fetch(`${base}/${path}.json`, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`Persistence operation failed (${response.status})`);
  return response.json() as Promise<T>;
};

const upsertAtPath = async <T>(path: string, record: T) => {
  await dbFetch(path, { method: 'PUT', body: JSON.stringify(record) });
  return record;
};

const updateAtPath = async <T extends Record<string, unknown>>(path: string, patch: Partial<T>): Promise<T | null> => {
  const current = await dbFetch<T | null>(path);
  if (!current) return null;
  const next = { ...current, ...patch } as T;
  await upsertAtPath(path, next);
  return next;
};

class FirebaseRestRideRepository implements RideRepository {
  async createRide(ride: RideRecord): Promise<RideRecord> { return upsertAtPath(`rides/${ride.id}`, ride); }
  async getRideById(id: string): Promise<RideRecord | null> { return dbFetch<RideRecord | null>(`rides/${id}`); }
  async getRideByCode(code: string): Promise<RideRecord | null> {
    const rides = await dbFetch<Record<string, RideRecord> | null>('rides');
    if (!rides) return null;
    return Object.values(rides).find((ride) => ride.code === code) ?? null;
  }
  async updateRideStatus(id: string, status: RideStatus): Promise<RideRecord | null> {
    return updateAtPath<RideRecord>(`rides/${id}`, { status, updatedAt: new Date().toISOString() });
  }
  async assignDriver(id: string, driverId: string, driverName: string): Promise<RideRecord | null> {
    return updateAtPath<RideRecord>(`rides/${id}`, { assignedDriverId: driverId, assignedDriverName: driverName, status: 'assigned', updatedAt: new Date().toISOString() });
  }
}

class FirebaseRestPaymentRepository implements PaymentRepository {
  async listPayments(): Promise<PaymentRecord[]> { const payments = await dbFetch<Record<string, PaymentRecord> | null>('payments'); return Object.values(payments ?? {}); }
  async getPaymentById(id: string): Promise<PaymentRecord | null> { return dbFetch<PaymentRecord | null>(`payments/${id}`); }
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentRecord | null> { return updateAtPath<PaymentRecord>(`payments/${id}`, { status, updatedAt: new Date().toISOString() }); }
  async attachInvoiceReference(id: string, invoiceReference: string): Promise<PaymentRecord | null> { return updateAtPath<PaymentRecord>(`payments/${id}`, { invoiceReference, updatedAt: new Date().toISOString() }); }
}

class FirebaseRestAuditRepository implements AuditRepository {
  async recordAuditEvent(event: AuditEvent): Promise<AuditEvent> { return upsertAtPath(`audit_events/${event.id}`, event); }
  async listAuditEvents(): Promise<AuditEvent[]> { const events = await dbFetch<Record<string, AuditEvent> | null>('audit_events'); return Object.values(events ?? {}); }
}
class FirebaseRestMessageRepository implements MessageRepository {
  async createMessageEvent(event: MessageEvent): Promise<MessageEvent> { return upsertAtPath(`message_events/${event.id}`, event); }
  async listMessageEvents(): Promise<MessageEvent[]> { const events = await dbFetch<Record<string, MessageEvent> | null>('message_events'); return Object.values(events ?? {}); }
}
class FirebaseRestNotificationRepository implements NotificationRepository {
  async createNotificationAttempt(attempt: NotificationAttempt): Promise<NotificationAttempt> { return upsertAtPath(`notification_attempts/${attempt.id}`, attempt); }
  async updateNotificationStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<NotificationAttempt | null> {
    return updateAtPath<NotificationAttempt>(`notification_attempts/${id}`, { status, errorMessage, updatedAt: new Date().toISOString() });
  }
  async listFailedNotifications(): Promise<NotificationAttempt[]> {
    const all = await dbFetch<Record<string, NotificationAttempt> | null>('notification_attempts');
    return Object.values(all ?? {}).filter((attempt) => attempt.status === 'failed');
  }
}
class FirebaseRestRecoveryRepository implements RecoveryRepository {
  async createRecoveryEvent(event: RecoveryEvent): Promise<RecoveryEvent> { return upsertAtPath(`recovery_events/${event.id}`, event); }
  async listRecoveryEvents(): Promise<RecoveryEvent[]> { const all = await dbFetch<Record<string, RecoveryEvent> | null>('recovery_events'); return Object.values(all ?? {}); }
  async updateRecoveryStatus(id: string, status: RecoveryStatus): Promise<RecoveryEvent | null> { return updateAtPath<RecoveryEvent>(`recovery_events/${id}`, { status, updatedAt: new Date().toISOString(), resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined }); }
}

export const persistenceRepositories = {
  rides: new FirebaseRestRideRepository(),
  payments: new FirebaseRestPaymentRepository(),
  audit: new FirebaseRestAuditRepository(),
  messages: new FirebaseRestMessageRepository(),
  notifications: new FirebaseRestNotificationRepository(),
  recovery: new FirebaseRestRecoveryRepository(),
};

export type PersistenceRepositories = typeof persistenceRepositories;
