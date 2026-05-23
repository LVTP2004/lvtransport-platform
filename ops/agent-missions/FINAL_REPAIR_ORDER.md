# FINAL REPAIR ORDER — LV TRANSPORT

PRIORITY: CRITICAL

NO demos.
NO temporary HTML.
NO runtime fallback UI.
NO mock dashboards.

MISSION:
Repair and converge the REAL production system.

OBJECTIVES:
1. Repair invalid root package.json.
2. Restore valid pnpm workspace state.
3. Repair packages/auth type corruption.
4. Repair packages/realtime lifecycle corruption.
5. Compile REAL apps/web frontend.
6. Start REAL frontend on port 3000.
7. Serve ONLY through lvtransport.be.
8. Validate nginx + pm2 + runtime.
9. Generate repair report.
10. STOP only when lvtransport.be returns HTTP 200 with production frontend.

MANDATORY COMMANDS:
- pnpm install --no-frozen-lockfile
- pnpm --filter @lvtransport/web build
- pnpm --filter @lvtransport/api build
- pm2 status
- sudo nginx -t
- curl -I http://lvtransport.be

SUCCESS CONDITIONS:
- build passes
- pm2 online
- nginx online
- lvtransport.be HTTP 200
- production UI loaded
- no fallback HTML
