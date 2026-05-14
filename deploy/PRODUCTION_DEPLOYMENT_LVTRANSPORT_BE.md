# LV Transport Production Cutover Runbook (lvtransport.be)

## Scope
This runbook cuts over only the root domains (`lvtransport.be`, `www.lvtransport.be`) to the VPS `51.222.107.59` and preserves existing subdomains (`app`, `api`, `admin`, `driver`).

## 0) Safety first (required backups)
```bash
sudo cp -a /etc/nginx /etc/nginx.backup-$(date +%F-%H%M%S)
sudo cp -a /var/www/html /var/www/html.backup-$(date +%F-%H%M%S)
```

## 1) DNS readiness checks
Run until both root hostnames resolve to VPS IP:
```bash
dig +short A lvtransport.be

dig +short A www.lvtransport.be

dig +short A app.lvtransport.be

dig +trace lvtransport.be
```
Expected:
- `lvtransport.be` => `51.222.107.59`
- `www.lvtransport.be` => `51.222.107.59` (A or CNAME to root)
- `app.lvtransport.be` stays pointed to current working VPS target

## 2) Build and publish premium customer frontend
From repository root:
```bash
pnpm install --frozen-lockfile
pnpm build
```

Publish built customer frontend to `/var/www/html` on VPS:
```bash
sudo rsync -av --delete apps/web/dist/ /var/www/html/
```

## 3) Nginx root-domain server block
Install and enable root block:
```bash
sudo cp deploy/nginx-lvtransport-root.conf /etc/nginx/sites-available/lvtransport-root.conf
sudo ln -sfn /etc/nginx/sites-available/lvtransport-root.conf /etc/nginx/sites-enabled/lvtransport-root.conf
sudo nginx -t
sudo systemctl reload nginx
```

Do **not** modify existing files for `app`, `api`, `admin`, or `driver` blocks.

## 4) SSL issuance for root domains
Only when DNS is fully propagated:
```bash
sudo certbot --nginx -d lvtransport.be -d www.lvtransport.be
```

If certbot fails due to propagation, wait and re-check:
```bash
dig +short A lvtransport.be

dig +short A www.lvtransport.be

curl -I http://lvtransport.be/.well-known/acme-challenge/test
```
Then retry certbot command.

## 5) Post-cutover validation checklist
```bash
curl -I http://lvtransport.be
curl -I https://lvtransport.be
curl -I https://www.lvtransport.be
sudo nginx -t
pm2 status
pnpm build
```

Functional checks (manual):
- Premium black/gold branding visible
- LV logo visible
- Booking flow stepper visible and usable
- Pricing section visible
- Tracking page visible
- Moni Assistant visible and non-blocking
- Business/VIP section visible
- No demo wording or placeholder text
- No backend/technical text exposed to customers
