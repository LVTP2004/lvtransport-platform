export type DispatchBookingStatus =
  | 'pending'
  | 'assigned'
  | 'driver_accepted'
  | 'driver_rejected'
  | 'driver_arriving'
  | 'passenger_onboard'
  | 'completed'
  | 'cancelled';

export type DriverAvailabilityStatus = 'offline' | 'available' | 'on_assignment';

export interface DispatchAssignment {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: DispatchBookingStatus;
  history: DispatchEvent[];
  assignmentAttempts: number;
  updatedAt: string;
}

export interface DispatchEvent {
  type:
    | 'admin_assigned'
    | 'driver_accepted'
    | 'driver_rejected'
    | 'assignment_failed'
    | 'booking_status_updated';
  actorId: string;
  occurredAt: string;
  note?: string;
}

export interface DispatchStateSnapshot {
  bookings: DispatchAssignment[];
  driverAvailability: Record<string, DriverAvailabilityStatus>;
}

const listeners = new Set<(snapshot: DispatchStateSnapshot) => void>();
const assignments = new Map<string, DispatchAssignment>();
const driverAvailability = new Map<string, DriverAvailabilityStatus>();

const now = () => new Date().toISOString();

const emitState = () => {
  const snapshot = getDispatchSnapshot();
  listeners.forEach((listener) => listener(snapshot));
};

const pushHistory = (assignment: DispatchAssignment, event: DispatchEvent): void => {
  assignment.history.push(event);
  assignment.updatedAt = event.occurredAt;
};

export const dispatchMvpStore = {
  upsertPendingBooking(bookingId: string, customerId: string): DispatchAssignment {
    const existing = assignments.get(bookingId);
    if (existing) {
      return existing;
    }

    const created: DispatchAssignment = {
      bookingId,
      customerId,
      status: 'pending',
      history: [
        { type: 'booking_status_updated', actorId: 'system', occurredAt: now(), note: 'booking pending' },
      ],
      assignmentAttempts: 0,
      updatedAt: now(),
    };

    assignments.set(bookingId, created);
    emitState();
    return created;
  },

  assignDriver(bookingId: string, customerId: string, driverId: string, actorId = 'admin'): DispatchAssignment {
    const assignment = this.upsertPendingBooking(bookingId, customerId);
    assignment.driverId = driverId;
    assignment.status = 'assigned';
    assignment.assignmentAttempts += 1;

    pushHistory(assignment, {
      type: 'admin_assigned',
      actorId,
      occurredAt: now(),
      note: `assigned to ${driverId}`,
    });

    driverAvailability.set(driverId, 'on_assignment');
    emitState();
    return assignment;
  },

  driverRespond(bookingId: string, driverId: string, decision: 'accept' | 'reject'): DispatchAssignment | undefined {
    const assignment = assignments.get(bookingId);
    if (!assignment || assignment.driverId !== driverId) {
      return undefined;
    }

    if (decision === 'accept') {
      assignment.status = 'driver_accepted';
      pushHistory(assignment, { type: 'driver_accepted', actorId: driverId, occurredAt: now() });
      driverAvailability.set(driverId, 'on_assignment');
    } else {
      assignment.status = 'driver_rejected';
      pushHistory(assignment, { type: 'driver_rejected', actorId: driverId, occurredAt: now() });
      pushHistory(assignment, {
        type: 'assignment_failed',
        actorId: 'system',
        occurredAt: now(),
        note: 'ready for reassignment',
      });
      driverAvailability.set(driverId, 'available');
    }

    emitState();
    return assignment;
  },

  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
    const assignment = assignments.get(bookingId);
    if (!assignment) return undefined;

    assignment.status = status;
    pushHistory(assignment, {
      type: 'booking_status_updated',
      actorId,
      occurredAt: now(),
      note: `status -> ${status}`,
    });

    if ((status === 'completed' || status === 'cancelled') && assignment.driverId) {
      driverAvailability.set(assignment.driverId, 'available');
    }

    emitState();
    return assignment;
  },

  setDriverAvailability(driverId: string, status: DriverAvailabilityStatus): void {
    driverAvailability.set(driverId, status);
    emitState();
  },

  getBooking(bookingId: string): DispatchAssignment | undefined {
    return assignments.get(bookingId);
  },

  getDriverActiveRide(driverId: string): DispatchAssignment | undefined {
    return [...assignments.values()].find(
      (item) =>
        item.driverId === driverId &&
        ['assigned', 'driver_accepted', 'driver_arriving', 'passenger_onboard'].includes(item.status),
    );
  },

  subscribe(listener: (snapshot: DispatchStateSnapshot) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const getDispatchSnapshot = (): DispatchStateSnapshot => ({
  bookings: [...assignments.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  driverAvailability: Object.fromEntries(driverAvailability.entries()),
});
