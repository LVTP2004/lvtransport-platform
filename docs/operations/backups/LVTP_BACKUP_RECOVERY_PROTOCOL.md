# LV Transport Platform Backup + Recovery Protection Protocol

## Purpose
This protocol establishes a mandatory, non-destructive backup baseline before any additional expansion, runtime testing, merge, or production deployment.

## Phase 1 — Full Source Code Backup
- Use `scripts/backup/lvtp-backup.sh` to create a UTC-dated snapshot containing:
  - `apps/`, `packages/`, `scripts/`, `docs/`.
  - Optional infra/config roots when present (`assets/`, `branding/`, `nginx/`, `infra/`, `.github/`).
  - Core project files (`.env.example`, workspace and deployment configs).
  - Git rollback bundle (`lvtp-repo.bundle`) and HEAD pointer.
- Integrity is generated with SHA-256 checksums.
- Output:
  - `backups/snapshot-<timestamp>/`
  - `backups/lvtp-snapshot-<timestamp>.tar.gz`

## Phase 2 — VPS Backup
Run on each VPS host and archive into off-host object storage:
1. `/var/www/lvtransport*` (all app directories)
2. PM2 state:
   - `pm2 save`
   - `~/.pm2/dump.pm2`
3. Nginx:
   - `/etc/nginx/nginx.conf`
   - `/etc/nginx/sites-enabled/*`
4. SSL:
   - `/etc/letsencrypt/`
5. Runtime/env templates:
   - `.env.example` files only (never raw secrets in git)
6. Deployment/runtime:
   - deploy scripts, cron (`crontab -l` export), logs snapshot.

## Phase 3 — Database + Realtime Backup
- Firebase/Firestore/Realtime DB:
  - Export using project admin credentials to timestamped buckets.
- PostgreSQL/Supabase (if enabled):
  - `pg_dump --format=custom` for schema + data.
- Include booking lifecycle, Moni learning artifacts, telemetry schemas, and GPS-related structures.
- Preserve at least 3 generations.

## Phase 4 — Environment + Secret Management
- Maintain a secure, private secret inventory (vault/password manager), including:
  - Maps API keys, Stripe keys, airport APIs, Firebase service credentials, deploy tokens, GitHub Actions secrets.
- In-repo: store only templates and key names.
- Rotate secrets after incident recovery or suspicious access.

## Phase 5 — PWA + Branding Backup
- Ensure archive includes:
  - App icons, splash screens, logos, Moni Ride brand assets, black/gold theme resources, onboarding/media assets.
- Keep a checksum manifest for all premium brand assets.

## Phase 6 — Moni Ecosystem Backup
- Archive Moni logic and behavior contracts from `packages/moni-assistent/`.
- Preserve decision flows, prompts, observer behavior, and approved emotional interaction rules.
- Version behavioral updates with dated changelog entries.

## Phase 7 — Operational Documentation Snapshot
- Archive founder vision and architecture records under `docs/` and root operational reports.
- Maintain immutable monthly snapshots for continuity.

## Phase 8 — Automated Backup Strategy
Recommended cadence:
- Daily: lightweight source + config snapshot.
- Weekly: full snapshot + database exports.
- Pre-merge (main/prod branches): source snapshot.
- Pre-deploy: source + VPS + database snapshot.
- Emergency: instant on-demand snapshot.

## Phase 9 — Disaster Recovery Plan
Recovery sequence priority:
1. Restore source snapshot and deployment scripts.
2. Restore infra layer (Nginx, PM2, SSL, cron).
3. Restore runtime environment templates and vault-managed secrets.
4. Restore databases/realtime exports.
5. Run health checks + smoke tests.
6. Bring up services in priority: API → realtime → admin → customer/driver web.

Minimal continuity mode:
- Read-only admin dashboards.
- Booking intake paused or degraded mode with status banner.
- Incident broadcast to operator channels.

## Phase 10 — Backup Validation
Do not treat backup as valid until successful test restore:
1. Extract archive to clean directory with `scripts/backup/lvtp-restore-preview.sh`.
2. Verify checksums using `scripts/backup/lvtp-verify-backup.sh`.
3. Validate bootstrap commands (`install`, `build`, `start`) in restored context.
4. Execute database restore drills in staging.
5. Record validation evidence and duration.

## Non-Destructive Guardrail
No destructive deployment, cleanup, or schema operation should execute without a valid backup timestamp in the same operating window.
