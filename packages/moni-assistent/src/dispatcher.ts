import { startBookingFlow } from "./bookingFlow";
import { applyDriverStatusUpdate } from "./statusFlow";
import type {
  BookingFlowDependencies,
  BookingRecord,
  BookingRequest,
  DispatchOutcome,
  DriverStatusUpdate,
} from "./types";

export class MoniAssistantDispatcher {
  constructor(private readonly deps: BookingFlowDependencies) {}

  createBooking(bookingId: string, request: BookingRequest): Promise<DispatchOutcome> {
    return startBookingFlow(bookingId, request, this.deps);
  }

  updateBookingStatus(booking: BookingRecord, update: DriverStatusUpdate): DispatchOutcome {
    const result = applyDriverStatusUpdate(booking, update);

    return {
      booking: result.booking,
      notifications: [result.notification],
      adminAlert: result.adminAlert,
    };
  }
}
