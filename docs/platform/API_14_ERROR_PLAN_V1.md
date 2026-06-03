# API 14 ERROR PLAN V1

Status: BLOCKED

Date: 2026-06-03T19:02:37+02:00

## Error Count

14

## Current Diagnosis

The API build is no longer dominated by sqlite.repositories.ts. The remaining build errors are concentrated in booking contracts, payment architecture records, dispatch imports, and websocket service lifecycle.

## Fix Order

1. Booking contract alignment
2. Payment architecture record alignment
3. Dispatch import alignment
4. Websocket lifecycle alignment

## Raw Build Errors

```
src/bookings/booking.service.ts(27,7): error TS2353: Object literal may only specify known properties, and 'bookingCode' does not exist in type 'BookingRecord'.
src/bookings/booking.service.ts(31,28): error TS2304: Cannot find name 'BookingLifecycle'.
src/bookings/booking.service.ts(85,13): error TS2339: Property 'driverId' does not exist on type 'BookingRecord'.
src/dispatch/dispatch.service.ts(2,10): error TS2305: Module '"../bookings/bookings.service.js"' has no exported member 'bookingsService'.
src/modules/bookings/service.ts(110,45): error TS2339: Property 'getById' does not exist on type 'BookingRepository'.
src/modules/bookings/service.ts(117,65): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/modules/payments/payment.routes.ts(14,96): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
src/modules/payments/services/payment-architecture.service.ts(44,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: "authorization"; status: PaymentSessionStatus.CREATED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.
src/modules/payments/services/payment-architecture.service.ts(72,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: "capture"; status: PaymentSessionStatus.CAPTURED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.
src/modules/payments/services/payment-architecture.service.ts(96,11): error TS2741: Property 'requestedBy' is missing in type '{ id: string; transactionId: string; reason: "duplicate" | "customer_request" | "fraud_suspected" | "service_issue"; state: RefundState.REQUESTED; amount: { currency: string; valueMinor: number; }; }' but required in type 'RefundRecord'.
src/modules/payments/services/payment-architecture.service.ts(121,21): error TS2304: Cannot find name 'PaymentProvider'.
src/persistence/repository-contracts.ts(13,11): error TS2304: Cannot find name 'RideStatus'.
src/persistence/repository-contracts.ts(30,40): error TS2304: Cannot find name 'RideStatus'.
src/websocket/socket.server.ts(107,33): error TS2339: Property 'shutdown' does not exist on type '{ initialize(): void; registerClient(socket: WebSocket): void; createBooking(input: { customerName?: string | undefined; pickup: string; destination: string; serviceType?: "standard" | ... 2 more ... | undefined; scheduledAt?: string | undefined; paymentStatus?: "pending" | ... 4 more ... | undefined; }): BookingRec...'.
```
