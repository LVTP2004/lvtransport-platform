import { randomUUID } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';
import { bookingRepository } from './repository.js';
import { PricingEngineService } from '../../pricing/services/pricing-engine.service.js';
import { PricingTier } from '../../pricing/enums/fare-rule.enum.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';
import { CANONICAL_ALLOWED_TRANSITIONS, TERMINAL_BOOKING_STATUSES, type CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';
import { logger } from '../../utils/logger.js';
import { DomainError } from '../../errors/domain-error.js';

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
    };

    return hydrateRealtimeLifecycle(await bookingRepository.create(booking));
  },

  async listBookings(): Promise<BookingRecord[]> {
    return bookingRepository.list();
  },

  async updateBookingLifecycle(
    bookingId: string,
    nextState: CanonicalBookingLifecycleStatus,
    actor: 'system' | 'admin' | 'driver' | 'customer',
    reason?: string,
    metadata?: Record<string, unknown>
  ): Promise<BookingRecord> {
    const bookings = await bookingRepository.list();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw new DomainError('BOOKING_NOT_FOUND', 'Boeking niet gevonden.', 404, { bookingId });
    const currentState = booking.lifecycle.state;
    if (TERMINAL_BOOKING_STATUSES.has(currentState)) {
      if (currentState === nextState) return booking;
      throw new DomainError('TERMINAL_STATE_IMMUTABLE', 'Deze rit is voltooid en kan niet meer worden aangepast.', 409, { bookingId, currentState, attemptedState: nextState });
    }

    if (!CANONICAL_ALLOWED_TRANSITIONS[currentState].has(nextState) && currentState !== nextState) {
      throw new DomainError('INVALID_TRANSITION', 'Ongeldige statusovergang voor deze rit.', 409, { bookingId, currentState, attemptedState: nextState });
    }

    if (currentState === nextState) return booking;
    const now = new Date().toISOString();
    booking.status = nextState;
    booking.lifecycle.state = nextState;
    booking.lifecycle.version += 1;
    booking.lifecycle.transitions.push({ from: currentState, to: nextState, occurredAt: now, actor, reason, metadata });
    logger.info('booking.lifecycle.transition', { bookingId, from: currentState, to: nextState, actor, version: booking.lifecycle.version });
    return bookingRepository.update(booking);
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
