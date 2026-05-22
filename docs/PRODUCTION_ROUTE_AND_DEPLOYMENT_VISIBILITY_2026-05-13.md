# Production route and deployment visibility (2026-05-13)

## Build outputs
- Customer app build output: `apps/web/dist`
- Driver app build output: `apps/driver/dist`
- Admin app build output: `apps/admin/dist`

## Recommended production static roots
- `/var/www/lvtp-app` serves customer domain.
- `/var/www/lvtp-driver` serves driver domain.
- `/var/www/lvtp-admin` serves admin domain.

## Required route behavior
Customer routes handled in customer app shell:
- `/`, `/booking`, `/booking.html`, `/tracking`, `/tracking.html`, `/prijzen`, `/diensten`, `/contact`

Control routes mapped to branded surfaces in customer shell:
- `/driver`, `/driver.html` -> Driver access surface (with explicit login explanation and external driver surface link)
- `/admin`, `/admin.html`, `/tower`, `/dashboard` -> Admin access surface (with API health badge and external admin surface link)

Unknown routes:
- branded LV Transport 404 page (no raw Not Found).

## Nginx requirements
Customer vhost should use SPA fallback:
- `try_files $uri $uri/ /index.html;`

HTML compatibility requirement:
- Keep `.html` aliases alive in app-level route map (`/booking.html`, `/tracking.html`, `/driver.html`, `/admin.html`).

## Cache busting and refresh
- Vite build files are content-hashed in `dist/assets/*` by default.
- On deploy, clear old assets before copying new dist (`rm -rf /var/www/lvtp-app/*`).
- Mobile cache test: append query string to root path, e.g. `/?v=2026-05-13-1`.

## Manual deploy
1. `pnpm build`
2. `rsync -av --delete apps/web/dist/ /var/www/lvtp-app/`
3. `rsync -av --delete apps/driver/dist/ /var/www/lvtp-driver/`
4. `rsync -av --delete apps/admin/dist/ /var/www/lvtp-admin/`
5. `sudo nginx -t && sudo systemctl reload nginx`
6. Hard-refresh browser (or mobile close/reopen).
