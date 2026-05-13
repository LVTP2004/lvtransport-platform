import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';
import { operationalAnalyticsService } from './operational-analytics.service.js';
import { recordOperationalIncident, summarizeOperationalIncidents } from '../utils/operational-monitoring.js';

import { CANONICAL_BOOKING_LIFECYCLE, CANONICAL_ALLOWED_TRANSITIONS, TERMINAL_BOOKING_STATUSES, toCanonicalBookingStatus, type CanonicalBookingLifecycleStatus } from '../types/lifecycle.js';

export const BOOKING_LIFECYCLE = CANONICAL_BOOKING_LIFECYCLE;

export type BookingLifecycleStatus = CanonicalBookingLifecycleStatus;
export type BookingActor = 'customer' | 'admin' | 'driver' | 'system';

export type BookingTimelineEntry = { status: BookingLifecycleStatus; actor: BookingActor; at: string; note?: string };

export type BookingRecord = {
  id: string;
  code: string;
  customerName: string;
  pickup: string;
  destination: string;
  serviceType: 'standard' | 'airport' | 'vip';
  scheduledAt: string;
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled';
  status: BookingLifecycleStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignmentOfferedAt?: string;
  assignmentExpiresAt?: string;
  version: number;
  timeline: BookingTimelineEntry[];
  createdAt: string;
  updatedAt: string;
  tracking: {
    etaMinutes: number | null;
    lastKnownLocation: { lat: number; lng: number; heading?: number } | null;
    routePolyline: string | null;
    gpsProvider: 'none' | 'future';
    updatedAt: string;
  };
};

export const DRIVER_STATES = ['offline', 'available', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed'] as const;
export type DriverState = (typeof DRIVER_STATES)[number];

export type DriverRealtimeState = {
  driverId: string;
  state: DriverState;
  activeBookingId?: string;
  location?: { lat: number; lng: number; heading?: number; accuracy?: number; speed?: number; capturedAt: string };
  lastUpdatedAt: string;
  rating?: number;
};

type AssignmentPreparationInput = { bookingId: string; pickupLocation: { lat: number; lng: number }; maxCandidates?: number };

type AssignmentCandidate = {
  driverId: string;
  distanceKm: number | null;
  etaMinutes: number | null;
  assignmentEligible: boolean;
  notEligibleReason?: string;
  availabilityScore: number;
  activeRidesScore: number;
  driverStateScore: number;
  ratingScore: number;
  etaScore: number;
  totalScore: number;
  activeRides: number;
  state: DriverState;
  rating: number | null;
  locationKnown: boolean;
  availabilityPrediction: {
    nextAvailabilityMinutes: number;
    confidence: number;
    source: 'realtime_state' | 'operational_inference';
  };
  loadBalanceScore: number;
  conflictFree: boolean;
};

type DriverLocationUpdate = {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  speed?: number;
  capturedAt?: string;
  bookingId?: string;
  idempotencyKey?: string;
};

const ASSIGNMENT_TTL_MS = 45_000;
const DRIVER_STALE_MS = 5 * 60_000;
const MAX_REPLAY_EVENTS = 250;
const MAX_EVENT_PAYLOAD_BYTES = 96_000;
const TELEMETRY_MIN_INTERVAL_MS = 2_000;
const ADMIN_ANALYTICS_PUSH_THROTTLE_MS = 1_000;
const AUTO_ACCEPT_AFTER_MS = 10_000;
const AUTO_QUOTE_AFTER_MS = 20_000;
const AUTO_CONFIRM_AFTER_MS = 30_000;
const AUTO_AVAILABLE_AFTER_MS = 40_000;
const IN_PROGRESS_TIMEOUT_MS = 2 * 60 * 60_000;

const bookingEvents = new EventEmitter();
const bookings = new Map<string, BookingRecord>();
const idempotencyKeys = new Set<string>();
const websocketClients = new Set<WebSocket>();
const driverStates = new Map<string, DriverRealtimeState>();
const eventReplayBuffer: string[] = [];
const assignmentAttemptLedger = new Map<string, string>();
const telemetryIngestLedger = new Map<string, { at: number; lat: number; lng: number }>();
const assignmentPreparationCache = new Map<string, { expiresAt: number; payload: { bookingId: string; candidates: AssignmentCandidate[] } }>();
let eventSequence = 0;
let heartbeatInterval: NodeJS.Timeout | undefined;
let lastAnalyticsPushAt = 0;

type RealtimeSocket = WebSocket & { isAlive?: boolean };

const allowedTransitions = CANONICAL_ALLOWED_TRANSITIONS;

const toRadians = (value: number) => (value * Math.PI) / 180;
const calculateDistanceKm = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const estimateEtaMinutes = (distanceKm: number | null) => distanceKm === null ? null : Math.max(1, Math.round((distanceKm / 32) * 60));

const emit = (event: string, payload: unknown) => {
  const serializedPayload = JSON.stringify(payload);
  const payloadSize = Buffer.byteLength(serializedPayload, 'utf8');
  const envelope = JSON.stringify({ event, payload, payloadSize, at: new Date().toISOString(), sequence: ++eventSequence });
  if (payloadSize > MAX_EVENT_PAYLOAD_BYTES) return;
  eventReplayBuffer.push(envelope);
  if (eventReplayBuffer.length > MAX_REPLAY_EVENTS) eventReplayBuffer.splice(0, eventReplayBuffer.length - MAX_REPLAY_EVENTS);
  for (const client of websocketClients) if (client.readyState === client.OPEN) client.send(envelope);
  bookingEvents.emit(event, payload);
};

const emitAdminAnalytics = (force = false) => {
  const now = Date.now();
  if (!force && now - lastAnalyticsPushAt < ADMIN_ANALYTICS_PUSH_THROTTLE_MS) return;
  lastAnalyticsPushAt = now;
  emit('admin.analytics.updated', operationalAnalyticsService.getAdminSnapshot());
};

const reportLifecycleAnomaly = (booking: BookingRecord, from: BookingLifecycleStatus, to: BookingLifecycleStatus) => {
  recordOperationalIncident({
    code: 'BOOKING_LIFECYCLE_ANOMALY',
    domain: 'lifecycle',
    severity: 'warning',
    message: 'Invalid booking lifecycle transition blocked',
    context: { bookingId: booking.id, from, to, version: booking.version }
  });
};

const parseLastSequenceFromUrl = (url?: string): number | null => {
  if (!url) return null;
  const parsed = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '').get('lastSequence');
  const asNumber = Number(parsed);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null;
};

const createBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;
const createAssignmentAttemptKey = (bookingId: string, driverId: string) => `${bookingId}:${driverId}`;
const getAvailabilityPrediction = (driver: DriverRealtimeState, activeRides: number) => {
  if (driver.state === 'available' && activeRides === 0) return { nextAvailabilityMinutes: 0, confidence: 0.95, source: 'realtime_state' as const };
  const stateMinutes: Record<DriverState, number> = { offline: 45, available: 0, assigned: 6, en_route: 12, arrived: 4, in_progress: 18, completed: 2 };
  const nextAvailabilityMinutes = stateMinutes[driver.state] + Math.max(0, activeRides - 1) * 10;
  return { nextAvailabilityMinutes, confidence: 0.65, source: 'operational_inference' as const };
};
const releaseDriver = (driverId?: string) => {
  if (!driverId) return;
  const current = driverStates.get(driverId);
  if (!current) return;
  driverStates.set(driverId, { ...current, state: 'available', activeBookingId: undefined, lastUpdatedAt: new Date().toISOString() });
  emit('driver.status.updated', driverStates.get(driverId));
};


const getBookingAgeMs = (booking: BookingRecord, nowMs: number) => nowMs - new Date(booking.createdAt).getTime();

const transitionBySystemRule = (booking: BookingRecord, nextStatus: BookingLifecycleStatus, note: string) => {
  const now = new Date().toISOString();
  const previousStatus = booking.status;
  if (previousStatus === nextStatus || !allowedTransitions[previousStatus].has(nextStatus)) return false;
  booking.status = nextStatus;
  booking.version += 1;
  booking.updatedAt = now;
  booking.timeline.push({ status: nextStatus, actor: 'system', at: now, note });
  operationalAnalyticsService.trackBookingTransition(booking, previousStatus);
  emit('booking.updated', booking);
  emit('booking.lifecycle.changed', booking);
  emit('automation.trigger.executed', { bookingId: booking.id, from: previousStatus, to: nextStatus, note, at: now });
  return true;
};

export const realtimeOrchestratorService = {
  initialize(): void {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      this.cleanupStaleAssignments();
      this.runAutomationSweep();
      for (const socket of websocketClients) {
        const client = socket as RealtimeSocket;
        if (client.isAlive === false) {
          socket.terminate();
          websocketClients.delete(socket);
          continue;
        }
        client.isAlive = false;
        socket.ping();
      }
    }, 30_000);
  },

  registerClient(socket: WebSocket): void {
    const client = socket as RealtimeSocket;
    client.isAlive = true;
    websocketClients.add(socket);
    socket.on('pong', () => { client.isAlive = true; });
    socket.on('close', () => websocketClients.delete(socket));
    const lastSequence = parseLastSequenceFromUrl((socket as unknown as { url?: string }).url);
    if (lastSequence) {
      recordOperationalIncident({ code: 'REALTIME_RECONNECT_REPLAY', domain: 'reconnect', severity: 'info', message: 'Client requested realtime replay after reconnect', context: { lastSequence } });
      for (const replayEvent of eventReplayBuffer) if ((JSON.parse(replayEvent) as { sequence?: number }).sequence! > lastSequence) socket.send(replayEvent);
    }
    socket.send(JSON.stringify({ event: 'booking.snapshot', payload: Array.from(bookings.values()), sequence: eventSequence }));
    socket.send(JSON.stringify({ event: 'driver.snapshot', payload: Array.from(driverStates.values()), sequence: eventSequence }));
    socket.send(JSON.stringify({ event: 'admin.analytics.snapshot', payload: operationalAnalyticsService.getAdminSnapshot(), sequence: eventSequence }));
  },

  createBooking(input: { customerName?: string; pickup: string; destination: string; serviceType?: 'standard' | 'airport' | 'vip'; scheduledAt?: string; paymentStatus?: 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' }): BookingRecord {
    const now = new Date().toISOString();
    const scheduledAt = input.scheduledAt && !Number.isNaN(new Date(input.scheduledAt).getTime()) ? input.scheduledAt : now;
    const booking: BookingRecord = {
      id: randomUUID(), code: createBookingCode(), customerName: input.customerName?.trim() || 'Guest rider', pickup: input.pickup, destination: input.destination, serviceType: input.serviceType ?? 'standard', scheduledAt, paymentStatus: input.paymentStatus ?? 'pending',
      status: 'pending', version: 1, timeline: [{ status: 'pending', actor: 'customer', at: now, note: 'Booking created' }], createdAt: now, updatedAt: now,
      tracking: { etaMinutes: null, lastKnownLocation: null, routePolyline: null, gpsProvider: 'future', updatedAt: now }
    };
    bookings.set(booking.id, booking); operationalAnalyticsService.trackBookingCreated(booking); emit('booking.created', booking); this.runAutomationSweep(); emitAdminAnalytics(); return booking;
  },



  upsertExternalBooking(input: { id: string; referenceCode: string; pickup: string; destination: string; serviceType: 'standard' | 'airport' | 'vip'; scheduledAt: string; customerName?: string; status?: BookingLifecycleStatus }): BookingRecord {
    const now = new Date().toISOString();
    const existing = bookings.get(input.id);
    if (existing) {
      existing.code = input.referenceCode;
      existing.pickup = input.pickup;
      existing.destination = input.destination;
      existing.serviceType = input.serviceType;
      existing.scheduledAt = input.scheduledAt;
      existing.customerName = input.customerName?.trim() || existing.customerName;
      existing.updatedAt = now;
      return existing;
    }

    const booking: BookingRecord = {
      id: input.id,
      code: input.referenceCode,
      customerName: input.customerName?.trim() || 'Guest rider',
      pickup: input.pickup,
      destination: input.destination,
      serviceType: input.serviceType,
      scheduledAt: input.scheduledAt,
      paymentStatus: 'pending',
      status: input.status ?? 'pending',
      assignedDriverId: undefined,
      assignedDriverName: undefined,
      assignmentOfferedAt: undefined,
      assignmentExpiresAt: undefined,
      version: 1,
      timeline: [{ status: input.status ?? 'pending', actor: 'system', at: now, note: 'Hydrated from booking flow service' }],
      createdAt: now,
      updatedAt: now,
      tracking: { etaMinutes: null, lastKnownLocation: null, routePolyline: null, gpsProvider: 'future', updatedAt: now }
    };

    bookings.set(booking.id, booking);
    operationalAnalyticsService.trackBookingCreated(booking);
    emit('booking.created', booking);
    emitAdminAnalytics();
    return booking;
  },
  listBookings: () => Array.from(bookings.values()),
  listDriverStates: () => Array.from(driverStates.values()),

  assignDriver(params: { bookingId: string; driverId: string; driverName: string; idempotencyKey?: string }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (booking.assignedDriverId && booking.assignedDriverId !== params.driverId && ['assigned', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))) throw new Error('BOOKING_ALREADY_ASSIGNED');
    const driver = driverStates.get(params.driverId);
    if (!driver || !['available', 'completed'].includes(driver.state) || driver.activeBookingId) throw new Error('DRIVER_NOT_ASSIGNABLE');
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return booking;
    const attemptKey = createAssignmentAttemptKey(params.bookingId, params.driverId);
    const lastAttemptAt = assignmentAttemptLedger.get(attemptKey);
    if (lastAttemptAt && Date.now() - new Date(lastAttemptAt).getTime() < ASSIGNMENT_TTL_MS && booking.status === 'assigned') throw new Error('DUPLICATE_ASSIGNMENT_ATTEMPT');
    if (!['pending', 'assigned'].includes(toCanonicalBookingStatus(booking.status))) {
      reportLifecycleAnomaly(booking, booking.status, 'assigned');
      throw new Error('INVALID_TRANSITION');
    }
    const now = new Date().toISOString();
    booking.assignedDriverId = params.driverId; booking.assignedDriverName = params.driverName; booking.assignmentOfferedAt = now; booking.assignmentExpiresAt = new Date(Date.now() + ASSIGNMENT_TTL_MS).toISOString();
    booking.status = 'assigned'; booking.version += 1; booking.updatedAt = now;
    booking.timeline.push({ status: 'assigned', actor: 'admin', at: now, note: `Driver ${params.driverName} assigned` });
    driverStates.set(params.driverId, { ...driver, state: 'assigned', activeBookingId: booking.id, lastUpdatedAt: now });
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    assignmentAttemptLedger.set(attemptKey, now);
    operationalAnalyticsService.trackAssignmentIssued();
    operationalAnalyticsService.trackBookingTransition(booking);
    operationalAnalyticsService.trackDriverState(driverStates.get(params.driverId)!);
    emit('booking.updated', booking); emit('driver.assigned', booking); emit('driver.status.updated', driverStates.get(params.driverId)); emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: now });
    emitAdminAnalytics();
    return booking;
  },

  driverRespondToAssignment(params: { bookingId: string; driverId: string; action: 'accept' | 'reject' }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (booking.assignedDriverId !== params.driverId) throw new Error('DRIVER_MISMATCH');
    const now = new Date().toISOString();
    const previousStatus = booking.status;
    if (params.action === 'reject') {
      booking.status = 'cancelled'; booking.version += 1; booking.updatedAt = now; booking.timeline.push({ status: 'cancelled', actor: 'driver', at: now, note: 'Driver rejected assignment' });
      releaseDriver(params.driverId);
    } else {
      if (booking.assignmentExpiresAt && new Date(booking.assignmentExpiresAt).getTime() < Date.now()) throw new Error('ASSIGNMENT_EXPIRED');
      booking.status = 'accepted'; booking.version += 1; booking.updatedAt = now; booking.timeline.push({ status: 'accepted', actor: 'driver', at: now, note: 'Driver accepted assignment' });
      const driver = driverStates.get(params.driverId);
      if (driver) driverStates.set(params.driverId, { ...driver, state: 'en_route', activeBookingId: booking.id, lastUpdatedAt: now });
    }
    operationalAnalyticsService.trackBookingTransition(booking, previousStatus);
    const trackedDriver = driverStates.get(params.driverId);
    if (trackedDriver) operationalAnalyticsService.trackDriverState(trackedDriver);
    emit('booking.updated', booking); emit('booking.lifecycle.changed', booking); emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: now });
    emitAdminAnalytics();
    return booking;
  },

  transitionStatus(params: { bookingId: string; status: string; actor: string }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    const nextStatus = toCanonicalBookingStatus(params.status);
    const actor = params.actor as BookingActor;
    if (!['customer', 'admin', 'driver', 'system'].includes(actor)) throw new Error('INVALID_ACTOR');
    if (booking.status === nextStatus) return booking;
    if (!allowedTransitions[booking.status].has(nextStatus)) throw new Error('INVALID_TRANSITION');
    const now = new Date().toISOString();
    const previousStatus = booking.status;
    booking.status = nextStatus; booking.version += 1; booking.updatedAt = now; booking.timeline.push({ status: nextStatus, actor, at: now });
    if (TERMINAL_BOOKING_STATUSES.has(nextStatus)) releaseDriver(booking.assignedDriverId);
    operationalAnalyticsService.trackBookingTransition(booking, previousStatus);
    emit('booking.updated', booking); emit('booking.lifecycle.changed', booking); emit('admin.live.updated', { bookingId: booking.id, status: booking.status, at: now });
    emitAdminAnalytics();
    return booking;
  },

  updateDriverState(params: { driverId: string; state: DriverState; bookingId?: string; location?: { lat: number; lng: number }; rating?: number }): DriverRealtimeState {
    const now = new Date().toISOString();
    const existing = driverStates.get(params.driverId);
    if (params.state !== 'available' && !params.bookingId && existing?.activeBookingId) params.bookingId = existing.activeBookingId;
    const next: DriverRealtimeState = { driverId: params.driverId, state: params.state, activeBookingId: params.bookingId, lastUpdatedAt: now, location: existing?.location, rating: typeof params.rating === 'number' ? params.rating : existing?.rating };
    if (params.location) next.location = { ...params.location, capturedAt: now };
    driverStates.set(params.driverId, next);
    operationalAnalyticsService.trackDriverState(next);
    emit('driver.status.updated', next); emit('admin.live.updated', { driverId: params.driverId, state: params.state, bookingId: params.bookingId, at: now });
    emit('admin.analytics.updated', operationalAnalyticsService.getAdminSnapshot());
    return next;
  },

  prepareDriverAssignment(input: AssignmentPreparationInput): { bookingId: string; candidates: AssignmentCandidate[] } {
    const booking = bookings.get(input.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    const cacheKey = `${input.bookingId}:${input.pickupLocation.lat.toFixed(4)}:${input.pickupLocation.lng.toFixed(4)}:${input.maxCandidates ?? 10}:${driverStates.size}:${bookings.size}`;
    const cached = assignmentPreparationCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.payload;
    const activeRideCounts = new Map<string, number>();
    for (const b of bookings.values()) if (b.assignedDriverId && ['assigned', 'en_route', 'arrived', 'in_progress'].includes(b.status)) activeRideCounts.set(b.assignedDriverId, (activeRideCounts.get(b.assignedDriverId) ?? 0) + 1);
    const stateScoreMap: Record<DriverState, number> = { offline: 0, available: 1, assigned: 0.1, en_route: 0, arrived: 0, in_progress: 0, completed: 0.5 };
    const nowMs = Date.now();
    const candidates = Array.from(driverStates.values()).map((driver) => {
      const activeRides = activeRideCounts.get(driver.driverId) ?? 0;
      const distanceKm = driver.location ? calculateDistanceKm(input.pickupLocation, driver.location) : null;
      const etaMinutes = estimateEtaMinutes(distanceKm);
      const isStale = nowMs - new Date(driver.lastUpdatedAt).getTime() > DRIVER_STALE_MS;
      const assignmentEligible = !isStale && driver.state === 'available' && activeRides === 0;
      const distanceScore = distanceKm === null ? 0.1 : Math.max(0, 1 - distanceKm / 20);
      const etaScore = etaMinutes === null ? 0.1 : Math.max(0, 1 - etaMinutes / 30);
      const availabilityScore = assignmentEligible ? 1 : 0;
      const activeRidesScore = activeRides === 0 ? 1 : 0;
      const loadBalanceScore = Math.max(0, 1 - Math.min(3, activeRides) / 3);
      const driverStateScore = stateScoreMap[driver.state];
      const ratingScore = typeof driver.rating === 'number' ? Math.min(1, Math.max(0, driver.rating / 5)) : 0.5;
      const availabilityPrediction = getAvailabilityPrediction(driver, activeRides);
      const conflictFree = !driver.activeBookingId || driver.activeBookingId === booking.id;
      if (!conflictFree) {
        recordOperationalIncident({ code: 'DISPATCH_CONFLICT_ACTIVE_BOOKING', domain: 'dispatch', severity: 'warning', message: 'Dispatch candidate has conflicting active booking', context: { bookingId: booking.id, driverId: driver.driverId, activeBookingId: driver.activeBookingId } });
      }
      return {
        driverId: driver.driverId, distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)), etaMinutes, assignmentEligible,
        notEligibleReason: assignmentEligible ? undefined : isStale ? 'stale_driver_presence' : driver.state !== 'available' ? 'driver_busy_or_offline' : 'active_ride_exists',
        availabilityScore, activeRidesScore, driverStateScore, ratingScore, etaScore,
        totalScore: Number((distanceScore * 0.3 + etaScore * 0.25 + availabilityScore * 0.2 + activeRidesScore * 0.1 + loadBalanceScore * 0.1 + driverStateScore * 0.03 + ratingScore * 0.02).toFixed(4)),
        activeRides, state: driver.state, rating: driver.rating ?? null, locationKnown: Boolean(driver.location),
        availabilityPrediction, loadBalanceScore: Number(loadBalanceScore.toFixed(4)), conflictFree
      };
    }).sort((a, b) => b.totalScore - a.totalScore || (a.etaMinutes ?? Number.MAX_SAFE_INTEGER) - (b.etaMinutes ?? Number.MAX_SAFE_INTEGER) || (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER) || a.driverId.localeCompare(b.driverId));
    const payload = { bookingId: booking.id, candidates: candidates.slice(0, input.maxCandidates ?? 10) };
    assignmentPreparationCache.set(cacheKey, { expiresAt: Date.now() + 5_000, payload });
    return payload;
  },

  cleanupStaleAssignments(): { releasedAssignments: string[] } {
    const now = Date.now();
    const released: string[] = [];
    for (const booking of bookings.values()) {
      if (booking.status !== 'assigned' || !booking.assignmentExpiresAt) continue;
      if (new Date(booking.assignmentExpiresAt).getTime() > now) continue;
      booking.status = 'failed'; booking.version += 1; booking.updatedAt = new Date().toISOString();
      booking.timeline.push({ status: 'failed', actor: 'system', at: booking.updatedAt, note: 'Assignment timed out and was recycled' });
      releaseDriver(booking.assignedDriverId);
      released.push(booking.id);
      operationalAnalyticsService.trackBookingTransition(booking, 'assigned');
      emit('booking.updated', booking);
      emit('booking.lifecycle.changed', booking);
      emit('admin.live.updated', { bookingId: booking.id, status: booking.status, at: booking.updatedAt });
    }
    return { releasedAssignments: released };
  },

  restoreDriverAssignments(driverId: string): { recoveredBookings: BookingRecord[]; driverState: DriverRealtimeState | null } {
    const recovered = Array.from(bookings.values()).filter((booking) => booking.assignedDriverId === driverId && ['assigned', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status)));
    const latest = recovered[recovered.length - 1];
    if (latest) this.updateDriverState({ driverId, state: latest.status === 'accepted' ? 'en_route' : (latest.status === 'assigned' ? 'assigned' : (latest.status as DriverState)), bookingId: latest.id });
    operationalAnalyticsService.rebuildFromSnapshots(Array.from(bookings.values()), Array.from(driverStates.values()));
    emit('dispatch.recovery.completed', { driverId, recoveredBookings: recovered.map((booking) => booking.id), at: new Date().toISOString() });
    return { recoveredBookings: recovered, driverState: driverStates.get(driverId) ?? null };
  },

  updateDriverLocation(params: DriverLocationUpdate) {
    const now = new Date().toISOString();
    if (!Number.isFinite(params.lat) || !Number.isFinite(params.lng)) {
      recordOperationalIncident({ code: 'TELEMETRY_INVALID_COORDINATES', domain: 'telemetry', severity: 'warning', message: 'Dropped telemetry update due to invalid coordinates', context: { driverId: params.driverId, lat: params.lat, lng: params.lng } });
      throw new Error('INVALID_TELEMETRY_COORDINATES');
    }
    const current = driverStates.get(params.driverId);
    const next: DriverRealtimeState = {
      driverId: params.driverId, state: current?.state ?? 'available', activeBookingId: params.bookingId ?? current?.activeBookingId,
      location: { lat: params.lat, lng: params.lng, heading: params.heading, accuracy: params.accuracy, speed: params.speed, capturedAt: params.capturedAt ?? now },
      lastUpdatedAt: now, rating: current?.rating
    };
    driverStates.set(params.driverId, next);
    operationalAnalyticsService.trackDriverState(next);
    const ledger = telemetryIngestLedger.get(params.driverId);
    const capturedMs = new Date(next.location?.capturedAt ?? now).getTime();
    if (capturedMs < Date.now() - DRIVER_STALE_MS) {
      recordOperationalIncident({ code: 'TELEMETRY_STALE', domain: 'telemetry', severity: 'warning', message: 'Stale telemetry ingest detected', context: { driverId: params.driverId, capturedAt: next.location?.capturedAt } });
    }
    const isRapid = ledger && capturedMs - ledger.at < TELEMETRY_MIN_INTERVAL_MS;
    const isDuplicateCoordinate = ledger && Math.abs(ledger.lat - params.lat) < 0.00001 && Math.abs(ledger.lng - params.lng) < 0.00001;
    telemetryIngestLedger.set(params.driverId, { at: capturedMs, lat: params.lat, lng: params.lng });
    if (!isRapid || !isDuplicateCoordinate) {
      emit('driver.location.updated', { driverId: params.driverId, bookingId: next.activeBookingId, location: next.location, at: now });
    }
    return next;
  },

  runAutomationSweep(): { transitioned: string[]; recovered: string[] } {
    const nowMs = Date.now();
    const transitioned: string[] = [];
    const recovered: string[] = [];
    for (const booking of Array.from(bookings.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      const age = getBookingAgeMs(booking, nowMs);
      if (booking.status === 'pending' && age >= AUTO_ACCEPT_AFTER_MS && transitionBySystemRule(booking, 'assigned', 'Auto-assigned by dispatch workflow')) transitioned.push(booking.id);
      if (booking.status === 'assigned' && age >= AUTO_QUOTE_AFTER_MS && transitionBySystemRule(booking, 'accepted', 'Auto-accepted by workflow trigger')) transitioned.push(booking.id);
      if (booking.status === 'in_progress') {
        const inProgressAt = [...booking.timeline].reverse().find((entry) => entry.status === 'in_progress')?.at;
        if (inProgressAt && nowMs - new Date(inProgressAt).getTime() >= IN_PROGRESS_TIMEOUT_MS) {
          if (transitionBySystemRule(booking, 'failed', 'Ride timed out without completion signal')) recovered.push(booking.id);
          releaseDriver(booking.assignedDriverId);
        }
      }
      if (booking.status === 'completed') {
        const hasFinalized = booking.timeline.some((entry) => entry.note === 'Operational finalization completed');
        if (!hasFinalized) {
          booking.version += 1;
          booking.updatedAt = new Date().toISOString();
          booking.timeline.push({ status: 'completed', actor: 'system', at: booking.updatedAt, note: 'Operational finalization completed' });
          emit('booking.finalized', { bookingId: booking.id, synchronizedAt: booking.updatedAt, paymentState: 'ready_for_capture', pricingState: 'locked' });
          transitioned.push(booking.id);
        }
      }
    }
    if (transitioned.length || recovered.length) emitAdminAnalytics();
    return { transitioned, recovered };
  },

  restoreAutomationState(): { restoredBookings: string[] } {
    const restoredBookings: string[] = [];
    this.cleanupStaleAssignments();
    for (const booking of bookings.values()) {
      if (['pending', 'assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))) restoredBookings.push(booking.id);
    }
    this.runAutomationSweep();
    emit('automation.restore.completed', { restoredBookings, at: new Date().toISOString() });
    return { restoredBookings };
  },

  getDispatchDiagnostics() {
    const staleAssignments = Array.from(bookings.values()).filter((booking) => booking.status === 'assigned' && booking.assignmentExpiresAt && new Date(booking.assignmentExpiresAt).getTime() <= Date.now());
    const staleDrivers = Array.from(driverStates.values()).filter((driver) => Date.now() - new Date(driver.lastUpdatedAt).getTime() > DRIVER_STALE_MS);
    const duplicateAttemptsBlocked = Array.from(assignmentAttemptLedger.values()).filter((at) => Date.now() - new Date(at).getTime() <= ASSIGNMENT_TTL_MS).length;
    return {
      totalBookings: bookings.size,
      totalDrivers: driverStates.size,
      staleAssignments: staleAssignments.map((b) => b.id),
      staleDrivers: staleDrivers.map((d) => d.driverId),
      activeAssignmentAttempts: duplicateAttemptsBlocked,
      telemetryRateLimitedDrivers: Array.from(telemetryIngestLedger.keys()).length,
      assignmentCacheEntries: assignmentPreparationCache.size,
      websocketClients: websocketClients.size,
      replayBufferSize: eventReplayBuffer.length,
      operationalSnapshotAt: new Date().toISOString()
    };
  },

  getOperationalDiagnostics() {
    const now = Date.now();
    const staleBookings = Array.from(bookings.values())
      .filter((booking) => !['completed', 'cancelled', 'failed'].includes(booking.status) && now - new Date(booking.updatedAt).getTime() > 15 * 60_000)
      .map((booking) => ({ bookingId: booking.id, status: booking.status, updatedAt: booking.updatedAt }));
    return {
      incidentSummary: summarizeOperationalIncidents(),
      staleBookings,
      telemetryTrackedDrivers: telemetryIngestLedger.size,
      activeAssignments: Array.from(bookings.values()).filter((booking) => ['assigned', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))).length
    };
  },

  getOperationalScalabilityDiagnostics() {
    return {
      generatedAt: new Date().toISOString(),
      bookingsTracked: bookings.size,
      driversTracked: driverStates.size,
      activeRideCount: Array.from(bookings.values()).filter((booking) => ['assigned', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))).length,
      connectedRealtimeClients: websocketClients.size,
      eventReplayDepth: eventReplayBuffer.length,
      assignmentCacheEntries: assignmentPreparationCache.size,
      telemetryTrackedDrivers: telemetryIngestLedger.size,
      sequence: eventSequence
    };
  }
};
