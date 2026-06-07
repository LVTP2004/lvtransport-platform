import type { CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';

export type ServiceType = 'standard' | 'airport' | 'vip';
export type CustomerAccountTier = 'retail' | 'business' | 'vip';

export interface CreateBookingDto {
  customerId?: string;
  pickup: string;
  destination: string;
  scheduleAt: string;
  serviceType: ServiceType;
  customerTier?: CustomerAccountTier;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  waitTimeMin?: number;
  isNight?: boolean;
  airportIntel?: {
    flightNumber?: string;
    airline?: string;
    terminal?: string;
    arrivalAirport?: string;
  };
}

export interface BookingRecord extends CreateBookingDto {
  id: string;
  referenceCode: string;
  status: CanonicalBookingLifecycleStatus;
  createdAt: string;
  fareQuote: {
    fareTotal: number;
    pricingVersion: string;
    breakdown: Record<string, number>;
    synchronizedAt: string;
  };
  billing: {
    invoiceLifecycleState: 'not_ready' | 'ready_for_invoice' | 'invoiced' | 'settled';
    isBillingConsistent: boolean;
    synchronizedAt: string;
  };
  rideHistoryMeta: {
    firstRideAt: string;
    lastRideAt: string;
    ridesCompletedUnderAccount: number;
  };
  lifecycle: {
    initializedAt: string;
    state: CanonicalBookingLifecycleStatus;
    initIdempotencyKey: string;
    version: number;
    transitions: Array<{
      from: CanonicalBookingLifecycleStatus | null;
      to: CanonicalBookingLifecycleStatus;
      occurredAt: string;
      actor: 'system' | 'admin' | 'driver' | 'customer';
      reason?: string;
      metadata?: Record<string, unknown>;
    }>;
  };
  airportIntelligence?: {
    enabled: boolean;
    synchronizedAt: string;
    pickupBufferMin: number;
    monitoring: {
      status: 'scheduled' | 'active' | 'delayed' | 'landed' | 'cancelled' | 'unknown';
      delayMin: number;
      terminal: string | null;
      notes: string[];
    };
  };
  lvMessenger: {
    threadId: string;
    messages: Array<{
      id: string;
      at: string;
      channel: 'customer' | 'driver' | 'admin' | 'moni';
      messageType: string;
      tone: 'calm' | 'operational' | 'reassuring';
      content: string;
      metadata?: Record<string, unknown>;
    }>;
    lastMessageAt: string;
  };
}
