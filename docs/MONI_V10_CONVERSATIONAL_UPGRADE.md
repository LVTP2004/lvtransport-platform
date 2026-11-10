# MONI V10 — Conversational upgrade foundation (Minisforum)

## Intent
Improve MONI V10's reasoning experience, continuity and grounded agent routing, comparable in workflow to a modern assistant. Do not claim equivalence with proprietary Claude models or copy their code. Retain MONI's identity and founder-governed architecture. This is an integration foundation, NOT an installed runtime upgrade.

## Verified evidence — 10 November 2026
- Minisforum screenshots show moni-chat and four Python runtime files: moni_chat.py, context_builder.py, conversation_memory.py and llm_router.py.
- moni-chat replies in DRY_RUN but falls back to a generic knowledge-cutoff message and does not invoke Atlas, Forge or Devstral.
- MONI Knowledge Bridge answers some component queries but general search has reported Bridge no disponible.
- GitHub PR #398 offers a manual, proposal-only Devstral path; it is not a general tool executor.
- Actual Minisforum runtime Python source is absent from the main branch of LVTP2004/lvtransport-platform; therefore do not blindly replace it.

## Changes proposed
- scripts/moni_v10_conversation_policy.py: pure functions for truthful capability manifests, gated proposed routing, bounded conversation history and grounded system prompt. NO tool calls, network, file writes or automatic installation.
- scripts/moni_v10_runtime_audit.py: read-only inspection of names and syntax status of the four existing runtime files. No memory contents, credentials, code bodies or environmental variables printed.
- tests/test_moni_v10_conversation_policy.py: offline tests.

## Safe inventory on Minisforum
After fetching and reviewing this branch locally, run:

~~~bash
python3 scripts/moni_v10_runtime_audit.py
python3 -m unittest discover -s tests -p 'test_moni_v10_conversation_policy.py' -v
~~~

This audit prints only function/class names and syntax status. Do not overwrite ~/.local/bin/moni-chat or files in ~/MONI_V10_UNIFIED_RUNTIME before interface review.

## Acceptance checklist for actual integration
1. Back up original runtime files, preserving permissions.
2. Inspect real entrypoint and the context-builder, model-router and memory interfaces. No guessing.
3. Feed the verified prompt into the existing chat loop; do not create a second conflicting model runtime.
4. Connect the verified-capability registry to REAL adapter implementations (Atlas read-only, Devstral plan, Forge staging, GitHub operations) rather than claiming capabilities based on prompts.
5. Keep DRY_RUN by default; require founder approval for all state-changing operations.
6. Test conversation continuity, unavailable tools, tool safety, grounding, and latency. Benchmark before raising the current 4096-token context on a memory-constrained Minisforum.
7. Test in a separate session and request approval before altering active systemd services.

## Constraints
No modifications to production API, public website, booking/tracking, VPS, Nginx, PM2, Docker, systemd services, Ollama or Tailscale. Do not commit private logs or other credentials into the public repository.
