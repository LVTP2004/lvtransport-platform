import { randomUUID } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';
import { bookingRepository } from './repository.js';
import { PricingEngineService } from '../../pricing/services/pricing-engine.service.js';
import { PricingTier } from '../../pricing/enums/fare-rule.enum.js';

const pricingEngine = new PricingEngineService();

const createReferenceCode = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const token = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `LV-${stamp}-${token}`;
};

export const bookingFlowService = {
  async createBooking(input: CreateBookingDto): Promise<BookingRecord> {
    const quote = pricingEngine.createQuote({
      estimatedDistanceKm: input.estimatedDistanceKm ?? 5,
      estimatedDurationMin: input.estimatedDurationMin ?? 15,
      waitTimeMin: input.waitTimeMin,
      isAirportRoute: input.serviceType === 'airport',
      isNight: input.isNight,
      tier: input.serviceType === 'vip' ? PricingTier.VIP : PricingTier.STANDARD
    });

    const booking: BookingRecord = {
      id: randomUUID(),
      referenceCode: createReferenceCode(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...input,
      customerTier: input.customerTier ?? (input.serviceType === 'vip' ? 'vip' : 'retail'),
      fareQuote: {
        fareTotal: quote.breakdown.total,
        pricingVersion: quote.pricingVersion,
        breakdown: quote.breakdown,
        synchronizedAt: new Date().toISOString()
      },
      billing: {
        invoiceLifecycleState: 'ready_for_invoice',
        isBillingConsistent: true,
        synchronizedAt: new Date().toISOString(),
      },
      rideHistoryMeta: {
        firstRideAt: new Date().toISOString(),
        lastRideAt: new Date().toISOString(),
        ridesCompletedUnderAccount: 0,
      },
    };

    return bookingRepository.create(booking);
  },

  async listBookings(): Promise<BookingRecord[]> {
    return bookingRepository.list();
  }
};
