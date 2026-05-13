# LV Transport Production Route Deployment (2026-05-13)

## Deploy artifact
- Build output to deploy: `apps/web/dist/`
- Required public files include route aliases and fallback pages:
  - `booking.html`, `tracking.html`, `admin.html`, `driver.html`, `contact.html`, `prijzen.html`, `diensten.html`
  - `/booking/index.html`, `/tracking/index.html`, `/admin/index.html`, `/driver/index.html`, `/contact/index.html`, `/prijzen/index.html`, `/diensten/index.html`
  - `404.html`

## Why
This project currently builds as a single Vite web app without React Router route definitions. Static aliases ensure direct URL opens and refreshes keep working on static hosting / CDN / basic VPS file hosting.

## Nginx (recommended)
```nginx
server {
  server_name lvtransport.be www.lvtransport.be;
  root /var/www/lvtransport-platform/apps/web/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  error_page 404 /404.html;
  location = /404.html { internal; }
}
```

## Cache busting
- Vite emits hashed JS/CSS filenames in `dist/assets/*`.
- Keep `index.html` and route alias HTML files with short/no-cache headers:
  - `Cache-Control: no-cache, must-revalidate`
- Keep hashed assets long-lived:
  - `Cache-Control: public, max-age=31536000, immutable`

## Validation commands
- `pnpm --filter @lvtransport/web typecheck`
- `pnpm --filter @lvtransport/web build`
