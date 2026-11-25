#!/usr/bin/env bash
# Explicit opt-in installation; run only in the authorized Minisforum user session.
set -Eeuo pipefail
umask 077

source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v systemctl >/dev/null || ! command -v git >/dev/null || ! command -v flock >/dev/null; then
  echo "systemctl, git and flock are required" >&2
  exit 1
fi

# Preflight every destination before changing anything. Idempotent installs
# are allowed, but unrelated existing files and symlinks must not be overwritten.
src=(
  "$source_dir/lvtp-github-sync.sh"
  "$source_dir/lvtp-github-sync.service"
  "$source_dir/lvtp-github-sync.timer"
)
dst=(
  "$HOME/.local/bin/lvtp-github-sync"
  "$HOME/.config/systemd/user/lvtp-github-sync.service"
  "$HOME/.config/systemd/user/lvtp-github-sync.timer"
)
for i in "${!src[@]}"; do
  if [[ ! -f "${src[i]}" || -L "${src[i]}" ]]; then
    echo "Missing or symlinked source; refusing: ${src[i]}" >&2
    exit 1
  fi
  if [[ -L "${dst[i]}" ]]; then
    echo "Destination is a symlink; refusing: ${dst[i]}" >&2
    exit 1
  fi
  if [[ -e "${dst[i]}" ]] && ! cmp -s -- "${src[i]}" "${dst[i]}"; then
    echo "Existing destination differs; refusing: ${dst[i]}" >&2
    exit 1
  fi
done
for dir in "$HOME/.local" "$HOME/.local/bin" "$HOME/.config" "$HOME/.config/systemd" "$HOME/.config/systemd/user"; do
  if [[ -L "$dir" ]]; then
    echo "Installation directory is a symlink; refusing: $dir" >&2
    exit 1
  fi
done

# Set restrictive permissions only on newly created directories.
for dir in "$HOME/.local/bin" "$HOME/.config/systemd/user"; do
  if [[ ! -d "$dir" ]]; then
    mkdir -p -m 0700 -- "$dir"
  fi
done
install -m 0700 "${src[0]}" "${dst[0]}"
install -m 0600 "${src[1]}" "${dst[1]}"
install -m 0600 "${src[2]}" "${dst[2]}"
systemctl --user daemon-reload
systemctl --user start lvtp-github-sync.service
systemctl --user enable --now lvtp-github-sync.timer
systemctl --user status --no-pager lvtp-github-sync.timer || true
