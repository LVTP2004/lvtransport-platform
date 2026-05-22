# LV Transport Platform — Deployment Automation

## Purpose

This document defines the safe deployment automation foundation for LV Transport Platform.

The goal is to prevent broken frontend builds from reaching production and to reduce manual VPS editing risk.

## Current stable manual deployment

The current working deployment flow is:

```bash
cd /home/ubuntu/lvtransport-platform
pnpm --filter @lvtransport/web build
sudo rsync -av --delete apps/web/dist/ /var/www/lvtransport-platform/web/
sudo systemctl reload nginx
curl -I https://app.lvtransport.be/tracking/
```

## Target automated deployment flow

```text
Push to main
↓
GitHub Actions checkout
↓
Install dependencies
↓
Build @lvtransport/web
↓
Deploy to VPS only if build succeeds
↓
Reload Nginx
↓
Validate production routes
```

## Required GitHub Secrets

The deployment workflow requires these repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`

Do not commit secrets into the repository.

## Production validation routes

After deployment, validate:

- `https://app.lvtransport.be/`
- `https://app.lvtransport.be/booking/`
- `https://app.lvtransport.be/tracking/`
- `https://api.lvtransport.be/health`

## Safety rules

- Build must pass before deployment.
- Do not deploy broken TypeScript.
- Do not edit `App.tsx` manually from mobile terminal.
- Do not expose Founder in public UI.
- Do not restart backend PM2 unless backend code changed.
- Reload Nginx only for frontend deployment.
- Keep rollback backups available on VPS.

## Rollback procedure

Use the latest VPS backup folder or tarball created before deployment.

Example restore pattern:

```bash
sudo rsync -av --delete /var/www/lvtransport-platform-backup-YYYY-MM-DD-HHMM/web/ /var/www/lvtransport-platform/web/
sudo systemctl reload nginx
curl -I https://app.lvtransport.be/tracking/
```

## Manual workflow dispatch

The workflow should support manual execution through GitHub Actions using `workflow_dispatch`.

## Recommended next step

Create `.github/workflows/deploy-web.yml` with a build-first deployment strategy.

The workflow should:

1. Checkout repository.
2. Setup Node.js.
3. Setup pnpm.
4. Install dependencies.
5. Build `@lvtransport/web`.
6. Deploy to VPS only after successful build.
7. Validate public routes.

## Operational principle

Stability first. Deployment automation must protect the operational MVP, not make it more fragile.
