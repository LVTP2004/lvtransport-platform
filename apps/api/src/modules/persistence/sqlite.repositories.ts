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
