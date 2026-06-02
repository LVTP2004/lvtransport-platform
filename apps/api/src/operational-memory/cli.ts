import { buildOperationalMemoryIndex, readOperationalMemoryIndex } from './indexer.js';
import { buildContinuitySummary, buildTimeline } from './engine.js';

const args = process.argv.slice(2);
const get = (name: string): string | undefined => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const has = (name: string): boolean => args.includes(`--${name}`);

const command = args[0];

const main = async () => {
  if (command === 'index') {
    const result = await buildOperationalMemoryIndex();
    console.log(JSON.stringify({ status: 'ok', records: result.records.length }, null, 2));
    return;
  }

  const records = await readOperationalMemoryIndex();

  if (command === 'timeline') {
    const entity = get('entity');
    const id = get('id');
    const correlationId = get('correlation-id');
    const requestId = get('request-id');
    const incident = has('incident');
    const replay = has('replay');
    const timeline = buildTimeline(records, { entityType: entity, id, correlationId, requestId, incident, replay });
    console.log(JSON.stringify({ mode: 'timeline', query: { entity, id, correlationId, requestId, incident, replay }, entries: timeline }, null, 2));
    return;
  }

  if (command === 'continuity') {
    const entity = get('entity');
    const id = get('id');
    const correlationId = get('correlation-id');
    const incidentId = get('incident-id');
    const replayId = get('replay-id');
    const migrationId = get('migration-id');

    const summary = correlationId
      ? buildContinuitySummary('correlation', { correlationId }, records)
      : entity === 'ride' && id
      ? buildContinuitySummary('ride', { id }, records)
      : incidentId
      ? buildContinuitySummary('incident', { incidentId }, records)
      : replayId
      ? buildContinuitySummary('recovery', { replayId }, records)
      : migrationId
      ? buildContinuitySummary('migration', { migrationId }, records)
      : buildContinuitySummary('correlation', { correlationId: 'missing' }, records);

    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(JSON.stringify({ error: 'Unknown command', supported: ['index', 'timeline', 'continuity'] }, null, 2));
  process.exitCode = 1;
};

void main();
