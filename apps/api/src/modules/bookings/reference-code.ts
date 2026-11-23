import { randomInt } from 'node:crypto';

const referenceCount = 100_000;

export function createReferenceCode(used: ReadonlySet<string> = new Set()): string {
  const start = randomInt(referenceCount);
  for (let offset = 0; offset < referenceCount; offset++) {
    const code = String((start + offset) % referenceCount).padStart(5, '0');
    if (!used.has(code)) return code;
  }
  throw new Error('No five-digit booking references available');
}
