#!/usr/bin/env bash
set -u

INTERVAL="${INTERVAL:-5}"
PORT="${PORT:-8787}"
ROOT="${ROOT:-$(pwd)}"
OUT_DIR="${OUT_DIR:-$HOME/.lvtp-observer}"
OUT_FILE="$OUT_DIR/context.json"
LOG_FILE="$OUT_DIR/observer.log"

mkdir -p "$OUT_DIR"

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || sed 's/"/\\"/g'
}

safe_cmd() {
  timeout 3 bash -lc "$1" 2>&1 | head -n 80
}

snapshot() {
  TS="$(date -Iseconds)"

  HOST="$(hostname 2>/dev/null || echo unknown)"
  USERNAME="$(whoami 2>/dev/null || echo unknown)"
  UPTIME="$(safe_cmd "uptime")"

  GIT_BRANCH="$(safe_cmd "cd '$ROOT' 2>/dev/null && git branch --show-current")"
  GIT_STATUS="$(safe_cmd "cd '$ROOT' 2>/dev/null && git status --short")"
  GIT_LOG="$(safe_cmd "cd '$ROOT' 2>/dev/null && git log --oneline -5")"

  SYSTEMD_USER="$(safe_cmd "systemctl --user --no-pager --type=service --state=running 2>/dev/null | grep -Ei 'lvtp|moni|node|vite|pnpm' || true")"
  DOCKER_PS="$(safe_cmd "docker ps --format '{{.Names}} | {{.Image}} | {{.Status}} | {{.Ports}}' 2>/dev/null || true")"
  PORTS="$(safe_cmd "ss -tulpn 2>/dev/null | grep -E 'LISTEN|:3000|:5173|:8787|node|vite|pnpm' || true")"
  PROCS="$(safe_cmd "ps -eo pid,ppid,cmd --sort=-%mem | grep -Ei 'lvtp|moni|node|vite|pnpm|docker' | grep -v grep | head -40")"

  RECENT_ERRORS="$(safe_cmd "journalctl --user -n 80 --no-pager 2>/dev/null | grep -Ei 'error|failed|warn|exception|panic|denied|drift' | tail -30 || true")"

  RUNTIME_FILES="$(safe_cmd "find '$ROOT' -maxdepth 4 -type f \\( -iname '*runtime*.json' -o -iname '*heartbeat*.json' -o -iname '*topology*.json' -o -iname '*memory*.json' -o -iname '*governance*.json' -o -iname '*ontology*.json' \\) 2>/dev/null | head -80")"

  WARNINGS=""

  if [ -n "$GIT_STATUS" ]; then
    WARNINGS="${WARNINGS}- Git working tree has uncommitted changes.\n"
  fi

  if echo "$SYSTEMD_USER" | grep -qi "lvtp"; then
    :
  else
    WARNINGS="${WARNINGS}- No running lvtp systemd user service detected.\n"
  fi

  if echo "$RECENT_ERRORS" | grep -Eiq "error|failed|exception|panic"; then
    WARNINGS="${WARNINGS}- Recent runtime errors detected in user journal.\n"
  fi

  SUMMARY="LVTP observer snapshot generated. Host=$HOST. Root=$ROOT. Git branch=$GIT_BRANCH. Warnings present: $( [ -n "$WARNINGS" ] && echo yes || echo no )."

  cat > "$OUT_FILE" <<EOF
{
  "observer": {
    "mode": "read_only",
    "mutation_allowed": false,
    "exec_allowed": false,
    "writes_only_to": "$OUT_DIR",
    "timestamp": "$TS"
  },
  "host": $(printf "%s" "$HOST" | json_escape),
  "user": $(printf "%s" "$USERNAME" | json_escape),
  "root_observed": $(printf "%s" "$ROOT" | json_escape),
  "uptime": $(printf "%s" "$UPTIME" | json_escape),
  "git": {
    "branch": $(printf "%s" "$GIT_BRANCH" | json_escape),
    "status": $(printf "%s" "$GIT_STATUS" | json_escape),
    "recent_commits": $(printf "%s" "$GIT_LOG" | json_escape)
  },
  "runtime": {
    "systemd_user_services": $(printf "%s" "$SYSTEMD_USER" | json_escape),
    "docker": $(printf "%s" "$DOCKER_PS" | json_escape),
    "ports": $(printf "%s" "$PORTS" | json_escape),
    "processes": $(printf "%s" "$PROCS" | json_escape)
  },
  "signals": {
    "recent_errors": $(printf "%s" "$RECENT_ERRORS" | json_escape),
    "runtime_files_found": $(printf "%s" "$RUNTIME_FILES" | json_escape),
    "warnings_for_ai": $(printf "%b" "$WARNINGS" | json_escape)
  },
  "summary_for_ai": $(printf "%s" "$SUMMARY" | json_escape)
}
EOF

  echo "[$TS] snapshot updated: $OUT_FILE" >> "$LOG_FILE"
}

serve() {
  cd "$OUT_DIR" || exit 1
  echo "LVTP Observer Bridge running:"
  echo "  file: $OUT_FILE"
  echo "  url:  http://127.0.0.1:$PORT/context.json"
  echo "  mode: READ-ONLY"
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1
}

loop() {
  while true; do
    snapshot
    sleep "$INTERVAL"
  done
}

case "${1:-run}" in
  once)
    snapshot
    cat "$OUT_FILE"
    ;;
  run)
    loop
    ;;
  serve)
    snapshot
    serve
    ;;
  live)
    loop &
    OBS_PID=$!
    serve
    kill "$OBS_PID" 2>/dev/null || true
    ;;
  *)
    echo "Usage:"
    echo "  ./lvtp-observer.sh once"
    echo "  ./lvtp-observer.sh run"
    echo "  ./lvtp-observer.sh serve"
    echo "  ./lvtp-observer.sh live"
    ;;
esac
