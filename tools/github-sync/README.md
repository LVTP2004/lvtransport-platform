# LVTransport automatic GitHub mirror — opt-in only

The Minisforum user may install this **after** review and approved merging of this PR.

Run from the authorized checkout:
```sh
bash tools/github-sync/install-user-timer.sh
```

This installs a user-level systemd timer that runs every ~15 minutes and maintains a **separate GitHub main mirror** under `~/.local/share/lvtp-github-mirror/lvtransport-platform`.

## Safety boundaries

- The first run clones `main`; later runs only fetch and fast-forward it after confirming clean status and expected remote. Refuses symlink destinations, dirty worktrees, remote rewrites and unexpected branches.
- Does **not** touch the operational checkout (`~/Proyectos/lvtransport-platform`), local staging, other worktrees or uncommitted changes.
- Does **not** automatically commit, push, open PRs, merge, update VPS, restart any service or deploy. Local work still needs reviewed, authorized PRs.
- No secrets, Firebase service accounts or local runtime data are copied to GitHub.
- Requires user session systemd, git, flock, network access and user approval before installation.

## Check / stop
```sh
systemctl --user status lvtp-github-sync.timer
journalctl --user -u lvtp-github-sync.service -n 50 --no-pager
systemctl --user disable --now lvtp-github-sync.timer
```

No production auto-deployment is included. The mirror is an independent replica; do not treat it as the operational checkout. If someone edits the mirror locally, the timer fails closed and leaves those edits untouched.

## Acceptance checklist (Codex on Minisforum)

1. Inspect scripts/units and verify they do not reference deploy or write operations on `~/Proyectos/lvtransport-platform`.
2. Confirm no existing path is overwritten and that installation runs under the intended user.
3. Test first clone, up-to-date and fast-forward behavior; dirty worktree / wrong remote / non-FF must refuse.
4. Inspect logs and timer status after explicit installation.
5. Record evidence and current mirror SHA in GitHub without private information. Do not enable automatic deployment or bidirectional push.
