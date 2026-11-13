# Founder OS

Status: architecture concept
Last updated: 2026-11-12

## Role

Founder OS is the proposed desktop governance and decision surface for LVTP CORE. Its purpose is to compress system complexity into a clear view of current state, risk, priorities, pending decisions and authorized actions.

Founder OS does not replace MONI. The intended separation is:

- Founder OS: governance, priorities, risk, architecture and human decision surface.
- MONI: context, observation, coordination and workflow mediation.
- LVTP CORE: shared platform/control foundation.
- Nodes/runtimes: execution environments.
- Human operator: final authority for actions requiring human approval.

## Proposed Founder Dashboard

The desktop experience may show global LVTP CORE health; Aspire, Minisforum and Viviana Linux as distinct identities; active agents and tasks; risk/attention items; pending approvals; GitHub/PR/check status; MONI Bridge/MCP health; authorized deployment/service state; and decision/audit history.

## Relationship to MONI Edge

Founder OS is the desktop control/governance experience. MONI Edge is the mobile secure extension on FOSSiBOT.

They should share request IDs, identities, capability policies and audit records. A decision made from either surface should reconcile through LVTP CORE/MONI rather than creating two independent control planes.

## Design principle

PC, tablet and phone interfaces are authorized consoles. They are not independent authorities. The canonical operational state should remain in the control plane and its auditable sources.

## Proposed approval record: person, proposal and content digest

Status: design for review, not an implemented or configured approval service.
Reference revision: [Founder OS and its existing role](https://github.com/LVTP2004/lvtransport-platform/blob/91150765657e5765e07642c195b40319bb9ac947/docs/architecture/FOUNDER-OS.md).
The [control-plane identity boundary](https://github.com/LVTP2004/lvtransport-platform/blob/91150765657e5765e07642c195b40319bb9ac947/docs/architecture/MONI-UNIFIED-CONTROL-PLANE.md#authorization-model)
and [Edge approval limits](https://github.com/LVTP2004/lvtransport-platform/blob/91150765657e5765e07642c195b40319bb9ac947/docs/architecture/MONI-EDGE.md#proposed-security-model)
remain applicable. No endpoint, credentials, database or execution path is added.

The proposed sequence is:

`freeze proposal -> authenticate person -> show exact proposal/scope -> explicit decision -> validate and persist receipt -> separate execution review`

### Freeze what the person is reviewing

A proposal must have an immutable `proposal_id`, revision and versioned manifest.
The manifest includes the action and exact parameters, capability, target
node/instance/environment, expected preconditions, risk, approval policy version,
expiry and an explicit artifact list. Each artifact is pinned by repository,
commit, path and SHA-256 of its exact bytes. A mutable branch, PR number or URL
alone is not the proposal; a commit SHA is not a substitute for an artifact digest.

Proposed hash profile `EXACT_MANIFEST_BYTES_V1`: persist one bounded UTF-8
manifest artifact, then compute `proposal_hash = SHA-256(exact stored bytes)`.
These frozen bytes are the canonical review artifact for that revision; do not
parse/reserialize, normalize whitespace or silently substitute another rendering
when computing the hash. The schema must reject duplicate keys and unknown or
ambiguous fields before freezing. The review surface must render that same
validated artifact and display its revision, scope and digest. Hashing proves
content binding only; it does not authenticate the author, approver or renderer.

Any change to manifest bytes, parameters, artifacts, target or approval policy
creates a new revision/hash and supersedes pending or recorded approvals for the
old revision. It must request a new explicit decision; no approval transfers.

### Identify a person through a trusted boundary

The future approval backend must derive the person's stable `issuer + subject`
from a verified identity provider, with an authoritative binding to the enrolled
human and approval role/scope. A display name, email, JSON `person_id`, client
role, GitHub handle, device identity or successful NATS delivery is not that proof.
The backend must verify current session validity, account status, permission and
any required recent reauthentication/MFA according to the bound policy version.

This document does not select or claim an available provider, key authority or
custodian. Their owner, enrollment, revocation and recovery processes require
review before approval acceptance. Agents cannot self-approve; a session on
Founder OS or MONI Edge does not automatically identify the human using it.
Device-local biometrics remain local and do not become identity proof by a
boolean in an event. Never publish tokens, raw biometric data or personal records.

### Minimum proposed receipt

The backend, not a browser form, constructs the accepted receipt:

| Field group | Required binding |
|---|---|
| Record | schema/version, approval_id, proposal_id, revision, hash profile and proposal_hash |
| Scope | capability, exact target node/instance/environment and approval policy version from the frozen manifest |
| Human | verified issuer/subject reference, trusted role/scope decision, authentication time and protected evidence reference |
| Decision | explicit APPROVE or REJECT; trusted server received_at, issued_at and expires_at bounded by proposal/session/policy |
| Correlation | request_id and unpredictable pending challenge, bound to person, session, proposal hash and target |
| Integrity/audit | accepted-by verifier identity/version and protected proof reference covering the entire receipt; durable journal record/version |

The production proof format, identity provider and storage are pending choices.
A client-supplied signature, hash or `authenticated=true` is not an accepted
receipt. Capture only necessary identity references in a restricted audit store;
public GitHub holds this design and review history, not real approval records,
session identifiers, credentials or personal data.

### Versioned decision record: v1-draft

Contract identifier: `founder/approval-record/v1-draft`. This is a proposed data
contract, not a new endpoint, receipt issuer, deployed validator or proof format.
A future implementation must reject other versions until explicitly supported;
no best-effort reinterpretation. This section adds the normative bindings to the
receipt groups above. It does not publish a real person's approval record.

| Field | Required value and meaning |
|---|---|
| `schema` | Exact contract identifier above. |
| `approval_id`, `request_id` | Distinct bounded opaque IDs, 1–128 ASCII letters/digits or `_`, `-`, `.`, `:`; no email, session token or personal name. |
| `proposal.id`, `proposal.revision` | Immutable proposal ID and full 40-character lowercase Git commit revision; a branch, PR number or moving tag is insufficient. |
| `proposal.repository`, `proposal.path` | Owner/repository and relative file path of the exact frozen proposal manifest; reject absolute/traversal/ambiguous paths. Repository location is not a node identity. |
| `proposal.hash_profile`, `proposal.file_sha256` | `EXACT_MANIFEST_BYTES_V1` and 64 lowercase hex characters: SHA-256 of the exact manifest file bytes at that repository, revision and path. `proposal_hash` in the receipt groups above means this same digest, not a second digest with a different scope. |
| `scope` | Exact capability, target node, independently enrolled instance, environment and policy version copied from the frozen proposal; no wildcard, expansion or inheritance between Aspire and Viviana. |
| `actor.issuer`, `actor.subject` | Stable opaque principal reference derived by a future trusted backend from authenticated session evidence, never accepted as verified merely because the browser supplies it. |
| `actor.authenticated_at`, `actor.evidence_ref` | Authentication time and restricted reference to the verified session/role decision; no token, credentials, biometric material or raw proof in public GitHub. |
| `decision` | Exactly `APPROVE` or `REJECT`, bound to the same proposal hash, actor and scope. A rejection never grants authority. |
| `reason_code`, `reason` | Required bounded machine code (1–64 ASCII uppercase letters/digits/underscores) and human rationale (1–512 characters); reject control characters and exclude personal/secret data. A decision without a reason is incomplete. |
| `received_at`, `issued_at`, `expires_at` | Explicit UTC timestamps from the future trusted server; the first two record receipt/issuance, the last bounds use. Device time is only a claim. |
| `challenge_ref` | Restricted reference to a pending unpredictable challenge bound to actor/session, request, hash and target; the reference itself is not proof of single use. |
| `integrity_ref`, `journal_ref` | Restricted integrity-proof and durable audit references bound to the complete record; their existence, issuer and verification require separately reviewed infrastructure. |
| `approval_granted`, `can_dispatch` | Both `false` in this documentary contract; schema-valid content is never an execution permission. |

Proposed format checks: bounded UTF-8 JSON object (maximum 16 KiB), exact known
fields, no duplicate keys, invalid/non-finite JSON numbers, ambiguous encodings
or unknown nested fields. A parser checks those rules before interpretation;
format validity does not authenticate any field. A semantic check must also
verify `authenticated_at <= received_at <= issued_at < expires_at`, proposal
expiry, authentication/policy lifetimes, exact scope equality and the digest
recomputed from the fixed artifact. Those checks alone still cannot prove the
actor, permission, integrity, revocation state or challenge consumption.

Acceptance requires the separately verified identity/role authority, permitted
human actor, current proposal revision/policy, integrity proof and atomic durable
challenge consumption described above. Until those dependencies exist, any
locally formatted record remains an **unverified candidate**, not
APPROVED_RECORDED. Never use a JSON flag or schema validation to bypass them.

#### Historical evidence references and MONI consumption

The frozen proposal may include `evidence_manifests` as an explicit list of at most 32 entries
of repository, full commit, relative path, SHA-256 and schema identifier
`atlas/historical-evidence-manifest/v1-draft`. These are references inside the
proposal artifact, so changing any reference changes its bytes/hash and requires
a new decision. Each evidence manifest separately locates files by repository,
commit, path and `file_sha256`, dates the evidence and declares source type,
side effects and limits. No recovered files or operational data are copied here.

After Knowledge Bridge V3 is ready, MONI could ingest approved-format metadata
as untrusted documentary sources, preserve the evidence dates/attributions, and
resolve hashes against the referenced bytes through an independently authorized
read path. This is a proposed adapter boundary, not implemented integration.
MONI must keep format validation, artifact integrity, human authentication and
operational evidence separate. Historical provenance does not establish current
ATLAS status; a human decision cannot change that. Aspire and Viviana remain
UNKNOWN independently, including when a valid historical source declares
`canonicalProducer: aspire` from a Viviana recovery repository.

Additional invalidation conditions are a changed artifact hash/revision, changed
scope/target/policy, an expired session or approval, actor deauthorization,
revocation/supersession, missing integrity/audit evidence or unprovable one-use
state. A record must be rechecked at use time; no automatic renewal, transfer or
fallback approval. Revocations and invalidations append reasoned, dated audit
events instead of rewriting the original person's decision.

#### Machine-readable shape for an unverified candidate

The [v1-draft JSON Schema](contracts/founder-approval-record.v1.schema.json)
formalizes this same `founder/approval-record/v1-draft` identifier; it is not
a second approval protocol or an implemented acceptance endpoint. Valid candidates
are always `record_state=UNVERIFIED_CANDIDATE`, `authentication_verified=false`,
`revocation_status=NOT_CHECKED`, `approval_granted=false`, `can_dispatch=false`
and `operational_status=UNKNOWN`. Actor verification is UNVERIFIED; authenticated_at,
evidence_ref, integrity_ref and journal_ref are null until a separately reviewed
accepted-receipt format and trusted backend exist. Issuer/subject and scope values
in this candidate are claims, not an enrolled person, instance or permission.

The historical exchange locations proposed for review are Aspire's
`continuity-map/ATLAS_HISTORICAL_EVIDENCE_MANIFEST_V1.json` and Viviana's
`docs/continuity/ATLAS_HISTORICAL_EVIDENCE_MANIFEST_V1.json`, using
`atlas/historical-evidence-manifest/v1-draft`. Their sources identify exact
historical bytes through repository/commit/path/file_sha256. When reviewing a
source file, its recomputed SHA-256 must equal that source entry's file_sha256.
A digest for the complete historical manifest is independently computed over
that manifest's exact pinned bytes. The outer proposal's file_sha256 is the
digest of its own frozen proposal artifact, including those evidence references;
these different hash scopes must never be substituted or regenerated to match.

Schema validity cannot recompute any digest, read pinned artifacts, compare
scope with frozen content, establish distinct IDs, enforce date ordering/freshness,
check revocation or consume a challenge. A well-shaped stale/repeated record
or a syntactically valid incorrect hash may still validate structurally; it
remains an unusable unverified candidate. Reject duplicate JSON keys and enforce
the 16 KiB limit before schema validation. Future semantic/trust checks must
fail closed independently; the false constants must not be relaxed to bypass
missing authentication, durable storage or anti-replay. No real approval records,
personal identities, credentials or operational evidence are published here.

### Accept once, revoke explicitly and keep execution separate

Before accepting, the backend must authenticate/authorize the person, recompute
the frozen manifest hash, check current revision/target/policy and freshness,
and atomically consume the pending single-use challenge while persisting the
receipt. A retry of an identical accepted decision is idempotent and returns the
same receipt; it never creates a second authorization. Repeated, expired,
unknown, cross-person/session/target or conflicting decisions are rejected.
After restart, unprovable pending state is invalid, not implicitly accepted.
Authentication, replay storage or durable audit unavailable means fail closed:
an attempt may remain PENDING_UNVERIFIED, never APPROVED_RECORDED.

Proposed lifecycle: PENDING -> APPROVED_RECORDED or REJECTED; expiry, an authorized
revocation or a new proposal revision makes a recorded approval unusable through
EXPIRED, REVOKED or SUPERSEDED. Keep prior events as protected audit history;
do not overwrite the decision or erase its provenance. The authorized revoker,
reason code and time must be recorded. Recheck validity/revocation immediately
before any separately authorized use, with atomic single-use handling when the
capability is not repeatable. The concurrency/commit rule between revocation and
dispatch requires review in a future executor; no dispatch is implemented here.

An approval records human intent for that exact proposal. It is not execution,
merge permission, deployment permission or evidence that the requested action
succeeded. In this documentary phase `approval_granted=false` and
`can_dispatch=false`; no real approval can be accepted through this document.
Any future executor needs its own capability checks, audit and result verification.
An approval cannot elevate ATLAS health: Aspire and Viviana remain UNKNOWN until
independent, authenticated and recent operational evidence exists for each node.

### Review gates before implementation

- Identify provider/custodian and authoritative human/role enrollment; do not reuse the commercial API's authentication as proof without a separate review.
- Agree the bounded manifest schema, exact-byte hash profile and review rendering; test changed bytes, substituted artifacts and stale revisions.
- Review durable receipt/challenge storage, atomic consumption, idempotency, revocation, retention and access controls.
- Add offline tests for anonymous/insufficient-role users, forged person fields, hash/target mismatch, expired/replayed challenges, restart and concurrent decisions, plus a synthetic accepted record.
- Keep synthetic tests distinct from real authentication, human consent, durable anti-replay and operational execution evidence.

#### Explicit proposal-expiry binding

The candidate record must copy the frozen proposal manifest's own `expires_at` into `proposal.expires_at`, in addition to the receipt-level `expires_at`. These timestamps have different scopes: `proposal.expires_at` bounds the proposal revision itself, while the top-level `expires_at` bounds the candidate decision/receipt. A future trusted semantic verifier must recompute `proposal.file_sha256` from the exact pinned manifest bytes and verify that the copied scope and `proposal.expires_at` equal the values inside those same bytes. The effective usable lifetime can never extend beyond either expiry.

This repository review found no reusable, implemented Founder OS identity provider. Existing identity material is descriptive, and MONI Edge/FOSSiBOT is an attention interface rather than a governance identity authority. Therefore this contract continues to require `record_state=UNVERIFIED_CANDIDATE`, `actor.verification_status=UNVERIFIED`, `authentication_verified=false`, `approval_granted=false` and `can_dispatch=false`. The concrete blocker is the absence of a reviewed provider/custodian plus authoritative human enrollment, session verification, role/scope verification and protected evidence reference. No commercial API authentication is promoted into Founder OS authority by this change.
