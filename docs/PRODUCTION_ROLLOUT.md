# LVTransport Operational Production Rollout Runbook

## Scope and Architecture Guardrails

This rollout is intentionally limited to **platform/runtime preparation** for `lvtransport.be` production activation.

### In-scope
- Deterministic deployment and runtime validation.
- Backup/restore integrity and rollback evidence.
- Runtime environment consistency checks.
- Operational launch checklist and execution sequence.

### Explicitly out-of-scope
- Distributed infrastructure changes.
- Redis introduction.
- Background workers.
- Speculative/auto-remediating automation.

## 1) Production readiness checklist

Run and record each checkpoint before cutover:

- [ ] Working tree is clean and release commit is tagged.
- [ ] `pnpm install --frozen-lockfile` succeeds on target host.
- [ ] `pnpm run build` succeeds from clean state.
- [ ] `scripts/ops/infra-alignment-check.sh` passes (nginx + PM2 checks).
- [ ] Backup snapshot created with `scripts/backup/lvtp-backup.sh`.
- [ ] Backup integrity validated with `scripts/backup/lvtp-verify-backup.sh`.
- [ ] Restore validation succeeds with `scripts/backup/lvtp-restore-check.sh`.
- [ ] Rollback reference commit captured (pre-rollout + rollout commit IDs).
- [ ] Runtime env vars match approved production matrix (no drift).

## 2) Deployment reproducibility verification

Deterministic reproducibility means the same commit + lockfile + build command yields the same deployable runtime result.

### Verification steps
1. Pin commit SHA and `pnpm-lock.yaml` in release record.
2. Run deterministic dependency install:
   ```bash
   pnpm install --frozen-lockfile
   ```
3. Execute production build twice from clean state:
   ```bash
   git clean -fdx
   pnpm install --frozen-lockfile
   pnpm run build
   ```
4. Confirm `scripts/deploy/stable-vps-deploy.sh` performs hard reset to `origin/<branch>` and blocks deploy on dirty working tree.

## 3) Backup cadence validation

Operational minimum cadence:
- **Daily** automated snapshot at low-traffic window.
- **Pre-rollout** snapshot immediately before production deployment.
- **Post-rollout** snapshot after smoke validation.

Validation command sequence:
```bash
scripts/backup/lvtp-backup.sh
scripts/backup/lvtp-verify-backup.sh <snapshot_dir>
```

## 4) Rollback verification

Rollback objective: restore platform to the pre-rollout commit with known-good process state.

### Required rollback evidence
- `previous_commit.txt` captured by deployment process.
- Successful restore validation from latest snapshot.
- Verified command path to reset and restart runtime:
  ```bash
  git checkout <stable_branch>
  git reset --hard <previous_commit_sha>
  pnpm install --frozen-lockfile
  pnpm run build
  pm2 restart lvtransport-api lvtransport-web lvtransport-admin lvtransport-driver
  ```

### Rollback drill
Run restore preview + restore check on latest snapshot archive before rollout day.

## 5) Runtime environment consistency checks

Ensure deterministic runtime behavior by validating:

- Node/pnpm versions are fixed and documented per host.
- `.env` production values conform to approved key set (no missing/extra critical keys).
- `ecosystem.config.cjs` process definitions are stable.
- Nginx `server_name` conflicts are absent.
- PM2 process names and startup order are unchanged.

Primary check command:
```bash
scripts/ops/infra-alignment-check.sh
```

## 6) Operational launch runbook

### T-24h
1. Freeze deployment branch.
2. Run full production verification suite (below).
3. Execute backup and restore validation.

### T-1h
1. Confirm DNS/SSL and nginx syntax validation on host.
2. Confirm no uncommitted changes on host repo.
3. Capture pre-rollout commit SHA.

### Cutover
1. Run `scripts/deploy/stable-vps-deploy.sh`.
2. Validate PM2 process health.
3. Execute smoke checks on API + web endpoints.

### T+15m
1. Execute post-rollout backup snapshot.
2. Re-run infra alignment check.
3. Record rollout evidence (commit SHA, snapshot path, validation outputs).

## 7) Deterministic architecture preservation

To preserve deterministic architecture for this rollout:

- Keep single-node, non-distributed execution model.
- Do not introduce Redis, worker queues, or speculative automation.
- Prefer explicit operator-driven commands with auditable outputs.
- Block deployment on any unresolved environment drift.

## 8) Production verification command set

Use this command set as the rollout gate:

```bash
# Production verification
pnpm install --frozen-lockfile
pnpm run build
scripts/ops/infra-alignment-check.sh

# Backup + restore verification
scripts/backup/lvtp-backup.sh
scripts/backup/lvtp-verify-backup.sh <snapshot_dir>
scripts/backup/lvtp-restore-check.sh <snapshot_dir>

# Integrity verification
sha256sum -c <snapshot_dir>/checksums.sha256
```

