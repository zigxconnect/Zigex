#!/usr/bin/env bash
# Opens the pages students depend on and checks they really work.
#
#   smoke.sh <base-url> [backend-url]
#   smoke.sh http://127.0.0.1:3000 https://api.zigexconnect.com
#
# Exit codes:
#   0  all pages work
#   1  a page is broken because of THIS release (roll back)
#   2  pages fail but the backend itself is down (rolling back wouldn't help)
set -uo pipefail

BASE="${1:?usage: smoke.sh <base-url> [backend-url]}"
BACKEND="${2:-${BACKEND_URL:-https://api.zigexconnect.com}}"
BASE="${BASE%/}"
BACKEND="${BACKEND%/}"

# What the app shows when a page can't render (components/errors/ErrorScreen.tsx)
# and when an opportunity can't be fetched (OpportunityDetail).
ERROR_TEXT="This page didn't load"

failures=()
pass() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
miss() { printf '  \033[31m✗\033[0m %s\n' "$*"; failures+=("$*"); }

# check <label> <path> [text that must appear]
check() {
  local label="$1" path="$2" must="${3:-}" body code
  body="$(mktemp)"
  code="$(curl -s -o "$body" -w '%{http_code}' --max-time 45 "$BASE$path")" || true
  if [[ "$code" != "200" ]]; then
    miss "$label ($path) → HTTP $code"
  elif grep -q "$ERROR_TEXT" "$body"; then
    miss "$label ($path) → shows the error screen"
  elif [[ -n "$must" ]] && ! grep -qi -- "$must" "$body"; then
    miss "$label ($path) → page doesn't contain \"$must\""
  else
    pass "$label"
  fi
  # Remember one stylesheet to check the build's static files are served.
  [[ -z "${CSS:-}" ]] && CSS="$(grep -o '/_next/static/[^"]*\.css' "$body" | head -n 1)"
  rm -f "$body"
}

echo "Smoke test: $BASE"
check "Health" "/api/health" '"status":"ok"'
check "Sign in" "/sign-in" "Sign in"
check "Explore" "/feed" "Opportunities"

# A real opportunity, taken from the public feed.
ID="$(curl -s --max-time 30 "$BACKEND/api/v1/feed/internships?page=1&limit=1" | grep -o '"id":"[0-9a-f-]\{36\}"' | head -n 1 | cut -d'"' -f4)"
if [[ -n "$ID" ]]; then
  check "Opportunity page" "/feed/$ID"
else
  echo "  - Opportunity page: skipped (no opportunity id from the backend)"
fi

if [[ -n "${CSS:-}" ]]; then
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE$CSS")" || true
  [[ "$code" == "200" ]] && pass "Styles ($CSS)" || miss "Styles ($CSS) → HTTP $code"
else
  miss "Styles → no stylesheet link found on the pages"
fi

if [[ ${#failures[@]} -eq 0 ]]; then
  echo "All checks passed."
  exit 0
fi

# Is it us or the backend? If the backend doesn't answer, rolling back won't fix anything.
backend_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BACKEND/api/v1/feed/internships?page=1&limit=1")" || true
if [[ "$backend_code" != "200" ]]; then
  echo "${#failures[@]} check(s) failed, but the backend answers HTTP $backend_code: the backend is down, not this release."
  exit 2
fi
echo "${#failures[@]} check(s) failed while the backend works: this release is broken."
exit 1
