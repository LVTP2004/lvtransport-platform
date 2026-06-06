import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type ReplayResult = {
  ok: boolean;
  mode: 'dry-run' | 'execute';
  target: string;
  id: string;
  reason: string | null;
  replaySource: string;
  replayedBy: string | null;
  alreadyReplayed: boolean;
  willMutate: boolean;
  action: string;
  details: Record<string, unknown>;
};

type ReplayCliOptions = {
  id: string;
  reason?: string;
  dryRun: boolean;
  execute: boolean;
  replaySource: string;
  replayedBy: string | null;
};

export function parseReplayArgs(argv: string[], target: string): ReplayCliOptions {
  const getValue = (prefix: string): string | undefined => argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  const id = getValue('--id=')?.trim();
  const reason = getValue('--reason=')?.trim();
  const dryRun = argv.includes('--dry-run');
  const execute = argv.includes('--execute');

  if (!id) throw new Error('Missing required --id=<event_id>.');
  if (!dryRun && !execute) throw new Error('Explicit execution mode required. Use --dry-run or --execute.');
  if (dryRun && execute) throw new Error('Choose only one mode: --dry-run or --execute.');
  if (execute && !reason) throw new Error('Missing required --reason="<operator reason>" for execute mode.');

  return {
    id,
    reason,
    dryRun,
    execute,
    replaySource: target,
    replayedBy: process.env.LVTP_REPLAY_OPERATOR?.trim() || null,
  };
}

export function openRecoveryDb() {
  const dbPath = process.env.LVTP_RECOVERY_DB_PATH?.trim() || 'data/recovery.sqlite';
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS recovery_replays (
      replay_key TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      replay_source TEXT NOT NULL,
      replay_reason TEXT NOT NULL,
      replayed_by TEXT,
      replayed_at TEXT NOT NULL,
      replay_count INTEGER NOT NULL DEFAULT 0,
      correlation_id TEXT,
      request_id TEXT,
      actor_id TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      action TEXT NOT NULL,
      replay_source TEXT NOT NULL,
      replay_reason TEXT NOT NULL,
      replayed_by TEXT,
      correlation_id TEXT,
      request_id TEXT,
      actor_id TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

export function replayKey(id: string, source: string) {
  return `${source}:${id}`;
}

export function getReplayState(db: DatabaseSync, id: string, source: string) {
  return db
    .prepare('SELECT replayed_at, replay_count, replay_source, replay_reason, replayed_by, correlation_id, request_id, actor_id FROM recovery_replays WHERE replay_key = ?')
    .get(replayKey(id, source)) as Record<string, unknown> | undefined;
}

export function writeReplayAudit(params: { db: DatabaseSync; id: string; source: string; reason: string; replayedBy: string | null; action: string }) {
  const now = new Date().toISOString();
  const correlationId = `replay-${params.id}`;
  const requestId = randomUUID();
  const actorId = params.replayedBy;
  const key = replayKey(params.id, params.source);

  const existing = params.db.prepare('SELECT replay_count FROM recovery_replays WHERE replay_key = ?').get(key) as { replay_count?: number } | undefined;

  if (existing) {
    params.db
      .prepare('UPDATE recovery_replays SET replayed_at = ?, replay_count = replay_count + 1, replay_reason = ?, replayed_by = ?, correlation_id = ?, request_id = ?, actor_id = ? WHERE replay_key = ?')
      .run(now, params.reason, params.replayedBy, correlationId, requestId, actorId, key);
  } else {
    params.db
      .prepare('INSERT INTO recovery_replays (replay_key, event_id, replay_source, replay_reason, replayed_by, replayed_at, replay_count, correlation_id, request_id, actor_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)')
      .run(key, params.id, params.source, params.reason, params.replayedBy, now, correlationId, requestId, actorId);
  }

  params.db
    .prepare('INSERT INTO audit_events (id, event_id, action, replay_source, replay_reason, replayed_by, correlation_id, request_id, actor_id, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), params.id, params.action, params.source, params.reason, params.replayedBy, correlationId, requestId, actorId, JSON.stringify({ replayed_at: now, replay_source: params.source }), now);

  return { replayedAt: now, correlationId, requestId, actorId };
}

export function printResult(result: ReplayResult): void {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
