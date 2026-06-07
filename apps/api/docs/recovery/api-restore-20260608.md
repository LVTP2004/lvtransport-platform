# API Restore Knowledge — 2026-06-08

Context:
- Backup source: apps/api/.broken-src-backup/src-20260606-200557
- Strategy: restore one module/route at a time, run build/typecheck after each step, commit only green states.
- Validation:
  - ../../node_modules/.bin/tsc -p tsconfig.json
  - ../../node_modules/.bin/tsc --noEmit

Known lessons:
- Do not bulk-copy all backup files blindly.
- Prefer safe baseline stubs when restored modules have conflicting historic implementations.
- If TypeScript errors cascade property-by-property, inspect the full type and full object before patching.
- sqlite.repositories.ts was reduced to in-memory repository exports to keep baseline build green.
- notification.types.ts must match notification.templates.ts exactly; do not patch one field at a time.

Committed baselines:
- Restore persistence baseline
- Restore maps and persistence routes
- Restore maps baseline
- Restore payments route
- Restore execution route
- Restore execution governance baseline
- Restore integration readiness baseline
- Restore operations execution route
- Restore health routes baseline
- Restore middleware baseline
- Restore realtime orchestrator baseline
