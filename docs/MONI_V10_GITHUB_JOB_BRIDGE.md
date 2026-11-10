# MONI V10 — GitHub job bridge (read-only, proposed)

## Goal
Allow ChatGPT (with its connected GitHub app) to create a narrowly-scoped GitHub issue, let a previously authorized Minisforum poller pick it up, and return a verified, sanitized result to the same issue. This does **not** give arbitrary remote terminal access, and the poller must be installed/started once on Minisforum by a trusted local mechanism. It is intentionally separate from MONI Knowledge Bridge and the STAGING_ONLY executor V6.

## Actual status, 10 November 2026
- GitHub is connected to ChatGPT; its connector can create issues and PRs.
- The MONI knowledge endpoint returned READ_ONLY ready; executor V6 returned STAGING_ONLY, human_approval_required.
- A direct MCP plan attempt with operation type write_file and a harmless /tmp target returned Operation not permitted. This was **not** executed and was not bypassed.
- Minisforum has demonstrated outbound GitHub access via gh/git in user-provided terminal screenshots.
- Existing self-hosted GitHub workflow .github/workflows/moni-aspire-audit.yml runs a read-only Aspire audit on workflow_dispatch. It does not confer Minisforum shell access.
- The worker in this PR is not deployed or running. It has no cron/systemd installation in this PR.

## Design
- GitHub repo fixed: LVTP2004/lvtransport-platform.
- Only open issues **authored by leovargas-max** with an exact title [MONI-JOB] ping or [MONI-JOB] runtime_inventory are processed.
- Issue body starts with MONI_JOB_V1 followed by JSON containing exactly schema=1, task, target=minisforum, a UUID request_id, and timezone-aware expires_at within 7 days.
- Unknown jobs, wrong authors/targets, extra JSON keys, PRs and expired requests are ignored.
- No issue-body code is executed or passed to a shell. No arbitrary Linux commands.
- Fail-closed device identity check: the local hostname must equal leonardo-AI-Series (as observed in Minisforum screenshots); a job run on Aspire or the VPS is refused rather than being misreported as Minisforum.
- Supported operations:
  - ping: verify local bridge logic is running. Does not test system health.
  - runtime_inventory: parse four known Python files with ast.parse and report only file presence, syntax check and number of top-level functions. No source, prompts, credentials, paths or environment contents are returned.
- Default --once is DRY_RUN and never posts. Opt-in --publish-readonly posts a sanitized public comment on the same issue and checks for prior result marker to minimize duplicates.
- The worker is **not** a generic execution server. For mutations, a separate capability and explicit local approval must be designed and reviewed.

## Prerequisites before activation
1. A trusted installer/operator must inspect the PR and confirm its intended scope and Python dependencies (stdlib only).
2. Verify the existing gh CLI session on Minisforum has least-privilege permissions for reading issues and posting an issue comment. Avoid printing tokens.
3. Complete offline tests first:
   python3 -m unittest discover -s tests -p 'test_moni_github_job_inbox.py' -v
4. Start one controlled one-shot invocation on Minisforum, in a **separate** working copy, after the PR is reviewed:
   python3 scripts/moni_github_job_inbox.py --once
5. Only after verifying safe results, enable the explicit --publish-readonly mode under local operator control, then confirm that ChatGPT can read the GitHub issue comment.
6. For zero-copy-paste daily operation, approve a narrowly-scoped local user service/timer, without sudo, running this **exact checked-out script**, with interval and working directory fixed. No service is created by this PR; do not enable anything automatically.

## Job example (not a valid live request; placeholder request_id)
Title: [MONI-JOB] ping
Body:

    MONI_JOB_V1
    {"schema":1,"task":"ping","target":"minisforum",
    "request_id":"00000000-0000-4000-8000-000000000000",
    "expires_at":"2026-11-11T18:00:00+00:00"}

ChatGPT can send such jobs using its GitHub connection after the receiving worker is deliberately activated.

## Constraints
- No modifications to .github workflows, any existing MONI runtime module, Ollama, Atlas, Forge, Tailscale, VPS, Nginx, PM2, web/admin/API or production.
- **Public repo warning:** issues and comments are visible to everyone; this bridge publishes only non-sensitive summary fields. Do not include secrets or private logs.
- Do not interpret successful GitHub posting as proof of an operational remote terminal or a completed software installation.
- No background work unless an explicitly approved local service is installed separately.
- Operator approval is needed for any future mutating task, including writes and updates to installed MONI code.
