# API AUTH NOTIFICATION STABILIZATION V1

Status: GENERATED
Category: API Build Stabilization
Date: 2026-05-31

## Purpose

Stabilize the currently dirty API auth and notification area before continuing shared contract adoption.

## Dirty Files In Scope

```txt
 M apps/api/package.json
 M apps/api/src/auth/middleware/authenticate.ts
 M apps/api/src/auth/middleware/authorize.ts
 M apps/api/src/auth/services/access-control.service.ts
 M apps/api/src/notifications/notification.service.ts
 M apps/api/src/notifications/notification.types.ts
 M packages/auth/src/index.ts
 M pnpm-lock.yaml
```

## Current Build Errors In Scope

```txt
src/bookings/booking-notification-flow.service.ts(76,72): error TS2554: Expected 0-1 arguments, but got 2.
src/modules/persistence/sqlite.repositories.ts(91,67): error TS2741: Property 'channel' is missing in type '{ id: any; notificationType: any; recipient: any; status: NotificationStatus; errorMessage: any; createdAt: any; updatedAt: any; }' but required in type 'NotificationAttemptRecord'.
src/routes/v1/notifications.routes.ts(38,92): error TS2339: Property 'getOperationalQueue' does not exist on type 'NotificationService'.
```

## Total API Build Errors

```txt
95
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

Fix auth and notification build blockers first. Do not continue API shared contract adoption until this scoped area is clean or intentionally reverted.

END
