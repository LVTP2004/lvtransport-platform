#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const MEMORY_DIR = path.join(ROOT, '.memory');
const INDEX_PATH = path.join(MEMORY_DIR, 'operational-memory-index.json');
const TIMELINE_PATH = path.join(MEMORY_DIR, 'continuity-timeline.md');
const SUMMARY_PATH = path.join(MEMORY_DIR, 'continuity-summary.md');

const CATEGORY_RULES = [
  ['incidents', /\b(incident|outage|failure|error|issue|chaos|accident|postmortem|rollback)\b/i],
  ['migrations', /\b(migration|migrate|transition|cutover|port|upgrade path)\b/i],
  ['recovery', /\b(recovery|restore|backup|disaster|failover|resilien|hotfix|remediation)\b/i],
  ['security', /\b(security|auth|authentication|authorization|hardening|vulnerability|threat|token|rate limit|xss|csrf)\b/i],
  ['deployment', /\b(deploy|deployment|release|vps|production|rollout|infra|infrastructure|ci\/cd)\b/i],
  ['ux/product', /\b(ux|ui|product|customer|premium|experience|ride flow|concierge|design)\b/i],
  ['ai/governance', /\b(ai|governance|policy|ethics|compliance|moni|leo-ia|model)\b/i],
  ['observability', /\b(observability|monitoring|metrics|logging|telemetry|trace|alert|slo|sla)\b/i],
];

const OP_KEYWORDS = [
  'incident', 'migration', 'recovery', 'security', 'deployment', 'ux', 'product', 'ai', 'governance',
  'observability', 'monitoring', 'audit', 'timeline', 'rollback', 'backup', 'failover', 'hotfix', 'readiness',
  'compliance', 'certification', 'hardening', 'production', 'operations', 'ops', 'risk', 'validation', 'stress',
];

async function walkMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(p);
    if (entry.isFile() && p.endsWith('.md')) return [p];
    return [];
  }));
  return files.flat();
}

function uniq(items) {
  return [...new Set(items)];
}

function extractAll(regex, text) {
  const out = [];
  for (const m of text.matchAll(regex)) out.push(m[0]);
  return uniq(out);
}

function parsePhase(text, relFile) {
  const contentHit = text.match(/\bPHASE[\s_-]?(\d{1,2})\b/i);
  if (contentHit) return `PHASE-${contentHit[1].padStart(2, '0')}`;
  const fileHit = relFile.match(/PHASE[\s_-]?(\d{1,2})/i);
  if (fileHit) return `PHASE-${fileHit[1].padStart(2, '0')}`;
  return 'unknown';
}

function parseTitle(text, relFile) {
  const heading = text.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return path.basename(relFile, '.md');
}

function detectCategories(blob) {
  const categories = CATEGORY_RULES
    .filter(([, re]) => re.test(blob))
    .map(([name]) => name);
  return categories.length ? categories : ['unknown'];
}

function parseRecord(absFile) {
  const relFile = path.relative(ROOT, absFile).split(path.sep).join('/');
  return fs.readFile(absFile, 'utf8').then((text) => {
    const lower = text.toLowerCase();
    const title = parseTitle(text, relFile);
    const phase = parsePhase(text, relFile);
    const dates = uniq([
      ...extractAll(/\b\d{4}-\d{2}-\d{2}\b/g, text),
      ...extractAll(/\b\d{4}\/\d{2}\/\d{2}\b/g, text),
      ...extractAll(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/gi, text),
    ]);

    const incidentRefs = extractAll(/\b(?:incident|outage|failure|postmortem|accident|chaos)\b[^\n.]*/gi, text).slice(0, 20);
    const migrationRefs = extractAll(/\b(?:migration|migrate|transition|cutover|upgrade)\b[^\n.]*/gi, text).slice(0, 20);
    const recoveryRefs = extractAll(/\b(?:recovery|restore|backup|disaster|failover|rollback|hotfix)\b[^\n.]*/gi, text).slice(0, 20);

    const operationalKeywords = OP_KEYWORDS.filter((k) => lower.includes(k));
    const categories = detectCategories(`${title}\n${text}`);

    return {
      sourceFile: relFile,
      title,
      phase,
      dates: dates.length ? dates : ['unknown'],
      incidentReferences: incidentRefs.length ? incidentRefs : ['unknown'],
      migrationReferences: migrationRefs.length ? migrationRefs : ['unknown'],
      recoveryReferences: recoveryRefs.length ? recoveryRefs : ['unknown'],
      operationalKeywords: operationalKeywords.length ? operationalKeywords : ['unknown'],
      categories,
    };
  });
}

function renderTimeline(records) {
  const lines = ['# Continuity Timeline', '', `Generated: ${new Date().toISOString()}`, ''];
  const dated = records
    .flatMap((r) => r.dates.filter((d) => d !== 'unknown').map((d) => ({ date: d, record: r })))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (dated.length === 0) {
    lines.push('- No explicit dates found (unknown).');
  } else {
    for (const item of dated) {
      lines.push(`- **${item.date}** | ${item.record.title} | phase: ${item.record.phase} | source: \`${item.record.sourceFile}\``);
    }
  }

  lines.push('', '## Unknown Date Records', '');
  const unknowns = records.filter((r) => r.dates.includes('unknown'));
  if (!unknowns.length) {
    lines.push('- none');
  } else {
    for (const r of unknowns) {
      lines.push(`- ${r.title} | phase: ${r.phase} | source: \`${r.sourceFile}\``);
    }
  }

  return `${lines.join('\n')}\n`;
}

function renderSummary(records) {
  const categories = ['incidents', 'migrations', 'recovery', 'security', 'deployment', 'ux/product', 'ai/governance', 'observability'];
  const lines = ['# Continuity Summary', '', `Generated: ${new Date().toISOString()}`, ''];

  for (const cat of categories) {
    lines.push(`## ${cat}`, '');
    const hits = records.filter((r) => r.categories.includes(cat));
    if (!hits.length) {
      lines.push('- unknown');
      lines.push('');
      continue;
    }

    for (const r of hits) {
      const date = r.dates[0] ?? 'unknown';
      lines.push(`- **${r.title}** (date: ${date}, phase: ${r.phase})`);
      lines.push(`  - source: \`${r.sourceFile}\``);
      lines.push(`  - incident refs: ${r.incidentReferences.slice(0, 2).join(' | ')}`);
      lines.push(`  - migration refs: ${r.migrationReferences.slice(0, 2).join(' | ')}`);
      lines.push(`  - recovery refs: ${r.recoveryReferences.slice(0, 2).join(' | ')}`);
      lines.push(`  - operational keywords: ${r.operationalKeywords.join(', ')}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  const mdFiles = await walkMarkdownFiles(DOCS_DIR);
  const records = await Promise.all(mdFiles.map(parseRecord));

  const index = {
    generatedAt: new Date().toISOString(),
    sourceRoot: 'docs/**/*.md',
    totalFiles: records.length,
    records,
  };

  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2));
  await fs.writeFile(TIMELINE_PATH, renderTimeline(records));
  await fs.writeFile(SUMMARY_PATH, renderSummary(records));

  console.log(`Indexed ${records.length} markdown files.`);
  console.log(`Wrote ${path.relative(ROOT, INDEX_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, TIMELINE_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, SUMMARY_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
