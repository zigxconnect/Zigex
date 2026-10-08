#!/usr/bin/env bash
# Runs ON THE VPS (called by .github/workflows/deploy.yml, or by hand).
#
#   remote-deploy.sh <version> <path-to-release.tar.gz>
#
# Unpacks the release into $APP_DIR/releases/<version>_<timestamp> (so a
# redeploy never touches the live folder), switches `current` to
# it, restarts PM2, and checks /api/health. If the check fails it switches
# back to the previous release automatically. Keeps the last $KEEP releases.
set -euo pipefail

VERSION="${1:?usage: remote-deploy.sh <version> <tarball>}"
TARBALL="${2:?usage: remote-deploy.sh <version> <tarball>}"
APP_DIR="${APP_DIR:-/var/www/zigex}"   # /var/www/zigex-dev for the development site
APP_NAME="${APP_NAME:-zigex}"           # PM2 process name (zigex-dev for development)
APP_PORT="${APP_PORT:-3000}"            # 3100 for development
KEEP="${KEEP:-3}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:$APP_PORT/api/health}"
export APP_DIR APP_NAME APP_PORT
HEALTH_TRIES="${HEALTH_TRIES:-30}" # 2 s apart

RELEASES="$APP_DIR/releases"
RELEASE="$RELEASES/${VERSION}_$(date +%Y%m%d%H%M%S)"
CURRENT="$APP_DIR/current"

# Release folders are "<version>_<YYYYmmddHHMMSS>"; order by that stamp, newest first
# (folder mtimes aren't reliable: unpacking a tarball resets them).
releases_newest_first() {
  ls -1 "$RELEASES" 2>/dev/null | awk -F_ '{print $NF" "$0}' | sort -r | cut -d' ' -f2-
}

log() { printf '\033[1m[deploy]\033[0m %s\n' "$*"; }
fail() { printf '\033[31m[deploy] %s\033[0m\n' "$*" >&2; exit 1; }

[[ "$VERSION" =~ ^[0-9A-Za-z._-]+$ ]] || fail "Bad version name: $VERSION"
[[ -f "$TARBALL" ]] || fail "No tarball at $TARBALL"
[[ -f "$APP_DIR/shared/.env" ]] || fail "Missing $APP_DIR/shared/.env (see docs/setup/deploy.md)"
command -v pm2 >/dev/null || fail "pm2 is not installed"

mkdir -p "$RELEASES" "$APP_DIR/shared/logs"

mkdir -p "$RELEASE"
log "Unpacking $VERSION"
tar -xzf "$TARBALL" -C "$RELEASE"
[[ -f "$RELEASE/server.js" ]] || fail "Release has no server.js; not a standalone build"

# Only a real symlink counts as a previous release (not on the very first deploy).
PREVIOUS=""
[[ -L "$CURRENT" ]] && PREVIOUS="$(readlink -f "$CURRENT")"

switch_to() {
  ln -sfn "$1" "$APP_DIR/current.next"
  mv -Tf "$APP_DIR/current.next" "$CURRENT"
}

restart_app() {
  cp "$(readlink -f "$CURRENT")/deploy/ecosystem.config.cjs" "$APP_DIR/shared/ecosystem.config.cjs"
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    # Delete + start so PM2 re-reads the config and the new `current` path.
    pm2 delete "$APP_NAME" >/dev/null
  fi
  pm2 start "$APP_DIR/shared/ecosystem.config.cjs" >/dev/null
  pm2 save >/dev/null
}

# Healthy = /api/health answers AND reports the expected version, so an old
# process still holding the port can't make a broken release look fine.
healthy() {
  local want="$1" body
  for _ in $(seq 1 "$HEALTH_TRIES"); do
    body="$(curl -fsS --max-time 3 "$HEALTH_URL" 2>/dev/null || true)"
    if [[ "$body" == *"\"version\":\"$want"* ]]; then return 0; fi
    sleep 2
  done
  return 1
}

log "Switching current → $VERSION"
switch_to "$RELEASE"
restart_app

if healthy "$VERSION"; then
  log "Healthy: $(curl -fsS --max-time 3 "$HEALTH_URL")"
else
  log "Health check failed for $VERSION"
  pm2 logs "$APP_NAME" --lines 40 --nostream || true
  if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
    log "Rolling back to $(basename "$PREVIOUS")"
    switch_to "$PREVIOUS"
    restart_app
    prev_version="$(basename "$PREVIOUS")"; prev_version="${prev_version%%_*}"
    healthy "$prev_version" && log "Rolled back; $prev_version is serving." || log "Rollback also unhealthy: check pm2 logs."
    # The failed release isn't live any more; don't keep it around.
    rm -rf -- "${RELEASE:?}"
  fi
  fail "Deploy of $VERSION failed"
fi

# Keep the newest $KEEP releases (never the live one).
LIVE="$(readlink -f "$CURRENT")"
mapfile -t OLD < <(releases_newest_first | tail -n +"$((KEEP + 1))" | sed "s:^:$RELEASES/:")
for dir in "${OLD[@]}"; do
  [[ "$(readlink -f "$dir")" == "$LIVE" ]] && continue
  log "Removing old release $(basename "$dir")"
  rm -rf -- "${dir:?}"
done

rm -f -- "$TARBALL"
log "Done: $VERSION is live"
