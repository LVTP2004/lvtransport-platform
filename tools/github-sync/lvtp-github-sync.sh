#!/usr/bin/env bash
# Maintain a separate, read-only-from-local GitHub mirror for LVTransport.
set -Eeuo pipefail
umask 077

URL="https://github.com/LVTP2004/lvtransport-platform.git"
DEST="$HOME/.local/share/lvtp-github-mirror/lvtransport-platform"
STATE="$HOME/.local/state/lvtp-github-sync"
mkdir -p "$STATE" "$(dirname "$DEST")"
exec 9>"$STATE/sync.lock"
if ! flock -n 9; then
  echo "Already syncing; skipping."
  exit 0
fi
if [[ -L "$DEST" ]]; then
  echo "Refusing symlink destination" >&2
  exit 1
fi
if [[ ! -e "$DEST" ]]; then
  echo "Initializing dedicated GitHub mirror"
  git clone --single-branch --branch main "$URL" "$DEST"
  echo "Mirrored main: $(git -C "$DEST" rev-parse HEAD)"
  exit 0
fi
if [[ ! -d "$DEST/.git" ]]; then
  echo "Mirror path exists and is not a normal Git working tree; refusing" >&2
  exit 1
fi
actual="$(git -C "$DEST" remote get-url origin)"
if [[ "$actual" != "$URL" ]]; then
  echo "Unexpected origin; refusing" >&2
  exit 1
fi
if [[ "$(git -C "$DEST" symbolic-ref --quiet --short HEAD || true)" != "main" ]]; then
  echo "Mirror branch is not main; refusing" >&2
  exit 1
fi
if [[ -n "$(git -C "$DEST" status --porcelain=v1 --untracked-files=all)" ]]; then
  echo "Mirror contains local changes; no update performed" >&2
  exit 1
fi
git -C "$DEST" fetch --no-tags origin main
local_head="$(git -C "$DEST" rev-parse HEAD)"
remote_head="$(git -C "$DEST" rev-parse FETCH_HEAD)"
if [[ "$local_head" == "$remote_head" ]]; then
  echo "Already up to date: $local_head"
  exit 0
fi
if ! git -C "$DEST" merge-base --is-ancestor "$local_head" "$remote_head"; then
  echo "Remote is not a fast-forward; refusing to rewrite history" >&2
  exit 1
fi
git -C "$DEST" merge --ff-only "$remote_head"
echo "Mirror updated: $local_head -> $remote_head"
