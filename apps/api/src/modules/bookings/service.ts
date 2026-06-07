import { randomUUID } from 'node:crypto';
import type { BookingRecord, CreateBookingDto } from './dto.js';
import { bookingRepository } from './repository.js';
import { TERMINAL_BOOKING_STATUSES, type CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';
import { validateLifecycleTransition } from './lifecycle-validation.js';
import { DomainError } from '../../errors/domain-error.js';

const createReferenceCode = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const token = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `LV-${stamp}-${token}`;
};

const createSafeFareQuote = (input: CreateBookingDto, now: string) => {
  const distance = input.estimatedDistanceKm ?? 5;
  const duration = input.estimatedDurationMin ?? 15;
  const base = input.serviceType === 'vip' ? 25 : input.serviceType === 'airport' ? 18 : 12;
  const distanceCharge = distance * 2.4;
  const durationCharge = duration * 0.35;
  const total = Number((base + distanceCharge + durationCharge).toFixed(2));

  return {
    fareTotal: total,
    pricingVersion: 'safe-baseline',
    breakdown: {
      base,
      distanceCharge: Number(distanceCharge.toFixed(2)),
      durationCharge: Number(durationCharge.toFixed(2)),
      total
    },
    synchronizedAt: now
  };
};

export const bookingFlowService = {
  async createBooking(input: CreateBookingDto, idempotencyKey: string): Promise<BookingRecord> {
    const existing = await bookingRepository.findByIdempotencyKey(idempotencyKey);
    if (existing) return existing;

    const duplicateFingerprint = `${input.pickup.trim().toLowerCase()}|${input.destination.trim().toLowerCase()}|${input.scheduleAt}|${input.serviceType}`;
    const recentDuplicate = await bookingRepository.findRecentDuplicateFingerprint(duplicateFingerprint, 2 * 60_000);
    if (recentDuplicate) return recentDuplicate;

    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: randomUUID(),
      referenceCode: createReferenceCode(),
      status: 'pending',
      createdAt: now,
      ...input,
      customerTier: input.customerTier ?? (input.serviceType === 'vip' ? 'vip' : 'retail'),
      fareQuote: createSafeFareQuote(input, now),
      billing: {
        invoiceLifecycleState: 'ready_for_invoice',
        isBillingConsistent: true,
        synchronizedAt: now
      },
      rideHistoryMeta: {
        firstRideAt: now,
        lastRideAt: now,
        ridesCompletedUnderAccount: 0
      },
      lifecycle: {
        initializedAt: now,
        state: 'pending',
        initIdempotencyKey: idempotencyKey,
        version: 1,
        transitions: [{ from: null, to: 'pending', occurredAt: now, actor: 'system', reason: 'booking_created' }]
      },
      airportIntelligence: input.airportIntel
        ? {
            enabled: true,
            synchronizedAt: now,
            pickupBufferMin: 20,
            monitoring: {
              status: 'unknown',
              delayMin: 0,
              terminal: input.airportIntel.terminal ?? null,
              notes: ['Safe baseline airport intelligence placeholder.']
            }
          }
        : undefined,
      lvMessenger: {
        threadId: randomUUID(),
        messages: [],
        lastMessageAt: now
      }
    };

    return bookingRepository.create(booking);
  },

  async listBookings(): Promise<BookingRecord[]> {
    return bookingRepository.list();
  },

  async getAirportIntelligence(bookingId: string) {
    const booking = (await bookingRepository.list()).find((item) => item.id === bookingId);
    if (!booking) throw new DomainError('BOOKING_NOT_FOUND', 'Boeking niet gevonden.', 404, { bookingId });
    return {
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      airportIntel: booking.airportIntel,
      airportIntelligence: booking.airportIntelligence,
      generatedLVMessages: booking.lvMessenger.messages
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
      throw new DomainError(
        validation.reason === 'VERSION_MISMATCH' ? 'BOOKING_VERSION_CONFLICT' : validation.reason === 'TERMINAL_IMMUTABLE' ? 'TERMINAL_STATE_IMMUTABLE' : 'INVALID_TRANSITION',
        'Ongeldige statusovergang voor deze rit.',
        409,
        { bookingId, ...validation.details }
      );
    }

    if (validation.duplicate) return booking;

    const now = new Date().toISOString();
    booking.status = nextState;
    booking.lifecycle.state = nextState;
    booking.lifecycle.version += 1;
    booking.lifecycle.transitions.push({ from: currentState, to: nextState, occurredAt: now, actor, reason, metadata });
    booking.lvMessenger.lastMessageAt = now;

    return bookingRepository.update(booking);
  },

  async getOperationalMetrics() {
    const bookings = await bookingRepository.list();
    const total = bookings.length;
    const completed = bookings.filter((booking) => booking.lifecycle.state === 'completed').length;
    const cancelled = bookings.filter((booking) => booking.lifecycle.state === 'cancelled').length;
    const active = bookings.filter((booking) => !TERMINAL_BOOKING_STATUSES.has(booking.lifecycle.state)).length;
    const completionRate = total === 0 ? 0 : Number((completed / total).toFixed(4));
    return { total, completed, cancelled, active, completionRate };
  }
};
