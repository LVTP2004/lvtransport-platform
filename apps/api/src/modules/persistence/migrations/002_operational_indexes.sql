CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation_id ON audit_events(correlation_id);

CREATE INDEX IF NOT EXISTS idx_recovery_events_created_at ON recovery_events(created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_events_correlation_id ON recovery_events(correlation_id);

CREATE INDEX IF NOT EXISTS idx_message_events_created_at ON message_events(created_at);
CREATE INDEX IF NOT EXISTS idx_message_events_correlation_id ON message_events(correlation_id);
