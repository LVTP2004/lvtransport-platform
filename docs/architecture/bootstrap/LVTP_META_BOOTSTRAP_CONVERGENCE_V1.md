
LVTP META BOOTSTRAP CONVERGENCE V1

Status: APPROVED
Date: 2026-05-31
Category: Implementation Meta Bootstrap

Purpose

Define the remaining controlled convergence phases for LV Transport Platform.

Current Completed Work

Convergence Report V1

LVTP Convergence Roadmap V1

ADR-001 Canonical Ride Lifecycle

ADR-002 Canonical Tracking Code

ADR-003 API As Source Of Truth

packages/shared initial foundation

ride-lifecycle.ts

tracking.ts

bootstrap convergence discovery map


Execution Rules

Use one branch per phase.

Use explicit git add paths only.

Never use git add .

Do not mix documentation, app migration and cleanup in one commit.

Do not migrate apps before shared contracts are complete.


Remaining Phases

Phase 2 — Shared Dispatch And Booking Contracts

Branch:

implementation/dispatch-booking-contracts-v1

Allowed files:

packages/shared/src/dispatch.types.ts

packages/shared/src/booking.types.ts

packages/shared/src/index.ts


Commit:

feat(shared): add dispatch and booking contracts

Phase 3 — API Contract Adoption

Branch:

implementation/api-shared-contract-adoption-v1

Objective:

Adopt shared lifecycle, tracking, booking and dispatch contracts inside API.

Phase 4 — Dispatch Convergence

Branch:

implementation/dispatch-convergence-v1

Objective:

Separate DispatchAssignmentStatus from RideStatus.

Phase 5 — Driver Lifecycle Migration

Branch:

implementation/driver-lifecycle-migration-v1

Objective:

Driver may only execute valid canonical lifecycle transitions.

Phase 6 — Booking Migration

Branch:

implementation/booking-contract-migration-v1

Objective:

All booking creation maps to CreateBookingRequest.

Phase 7 — Tracking Migration

Branch:

implementation/tracking-contract-migration-v1

Objective:

Use one public tracking format: LV-[A-F0-9]{8}.

Phase 8 — Moni Verified Context Migration

Branch:

implementation/moni-verified-context-v1

Objective:

Moni only answers operational state from API-verified context.

Phase 9 — Legacy Cleanup

Branch:

cleanup/legacy-generated-and-localstate-v1

Objective:

Remove generated JS duplicates, operational localStorage booking state and deprecated lifecycle/tracking aliases after migrations are complete.

Final Decision

Proceed next with Phase 2 only.

Do not begin API, Driver, Booking, Tracking or Moni migration until shared dispatch and booking contracts are committed.

END
