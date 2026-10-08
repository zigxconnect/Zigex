#!/usr/bin/env bash
# Runs ON THE VPS. Switch back to an earlier release in seconds.
#
#   rollback.sh            # list releases and switch to the one before the live one
#   rollback.sh 1.0.0      # switch to the newest deploy of version 1.0.0
set -euo pipefail

# Development site: APP_DIR=/var/www/zigex-dev APP_NAME=zigex-dev APP_PORT=3100 rollback.sh
APP_DIR="${APP_DIR:-/var/www/zigex}"
APP_NAME="${APP_NAME:-zigex}"
APP_PORT="${APP_PORT:-3000}"
export APP_DIR APP_NAME APP_PORT
RELEASES="$APP_DIR/releases"
CURRENT="$APP_DIR/current"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:$APP_PORT/api/health}"
HEALTH_TRIES="${HEALTH_TRIES:-30}"

# Folders are "<version>_<YYYYmmddHHMMSS>": order by that stamp, newest first.
newest_first() { ls -1 "$RELEASES" | awk -F_ '{print $NF" "$0}' | sort -r | cut -d' ' -f2-; }

LIVE="$(basename "$(readlink -f "$CURRENT")")"
echo "Live: $LIVE"
echo "Available:"; newest_first

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  TARGET="$(newest_first | grep -vx "$LIVE" | head -n 1 || true)"
  [[ -n "$TARGET" ]] || { echo "No earlier release to roll back to." >&2; exit 1; }
fi
# Accept a plain version ("1.0.0") as well as a full folder name ("1.0.0_20261008143000").
if [[ ! -d "$RELEASES/$TARGET" ]]; then
  MATCH="$(newest_first | grep -E "^${TARGET//./\\.}_" | head -n 1 || true)"
  [[ -n "$MATCH" ]] || { echo "No release named $TARGET" >&2; exit 1; }
  TARGET="$MATCH"
fi

echo "Rolling back to $TARGET"
ln -sfn "$RELEASES/$TARGET" "$APP_DIR/current.next" && mv -Tf "$APP_DIR/current.next" "$CURRENT"
cp "$RELEASES/$TARGET/deploy/ecosystem.config.cjs" "$APP_DIR/shared/ecosystem.config.cjs"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start "$APP_DIR/shared/ecosystem.config.cjs" >/dev/null && pm2 save >/dev/null

WANT="${TARGET%%_*}"
for _ in $(seq 1 "$HEALTH_TRIES"); do
  BODY="$(curl -fsS --max-time 3 "$HEALTH_URL" 2>/dev/null || true)"
  if [[ "$BODY" == *"\"version\":\"$WANT"* ]]; then echo "$BODY"; echo "Rolled back to $TARGET."; exit 0; fi
  sleep 2
done
echo "Release $TARGET isn't answering; check: pm2 logs $APP_NAME" >&2
exit 1
