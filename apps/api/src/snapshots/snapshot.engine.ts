import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type SnapshotPayload = Record<string, unknown>;
export class SnapshotEngine {
  constructor(private readonly root = '.snapshots') {}
  create(payload: SnapshotPayload) {
    mkdirSync(this.root, { recursive: true });
    const serialized = JSON.stringify(payload, null, 2);
    const checksum = createHash('sha256').update(serialized).digest('hex');
    const snapshotId = `snap-${checksum.slice(0, 16)}`;
    const data = { snapshotId, checksum, lineage: { createdFrom: 'local-runtime' }, payload };
    writeFileSync(join(this.root, `${snapshotId}.json`), JSON.stringify(data, null, 2));
    return data;
  }
  list() { return readdirSync(this.root, { withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith('.json')).map((d) => d.name).sort(); }
  verify(snapshotFile: string) {
    const raw = readFileSync(join(this.root, snapshotFile), 'utf8');
    const parsed = JSON.parse(raw) as { checksum: string; payload: SnapshotPayload };
    const checksum = createHash('sha256').update(JSON.stringify(parsed.payload, null, 2)).digest('hex');
    return { valid: checksum === parsed.checksum, expected: parsed.checksum, actual: checksum };
  }
}
