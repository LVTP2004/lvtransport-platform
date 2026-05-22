#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${BASE_REF:-origin/main}"

echo "Checking spec drift against $BASE_REF..."

changed_files="$(git diff --name-only "$BASE_REF"...HEAD || true)"

echo "$changed_files"

fail() {
  echo "SPEC GUARD FAILED: $1" >&2
  exit 1
}

# Files that should not be touched by visual homepage tasks unless explicitly approved.
if echo "$changed_files" | grep -E '^(apps/api/|apps/admin/|apps/web/src/pages/Admin\.tsx|apps/web/src/pages/Driver\.tsx|package\.json|pnpm-lock\.yaml|\.github/)' >/dev/null; then
  fail "Sensitive files changed. Founder approval required."
fi

# Detect fake/demo production patterns in homepage.
if git diff "$BASE_REF"...HEAD -- apps/web/src/pages/home/HeroSection.tsx | grep -Ei 'hardcoded|fake|demo|38052|ETA|license|1-TRP|localStorage|sessionStorage|placeholder|400 00 00 00|support@lvtransport\.be' >/dev/null; then
  fail "Potential demo/fake/local production behavior detected in homepage."
fi

# Detect forms that may not submit to production flow.
if git diff "$BASE_REF"...HEAD -- apps/web/src/pages/home/HeroSection.tsx | grep -E 'onSubmit=.*preventDefault|e\.preventDefault\(\)' >/dev/null; then
  fail "Form preventDefault detected. Confirm this is not replacing production booking."
fi

echo "Spec guard passed."
