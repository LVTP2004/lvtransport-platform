import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { logger } from '../../utils/logger.js';
import type {
  AuditEventRecord,
  AuditRepository,
  MessageEventRecord,
  MessageRepository,
  NotificationAttemptRecord,
  NotificationRepository,
  NotificationStatus,
  PaymentRecord,
  PaymentRepository,
  PaymentStatus,
  RecoveryEventRecord,
  RecoveryRepository,
  RecoveryStatus,
  RideRecord,
  RideRepository,
  RideStatus,
} from './contracts.js';

const dbPath = resolve(process.cwd(), process.env.LVTRANSPORT_DB_PATH ?? '.data/lvtransport.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
CREATE TABLE IF NOT EXISTS rides (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  assigned_driver_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  ride_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  invoice_reference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  payload TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS message_events (
  id TEXT PRIMARY KEY,
  ride_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notification_attempts (
  id TEXT PRIMARY KEY,
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS recovery_events (
  id TEXT PRIMARY KEY,
  incident_code TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`);

const safe = <T>(operation: () => T, message: string): T => {
  try { return operation(); } catch (error) { logger.error(message, error); throw new Error('Persistence operation failed'); }
};

const mapRide = (row: any): RideRecord => ({ id: row.id, code: row.code, customerId: row.customer_id, status: row.status as RideStatus, assignedDriverId: row.assigned_driver_id, createdAt: row.created_at, updatedAt: row.updated_at });
const mapPayment = (row: any): PaymentRecord => ({ id: row.id, rideId: row.ride_id, amountMinor: row.amount_minor, currency: row.currency, status: row.status as PaymentStatus, invoiceReference: row.invoice_reference, createdAt: row.created_at, updatedAt: row.updated_at });
const mapAudit = (row: any): AuditEventRecord => ({ id: row.id, entityType: row.entity_type, entityId: row.entity_id, action: row.action, actorId: row.actor_id, payload: row.payload, createdAt: row.created_at });
const mapMessage = (row: any): MessageEventRecord => ({ id: row.id, rideId: row.ride_id, channel: row.channel, direction: row.direction, content: row.content, createdAt: row.created_at });
const mapNotification = (row: any): NotificationAttemptRecord => ({ id: row.id, notificationType: row.notification_type, recipient: row.recipient, status: row.status as NotificationStatus, errorMessage: row.error_message, createdAt: row.created_at, updatedAt: row.updated_at });
const mapRecovery = (row: any): RecoveryEventRecord => ({ id: row.id, incidentCode: row.incident_code, status: row.status as RecoveryStatus, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at });

export const rideRepository: RideRepository = {
  async createRide(record) { return safe(() => { db.prepare('INSERT INTO rides (id, code, customer_id, status, assigned_driver_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(record.id, record.code, record.customerId, record.status, record.assignedDriverId, record.createdAt, record.updatedAt); return record; }, 'Failed to create ride'); },
  async getRideById(id) { return safe(() => { const row = db.prepare('SELECT * FROM rides WHERE id = ?').get(id); return row ? mapRide(row) : null; }, 'Failed to get ride by id'); },
  async getRideByCode(code) { return safe(() => { const row = db.prepare('SELECT * FROM rides WHERE code = ?').get(code); return row ? mapRide(row) : null; }, 'Failed to get ride by code'); },
  async updateRideStatus(id, status, updatedAt) { return safe(() => { db.prepare('UPDATE rides SET status = ?, updated_at = ? WHERE id = ?').run(status, updatedAt, id); const row = db.prepare('SELECT * FROM rides WHERE id = ?').get(id); return row ? mapRide(row) : null; }, 'Failed to update ride status'); },
  async assignDriver(id, driverId, updatedAt) { return safe(() => { db.prepare('UPDATE rides SET assigned_driver_id = ?, updated_at = ? WHERE id = ?').run(driverId, updatedAt, id); const row = db.prepare('SELECT * FROM rides WHERE id = ?').get(id); return row ? mapRide(row) : null; }, 'Failed to assign driver'); },
};

export const paymentRepository: PaymentRepository = {
  async listPayments(rideId) { return safe(() => { const rows = rideId ? db.prepare('SELECT * FROM payments WHERE ride_id = ? ORDER BY created_at DESC').all(rideId) : db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all(); return rows.map(mapPayment); }, 'Failed to list payments'); },
  async getPaymentById(id) { return safe(() => { const row = db.prepare('SELECT * FROM payments WHERE id = ?').get(id); return row ? mapPayment(row) : null; }, 'Failed to get payment by id'); },
  async updatePaymentStatus(id, status, updatedAt) { return safe(() => { db.prepare('UPDATE payments SET status = ?, updated_at = ? WHERE id = ?').run(status, updatedAt, id); const row = db.prepare('SELECT * FROM payments WHERE id = ?').get(id); return row ? mapPayment(row) : null; }, 'Failed to update payment status'); },
  async attachInvoiceReference(id, invoiceReference, updatedAt) { return safe(() => { db.prepare('UPDATE payments SET invoice_reference = ?, updated_at = ? WHERE id = ?').run(invoiceReference, updatedAt, id); const row = db.prepare('SELECT * FROM payments WHERE id = ?').get(id); return row ? mapPayment(row) : null; }, 'Failed to attach invoice reference'); },
};

export const auditRepository: AuditRepository = {
  async recordAuditEvent(event) { return safe(() => { db.prepare('INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(event.id, event.entityType, event.entityId, event.action, event.actorId, event.payload, event.createdAt); return event; }, 'Failed to record audit event'); },
  async listAuditEvents(entityType, entityId) { return safe(() => { if (entityType && entityId) return db.prepare('SELECT * FROM audit_events WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC').all(entityType, entityId).map(mapAudit); if (entityType) return db.prepare('SELECT * FROM audit_events WHERE entity_type = ? ORDER BY created_at DESC').all(entityType).map(mapAudit); return db.prepare('SELECT * FROM audit_events ORDER BY created_at DESC').all().map(mapAudit); }, 'Failed to list audit events'); },
};

export const messageRepository: MessageRepository = {
  async createMessageEvent(event) { return safe(() => { db.prepare('INSERT INTO message_events (id, ride_id, channel, direction, content, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(event.id, event.rideId, event.channel, event.direction, event.content, event.createdAt); return event; }, 'Failed to create message event'); },
  async listMessageEvents(rideId) { return safe(() => { const rows = rideId ? db.prepare('SELECT * FROM message_events WHERE ride_id = ? ORDER BY created_at DESC').all(rideId) : db.prepare('SELECT * FROM message_events ORDER BY created_at DESC').all(); return rows.map(mapMessage); }, 'Failed to list message events'); },
};

export const notificationRepository: NotificationRepository = {
  async createNotificationAttempt(event) { return safe(() => { db.prepare('INSERT INTO notification_attempts (id, notification_type, recipient, status, error_message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(event.id, event.notificationType, event.recipient, event.status, event.errorMessage, event.createdAt, event.updatedAt); return event; }, 'Failed to create notification attempt'); },
  async updateNotificationStatus(id, status, errorMessage, updatedAt) { return safe(() => { db.prepare('UPDATE notification_attempts SET status = ?, error_message = ?, updated_at = ? WHERE id = ?').run(status, errorMessage, updatedAt, id); const row = db.prepare('SELECT * FROM notification_attempts WHERE id = ?').get(id); return row ? mapNotification(row) : null; }, 'Failed to update notification status'); },
  async listFailedNotifications() { return safe(() => db.prepare("SELECT * FROM notification_attempts WHERE status = 'failed' ORDER BY updated_at DESC").all().map(mapNotification), 'Failed to list failed notifications'); },
};

export const recoveryRepository: RecoveryRepository = {
  async createRecoveryEvent(event) { return safe(() => { db.prepare('INSERT INTO recovery_events (id, incident_code, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(event.id, event.incidentCode, event.status, event.notes, event.createdAt, event.updatedAt); return event; }, 'Failed to create recovery event'); },
  async listRecoveryEvents(status) { return safe(() => { const rows = status ? db.prepare('SELECT * FROM recovery_events WHERE status = ? ORDER BY created_at DESC').all(status) : db.prepare('SELECT * FROM recovery_events ORDER BY created_at DESC').all(); return rows.map(mapRecovery); }, 'Failed to list recovery events'); },
  async updateRecoveryStatus(id, status, notes, updatedAt) { return safe(() => { db.prepare('UPDATE recovery_events SET status = ?, notes = ?, updated_at = ? WHERE id = ?').run(status, notes, updatedAt, id); const row = db.prepare('SELECT * FROM recovery_events WHERE id = ?').get(id); return row ? mapRecovery(row) : null; }, 'Failed to update recovery status'); },
};
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB_PATH = resolve(process.cwd(), '.data/lvtransport.sqlite');
const DB_PATH = process.env.LVTRANSPORT_DB_PATH?.trim() || DEFAULT_DB_PATH;

const sanitizePersistenceError = (error: unknown): Error => {
  const message = error instanceof Error ? error.message : 'Unknown SQLite persistence error';
  return new Error(`PERSISTENCE_ERROR: ${message}`);
};

const ensureParentDirectory = (filePath: string): void => {
  mkdirSync(dirname(filePath), { recursive: true });
};

const initializeSqlite = (): DatabaseSync => {
  try {
    ensureParentDirectory(DB_PATH);
    const db = new DatabaseSync(DB_PATH);

    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');

    db.exec(`
      CREATE TABLE IF NOT EXISTS rides (
        id TEXT PRIMARY KEY,
        ride_code TEXT,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        ride_id TEXT,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        entity_type TEXT,
        entity_id TEXT,
        event_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS message_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notification_attempts (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recovery_events (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
      CREATE INDEX IF NOT EXISTS idx_rides_ride_code ON rides(ride_code);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);
      CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_events_entity_type ON audit_events(entity_type);
      CREATE INDEX IF NOT EXISTS idx_audit_events_entity_id ON audit_events(entity_id);
      CREATE INDEX IF NOT EXISTS idx_message_events_timestamp ON message_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_notification_attempts_status ON notification_attempts(status);
      CREATE INDEX IF NOT EXISTS idx_recovery_events_status ON recovery_events(status);
      CREATE INDEX IF NOT EXISTS idx_recovery_events_timestamp ON recovery_events(timestamp);
    `);

    return db;
  } catch (error) {
    throw sanitizePersistenceError(error);
  }
};

export const sqliteDb = initializeSqlite();
export const sqliteDbPath = DB_PATH;
