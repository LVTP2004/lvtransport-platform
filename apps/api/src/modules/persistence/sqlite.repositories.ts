import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

const dbPath = resolve(process.cwd(), process.env.LVTRANSPORT_DB_PATH ?? '.data/lvtransport.sqlite');

mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS rides (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  pickup TEXT,
  destination TEXT,
  status TEXT,
  assigned_driver_id TEXT,
  assigned_driver_name TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  ride_id TEXT,
  amount_minor INTEGER,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  invoice_reference TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT,
  entity_id TEXT,
  action TEXT,
  actor_id TEXT,
  payload TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS message_events (
  id TEXT PRIMARY KEY,
  ride_id TEXT,
  channel TEXT,
  direction TEXT,
  content TEXT,
  status TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS notification_attempts (
  id TEXT PRIMARY KEY,
  notification_type TEXT,
  recipient TEXT,
  channel TEXT,
  status TEXT,
  error_message TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS recovery_events (
  id TEXT PRIMARY KEY,
  incident_code TEXT,
  status TEXT,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);
`);

const now = () => new Date().toISOString();

const row = (statement: string, ...params: unknown[]): any | null =>
  db.prepare(statement).get(...params) as any | null;

const rows = (statement: string, ...params: unknown[]): any[] =>
  db.prepare(statement).all(...params) as any[];

const run = (statement: string, ...params: unknown[]) =>
  db.prepare(statement).run(...params);

const json = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value ?? {});

const mapRide = (r: any) => ({
  id: r.id,
  code: r.code,
  customerId: r.customer_id,
  customerName: r.customer_name,
  pickup: r.pickup,
  destination: r.destination,
  status: r.status,
  assignedDriverId: r.assigned_driver_id ?? undefined,
  assignedDriverName: r.assigned_driver_name ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

const mapPayment = (r: any) => ({
  id: r.id,
  rideId: r.ride_id,
  amountMinor: r.amount_minor ?? r.amount ?? 0,
  amount: r.amount ?? r.amount_minor ?? 0,
  currency: r.currency ?? 'EUR',
  status: r.status,
  invoiceReference: r.invoice_reference ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

const mapAudit = (r: any) => ({
  id: r.id,
  entityType: r.entity_type,
  entityId: r.entity_id,
  action: r.action,
  actorId: r.actor_id ?? undefined,
  payload: r.payload ? JSON.parse(r.payload) : undefined,
  createdAt: r.created_at
});

const mapMessage = (r: any) => ({
  id: r.id,
  rideId: r.ride_id,
  channel: r.channel ?? 'system',
  direction: r.direction ?? 'outbound',
  content: r.content ?? '',
  status: r.status ?? 'created',
  createdAt: r.created_at
});

const mapNotification = (r: any) => ({
  id: r.id,
  notificationType: r.notification_type,
  recipient: r.recipient,
  channel: r.channel ?? 'system',
  status: r.status,
  errorMessage: r.error_message ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

const mapRecovery = (r: any) => ({
  id: r.id,
  incidentCode: r.incident_code,
  status: r.status,
  notes: r.notes ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

export const rideRepository = {
  async createRide(ride: any) {
    const createdAt = ride.createdAt ?? now();
    const updatedAt = ride.updatedAt ?? createdAt;
    run(
      `INSERT OR REPLACE INTO rides
      (id, code, customer_id, customer_name, pickup, destination, status, assigned_driver_id, assigned_driver_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ride.id,
      ride.code,
      ride.customerId ?? ride.customer_id ?? '',
      ride.customerName ?? ride.customer_name ?? '',
      ride.pickup ?? '',
      ride.destination ?? '',
      ride.status ?? 'pending',
      ride.assignedDriverId ?? null,
      ride.assignedDriverName ?? null,
      createdAt,
      updatedAt
    );
    return { ...ride, createdAt, updatedAt };
  },

  async getRideById(id: string) {
    const r = row(`SELECT * FROM rides WHERE id = ?`, id);
    return r ? mapRide(r) : null;
  },

  async getRideByCode(code: string) {
    const r = row(`SELECT * FROM rides WHERE code = ?`, code);
    return r ? mapRide(r) : null;
  },

  async updateRideStatus(id: string, status: string) {
    const updatedAt = now();
    run(`UPDATE rides SET status = ?, updated_at = ? WHERE id = ?`, status, updatedAt, id);
    return this.getRideById(id);
  },

  async assignDriver(id: string, driverId: string, driverName = '') {
    const updatedAt = now();
    run(
      `UPDATE rides SET assigned_driver_id = ?, assigned_driver_name = ?, status = ?, updated_at = ? WHERE id = ?`,
      driverId,
      driverName,
      'assigned',
      updatedAt,
      id
    );
    return this.getRideById(id);
  }
};

export const paymentRepository = {
  async createPayment(payment: any) {
    const createdAt = payment.createdAt ?? now();
    const updatedAt = payment.updatedAt ?? createdAt;
    run(
      `INSERT OR REPLACE INTO payments
      (id, ride_id, amount_minor, amount, currency, status, invoice_reference, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payment.id,
      payment.rideId,
      payment.amountMinor ?? payment.amount ?? 0,
      payment.amount ?? payment.amountMinor ?? 0,
      payment.currency ?? 'EUR',
      payment.status ?? 'pending',
      payment.invoiceReference ?? null,
      createdAt,
      updatedAt
    );
    return { ...payment, createdAt, updatedAt };
  },

  async listPayments() {
    return rows(`SELECT * FROM payments`).map(mapPayment);
  },

  async getPaymentById(id: string) {
    const r = row(`SELECT * FROM payments WHERE id = ?`, id);
    return r ? mapPayment(r) : null;
  },

  async updatePaymentStatus(id: string, status: string) {
    const updatedAt = now();
    run(`UPDATE payments SET status = ?, updated_at = ? WHERE id = ?`, status, updatedAt, id);
    return this.getPaymentById(id);
  },

  async attachInvoiceReference(id: string, invoiceReference: string) {
    const updatedAt = now();
    run(`UPDATE payments SET invoice_reference = ?, updated_at = ? WHERE id = ?`, invoiceReference, updatedAt, id);
    return this.getPaymentById(id);
  }
};

export const auditRepository = {
  async recordAuditEvent(event: any) {
    const createdAt = event.createdAt ?? event.at ?? now();
    const id = event.id ?? randomUUID();
    run(
      `INSERT OR REPLACE INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      event.entityType ?? event.entity_type ?? 'system',
      event.entityId ?? event.entity_id ?? 'unknown',
      event.action ?? event.type ?? 'event',
      event.actorId ?? event.actor_id ?? null,
      json(event.payload ?? event.data ?? {}),
      createdAt
    );
    return { ...event, id, createdAt };
  },

  async listAuditEvents() {
    return rows(`SELECT * FROM audit_events ORDER BY created_at DESC`).map(mapAudit);
  }
};

export const messageRepository = {
  async recordMessageEvent(event: any) {
    const id = event.id ?? randomUUID();
    const createdAt = event.createdAt ?? event.at ?? now();
    run(
      `INSERT OR REPLACE INTO message_events (id, ride_id, channel, direction, content, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      event.rideId ?? event.ride_id ?? event.bookingId ?? '',
      event.channel ?? 'system',
      event.direction ?? 'outbound',
      event.content ?? event.body ?? '',
      event.status ?? 'created',
      createdAt
    );
    return { ...event, id, createdAt };
  },

  async listMessageEvents() {
    return rows(`SELECT * FROM message_events ORDER BY created_at DESC`).map(mapMessage);
  }
};

export const notificationRepository = {
  async recordNotificationAttempt(attempt: any) {
    const id = attempt.id ?? randomUUID();
    const createdAt = attempt.createdAt ?? now();
    const updatedAt = attempt.updatedAt ?? createdAt;
    run(
      `INSERT OR REPLACE INTO notification_attempts
      (id, notification_type, recipient, channel, status, error_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      attempt.notificationType ?? attempt.type ?? 'notification',
      attempt.recipient ?? attempt.recipientId ?? '',
      attempt.channel ?? 'system',
      attempt.status ?? 'queued',
      attempt.errorMessage ?? null,
      createdAt,
      updatedAt
    );
    return { ...attempt, id, createdAt, updatedAt };
  },

  async updateNotificationStatus(id: string, status: string, errorMessage?: string) {
    const updatedAt = now();
    run(
      `UPDATE notification_attempts SET status = ?, error_message = ?, updated_at = ? WHERE id = ?`,
      status,
      errorMessage ?? null,
      updatedAt,
      id
    );
    const r = row(`SELECT * FROM notification_attempts WHERE id = ?`, id);
    return r ? mapNotification(r) : null;
  },

  async listFailedNotifications() {
    return rows(`SELECT * FROM notification_attempts WHERE status = ?`, 'failed').map(mapNotification);
  }
};

export const recoveryRepository = {
  async createRecoveryEvent(event: any) {
    const id = event.id ?? randomUUID();
    const createdAt = event.createdAt ?? now();
    const updatedAt = event.updatedAt ?? createdAt;
    run(
      `INSERT OR REPLACE INTO recovery_events (id, incident_code, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      event.incidentCode ?? event.incident_code ?? 'incident',
      event.status ?? 'open',
      event.notes ?? null,
      createdAt,
      updatedAt
    );
    return { ...event, id, createdAt, updatedAt };
  },

  async listRecoveryEvents() {
    return rows(`SELECT * FROM recovery_events ORDER BY created_at DESC`).map(mapRecovery);
  },

  async updateRecoveryStatus(id: string, status: string, notes?: string) {
    const updatedAt = now();
    run(`UPDATE recovery_events SET status = ?, notes = ?, updated_at = ? WHERE id = ?`, status, notes ?? null, updatedAt, id);
    const r = row(`SELECT * FROM recovery_events WHERE id = ?`, id);
    return r ? mapRecovery(r) : null;
  }
};

export const persistenceRepositories = {
  rides: rideRepository,
  payments: paymentRepository,
  audit: auditRepository,
  messages: messageRepository,
  notifications: notificationRepository,
  recovery: recoveryRepository
};

export const sqliteRepositories = persistenceRepositories;

export default persistenceRepositories;
