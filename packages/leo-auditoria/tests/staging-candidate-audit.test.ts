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
// Synthetic projections of Aspire PR #3's unchanged exchange contract at
// 5a71de59323b82f056b67ebe5a388f50fb13f66c. No Aspire imports or fixture writes.
function fixtureJson(value: any): string {
  if (Array.isArray(value)) return `[${value.map(fixtureJson).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort()
    .map(key => `${JSON.stringify(key)}:${fixtureJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function nodeInput(node: 'aspire' | 'viviana'): Input {
  const value = input();
  const offset = node === 'aspire' ? 0 : 100;
  value.expected = {
    repository: `LVTP2004/${node === 'aspire' ? 'aspire-recovery' : 'viviana-linux-recovery'}`,
    revision: (node === 'aspire' ? 'a' : 'b').repeat(40),
    proposalPath: `proposals/synthetic-${node}.json`,
    project: `synthetic-${node}`, targetNode: node
  };
  const scope = { project: value.expected.project, target_node: node,
    operations: ['forge.process_candidate', 'nexus.stage_candidate'] };
  const sources = [{ source_id: `SYNTHETIC-${node}-SOURCE`, path: `synthetic/${node}/source.txt`,
    source_node: node, note: `SYNTHETIC ONLY: ${node} test data, no recovered evidence or identity.` }];
  const claims = [{ claim_id: `SYNTHETIC-${node}-CLAIM`,
    text: `SYNTHETIC ONLY: scoped test claim for ${node}, not observed node state.` }];
  const proposal = JSON.parse(Buffer.from(value.proposalBytes).toString('utf8'));
  const candidate = JSON.parse(Buffer.from(value.candidateBytes).toString('utf8'));
  const authorization = JSON.parse(Buffer.from(value.authorizationBytes).toString('utf8'));
  const envelope = JSON.parse(Buffer.from(value.envelopeBytes).toString('utf8'));
  Object.assign(proposal.data, { proposal_id: `SYNTHETIC-${node}-PROPOSAL`, scope, sources, claims });
  value.proposalBytes = Buffer.from(fixtureJson(proposal), 'utf8');
  const proposalHash = hash(value.proposalBytes);
  Object.assign(authorization, { repository: value.expected.repository, head_sha: value.expected.revision,
    proposal_path: value.expected.proposalPath, proposal_sha256: proposalHash, scope,
    pull_number: 11 + offset, actor_id: 22 + offset, review_id: 33 + offset });
  value.authorizationBytes = Buffer.from(fixtureJson(authorization), 'utf8');
  Object.assign(candidate, { proposal_id: proposal.data.proposal_id, proposal_sha256: proposalHash,
    scope, sources, claims });
  value.candidateBytes = Buffer.from(fixtureJson(candidate), 'utf8');
  Object.assign(envelope, {
    proposal: { repository: value.expected.repository, revision: value.expected.revision,
      path: value.expected.proposalPath, sha256: proposalHash },
    authorization_sha256: hash(value.authorizationBytes), scope,
    artifact: { name: 'candidate.json', sha256: hash(value.candidateBytes) }
  });
  value.envelopeBytes = Buffer.from(fixtureJson(envelope), 'utf8');
  return value;
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

test('fixture keeps the exact v1 exchange shapes pinned to Aspire contract 5a71de59', () => {
  const p = JSON.parse(fixture.files['proposal.json']);
  const a = JSON.parse(fixture.files['authorization.json']);
  const c = JSON.parse(fixture.files['candidate.json']);
  const e = JSON.parse(fixture.files['envelope.json']);
  assert.equal(p.schema, 'moni/atlas-vnext-data/v1-draft');
  assert.equal(a.schema, 'founder/github-protected-review/v1-draft');
  assert.equal(c.schema, 'nexus/evidence-review-candidate/v1-draft');
  assert.equal(e.schema, 'atlas/staging-candidate/v1-draft');
  assert.deepEqual(Object.keys(c).sort(), ['schema', 'proposal_id', 'proposal_sha256', 'scope', 'sources', 'claims', 'policy'].sort());
  assert.deepEqual(Object.keys(e).sort(), ['schema', 'proposal', 'authorization_sha256', 'scope', 'artifact', 'policy'].sort());
  for (const scope of [p.data.scope, a.scope, c.scope, e.scope]) {
    assert.deepEqual(Object.keys(scope).sort(), ['project', 'target_node', 'operations'].sort());
    assert.deepEqual(scope.operations, ['forge.process_candidate', 'nexus.stage_candidate']);
  }
});
test('Aspire and Viviana each PASS only their own synthetic bytes and expected context', () => {
  const aspire = nodeInput('aspire'); const viviana = nodeInput('viviana');
  const first = audit(aspire, 'PASS'); const second = audit(viviana, 'PASS');
  assert.notEqual(first.artifactSha256, second.artifactSha256);
  assert.notEqual(first.proposalSha256, second.proposalSha256);
  assert.notEqual(first.scopeSha256, second.scopeSha256);
  assert.notEqual(aspire.expected.repository, viviana.expected.repository);
  assert.notEqual(aspire.expected.revision, viviana.expected.revision);
  const a = JSON.parse(Buffer.from(aspire.candidateBytes).toString());
  const v = JSON.parse(Buffer.from(viviana.candidateBytes).toString());
  assert.equal(a.sources[0].source_node, 'aspire');
  assert.equal(v.sources[0].source_node, 'viviana');
  assert.notDeepEqual(a.sources, v.sources); assert.notDeepEqual(a.claims, v.claims);
  assert.equal(hash(raw), PIN); // The shared golden fixture is never regenerated.
});
test('a complete package cannot be reused with the other node expected context in either direction', () => {
  for (const [own, other] of [['aspire', 'viviana'], ['viviana', 'aspire']] as const) {
    const value = nodeInput(own); value.expected = nodeInput(other).expected;
    audit(value, 'BLOCKED', 'SCOPE_MISMATCH');
  }
});
test('foreign node sources or claims FAIL even after repairing candidate byte hash', () => {
  for (const [own, other] of [['aspire', 'viviana'], ['viviana', 'aspire']] as const) {
    const foreign = JSON.parse(Buffer.from(nodeInput(other).candidateBytes).toString());
    for (const field of ['sources', 'claims']) {
      const value = nodeInput(own);
      value.candidateBytes = edit(value.candidateBytes, c => { c[field] = foreign[field]; });
      value.envelopeBytes = edit(value.envelopeBytes, e => { e.artifact.sha256 = hash(value.candidateBytes); });
      audit(value, 'FAIL', 'CANDIDATE_PROJECTION_MISMATCH');
    }
  }
});
test('swapping node candidate or authorization documents FAILs despite rehashed envelope', () => {
  for (const [own, other] of [['aspire', 'viviana'], ['viviana', 'aspire']] as const) {
    for (const field of ['candidateBytes', 'authorizationBytes'] as const) {
      const value = nodeInput(own); const foreign = nodeInput(other);
      value[field] = foreign[field];
      value.envelopeBytes = edit(value.envelopeBytes, e => {
        if (field === 'candidateBytes') e.artifact.sha256 = hash(value.candidateBytes);
        else e.authorization_sha256 = hash(value.authorizationBytes);
      });
      audit(value, 'FAIL', 'PACKAGE_SCOPE_CONTRADICTION');
    }
  }
});
test('neither node can elevate policy or reuse an expired locator', () => {
  for (const node of ['aspire', 'viviana'] as const) {
    const elevated = nodeInput(node);
    elevated.candidateBytes = edit(elevated.candidateBytes, c => { c.policy.identity_verified = true; });
    elevated.envelopeBytes = edit(elevated.envelopeBytes, e => { e.artifact.sha256 = hash(elevated.candidateBytes); });
    audit(elevated, 'FAIL', 'POLICY_ELEVATION_OR_MISMATCH');
    const expired = nodeInput(node);
    const expiresAt = JSON.parse(Buffer.from(expired.authorizationBytes).toString()).expires_at;
    audit(expired, 'BLOCKED', 'AUTHORIZATION_LOCATOR_STALE', Date.parse(expiresAt));
  }
});
