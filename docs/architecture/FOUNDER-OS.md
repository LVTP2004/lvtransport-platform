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
