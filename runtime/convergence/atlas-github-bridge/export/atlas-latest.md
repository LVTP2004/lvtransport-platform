# ATLAS KNOWLEDGE GATEWAY

Generated: 2026-06-05T09:52:21.013Z

## Canonical Truth

- Canonical Producer: aspire
- Gateway: ATLAS Knowledge Gateway
- Latest ZIP: ATLAS_CHATGPT_BRIDGE_2026-06-05T09-52-20-703Z.zip
- Latest ZIP SHA256: eb5f1d6ab7dfeb27e43fa98f03ee64101e449a30e39ea254c5c33c20131d27d3

## Access

- latest.md
- latest.json
- latest.zip
- index.html

## Git Status

```
M apps/admin/src/app/App.js
 M apps/admin/tsconfig.tsbuildinfo
 M apps/api/package.json
 M apps/api/src/auth/middleware/authenticate.ts
 M apps/api/src/auth/middleware/authorize.ts
 M apps/api/src/auth/services/access-control.service.ts
 M apps/api/src/bookings/booking.service.ts
 M apps/api/src/modules/payments/interfaces/payment.interfaces.ts
 M apps/api/src/modules/payments/services/payment-architecture.service.ts
 M apps/api/src/modules/persistence/in-memory-empty.repository.ts
 M apps/api/src/modules/persistence/sqlite.repositories.ts
 M apps/api/src/notifications/notification.types.ts
 M apps/api/src/persistence/repository-contracts.ts
 M apps/api/src/routes/v1/persistence.routes.ts
 M apps/api/src/server.ts
 M apps/api/src/tracking/tracking.service.ts
 M docs/moni/MONI_REPAIR_ORCHESTRATOR_V1.md
 M moni-core/founder/live/moni-repair-queue.json
 M packages/auth/src/index.ts
 M packages/realtime/src/bookings/lifecycle.ts
 M packages/realtime/src/models/realtime.ts
 M pnpm-lock.yaml
 M runtime/convergence/atlas-knowledge-gateway/public/latest.json
?? apps/api/src/bookings/booking.service.ts.bak.20260603-191723
?? apps/api/src/bookings/booking.service.ts.bak.p1-20260603-194925
?? apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z
?? apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925
?? apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300
?? apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713
?? apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802
?? apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-085252
?? apps/api/src/modules/persistence/in-memory-empty.repository.ts.bak.20260602-113755
?? apps/api/src/modules/persistence/in-memory-empty.repository.ts.bak.20260602-120051
?? apps/api/src/modules/persistence/in-memory-empty.repository.ts.bak.20260602-183457
?? apps/api/src/modules/persistence/sqlite.repositories.ts.bak.20260602-183927
?? apps/api/src/operational-memory/cli.ts.bak.20260602-205451
?? apps/api/src/persistence/repository-contracts.ts.bak.20260603-191723
?? apps/api/src/routes/v1/persistence.routes.ts.bak.20260602-120051
?? apps/api/src/websocket/socket.server.ts.bak.forge-v12-2026-06-03T22-01-28-756Z
?? atlas-report.sh
?? atlas-serve-bridge
?? bootstrap-convergence-v1.sh
?? docs/architecture/bootstrap/MONI_API_STABILIZATION_SEQUENCE_V1.md
?? docs/architecture/bootstrap/MONI_AUTONOMOUS_REPAIR_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_AUTOPILOT_SAFE_V1.md
?? docs/architecture/bootstrap/MONI_BOTTLENECK_SURGICAL_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_COGNITIVE_DIRECTOR_V2.md
?? docs/architecture/bootstrap/MONI_CONTRACT_RECONCILIATION_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_DECISION_PATTERN_ENGINE_V1.md
?? docs/architecture/bootstrap/MONI_ERROR_CLASSIFIER_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_EXECUTION_MENTOR_V1.md
?? docs/architecture/bootstrap/MONI_FIXER_PROMOTION_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_FIXER_REGISTRY_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_FIX_STRATEGY_POLICY_V1.md
?? docs/architecture/bootstrap/MONI_LIVE_QUEUE_V3.md
?? docs/architecture/bootstrap/MONI_OBSTACLE_ENGINE_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_SAFE_CYCLE_V2.md
?? docs/architecture/bootstrap/MONI_SURGICAL_LOOP_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_V2_OBSERVER_MENTOR_OPERATOR.md
?? docs/architecture/bootstrap/MONI_WORK_QUEUE_V1.md
?? docs/architecture/bootstrap/PAYMENT_SERVICE_ADAPTER_FIX_V1.md
?? docs/architecture/bootstrap/PAYMENT_SERVICE_ADAPTER_PLAN_V1.md
?? docs/founder/ATLAS_FOUNDER_DIRECTIVE_V1.md
?? docs/founder/directives/
?? docs/governance/
?? docs/moni/MONI_EXECUTIVE_CONTROLLER_V2.md
?? forge/forge-risk-policy-v1.json
?? founder
?? moni-core/engines/
?? moni-core/fixers/
?? moni-core/founder/live/decision-pattern-brief.md
?? moni-core/founder/live/execution-mentor-brief.md
?? moni-core/founder/live/execution-mentor-state.json
?? moni-core/founder/live/forge-risk-report.json
?? moni-core/founder/live/moni-v2-brief.md
?? moni-core/organization/
?? moni-core/policies/fix-strategy-policy-v1.json
?? moni-core/queue/moni-work-queue.mjs
?? moni-core/runtime/autonomous/watchdog/
?? moni-core/v2/
?? operator
?? packages/realtime/src/bookings/lifecycle.ts.bak.20260601212917
?? packages/realtime/src/models/realtime.ts.bak.20260601212917
?? runtime/autopilot/
?? runtime/build/booking-legacy-usage.txt
?? runtime/build/booking-record-inventory.txt
?? runtime/build/moni-bottleneck-now.txt
?? runtime/build/sqlite.repositories.before-root-fix.ts
?? runtime/convergence/ARCHITECTURE.json
?? runtime/convergence/atlas-alert-engine/
?? runtime/convergence/atlas-auto-sync-controller/
?? runtime/convergence/atlas-bloodstream-transfer/
?? runtime/convergence/atlas-bloodstream/
?? runtime/convergence/atlas-chatgpt-bridge/
?? runtime/convergence/atlas-code-delivery/bootstrap-code-delivery.mjs
?? runtime/convergence/atlas-code-delivery/reports/
?? runtime/convergence/atlas-code-delivery/state/
?? runtime/convergence/atlas-command-center/
?? runtime/convergence/atlas-directives-registry/
?? runtime/convergence/atlas-distribution/
?? runtime/convergence/atlas-drift-detector/
?? runtime/convergence/atlas-edge-agent/
?? runtime/convergence/atlas-github-bridge/export-atlas-state.sh
?? runtime/convergence/atlas-global-registry/
?? runtime/convergence/atlas-global/
?? runtime/convergence/atlas-heartbeat/
?? runtime/convergence/atlas-knowledge-gateway/directives/
?? runtime/convergence/atlas-knowledge-gateway/gateway.mjs
?? runtime/convergence/atlas-knowledge-gateway/history/
?? runtime/convergence/atlas-knowledge-gateway/public/index.html
?? runtime/convergence/atlas-knowledge-gateway/public/latest.md
?? runtime/convergence/atlas-knowledge-gateway/public/latest.zip
?? runtime/convergence/atlas-knowledge-gateway/public/operator-latest-output.txt
?? runtime/convergence/atlas-knowledge-gateway/public/operator-state.json
?? runtime/convergence/atlas-knowledge-gateway/state/
?? runtime/convergence/atlas-life-cycle/
?? runtime/convergence/atlas-memory-graph/
?? runtime/convergence/atlas-node-enrollment/
?? runtime/convergence/atlas-operator-bridge/
?? runtime/convergence/atlas-replica-confirmation/
?? runtime/convergence/atlas-replica-manager/
?? runtime/convergence/atlas-role-discovery/
?? runtime/convergence/atlas-role-registry/
?? runtime/convergence/atlas-scheduler/
?? runtime/convergence/atlas-self-healing/
?? runtime/convergence/atlas-sync-hub/
?? runtime/convergence/atlas-universal-scanner/
?? runtime/convergence/atlas-watcher/
?? runtime/convergence/atlas/
?? runtime/convergence/auditor/
?? runtime/convergence/check-convergence.sh
?? runtime/convergence/delta/
?? runtime/convergence/forge/
?? runtime/convergence/fossibot-transfer/
?? runtime/convergence/laws/
?? runtime/convergence/moni-cluster/reports/MONI_CAPABILITY_REGISTRY_V1.md
?? runtime/convergence/moni-cluster/reports/moni-capabilities.txt
?? runtime/convergence/moni/
?? runtime/convergence/oracle/
?? runtime/convergence/protocols/
?? runtime/convergence/report-bundles/
?? runtime/convergence/reports/
?? runtime/decisions/
?? runtime/fixes/
?? runtime/moni-v2/
?? runtime/moni/backups/
?? runtime/moni/cognitive/
?? runtime/moni/cycles/
?? runtime/moni/learning/
?? runtime/queue/
?? scripts/forge/forge-risk-scan.sh
?? scripts/moni-api-stabilization-sequence.sh
?? scripts/moni-autonomous-repair.sh
?? scripts/moni-autopilot-safe.sh
?? scripts/moni-bottleneck-surgical.sh
?? scripts/moni-cognitive-director-v2.sh
?? scripts/moni-contract-reconciliation.sh
?? scripts/moni-decision-pattern.sh
?? scripts/moni-engine-suite.sh
?? scripts/moni-error-classifier.sh
?? scripts/moni-fix-payment-service-adapters.sh
?? scripts/moni-fixer-promotion.sh
?? scripts/moni-fixer-registry.sh
?? scripts/moni-live-queue.sh
?? scripts/moni-mentor.sh
?? scripts/moni-next-fix.sh
?? scripts/moni-obstacle-engine.sh
?? scripts/moni-organization-engine.sh
?? scripts/moni-payment-adapter-plan.sh
?? scripts/moni-safe-cycle-v2.sh
?? scripts/moni-surgical-loop.sh
?? scripts/moni-system-scan.sh
?? scripts/moni-v2.sh
?? scripts/moni-work-queue.sh
```

## Governance Directives

- Directives: 26

- ATLAS_AUDITOR_LAYER_V1 | ATLAS AUDITOR LAYER V1 | 682 bytes | ff5b2d1bfa0125b8f19e5b91cfefcbe654a21aa1df9915b1a9eb1fc865b490a6
- ATLAS_FOUNDER_DIRECTIVE_V1 | ATLAS FOUNDER DIRECTIVE V1 | 494 bytes | 6b823390f859d580e25ecf9de3c0f52e8dba16a397b93671e0b02b14f18f4427
- ATLAS_GENERALIZATION_BOOTSTRAP_V1 | ATLAS GENERALIZATION BOOTSTRAP V1 | 943 bytes | 4aadaa6d5c4b3c19e78e4c7e1120f82b677078cfdc5ab705df7c8ca912c31406
- ATLAS_KNOWLEDGE_MAP_V1 | ATLAS KNOWLEDGE MAP V1 | 1213 bytes | 70952fac3d070cdd9a044abccca61719551c9a1737f5a50d21e72bd152cadb48
- ATLAS_MEMORY_ARCHITECTURE_V1 | ATLAS MEMORY ARCHITECTURE V1 | 812 bytes | c0190d950f1e7192cbf7e53f5c963a6f538f42b2d4b5c3759f29e0a63ca2d7b0
- ATLAS_MEMORY_INDEX_V1 | ATLAS MEMORY INDEX V1 | 810 bytes | e3fdbf6c0741ebea0c86380a5608aa95ccb136795867fa47bc037d1c393efe16
- BACKUP_ARCHAEOLOGY_LAW_V1 | BACKUP ARCHAEOLOGY LAW V1 | 680 bytes | 8de1ce3f62fa46b986dc30a38fc77270cb85548343936c42c4469acccd764fa6
- DELTA_QUEUE_PROTOCOL_V1 | DELTA QUEUE PROTOCOL V1 | 861 bytes | 0d701b120ca28c3356d021eeafd83ec03f936c959d962bc4ad9549ef698fe534
- DELTA_TEAM_LAYER_V1 | DELTA TEAM LAYER V1 | 1176 bytes | 540177f317aa16154127514458e9bb0d7fad753d1a7d43026cd804d2ca71084a
- EVENT_SEVERITY_MODEL_V1 | EVENT SEVERITY MODEL V1 | 532 bytes | edbeadf6c34b6e2bcce5c131d0e5062836aa113894c69312ade0c8faba3aaee7
- FORGE_EXECUTION_ENGINE_V1 | FORGE EXECUTION ENGINE V1 | 936 bytes | 8414d5e73d4c2274ed01b8a76c9a652ebda5ef2af59641a0cbc94ac0ceaae011
- FORGE_SAFE_RUNNER_PROPOSAL_V1 | FORGE SAFE RUNNER PROPOSAL V1 | 762 bytes | 8e10114b09d58c6d035554f611c3c6dad575ea152eeef13228b5285caf12bed2
- FORGE_SAFE_RUNNER_V1 | FORGE SAFE RUNNER V1 | 868 bytes | ebcba00cbd64375edb2de2c1a8ee86d370de443bc6245aa9713881716a887102
- FOUNDER_AWARENESS_LOOP_MAP_V1 | FOUNDER AWARENESS LOOP MAP V1 | 4913 bytes | 72dd3587ef89f4e6f594ce35343294dd951cb95beb02e6dee59210fa84771c1d
- FOUNDER_AWARENESS_LOOP_V1 | FOUNDER AWARENESS LOOP V1 | 837 bytes | 253ca273e0d14cd3a35638ac0a3d6e29845a4e4ce396bc60923f42cf0353df3e
- FOUNDER_NOTIFICATION_POLICY_V1 | FOUNDER NOTIFICATION POLICY V1 | 808 bytes | 642f85fb66fff682dfa237ebcfef2f350a4cffab51f38b44adfb6eb5d6857c98
- FOUNDER_OS_CONSTITUTION | FOUNDER OS CONSTITUTION | 3157 bytes | 9e0b984d7c8715cee79c0593faff8fa0fec1b7aee9e1c7127384f12cc5f5e475
- FOUNDER_OS_DELEGATED_APPROVAL_POLICY_V1 | FOUNDER OS DELEGATED APPROVAL POLICY V1 | 3879 bytes | 066784d623c083383b77bca78c45136f8fedf7b10ae4e4740b5cb9a03be565bd
- FOUNDER_OS_EXECUTION_FLOW_V1 | FOUNDER OS EXECUTION FLOW V1 | 1331 bytes | f9e876868279f273a720dc52e9a1267e7fc17bdc26e8df4f90f487099e50e794
- LEONIDAS_OPERATIONAL_AGENT_V1 | LEONIDAS OPERATIONAL AGENT V1 | 1118 bytes | f54a39aef5c6fd096d47456a6e1344b65946ba0eb90bc3ed451a7051b8e6906e
- LVTP_GOVERNANCE_QUARTET_V1 | LVTP GOVERNANCE QUARTET V1 | 2577 bytes | 0c1bb36108838755863bc356557bde24beb6dab2365d2d21e7ab53ee581c6c14
- MONI_APPROVAL_AUTOMATION_V1 | MONI APPROVAL AUTOMATION V1 | 501 bytes | a9f598cc86141bd3ec7c8ab52f75b4c6a7d4acbcd3aa1c1f775d023ef216d5cb
- MONI_INTELLIGENT_GOVERNANCE_BOOTSTRAP_V1 | MONI INTELLIGENT GOVERNANCE BOOTSTRAP V1 | 1267 bytes | bdfa28e56ae333e24bb7d5a66cce71fdf7b78d2d01d7d2d652f0a61875d1cb58
- MONI_VERIFICATION_RUNNER_V1 | MONI VERIFICATION RUNNER V1 | 723 bytes | fd6b021f6d7202ede91ee9316272f12d0875577209e4bcd52cb1c4d14efea05d
- PROTOCOL_RUNNER_AND_ATLAS_V1 | PROTOCOL RUNNER V1 + ATLAS V1 | 560 bytes | f953361d238f79bb8809b3a9351d078479e4f779165a6c46e2a1a00620c05661
- VIVIANA_SOVEREIGN_FACTORY_V1 | VIVIANA SOVEREIGN FACTORY V1 | 893 bytes | 003f8352582dfab19ad79e2206670567a429027ab4f5b48e5d8eb395f40dfbc3


---

## commandCenter

# ATLAS REPLICATION COMMAND CENTER V1

Generated: 2026-06-05T09:52:20.591Z

## Cluster Health

- Status: yellow
- Canonical Producer: aspire
- Nodes: 6
- Healthy: 2
- Warning: 4
- Critical: 0
- Replication Coverage: 33%

## Runtime

- Scheduler Status: green
- Scheduler Cycle OK: true
- Confirmations: 1
- Alerts: 4
- Self Healing Actions: 4

## Canonical Artifacts

- Manifest Hash: e5af1d037bf07b9a35c24be1a321cc2cfdb89d2d6478a9e00e959b749808ccc7
- Bundle Hash: 7b8c2673ec13dea45c4c5891b5656013e8a875f833d2361f5dba05e613513aff

## Nodes

- MONI Core Canada VPS | online | unknown | DRIFT=WARNING | Replication state unknown
- Aspire | online | unknown | DRIFT=NONE | Canonical producer
- Viviana | online | unknown | DRIFT=WARNING | Replication state unknown
- Beam | online | unknown | DRIFT=WARNING | Replication state unknown
- Fossibot Edge | online | unknown | DRIFT=NONE | Replica confirmed sync
- Galaxy | online | unknown | DRIFT=WARNING | Replication state unknown


## Contract

- Command Center is read-only.
- It consolidates scheduler, drift, alerts, healing and confirmations.
- It does not mutate canonical state.
- Aspire remains canonical producer.
- Replicas must prove sync before being marked healthy.

---

## drift

# ATLAS DRIFT DETECTOR REPORT V1

Generated: 2026-06-05T09:52:20.296Z

## Canonical Source

- Node: aspire
- Manifest Hash: e5af1d037bf07b9a35c24be1a321cc2cfdb89d2d6478a9e00e959b749808ccc7
- Bundle Hash: 7b8c2673ec13dea45c4c5891b5656013e8a875f833d2361f5dba05e613513aff

## Summary

- Total Replicas: 6
- NONE: 2
- WARNING: 4
- CRITICAL: 0

## Replica Checks

- MONI Core Canada VPS | online | unknown | DRIFT=WARNING | Replication state unknown
- Aspire | online | unknown | DRIFT=NONE | Canonical producer
- Viviana | online | unknown | DRIFT=WARNING | Replication state unknown
- Beam | online | unknown | DRIFT=WARNING | Replication state unknown
- Fossibot Edge | online | unknown | DRIFT=NONE | Replica confirmed sync
- Galaxy | online | unknown | DRIFT=WARNING | Replication state unknown


## Contract

- Aspire remains canonical producer.
- Replicas are not trusted until drift is NONE.
- WARNING requires sync review.
- CRITICAL requires operator attention or self-healing.
- Drift state is written before alerts.

---

## alerts

# ATLAS ALERT ENGINE REPORT V1

Generated: 2026-06-05T09:52:20.397Z

## Summary

- Total Alerts: 4
- Warnings: 4
- Critical: 0

## Alerts

- WARNING | MONI Core Canada VPS | WARNING | Replication state unknown | action=sync-review
- WARNING | Viviana | WARNING | Replication state unknown | action=sync-review
- WARNING | Beam | WARNING | Replication state unknown | action=sync-review
- WARNING | Galaxy | WARNING | Replication state unknown | action=sync-review


## Contract

- Alert Engine consumes Drift Detector state.
- Alerts are immutable event records.
- WARNING alerts require sync review.
- CRITICAL alerts require operator review or self-healing.
- Alert state must never erase Drift Detector state.

---

## healing

# ATLAS SELF HEALING REPORT V1

Generated: 2026-06-05T09:52:20.485Z

## Canonical Inputs

- Manifest Present: true
- Manifest Hash: e5af1d037bf07b9a35c24be1a321cc2cfdb89d2d6478a9e00e959b749808ccc7
- Bundle Present: true
- Bundle Hash: 7b8c2673ec13dea45c4c5891b5656013e8a875f833d2361f5dba05e613513aff

## Summary

- Total Actions: 4
- Planned: 4

## Planned Actions

- MONI Core Canada VPS | REQUEST_REPLICA_CONFIRMATION | planned | Replication state unknown
- Viviana | REQUEST_REPLICA_CONFIRMATION | planned | Replication state unknown
- Beam | REQUEST_REPLICA_CONFIRMATION | planned | Replication state unknown
- Galaxy | REQUEST_REPLICA_CONFIRMATION | planned | Replication state unknown


## Contract

- Self Healing consumes Alert Engine state.
- It does not mutate replicas blindly.
- It generates explicit corrective actions first.
- Replicas must prove sync through confirmation files.
- Canonical bundle remains ATLAS_SYNC_OUTBOX.zip.

---

## confirmations

# ATLAS REPLICA CONFIRMATION REPORT

Generated: 2026-06-04T22:59:58.489Z

## Summary

Confirmations: 1

- fossibot-edge | confirmed

---

## scheduler

# ATLAS SCHEDULER REPORT V1

Generated: 2026-06-05T09:52:18.502Z

## Status

- Cycle OK: true
- Auto Sync Status: green
- OK Steps: 7/7
- Failed Steps: 0

## Contract

- Scheduler runs the full ATLAS auto-sync chain.
- Failed cycles are logged but do not erase previous valid state.
- Canonical source remains Aspire.
- Replicas consume only verified Sync Hub bundles.

## Last Command

```
node runtime/convergence/atlas-auto-sync-controller/controller.mjs
```

---

## directivesRegistry

# ATLAS DIRECTIVES REGISTRY V1

Generated: 2026-06-05T09:52:20.863Z

## Summary

- Directives: 26
- Source: docs/founder
- Gateway: runtime/convergence/atlas-knowledge-gateway/directives

## Directives

- ATLAS_AUDITOR_LAYER_V1 | ATLAS AUDITOR LAYER V1 | 682 bytes | ff5b2d1bfa0125b8f19e5b91cfefcbe654a21aa1df9915b1a9eb1fc865b490a6
- ATLAS_FOUNDER_DIRECTIVE_V1 | ATLAS FOUNDER DIRECTIVE V1 | 494 bytes | 6b823390f859d580e25ecf9de3c0f52e8dba16a397b93671e0b02b14f18f4427
- ATLAS_GENERALIZATION_BOOTSTRAP_V1 | ATLAS GENERALIZATION BOOTSTRAP V1 | 943 bytes | 4aadaa6d5c4b3c19e78e4c7e1120f82b677078cfdc5ab705df7c8ca912c31406
- ATLAS_KNOWLEDGE_MAP_V1 | ATLAS KNOWLEDGE MAP V1 | 1213 bytes | 70952fac3d070cdd9a044abccca61719551c9a1737f5a50d21e72bd152cadb48
- ATLAS_MEMORY_ARCHITECTURE_V1 | ATLAS MEMORY ARCHITECTURE V1 | 812 bytes | c0190d950f1e7192cbf7e53f5c963a6f538f42b2d4b5c3759f29e0a63ca2d7b0
- ATLAS_MEMORY_INDEX_V1 | ATLAS MEMORY INDEX V1 | 810 bytes | e3fdbf6c0741ebea0c86380a5608aa95ccb136795867fa47bc037d1c393efe16
- BACKUP_ARCHAEOLOGY_LAW_V1 | BACKUP ARCHAEOLOGY LAW V1 | 680 bytes | 8de1ce3f62fa46b986dc30a38fc77270cb85548343936c42c4469acccd764fa6
- DELTA_QUEUE_PROTOCOL_V1 | DELTA QUEUE PROTOCOL V1 | 861 bytes | 0d701b120ca28c3356d021eeafd83ec03f936c959d962bc4ad9549ef698fe534
- DELTA_TEAM_LAYER_V1 | DELTA TEAM LAYER V1 | 1176 bytes | 540177f317aa16154127514458e9bb0d7fad753d1a7d43026cd804d2ca71084a
- EVENT_SEVERITY_MODEL_V1 | EVENT SEVERITY MODEL V1 | 532 bytes | edbeadf6c34b6e2bcce5c131d0e5062836aa113894c69312ade0c8faba3aaee7
- FORGE_EXECUTION_ENGINE_V1 | FORGE EXECUTION ENGINE V1 | 936 bytes | 8414d5e73d4c2274ed01b8a76c9a652ebda5ef2af59641a0cbc94ac0ceaae011
- FORGE_SAFE_RUNNER_PROPOSAL_V1 | FORGE SAFE RUNNER PROPOSAL V1 | 762 bytes | 8e10114b09d58c6d035554f611c3c6dad575ea152eeef13228b5285caf12bed2
- FORGE_SAFE_RUNNER_V1 | FORGE SAFE RUNNER V1 | 868 bytes | ebcba00cbd64375edb2de2c1a8ee86d370de443bc6245aa9713881716a887102
- FOUNDER_AWARENESS_LOOP_MAP_V1 | FOUNDER AWARENESS LOOP MAP V1 | 4913 bytes | 72dd3587ef89f4e6f594ce35343294dd951cb95beb02e6dee59210fa84771c1d
- FOUNDER_AWARENESS_LOOP_V1 | FOUNDER AWARENESS LOOP V1 | 837 bytes | 253ca273e0d14cd3a35638ac0a3d6e29845a4e4ce396bc60923f42cf0353df3e
- FOUNDER_NOTIFICATION_POLICY_V1 | FOUNDER NOTIFICATION POLICY V1 | 808 bytes | 642f85fb66fff682dfa237ebcfef2f350a4cffab51f38b44adfb6eb5d6857c98
- FOUNDER_OS_CONSTITUTION | FOUNDER OS CONSTITUTION | 3157 bytes | 9e0b984d7c8715cee79c0593faff8fa0fec1b7aee9e1c7127384f12cc5f5e475
- FOUNDER_OS_DELEGATED_APPROVAL_POLICY_V1 | FOUNDER OS DELEGATED APPROVAL POLICY V1 | 3879 bytes | 066784d623c083383b77bca78c45136f8fedf7b10ae4e4740b5cb9a03be565bd
- FOUNDER_OS_EXECUTION_FLOW_V1 | FOUNDER OS EXECUTION FLOW V1 | 1331 bytes | f9e876868279f273a720dc52e9a1267e7fc17bdc26e8df4f90f487099e50e794
- LEONIDAS_OPERATIONAL_AGENT_V1 | LEONIDAS OPERATIONAL AGENT V1 | 1118 bytes | f54a39aef5c6fd096d47456a6e1344b65946ba0eb90bc3ed451a7051b8e6906e
- LVTP_GOVERNANCE_QUARTET_V1 | LVTP GOVERNANCE QUARTET V1 | 2577 bytes | 0c1bb36108838755863bc356557bde24beb6dab2365d2d21e7ab53ee581c6c14
- MONI_APPROVAL_AUTOMATION_V1 | MONI APPROVAL AUTOMATION V1 | 501 bytes | a9f598cc86141bd3ec7c8ab52f75b4c6a7d4acbcd3aa1c1f775d023ef216d5cb
- MONI_INTELLIGENT_GOVERNANCE_BOOTSTRAP_V1 | MONI INTELLIGENT GOVERNANCE BOOTSTRAP V1 | 1267 bytes | bdfa28e56ae333e24bb7d5a66cce71fdf7b78d2d01d7d2d652f0a61875d1cb58
- MONI_VERIFICATION_RUNNER_V1 | MONI VERIFICATION RUNNER V1 | 723 bytes | fd6b021f6d7202ede91ee9316272f12d0875577209e4bcd52cb1c4d14efea05d
- PROTOCOL_RUNNER_AND_ATLAS_V1 | PROTOCOL RUNNER V1 + ATLAS V1 | 560 bytes | f953361d238f79bb8809b3a9351d078479e4f779165a6c46e2a1a00620c05661
- VIVIANA_SOVEREIGN_FACTORY_V1 | VIVIANA SOVEREIGN FACTORY V1 | 893 bytes | 003f8352582dfab19ad79e2206670567a429027ab4f5b48e5d8eb395f40dfbc3


## Contract

- Directives define Atlas governance.
- Directives must be explicit markdown artifacts.
- Directives are copied into the Knowledge Gateway.
- New Atlas components must obey active directives.
- Founder intent remains canonical.

---

## chatgptBridgeState

{
  "generatedAt": "2026-06-05T09:52:20.703Z",
  "report": "runtime/convergence/atlas-chatgpt-bridge/reports/ATLAS_CHATGPT_BRIDGE_REPORT_2026-06-05T09-52-20-703Z.md",
  "includedFiles": [
    "runtime/convergence/atlas-command-center/reports/ATLAS_COMMAND_CENTER_REPORT.md",
    "runtime/convergence/atlas-drift-detector/reports/ATLAS_DRIFT_DETECTOR_REPORT.md",
    "runtime/convergence/atlas-alert-engine/reports/ATLAS_ALERT_ENGINE_REPORT.md",
    "runtime/convergence/atlas-self-healing/reports/ATLAS_SELF_HEALING_REPORT.md",
    "runtime/convergence/atlas-replica-confirmation/reports/ATLAS_REPLICA_CONFIRMATION_REPORT.md",
    "runtime/convergence/atlas-scheduler/reports/ATLAS_SCHEDULER_REPORT.md"
  ]
}