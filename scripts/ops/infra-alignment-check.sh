#!/usr/bin/env bash
set -euo pipefail

NGINX_SITES_AVAILABLE="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available}"
NGINX_SITES_ENABLED="${NGINX_SITES_ENABLED:-/etc/nginx/sites-enabled}"
PM2_APP_NAME="${PM2_APP_NAME:-lvtransport-api}"

print_header() {
  printf '\n== %s ==\n' "$1"
}

print_header "Nginx site files"
find "$NGINX_SITES_AVAILABLE" "$NGINX_SITES_ENABLED" -maxdepth 1 -type f 2>/dev/null | sort || true

print_header "Conflicting server_name declarations"
if command -v awk >/dev/null 2>&1; then
  find "$NGINX_SITES_AVAILABLE" "$NGINX_SITES_ENABLED" -maxdepth 1 -type f 2>/dev/null \
    | xargs -r awk '
      $1=="server_name" {
        for (i=2;i<=NF;i++) {
          gsub(";","",$i);
          if ($i != "_") {
            name=$i;
            count[name]++;
            refs[name]=refs[name] "\n  - " FILENAME ":" FNR;
          }
        }
      }
      END {
        conflict=0;
        for (name in count) {
          if (count[name] > 1) {
            conflict=1;
            print name " appears " count[name] " times" refs[name] "\n";
          }
        }
        if (!conflict) {
          print "No duplicated explicit server_name entries detected.";
        }
      }
    '
fi

print_header "Nginx syntax"
nginx -t

print_header "PM2 process status"
pm2 describe "$PM2_APP_NAME" >/dev/null
pm2 status "$PM2_APP_NAME"

print_header "PM2 persistence snapshot"
pm2 save

echo
printf 'Infra alignment checks completed.\n'
