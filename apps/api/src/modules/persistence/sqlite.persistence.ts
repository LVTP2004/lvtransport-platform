import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(moduleDirectory, 'migrations');
const backupDirectory = path.resolve(process.cwd(), '.data/backups');

export const defaultDbPath = path.resolve(process.cwd(), env.sqliteDbPath);

type MigrationRow = { version: string };

const openDatabase = (dbPath = defaultDbPath): DatabaseSync => {
  const dir = path.dirname(dbPath);
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  return db;
};

const ensureSchemaVersionTable = (db: DatabaseSync): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
};

const listMigrations = (): string[] =>
  readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();

export const runMigrations = (db: DatabaseSync): { appliedCount: number; currentVersion: string | null } => {
  ensureSchemaVersionTable(db);
  const applied = new Set(
    (db.prepare('SELECT version FROM schema_version').all() as MigrationRow[]).map((row) => row.version),
  );

  let appliedCount = 0;
  let currentVersion: string | null = null;

  for (const file of listMigrations()) {
    if (applied.has(file)) {
      currentVersion = file;
      continue;
    }

    const sql = readFileSync(path.join(migrationsDirectory, file), 'utf8');
    db.exec('BEGIN;');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(file);
      db.exec('COMMIT;');
      appliedCount += 1;
      currentVersion = file;
    } catch (error) {
      db.exec('ROLLBACK;');
      throw error;
    }
  }

  return { appliedCount, currentVersion };
};

export const initializeSqlitePersistence = (): DatabaseSync => {
  const db = openDatabase();
  const { appliedCount, currentVersion } = runMigrations(db);

  logger.info('SQLite initialized', {
    dbPath: env.sqliteDbPath,
    walEnabled: true,
    migrationVersion: currentVersion,
    migrationCount: listMigrations().length,
    appliedCount,
  });

  return db;
};

export const runIntegrityCheck = (dbPath = defaultDbPath): { ok: boolean; details: string[] } => {
  const db = openDatabase(dbPath);
  try {
    const rows = db.prepare('PRAGMA integrity_check;').all() as Array<{ integrity_check: string }>;
    const details = rows.map((row) => row.integrity_check);
    return { ok: details.every((value) => value === 'ok'), details };
  } finally {
    db.close();
  }
};

export const backupDatabase = async (dbPath = defaultDbPath): Promise<string> => {
  const db = openDatabase(dbPath);
  runMigrations(db);
  db.close();

  mkdirSync(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
  const fileName = `sqlite-backup-${timestamp}.db`;
  const destination = path.join(backupDirectory, fileName);
  await copyFile(dbPath, destination);
  return destination;
};
