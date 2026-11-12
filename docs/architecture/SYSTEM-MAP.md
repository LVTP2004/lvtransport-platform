# LVTP System Map

Status: architecture map
Last updated: 2026-11-12

## Conceptual map

```text
                     GitHub
                        |
             VS Code / Codex / Devstral
                        |
                MONI Bridge / MCP
                        |
                    LVTP CORE
                        |
                      MONI
                        |
                NATS / durability proposed
             /          |          \
          Aspire     Minisforum    Viviana Linux
             \          |          /
                 private networking
                        |
                    MONI Edge
                     FOSSiBOT
                        |
              proposed approvals/status

Founder OS is the desktop governance/control surface over the same LVTP CORE/MONI model.
```

## Verified vs proposed

Reported event-delivery test, recorded by 2026-11-12; not repeated in this review:

- FOSSiBOT MONI Edge Node listener connects to Aspire NATS through Tailscale.
- Aspire published a test event to `moni.events` and the connected FOSSiBOT listener received it during that test.

Source: [MONI Edge record at the reviewed commit](https://github.com/LVTP2004/lvtransport-platform/blob/4032fa95db24096a8a2def5caa35ba9070549279/docs/architecture/MONI-EDGE.md).
The record lacks a separate event timestamp/ID and authenticated sender proof.
Its scope is reported delivery, not current node/service status or authenticated
application identity. Aspire and Viviana ATLAS connectivity remain UNKNOWN.

Proposed/not established by that test:

- Durable JetStream delivery.
- Android MONI Edge application.
- Biometric approval enforcement.
- Bidirectional task protocol.
- GitHub/VS Code/Codex control from FOSSiBOT.
- Unified Founder OS dashboard.

## Repositories and execution identities

This map is conceptual, not a machine/runner allocation diagram. The four
repositories (moni-core-runtime, aspire-recovery, viviana-linux-recovery and
lvtransport-platform) store source or evidence; they are not nodes. Recovery
copies do not establish current deployments. A GitHub Actions runner is a
separate execution account/process; runner labels do not authenticate a node
or application. MONI Edge is an independent client on FOSSiBOT, not hosted by
Minisforum. See [the control-plane identity boundaries](MONI-UNIFIED-CONTROL-PLANE.md#repositories-nodes-runtimes-and-runners).

## Architectural boundary

Connectivity is not authority. Every future control action should pass identity, policy, capability and audit checks before execution.
