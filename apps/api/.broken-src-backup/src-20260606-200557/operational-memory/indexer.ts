import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MemoryRecord } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../../..');
const INPUT_DIR = path.join(ROOT, 'apps/api/data/operational-memory');
const OUTPUT_DIR = path.join(ROOT, 'apps/api/data/operational-memory/index');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'memory-index.json');

const normalize = (entry: unknown): MemoryRecord | null => {
  if (!entry || typeof entry !== 'object') return null;
  const raw = entry as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.timestamp !== 'string' || typeof raw.source !== 'string' || typeof raw.message !== 'string') return null;
  const category = typeof raw.category === 'string' ? raw.category : 'unknown';
  return {
    id: raw.id,
    timestamp: raw.timestamp,
    source: raw.source,
    message: raw.message,
    category: category as MemoryRecord['category'],
    entityType: typeof raw.entityType === 'string' ? raw.entityType : undefined,
    entityId: typeof raw.entityId === 'string' ? raw.entityId : undefined,
    correlationId: typeof raw.correlationId === 'string' ? raw.correlationId : undefined,
    requestId: typeof raw.requestId === 'string' ? raw.requestId : undefined,
    incidentId: typeof raw.incidentId === 'string' ? raw.incidentId : undefined,
    replayId: typeof raw.replayId === 'string' ? raw.replayId : undefined,
    migrationId: typeof raw.migrationId === 'string' ? raw.migrationId : undefined,
    lineage: Array.isArray(raw.lineage) ? raw.lineage.filter((x): x is string => typeof x === 'string') : [],
    metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? (raw.metadata as Record<string, unknown>) : undefined,
  };
};

const parseJsonLines = (content: string): unknown[] => content.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line));

export const buildOperationalMemoryIndex = async (): Promise<{ records: MemoryRecord[]; outputFile: string }> => {
  await mkdir(OUTPUT_DIR, { recursive: true });
  let files: string[] = [];
  try {
    files = (await readdir(INPUT_DIR)).filter((f) => f.endsWith('.json') || f.endsWith('.jsonl')).sort();
  } catch {
    files = [];
  }

  const records: MemoryRecord[] = [];
  for (const file of files) {
    const fullPath = path.join(INPUT_DIR, file);
    const rawContent = await readFile(fullPath, 'utf8');
    const parsed = file.endsWith('.jsonl') ? parseJsonLines(rawContent) : JSON.parse(rawContent);
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    for (const entry of entries) {
      const record = normalize(entry);
      if (record) records.push(record);
    }
  }

  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.id.localeCompare(b.id));
  await writeFile(OUTPUT_FILE, `${JSON.stringify({ generatedAt: new Date(0).toISOString(), records }, null, 2)}\n`, 'utf8');
  return { records, outputFile: OUTPUT_FILE };
};

export const readOperationalMemoryIndex = async (): Promise<MemoryRecord[]> => {
  const payload = JSON.parse(await readFile(OUTPUT_FILE, 'utf8')) as { records?: MemoryRecord[] };
  return (payload.records ?? []).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.id.localeCompare(b.id));
};
