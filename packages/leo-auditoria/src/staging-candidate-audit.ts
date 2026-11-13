import { createHash } from 'node:crypto';

export const STAGING_CANDIDATE_AUDIT_SCHEMA = 'leo/staging-candidate-audit/v1-draft' as const;

const CANDIDATE_SCHEMA = 'nexus/evidence-review-candidate/v1-draft';
const ENVELOPE_SCHEMA = 'atlas/staging-candidate/v1-draft';
const AUTHORIZATION_SCHEMA = 'founder/github-protected-review/v1-draft';
const MAX_CANDIDATE_BYTES = 65_536;
const MAX_PROPOSAL_BYTES = 65_536;
const MAX_AUTHORIZATION_BYTES = 16_384;
const MAX_ENVELOPE_BYTES = 16_384;
const OPERATIONS = ['forge.process_candidate', 'nexus.stage_candidate'] as const;
const REPOSITORIES = new Set([
  'LVTP2004/moni-core-runtime',
  'LVTP2004/lvtransport-platform',
  'LVTP2004/aspire-recovery',
  'LVTP2004/viviana-linux-recovery'
]);
const HASH = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40}$/;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const RELATIVE_PATH = /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/;

export interface ExpectedStagingCandidate {
  repository: string;
  revision: string;
  proposalPath: string;
  project: string;
  targetNode: string;
}

export interface StagingCandidateAuditResult {
  schema: typeof STAGING_CANDIDATE_AUDIT_SCHEMA;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  reasonCode: string;
  auditScope: 'PACKAGE_BYTES_SCOPE_AND_BINDINGS_ONLY';
  artifactSha256: string | null;
  proposalSha256: string | null;
  scopeSha256: string | null;
  authenticationStatus: 'NOT_VERIFIED';
  authorizationStatus: 'BLOCKED_AUTHORITY_NOT_VERIFIED';
  executionStatus: 'NOT_PERFORMED';
  operationalStatus: 'UNKNOWN';
  approvalGranted: false;
  canDispatch: false;
  productionAllowed: false;
}

type JsonObject = Record<string, unknown>;

class AuditIssue extends Error {
  constructor(readonly code: string, readonly status: 'FAIL' | 'BLOCKED' = 'FAIL') {
    super(code);
  }
}

function reject(condition: unknown, code: string, status: 'FAIL' | 'BLOCKED' = 'FAIL'): asserts condition {
  if (!condition) throw new AuditIssue(code, status);
}

function exactObject(value: unknown, fields: readonly string[], code = 'INVALID_FIELDS'): asserts value is JsonObject {
  reject(value !== null && typeof value === 'object' && !Array.isArray(value), code);
  const keys = Object.keys(value as JsonObject).sort();
  const expected = [...fields].sort();
  reject(keys.length === expected.length && expected.every((field, index) => field === keys[index]), code);
}

function stableJson(value: unknown): string {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const object = value as JsonObject;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

// JSON.parse accepts duplicate object keys. This parser rejects them before
// returning JSON values, so a hash-consistent but ambiguous document cannot PASS.
function parseStrictJson(bytes: Uint8Array, maxBytes: number, code: string): unknown {
  reject(bytes instanceof Uint8Array && bytes.byteLength > 0 && bytes.byteLength <= maxBytes, 'INPUT_SIZE_OR_TYPE', 'BLOCKED');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new AuditIssue(code);
  }

  let at = 0;
  const ws = (): void => { while (at < text.length && /[\u0009\u000a\u000d\u0020]/.test(text[at])) at += 1; };
  const string = (): string => {
    const start = at;
    reject(text[at] === '"', code);
    at += 1;
    while (at < text.length) {
      const char = text[at];
      if (char === '"') {
        at += 1;
        try { return JSON.parse(text.slice(start, at)) as string; }
        catch { throw new AuditIssue(code); }
      }
      if (char === '\\') {
        at += 1;
        reject(at < text.length, code);
      } else {
        reject(char.charCodeAt(0) >= 0x20, code);
      }
      at += 1;
    }
    throw new AuditIssue(code);
  };
  const value = (): unknown => {
    ws();
    const char = text[at];
    if (char === '"') return string();
    if (char === '{') {
      at += 1;
      ws();
      const result: JsonObject = Object.create(null) as JsonObject;
      if (text[at] === '}') { at += 1; return result; }
      while (true) {
        ws();
        const key = string();
        reject(!Object.hasOwn(result, key), 'DUPLICATE_JSON_FIELD');
        ws();
        reject(text[at] === ':', code);
        at += 1;
        result[key] = value();
        ws();
        if (text[at] === '}') { at += 1; return result; }
        reject(text[at] === ',', code);
        at += 1;
      }
    }
    if (char === '[') {
      at += 1;
      ws();
      const result: unknown[] = [];
      if (text[at] === ']') { at += 1; return result; }
      while (true) {
        result.push(value());
        ws();
        if (text[at] === ']') { at += 1; return result; }
        reject(text[at] === ',', code);
        at += 1;
      }
    }
    for (const [literal, parsed] of [['true', true], ['false', false], ['null', null]] as const) {
      if (text.startsWith(literal, at)) { at += literal.length; return parsed; }
    }
    const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(text.slice(at));
    reject(match, code);
    at += match[0].length;
    // Opaque Python source/claim dictionaries may contain exact wide integers.
    // Preserve them rather than letting two different projections round equal.
    if (/^-?(?:0|[1-9][0-9]*)$/.test(match[0])) {
      const integer = BigInt(match[0]);
      if (integer < BigInt(Number.MIN_SAFE_INTEGER) || integer > BigInt(Number.MAX_SAFE_INTEGER)) return integer;
    }
    let parsed: number;
    try { parsed = JSON.parse(match[0]) as number; } catch { throw new AuditIssue(code); }
    reject(Number.isFinite(parsed), code);
    return parsed;
  };

  try {
    const parsed = value();
    ws();
    reject(at === text.length, code);
    return parsed;
  } catch (error) {
    if (error instanceof AuditIssue) throw error;
    throw new AuditIssue(code);
  }
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function isHash(value: unknown): value is string { return typeof value === 'string' && HASH.test(value); }
function isCommit(value: unknown): value is string { return typeof value === 'string' && COMMIT.test(value); }
function isIdentifier(value: unknown): value is string { return typeof value === 'string' && IDENTIFIER.test(value); }

function validateExpected(expected: ExpectedStagingCandidate): void {
  reject(expected !== null && typeof expected === 'object', 'EXPECTED_CONTEXT_REQUIRED', 'BLOCKED');
  reject(REPOSITORIES.has(expected.repository) && isCommit(expected.revision)
    && typeof expected.proposalPath === 'string' && expected.proposalPath.length <= 1024
    && RELATIVE_PATH.test(expected.proposalPath)
    && expected.proposalPath.split('/').every((part) => !['.', '..', '.git'].includes(part))
    && isIdentifier(expected.project) && isIdentifier(expected.targetNode), 'EXPECTED_CONTEXT_INVALID', 'BLOCKED');
}

function policy(value: unknown): void {
  exactObject(value, ['trust', 'operational_status', 'identity_verified', 'authorization_verified',
    'approval_granted', 'can_dispatch', 'production_allowed'], 'POLICY_FIELDS_INVALID');
  const p = value as JsonObject;
  reject(p.trust === 'UNVERIFIED' && p.operational_status === 'UNKNOWN'
    && p.identity_verified === false && p.authorization_verified === false
    && p.approval_granted === false && p.can_dispatch === false && p.production_allowed === false,
  'POLICY_ELEVATION_OR_MISMATCH');
}

function scope(value: unknown, expected: ExpectedStagingCandidate): string {
  exactObject(value, ['project', 'target_node', 'operations'], 'SCOPE_FIELDS_INVALID');
  const s = value as JsonObject;
  const operations = s.operations;
  reject(s.project === expected.project && s.target_node === expected.targetNode
    && Array.isArray(operations) && operations.length === OPERATIONS.length
    && OPERATIONS.every((operation, index) => operations[index] === operation), 'SCOPE_MISMATCH', 'BLOCKED');
  return stableJson({ project: expected.project, target_node: expected.targetNode, operations: OPERATIONS });
}

function time(value: unknown): bigint {
  reject(typeof value === 'string', 'INVALID_TIMESTAMP', 'BLOCKED');
  const match = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d{1,6}))?Z$/.exec(value);
  reject(match, 'INVALID_TIMESTAMP', 'BLOCKED');
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(Number);
  const milliseconds = Date.UTC(year, month - 1, day, hour, minute, second);
  const date = new Date(milliseconds);
  reject(year >= 1970 && year <= 9998 && date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    && date.getUTCHours() === hour && date.getUTCMinutes() === minute && date.getUTCSeconds() === second,
  'INVALID_TIMESTAMP', 'BLOCKED');
  return BigInt(milliseconds) * 1000n + BigInt((match[7] ?? '').padEnd(6, '0'));
}

function baseResult(status: 'PASS' | 'FAIL' | 'BLOCKED', reasonCode: string,
  candidateHash: string | null = null, proposalHash: string | null = null, scopeHash: string | null = null): StagingCandidateAuditResult {
  return {
    schema: STAGING_CANDIDATE_AUDIT_SCHEMA,
    status,
    reasonCode,
    auditScope: 'PACKAGE_BYTES_SCOPE_AND_BINDINGS_ONLY',
    artifactSha256: candidateHash,
    proposalSha256: proposalHash,
    scopeSha256: scopeHash,
    authenticationStatus: 'NOT_VERIFIED',
    authorizationStatus: 'BLOCKED_AUTHORITY_NOT_VERIFIED',
    executionStatus: 'NOT_PERFORMED',
    operationalStatus: 'UNKNOWN',
    approvalGranted: false,
    canDispatch: false,
    productionAllowed: false
  };
}

/**
 * Check a Nexus staging bundle's byte and scope bindings without granting authority.
 * PASS means only that the supplied bytes and expected context are self-consistent.
 * This function does not query GitHub or a node and never authenticates the locator.
 */
export function auditStagingCandidate(input: {
  candidateBytes: Uint8Array;
  envelopeBytes: Uint8Array;
  proposalBytes: Uint8Array;
  authorizationBytes: Uint8Array;
  expected: ExpectedStagingCandidate;
}): StagingCandidateAuditResult {
  let candidateHash: string | null = null;
  let proposalHash: string | null = null;
  let scopeHash: string | null = null;
  try {
    reject(input !== null && typeof input === 'object', 'INPUT_REQUIRED', 'BLOCKED');
    validateExpected(input.expected);
    candidateHash = sha256(input.candidateBytes);
    proposalHash = sha256(input.proposalBytes);
    const authorizationHash = sha256(input.authorizationBytes);

    const candidate = parseStrictJson(input.candidateBytes, MAX_CANDIDATE_BYTES, 'CANDIDATE_JSON_INVALID');
    const envelope = parseStrictJson(input.envelopeBytes, MAX_ENVELOPE_BYTES, 'ENVELOPE_JSON_INVALID');
    const proposal = parseStrictJson(input.proposalBytes, MAX_PROPOSAL_BYTES, 'PROPOSAL_JSON_INVALID');
    const authorization = parseStrictJson(input.authorizationBytes, MAX_AUTHORIZATION_BYTES, 'AUTHORIZATION_JSON_INVALID');

    exactObject(candidate, ['schema', 'proposal_id', 'proposal_sha256', 'scope', 'sources', 'claims', 'policy'], 'CANDIDATE_FIELDS_INVALID');
    exactObject(envelope, ['schema', 'proposal', 'authorization_sha256', 'scope', 'artifact', 'policy'], 'ENVELOPE_FIELDS_INVALID');
    const c = candidate as JsonObject;
    const e = envelope as JsonObject;
    reject(c.schema === CANDIDATE_SCHEMA && isIdentifier(c.proposal_id) && isHash(c.proposal_sha256), 'CANDIDATE_HEADER_INVALID');
    const serializedScope = scope(c.scope, input.expected);
    scopeHash = sha256(new TextEncoder().encode(serializedScope));
    reject(stableJson(e.scope) === stableJson(c.scope), 'ENVELOPE_SCOPE_MISMATCH');
    const envelopeScope = scope(e.scope, input.expected);
    reject(envelopeScope === serializedScope, 'ENVELOPE_SCOPE_MISMATCH', 'BLOCKED');
    policy(c.policy);
    policy(e.policy);
    reject(Array.isArray(c.sources) && c.sources.length > 0 && c.sources.length <= 128
      && c.sources.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
      && Array.isArray(c.claims) && c.claims.length > 0 && c.claims.length <= 128
      && c.claims.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item)), 'CANDIDATE_CONTENT_INVALID');

    exactObject(e.proposal, ['repository', 'revision', 'path', 'sha256'], 'PROPOSAL_LOCATOR_INVALID');
    const locator = e.proposal as JsonObject;
    reject(e.schema === ENVELOPE_SCHEMA && locator.repository === input.expected.repository
      && locator.revision === input.expected.revision && locator.path === input.expected.proposalPath,
    'PROPOSAL_PROVENANCE_MISMATCH', 'BLOCKED');
    reject(locator.sha256 === proposalHash && c.proposal_sha256 === proposalHash, 'PROPOSAL_HASH_MISMATCH');
    reject(isHash(e.authorization_sha256) && e.authorization_sha256 === authorizationHash, 'AUTHORIZATION_HASH_MISMATCH');
    exactObject(e.artifact, ['name', 'sha256'], 'ARTIFACT_LOCATOR_INVALID');
    const artifact = e.artifact as JsonObject;
    reject(artifact.name === 'candidate.json' && artifact.sha256 === candidateHash, 'ARTIFACT_HASH_MISMATCH');

    exactObject(proposal, ['schema', 'kind', 'data', 'policy'], 'PROPOSAL_FIELDS_INVALID');
    const p = proposal as JsonObject;
    reject(p.schema === 'moni/atlas-vnext-data/v1-draft' && p.kind === 'proposal', 'PROPOSAL_SCHEMA_UNSUPPORTED', 'BLOCKED');
    policy(p.policy);
    exactObject(p.data, ['proposal_id', 'created_at', 'scope', 'sources', 'claims'], 'PROPOSAL_DATA_INVALID');
    const pd = p.data as JsonObject;
    reject(pd.proposal_id === c.proposal_id && stableJson(pd.scope) === stableJson(c.scope)
      && stableJson(pd.sources) === stableJson(c.sources)
      && stableJson(pd.claims) === stableJson(c.claims), 'CANDIDATE_PROJECTION_MISMATCH');
    const proposalCreated = time(pd.created_at);

    exactObject(authorization, ['schema', 'repository', 'pull_number', 'head_sha', 'proposal_path',
      'proposal_sha256', 'scope', 'actor_id', 'review_id', 'decision', 'issued_at', 'expires_at'], 'AUTHORIZATION_LOCATOR_INVALID');
    const a = authorization as JsonObject;
    reject(stableJson(a.scope) === stableJson(c.scope), 'AUTHORIZATION_SCOPE_MISMATCH');
    reject(a.schema === AUTHORIZATION_SCHEMA && a.repository === input.expected.repository
      && a.head_sha === input.expected.revision && a.proposal_path === input.expected.proposalPath
      && a.proposal_sha256 === proposalHash && scope(a.scope, input.expected) === serializedScope
      && Number.isSafeInteger(a.pull_number) && Number.isSafeInteger(a.actor_id)
      && Number.isSafeInteger(a.review_id) && a.decision === 'APPROVE', 'AUTHORIZATION_LOCATOR_MISMATCH', 'BLOCKED');
    const issued = time(a.issued_at);
    const expires = time(a.expires_at);
    const nowMilliseconds = Date.now();
    reject(Number.isSafeInteger(nowMilliseconds) && nowMilliseconds >= 0, 'CLOCK_UNVERIFIABLE', 'BLOCKED');
    const now = BigInt(nowMilliseconds) * 1000n;
    reject(proposalCreated <= issued && issued <= now && now < expires && expires - issued <= 15n * 60n * 1000000n,
      'AUTHORIZATION_LOCATOR_STALE', 'BLOCKED');

    // Structural result only. An APPROVE-shaped JSON record is still untrusted.
    return baseResult('PASS', 'PACKAGE_BINDINGS_CONSISTENT_AUTHORITY_BLOCKED', candidateHash, proposalHash, scopeHash);
  } catch (error) {
    if (error instanceof AuditIssue) return baseResult(error.status, error.code, candidateHash, proposalHash, scopeHash);
    return baseResult('BLOCKED', 'AUDIT_INPUT_UNVERIFIABLE', candidateHash, proposalHash, scopeHash);
  }
}
