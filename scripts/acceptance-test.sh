#!/usr/bin/env bash
# Post-deploy acceptance test for Q-daily.
#
# Curls a small set of canonical URLs and asserts the rendered HTML contains
# the markers we rely on for editorial layout (block kinds, two-axis routing,
# inline markdown rendering). If any assertion fails, this script exits
# non-zero so the deploy pipeline turns red.
#
# Usage:
#   scripts/acceptance-test.sh                          # defaults to https://www.pigppy.site
#   scripts/acceptance-test.sh https://staging.example  # override base URL
#   BASE_URL=https://www.pigppy.site scripts/acceptance-test.sh
#
# Why this exists:
# We've shipped silent rendering regressions before (list blocks collapsing
# into a single paragraph, inline `**bold**` showing as literal characters,
# column badge missing). TypeScript and unit tests didn't catch them because
# the bug surfaced only when statically rendered HTML met the live DB.
#
# So this test runs AFTER deploy, against the actual deployed origin, and
# fails loud on the markers that matter for editorial.

set -euo pipefail

BASE_URL="${1:-${BASE_URL:-https://www.pigppy.site}}"
BASE_URL="${BASE_URL%/}"

# Article known to exercise the full block + inline-markdown surface:
#   - 4 H2 headings           -> <h2 class="...storySectionHeading">
#   - 2 unordered lists       -> <ul> with multiple <li>
#   - 2 external links        -> <a href="https://www.anthropic.com/research/...
#   - many **bold** segments  -> <strong>
#   - column_slug=good-paper  -> "storyColumn" CSS class + "好论文" badge text
ARTICLE_SLUG="anthropic-economic-index-81k-2026-04-28"
ARTICLE_URL="${BASE_URL}/articles/${ARTICLE_SLUG}"

# Column landing page known to have at least one published article:
COLUMN_URL="${BASE_URL}/columns/good-paper"

# Homepage — should advertise the four columns in the top nav:
HOME_URL="${BASE_URL}/"

failures=0

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

# fetch URL into $body. exits the function with non-zero status if curl fails.
fetch() {
  local url="$1"
  body="$(curl -sSfL --max-time 30 "$url")"
}

# assert: pass if "$body" contains $needle (Perl regex, multiline).
# args: <description> <needle>
assert_contains() {
  local desc="$1"
  local needle="$2"
  if printf '%s' "$body" | grep -Eq "$needle" >/dev/null 2>&1; then
    echo "  ok   - ${desc}"
  else
    echo "  FAIL - ${desc}"
    echo "         (looked for: ${needle})"
    failures=$((failures + 1))
  fi
}

# assert at least N matches across the response (not per-line).
# Server-side rendered HTML often comes back on a single line, so we use
# `grep -o` to print each match on its own line, then count lines.
# args: <description> <needle> <min_count>
assert_at_least() {
  local desc="$1"
  local needle="$2"
  local min_count="$3"
  local actual
  actual="$(printf '%s' "$body" | grep -Eo "$needle" | wc -l | tr -d '[:space:]' || true)"
  actual="${actual:-0}"
  if [ "$actual" -ge "$min_count" ]; then
    echo "  ok   - ${desc} (found ${actual} ≥ ${min_count})"
  else
    echo "  FAIL - ${desc} (found ${actual}, expected ≥ ${min_count})"
    echo "         (looked for: ${needle})"
    failures=$((failures + 1))
  fi
}

# ---------------------------------------------------------------------------
# checks
# ---------------------------------------------------------------------------

echo "=> ${ARTICLE_URL}"
fetch "$ARTICLE_URL"

# Block-level rendering
assert_contains   "H2 section heading is rendered"          '<h2[^>]*storySectionHeading'
assert_at_least   "unordered list has at least 5 items"     '<li>' 5
assert_contains   "<ul> renders for list block"             '<ul[^>]*storyList'

# Inline markdown rendering
assert_contains   "**bold** renders as <strong>"            '<strong>(月更化|不是一次调研|这个 1/5)'
assert_contains   "[text](url) renders as external link"    'href="https://www\.anthropic\.com/research/[^"]+"[^>]*target="_blank"'

# Two-axis routing
assert_contains   "column badge appears on article page"    'storyColumn[^"]*"[^>]*>好论文'
assert_contains   "category badge still appears"            'storyCategory'

# Top nav has the 4 columns (these are static seed, should always be there)
echo
echo "=> ${HOME_URL}"
fetch "$HOME_URL"
assert_contains   "top nav advertises 好文章"               '/columns/good-article[^>]*>好文章'
assert_contains   "top nav advertises 好观点"               '/columns/good-take[^>]*>好观点'
assert_contains   "top nav advertises 好家伙"               '/columns/good-grief[^>]*>好家伙'
assert_contains   "top nav advertises 好论文"               '/columns/good-paper[^>]*>好论文'

# Column landing page renders
echo
echo "=> ${COLUMN_URL}"
fetch "$COLUMN_URL"
assert_contains   "column page returns OK and has the column name"   '好论文'
assert_at_least   "column page lists at least 2 articles"            'href="/articles/' 2

# ---------------------------------------------------------------------------
# summary
# ---------------------------------------------------------------------------

echo
if [ "$failures" -eq 0 ]; then
  echo "All acceptance checks passed."
  exit 0
else
  echo "${failures} acceptance check(s) failed."
  exit 1
fi
