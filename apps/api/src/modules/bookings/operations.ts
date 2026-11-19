import { createHash, randomUUID } from 'node:crypto';
import type { VerifiedIdentity } from '../../auth/middleware/authenticate.js';
import { CANONICAL_ALLOWED_TRANSITIONS, TERMINAL_BOOKING_STATUSES, type CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';
import type { BookingRecord } from './dto.js';
import { fileBookingRepository, type FileBookingRepository, type BookingStore, type OperationReceipt, type OperationalDriver } from './repository.js';

export class BookingOperationError extends Error {
  constructor(public readonly status: number, public readonly code: string) { super(code); }
}
function requireValue(condition: unknown, status: number, code: string): asserts condition {
  if (!condition) throw new BookingOperationError(status, code);
}
function text(value: unknown, max: number): string {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max, 400, 'INVALID_FIELD');
  return value.trim();
}
function fields(value: unknown, required: string[]) : asserts value is Record<string, unknown> {
  requireValue(value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === required.length && required.every(key => Object.hasOwn(value, key)), 400, 'INVALID_FIELDS');
}
const isAdmin = (actor: VerifiedIdentity) => actor.status === 'active' && ['admin', 'super_admin'].includes(actor.role);
const active = (booking: BookingRecord) => !TERMINAL_BOOKING_STATUSES.has(booking.lifecycle.state);
export const DRIVER_PRESENCE_TTL_MS = 120_000;

/** Domain operations use the persisted public booking, not another booking Map. */
export function createBookingOperations(
  repository: FileBookingRepository = fileBookingRepository,
  resolveDriver: (id: string) => Promise<{ id: string; name: string }> = async () => { throw new BookingOperationError(503, 'DRIVER_DIRECTORY_UNAVAILABLE'); },
  now: () => Date = () => new Date(),
) {
  // Live observations are deliberately ephemeral; business state remains in JSON.
  const trackingSessions = new Map<string, string>();
  const locations = new Map<string, { lat: number; lng: number; accuracy?: number;
    capturedAt: string; receivedAt: string; evidence: 'DEVICE_REPORTED' }>();
  function locationFor(booking: BookingRecord) {
    const location = locations.get(booking.id);
    const age = location ? now().getTime() - Date.parse(location.receivedAt) : NaN;
    if (!trackingSessions.has(booking.id) || !active(booking) || !Number.isFinite(age) || age < 0 || age > 120_000) {
      locations.delete(booking.id); return null;
    }
    return location ?? null;
  }
  function requireAdmin(actor: VerifiedIdentity) { requireValue(isAdmin(actor), 403, 'ADMIN_REQUIRED'); }
  function requireDriver(actor: VerifiedIdentity) { requireValue(actor.status === 'active' && actor.role === 'driver', 403, 'DRIVER_REQUIRED'); }
  function bookingView(booking: BookingRecord, includeEmail = false) {
    return { id: booking.id, referenceCode: booking.referenceCode, pickup: booking.pickup,
      destination: booking.destination, scheduleAt: booking.scheduleAt, serviceType: booking.serviceType,
      customerName: booking.customerName, customerPhone: booking.customerPhone, notes: booking.notes,
      ...(includeEmail ? { customerEmail: booking.customerEmail } : {}), status: booking.lifecycle.state, version: booking.lifecycle.version,
      assignment: booking.assignment ?? null, location: locationFor(booking),
      transitions: booking.lifecycle.transitions.map(entry => ({ ...entry })) };
  }
  function visible(actor: VerifiedIdentity, booking: BookingRecord) {
    return isAdmin(actor) || (actor.status === 'active' && actor.role === 'driver' && booking.assignment?.driverId === actor.userId);
  }
  function driverView(store: BookingStore, driver: OperationalDriver) {
    const assigned = store.bookings.find(item => active(item) && item.assignment
      && (item.assignment.driverId === driver.id || item.assignment.vehicleId === driver.vehicleId));
    const age = now().getTime() - Date.parse(driver.lastSeenAt);
    const fresh = Number.isFinite(age) && age >= 0 && age <= DRIVER_PRESENCE_TTL_MS;
    return { ...driver, desired_state: driver.availability,
      status: !fresh ? 'unknown' : assigned ? 'busy' : driver.availability,
      activeBookingId: assigned?.id ?? null };
  }
  function recordTransition(booking: BookingRecord, state: CanonicalBookingLifecycleStatus, actor: VerifiedIdentity, operationId: string) {
    const previous = booking.lifecycle.state;
    requireValue(CANONICAL_ALLOWED_TRANSITIONS[previous]?.has(state), 409, 'INVALID_TRANSITION');
    booking.status = state;
    booking.lifecycle.state = state;
    booking.lifecycle.version++;
    booking.lifecycle.transitions.push({ from: previous, to: state, occurredAt: now().toISOString(),
      actor: isAdmin(actor) ? 'admin' : actor.role === 'customer' ? 'customer' : 'driver', metadata: { actor_id: actor.userId, actor_role: actor.role,
        operation_id: operationId, policy: 'booking-operations/v1',
        ...(booking.assignment ? { driver_id: booking.assignment.driverId, vehicle_id: booking.assignment.vehicleId } : {}) } });
  }
  function command(actor: VerifiedIdentity, bookingId: string, key: unknown, body: Record<string, unknown>,
    kind: string, apply: (store: BookingStore, booking: BookingRecord, operationId: string) => void,
    canAccess: (booking: BookingRecord) => boolean = booking => visible(actor, booking)) {
    const requestKey = text(key, 256);
    requireValue(/^[A-Za-z0-9_.:-]{8,256}$/.test(requestKey), 400, 'INVALID_IDEMPOTENCY_KEY');
    requireValue(Number.isSafeInteger(body.expectedVersion) && Number(body.expectedVersion) >= 1, 400, 'EXPECTED_VERSION_REQUIRED');
    const digest = createHash('sha256').update(JSON.stringify({ actor: actor.userId, kind, bookingId,
      body: Object.fromEntries(Object.entries(body).sort(([a], [b]) => a.localeCompare(b))) })).digest('hex');
    const receiptKey = createHash('sha256').update(actor.userId + ':' + requestKey).digest('hex');
    const result = repository.transact(store => {
      const booking = store.bookings.find(item => item.id === bookingId);
      requireValue(booking, 404, 'BOOKING_NOT_FOUND');
      requireValue(canAccess(booking), 403, 'BOOKING_ACCESS_DENIED');
      const previous = store.operations?.[receiptKey];
      if (previous) {
        requireValue(previous.digest === digest, 409, 'IDEMPOTENCY_CONFLICT');
        return { operation: previous.receipt, booking, replayed: true };
      }
      requireValue(booking.lifecycle.version === body.expectedVersion, 409, 'VERSION_CONFLICT');
      requireValue(active(booking), 409, 'TERMINAL_BOOKING');
      requireValue(Object.keys(store.operations ?? {}).length < 50_000, 503, 'OPERATION_STORE_REVIEW_REQUIRED');
      const operationId = randomUUID();
      apply(store, booking, operationId);
      const receipt: OperationReceipt = { id: operationId, bookingId, version: booking.lifecycle.version,
        state: booking.lifecycle.state, appliedAt: now().toISOString() };
      (store.operations ??= {})[receiptKey] = { digest, receipt };
      return { operation: receipt, booking, replayed: false };
    });
    // A failed write leaves the booking active and must preserve its GPS session.
    if (!active(result.booking)) {
      locations.delete(bookingId);
      trackingSessions.delete(bookingId);
    }
    return { ...result, booking: bookingView(result.booking, isAdmin(actor)) };
  }
  return {
    listCustomerBookings(actor: VerifiedIdentity) {
      requireValue(actor.status === 'active', 401, 'AUTHENTICATION_REQUIRED');
      const store = repository.snapshot();
      return store.bookings.filter(booking => booking.customerIdentityVerified === true && booking.customerId === actor.userId)
        .map(booking => ({ id: booking.id, referenceCode: booking.referenceCode, pickup: booking.pickup,
          destination: booking.destination, scheduleAt: booking.scheduleAt,
          status: booking.lifecycle.state, version: booking.lifecycle.version, location: locationFor(booking),
          assignment: booking.assignment ? {
            driverName: store.drivers?.[booking.assignment.driverId]?.name,
            vehicleRegistration: store.vehicles?.[booking.assignment.vehicleId]?.registration,
          } : null }));
    },
    setLocation(actor: VerifiedIdentity, bookingId: string, body: unknown) {
      requireDriver(actor);
      requireValue(body && typeof body === 'object' && !Array.isArray(body), 400, 'INVALID_FIELDS');
      const request = body as Record<string, unknown>;
      const booking = repository.snapshot().bookings.find(item => item.id === bookingId);
      requireValue(booking, 404, 'BOOKING_NOT_FOUND');
      requireValue(booking.assignment?.driverId === actor.userId, 403, 'BOOKING_ACCESS_DENIED');
      if (Object.hasOwn(request, 'sharing')) {
        requireValue(typeof request.sharing === 'boolean', 400, 'INVALID_FIELDS');
        if (request.sharing === false) {
          fields(request, ['sharing', 'sessionId']);
          requireValue(typeof request.sessionId === 'string', 400, 'INVALID_FIELDS');
          if (trackingSessions.get(bookingId) === request.sessionId) {
            trackingSessions.delete(bookingId); locations.delete(bookingId);
          }
          return { sharing: false, sessionId: request.sessionId };
        }
        fields(request, ['sharing']);
        requireValue(active(booking), 409, 'LOCATION_SHARING_UNAVAILABLE');
        locations.delete(bookingId);
        const sessionId = randomUUID(); trackingSessions.set(bookingId, sessionId);
        return { sharing: true, sessionId };
      }
      fields(request, ['sessionId', 'position']);
      requireValue(active(booking) && typeof request.sessionId === 'string'
        && trackingSessions.get(bookingId) === request.sessionId, 409, 'LOCATION_SHARING_UNAVAILABLE');
      const position = request.position as Record<string, unknown>;
      requireValue(position && typeof position === 'object' && !Array.isArray(position)
        && Object.keys(position).every(key => ['lat', 'lng', 'accuracy', 'heading', 'speed', 'capturedAt'].includes(key)), 400, 'INVALID_LOCATION');
      requireValue(typeof position.lat === 'number' && Number.isFinite(position.lat) && Math.abs(position.lat) <= 90
        && typeof position.lng === 'number' && Number.isFinite(position.lng) && Math.abs(position.lng) <= 180, 400, 'INVALID_LOCATION');
      requireValue(position.accuracy === undefined || (typeof position.accuracy === 'number' && Number.isFinite(position.accuracy) && position.accuracy >= 0), 400, 'INVALID_LOCATION');
      const captured = typeof position.capturedAt === 'string' ? Date.parse(position.capturedAt) : NaN;
      const age = now().getTime() - captured;
      requireValue(Number.isFinite(age) && age >= -30_000 && age <= 120_000, 409, 'STALE_LOCATION');
      const previous = locations.get(bookingId);
      if (previous && Date.parse(previous.capturedAt) >= captured) return { sharing: true, sessionId: request.sessionId, location: previous, duplicate: true };
      const location = { lat: position.lat, lng: position.lng,
        ...(typeof position.accuracy === 'number' ? { accuracy: position.accuracy } : {}),
        capturedAt: new Date(captured).toISOString(), receivedAt: now().toISOString(), evidence: 'DEVICE_REPORTED' as const };
      locations.set(bookingId, location);
      return { sharing: true, sessionId: request.sessionId, location, duplicate: false };
    },
    listBookings(actor: VerifiedIdentity) {
      requireValue(actor.status === 'active' && (isAdmin(actor) || actor.role === 'driver'), 403, 'OPERATIONS_ACCESS_DENIED');
      return repository.snapshot().bookings.filter(booking => visible(actor, booking)).map(booking => bookingView(booking, isAdmin(actor)));
    },
    listVehicles(actor: VerifiedIdentity) {
      requireValue(actor.status === 'active' && (isAdmin(actor) || actor.role === 'driver'), 403, 'OPERATIONS_ACCESS_DENIED');
      return Object.values(repository.snapshot().vehicles ?? {});
    },
    createVehicle(actor: VerifiedIdentity, body: unknown) {
      requireAdmin(actor); fields(body, ['registration', 'name', 'fleetType']);
      const registration = text(body.registration, 24).toUpperCase().replace(/\s+/g, '');
      requireValue(/^[A-Z0-9-]{2,24}$/.test(registration), 400, 'INVALID_REGISTRATION');
      const name = text(body.name, 100);
      requireValue(body.fleetType === 'own' || body.fleetType === 'external', 400, 'INVALID_FLEET_TYPE');
      return repository.transact(store => {
        const existing = Object.values(store.vehicles ?? {}).find(item => item.registration === registration);
        if (existing) { requireValue(existing.name === name && existing.fleetType === body.fleetType, 409, 'VEHICLE_CONFLICT'); return existing; }
        const vehicle = { id: randomUUID(), registration, name, fleetType: body.fleetType as 'own' | 'external', enabled: true };
        (store.vehicles ??= {})[vehicle.id] = vehicle;
        return vehicle;
      });
    },
    async presence(actor: VerifiedIdentity, body: unknown) {
      requireDriver(actor); fields(body, ['availability', 'vehicleId']);
      requireValue(body.availability === 'available' || body.availability === 'unavailable', 400, 'INVALID_AVAILABILITY');
      const vehicleId = text(body.vehicleId, 80);
      const account = await resolveDriver(actor.userId);
      requireValue(account.id === actor.userId, 403, 'DRIVER_IDENTITY_MISMATCH');
      return repository.transact(store => {
        requireValue(store.vehicles?.[vehicleId]?.enabled, 409, 'VEHICLE_UNAVAILABLE');
        const current = store.drivers && Object.hasOwn(store.drivers, actor.userId) ? store.drivers[actor.userId] : undefined;
        const assigned = store.bookings.find(item => active(item) && item.assignment?.driverId === actor.userId);
        requireValue(!assigned || assigned.assignment?.vehicleId === vehicleId, 409, 'ACTIVE_VEHICLE_CHANGE_DENIED');
        const timestamp = now().toISOString();
        const changed = !current || current.availability !== body.availability || current.vehicleId !== vehicleId;
        const driver = { id: actor.userId, name: account.name, vehicleId,
          availability: body.availability as 'available' | 'unavailable', lastSeenAt: timestamp,
          lastChangeAt: changed ? timestamp : current.lastChangeAt };
        store.drivers = { ...store.drivers, [actor.userId]: driver };
        return driver;
      });
    },
    async heartbeat(actor: VerifiedIdentity, body: unknown) {
      requireDriver(actor); fields(body, ['vehicleId']);
      const vehicleId = text(body.vehicleId, 80);
      const account = await resolveDriver(actor.userId);
      requireValue(account.id === actor.userId, 403, 'DRIVER_IDENTITY_MISMATCH');
      return repository.transact(store => {
        const driver = store.drivers && Object.hasOwn(store.drivers, actor.userId) ? store.drivers[actor.userId] : undefined;
        requireValue(driver && driver.vehicleId === vehicleId, 409, 'PRESENCE_NOT_REGISTERED');
        // Heartbeats only observe presence; they never turn desired availability on.
        driver.lastSeenAt = now().toISOString();
        return driver;
      });
    },
    listDrivers(actor: VerifiedIdentity) {
      requireAdmin(actor);
      const store = repository.snapshot();
      return Object.values(store.drivers ?? {}).map(driver => driverView(store, driver));
    },
    ownDriver(actor: VerifiedIdentity) {
      requireDriver(actor);
      const store = repository.snapshot();
      const driver = store.drivers && Object.hasOwn(store.drivers, actor.userId) ? store.drivers[actor.userId] : undefined;
      return driver ? driverView(store, driver) : null;
    },
    async assign(actor: VerifiedIdentity, bookingId: string, body: unknown, key: unknown) {
      requireAdmin(actor); fields(body, ['driverId', 'expectedVersion']);
      const driverId = text(body.driverId, 128);
      const account = await resolveDriver(driverId);
      requireValue(account.id === driverId, 403, 'DRIVER_IDENTITY_MISMATCH');
      return command(actor, bookingId, key, body, 'assign', (store, booking, operationId) => {
        requireValue(booking.lifecycle.state === 'pending' && !booking.assignment, 409, 'BOOKING_ALREADY_ASSIGNED');
        const driver = store.drivers?.[driverId];
        const age = driver ? now().getTime() - Date.parse(driver.lastSeenAt) : NaN;
        requireValue(driver?.availability === 'available' && Number.isFinite(age) && age >= 0 && age <= DRIVER_PRESENCE_TTL_MS, 409, 'DRIVER_UNAVAILABLE');
        requireValue(store.vehicles?.[driver.vehicleId]?.enabled, 409, 'VEHICLE_UNAVAILABLE');
        const busy = store.bookings.some(item => active(item) && item.assignment
          && (item.assignment.driverId === driverId || item.assignment.vehicleId === driver.vehicleId));
        requireValue(!busy, 409, 'DRIVER_OR_VEHICLE_BUSY');
        booking.assignment = { driverId, vehicleId: driver.vehicleId, assignedAt: now().toISOString(), assignedBy: actor.userId };
        recordTransition(booking, 'assigned', actor, operationId);
      });
    },
    transition(actor: VerifiedIdentity, bookingId: string, body: unknown, key: unknown) {
      requireValue(actor.status === 'active' && (isAdmin(actor) || actor.role === 'driver'), 403, 'OPERATIONS_ACCESS_DENIED');
      fields(body, ['status', 'expectedVersion']);
      const status = body.status;
      const allowed = isAdmin(actor) ? ['cancelled'] : ['accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'];
      requireValue(typeof status === 'string' && allowed.includes(status), 403, 'TRANSITION_NOT_GRANTED');
      return command(actor, bookingId, key, body, 'transition', (_store, booking, operationId) => {
        recordTransition(booking, status as CanonicalBookingLifecycleStatus, actor, operationId);
      });
    },
    cancelOwn(actor: VerifiedIdentity, bookingId: string, body: unknown, key: unknown) {
      requireValue(actor.status === 'active', 401, 'AUTHENTICATION_REQUIRED');
      fields(body, ['expectedVersion']);
      return command(actor, bookingId, key, body, 'customer_cancel', (_store, booking, operationId) => {
        requireValue(booking.lifecycle.state === 'pending', 409, 'CUSTOMER_CANCELLATION_REQUIRES_SUPPORT');
        recordTransition(booking, 'cancelled', actor, operationId);
      }, booking => booking.customerIdentityVerified === true && booking.customerId === actor.userId);
    },
  };
}
