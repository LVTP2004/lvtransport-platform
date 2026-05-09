# @lvtransport/api

Backend foundation architecture for LV Transport Platform.

## Highlights

- Express modular backend structure
- API versioning under `/api/v1`
- CORS + request logging middleware
- Health check endpoint
- WebSocket server scaffold (`/ws`)
- Domain architecture placeholders for bookings, drivers, tracking, notifications
- Prepared structure for Firebase/Supabase, GPS tracking, push/email automation

## Run

```bash
pnpm --filter @lvtransport/api dev
```
