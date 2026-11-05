# LVTransport — development on Minisforum

## Approved operating model

- **Minisforum:** principal development host and local AI runtime. Work on branch `develop`.
- **GitHub:** version-controlled source and automated checks.
- **Aspire:** library, storage, backups, and existing MONI runner. Do not turn Aspire into production.
- **OVH VPS:** production only, deployed from a reviewed/releasable commit with explicit approval.

## Rules

1. Do not edit application source directly on the VPS.
2. Keep `develop` for development; do not automatically promote it to `main`.
3. Validate code in GitHub Actions before requesting a pull request into `main`.
4. No SSH credentials, passwords, access tokens, database dumps, `.env` files, or model weights in the Git repository.
5. Keep Aspire backup data in its designated volume and do not change originals without explicit authorization.
6. Do not run destructive commands (e.g. `git reset --hard`, `git clean -fd`, `docker system prune`, or database migrations) while diagnosing the environment.
7. Before configuring a deployment, verify VPS environment, new SSH host identity, DNS and mail service arrangements. Do not reuse stale SSH trust settings after a VPS reinstallation.

## Safe local readiness check on Minisforum

Run the following read-only commands in Minisforum's terminal to determine local checkout status:

```bash
printf 'Host: '; hostname
printf '\nGit: '; git --version
printf '\nDocker:\n'; docker ps --format 'table {{.Names}}\t{{.Status}}' || true
printf '\nDisk space:\n'; df -h / "$HOME" || true
printf '\nMatching local Git directories:\n'
find "$HOME" -maxdepth 3 -type d -name .git -printf '%h\n' 2>/dev/null | head -n 30
```

Before switching an existing checkout to `develop`, inspect `git status --short --branch` and any uncommitted work. Do not overwrite local changes or assume existing checkout is safe to replace.

## Continuous integration

The `LVTP Development Validation (no deployment)` workflow validates source on the development branch. It cannot deploy or access VPS secrets.

## Release gate

To deploy in future: reviewed pull request, CI successful, backups checked, explicit manual release approval, and separate production environment checks.
