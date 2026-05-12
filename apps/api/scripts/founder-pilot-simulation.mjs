import { realtimeOrchestratorService } from '../src/services/realtime-orchestrator.service.ts';

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const booking = realtimeOrchestratorService.createBooking({
  customerName: 'Founder Pilot Customer',
  pickup: 'Brussels Airport',
  destination: 'Antwerp Central',
});

realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, nextStatus: 'accepted', actor: 'customer' });

const assigned = realtimeOrchestratorService.assignDriver({
  bookingId: booking.id,
  driverId: 'drv-founder-1',
  driverName: 'Founder Driver',
  idempotencyKey: 'assign-1',
});

const assignedDup = realtimeOrchestratorService.assignDriver({
  bookingId: booking.id,
  driverId: 'drv-founder-1',
  driverName: 'Founder Driver',
  idempotencyKey: 'assign-1',
});

assert(assigned.version === assignedDup.version, 'idempotent assignment failed');

for (const nextStatus of ['onderweg', 'arrived', 'in_progress', 'completed']) {
  realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, nextStatus, actor: 'driver' });
}

let terminalBlocked = false;
try {
  realtimeOrchestratorService.transitionStatus({ bookingId: booking.id, nextStatus: 'arrived', actor: 'driver' });
} catch {
  terminalBlocked = true;
}

const replaySnapshot = realtimeOrchestratorService.getTelemetryDiagnostics().replayBufferSize;

const telemetry = realtimeOrchestratorService.updateDriverTelemetry({
  driverId: 'drv-founder-1',
  bookingId: booking.id,
  location: { lat: 50.9, lng: 4.4, heading: 180 },
  sourceTimestamp: new Date().toISOString(),
  sequence: 1,
});
const restored = realtimeOrchestratorService.restoreDriverTelemetry({
  driverId: 'drv-founder-1',
  bookingId: booking.id,
  reconnectToken: telemetry.reconnectToken,
  lastSequence: 1,
});

console.log(JSON.stringify({
  bookingId: booking.id,
  bookingCode: booking.code,
  finalStatus: realtimeOrchestratorService.listBookings().find((item) => item.id === booking.id)?.status,
  lifecycleCompleted: true,
  terminalMutationRejected: terminalBlocked,
  idempotencyObserved: assigned.version === assignedDup.version,
  replayBufferEvents: replaySnapshot,
  staleSessionRecovered: Boolean(restored),
  unauthorizedBlocked: false,
}, null, 2));
