# MONI COGNITIVE ARCHITECT V1

Status: GENERATED
Category: Moni Cognitive Architecture
Date: 2026-06-01

## Purpose

Teach Moni to reason like an architect: subsystem first, TypeScript error second.

## Current Repository State

```json
{
  "generatedAt": "2026-06-01T09:27:00.494004Z",
  "totalTypeScriptErrors": 37,
  "errorsByModule": {
    "bookings": 10,
    "persistence": 9,
    "payments": 6,
    "operational_memory": 5,
    "websocket": 3,
    "server": 2,
    "tracking": 2
  },
  "errorsByPattern": {
    "contract_shape_mismatch": 14,
    "wrong_method_contract": 4,
    "unknown": 4,
    "implicit_any": 1,
    "missing_contract": 3,
    "duplicate_implementation": 10,
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

## Cognitive Fix Queue

```json
[
  {
    "module": "bookings",
    "errorCount": 10,
    "primaryPattern": "contract_shape_mismatch",
    "strategy": "Manual architecture review required.",
    "firstErrors": [
      "src/bookings/booking.service.ts(31,7): error TS2322: Type '\"pending\"' is not assignable to type 'BookingLifecycle'.",
      "src/bookings/booking.service.ts(33,7): error TS2322: Type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle\").BookingTimelineEntry[]' is not assignable to type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime\").BookingTimelineEntry[]'.",
      "src/bookings/booking.service.ts(40,31): error TS2345: Argument of type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle\").BookingTimelineEntry' is not assignable to parameter of type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime\").BookingTimelineEntry'.",
      "src/bookings/booking.service.ts(65,37): error TS2345: Argument of type 'BookingLifecycle' is not assignable to parameter of type '\"pending\" | \"assigned\" | \"completed\" | \"cancelled\" | \"failed\" | \"driver_arriving\" | \"passenger_onboard\" | \"confirmed\" | \"quoted\"'.",
      "src/bookings/booking.service.ts(72,5): error TS2322: Type '\"pending\" | \"assigned\" | \"completed\" | \"cancelled\" | \"failed\" | \"driver_arriving\" | \"passenger_onboard\" | \"confirmed\" | \"quoted\"' is not assignable to type 'BookingLifecycle'.",
      "src/bookings/booking.service.ts(75,27): error TS2345: Argument of type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle\").BookingTimelineEntry' is not assignable to parameter of type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime\").BookingTimelineEntry'.",
      "src/bookings/booking.service.ts(78,31): error TS2345: Argument of type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle\").BookingTimelineEntry' is not assignable to parameter of type 'import(\"/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime\").BookingTimelineEntry'.",
      "src/bookings/booking.service.ts(85,13): error TS2339: Property 'driverId' does not exist on type 'BookingRecord'."
    ]
  },
  {
    "module": "persistence",
    "errorCount": 9,
    "primaryPattern": "missing_contract",
    "strategy": "Rebuild repository implementations against declared interfaces.",
    "firstErrors": [
      "src/modules/bookings/service.ts(110,45): error TS2339: Property 'getById' does not exist on type 'BookingRepository'.",
      "src/modules/persistence/in-memory-empty.repository.ts(18,7): error TS2420: Class 'EmptyPersistenceRepository' incorrectly implements interface 'NotificationRepository'.",
      "src/modules/persistence/in-memory-empty.repository.ts(38,56): error TS2304: Cannot find name 'DeliveryStatus'.",
      "src/modules/persistence/sqlite.repositories.ts(83,29): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SQLInputValue'.",
      "src/modules/persistence/sqlite.repositories.ts(86,29): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SQLInputValue'.",
      "src/modules/persistence/sqlite.repositories.ts(89,29): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SQLInputValue'.",
      "src/persistence/repository-contracts.ts(13,11): error TS2304: Cannot find name 'RideStatus'.",
      "src/persistence/repository-contracts.ts(30,40): error TS2304: Cannot find name 'RideStatus'."
    ]
  },
  {
    "module": "payments",
    "errorCount": 6,
    "primaryPattern": "contract_shape_mismatch",
    "strategy": "Normalize payment interfaces before touching payment routes.",
    "firstErrors": [
      "src/modules/payments/payment.routes.ts(14,96): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.",
      "src/modules/payments/services/payment-architecture.service.ts(27,11): error TS2739: Type '{ id: string; bookingId: string; customerId: string; provider: PaymentProvider; status: PaymentSessionStatus.CREATED; amount: { currency: string; valueMinor: number; }; expiresAt: string; metadata: { ...; }; }' is missing the following properties from type 'PaymentSession': retryStrategy, retryCount, maxRetryCount, idempotencyKey",
      "src/modules/payments/services/payment-architecture.service.ts(40,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: \"authorization\"; status: PaymentSessionStatus.CREATED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.",
      "src/modules/payments/services/payment-architecture.service.ts(68,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: \"capture\"; status: PaymentSessionStatus.CAPTURED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.",
      "src/modules/payments/services/payment-architecture.service.ts(96,7): error TS2322: Type '\"requested\"' is not assignable to type 'RefundState'.",
      "src/modules/payments/services/payment-architecture.service.ts(115,10): error TS2352: Conversion of type '{ eventType: string; sessionId: string | undefined; signatureValidated: true; }' to type 'PaymentWebhookEnvelope<unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first."
    ]
  },
  {
    "module": "operational_memory",
    "errorCount": 5,
    "primaryPattern": "duplicate_implementation",
    "strategy": "Remove duplicate CLI entrypoints or isolate executable module.",
    "firstErrors": [
      "src/operational-memory/cli.ts(1,10): error TS2300: Duplicate identifier 'buildOperationalMemoryIndex'.",
      "src/operational-memory/cli.ts(53,16): error TS2300: Duplicate identifier 'main'.",
      "src/operational-memory/cli.ts(72,10): error TS2300: Duplicate identifier 'buildOperationalMemoryIndex'.",
      "src/operational-memory/cli.ts(81,7): error TS2300: Duplicate identifier 'main'.",
      "src/operational-memory/cli.ts(84,99): error TS2339: Property 'outputFile' does not exist on type 'MemoryIndex'."
    ]
  },
  {
    "module": "websocket",
    "errorCount": 3,
    "primaryPattern": "duplicate_implementation",
    "strategy": "Remove duplicate broadcast declarations.",
    "firstErrors": [
      "src/websocket/socket.server.ts(31,9): error TS2451: Cannot redeclare block-scoped variable 'broadcast'.",
      "src/websocket/socket.server.ts(44,9): error TS2451: Cannot redeclare block-scoped variable 'broadcast'.",
      "src/websocket/socket.server.ts(49,92): error TS2554: Expected 1 arguments, but got 2."
    ]
  },
  {
    "module": "server",
    "errorCount": 2,
    "primaryPattern": "duplicate_implementation",
    "strategy": "Remove duplicate start declarations.",
    "firstErrors": [
      "src/server.ts(12,9): error TS2451: Cannot redeclare block-scoped variable 'start'.",
      "src/server.ts(13,9): error TS2451: Cannot redeclare block-scoped variable 'start'."
    ]
  },
  {
    "module": "tracking",
    "errorCount": 2,
    "primaryPattern": "duplicate_implementation",
    "strategy": "Remove duplicate tracking implementations and delegate to shared tracking.",
    "firstErrors": [
      "src/tracking/tracking.service.ts(20,3): error TS2393: Duplicate function implementation.",
      "src/tracking/tracking.service.ts(45,3): error TS2393: Duplicate function implementation."
    ]
  }
]
```

## Operating Rule

Moni must not patch isolated errors blindly. Moni must identify the broken subsystem, align it with its canonical contract, rebuild, measure, and only keep fixes that reduce the build error count.

## Next Action

Run the first item in moni-core/queue/cognitive-fix-queue.json as the next controlled repair target.
