#!/usr/bin/env bash
set -euo pipefail

OUT="docs/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md"
LIB_OUT="/lvtp-data/library/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md"

mkdir -p docs/architecture/bootstrap
mkdir -p /lvtp-data/library/architecture/bootstrap

SEARCH_ROOTS=(apps packages)
GREP_COMMON=(--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build --include="*.ts" --include="*.tsx")

section() {
  local title="$1"
  local pattern="$2"

  echo "## $title"
  echo '```txt'
  grep -R "${GREP_COMMON[@]}" "$pattern" "${SEARCH_ROOTS[@]}" || true
  echo '```'
  echo
}

{
  echo "# LVTP BOOTSTRAP CONVERGENCE MAP V1"
  echo
  echo "Date: $(date +%F)"
  echo "Status: GENERATED"
  echo "Category: Architecture"
  echo "Tags: bootstrap,convergence,implementation,map,moni,founder"
  echo
  echo "## Purpose"
  echo
  echo "This document maps current implementation fragments that must converge before building new platform layers."
  echo

  section "RideStatus Definitions" "type RideStatus\|RideStatus"
  section "Tracking Code Implementations" "trackingCode\|createTrackingCode\|generateTrackingCode\|trk_\|LV-"
  section "localStorage Operational Usage" "localStorage.*booking\|lvtransport_bookings\|localStorage"
  section "Dispatch Contracts" "DispatchAssignment\|assignDriver\|driverDecision\|dispatchMvpStore\|DispatchBookingStatus"
  section "Moni Verified Context Candidates" "booking.status\|knownFields\|verified\|context.booking\|MoniContext"

  echo "## Bootstrap Findings"
  echo
  echo "- Canonical shared contracts now exist in packages/shared."
  echo "- API already contains the closest canonical RideStatus in apps/api/src/persistence/repository-contracts.ts."
  echo "- Tracking generation remains fragmented across API, booking, notification and Moni assistant flows."
  echo "- HomeOriginal still contains operational localStorage booking state."
  echo "- Dispatch is still coupled to dispatchMvpStore and must be separated into a DispatchAssignment contract."
  echo
  echo "## Decision"
  echo
  echo "This convergence map must be reviewed before creating new Builder, Planner, Finance or Organization layers."
} > "$OUT"

cp "$OUT" "$LIB_OUT"

echo "CREATED:"
ls -lh "$OUT"
ls -lh "$LIB_OUT"

if [ -x /lvtp-data/moni/scripts/moni-library-indexer.sh ]; then
  echo
  echo "Indexing with Moni..."
  /lvtp-data/moni/scripts/moni-library-indexer.sh
fi
