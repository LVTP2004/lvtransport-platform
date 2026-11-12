# LVTransport Agent Contract

This repository is not a playground. All agents must preserve the founder's product specification.

## Non-negotiable product rules

- Do not reinterpret LVTransport's product direction.
- Do not replace operational UX with demo UX.
- Do not add fake bookings, fake tracking codes, fake drivers, fake ETAs, fake reviews, or placeholder contact data.
- Do not change API endpoints, booking lifecycle, tracking lifecycle, admin lifecycle, PM2, Nginx, VPS deployment, DNS, SSL, ports, or environment variables unless explicitly requested.
- Do not change package manager, dependencies, pnpm-lock.yaml, package.json, tsconfig, Vite config, or workspace structure unless explicitly requested.
- Do not touch Admin, Driver, API, database, auth, or backend files for a homepage visual task.
- Do not change language, navigation labels, brand copy, CTA hierarchy, service names, pricing model, or route names unless explicitly requested.
- Do not edit generated JavaScript mirror files unless the repository explicitly requires them and the source file was changed in the same task.
- Do not introduce localStorage/sessionStorage booking fallbacks.
- Do not introduce forms that only call preventDefault() without production API submission unless the task explicitly asks for a static mockup.
- Do not merge or propose changes without listing all changed files and explaining why each file is in scope.

## Current architecture

- Production public website is served statically by Nginx from `/var/www/lvtransport-web`.
- Source web app is under `apps/web`.
- API is separate from the static web build.
- VPS deploy is manual and must not be modified by code agents.
- Docker is not the production architecture for LVTransport.be.

## Allowed scope for homepage visual tasks

Allowed:
- apps/web/src/pages/home/HeroSection.tsx
- related CSS only if already part of the existing page styling
- static brand assets only if explicitly requested

Forbidden unless explicitly requested:
- apps/web/src/pages/Admin.tsx
- apps/web/src/pages/Driver.tsx
- apps/web/src/app/App.tsx
- apps/api/**
- apps/admin/**
- package.json
- pnpm-lock.yaml
- .github/**
- deployment scripts
- Nginx, PM2, Docker, VPS files
- generated bundles or build artifacts

## Required behavior

Before editing:
1. Read docs/LVTRANSPORT_SPEC_LOCK.md.
2. Identify allowed files.
3. Refuse to proceed if the task requires forbidden files.

Before final response:
1. List changed files.
2. Confirm no forbidden files were changed.
3. Confirm no production API behavior was replaced by mock/demo/local behavior.
4. Confirm build/typecheck result.


## LVTP CORE / MONI architecture context

Before changing MONI, Founder OS, MONI Edge, agent control, approvals, or node orchestration, read:

- `docs/architecture/SYSTEM-MAP.md`
- `docs/architecture/FOUNDER-OS.md`
- `docs/architecture/MONI-EDGE.md`
- `docs/architecture/LVTP-CORE.md`
- `docs/architecture/MONI-UNIFIED-CONTROL-PLANE.md`

Additional rules:

- Separate verified state from proposals; never present a planned capability as implemented.
- Keep Aspire, Minisforum and Viviana Linux as separate node identities; do not infer one node's runtime state from another.
- The verified FOSSiBOT NATS test proves live event delivery on `moni.events` only. It does not prove approvals, biometrics, JetStream, GitHub actions or remote execution.
- A MONI Edge approval is not blanket permission to deploy, merge, run arbitrary shell commands or modify infrastructure. Scope each capability explicitly.
- Biometric material remains local to the device; never transmit fingerprint templates or raw biometric data.
- Prefer capability-scoped operations such as `github.read_pr`, `codex.approve_task` and `node.status` over unrestricted remote shell.
- Documentation changes alone do not authorize deployment or publication.
