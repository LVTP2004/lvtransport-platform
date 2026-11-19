import type { BookingRecord } from './dto.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';

/** Initial intake only. Persisted bookings remain authoritative; no inferred driver/trip. */
export function projectOperationalBooking(booking: BookingRecord): void {
  const existing = realtimeOrchestratorService.listBookings().find(item => item.id === booking.id);
  // Replaying intake must never overwrite a driver's more advanced operational state.
  if (existing) return;
  // The current public DTO cannot reconstruct an assignment. Fail closed rather
  // than creating an assigned booking without a driver after a restart.
  if (booking.lifecycle.state !== 'pending') {
    // New operational commands use the canonical persisted assignment directly.
    // Do not manufacture a second driver/vehicle state in the legacy intake Map.
    if (booking.assignment) return;
    throw new Error('Operational assignment reconstruction unavailable');
  }
  realtimeOrchestratorService.upsertExternalBooking({
    id: booking.id,
    referenceCode: booking.referenceCode,
    pickup: booking.pickup,
    destination: booking.destination,
    serviceType: booking.serviceType,
    scheduledAt: booking.scheduleAt,
    customerName: booking.customerName,
    status: booking.lifecycle.state,
  });
}
