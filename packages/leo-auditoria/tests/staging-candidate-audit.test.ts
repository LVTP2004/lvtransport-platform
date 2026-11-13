import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { auditStagingCandidate, buildOperationalPulse, LEO_IA_AUDITORIA_BOUNDARY,
  type ExpectedStagingCandidate } from '../src/index.js';

const PIN = 'e7f081d6ffea68c8c97d5c5d7d29feab0246b95bd020e4accdd26097c5f1bd38';
const raw = readFileSync(new URL('./fixtures/nexus_exchange_v1.json', import.meta.url));
const fixture = JSON.parse(raw.toString('utf8'));
type Input = Parameters<typeof auditStagingCandidate>[0];
const hash = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
function input(): Input {
  return {
    candidateBytes: Buffer.from(fixture.files['candidate.json'], 'utf8'),
    envelopeBytes: Buffer.from(fixture.files['envelope.json'], 'utf8'),
    proposalBytes: Buffer.from(fixture.files['proposal.json'], 'utf8'),
    authorizationBytes: Buffer.from(fixture.files['authorization.json'], 'utf8'),
    expected: { repository: fixture.expected.repository, revision: fixture.expected.revision,
      proposalPath: fixture.expected.path, project: fixture.expected.project, targetNode: fixture.expected.target_node }
  };
}
// Deliberately malformed synthetic shapes are constructed only inside tests.
function edit(bytes: Uint8Array, change: (value: any) => void): Uint8Array {
  const value = JSON.parse(Buffer.from(bytes).toString('utf8')); change(value);
  return Buffer.from(JSON.stringify(value));
}
function relink(value: Input): void {
  const proposalHash = hash(value.proposalBytes);
  value.authorizationBytes = edit(value.authorizationBytes, a => { a.proposal_sha256 = proposalHash; });
  value.candidateBytes = edit(value.candidateBytes, c => { c.proposal_sha256 = proposalHash; });
  value.envelopeBytes = edit(value.envelopeBytes, e => {
    e.proposal.sha256 = proposalHash;
    e.authorization_sha256 = hash(value.authorizationBytes);
    e.artifact.sha256 = hash(value.candidateBytes);
  });
}
function audit(value: Input, status: 'PASS' | 'FAIL' | 'BLOCKED', reason?: string,
  now = Date.parse(fixture.now)) {
  const previous = Date.now; Date.now = () => now;
  try {
    const result = auditStagingCandidate(value);
    assert.equal(result.status, status, result.reasonCode);
    if (reason) assert.equal(result.reasonCode, reason);
    assert.equal(result.authenticationStatus, 'NOT_VERIFIED');
    assert.equal(result.authorizationStatus, 'BLOCKED_AUTHORITY_NOT_VERIFIED');
    assert.equal(result.executionStatus, 'NOT_PERFORMED');
    assert.equal(result.operationalStatus, 'UNKNOWN');
    assert.equal(result.approvalGranted, false);
    assert.equal(result.canDispatch, false);
    assert.equal(result.productionAllowed, false);
    return result;
  } finally { Date.now = previous; }
}

test('exact Aspire fixture and component hashes are pinned without remote imports', () => {
  assert.equal(hash(raw), PIN);
  assert.equal(fixture.synthetic, true);
  assert.equal(fixture.schema, 'atlas/staging-exchange-fixture/v1');
  assert.deepEqual(Object.keys(fixture.files).sort(), ['authorization.json', 'candidate.json', 'envelope.json', 'proposal.json']);
  for (const [name, text] of Object.entries(fixture.files)) {
    assert.equal(hash(Buffer.from(text as string, 'utf8')), fixture.sha256[name]);
  }
});
test('consistent package PASS means only exact byte/hash/scope correspondence', () => {
  const result = audit(input(), 'PASS', 'PACKAGE_BINDINGS_CONSISTENT_AUTHORITY_BLOCKED');
  assert.equal(result.artifactSha256, fixture.sha256['candidate.json']);
  assert.equal(result.proposalSha256, fixture.sha256['proposal.json']);
  const s = JSON.parse(fixture.files['candidate.json']).scope;
  assert.equal(result.scopeSha256, hash(Buffer.from(JSON.stringify({ operations: s.operations, project: s.project, target_node: s.target_node }))));
});
test('altered candidate bytes, even an added LF, FAIL', () => {
  const value = input(); value.candidateBytes = Buffer.concat([value.candidateBytes, Buffer.from('\n')]);
  audit(value, 'FAIL', 'ARTIFACT_HASH_MISMATCH');
});
test('altered proposal or authorization bytes FAIL rather than granting an alternate binding', () => {
  const p = input(); p.proposalBytes = Buffer.concat([p.proposalBytes, Buffer.from(' ')]); audit(p, 'FAIL');
  const a = input(); a.authorizationBytes = Buffer.concat([a.authorizationBytes, Buffer.from(' ')]); audit(a, 'FAIL');
});
test('altered envelope component hashes FAIL', () => {
  for (const target of ['artifact', 'proposal', 'authorization']) {
    const value = input();
    value.envelopeBytes = edit(value.envelopeBytes, e => {
      if (target === 'authorization') e.authorization_sha256 = '0'.repeat(64);
      else e[target].sha256 = '0'.repeat(64);
    });
    audit(value, 'FAIL');
  }
});
test('duplicate and escaped duplicate fields FAIL in each embedded file', () => {
  for (const key of ['candidateBytes', 'envelopeBytes', 'proposalBytes', 'authorizationBytes'] as const) {
    const value = input();
    const text = Buffer.from(value[key]).toString('utf8');
    value[key] = Buffer.from(text.replace('{', '{"schema":"DUPLICATE",'));
    audit(value, 'FAIL', 'DUPLICATE_JSON_FIELD');
  }
  const value = input();
  value.candidateBytes = Buffer.from(Buffer.from(value.candidateBytes).toString().replace('"proposal_id":', '"proposal_id":"DUPLICATE","\\u0070roposal_id":'));
  audit(value, 'FAIL', 'DUPLICATE_JSON_FIELD');
});
test('contradictory projection FAILs even when its new candidate hash is correctly linked', () => {
  for (const field of ['claims', 'sources', 'proposal_id']) {
    const value = input();
    value.candidateBytes = edit(value.candidateBytes, c => {
      if (field === 'proposal_id') c.proposal_id = 'SYNTHETIC-OTHER';
      else c[field][0].synthetic_change = 'contradiction';
    });
    value.envelopeBytes = edit(value.envelopeBytes, e => { e.artifact.sha256 = hash(value.candidateBytes); });
    audit(value, 'FAIL', 'CANDIDATE_PROJECTION_MISMATCH');
  }
});
test('contradictory envelope or authorization scope FAILs', () => {
  const e = input(); e.envelopeBytes = edit(e.envelopeBytes, v => { v.scope.target_node = 'synthetic-other'; });
  audit(e, 'FAIL');
  const a = input(); a.authorizationBytes = edit(a.authorizationBytes, v => { v.scope.operations = ['nexus.stage_candidate']; });
  a.envelopeBytes = edit(a.envelopeBytes, v => { v.authorization_sha256 = hash(a.authorizationBytes); });
  audit(a, 'FAIL');
});
test('different wide integers cannot round into a matching projection', () => {
  const value = input();
  value.proposalBytes = edit(value.proposalBytes, p => { p.data.claims[0].synthetic_large_integer = 9007199254740992; });
  value.candidateBytes = edit(value.candidateBytes, c => { c.claims[0].synthetic_large_integer = 9007199254740992; });
  relink(value);
  value.candidateBytes = Buffer.from(Buffer.from(value.candidateBytes).toString().replace('9007199254740992', '9007199254740993'));
  value.envelopeBytes = edit(value.envelopeBytes, e => { e.artifact.sha256 = hash(value.candidateBytes); });
  audit(value, 'FAIL', 'CANDIDATE_PROJECTION_MISMATCH');
});
test('missing or incorrect expected context always BLOCKED', () => {
  for (const expected of [undefined, null, {},
    { ...input().expected, repository: 'LVTP2004/aspire-recovery' },
    { ...input().expected, revision: 'b'.repeat(40) },
    { ...input().expected, proposalPath: 'synthetic/other.json' },
    { ...input().expected, project: 'synthetic-other' },
    { ...input().expected, targetNode: 'synthetic-other' }]) {
    audit({ ...input(), expected: expected as ExpectedStagingCandidate }, 'BLOCKED');
  }
});
test('expired authorization, including the exact expiry boundary, is BLOCKED', () => {
  const expiry = Date.parse(JSON.parse(fixture.files['authorization.json']).expires_at);
  audit(input(), 'BLOCKED', 'AUTHORIZATION_LOCATOR_STALE', expiry);
  audit(input(), 'BLOCKED', 'AUTHORIZATION_LOCATOR_STALE', expiry + 1);
});
test('fractional UTC dates preserve microsecond order without requiring .000Z', () => {
  const valid = input();
  valid.proposalBytes = edit(valid.proposalBytes, p => { p.data.created_at = '2026-11-13T11:59:58.000001Z'; });
  valid.authorizationBytes = edit(valid.authorizationBytes, a => { a.issued_at = '2026-11-13T11:59:59.000001Z'; });
  relink(valid); audit(valid, 'PASS');
  const reversed = input();
  reversed.proposalBytes = edit(reversed.proposalBytes, p => { p.data.created_at = '2026-11-13T11:59:58.000002Z'; });
  reversed.authorizationBytes = edit(reversed.authorizationBytes, a => { a.issued_at = '2026-11-13T11:59:58.000001Z'; });
  relink(reversed); audit(reversed, 'BLOCKED', 'AUTHORIZATION_LOCATOR_STALE');
});
test('impossible calendar dates do not normalize into accepted dates', () => {
  const value = input();
  value.authorizationBytes = edit(value.authorizationBytes, a => { a.expires_at = '2026-02-30T12:01:00Z'; });
  value.envelopeBytes = edit(value.envelopeBytes, e => { e.authorization_sha256 = hash(value.authorizationBytes); });
  audit(value, 'BLOCKED', 'INVALID_TIMESTAMP');
});
test('invalid or unavailable clock and invalid UTF-8 remain non-authorizing', () => {
  audit(input(), 'BLOCKED', undefined, NaN);
  const value = input(); value.candidateBytes = new Uint8Array([0xff]); audit(value, 'FAIL');
});
test('permissive policy flags FAIL and never escape into an output', () => {
  const value = input(); value.candidateBytes = edit(value.candidateBytes, c => { c.policy.approval_granted = true; });
  value.envelopeBytes = edit(value.envelopeBytes, e => { e.artifact.sha256 = hash(value.candidateBytes); });
  audit(value, 'FAIL', 'POLICY_ELEVATION_OR_MISMATCH');
});
test('Auditor does not fetch, mutate supplied bytes or regenerate fixture', () => {
  const value = input(); const before = structuredClone(value); const fetch = globalThis.fetch;
  globalThis.fetch = (() => { throw new Error('network must not be called'); }) as typeof globalThis.fetch;
  try { audit(value, 'PASS'); } finally { globalThis.fetch = fetch; }
  for (const key of ['candidateBytes', 'envelopeBytes', 'proposalBytes', 'authorizationBytes'] as const)
    assert.deepEqual(Buffer.from(value[key]), Buffer.from(before[key]));
  assert.deepEqual(value.expected, before.expected);
  assert.equal(hash(readFileSync(new URL('./fixtures/nexus_exchange_v1.json', import.meta.url))), PIN);
});
test('existing Auditor exports and boundaries remain unchanged', () => {
  assert.equal(buildOperationalPulse([]), 'stable');
  assert.ok(LEO_IA_AUDITORIA_BOUNDARY.denied.includes('bypass_founder_approval'));
  assert.ok(LEO_IA_AUDITORIA_BOUNDARY.denied.includes('deploy_changes'));
});

test('nested duplicate scope keys FAIL', () => {
  const value = input();
  value.candidateBytes = Buffer.from(Buffer.from(value.candidateBytes).toString('utf8')
    .replace('"project":"synthetic-project"', '"project":"synthetic-project","project":"synthetic-project"'));
  audit(value, 'FAIL', 'DUPLICATE_JSON_FIELD');
});
test('candidate and envelope cannot jointly override the proposal scope', () => {
  const value = input();
  value.candidateBytes = edit(value.candidateBytes, c => { c.scope.target_node = 'synthetic-other'; });
  value.envelopeBytes = edit(value.envelopeBytes, e => {
    e.scope.target_node = 'synthetic-other'; e.artifact.sha256 = hash(value.candidateBytes);
  });
  audit(value, 'FAIL', 'PACKAGE_SCOPE_CONTRADICTION');
});
test('authorization proposal hash corruption FAILS even if the locator byte hash is rebound', () => {
  const value = input();
  value.authorizationBytes = edit(value.authorizationBytes, a => { a.proposal_sha256 = '0'.repeat(64); });
  value.envelopeBytes = edit(value.envelopeBytes, e => { e.authorization_sha256 = hash(value.authorizationBytes); });
  audit(value, 'FAIL', 'AUTHORIZATION_PROPOSAL_HASH_MISMATCH');
});
test('authorization identifiers must match Nexus positive 31-bit integer range', () => {
  for (const id of [0, -1, 0.5, true, 2147483647]) {
    const value = input();
    value.authorizationBytes = edit(value.authorizationBytes, a => { a.actor_id = id; });
    value.envelopeBytes = edit(value.envelopeBytes, e => { e.authorization_sha256 = hash(value.authorizationBytes); });
    audit(value, 'FAIL', 'AUTHORIZATION_IDS_INVALID');
  }
});
test('microsecond expiry and issue boundaries are not rounded to milliseconds', () => {
  const valid = input();
  valid.authorizationBytes = edit(valid.authorizationBytes, a => { a.expires_at = '2026-11-13T12:00:00.000001Z'; });
  valid.envelopeBytes = edit(valid.envelopeBytes, e => { e.authorization_sha256 = hash(valid.authorizationBytes); });
  audit(valid, 'PASS');
  const future = input();
  future.authorizationBytes = edit(future.authorizationBytes, a => { a.issued_at = '2026-11-13T12:00:00.000001Z'; });
  future.envelopeBytes = edit(future.envelopeBytes, e => { e.authorization_sha256 = hash(future.authorizationBytes); });
  audit(future, 'BLOCKED', 'AUTHORIZATION_LOCATOR_STALE');
});
test('trailing newline never bypasses full-field validation', () => {
  const value = input();
  value.authorizationBytes = edit(value.authorizationBytes, a => { a.expires_at += '\n'; });
  value.envelopeBytes = edit(value.envelopeBytes, e => { e.authorization_sha256 = hash(value.authorizationBytes); });
  audit(value, 'BLOCKED', 'INVALID_TIMESTAMP');
  for (const key of ['revision', 'project', 'proposalPath'] as const) {
    const wrong = input(); wrong.expected[key] += '\n'; audit(wrong, 'BLOCKED', 'EXPECTED_CONTEXT_INVALID');
  }
});
test('a repeated structural PASS never becomes an approval or replay proof', () => {
  assert.deepEqual(audit(input(), 'PASS'), audit(input(), 'PASS'));
});
