# lvtransport.be production runtime baseline

Status: verified operational baseline.

This document records the current verified production runtime for the operational `lvtransport.be` deployment. It is intentionally focused on the production site and must not be mixed with experimental LVTP feature assumptions.

## Verified production domains

The following routes were verified from the VPS and returned `200 OK`:

```bash
curl -i http://127.0.0.1:3000/health
curl -i https://api.lvtransport.be/health
curl -I https://lvtransport.be
curl -I https://lvtransport.be/booking
curl -I https://lvtransport.be/tracking
```

## Runtime facts

- Production domain: `lvtransport.be`
- API domain: `api.lvtransport.be`
- API PM2 process: `lvtransport-api`
- API runtime script: `/var/www/lvtransport-api/server.js`
- API runtime port: `3000`
- API reverse proxy target: `127.0.0.1:3000`
- Public frontend current proxy target: `127.0.0.1:4173`
- Admin static root observed on VPS: `/var/www/lvtransport-platform/admin`
- Driver static root observed on VPS: `/var/www/lvtransport-platform/driver`

## CORS production origins

The production API must allow the operational frontend origins that are part of the verified deployment:

- `https://lvtransport.be`
- `https://www.lvtransport.be`
- `https://app.lvtransport.be`
- `https://admin.lvtransport.be`
- `https://driver.lvtransport.be`

The admin origin is required because the VPS logs showed CORS errors for `https://admin.lvtransport.be` before it was added to the runtime allowed origins.

## Production safety rules

- Treat `lvtransport.be` as the operational production baseline.
- Keep experimental LVTP automation, sound, and future platform features separate from production assumptions until explicitly validated.
- Do not deploy automatically from documentation-only consolidation work.
- Do not restart PM2 or reload Nginx unless a reviewed deployment plan requires it.
- Prefer PR review before applying runtime changes to the VPS.

## Current known alignment

- Repository Nginx production upstream should use `127.0.0.1:3000` for the API.
- Deployment health checks should target `http://127.0.0.1:3000/health` or `https://api.lvtransport.be/health`.
- The verified PM2 application name is `lvtransport-api`.
