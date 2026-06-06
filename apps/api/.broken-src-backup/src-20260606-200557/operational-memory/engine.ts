import type { ContinuitySummary, MemoryRecord, TimelineEntry } from './types.js';

const toTimeline = (record: MemoryRecord): TimelineEntry => ({
  timestamp: record.timestamp,
  source: record.source,
  category: record.category,
  entityType: record.entityType ?? null,
  entityId: record.entityId ?? null,
  correlationId: record.correlationId ?? null,
  requestId: record.requestId ?? null,
  lineage: [...(record.lineage ?? []), `record:${record.id}`],
  description: `${record.category}:${record.message}`,
  recordId: record.id,
});

const sortTimeline = (entries: TimelineEntry[]) => entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.recordId.localeCompare(b.recordId));

export interface TimelineQuery { entityType?: string; id?: string; correlationId?: string; requestId?: string; incident?: boolean; replay?: boolean; }

export const buildTimeline = (records: MemoryRecord[], query: TimelineQuery): TimelineEntry[] => {
  const filtered = records.filter((r) => {
    if (query.entityType && query.id) return r.entityType === query.entityType && r.entityId === query.id;
    if (query.correlationId) return r.correlationId === query.correlationId;
    if (query.requestId) return r.requestId === query.requestId;
    if (query.incident) return Boolean(r.incidentId) || r.category === 'incident';
    if (query.replay) return Boolean(r.replayId) || r.category === 'replay' || r.category === 'recovery';
    return false;
  });
  return sortTimeline(filtered.map(toTimeline));
};

export const buildContinuitySummary = (mode: ContinuitySummary['mode'], key: Record<string, string>, records: MemoryRecord[]): ContinuitySummary => {
  const timeline =
    mode === 'ride' ? buildTimeline(records, { entityType: 'ride', id: key.id })
    : mode === 'correlation' ? buildTimeline(records, { correlationId: key.correlationId })
    : mode === 'incident' ? sortTimeline(records.filter((r) => (key.incidentId ? r.incidentId === key.incidentId : r.category === 'incident')).map(toTimeline))
    : mode === 'migration' ? sortTimeline(records.filter((r) => r.category === 'migration' || (key.migrationId && r.migrationId === key.migrationId)).map(toTimeline))
    : sortTimeline(records.filter((r) => r.category === 'replay' || r.category === 'recovery' || (key.replayId && r.replayId === key.replayId)).map(toTimeline));

  const missingData: string[] = [];
  if (timeline.length === 0) missingData.push('No indexed operational records matched the query.');
  if (!timeline.some((e) => e.correlationId)) missingData.push('No correlation_id available in matched records.');
  if (!timeline.some((e) => e.requestId)) missingData.push('No request_id available in matched records.');

  const status = timeline.length === 0 ? 'missing' : missingData.length > 1 ? 'partial' : 'complete';
  const lineage = Array.from(new Set(timeline.flatMap((e) => e.lineage))).sort();

  return {
    mode,
    key,
    status,
    summary: timeline.length
      ? `Deterministic continuity summary for ${mode}: ${timeline.length} indexed events ordered from ${timeline[0].timestamp} to ${timeline.at(-1)?.timestamp}.`
      : `Deterministic continuity summary for ${mode}: no events available in indexed operational memory.`,
    missingData,
    events: timeline,
    lineage,
    nextInspectionSteps: [
      'Confirm upstream operational sources are indexed with memory:index.',
      'Inspect lineage references to validate each event in source systems.',
      'If gaps remain, collect missing records before any root-cause conclusion.',
    ],
  };
};
