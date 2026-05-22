import { randomUUID } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';
import { bookingRepository } from './repository.js';
import { PricingEngineService } from '../../pricing/services/pricing-engine.service.js';
import { PricingTier } from '../../pricing/enums/fare-rule.enum.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';
import { TERMINAL_BOOKING_STATUSES, type CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';
import { validateLifecycleTransition } from './lifecycle-validation.js';
import { logger } from '../../utils/logger.js';
import { DomainError } from '../../errors/domain-error.js';
import { airportIntelligenceService } from '../airport-intelligence/service.js';
import { lvMessengerService } from '../lv-messenger/service.js';

const pricingEngine = new PricingEngineService();

const createReferenceCode = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const token = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `LV-${stamp}-${token}`;
};

export const bookingFlowService = {
  async createBooking(input: CreateBookingDto, idempotencyKey: string): Promise<BookingRecord> {
    const hydrateRealtimeLifecycle = (booking: BookingRecord) => {
      realtimeOrchestratorService.upsertExternalBooking({
        id: booking.id,
        referenceCode: booking.referenceCode,
        pickup: booking.pickup,
        destination: booking.destination,
        serviceType: booking.serviceType,
        scheduledAt: booking.scheduleAt,
        status: booking.lifecycle.state,
      });
      return booking;
    };

    const existing = await bookingRepository.findByIdempotencyKey(idempotencyKey);
    if (existing) return hydrateRealtimeLifecycle(existing);
    const duplicateFingerprint = `${input.pickup.trim().toLowerCase()}|${input.destination.trim().toLowerCase()}|${input.scheduleAt}|${input.serviceType}`;
    const recentDuplicate = await bookingRepository.findRecentDuplicateFingerprint(duplicateFingerprint, 2 * 60_000);
    if (recentDuplicate) return hydrateRealtimeLifecycle(recentDuplicate);

    const quote = pricingEngine.createQuote({
      estimatedDistanceKm: input.estimatedDistanceKm ?? 5,
      estimatedDurationMin: input.estimatedDurationMin ?? 15,
      waitTimeMin: input.waitTimeMin,
      isAirportRoute: input.serviceType === 'airport',
      isNight: input.isNight,
      tier: input.serviceType === 'vip' ? PricingTier.VIP : PricingTier.STANDARD
    });

    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: randomUUID(),
      referenceCode: createReferenceCode(),
      status: 'pending',
      createdAt: now,
      ...input,
      customerTier: input.customerTier ?? (input.serviceType === 'vip' ? 'vip' : 'retail'),
      fareQuote: {
        fareTotal: quote.breakdown.total,
        pricingVersion: quote.pricingVersion,
        breakdown: quote.breakdown,
        synchronizedAt: now
      },
      billing: {
        invoiceLifecycleState: 'ready_for_invoice',
        isBillingConsistent: true,
        synchronizedAt: now,
      },
      rideHistoryMeta: {
        firstRideAt: now,
        lastRideAt: now,
        ridesCompletedUnderAccount: 0,
      },
      lifecycle: {
        initializedAt: now,
        state: 'pending',
        initIdempotencyKey: idempotencyKey,
        version: 1,
        transitions: [{ from: null, to: 'pending', occurredAt: now, actor: 'system', reason: 'booking_created' }],
      },
      airportIntelligence: airportIntelligenceService.createInitialState(input.airportIntel),
      lvMessenger: lvMessengerService.initializeThread(),
    };

    if (booking.airportIntelligence?.enabled) {
      const airportMessages = airportIntelligenceService.applyFlightSignal(booking, {
        delayMin: 0,
        terminal: input.airportIntel?.terminal,
        source: 'booking_init'
      });
      lvMessengerService.appendBatch(booking, airportMessages);
    }

    return hydrateRealtimeLifecycle(await bookingRepository.create(booking));
  },

  async listBookings(): Promise<BookingRecord[]> {
    return bookingRepository.list();
  },

  async getAirportIntelligence(bookingId: string): Promise<{
    bookingId: string;
    referenceCode: string;
    airportIntel?: BookingRecord['airportIntel'];
    airportIntelligence?: BookingRecord['airportIntelligence'];
    generatedLVMessages: BookingRecord['lvMessenger']['messages'];
  }> {
    const booking = await bookingRepository.getById(bookingId);
    if (!booking) throw new DomainError('BOOKING_NOT_FOUND', 'Boeking niet gevonden.', 404, { bookingId });
    return {
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      airportIntel: booking.airportIntel,
      airportIntelligence: booking.airportIntelligence,
      generatedLVMessages: booking.lvMessenger.messages.filter((message) => (
        message.messageType === 'flight_delay_detected'
        || message.messageType === 'pickup_timing_adjusted'
        || message.messageType === 'airport_instruction'
      )),
    };
  },

  async updateBookingLifecycle(
    bookingId: string,
    nextState: CanonicalBookingLifecycleStatus,
    actor: 'system' | 'admin' | 'driver' | 'customer',
    reason?: string,
    metadata?: Record<string, unknown>,
    expectedVersion?: number
  ): Promise<BookingRecord> {
    const bookings = await bookingRepository.list();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw new DomainError('BOOKING_NOT_FOUND', 'Boeking niet gevonden.', 404, { bookingId });
    const currentState = booking.lifecycle.state;
    const validation = validateLifecycleTransition({
      currentState,
      nextState,
      currentVersion: booking.lifecycle.version,
      expectedVersion
    });

    if (!validation.ok) {
      if (validation.reason === 'VERSION_MISMATCH') {
        throw new DomainError('BOOKING_VERSION_CONFLICT', 'Ritstatus werd intussen bijgewerkt. Vernieuw en probeer opnieuw.', 409, {
          bookingId,
          ...validation.details
        });
      }
      if (validation.reason === 'TERMINAL_IMMUTABLE') {
        throw new DomainError('TERMINAL_STATE_IMMUTABLE', 'Deze rit is voltooid en kan niet meer worden aangepast.', 409, {
          bookingId,
          ...validation.details
        });
      }
      throw new DomainError('INVALID_TRANSITION', 'Ongeldige statusovergang voor deze rit.', 409, { bookingId, ...validation.details });
    }

    if (validation.duplicate) return booking;
    const now = new Date().toISOString();
    booking.status = nextState;
    booking.lifecycle.state = nextState;
    booking.lifecycle.version += 1;
    booking.lifecycle.transitions.push({ from: currentState, to: nextState, occurredAt: now, actor, reason, metadata });
    lvMessengerService.append(booking, {
      id: randomUUID(),
      at: now,
      channel: actor === 'driver' ? 'customer' : 'admin',
      messageType: 'lifecycle_update',
      tone: 'operational',
      content: `Ride status updated to ${nextState}.`,
      metadata: { actor, reason }
    });
    logger.info('booking.lifecycle.transition', { bookingId, from: currentState, to: nextState, actor, version: booking.lifecycle.version });
    const updatedBooking = await bookingRepository.update(booking);
    realtimeOrchestratorService.upsertExternalBooking({
      id: updatedBooking.id,
      referenceCode: updatedBooking.referenceCode,
      pickup: updatedBooking.pickup,
      destination: updatedBooking.destination,
      serviceType: updatedBooking.serviceType,
      scheduledAt: updatedBooking.scheduleAt,
      status: updatedBooking.lifecycle.state,
    });
    return updatedBooking;
  },

  async getOperationalMetrics(): Promise<{ total: number; completed: number; cancelled: number; active: number; completionRate: number }> {
    const bookings = await bookingRepository.list();
    const total = bookings.length;
    const completed = bookings.filter((booking) => booking.lifecycle.state === 'completed').length;
    const cancelled = bookings.filter((booking) => booking.lifecycle.state === 'cancelled').length;
    const active = bookings.filter((booking) => !TERMINAL_BOOKING_STATUSES.has(booking.lifecycle.state)).length;
    const completionRate = total === 0 ? 0 : Number((completed / total).toFixed(4));
    return { total, completed, cancelled, active, completionRate };
  }
};
