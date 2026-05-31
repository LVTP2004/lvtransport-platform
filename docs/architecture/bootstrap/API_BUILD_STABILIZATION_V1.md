# API BUILD STABILIZATION V1

Status: GENERATED
Category: API Stabilization
Date: 2026-05-31

## Purpose

Stabilize apps/api TypeScript build before continuing shared contract adoption.

## Rule

Do not migrate API contracts while the API build has unrelated TypeScript failures.

## Error Summary


```txt
src/bookings/booking-notification-flow.service.ts(76,72): error TS2554: Expected 0-1 arguments, but got 2.
src/bookings/booking.service.ts(31,7): error TS2322: Type '"pending"' is not assignable to type 'BookingLifecycle'.
src/bookings/booking.service.ts(33,7): error TS2322: Type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle").BookingTimelineEntry[]' is not assignable to type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime").BookingTimelineEntry[]'.
src/bookings/booking.service.ts(40,31): error TS2345: Argument of type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle").BookingTimelineEntry' is not assignable to parameter of type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime").BookingTimelineEntry'.
src/bookings/booking.service.ts(65,37): error TS2345: Argument of type 'BookingLifecycle' is not assignable to parameter of type '"pending" | "assigned" | "completed" | "cancelled" | "failed" | "driver_arriving" | "passenger_onboard" | "confirmed" | "quoted"'.
src/bookings/booking.service.ts(72,5): error TS2322: Type '"pending" | "assigned" | "completed" | "cancelled" | "failed" | "driver_arriving" | "passenger_onboard" | "confirmed" | "quoted"' is not assignable to type 'BookingLifecycle'.
src/bookings/booking.service.ts(75,27): error TS2345: Argument of type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle").BookingTimelineEntry' is not assignable to parameter of type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime").BookingTimelineEntry'.
src/bookings/booking.service.ts(78,31): error TS2345: Argument of type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/bookings/lifecycle").BookingTimelineEntry' is not assignable to parameter of type 'import("/home/leonardo-vargas/lvtransport-platform/packages/realtime/src/models/realtime").BookingTimelineEntry'.
src/bookings/booking.service.ts(85,13): error TS2339: Property 'driverId' does not exist on type 'BookingRecord'.
src/dispatch/dispatch.service.ts(2,10): error TS2305: Module '"../bookings/bookings.service.js"' has no exported member 'bookingsService'.
src/modules/bookings/service.ts(110,45): error TS2339: Property 'getById' does not exist on type 'BookingRepository'.
src/modules/bookings/service.ts(117,65): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/modules/payments/interfaces/payment.interfaces.ts(1,10): error TS2300: Duplicate identifier 'BookingPaymentState'.
src/modules/payments/interfaces/payment.interfaces.ts(1,31): error TS2300: Duplicate identifier 'PaymentProvider'.
src/modules/payments/interfaces/payment.interfaces.ts(1,48): error TS2300: Duplicate identifier 'PaymentSessionStatus'.
src/modules/payments/interfaces/payment.interfaces.ts(1,70): error TS2300: Duplicate identifier 'PayoutState'.
src/modules/payments/interfaces/payment.interfaces.ts(1,83): error TS2300: Duplicate identifier 'RefundState'.
src/modules/payments/interfaces/payment.interfaces.ts(3,3): error TS2300: Duplicate identifier 'BookingPaymentState'.
src/modules/payments/interfaces/payment.interfaces.ts(4,3): error TS2300: Duplicate identifier 'PaymentProvider'.
src/modules/payments/interfaces/payment.interfaces.ts(6,3): error TS2300: Duplicate identifier 'PaymentSessionStatus'.
src/modules/payments/interfaces/payment.interfaces.ts(7,3): error TS2300: Duplicate identifier 'PayoutState'.
src/modules/payments/interfaces/payment.interfaces.ts(8,3): error TS2300: Duplicate identifier 'RefundState'.
src/modules/payments/payment.routes.ts(8,78): error TS2551: Property 'getBookingPaymentState' does not exist on type 'PaymentArchitectureService'. Did you mean 'getBookingPaymentStatus'?
src/modules/payments/payment.routes.ts(12,46): error TS2339: Property 'confirmSession' does not exist on type 'PaymentArchitectureService'.
src/modules/payments/payment.routes.ts(14,73): error TS2551: Property 'getBookingPaymentState' does not exist on type 'PaymentArchitectureService'. Did you mean 'getBookingPaymentStatus'?
src/modules/payments/payment.routes.ts(19,125): error TS2554: Expected 1 arguments, but got 2.
src/modules/payments/payment.routes.ts(20,93): error TS2551: Property 'getBookingPaymentState' does not exist on type 'PaymentArchitectureService'. Did you mean 'getBookingPaymentStatus'?
src/modules/payments/payment.routes.ts(21,101): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
src/modules/payments/payment.routes.ts(22,78): error TS2339: Property 'getPaymentDiagnostics' does not exist on type 'PaymentArchitectureService'.
src/modules/payments/payment.routes.ts(23,90): error TS2339: Property 'getAdminBillingLifecycle' does not exist on type 'PaymentArchitectureService'.
src/modules/payments/payment.routes.ts(24,97): error TS2339: Property 'registerBusinessAccount' does not exist on type 'PaymentArchitectureService'.
src/modules/payments/payment.routes.ts(25,85): error TS2339: Property 'restoreAfterReconnect' does not exist on type 'PaymentArchitectureService'.
src/modules/payments/payment.routes.ts(26,86): error TS2339: Property 'snapshotForReconnect' does not exist on type 'PaymentArchitectureService'.
src/modules/payments/payment.routes.ts(27,142): error TS2554: Expected 1 arguments, but got 2.
src/modules/payments/services/payment-architecture.service.ts(27,11): error TS2739: Type '{ id: string; bookingId: string; customerId: string; provider: PaymentProvider; status: PaymentSessionStatus.CREATED; amount: { currency: string; valueMinor: number; }; expiresAt: string; metadata: { ...; }; }' is missing the following properties from type 'PaymentSession': retryStrategy, retryCount, maxRetryCount, idempotencyKey
src/modules/payments/services/payment-architecture.service.ts(40,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: "authorization"; status: PaymentSessionStatus.CREATED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.
src/modules/payments/services/payment-architecture.service.ts(63,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: "capture"; status: PaymentSessionStatus.CAPTURED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.
src/modules/payments/services/payment-architecture.service.ts(91,7): error TS2322: Type '"requested"' is not assignable to type 'RefundState'.
src/modules/persistence/in-memory-empty.repository.ts(19,7): error TS2420: Class 'EmptyPersistenceRepository' incorrectly implements interface 'MessageRepository'.
src/modules/persistence/in-memory-empty.repository.ts(19,7): error TS2420: Class 'EmptyPersistenceRepository' incorrectly implements interface 'NotificationRepository'.
src/modules/persistence/in-memory-empty.repository.ts(42,9): error TS2416: Property 'recordRecoveryEvent' in type 'EmptyPersistenceRepository' is not assignable to the same property in base type 'RecoveryRepository'.
src/modules/persistence/in-memory-empty.repository.ts(43,9): error TS2416: Property 'listRecoveryEvents' in type 'EmptyPersistenceRepository' is not assignable to the same property in base type 'RecoveryRepository'.
src/modules/persistence/sqlite.repositories.ts(1,10): error TS2300: Duplicate identifier 'mkdirSync'.
src/modules/persistence/sqlite.repositories.ts(2,10): error TS2300: Duplicate identifier 'dirname'.
src/modules/persistence/sqlite.repositories.ts(2,19): error TS2300: Duplicate identifier 'resolve'.
src/modules/persistence/sqlite.repositories.ts(3,10): error TS2300: Duplicate identifier 'DatabaseSync'.
src/modules/persistence/sqlite.repositories.ts(90,55): error TS2741: Property 'status' is missing in type '{ id: any; rideId: any; channel: any; direction: any; content: any; createdAt: any; }' but required in type 'MessageEventRecord'.
src/modules/persistence/sqlite.repositories.ts(91,67): error TS2741: Property 'channel' is missing in type '{ id: any; notificationType: any; recipient: any; status: NotificationStatus; errorMessage: any; createdAt: any; updatedAt: any; }' but required in type 'NotificationAttemptRecord'.
src/modules/persistence/sqlite.repositories.ts(95,187): error TS2769: No overload matches this call.
src/modules/persistence/sqlite.repositories.ts(98,142): error TS2769: No overload matches this call.
src/modules/persistence/sqlite.repositories.ts(99,152): error TS2769: No overload matches this call.
src/modules/persistence/sqlite.repositories.ts(105,148): error TS2769: No overload matches this call.
src/modules/persistence/sqlite.repositories.ts(106,172): error TS2769: No overload matches this call.
src/modules/persistence/sqlite.repositories.ts(110,9): error TS2322: Type '(event: AuditEvent | AuditEventRecord) => Promise<AuditEvent | AuditEventRecord>' is not assignable to type '(event: AuditEvent | AuditEventRecord) => Promise<void | AuditEventRecord>'.
src/modules/persistence/sqlite.repositories.ts(110,191): error TS2769: No overload matches this call.
src/modules/persistence/sqlite.repositories.ts(110,211): error TS2339: Property 'entityType' does not exist on type 'AuditEvent | AuditEventRecord'.
src/modules/persistence/sqlite.repositories.ts(110,259): error TS2339: Property 'actorId' does not exist on type 'AuditEvent | AuditEventRecord'.
src/modules/persistence/sqlite.repositories.ts(110,274): error TS2339: Property 'payload' does not exist on type 'AuditEvent | AuditEventRecord'.
src/modules/persistence/sqlite.repositories.ts(111,9): error TS2322: Type '(entityType: any, entityId: any) => Promise<AuditEventRecord[]>' is not assignable to type '() => Promise<(AuditEvent | AuditEventRecord)[]>'.
src/modules/persistence/sqlite.repositories.ts(111,25): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(111,37): error TS7006: Parameter 'entityId' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(115,9): error TS2353: Object literal may only specify known properties, and 'createMessageEvent' does not exist in type 'MessageRepository'.
src/modules/persistence/sqlite.repositories.ts(115,28): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(120,9): error TS2561: Object literal may only specify known properties, but 'createNotificationAttempt' does not exist in type 'NotificationRepository'. Did you mean to write 'recordNotificationAttempt'?
src/modules/persistence/sqlite.repositories.ts(120,35): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(121,34): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(121,38): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(121,46): error TS7006: Parameter 'errorMessage' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(121,60): error TS7006: Parameter 'updatedAt' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(126,29): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(127,9): error TS2322: Type '(status: any) => Promise<RecoveryEventRecord[]>' is not assignable to type '() => Promise<RecoveryEventRecord[]>'.
src/modules/persistence/sqlite.repositories.ts(127,28): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(128,30): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(128,34): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(128,42): error TS7006: Parameter 'notes' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(128,49): error TS7006: Parameter 'updatedAt' implicitly has an 'any' type.
src/modules/persistence/sqlite.repositories.ts(130,10): error TS2300: Duplicate identifier 'dirname'.
src/modules/persistence/sqlite.repositories.ts(130,19): error TS2300: Duplicate identifier 'resolve'.
src/modules/persistence/sqlite.repositories.ts(131,10): error TS2300: Duplicate identifier 'mkdirSync'.
src/modules/persistence/sqlite.repositories.ts(132,10): error TS2300: Duplicate identifier 'DatabaseSync'.
src/operational-memory/cli.ts(1,10): error TS2300: Duplicate identifier 'buildOperationalMemoryIndex'.
src/operational-memory/cli.ts(53,16): error TS2300: Duplicate identifier 'main'.
src/operational-memory/cli.ts(72,10): error TS2300: Duplicate identifier 'buildOperationalMemoryIndex'.
src/operational-memory/cli.ts(81,7): error TS2300: Duplicate identifier 'main'.
src/operational-memory/cli.ts(84,99): error TS2339: Property 'outputFile' does not exist on type 'MemoryIndex'.
src/persistence/repository-contracts.ts(13,11): error TS2304: Cannot find name 'RideStatus'.
src/persistence/repository-contracts.ts(30,40): error TS2304: Cannot find name 'RideStatus'.
src/routes/v1/notifications.routes.ts(38,92): error TS2339: Property 'getOperationalQueue' does not exist on type 'NotificationService'.
src/server.ts(12,9): error TS2451: Cannot redeclare block-scoped variable 'start'.
src/server.ts(13,9): error TS2451: Cannot redeclare block-scoped variable 'start'.
src/tracking/tracking.service.ts(20,3): error TS2393: Duplicate function implementation.
src/tracking/tracking.service.ts(45,3): error TS2393: Duplicate function implementation.
src/websocket/socket.server.ts(31,9): error TS2451: Cannot redeclare block-scoped variable 'broadcast'.
src/websocket/socket.server.ts(44,9): error TS2451: Cannot redeclare block-scoped variable 'broadcast'.
src/websocket/socket.server.ts(49,92): error TS2554: Expected 1 arguments, but got 2.
```

## Error Count By File

```txt
      2 src/modules/persistence/in-memory-empty.repository.ts(19,7)
      1 src/websocket/socket.server.ts(49,92)
      1 src/websocket/socket.server.ts(44,9)
      1 src/websocket/socket.server.ts(31,9)
      1 src/tracking/tracking.service.ts(45,3)
      1 src/tracking/tracking.service.ts(20,3)
      1 src/server.ts(13,9)
      1 src/server.ts(12,9)
      1 src/routes/v1/notifications.routes.ts(38,92)
      1 src/persistence/repository-contracts.ts(30,40)
      1 src/persistence/repository-contracts.ts(13,11)
      1 src/operational-memory/cli.ts(84,99)
      1 src/operational-memory/cli.ts(81,7)
      1 src/operational-memory/cli.ts(72,10)
      1 src/operational-memory/cli.ts(53,16)
      1 src/operational-memory/cli.ts(1,10)
      1 src/modules/persistence/sqlite.repositories.ts(99,152)
      1 src/modules/persistence/sqlite.repositories.ts(98,142)
      1 src/modules/persistence/sqlite.repositories.ts(95,187)
      1 src/modules/persistence/sqlite.repositories.ts(91,67)
      1 src/modules/persistence/sqlite.repositories.ts(90,55)
      1 src/modules/persistence/sqlite.repositories.ts(3,10)
      1 src/modules/persistence/sqlite.repositories.ts(2,19)
      1 src/modules/persistence/sqlite.repositories.ts(2,10)
      1 src/modules/persistence/sqlite.repositories.ts(132,10)
      1 src/modules/persistence/sqlite.repositories.ts(131,10)
      1 src/modules/persistence/sqlite.repositories.ts(130,19)
      1 src/modules/persistence/sqlite.repositories.ts(130,10)
      1 src/modules/persistence/sqlite.repositories.ts(128,49)
      1 src/modules/persistence/sqlite.repositories.ts(128,42)
      1 src/modules/persistence/sqlite.repositories.ts(128,34)
      1 src/modules/persistence/sqlite.repositories.ts(128,30)
      1 src/modules/persistence/sqlite.repositories.ts(127,9)
      1 src/modules/persistence/sqlite.repositories.ts(127,28)
      1 src/modules/persistence/sqlite.repositories.ts(126,29)
      1 src/modules/persistence/sqlite.repositories.ts(121,60)
      1 src/modules/persistence/sqlite.repositories.ts(121,46)
      1 src/modules/persistence/sqlite.repositories.ts(121,38)
      1 src/modules/persistence/sqlite.repositories.ts(121,34)
      1 src/modules/persistence/sqlite.repositories.ts(120,9)
      1 src/modules/persistence/sqlite.repositories.ts(120,35)
      1 src/modules/persistence/sqlite.repositories.ts(115,9)
      1 src/modules/persistence/sqlite.repositories.ts(115,28)
      1 src/modules/persistence/sqlite.repositories.ts(111,9)
      1 src/modules/persistence/sqlite.repositories.ts(111,37)
      1 src/modules/persistence/sqlite.repositories.ts(111,25)
      1 src/modules/persistence/sqlite.repositories.ts(110,9)
      1 src/modules/persistence/sqlite.repositories.ts(110,274)
      1 src/modules/persistence/sqlite.repositories.ts(110,259)
      1 src/modules/persistence/sqlite.repositories.ts(110,211)
      1 src/modules/persistence/sqlite.repositories.ts(110,191)
      1 src/modules/persistence/sqlite.repositories.ts(1,10)
      1 src/modules/persistence/sqlite.repositories.ts(106,172)
      1 src/modules/persistence/sqlite.repositories.ts(105,148)
      1 src/modules/persistence/in-memory-empty.repository.ts(43,9)
      1 src/modules/persistence/in-memory-empty.repository.ts(42,9)
      1 src/modules/payments/services/payment-architecture.service.ts(91,7)
      1 src/modules/payments/services/payment-architecture.service.ts(63,29)
      1 src/modules/payments/services/payment-architecture.service.ts(40,29)
      1 src/modules/payments/services/payment-architecture.service.ts(27,11)
      1 src/modules/payments/payment.routes.ts(8,78)
      1 src/modules/payments/payment.routes.ts(27,142)
      1 src/modules/payments/payment.routes.ts(26,86)
      1 src/modules/payments/payment.routes.ts(25,85)
      1 src/modules/payments/payment.routes.ts(24,97)
      1 src/modules/payments/payment.routes.ts(23,90)
      1 src/modules/payments/payment.routes.ts(22,78)
      1 src/modules/payments/payment.routes.ts(21,101)
      1 src/modules/payments/payment.routes.ts(20,93)
      1 src/modules/payments/payment.routes.ts(19,125)
      1 src/modules/payments/payment.routes.ts(14,73)
      1 src/modules/payments/payment.routes.ts(12,46)
      1 src/modules/payments/interfaces/payment.interfaces.ts(8,3)
      1 src/modules/payments/interfaces/payment.interfaces.ts(7,3)
      1 src/modules/payments/interfaces/payment.interfaces.ts(6,3)
      1 src/modules/payments/interfaces/payment.interfaces.ts(4,3)
      1 src/modules/payments/interfaces/payment.interfaces.ts(3,3)
      1 src/modules/payments/interfaces/payment.interfaces.ts(1,83)
      1 src/modules/payments/interfaces/payment.interfaces.ts(1,70)
      1 src/modules/payments/interfaces/payment.interfaces.ts(1,48)
      1 src/modules/payments/interfaces/payment.interfaces.ts(1,31)
      1 src/modules/payments/interfaces/payment.interfaces.ts(1,10)
      1 src/modules/bookings/service.ts(117,65)
      1 src/modules/bookings/service.ts(110,45)
      1 src/dispatch/dispatch.service.ts(2,10)
      1 src/bookings/booking.service.ts(85,13)
      1 src/bookings/booking.service.ts(78,31)
      1 src/bookings/booking.service.ts(75,27)
      1 src/bookings/booking.service.ts(72,5)
      1 src/bookings/booking.service.ts(65,37)
      1 src/bookings/booking.service.ts(40,31)
      1 src/bookings/booking.service.ts(33,7)
      1 src/bookings/booking.service.ts(31,7)
      1 src/bookings/booking-notification-flow.service.ts(76,72)
```

## Decision

If errors exceed 10, fix API build stabilization before continuing implementation/api-shared-contract-adoption-v1.

END
