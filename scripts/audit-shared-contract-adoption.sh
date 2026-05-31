#!/usr/bin/env bash
set -euo pipefail

echo "===== LVTP SHARED CONTRACT ADOPTION AUDIT ====="

echo
echo "## Shared contracts"
find packages/shared/src -maxdepth 1 -type f | sort

echo
echo "## Duplicate RideStatus definitions"
grep -R --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
  --include="*.ts" --include="*.tsx" \
  "type RideStatus" apps packages || true

echo
echo "## Tracking generation candidates"
grep -R --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
  --include="*.ts" --include="*.tsx" \
  "generateTrackingCode\|createTrackingCode\|trackingCode\|trk_\|LV-" apps packages || true

echo
echo "## Operational localStorage candidates"
grep -R --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
  --include="*.ts" --include="*.tsx" \
  "lvtransport_bookings\|localStorage.*booking\|localStorage" apps packages || true

echo
echo "## Dispatch coupling candidates"
grep -R --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
  --include="*.ts" --include="*.tsx" \
  "dispatchMvpStore\|DispatchBookingStatus\|assignDriver\|driverDecision" apps packages || true

echo
echo "===== END AUDIT ====="
