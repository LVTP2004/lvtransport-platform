import { randomUUID } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';
import { bookingRepository } from './repository.js';
import { PricingEngineService } from '../../pricing/services/pricing-engine.service.js';
import { PricingTier } from '../../pricing/enums/fare-rule.enum.js';
import { realtimeOrchestratorService } from '../../services/realtime-orchestrator.service.js';

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
      },
    };

    return hydrateRealtimeLifecycle(await bookingRepository.create(booking));
  },

  async listBookings(): Promise<BookingRecord[]> {
    return bookingRepository.list();
  }
};
