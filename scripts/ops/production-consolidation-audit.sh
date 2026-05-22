#!/usr/bin/env bash
set -euo pipefail

: "${WEB_ROOT:=/var/www/lvtp-app}"
: "${ADMIN_ROOT:=/var/www/lvtp-admin}"
: "${DRIVER_ROOT:=/var/www/lvtp-driver}"
: "${API_URL_EXPECTED:=https://api.lvtransport.be}"
: "${NGINX_SITES_AVAILABLE:=/etc/nginx/sites-available}"
: "${NGINX_SITES_ENABLED:=/etc/nginx/sites-enabled}"
: "${PM2_APP_NAME:=lvtransport-api}"
: "${REPORT_PATH:=./docs/PRODUCTION_CONSOLIDATION_AUDIT_$(date +%F).md}"

pass() { printf '✅ %s\n' "$1"; }
warn() { printf '⚠️  %s\n' "$1"; }
fail() { printf '❌ %s\n' "$1"; }

write_report_header() {
  cat > "$REPORT_PATH" <<REPORT
# LVTP Production Consolidation Audit — $(date -u +"%Y-%m-%d %H:%M UTC")

## Scope
- OVH deployment structure
- Active frontend builds
- Nginx routing & syntax
- PM2 process health
- Frontend/backend environment consistency
- Static asset serving readiness
- Legacy artifact detection

## Findings
REPORT
}

append_report() {
  printf '%s\n' "$1" >> "$REPORT_PATH"
}

check_dir_nonempty() {
  local label="$1" dir="$2"
  if [[ -d "$dir" ]] && [[ -n "$(find "$dir" -maxdepth 1 -mindepth 1 2>/dev/null)" ]]; then
    pass "$label present at $dir"
    append_report "- ✅ $label present at \`$dir\`"
  else
    fail "$label missing or empty at $dir"
    append_report "- ❌ $label missing or empty at \`$dir\`"
  fi
}

check_build_hash_exists() {
  local label="$1" dir="$2"
  if find "$dir" -maxdepth 2 -type f \( -name '*.js' -o -name '*.css' \) 2>/dev/null | rg -q '\.[a-f0-9]{6,}\.'; then
    pass "$label appears to be production-built (hashed assets detected)"
    append_report "- ✅ $label has hashed static assets"
  else
    warn "$label may not be a production build (no hashed assets detected)"
    append_report "- ⚠️ $label has no hashed asset pattern"
  fi
}

check_env_api_url() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    warn "$file not found"
    append_report "- ⚠️ Missing env file: \`$file\`"
    return
  fi

  local found
  found="$(rg -N '^(VITE_API_URL|NEXT_PUBLIC_API_URL|REACT_APP_API_URL)=' "$file" || true)"
  if [[ "$found" == *"$API_URL_EXPECTED"* ]]; then
    pass "$file API URL aligned with expected backend: $API_URL_EXPECTED"
    append_report "- ✅ \`$file\` points to expected API URL"
  elif [[ -n "$found" ]]; then
    warn "$file API URL differs from expected backend"
    append_report "- ⚠️ \`$file\` has API URL mismatch: \`$found\`"
  else
    warn "$file has no explicit frontend API URL variable"
    append_report "- ⚠️ \`$file\` has no explicit frontend API URL variable"
  fi
}

write_report_header

echo "== Phase 1: Deployment consolidation checks =="
check_dir_nonempty "Public web root" "$WEB_ROOT"
check_dir_nonempty "Public admin root" "$ADMIN_ROOT"
check_dir_nonempty "Public driver root" "$DRIVER_ROOT"

check_build_hash_exists "Web root" "$WEB_ROOT"
check_build_hash_exists "Admin root" "$ADMIN_ROOT"
check_build_hash_exists "Driver root" "$DRIVER_ROOT"

echo
if command -v nginx >/dev/null 2>&1; then
  if nginx -t >/tmp/lvtp-nginx-test.out 2>&1; then
    pass "Nginx configuration syntax is valid"
    append_report "- ✅ Nginx syntax test passed"
  else
    fail "Nginx configuration syntax failed"
    append_report "- ❌ Nginx syntax test failed"
    sed -n '1,80p' /tmp/lvtp-nginx-test.out
  fi
else
  warn "nginx binary unavailable in this environment"
  append_report "- ⚠️ Nginx binary unavailable in audit environment"
fi

echo
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    pass "PM2 service '$PM2_APP_NAME' is registered"
    append_report "- ✅ PM2 service \`$PM2_APP_NAME\` is registered"
  else
    warn "PM2 service '$PM2_APP_NAME' is not registered"
    append_report "- ⚠️ PM2 service \`$PM2_APP_NAME\` not found"
  fi
else
  warn "pm2 binary unavailable in this environment"
  append_report "- ⚠️ PM2 binary unavailable in audit environment"
fi

echo
append_report "\n## Environment alignment"
check_env_api_url ".env.production"
check_env_api_url "apps/web/.env.production"
check_env_api_url "apps/admin/.env.production"
check_env_api_url "apps/driver/.env.production"

echo
append_report "\n## Legacy/fragmentation scan"
legacy_hits="$(find "$WEB_ROOT" "$ADMIN_ROOT" "$DRIVER_ROOT" -maxdepth 2 -type f 2>/dev/null | rg -i '(demo|old|backup|copy|legacy)' || true)"
if [[ -n "$legacy_hits" ]]; then
  warn "Potential legacy artifacts detected in public roots"
  append_report "- ⚠️ Potential legacy artifacts detected (review required)"
else
  pass "No obvious legacy artifact names detected in public roots"
  append_report "- ✅ No obvious legacy artifact names detected in public roots"
fi

echo
pass "Audit completed. Report: $REPORT_PATH"
append_report "\n## Conclusion\n- Audit executed successfully. Review warnings and resolve prior to founder-grade production presentation."
