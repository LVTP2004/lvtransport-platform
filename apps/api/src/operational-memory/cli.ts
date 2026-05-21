import { buildOperationalMemoryIndex, getIndexPath, loadOperationalMemoryIndex, saveOperationalMemoryIndex, type MemoryRecord } from './index.js';

type QueryResult = {
  query: string;
  matched_count: number;
  results: MemoryRecord[];
  ai_safety: { mutation_permitted: false; realtime_simulation_permitted: false; autonomous_execution_permitted: false };
};

function arg(name: string): string | undefined {
  return process.argv.find((v) => v.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

function score(record: MemoryRecord, q: string): number {
  const hay = `${record.category} ${record.title} ${record.excerpt} ${record.keywords.join(' ')}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).reduce((acc, term) => acc + (hay.includes(term) ? 1 : 0), 0);
}

async function queryMemory(q: string): Promise<QueryResult> {
  const index = await loadOperationalMemoryIndex();
  const ranked = index.records.map((r) => ({ r, s: score(r, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.r.source.localeCompare(b.r.source));
  return {
    query: q,
    matched_count: ranked.length,
    results: ranked.slice(0, 30).map((x) => x.r),
    ai_safety: { mutation_permitted: false, realtime_simulation_permitted: false, autonomous_execution_permitted: false }
  };
}

async function summary(entity?: string, id?: string) {
  const index = await loadOperationalMemoryIndex();
  const filtered = index.records.filter((r) => (!entity || r.entity_type === entity) && (!id || r.entity_id === id || r.source.includes(id)));
  const byCategory = Object.fromEntries(Object.entries(filtered.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1; return acc;
  }, {})).sort(([a], [b]) => a.localeCompare(b)));

  return {
    entity: entity ?? null,
    id: id ?? null,
    continuity_summary: { total_records: filtered.length, categories: byCategory },
    replay_summary: filtered.filter((r) => r.category === 'replay_history'),
    incident_summary: filtered.filter((r) => r.category === 'incidents'),
    migration_summary: filtered.filter((r) => r.category === 'migration_history'),
    source_lineage: filtered.map((r) => ({ source: r.source, timestamp: r.timestamp, event_lineage_references: r.event_lineage_references, correlation_id: r.correlation_id, request_id: r.request_id })),
    guarantees: {
      source_of_truth: 'indexed_operational_memory_only',
      hallucination_protection: true,
      speculative_state_generation: false
    }
  };
}

async function main() {
  const command = process.argv[2];
  if (command === 'index') {
    const index = await buildOperationalMemoryIndex();
    const indexPath = await saveOperationalMemoryIndex(index);
    console.log(JSON.stringify({ status: 'ok', index_path: indexPath, records_indexed: index.records.length }, null, 2));
    return;
  }
  if (command === 'query') {
    console.log(JSON.stringify(await queryMemory(arg('q') ?? ''), null, 2));
    return;
  }
  if (command === 'summary') {
    console.log(JSON.stringify(await summary(arg('entity'), arg('id')), null, 2));
    return;
  }
  console.log(JSON.stringify({ status: 'error', message: 'Expected command: index | query | summary' }, null, 2));
  process.exitCode = 1;
}

void main();
