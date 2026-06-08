import {
  buildOperationalMemoryIndex,
  saveOperationalMemoryIndex,
  loadOperationalMemoryIndex,
  type MemoryRecord
} from './index.js';

type QueryResult = {
  query: string;
  matched_count: number;
  results: MemoryRecord[];
};

function arg(name: string): string | undefined {
  return process.argv
    .find(v => v.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function score(record: MemoryRecord, q: string): number {
  const hay =
    `${record.category} ${record.title} ${record.excerpt} ${record.keywords.join(' ')}`
      .toLowerCase();

  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce(
      (acc, term) => acc + (hay.includes(term) ? 1 : 0),
      0
    );
}

async function queryMemory(q: string): Promise<QueryResult> {
  const index = await loadOperationalMemoryIndex();

  const ranked = index.records
    .map(r => ({ r, s: score(r, q) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s);

  return {
    query: q,
    matched_count: ranked.length,
    results: ranked.slice(0, 30).map(x => x.r)
  };
}

async function main() {
  const command = process.argv[2];

  if (command === 'index') {
    const index = await buildOperationalMemoryIndex();
    const path = await saveOperationalMemoryIndex(index);

    console.log(
      JSON.stringify(
        {
          status: 'ok',
          index_path: path,
          records_indexed: index.records.length
        },
        null,
        2
      )
    );

    return;
  }

  if (command === 'query') {
    console.log(
      JSON.stringify(
        await queryMemory(arg('q') ?? ''),
        null,
        2
      )
    );

    return;
  }

  console.error(
    JSON.stringify(
      {
        status: 'error',
        supported: ['index', 'query']
      },
      null,
      2
    )
  );

  process.exitCode = 1;
}

void main();
