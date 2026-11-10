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
- scripts/moni_v10_runtime_audit.py: read-only inspection of names and syntax status of the four existing runtime files; optional --interfaces reports parameter names, known runtime call names and imports restricted to four modules. No code bodies, literal arguments, memory values, credentials or environment printed.
- tests/test_moni_v10_conversation_policy.py: offline tests.

## Safe inventory on Minisforum
After fetching and reviewing this branch locally, run:

~~~bash
python3 scripts/moni_v10_runtime_audit.py --interfaces
python3 -m unittest discover -s tests -p 'test_moni_v10_conversation_policy.py' -v
~~~

The optional --interfaces mode prints function/method and parameter names, references to a restricted list of known local calls and local runtime imports; it never executes the inspected source, prints source bodies or prints call argument values. Inspect the output for identifiers you prefer to keep private before sharing it. Do not overwrite ~/.local/bin/moni-chat or files in ~/MONI_V10_UNIFIED_RUNTIME before interface review.

## Latest local observation
A screenshot from Minisforum confirms that all four modules were found with valid Python syntax. The entrypoint defines classify, main, normalize, record, respond, router, self_test and status. Context builder defines build_context, keywords and read_pairs. Memory defines MemoryStore, answer_chronology, load_recent, memory_status and save_exchange. LLM router defines ask, available and opener. This establishes *presence*, not wiring or working agent execution. The new --interfaces inspection is the next read-only step.

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


## 10 November: local chat routing diagnosis and guarded candidate

On Minisforum, the AST-only routing audit reported that \`moni_chat.respond(message)\` returns only constants (lines 166, 229, 239, 276) and never invokes \`llm_router.ask(message)\`. The latter already uses context_builder and conversation_memory. The most conservative hypothesis is that an unrecognized request receives a hard-coded fallback instead of going to the local LLM.

A guarded candidate patcher is now in \`scripts/moni_v10_stage_chat_fallback.py\`. It is **not** an installer: it refuses changes unless \`respond(message)\` ends with a simple, unconditional, top-level string return AND \`ask(message)\` exists with exactly one positional argument. It preserves earlier branches, inserts a best-effort LLM call before that final fallback, and keeps the original fallback when the LLM is unavailable. It never executes the inspected source. The generated candidate exists only in a private \`/tmp\` staging file; it does not edit the active MONI runtime or start/stop systemd services.

**Operator command for reviewed staging only** (from Minisforum with this feature branch fetched):
~~~bash
git show origin/feature/moni-v10-conversation-policy-20261110:scripts/moni_v10_stage_chat_fallback.py > /tmp/moni_v10_stage_chat_fallback.py
python3 /tmp/moni_v10_stage_chat_fallback.py
~~~

If the result is \`REFUSED\`, do not force a patch. It means the structure differs from the expected target and requires manual integration. If it is \`STAGED_FOR_REVIEW\`, perform static inspection and founder review before any copy back. This is only a **first-step LLM fallback**, not Atlas/Forge execution, multi-agent orchestration, or a claim of Claude-level capabilities. Tests: \`python3 -m unittest discover -s tests -p 'test_moni_v10_stage_chat_fallback.py' -v\`. Existing .github workflows untouched.
