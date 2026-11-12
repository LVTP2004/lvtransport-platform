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
                NATS / durable bus
             /          |          \
          Aspire     Minisforum    Viviana Linux
             \          |          /
                 private networking
                        |
                    MONI Edge
                     FOSSiBOT
                        |
              mobile approvals/status

Founder OS is the desktop governance/control surface over the same LVTP CORE/MONI model.
```

## Verified vs proposed

Verified as of 2026-11-12:

- FOSSiBOT MONI Edge Node listener connects to Aspire NATS through Tailscale.
- Aspire can publish a live event to `moni.events` and the connected FOSSiBOT listener receives it.

Proposed/not established by that test:

- Durable JetStream delivery.
- Android MONI Edge application.
- Biometric approval enforcement.
- Bidirectional task protocol.
- GitHub/VS Code/Codex control from FOSSiBOT.
- Unified Founder OS dashboard.

## Architectural boundary

Connectivity is not authority. Every future control action should pass identity, policy, capability and audit checks before execution.
