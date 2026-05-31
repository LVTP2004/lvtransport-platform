#!/usr/bin/env bash
set -euo pipefail

OUT="docs/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md"
LIB_OUT="/lvtp-data/library/architecture/bootstrap/LVTP_BOOTSTRAP_CONVERGENCE_MAP_V1.md"

mkdir -p docs/architecture/bootstrap
mkdir -p /lvtp-data/library/architecture/bootstrap

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
echo "## RideStatus Definitions"
grep -R "type RideStatus|interface Ride|RideStatus" apps packages --include=".ts" --include=".tsx" || true
echo
echo "## Tracking Code Implementations"
grep -R "trackingCode|createTrackingCode|generateTrackingCode|LV-|trk_" apps packages --include=".ts" --include=".tsx" || true
echo
echo "## localStorage Operational Usage"
grep -R "localStorage.booking|lvtransport_bookings|localStorage" apps packages --include=".ts" --include=".tsx" || true
echo
echo "## Dispatch Contracts"
grep -R "DispatchAssignment|assignDriver|driverDecision|dispatchMvpStore|DispatchBookingStatus" apps packages --include=".ts" --include=".tsx" || true
echo
echo "## Moni Verified Context Candidates"
grep -R "booking.status|knownFields|verified|context.booking|MoniContext" apps packages --include=".ts" --include="*.tsx" || true
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
