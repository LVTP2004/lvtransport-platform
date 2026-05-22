import { createHash } from 'node:crypto';

export type ArchivePayload = Record<string, unknown>;

export class ComplianceArchiveService {
  create(payload: ArchivePayload) {
    const manifest = JSON.stringify(payload, Object.keys(payload).sort(), 2);
    const signature = createHash('sha256').update(manifest).digest('hex');
    return { manifest, signature, immutable: true, appendOnly: true };
  }

  verify(manifest: string, signature: string) {
    const digest = createHash('sha256').update(manifest).digest('hex');
    return { valid: digest === signature, digest };
  }
}
