import { useEffect, useMemo, useState } from 'react';

type MemoryIndexRecord = {
  id?: string;
  timestamp?: string;
  source?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  description?: string;
  lineage?: string[];
  status?: string;
  integrity?: string;
  backupStatus?: string;
  replayCount?: number;
  migrationVersion?: string;
  failedNotifications?: number;
  recoveryEvents?: number;
};

type TimelineItem = {
  timestamp: string;
  source: string;
  category: string;
  description: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  lineage?: string[];
};

type SourceState = { ok: boolean; missing: boolean; loadedAt: string; path: string };

const SOURCE_PATHS = {
  timeline: '/operational-memory/continuity-timeline.md',
  index: '/operational-memory/operational-memory-index.json',
  summary: '/operational-memory/continuity-summary.md'
} as const;

const parseMarkdownBullets = (content: string, source: string): TimelineItem[] => content
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.startsWith('-'))
  .map((line) => {
    const raw = line.replace(/^-\s*/, '');
    const timestampMatch = raw.match(/(\d{4}-\d{2}-\d{2}[^\s]*)/);
    const correlationId = raw.match(/correlation[_-]?id[:=]\s*([A-Za-z0-9_-]+)/i)?.[1];
    const entityType = raw.match(/entityType[:=]\s*([A-Za-z0-9_-]+)/i)?.[1];
    const entityId = raw.match(/entityId[:=]\s*([A-Za-z0-9_-]+)/i)?.[1];
    const category = raw.match(/category[:=]\s*([A-Za-z0-9_-]+)/i)?.[1] ?? 'continuity';
    return {
      timestamp: timestampMatch?.[1] ?? 'unknown',
      source,
      category,
      description: raw,
      correlationId,
      entityType,
      entityId,
      lineage: []
    };
  });

const safeJson = (input: string): MemoryIndexRecord[] => {
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : (Array.isArray(parsed.records) ? parsed.records : []);
  } catch {
    return [];
  }
};

export function OperationsConsole() {
  const [sourceState, setSourceState] = useState<Record<string, SourceState>>({});
  const [timelineEntries, setTimelineEntries] = useState<TimelineItem[]>([]);
  const [summaryLines, setSummaryLines] = useState<string[]>([]);
  const [healthRecords, setHealthRecords] = useState<MemoryIndexRecord[]>([]);

  useEffect(() => {
    let alive = true;
    const loadedAt = new Date().toISOString();

    const load = async () => {
      const nextState: Record<string, SourceState> = {};
      const nextTimeline: TimelineItem[] = [];
      const nextSummary: string[] = [];
      let nextHealth: MemoryIndexRecord[] = [];

      for (const [key, path] of Object.entries(SOURCE_PATHS)) {
        const response = await fetch(path);
        if (!response.ok) {
          nextState[key] = { ok: false, missing: response.status === 404, loadedAt, path };
          continue;
        }
        const text = await response.text();
        nextState[key] = { ok: true, missing: false, loadedAt, path };

        if (key === 'timeline') nextTimeline.push(...parseMarkdownBullets(text, 'continuity-timeline.md'));
        if (key === 'summary') nextSummary.push(...text.split('\n').map((line) => line.trim()).filter(Boolean));
        if (key === 'index') {
          nextHealth = safeJson(text);
          nextTimeline.push(...nextHealth.map((record) => ({
            timestamp: record.timestamp ?? 'unknown',
            source: record.source ?? 'operational-memory-index.json',
            category: record.category ?? 'operational_memory',
            description: record.description ?? `Operational memory record ${record.id ?? 'unknown'}`,
            entityType: record.entityType,
            entityId: record.entityId,
            correlationId: record.correlationId,
            lineage: record.lineage
          })));
        }
      }
      if (!alive) return;
      setSourceState(nextState);
      setTimelineEntries(nextTimeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
      setSummaryLines(nextSummary);
      setHealthRecords(nextHealth);
    };

    void load();
    return () => { alive = false; };
  }, []);

  const hasArtifacts = useMemo(() => Object.values(sourceState).some((state) => state.ok), [sourceState]);
  const replayCount = healthRecords.reduce((sum, record) => sum + (record.replayCount ?? 0), 0);
  const recoveryEvents = healthRecords.reduce((sum, record) => sum + (record.recoveryEvents ?? 0), 0);
  const failedNotifications = healthRecords.reduce((sum, record) => sum + (record.failedNotifications ?? 0), 0);
  const migrationVersion = healthRecords.find((record) => record.migrationVersion)?.migrationVersion ?? 'unknown';
  const integrityState = healthRecords.find((record) => record.integrity)?.integrity ?? 'unknown';
  const backupState = healthRecords.find((record) => record.backupStatus)?.backupStatus ?? 'unknown';

  return <section className='glass-panel rounded-3xl p-5 sm:p-7' id='operations'>
    <p className='text-xs uppercase tracking-[0.22em] text-lv-champagne/85'>Operations Console</p>
    <h2 className='mt-2 text-2xl sm:text-3xl'>Operational continuity foundation</h2>
    <p className='mt-3 text-sm text-lv-mist'>Read-only cognition surface sourced from local operational memory artifacts. No realtime subscriptions, no mutation controls.</p>

    {!hasArtifacts && <div className='mt-5 rounded-2xl border border-lv-gold/30 bg-[#1f2329] p-4 text-sm text-lv-mist'>
      Operational memory artifacts are absent. Continuity timeline, summaries, and health cards are intentionally empty to preserve truthful visibility.
    </div>}

    <div className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {[
        { label: 'SQLite integrity', value: integrityState },
        { label: 'Migration version', value: migrationVersion },
        { label: 'Backup status', value: backupState },
        { label: 'Replay count', value: String(replayCount) },
        { label: 'Recovery events', value: String(recoveryEvents) },
        { label: 'Failed notifications', value: String(failedNotifications) }
      ].map((card) => <article key={card.label} className='rounded-2xl border border-lv-gold/20 bg-[#22262d] p-4'>
        <p className='text-[11px] uppercase tracking-[0.18em] text-lv-champagne/80'>{card.label}</p>
        <p className='mt-2 text-lg text-white'>{card.value}</p>
      </article>)}
    </div>

    <div className='mt-6 grid gap-4 xl:grid-cols-2'>
      <section className='rounded-2xl border border-lv-gold/20 bg-[#1f2329] p-4'>
        <h3 className='text-sm uppercase tracking-[0.16em] text-lv-champagne'>Continuity timeline</h3>
        <div className='mt-3 space-y-3'>
          {timelineEntries.length === 0 && <p className='text-sm text-lv-mist'>No deterministic timeline entries available from local artifacts.</p>}
          {timelineEntries.map((item, idx) => <article key={`${item.timestamp}-${idx}`} className='rounded-xl border border-white/10 bg-[#252932] p-3 text-sm'>
            <p className='text-lv-champagne'>{item.timestamp} · {item.category}</p>
            <p className='mt-1 text-white'>{item.description}</p>
            <p className='mt-1 text-xs text-lv-mist'>source: {item.source} {item.entityType ? `· ${item.entityType}:${item.entityId ?? 'unknown'}` : ''} {item.correlationId ? `· correlation_id:${item.correlationId}` : ''}</p>
            <p className='mt-1 text-[11px] text-lv-mist/90'>lineage: {(item.lineage && item.lineage.length > 0) ? item.lineage.join(', ') : 'none declared'}</p>
          </article>)}
        </div>
      </section>

      <section className='rounded-2xl border border-lv-gold/20 bg-[#1f2329] p-4'>
        <h3 className='text-sm uppercase tracking-[0.16em] text-lv-champagne'>Cognitive summaries</h3>
        <div className='mt-3 space-y-3 text-sm text-lv-mist'>
          {summaryLines.length === 0 && <p>No continuity summary artifact found; replay, transition, and runbook context remain explicitly unknown.</p>}
          {summaryLines.map((line, index) => <article key={`${line}-${index}`} className='rounded-xl border border-white/10 bg-[#252932] p-3'>
            <p className='text-white'>{line}</p>
            <p className='mt-1 text-xs'>source: continuity-summary.md · timestamp: {sourceState.summary?.loadedAt ?? 'unknown'} · lineage: continuity-summary</p>
          </article>)}
        </div>
      </section>
    </div>

    <section className='mt-6 rounded-2xl border border-lv-gold/20 bg-[#1f2329] p-4'>
      <h3 className='text-sm uppercase tracking-[0.16em] text-lv-champagne'>Source lineage</h3>
      <div className='mt-3 grid gap-2 sm:grid-cols-3'>
        {Object.entries(SOURCE_PATHS).map(([key, path]) => {
          const state = sourceState[key];
          return <article key={path} className='rounded-xl border border-white/10 bg-[#252932] p-3 text-xs text-lv-mist'>
            <p className='text-lv-champagne'>{key}</p>
            <p className='mt-1 break-all'>{path}</p>
            <p className='mt-1'>status: {state?.ok ? 'loaded' : state?.missing ? 'missing' : 'unavailable'}</p>
            <p className='mt-1'>timestamp: {state?.loadedAt ?? 'unknown'}</p>
          </article>;
        })}
      </div>
    </section>
  </section>;
}
