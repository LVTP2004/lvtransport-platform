import type { TripCostBreakdown } from '../../pricing/models/pricing.types.js';
import type { CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';

export type ServiceType = 'standard' | 'airport' | 'vip';
export type CustomerAccountTier = 'retail' | 'business' | 'vip';
export type BusinessAccountLifecycle = 'prospect' | 'active' | 'suspended' | 'archived';

export interface BusinessAccountProfile {
  accountId: string;
  legalName: string;
  lifecycle: BusinessAccountLifecycle;
  billingEmail: string;
  invoiceTermsDays: number;
  recurringBillingEnabled: boolean;
  costCenterCode?: string;
}

export interface VipOperationalProfile {
  conciergeLevel: 'priority' | 'signature';
  preferredDispatchNote?: string;
  dedicatedOpsContact?: string;
}

export interface BookingBillingSnapshot {
  invoiceLifecycleState: 'not_ready' | 'ready_for_invoice' | 'invoiced' | 'settled';
  linkedInvoiceId?: string;
  isBillingConsistent: boolean;
  synchronizedAt: string;
}

export interface CreateBookingDto {
  customerId?: string;
  pickup: string;
  destination: string;
  scheduleAt: string;
  serviceType: ServiceType;
  customerTier?: CustomerAccountTier;
  businessAccount?: BusinessAccountProfile;
  vipOperationalProfile?: VipOperationalProfile;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  waitTimeMin?: number;
  isNight?: boolean;
  recurringRideKey?: string;
  airportIntel?: AirportCoordinationInput;
}

export interface AirportCoordinationInput {
  flightNumber?: string;
  airline?: string;
  terminal?: string;
  arrivalAirport?: string;
}

export type FlightDataProvider = 'flightaware' | 'aviationstack' | 'flightradar' | 'airport_feed' | 'manual';
export type FlightOperationalStatus = 'scheduled' | 'active' | 'delayed' | 'landed' | 'cancelled' | 'unknown';

export interface AirportIntelligenceState {
  enabled: boolean;
  synchronizedAt: string;
  pickupBufferMin: number;
  monitoring: {
    providerPriority: FlightDataProvider[];
    status: FlightOperationalStatus;
    delayMin: number;
    terminal: string | null;
    gate?: string;
    notes: string[];
  };
}

export interface LVMessage {
  id: string;
  at: string;
  channel: 'customer' | 'driver' | 'admin' | 'moni';
  messageType: 'flight_delay_detected' | 'pickup_timing_adjusted' | 'driver_update' | 'airport_instruction' | 'lifecycle_update' | 'premium_confirmation';
  tone: 'calm' | 'operational' | 'reassuring';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface BookingRecord extends CreateBookingDto {
  id: string;
  referenceCode: string;
  status: CanonicalBookingLifecycleStatus;
  createdAt: string;
  fareQuote: {
    fareTotal: number;
    pricingVersion: string;
    breakdown: TripCostBreakdown;
    synchronizedAt: string;
  };
  completedFare?: {
    finalTotal: number;
    completedAt: string;
    breakdown: TripCostBreakdown;
  };
  billing: BookingBillingSnapshot;
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
  airportIntelligence?: AirportIntelligenceState;
  lvMessenger: {
    threadId: string;
    messages: LVMessage[];
    lastMessageAt: string;
  };
}
