# MONI REPAIR ORCHESTRATOR CONSOLIDATION V1

MONI already contains the necessary components for autonomous repair.

Required consolidation:

1. Universal Scanner = observe all files, reports, runtime, build logs, drift, duplicates.
2. Error Classifier = classify build/runtime failures.
3. Decision Pattern Engine = choose safe next action.
4. Fixer Registry = select approved fixer.
5. Safe Cycle = enforce backup, limited scope, verifier, rollback.
6. Work Queue = continue next issue after successful verification.
7. Founder Gate = block dangerous actions.

Operating contract:

Observe
Analyze
Locate root cause
Propose patch
Evaluate impact
Modify
Verify
Rollback if failed
Continue

MONI must not create unlimited scripts.
MONI must reuse existing scanners, fixers, reports, and queues.
MONI becomes the orchestrator, not another duplicated subsystem.
