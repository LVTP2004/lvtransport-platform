import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';
import {
  BOOKING_LIFECYCLE,
  type BookingActor,
  type BookingLifecycleStatus,
  bookingOperationalState,
  realtimeOperationalEvents
} from './booking-operational-state.service.js';

export { BOOKING_LIFECYCLE };

export type BookingTimelineEntry = { status: BookingLifecycleStatus; actor: BookingActor; at: string; note?: string };
export type BookingRecord = { id: string; code: string; customerName: string; pickup: string; destination: string; status: BookingLifecycleStatus; assignedDriverId?: string; assignedDriverName?: string; version: number; timeline: BookingTimelineEntry[]; createdAt: string; updatedAt: string; tracking: { etaMinutes: number | null; lastKnownLocation: { lat: number; lng: number; heading?: number } | null; routePolyline: string | null; gpsProvider: 'none' | 'future'; updatedAt: string } };

export const DRIVER_STATES = ['available', 'assigned', 'onderweg', 'arrived', 'in_progress', 'completed'] as const;
export type DriverState = (typeof DRIVER_STATES)[number];
export type DriverRealtimeState = { driverId: string; state: DriverState; activeBookingId?: string; lastUpdatedAt: string; location?: { lat: number; lng: number }; rating?: number };

type RealtimeSocket = WebSocket & { isAlive?: boolean };
const bookingEvents = new EventEmitter();
const bookings = new Map<string, BookingRecord>();
const idempotencyKeys = new Set<string>();
const websocketClients = new Set<WebSocket>();
const driverStates = new Map<string, DriverRealtimeState>();
const eventReplayBuffer: string[] = [];
let eventSequence = 0;
let heartbeatInterval: NodeJS.Timeout | undefined;

const emit = (event: string, payload: unknown) => {
  const envelope = JSON.stringify({ event, payload, at: new Date().toISOString(), sequence: ++eventSequence });
  eventReplayBuffer.push(envelope);
  if (eventReplayBuffer.length > 250) eventReplayBuffer.splice(0, eventReplayBuffer.length - 250);
  for (const client of websocketClients) if (client.readyState === client.OPEN) client.send(envelope);
  bookingEvents.emit(event, payload);
};

const createBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;
const parseLastSequenceFromUrl = (url?: string): number | null => {
  if (!url) return null;
  const parsed = new URLSearchParams(url.split('?')[1] ?? '').get('lastSequence');
  const n = Number(parsed);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const realtimeOrchestratorService = {
  initialize(): void {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      for (const socket of websocketClients) {
        const client = socket as RealtimeSocket;
        if (client.isAlive === false) { socket.terminate(); websocketClients.delete(socket); continue; }
        client.isAlive = false; socket.ping();
      }
    }, 30000);
  },
  registerClient(socket: WebSocket): void {
    const client = socket as RealtimeSocket; client.isAlive = true; websocketClients.add(socket);
    socket.on('pong', () => { client.isAlive = true; }); socket.on('close', () => websocketClients.delete(socket));
    const last = parseLastSequenceFromUrl((socket as unknown as { url?: string }).url);
    if (last) for (const replayEvent of eventReplayBuffer) if ((JSON.parse(replayEvent).sequence ?? 0) > last) socket.send(replayEvent);
    socket.send(JSON.stringify({ event: realtimeOperationalEvents.bookingSnapshot, payload: Array.from(bookings.values()), sequence: eventSequence }));
    socket.send(JSON.stringify({ event: realtimeOperationalEvents.driverSnapshot, payload: Array.from(driverStates.values()), sequence: eventSequence }));
  },
  on(event: string, handler: (payload: unknown) => void): void { bookingEvents.on(event, handler); },
  createBooking(input: { customerName: string; pickup: string; destination: string }): BookingRecord {
    const now = new Date().toISOString();
    const booking: BookingRecord = { id: randomUUID(), code: createBookingCode(), customerName: input.customerName, pickup: input.pickup, destination: input.destination, status: 'pending', version: 1, timeline: [{ status: 'pending', actor: 'customer', at: now, note: 'Booking created' }], createdAt: now, updatedAt: now, tracking: { etaMinutes: null, lastKnownLocation: null, routePolyline: null, gpsProvider: 'future', updatedAt: now } };
    bookings.set(booking.id, booking); emit(realtimeOperationalEvents.bookingCreated, booking); return booking;
  },
  listBookings(): BookingRecord[] { return Array.from(bookings.values()); },
  assignDriver(params: { bookingId: string; driverId: string; driverName: string; idempotencyKey?: string }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return booking;
    const result = bookingOperationalState.transition(booking.status, 'assigned');
    if (result.outcome === 'rejected_invalid_transition') throw new Error('INVALID_TRANSITION');
    if (result.outcome === 'applied') { booking.status = result.status; booking.version += 1; booking.updatedAt = new Date().toISOString(); booking.timeline.push({ status: 'assigned', actor: 'admin', at: booking.updatedAt, note: `Driver ${params.driverName} assigned` }); }
    booking.assignedDriverId = params.driverId; booking.assignedDriverName = params.driverName;
    driverStates.set(params.driverId, { driverId: params.driverId, state: 'assigned', activeBookingId: booking.id, lastUpdatedAt: booking.updatedAt });
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit(realtimeOperationalEvents.bookingUpdated, booking); emit(realtimeOperationalEvents.driverAssigned, booking); emit(realtimeOperationalEvents.driverStatusUpdated, driverStates.get(params.driverId)); emit(realtimeOperationalEvents.adminLiveUpdated, { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: booking.updatedAt }); return booking;
  },
  transitionStatus(params: { bookingId: string; nextStatus: BookingLifecycleStatus; actor: BookingActor; idempotencyKey?: string; expectedVersion?: number }): BookingRecord {
    const booking = bookings.get(params.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return booking;
    if (typeof params.expectedVersion === 'number' && params.expectedVersion !== booking.version) throw new Error('VERSION_CONFLICT');
    const result = bookingOperationalState.transition(booking.status, params.nextStatus);
    if (result.outcome === 'rejected_invalid_transition') throw new Error('INVALID_TRANSITION');
    if (result.outcome === 'applied') { booking.status = result.status; booking.version += 1; booking.updatedAt = new Date().toISOString(); booking.timeline.push({ status: result.status, actor: params.actor, at: booking.updatedAt }); }
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit(realtimeOperationalEvents.bookingUpdated, booking); emit(realtimeOperationalEvents.bookingLifecycleChanged, booking); emit(realtimeOperationalEvents.adminLiveUpdated, { bookingId: booking.id, status: booking.status, at: booking.updatedAt }); return booking;
  },

  updateDriverState(params: { driverId: string; state: DriverState; bookingId?: string; idempotencyKey?: string; location?: { lat: number; lng: number }; rating?: number }): DriverRealtimeState {
    if (params.idempotencyKey && idempotencyKeys.has(params.idempotencyKey)) return driverStates.get(params.driverId) ?? { driverId: params.driverId, state: params.state, lastUpdatedAt: new Date().toISOString() };
    const now = new Date().toISOString();
    const existing = driverStates.get(params.driverId);
    const next: DriverRealtimeState = { driverId: params.driverId, state: params.state, activeBookingId: params.bookingId, lastUpdatedAt: now, location: params.location ?? existing?.location, rating: typeof params.rating === 'number' ? params.rating : existing?.rating };
    driverStates.set(params.driverId, next);
    if (params.bookingId) {
      const booking = bookings.get(params.bookingId);
      if (booking && booking.assignedDriverId === params.driverId) {
        const mappedStatus = (params.state === 'available' ? 'available' : params.state) as BookingLifecycleStatus;
        const result = bookingOperationalState.transition(booking.status, mappedStatus);
        if (result.outcome === 'applied') {
          booking.status = result.status; booking.version += 1; booking.updatedAt = now;
          booking.timeline.push({ status: result.status, actor: 'driver', at: now, note: 'Synced from driver state' });
          emit(realtimeOperationalEvents.bookingUpdated, booking); emit(realtimeOperationalEvents.bookingLifecycleChanged, booking);
        }
      }
    }
    if (params.idempotencyKey) idempotencyKeys.add(params.idempotencyKey);
    emit(realtimeOperationalEvents.driverStatusUpdated, next); emit(realtimeOperationalEvents.adminLiveUpdated, { driverId: params.driverId, state: params.state, bookingId: params.bookingId, at: now });
    return next;
  },
  prepareDriverAssignment(input: { bookingId: string; pickupLocation: { lat: number; lng: number } }): { bookingId: string; candidates: Array<{ driverId: string; distanceKm: number | null; totalScore: number; state: DriverState; locationKnown: boolean }> } {
    const booking = bookings.get(input.bookingId); if (!booking) throw new Error('BOOKING_NOT_FOUND');
    const toRad = (v:number)=>(v*Math.PI)/180; const dist=(a:{lat:number;lng:number},b:{lat:number;lng:number})=>{const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng),la1=toRad(a.lat),la2=toRad(b.lat);const x=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
    const candidates = Array.from(driverStates.values()).map((driver)=>{const distanceKm=driver.location?dist(input.pickupLocation,driver.location):null; const availability=driver.state==='available'?1:0.3; const distanceScore=distanceKm===null?0.2:Math.max(0,1-distanceKm/20); return { driverId: driver.driverId, distanceKm: distanceKm===null?null:Number(distanceKm.toFixed(2)), totalScore: Number((availability*0.6+distanceScore*0.4).toFixed(4)), state: driver.state, locationKnown: Boolean(driver.location)};}).sort((a,b)=>b.totalScore-a.totalScore);
    return { bookingId: booking.id, candidates };
  },
  listDriverStates(): DriverRealtimeState[] { return Array.from(driverStates.values()); }
};
