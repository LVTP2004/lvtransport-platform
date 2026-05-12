import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';

export const BOOKING_LIFECYCLE = [
  'pending',
  'accepted',
  'quoted',
  'confirmed',
  'available',
  'assigned',
  'onderweg',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'failed'
] as const;

export type BookingLifecycleStatus = (typeof BOOKING_LIFECYCLE)[number];
export type BookingActor = 'customer' | 'admin' | 'driver' | 'system';

export type BookingTimelineEntry = { status: BookingLifecycleStatus; actor: BookingActor; at: string; note?: string };

export type BookingRecord = {
  id: string;
  code: string;
  customerName: string;
  pickup: string;
  destination: string;
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

export const DRIVER_STATES = ['offline', 'available', 'assigned', 'onderweg', 'arrived', 'in_progress', 'completed'] as const;
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

const bookingEvents = new EventEmitter();
const bookings = new Map<string, BookingRecord>();
const idempotencyKeys = new Set<string>();
const websocketClients = new Set<WebSocket>();
const driverStates = new Map<string, DriverRealtimeState>();
const eventReplayBuffer: string[] = [];
let eventSequence = 0;
let heartbeatInterval: NodeJS.Timeout | undefined;

type RealtimeSocket = WebSocket & { isAlive?: boolean };

const allowedTransitions: Record<BookingLifecycleStatus, BookingLifecycleStatus[]> = {
  pending: ['accepted', 'quoted', 'cancelled', 'failed'],
  accepted: ['quoted', 'confirmed', 'available', 'assigned', 'cancelled', 'failed'],
  quoted: ['confirmed', 'available', 'cancelled', 'failed'],
  confirmed: ['available', 'assigned', 'cancelled', 'failed'],
  available: ['assigned', 'cancelled', 'failed'],
  assigned: ['onderweg', 'cancelled', 'failed'],
  onderweg: ['arrived', 'cancelled', 'failed'],
  arrived: ['in_progress', 'cancelled', 'failed'],
  in_progress: ['completed', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: []
};

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
  const envelope = JSON.stringify({ event, payload, at: new Date().toISOString(), sequence: ++eventSequence });
  eventReplayBuffer.push(envelope);
  if (eventReplayBuffer.length > MAX_REPLAY_EVENTS) eventReplayBuffer.splice(0, eventReplayBuffer.length - MAX_REPLAY_EVENTS);
  for (const client of websocketClients) if (client.readyState === client.OPEN) client.send(envelope);
  bookingEvents.emit(event, payload);
};

const parseLastSequenceFromUrl = (url?: string): number | null => {
  if (!url) return null;
  const parsed = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '').get('lastSequence');
  const asNumber = Number(parsed);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null;
};

const createBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;
const releaseDriver = (driverId?: string) => {
  if (!driverId) return;
  const current = driverStates.get(driverId);
  if (!current) return;
  driverStates.set(driverId, { ...current, state: 'available', activeBookingId: undefined, lastUpdatedAt: new Date().toISOString() });
  emit('driver.status.updated', driverStates.get(driverId));
};

export const realtimeOrchestratorService = {
  initialize(): void {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      this.cleanupStaleAssignments();
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
    if (lastSequence) for (const replayEvent of eventReplayBuffer) if ((JSON.parse(replayEvent) as { sequence?: number }).sequence! > lastSequence) socket.send(replayEvent);
    socket.send(JSON.stringify({ event: 'booking.snapshot', payload: Array.from(bookings.values()), sequence: eventSequence }));
    socket.send(JSON.stringify({ event: 'driver.snapshot', payload: Array.from(driverStates.values()), sequence: eventSequence }));
  },

  createBooking(input: { customerName: string; pickup: string; destination: string }): BookingRecord {
    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: randomUUID(), code: createBookingCode(), customerName: input.customerName, pickup: input.pickup, destination: input.destination,
      status: 'pending', version: 1, timeline: [{ status: 'pending', actor: 'customer', at: now, note: 'Booking created' }], createdAt: now, updatedAt: now,
      tracking: { etaMinutes: null, lastKnownLocation: null, routePolyline: null, gpsProvider: 'future', updatedAt: now }
    };
    bookings.set(booking.id, booking); emit('booking.created', booking); return booking;
  },

  listBookings: () => Array.from(bookings.values()),
  listDriverStates: () => Array.from(driverStates.values()),

  assignDriver(params: { bookingId: string; driverId: string; driverName: string; idempotencyKey?: string }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    const driver = driverStates.get(params.driverId);
    if (!driver || !['available', 'completed'].includes(driver.state) || driver.activeBookingId) throw new Error('DRIVER_NOT_ASSIGNABLE');
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return booking;
    if (!['confirmed', 'available', 'assigned'].includes(booking.status)) throw new Error('INVALID_TRANSITION');
    const now = new Date().toISOString();
    booking.assignedDriverId = params.driverId; booking.assignedDriverName = params.driverName; booking.assignmentOfferedAt = now; booking.assignmentExpiresAt = new Date(Date.now() + ASSIGNMENT_TTL_MS).toISOString();
    booking.status = 'assigned'; booking.version += 1; booking.updatedAt = now;
    booking.timeline.push({ status: 'assigned', actor: 'admin', at: now, note: `Driver ${params.driverName} assigned` });
    driverStates.set(params.driverId, { ...driver, state: 'assigned', activeBookingId: booking.id, lastUpdatedAt: now });
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit('booking.updated', booking); emit('driver.assigned', booking); emit('driver.status.updated', driverStates.get(params.driverId)); emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: now });
    return booking;
  },

  driverRespondToAssignment(params: { bookingId: string; driverId: string; action: 'accept' | 'reject' }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (booking.assignedDriverId !== params.driverId) throw new Error('DRIVER_MISMATCH');
    const now = new Date().toISOString();
    if (params.action === 'reject') {
      booking.status = 'available'; booking.version += 1; booking.updatedAt = now; booking.timeline.push({ status: 'available', actor: 'driver', at: now, note: 'Driver rejected assignment' });
      releaseDriver(params.driverId);
    } else {
      if (booking.assignmentExpiresAt && new Date(booking.assignmentExpiresAt).getTime() < Date.now()) throw new Error('ASSIGNMENT_EXPIRED');
      booking.status = 'onderweg'; booking.version += 1; booking.updatedAt = now; booking.timeline.push({ status: 'onderweg', actor: 'driver', at: now, note: 'Driver accepted assignment' });
      const driver = driverStates.get(params.driverId);
      if (driver) driverStates.set(params.driverId, { ...driver, state: 'onderweg', activeBookingId: booking.id, lastUpdatedAt: now });
    }
    emit('booking.updated', booking); emit('booking.lifecycle.changed', booking); emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: now });
    return booking;
  },

  transitionStatus(params: { bookingId: string; nextStatus: BookingLifecycleStatus; actor: BookingActor }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (booking.status === params.nextStatus) return booking;
    if (!allowedTransitions[booking.status].includes(params.nextStatus)) throw new Error('INVALID_TRANSITION');
    const now = new Date().toISOString();
    booking.status = params.nextStatus; booking.version += 1; booking.updatedAt = now; booking.timeline.push({ status: params.nextStatus, actor: params.actor, at: now });
    if (['completed', 'cancelled', 'failed'].includes(params.nextStatus)) releaseDriver(booking.assignedDriverId);
    emit('booking.updated', booking); emit('booking.lifecycle.changed', booking); emit('admin.live.updated', { bookingId: booking.id, status: booking.status, at: now });
    return booking;
  },

  updateDriverState(params: { driverId: string; state: DriverState; bookingId?: string; location?: { lat: number; lng: number }; rating?: number }): DriverRealtimeState {
    const now = new Date().toISOString();
    const existing = driverStates.get(params.driverId);
    if (params.state !== 'available' && !params.bookingId && existing?.activeBookingId) params.bookingId = existing.activeBookingId;
    const next: DriverRealtimeState = { driverId: params.driverId, state: params.state, activeBookingId: params.bookingId, lastUpdatedAt: now, location: existing?.location, rating: typeof params.rating === 'number' ? params.rating : existing?.rating };
    if (params.location) next.location = { ...params.location, capturedAt: now };
    driverStates.set(params.driverId, next);
    emit('driver.status.updated', next); emit('admin.live.updated', { driverId: params.driverId, state: params.state, bookingId: params.bookingId, at: now });
    return next;
  },

  prepareDriverAssignment(input: AssignmentPreparationInput): { bookingId: string; candidates: AssignmentCandidate[] } {
    const booking = bookings.get(input.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    const activeRideCounts = new Map<string, number>();
    for (const b of bookings.values()) if (b.assignedDriverId && ['assigned', 'onderweg', 'arrived', 'in_progress'].includes(b.status)) activeRideCounts.set(b.assignedDriverId, (activeRideCounts.get(b.assignedDriverId) ?? 0) + 1);
    const stateScoreMap: Record<DriverState, number> = { offline: 0, available: 1, assigned: 0.1, onderweg: 0, arrived: 0, in_progress: 0, completed: 0.5 };
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
      const driverStateScore = stateScoreMap[driver.state];
      const ratingScore = typeof driver.rating === 'number' ? Math.min(1, Math.max(0, driver.rating / 5)) : 0.5;
      return {
        driverId: driver.driverId, distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)), etaMinutes, assignmentEligible,
        notEligibleReason: assignmentEligible ? undefined : isStale ? 'stale_driver_presence' : driver.state !== 'available' ? 'driver_busy_or_offline' : 'active_ride_exists',
        availabilityScore, activeRidesScore, driverStateScore, ratingScore, etaScore,
        totalScore: Number((distanceScore * 0.35 + etaScore * 0.2 + availabilityScore * 0.2 + activeRidesScore * 0.15 + driverStateScore * 0.05 + ratingScore * 0.05).toFixed(4)),
        activeRides, state: driver.state, rating: driver.rating ?? null, locationKnown: Boolean(driver.location)
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
    return { bookingId: booking.id, candidates: candidates.slice(0, input.maxCandidates ?? 10) };
  },

  cleanupStaleAssignments(): { releasedAssignments: string[] } {
    const now = Date.now();
    const released: string[] = [];
    for (const booking of bookings.values()) {
      if (booking.status !== 'assigned' || !booking.assignmentExpiresAt) continue;
      if (new Date(booking.assignmentExpiresAt).getTime() > now) continue;
      booking.status = 'available'; booking.version += 1; booking.updatedAt = new Date().toISOString();
      booking.timeline.push({ status: 'available', actor: 'system', at: booking.updatedAt, note: 'Assignment timed out and was recycled' });
      releaseDriver(booking.assignedDriverId);
      released.push(booking.id);
      emit('booking.updated', booking);
    }
    return { releasedAssignments: released };
  },

  restoreDriverAssignments(driverId: string): { recoveredBookings: BookingRecord[]; driverState: DriverRealtimeState | null } {
    const recovered = Array.from(bookings.values()).filter((booking) => booking.assignedDriverId === driverId && ['assigned', 'onderweg', 'arrived', 'in_progress'].includes(booking.status));
    const latest = recovered[recovered.length - 1];
    if (latest) this.updateDriverState({ driverId, state: latest.status === 'assigned' ? 'assigned' : (latest.status as DriverState), bookingId: latest.id });
    return { recoveredBookings: recovered, driverState: driverStates.get(driverId) ?? null };
  },

  updateDriverLocation(params: DriverLocationUpdate) {
    const now = new Date().toISOString();
    const current = driverStates.get(params.driverId);
    const next: DriverRealtimeState = {
      driverId: params.driverId, state: current?.state ?? 'available', activeBookingId: params.bookingId ?? current?.activeBookingId,
      location: { lat: params.lat, lng: params.lng, heading: params.heading, accuracy: params.accuracy, speed: params.speed, capturedAt: params.capturedAt ?? now },
      lastUpdatedAt: now, rating: current?.rating
    };
    driverStates.set(params.driverId, next);
    emit('driver.location.updated', { driverId: params.driverId, bookingId: next.activeBookingId, location: next.location, at: now });
    return next;
  },

  getDispatchDiagnostics() {
    const staleAssignments = Array.from(bookings.values()).filter((booking) => booking.status === 'assigned' && booking.assignmentExpiresAt && new Date(booking.assignmentExpiresAt).getTime() <= Date.now());
    const staleDrivers = Array.from(driverStates.values()).filter((driver) => Date.now() - new Date(driver.lastUpdatedAt).getTime() > DRIVER_STALE_MS);
    return { totalBookings: bookings.size, totalDrivers: driverStates.size, staleAssignments: staleAssignments.map((b) => b.id), staleDrivers: staleDrivers.map((d) => d.driverId) };
  }
};
