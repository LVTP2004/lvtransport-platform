# Build Scout Report
Fri May 22 22:54:48 UTC 2026

## Git
codex/implement-final-ux-for-lvtransport-website
 M package.json
?? apps/web/src/components/lv/OperationalSoundToggle.js
?? apps/web/src/hooks/useOperationalSound.js
?? apps/web/src/pages/OperationsConsole.js
?? apps/web/src/utils/operationalSound.js
?? ops/

## Package scripts
{
  "name": "lvtransport-platform",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev:web": "pnpm --filter @lvtransport/web dev",
    "dev:admin": "pnpm --filter @lvtransport/admin dev",
    "dev:admin:https": "pnpm --filter @lvtransport/admin dev --host 0.0.0.0 --https",
    "dev:driver": "pnpm --filter @lvtransport/driver dev",
    "build": "pnpm --filter @lvtransport/web build && pnpm --filter @lvtransport/admin build && pnpm --filter @lvtransport/driver build && pnpm --filter @lvtransport/business build",
    "typecheck": "pnpm -r --filter './apps/*' typecheck",
    "ops:validate": "pnpm -r typecheck && pnpm -r build",
    "ops:endurance": "node scripts/ops/lvtp-phase1-stress-sim.js",
    "dev:business": "pnpm --filter @lvtransport/business dev",
    "ops:final-scorecard": "node scripts/ops/lvtp-final-runtime-scorecard.js",
    "ops:loop-report": "node scripts/ops/lvtp-final-runtime-scorecard.js",
    "ops:matrix-evolution": "node scripts/ops/lvtp-matrix-evolution-extended-loop.js",
    "ops:maturity-simplification": "node scripts/ops/lvtp-operational-maturity-simplification.js",
    "dev:web-grey": "pnpm --filter @lvtransport/web-consolidated-grey dev",
    "build:web-grey": "pnpm --filter @lvtransport/web-consolidated-grey build",
    "typecheck:web-grey": "pnpm --filter @lvtransport/web-consolidated-grey typecheck",
    "memory:continuity": "node tools/memory-engine/continuity-index.mjs",
    "memory:index": "node tools/memory-engine/continuity-index.mjs",
    "graph:build": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts graph:build",
    "graph:verify": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts graph:verify",
    "graph:query": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts graph:query",
    "simulation:run": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts simulation:run",
    "simulation:verify": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts simulation:verify",
    "integrity:score": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts integrity:score",
    "forecast:generate": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts forecast:generate",
    "archive:create": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts archive:create",
    "archive:verify": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts archive:verify",
    "policy:lookup": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts policy:lookup",
    "policy:explain": "pnpm --filter @lvtransport/api exec tsx src/ops-cli.ts policy:explain"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1"
  }
}
## PM2
┌────┬─────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ [1m[36m6[39m[22m  │ lvtp-build-scout    │ default     │ 0.1.0   │ [7m[1mfork[22m[27m    │ 488144   │ 0s     │ 0    │ [32m[1monline[22m[39m    │ 0%       │ 3.8mb    │ [1mubuntu[22m   │ [90mdisabled[39m │
│ [1m[36m5[39m[22m  │ lvtp-json-scout     │ default     │ 0.1.0   │ [7m[1mfork[22m[27m    │ 488104   │ 0s     │ 0    │ [32m[1monline[22m[39m    │ 0%       │ 3.8mb    │ [1mubuntu[22m   │ [90mdisabled[39m │
│ [1m[36m7[39m[22m  │ lvtp-ts-scout       │ default     │ 0.1.0   │ [7m[1mfork[22m[27m    │ 488200   │ 0s     │ 0    │ [32m[1monline[22m[39m    │ 0%       │ 3.6mb    │ [1mubuntu[22m   │ [90mdisabled[39m │
│ [1m[36m0[39m[22m  │ lvtransport-api     │ default     │ N/A     │ [7m[1mfork[22m[27m    │ 0        │ 0      │ 764  │ [31m[1merrored[22m[39m   │ 0%       │ 0b       │ [1mubuntu[22m   │ [90mdisabled[39m │
│ [1m[36m2[39m[22m  │ lvtransport-web     │ default     │ N/A     │ [7m[1mfork[22m[27m    │ 488065   │ 1s     │ 1023 │ [32m[1monline[22m[39m    │ 0%       │ 162.1mb  │ [1mubuntu[22m   │ [90mdisabled[39m │
└────┴─────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

## Ports
tcp   LISTEN 0      511               0.0.0.0:80         0.0.0.0:*    users:(("nginx",pid=437956,fd=5),("nginx",pid=437955,fd=5),("nginx",pid=437954,fd=5),("nginx",pid=437953,fd=5),("nginx",pid=437952,fd=5))

## Nginx
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

## Domain
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0   166    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/1.1 502 Bad Gateway
Server: nginx/1.26.3 (Ubuntu)
Date: Fri, 22 May 2026 22:54:48 GMT
Content-Type: text/html
Content-Length: 166
Connection: keep-alive

