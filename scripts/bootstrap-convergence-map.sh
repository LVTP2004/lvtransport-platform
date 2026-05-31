#!/usr/bin/env bash
set -euo pipefail

OUT="docs/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md"

mkdir -p docs/architecture/bootstrap

{
  echo "# LVTP BOOTSTRAP CONVERGENCE MAP V1"
  echo
  echo "Status: GENERATED"
  echo "Category: Implementation Bootstrap"
  echo
  echo "## RideStatus Definitions"
  grep -R "type RideStatus\|interface Ride\|RideStatus" apps packages --include="*.ts" --include="*.tsx" || true
  echo
  echo "## Tracking Code Implementations"
  grep -R "trackingCode\|createTrackingCode\|generateTrackingCode\|LV-\|trk_" apps packages --include="*.ts" --include="*.tsx" || true
  echo
  echo "## localStorage Operational Usage"
  grep -R "localStorage.*booking\|lvtransport_bookings\|localStorage" apps packages --include="*.ts" --include="*.tsx" || true
  echo
  echo "## Dispatch Contracts"
  grep -R "DispatchAssignment\|assignDriver\|driverDecision\|dispatchMvpStore\|DispatchBookingStatus" apps packages --include="*.ts" --include="*.tsx" || true
  echo
  echo "## Moni Verified Context Candidates"
  grep -R "booking.status\|knownFields\|verified\|context.booking\|MoniContext" apps packages --include="*.ts" --include="*.tsx" || true
} > "$OUT"

cp "$OUT" /lvtp-data/library/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md

echo "CREATED:"
ls -lh "$OUT"
ls -lh /lvtp-data/library/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md
