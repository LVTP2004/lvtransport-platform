# MONI API ERROR LEARNING V1

Status: GENERATED
Category: Moni Learning / API Stabilization
Date: 2026-06-01

## Summary
```json
{
  "generatedAt": "2026-06-01T09:22:25.135308Z",
  "totalErrors": 37,
  "errorTypes": {
    "type_mismatch": 14,
    "wrong_method_contract": 4,
    "unknown": 4,
    "implicit_any": 1,
    "missing_import_or_contract": 3,
    "duplicate_declaration": 10,
    "wrong_argument_count": 1
  },
  "topFiles": {
    "src/bookings/booking.service.ts": 8,
    "src/modules/payments/services/payment-architecture.service.ts": 5,
    "src/operational-memory/cli.ts": 5,
    "src/modules/persistence/sqlite.repositories.ts": 3,
    "src/websocket/socket.server.ts": 3,
    "src/modules/bookings/service.ts": 2,
    "src/modules/persistence/in-memory-empty.repository.ts": 2,
    "src/persistence/repository-contracts.ts": 2,
    "src/server.ts": 2,
    "src/tracking/tracking.service.ts": 2,
    "src/dispatch/dispatch.service.ts": 1,
    "src/modules/payments/payment.routes.ts": 1,
    "src/routes/v1/persistence.routes.ts": 1
  }
}
```

## Fix Queue
```json
[
  {
    "file": "src/bookings/booking.service.ts",
    "errorCount": 8,
    "primaryPattern": "type_mismatch",
    "strategy": "adapt object shape to declared type"
  },
  {
    "file": "src/modules/payments/services/payment-architecture.service.ts",
    "errorCount": 5,
    "primaryPattern": "type_mismatch",
    "strategy": "adapt object shape to declared type"
  },
  {
    "file": "src/operational-memory/cli.ts",
    "errorCount": 5,
    "primaryPattern": "duplicate_declaration",
    "strategy": "remove duplicated blocks or choose one canonical implementation"
  },
  {
    "file": "src/modules/persistence/sqlite.repositories.ts",
    "errorCount": 3,
    "primaryPattern": "type_mismatch",
    "strategy": "adapt object shape to declared type"
  },
  {
    "file": "src/websocket/socket.server.ts",
    "errorCount": 3,
    "primaryPattern": "duplicate_declaration",
    "strategy": "remove duplicated blocks or choose one canonical implementation"
  },
  {
    "file": "src/modules/bookings/service.ts",
    "errorCount": 2,
    "primaryPattern": "wrong_method_contract",
    "strategy": "align caller with repository/service interface"
  },
  {
    "file": "src/modules/persistence/in-memory-empty.repository.ts",
    "errorCount": 2,
    "primaryPattern": "missing_import_or_contract",
    "strategy": "import canonical type from packages/shared or local contract"
  },
  {
    "file": "src/persistence/repository-contracts.ts",
    "errorCount": 2,
    "primaryPattern": "missing_import_or_contract",
    "strategy": "import canonical type from packages/shared or local contract"
  },
  {
    "file": "src/server.ts",
    "errorCount": 2,
    "primaryPattern": "duplicate_declaration",
    "strategy": "remove duplicated blocks or choose one canonical implementation"
  },
  {
    "file": "src/tracking/tracking.service.ts",
    "errorCount": 2,
    "primaryPattern": "duplicate_declaration",
    "strategy": "remove duplicated blocks or choose one canonical implementation"
  },
  {
    "file": "src/dispatch/dispatch.service.ts",
    "errorCount": 1,
    "primaryPattern": "unknown",
    "strategy": "manual inspection required"
  },
  {
    "file": "src/modules/payments/payment.routes.ts",
    "errorCount": 1,
    "primaryPattern": "type_mismatch",
    "strategy": "adapt object shape to declared type"
  }
]
```

## Decision
Moni must fix API build errors by pattern, not by random file edits.
Each fix must reduce the TypeScript error count and be committed separately.
