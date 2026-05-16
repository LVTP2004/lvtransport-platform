# LVTP Phase 31 — Production API Mapping

## Current Production API Type
Standalone monolithic Express API.

## Runtime Role
This API is currently the active production backend for LVTP.

## Confirmed Production Capabilities

### Pricing
- Pricing estimate endpoint exists.
- Admin pricing update endpoint exists.
- Pricing settings are stored in runtime db settings.
- Booking stores priceEstimate.

### Booking
- Booking creation exists.
- Booking generates code.
- Booking includes status, customer data, route, date/time and price estimate.
- Booking contributes to dashboard aggregation.

### Driver
- Driver status endpoint exists.
- Driver location endpoint exists.
- Driver location can update assigned booking.
- Live driver states endpoint exists.

### Tracking
- Tracking URL uses reservation code.
- Tracking currently links to tracking page with code parameter.

### Dashboard
- Dashboard is calculated from runtime db.
- Dashboard includes bookings, active, pending, cancelled, revenue and drivers online.

### Notifications
- Booking confirmation text/html exists.
- Notification flow is partially embedded in monolithic API.

## Important Finding
The production API is operational and should not be overwritten abruptly.

## Migration Strategy
1. Preserve production server.js and data folder.
2. Map each route to equivalent monorepo module.
3. Start with read-only comparison.
4. Migrate one domain at a time:
   - pricing
   - booking
   - driver
   - tracking
   - notifications
   - dashboard
5. Keep production backup before each change.
6. Switch runtime only after parity validation.

## First Safe Migration Candidate
Pricing is the safest first migration candidate because:
- it has clear inputs and outputs
- it is stateless compared to booking lifecycle
- it can be validated with curl
- it does not require driver realtime state first

## Risk
Booking and driver location should not be migrated first because they affect active operational state.
