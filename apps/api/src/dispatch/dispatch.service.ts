import { dispatchMvpStore, type DispatchBookingStatus } from '@lvtransport/realtime';
import { bookingsService } from '../bookings/bookings.service.js';

export const dispatchService = {
  assignBooking(params: { bookingId: string; customerId: string; driverId: string }) {
    const assignment = dispatchMvpStore.assignDriver(params.bookingId, params.customerId, params.driverId);
    bookingsService.publishBookingState({
      bookingId: assignment.bookingId,
      customerId: assignment.customerId,
      driverId: assignment.driverId,
      status: assignment.status,
      occurredAt: assignment.updatedAt,
    });
    return assignment;
  },

  driverDecision(params: { bookingId: string; driverId: string; decision: 'accept' | 'reject' }) {
    const assignment = dispatchMvpStore.driverRespond(params.bookingId, params.driverId, params.decision);
    if (!assignment) return undefined;

    bookingsService.publishBookingState({
      bookingId: assignment.bookingId,
      customerId: assignment.customerId,
      driverId: assignment.driverId,
      status: assignment.status,
      occurredAt: assignment.updatedAt,
    });
    return assignment;
  },

  updateStatus(bookingId: string, status: DispatchBookingStatus, actorId: string) {
    const assignment = dispatchMvpStore.updateRideStatus(bookingId, status, actorId);
    if (!assignment) return undefined;
    bookingsService.publishBookingState({
      bookingId: assignment.bookingId,
      customerId: assignment.customerId,
      driverId: assignment.driverId,
      status: assignment.status,
      occurredAt: assignment.updatedAt,
    });
    return assignment;
  },
};
