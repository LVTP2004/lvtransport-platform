CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  correlation_id TEXT,
  causation_id TEXT,
  request_id TEXT,
  actor_id TEXT
);

CREATE TABLE IF NOT EXISTS recovery_events (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  correlation_id TEXT,
  causation_id TEXT,
  request_id TEXT,
  actor_id TEXT
);

CREATE TABLE IF NOT EXISTS message_events (
  id TEXT PRIMARY KEY,
  message_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  correlation_id TEXT,
  causation_id TEXT,
  request_id TEXT,
  actor_id TEXT
);
