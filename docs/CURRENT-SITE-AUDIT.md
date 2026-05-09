# Current Site Audit (`current-site/lvtransport-platform-current-site.zip`)

Date: 2026-05-09 (UTC)

## 1) Files found in the ZIP

ZIP path analyzed: `current-site/lvtransport-platform-current-site.zip`.

```text
public/
public/.htaccess
public/driver.html.0.tmp
public/tracking.html
public/support.html
public/driver.html
public/manifest.json
public/service-worker.js
public/admin.html
public/index.html
public/account.html
public/assets/
public/assets/css/
public/assets/css/style.css
public/assets/img/
public/assets/img/lv-logo-premium.svg
public/assets/img/hero-car.svg
public/assets/img/hero-bg-premium.svg
public/assets/img/favicon.png
public/assets/img/app-icon-512.png
public/assets/img/app-icon-192.png
public/assets/img/logo-official-wide.png
public/assets/img/hero-bg-contact.webp
public/assets/img/hero-bg-city.webp
public/assets/img/hero-bg-world.webp
public/assets/img/hero-byd-virgen.webp
public/assets/img/hero-byd-virgen-mobile.webp
public/assets/js/
public/assets/js/tracking.js
public/assets/js/pricing.js
public/assets/js/driver.js
public/assets/js/common.js
public/assets/js/booking.js
public/assets/js/api.js
public/assets/js/admin.js
public/assets/js/chatbot.js
public/assets/js/customer-auth.js
public/assets/js/account.js
public/assets/js/config.js
```

Total entries: 39 (including directories).

## 2) Pages found

Primary HTML pages:
- `public/index.html` (main marketing + booking page)
- `public/tracking.html` (ride tracking)
- `public/driver.html` (driver panel)
- `public/admin.html` (admin control tower)
- `public/support.html` (support page)
- `public/account.html` (customer account page)

Additional HTML-like artifact:
- `public/driver.html.0.tmp` (temporary backup artifact; not a deployable route by default, but present in the ZIP and should be excluded from production bundles)

## 3) Assets found

### CSS
- `public/assets/css/style.css`

### JavaScript
- `public/assets/js/config.js`
- `public/assets/js/api.js`
- `public/assets/js/common.js`
- `public/assets/js/pricing.js`
- `public/assets/js/booking.js`
- `public/assets/js/tracking.js`
- `public/assets/js/driver.js`
- `public/assets/js/admin.js`
- `public/assets/js/chatbot.js`
- `public/assets/js/customer-auth.js`
- `public/assets/js/account.js`

### Images / Icons
- Logo and branding: `lv-logo-premium.svg`, `logo-official-wide.png`, `favicon.png`
- Hero imagery: `hero-car.svg`, `hero-bg-premium.svg`, `hero-bg-contact.webp`, `hero-bg-city.webp`, `hero-bg-world.webp`, `hero-byd-virgen.webp`, `hero-byd-virgen-mobile.webp`
- PWA icons: `app-icon-192.png`, `app-icon-512.png`

### Platform/web app files
- `public/manifest.json`
- `public/service-worker.js`
- `public/.htaccess`

## 4) Risks

1. **Client-side token storage risk (XSS impact amplification).**
   - Auth/session tokens are stored in `localStorage` for admin, driver, and customer flows (`lv_admin_token`, role tokens, customer token/profile).
   - Any successful XSS on the origin could expose tokens and impersonate users.

2. **Admin login email prefilled in public bundle.**
   - `admin.html` pre-populates the admin email field, leaking operational account identity and increasing phishing/bruteforce targeting.

3. **Temporary/backup artifact in deployable package.**
   - `driver.html.0.tmp` indicates build/package hygiene issues and possible accidental exposure of stale or sensitive content.

4. **Service worker cache/version mismatch risk.**
   - `service-worker.js` cache name (`lvtransport-v70-final-hero-calculator`) appears out of sync with current frontend versioning (`FRONTEND_VERSION: '8.0'` and `?v=80` query strings on key assets).
   - Can cause stale asset retention and hard-to-debug client behavior.

5. **Third-party runtime dependency without local fallback.**
   - `tracking.html` depends on Leaflet from `unpkg.com`; CDN outage or blocking can degrade mapping/tracking UX.

6. **Publicly exposed operational metadata.**
   - Static config contains business contacts and operational constants in client code; acceptable for some items, but sensitive operational fields should be reviewed.

## 5) Broken or demo parts

1. **“Publish via API” is explicitly not fully active (demo/partial feature).**
   - Admin site-control UX states that global publication needs backend endpoint `/api/admin/site-config` and falls back to local preview messaging when unavailable.

2. **Local preview behavior instead of true server-side CMS updates.**
   - Site-control values are persisted to browser `localStorage` (`lv_site_config`) for preview, so edits are machine/browser-local unless API publish succeeds.

3. **Possible stale build artifact included.**
   - `driver.html.0.tmp` strongly suggests leftover temp output from editing/deployment process.

4. **Potential stale/offline behavior from service worker strategy.**
   - Aggressive cache use plus version drift can surface outdated UI/assets after deployment unless cache invalidation is managed tightly.

## 6) Migration plan (current static ZIP -> platform repository)

### Phase 1 — Inventory & parity baseline
1. Import all ZIP files into a dedicated migration workspace (do not serve directly from ZIP).
2. Build a page/asset manifest and map each page to target routes/components in the platform.
3. Define “must-match” UI areas (booking form, tracking, admin metrics, account auth flow).

### Phase 2 — Security hardening before cutover
1. Replace localStorage token strategy with secure httpOnly cookie sessions where possible.
2. Remove prefilled admin identity from public HTML.
3. Remove temp artifacts (`*.tmp`, backups) from release pipeline.
4. Review what config values belong server-side vs public client bundle.

### Phase 3 — Feature completion & API contracts
1. Formalize and implement `/api/public/site-config` and `/api/admin/site-config` contract with validation, authz, and audit logging.
2. Convert “local preview only” site-control into environment-backed persisted config.
3. Add contract tests for booking, auth, admin, tracking, and site-config endpoints.

### Phase 4 — Frontend modernization
1. Consolidate static pages into the platform’s canonical frontend architecture.
2. Bundle third-party dependencies (Leaflet) through the build system (with SRI or pinned package version policy).
3. Normalize asset versioning (single source of truth for app version + cache keys).

### Phase 5 — Service worker and release reliability
1. Align service worker cache names with release versioning.
2. Introduce explicit cache-busting + activation strategy and rollback-safe deploy process.
3. Add smoke tests validating fresh deploy clients receive current assets.

### Phase 6 — QA, launch, and decommission
1. Run full functional QA on booking/tracking/admin/driver/account journeys.
2. Run security checks (XSS, auth/session handling, role access).
3. Cut over traffic gradually, monitor errors/metrics, then retire ZIP/static legacy hosting.
