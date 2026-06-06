import { randomUUID } from 'node:crypto';
import type { AirportCoordinationInput, AirportIntelligenceState, BookingRecord, FlightOperationalStatus, LVMessage } from '../bookings/dto.js';

const PROVIDER_PRIORITY = ['flightaware', 'aviationstack', 'flightradar', 'airport_feed'] as const;

const inferStatus = (delayMin: number): FlightOperationalStatus => {
  if (delayMin >= 180) return 'cancelled';
  if (delayMin > 0) return 'delayed';
  return 'scheduled';
};

export const airportIntelligenceService = {
  createInitialState(input?: AirportCoordinationInput): AirportIntelligenceState | undefined {
    if (!input || (!input.flightNumber && !input.arrivalAirport)) return undefined;
    const now = new Date().toISOString();
    return {
      enabled: true,
      synchronizedAt: now,
      pickupBufferMin: 18,
      monitoring: {
        providerPriority: [...PROVIDER_PRIORITY],
        status: 'scheduled',
        delayMin: 0,
        terminal: input.terminal ?? null,
        notes: ['Airport intelligence initialized with premium coordination mode.']
      }
    };
  },

  applyFlightSignal(booking: BookingRecord, signal: { delayMin?: number; terminal?: string; cancelled?: boolean; source?: string }): LVMessage[] {
    if (!booking.airportIntelligence?.enabled) return [];
    const now = new Date().toISOString();
    const delayMin = Math.max(0, signal.delayMin ?? booking.airportIntelligence.monitoring.delayMin ?? 0);
    const status: FlightOperationalStatus = signal.cancelled ? 'cancelled' : inferStatus(delayMin);
    booking.airportIntelligence.synchronizedAt = now;
    booking.airportIntelligence.monitoring.delayMin = delayMin;
    booking.airportIntelligence.monitoring.status = status;
    if (signal.terminal) booking.airportIntelligence.monitoring.terminal = signal.terminal;
    booking.airportIntelligence.monitoring.notes.unshift(`Signal synchronized from ${signal.source ?? 'ops'} at ${now}`);
    booking.airportIntelligence.pickupBufferMin = status === 'delayed' ? 12 : 18;

    const flight = booking.airportIntel?.flightNumber ?? 'your flight';
    const messages: LVMessage[] = [];
    if (status === 'delayed') {
      messages.push({
        id: randomUUID(),
        at: now,
        channel: 'customer',
        messageType: 'flight_delay_detected',
        tone: 'reassuring',
        content: `Your flight ${flight} is delayed by ${delayMin} minutes. Pickup timing has been adjusted automatically.`,
        metadata: { delayMin, source: signal.source }
      });
    }
    messages.push({
      id: randomUUID(),
      at: now,
      channel: 'driver',
      messageType: 'pickup_timing_adjusted',
      tone: 'operational',
      content: `Airport pickup synchronization updated. Delay: ${delayMin} min. Terminal: ${booking.airportIntelligence.monitoring.terminal ?? 'TBD'}.`,
      metadata: { delayMin, terminal: booking.airportIntelligence.monitoring.terminal }
    });
    return messages;
  }
};

