#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${BASE_REF:-origin/main}"

echo "Checking spec drift against $BASE_REF..."
changed_files="$(git diff --no-renames --name-only "$BASE_REF"...HEAD)"
echo "$changed_files"

fail() {
  echo "SPEC GUARD FAILED: $1" >&2
  exit 1
}

protected_paths='^(apps/api/|apps/admin/|apps/web/src/pages/(Admin|Driver)\.tsx$|apps/web/src/app/App\.tsx$|package\.json$|pnpm-lock\.yaml$|\.github/|scripts/spec-guard\.sh$|AGENTS\.md$|docs/LVTRANSPORT_SPEC_LOCK\.md$)'
if grep -Eq "$protected_paths" <<<"$changed_files"; then
  if [[ "${SPEC_GUARD_FOUNDER_APPROVED_HEAD:-}" != "$(git rev-parse HEAD)" ]]; then
    fail "Sensitive files changed. Founder approval of the current PR head required."
  fi
fi

homepage_diff="$(git diff "$BASE_REF"...HEAD -- apps/web/src/pages/home/HeroSection.tsx)"
# Keep the attribute values in scope while ignoring the JSX attribute name.
homepage_content="$(sed -E 's/([[:space:]])placeholder([[:space:]]*=)/\1\2/g' <<<"$homepage_diff")"
if grep -Eiq 'hardcoded|fake|demo|38052|(^|[^[:alnum:]_])ETA([^[:alnum:]_]|$)|license|1-TRP|localStorage|sessionStorage|placeholder|400 00 00 00|support@lvtransport\.be' <<<"$homepage_content"; then
  fail "Potential demo/fake/local production behavior detected in homepage."
fi

if grep -Eq 'onSubmit=.*preventDefault|e\.preventDefault\(\)' <<<"$homepage_diff"; then
  fail "Form preventDefault detected. Confirm this is not replacing production booking."
fi

echo "Spec guard passed."
