# LV Transport API Foundation

Scaffolded backend architecture with modular domains, API versioning, middleware, and WebSocket/event foundations.

## Key folders
- `src/routes` versioned HTTP routes
- `src/controllers` request handlers
- `src/services` orchestration/business services
- `src/middleware` request logging + error handling
- `src/websocket` WebSocket server scaffold
- `src/bookings`, `src/drivers`, `src/tracking`, `src/notifications` domain event architecture
- `src/customers`, `src/admin` reserved domain modules

## Run
```bash
pnpm --filter @lvtransport/api dev
```
