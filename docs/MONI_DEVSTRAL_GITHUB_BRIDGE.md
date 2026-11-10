# MONI V10 — GitHub ↔ Devstral bridge (no paid API)

## Purpose
This is a manual, proposal-only inbox shared by ChatGPT and local Devstral on Minisforum. It uses the existing authenticated GitHub CLI (gh), the installed devstral:latest model via Ollama and Python 3 standard library. No Claude subscription is required.

Flow:
1. ChatGPT creates an open GitHub Issue with title prefix [MONI-DEVSTRAL].
2. Leonardo invokes the relay on Minisforum.
3. Devstral returns a **plan only**; it does not run tools or edit files.
4. Only with Leonardo's explicit local approval does the relay publish a GitHub issue comment.
5. ChatGPT can read that comment through the connected GitHub plugin. Code changes and pull requests require a separately approved workflow.

## Setup in Minisforum
The repository was cloned earlier to /home/leonardo/lvtp-claude-work. After reviewing the draft PR, run:

    cd ~/lvtp-claude-work
    git status --short
    git fetch origin feature/moni-devstral-github-bridge-20261110
    git switch --track origin/feature/moni-devstral-github-bridge-20261110

If the branch is already checked out, do not force changes or discard files. Switch to it only after reviewing existing local work.

## Commands
To list dedicated tasks:

    python3 scripts/moni_devstral_github_bridge.py list

To ask the existing Devstral server for a proposal without publishing:

    MONI_OLLAMA_URL=http://100.80.158.108:11434 \
      python3 scripts/moni_devstral_github_bridge.py plan ISSUE_NUMBER

To ask again and publish a resulting comment **only with local human approval**:

    MONI_OLLAMA_URL=http://100.80.158.108:11434 \
      python3 scripts/moni_devstral_github_bridge.py plan ISSUE_NUMBER \
      --publish --approve-publish

The publish command runs the model again, so the exact report can differ from the previous dry run. Review the issue and the scope before authorizing. The repository and its issue comments are PUBLIC: never post credentials, personal data, production secrets or sensitive logs.

## Scope / safety
- Repository is fixed to LVTP2004/lvtransport-platform.
- Only open issues prefixed [MONI-DEVSTRAL] are eligible.
- The relay never executes suggested commands, edits project files, creates branches, merges, deploys or starts a background daemon.
- Ollama access is restricted to HTTP loopback or Tailscale addresses on port 11434; the address is configured per command, not saved.
- Issue text is untrusted and the model has no tool interface via this bridge.
- Existing AGENTS.md, AI_GUARDRAILS.md, docs/LVTRANSPORT_SPEC_LOCK.md and human approval remain authoritative.
- The queue shows the first 100 open issues. The current Ollama runtime context is 4096 tokens; keep tasks short.
- Existing production workflows, MONI agents, VPS, systemd and Ollama services are unchanged.
- A proposal is not an implemented patch. Full automation and PR generation require a separate, reviewed phase.

## Tests

    python3 -m unittest discover -s tests -p 'test_moni_devstral_github_bridge.py' -v

## Acceptance
The bridge is operational only after Leonardo has locally verified: issue listing, model proposal, approved posting and the resulting GitHub comment read by ChatGPT. Until then it is a proposed integration, not an active agent.
