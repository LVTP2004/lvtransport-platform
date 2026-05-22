import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type MemoryCategory =
  | 'audit_events'
  | 'recovery_events'
  | 'replay_history'
  | 'incidents'
  | 'runbooks'
  | 'architecture_docs'
  | 'ai_guardrails'
  | 'migration_history'
  | 'operational_state_machine_docs';

export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  source: string;
  timestamp: string;
  entity_type: string | null;
  entity_id: string | null;
  correlation_id: string | null;
  request_id: string | null;
  document_origin: string;
  event_lineage_references: string[];
  title: string;
  excerpt: string;
  keywords: string[];
}

export interface MemoryIndex {
  generated_at: string;
  generator: string;
  records: MemoryRecord[];
}

const REPO_ROOT = path.resolve(process.cwd(), '..', '..');
const INDEX_PATH = path.join(process.cwd(), '.memory', 'operational-memory-index.json');
const SCOPES = ['docs', 'apps/api/src/services', 'apps/api/src/modules', 'apps/api/src/utils/operational-monitoring.ts'];

const CATEGORY_RULES: Array<{ category: MemoryCategory; terms: string[] }> = [
  { category: 'runbooks', terms: ['runbook', 'protocol'] },
  { category: 'recovery_events', terms: ['recovery', 'backup', 'disaster'] },
  { category: 'replay_history', terms: ['replay'] },
  { category: 'incidents', terms: ['incident', 'failure', 'audit'] },
  { category: 'architecture_docs', terms: ['architecture'] },
  { category: 'ai_guardrails', terms: ['guardrail', 'safety', 'policy', 'ai'] },
  { category: 'migration_history', terms: ['migration', 'migrate'] },
  { category: 'operational_state_machine_docs', terms: ['state-machine', 'state_machine', 'lifecycle', 'transition'] },
  { category: 'audit_events', terms: ['audit', 'validation', 'observability', 'operational'] }
];

async function walk(inputPath: string): Promise<string[]> {
  const stat = await fs.stat(inputPath);
  if (stat.isFile()) return [inputPath];
  const entries = await fs.readdir(inputPath, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => (entry.isDirectory() ? walk(path.join(inputPath, entry.name)) : [path.join(inputPath, entry.name)])));
  return files.flat();
}

function detectCategory(relativePath: string, text: string): MemoryCategory {
  const hay = `${relativePath} ${text}`.toLowerCase();
  for (const rule of CATEGORY_RULES) if (rule.terms.some((term) => hay.includes(term))) return rule.category;
  return 'audit_events';
}

function extractMetadata(relativePath: string, text: string) {
  const entityMatch = text.match(/\b(ride|booking|driver|payment|trip|request)\b[:=\s-]*([a-zA-Z0-9_-]{3,})/i);
  const correlationMatch = text.match(/correlation[_-]?id[:=\s-]*([a-zA-Z0-9_-]+)/i);
  const requestMatch = text.match(/request[_-]?id[:=\s-]*([a-zA-Z0-9_-]+)/i);
  const isoDateMatch = text.match(/\b(20\d{2}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}Z?)?)\b/);
  return {
    entity_type: entityMatch ? entityMatch[1].toLowerCase() : null,
    entity_id: entityMatch ? entityMatch[2] : null,
    correlation_id: correlationMatch ? correlationMatch[1] : null,
    request_id: requestMatch ? requestMatch[1] : null,
    timestamp: isoDateMatch?.[1] ?? new Date(0).toISOString(),
    event_lineage_references: [relativePath]
  };
}

function getKeywords(relativePath: string, text: string): string[] {
  const words = `${relativePath} ${text}`.toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g) ?? [];
  return [...new Set(words)].sort().slice(0, 24);
}

export async function buildOperationalMemoryIndex(): Promise<MemoryIndex> {
  const records: MemoryRecord[] = [];
  for (const scope of SCOPES) {
    const fullScope = path.join(REPO_ROOT, scope);
    let files: string[] = [];
    try { files = await walk(fullScope); } catch { continue; }
    for (const file of files.filter((f) => ['.md', '.ts', '.json'].includes(path.extname(f)))) {
      const source = path.relative(REPO_ROOT, file).replaceAll('\\', '/');
      const content = await fs.readFile(file, 'utf8');
      const excerpt = content.split('\n').slice(0, 12).join('\n').slice(0, 800);
      const category = detectCategory(source, excerpt);
      const id = createHash('sha1').update(`${source}:${category}`).digest('hex').slice(0, 16);
      records.push({
        id,
        category,
        source,
        document_origin: source,
        title: path.basename(source),
        excerpt,
        keywords: getKeywords(source, excerpt),
        ...extractMetadata(source, content)
      });
    }
  }
  records.sort((a, b) => a.source.localeCompare(b.source) || a.id.localeCompare(b.id));
  return { generated_at: new Date().toISOString(), generator: '@lvtransport/api operational-memory indexer', records };
}

export async function saveOperationalMemoryIndex(index: MemoryIndex): Promise<string> {
  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2));
  return INDEX_PATH;
}

export async function loadOperationalMemoryIndex(): Promise<MemoryIndex> {
  return JSON.parse(await fs.readFile(INDEX_PATH, 'utf8')) as MemoryIndex;
}

export const getIndexPath = () => INDEX_PATH;
