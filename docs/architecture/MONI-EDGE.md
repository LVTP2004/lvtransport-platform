# MONI Edge

Status: architecture record / prototype integration
Last updated: 2026-11-12

## Purpose

MONI Edge is the proposed mobile edge and secure control surface for LVTP CORE. The initial device is a FOSSiBOT Android phone running Termux. The long-term target is an Android application backed by a persistent MONI Edge Core service.

MONI Edge is not intended to become an unrestricted remote shell. It should expose authenticated, auditable, capability-scoped actions and approvals.

## Recorded event-delivery test

The architecture record reports the following test, recorded by 2026-11-12; this review did not repeat it:

- MONI Edge prototype exists on the FOSSiBOT under `~/moni-edge`.
- Node.js listener: `tools/nats-subscribe.js`.
- Listener subscribes to NATS subject `moni.events`.
- Listener connects to the Aspire NATS endpoint through Tailscale.
- Aspire successfully published a JSON test event to `moni.events`.
- FOSSiBOT received and displayed that event while the listener was connected.

Reported test path:

`Aspire -> NATS -> Tailscale -> FOSSiBOT -> MONI Edge listener`

The reported test establishes delivery of that event while the listener was connected.
It does NOT prove persistence, command execution, approval enforcement, biometric
authorization, GitHub control, VS Code/Codex control, or bidirectional task execution.

Provenance: [pre-review MONI Edge record](https://github.com/LVTP2004/lvtransport-platform/blob/4032fa95db24096a8a2def5caa35ba9070549279/docs/architecture/MONI-EDGE.md).
That record does not provide a separate test timestamp, event ID, authenticated
sender proof or pinned execution artifact. Preserve the reported success without
turning this documentation review into a new live verification. Current listener,
NATS availability, device identity and per-subject permissions remain unverified.
Delivery is not evidence of an authenticated ATLAS instance on Aspire or Viviana.

## Proposed Pro capabilities

Future MONI Edge may provide:

- Android dashboard for LVTP CORE.
- Notifications for agent/task/node events.
- Approval and rejection workflows.
- Local biometric confirmation for high-risk approvals.
- Bidirectional messaging with MONI/LVTP CORE.
- Node status for Aspire, Minisforum and Viviana Linux.
- GitHub PR/issue/check visibility through authorized backend capabilities.
- Codex/Devstral task status and scoped approvals.
- MONI Bridge/MCP status and authorized operations.
- Docker/service actions exposed as predefined capabilities.
- Audit history for requests, decisions and results.
- Offline/reconnect handling and durable delivery through JetStream or an equivalent persistence layer.
- Signed device identity and signed approval envelopes.
- Watchdog/autostart behavior on Android.

## Proposed security model

- Biometric verification occurs locally on Android.
- Raw fingerprints/templates never leave the device.
- A biometric success may authorize a signed decision; it is not itself transmitted as biometric data.
- Every privileged operation has an explicit capability, target, request ID, expiry and audit record.
- Approval is scoped to one request/action unless policy explicitly states otherwise.
- NATS transport connectivity alone is not authorization. Device, NATS publisher/subscriber, MONI runtime, GitHub integration and human identities require separate credentials/scopes; permissions do not transfer between them.
- Avoid unrestricted remote shell as the normal control mechanism.

## Proposed protocol direction

Examples of capability names (design only):

- `node.status`
- `github.read_pr`
- `codex.approve_task`
- `service.restart_authorized`
- `deployment.approve`

An approval message should eventually contain at least request ID, requester identity, target node, capability, human-readable action, risk classification, expiry, decision and cryptographic proof.

## Relationship to Founder OS

Founder OS is the desktop/governance experience. MONI Edge is the mobile extension. Both should operate over the same LVTP CORE/MONI control model rather than becoming independent sources of truth.

## Next engineering milestones

1. Define MONI Edge Core v1 protocol and message schemas.
2. Add FOSSiBOT -> NATS response path and correlation IDs.
3. Add device identity/authentication.
4. Add durable delivery for important events.
5. Implement approval request/decision lifecycle and audit log.
6. Add Android notification and biometric UI.
7. Build the Android MONI Edge application over the proven core.
