# MONI Unified Control Plane

Status: architecture proposal
Last updated: 2026-11-12

## Goal

Provide one logical communication entry point for Codex, Founder OS, MONI Edge and future authorized clients while preserving specialized protocols and systems underneath.

The objective is not to force MCP, NATS, GitHub and Knowledge V2 through one physical protocol or port. The objective is a single control plane with clear responsibilities, identity, authorization, correlation and audit.

## Recorded integration surfaces; current availability not verified

Earlier architecture records describe the following separate surfaces. This documentation review did not query them, verify their current endpoints or establish their permissions:

- Codex -> MONI Bridge through MCP/HTTP (port 8770 is a recorded configuration reference, not a verified current endpoint).
- Codex / VS Code -> GitHub repositories and workspaces.
- MONI / agents -> Knowledge V2.
- Nodes and MONI Edge -> NATS event transport.
- MONI Edge prototype -> FOSSiBOT through NATS/Tailscale.
- GitHub -> durable code, documentation, commit and PR history.

These should remain specialized systems, but clients should not need to understand every internal connection. Listing a surface does not establish a deployed unified gateway or an authenticated route to a node.

## Proposed architecture

```text
Founder OS / Codex / MONI Edge (independent authorized clients)
                         |
              proposed MONI Gateway
               /        |         \
     Knowledge V2      GitHub     MONI capabilities
                                   |
                          NATS; durability proposed
                         /    |     |       \
                    Aspire  Minisforum Viviana  MONI Edge / FOSSiBOT
```

This is a logical proposal, not deployment topology. MONI Edge is an independent
client/device, not a child of Minisforum. MCP exposes capabilities; it does not
require all GitHub, Knowledge or NATS traffic to pass through one protocol.

## One logical entry point

For Codex, the desired experience is one registered MONI MCP endpoint. Codex discovers MONI capabilities through that interface instead of manually coordinating Knowledge V2, GitHub, nodes and the event bus.

Illustrative capability surface (design only):

- `knowledge.search`
- `github.read`
- `github.pr.status`
- `node.status`
- `node.task.submit`
- `moni.events.publish`
- `moni.approval.request`
- `edge.status`
- `edge.notify`
- `codex.task.register`
- `codex.result.publish`

The gateway may fulfill a capability locally, call GitHub/Knowledge, or translate it into a NATS request to the correct node.

## Responsibilities

### MCP

MCP is the AI/tool capability interface. It is the preferred logical entry surface for Codex and compatible agents.

MCP should expose typed, bounded operations. It should not become the durable event store.

### NATS

NATS is the internal live message bus for node/service communication.

Use it for event delivery, request/reply, status and task routing between authenticated components.

### JetStream or equivalent durable layer

Critical events must survive disconnects. Approval requests, important task results and other state transitions should not depend on a subscriber being online at the instant of publication.

Durable messaging is proposed; the existing FOSSiBOT test established live NATS delivery only.

### GitHub

GitHub remains the durable source for code, architecture documents, commits, PRs and review history.

GitHub is not the event bus.

### Knowledge V2

Knowledge V2 remains the knowledge/context retrieval layer.

Knowledge is not the transport or authorization system.

### MONI Gateway / LVTP CORE

The proposed gateway would unify capability discovery/routing, identity checks, policy checks, request correlation, translation between MCP and internal services, and audit emission. This document does not establish an implementation of those checks.

## Unified request envelope

Every important operation should carry a common envelope regardless of transport:

```text
request_id
correlation_id
source
source_identity
target
capability
timestamp
expires_at
risk
auth_context
payload
```

Responses should include the original request/correlation IDs, responder identity, status, result/error and audit metadata.

## Repositories, nodes, runtimes and runners

| Entity | Meaning and boundary |
|---|---|
| `LVTP2004/lvtransport-platform` | Product source and architecture proposal; a repository is not an execution node. Its commercial API is outside this control-plane change. |
| `LVTP2004/moni-core-runtime` | MONI source, contracts and review history; repository presence does not establish the running build. |
| `LVTP2004/aspire-recovery` | Recovered evidence associated with Aspire; not an endpoint or an inventory of currently installed services. |
| `LVTP2004/viviana-linux-recovery` | Recovered evidence associated with Viviana; does not inherit Aspire's identity or credentials. |
| Aspire / Minisforum / Viviana | Distinct machines/nodes with independently identified runtime instances, builds, principals and permissions. |
| FOSSiBOT / MONI Edge | Device and mobile runtime/client; neither is a GitHub runner identity or blanket human authority. |
| GitHub Actions runner | Execution process/account assigned a job; labels select eligible runners but do not authenticate its machine, MONI or ATLAS instance. |

A checkout or workflow result links a revision to a job only within its evidence.
It does not prove that a service is deployed on the named node. Even a runner
located on Aspire must have separately verified identity and scoped permissions;
it must not inherit authority from ATLAS, MONI, the NATS server, the device or
the human operator.

## Identity and node separation

Aspire, Minisforum, Viviana Linux and FOSSiBOT are independent identities.

A gateway must never infer that one node is healthy or authorized because another node is healthy. Runtime status must be authenticated and recent for the specific target.

## Authorization model

Connectivity does not grant authority. The common envelope above is a proposal,
not authentication: source_identity, target and auth_context in JSON are claims.
A trusted boundary must derive identity and scope from validated credentials,
then bind request, target node/instance, capability, expiry and response.

Keep MCP client authorization, NATS publisher/subscriber permissions, GitHub
installation/token scopes, Knowledge owner/session ACLs, runtime identities and
human approval separate. Permission in one system is not delegated to another.
Knowledge search results and GitHub documents do not authorize execution.
Neither Tailscale reachability nor delivery on moni.events authenticates the
application sender or grants a recipient approval authority.

Until those bindings and replay protection are implemented and verified, node
and ATLAS connectivity remain UNKNOWN independently for Aspire and Viviana.
A future gateway must reject absent/invalid identity or scope, stale/repeated
responses and unknown instance/build; no permissive fallback or cross-node reuse.

- Capabilities are explicitly scoped.
- High-risk capabilities may require human approval.
- MONI Edge approval is scoped to a specific request and expiry.
- Biometric verification stays local to the FOSSiBOT/Android device.
- Raw biometric data is never sent through NATS, MCP, GitHub or Knowledge.
- Avoid unrestricted remote shell as the normal control path.
- Deployment, merge and infrastructure modification remain separately authorized actions.

## Proposed example flow: Codex asks for Aspire status

```text
Codex
  |
  | MCP: node.status(target=aspire)
  v
MONI Gateway
  |
  | authenticate + authorize + correlate
  v
NATS request
  |
  v
Aspire agent
  |
  | signed/authenticated response
  v
MONI Gateway
  |
  v
Codex
```

## Proposed example flow: high-risk approval

```text
Codex/agent -> MONI Gateway -> policy marks approval required
                               |
                               v
                         durable approval event
                               |
                               v
                           MONI Edge
                               |
                         local biometric
                               |
                        approve / reject
                               |
                               v
                         MONI Gateway
                               |
                    execute only scoped capability
                               |
                               v
                           audit result
```

## Migration strategy

### Phase 1 - contract

Define common request/response envelopes, capability names, identities, risk levels and audit fields. Do not change production routing yet.

### Phase 2 - gateway facade

Expose existing read-only capabilities through the MONI MCP endpoint: knowledge search, GitHub reads and authenticated node status.

### Phase 3 - NATS request/reply

Add correlated request/reply between the gateway and Aspire/Minisforum/Viviana/FOSSiBOT while keeping each node identity separate.

### Phase 4 - durability

Introduce JetStream or an equivalent durable layer for approvals and important task events. Define deduplication/idempotency rules.

### Phase 5 - approvals

Implement approval lifecycle, expiry, signatures and audit. Connect Founder OS and MONI Edge to the same approval state.

### Phase 6 - controlled actions

Only after the previous controls are verified, expose carefully scoped write capabilities such as approved service operations or deployment actions.

## Success criteria

The architecture is successful when:

1. Codex can use one MONI MCP registration for authorized LVTP capabilities.
2. Internal services remain independently replaceable and specialized.
3. Every cross-node request has identity and correlation.
4. Important events survive temporary disconnects.
5. Duplicate delivery cannot cause duplicate privileged execution.
6. Founder OS and MONI Edge see the same canonical approval/task state.
7. GitHub remains the durable engineering record.
8. No client gains unrestricted authority merely by being connected.

## Verified vs proposed

Recorded evidence, with limited scope:

- GitHub contains this engineering proposal and its review history.
- The [MONI Edge record at the reviewed commit](https://github.com/LVTP2004/lvtransport-platform/blob/4032fa95db24096a8a2def5caa35ba9070549279/docs/architecture/MONI-EDGE.md) reports an Aspire-published event received by a connected FOSSiBOT listener on `moni.events` over NATS/Tailscale.
- That record was updated on 2026-11-12; it does not supply a separate event timestamp, event/correlation ID, authenticated sender proof or pinned execution artifact. This review did not repeat the test. Its supported claim is the reported point-to-point live delivery during that test, not current connectivity.
- MONI MCP/Bridge is a recorded integration surface; this review does not certify endpoint availability, exposed tools or authorization. Knowledge V2 indexing, ACL enforcement and freshness were not tested here.

The event test does not prove authenticated node status, ATLAS health, bidirectional
request/reply, durable delivery, approvals, remote execution or complete gateway
integration. These require separate attributable evidence per component.

Proposed in this document:

- Unified MONI Gateway capability facade.
- Common request envelope.
- Gateway-to-node correlated request/reply contract.
- JetStream durability for critical workflows.
- Unified Founder OS / MONI Edge approval state.
- Capability-scoped controlled actions.

This document is an architecture proposal and does not authorize deployment or runtime modification.
