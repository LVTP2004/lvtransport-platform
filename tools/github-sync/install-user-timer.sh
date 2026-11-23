#!/usr/bin/env bash
# Explicit opt-in installation; run only on the authorized Minisforum user session.
set -Eeuo pipefail
umask 077
source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v systemctl >/dev/null || ! command -v git >/dev/null || ! command -v flock >/dev/null; then
  echo "systemctl, git and flock are required" >&2
  exit 1
fi
install -d -m 0700 "$HOME/.local/bin" "$HOME/.config/systemd/user"
install -m 0700 "$source_dir/lvtp-github-sync.sh" "$HOME/.local/bin/lvtp-github-sync"
install -m 0600 "$source_dir/lvtp-github-sync.service" "$HOME/.config/systemd/user/lvtp-github-sync.service"
install -m 0600 "$source_dir/lvtp-github-sync.timer" "$HOME/.config/systemd/user/lvtp-github-sync.timer"
systemctl --user daemon-reload
systemctl --user enable --now lvtp-github-sync.timer
systemctl --user start lvtp-github-sync.service
systemctl --user status --no-pager lvtp-github-sync.timer || true
