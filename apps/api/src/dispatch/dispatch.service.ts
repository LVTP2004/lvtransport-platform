export type DispatchStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'en_route'
  | 'completed'
  | 'cancelled';

export const dispatchService = {
  assignBooking(params: {
    bookingId: string;
    customerId: string;
    driverId: string;
  }) {
    return {
      ...params,
      status: 'assigned' as const,
      updatedAt: new Date().toISOString()
    };
  },

  driverDecision(params: {
    bookingId: string;
    driverId: string;
    decision: 'accept' | 'reject';
  }) {
    return {
      ...params,
      status:
        params.decision === 'accept'
          ? ('accepted' as const)
          : ('cancelled' as const),
      updatedAt: new Date().toISOString()
    };
  },

  updateStatus(
    bookingId: string,
    status: DispatchStatus,
    actorId: string
  ) {
    return {
      bookingId,
      status,
      actorId,
      updatedAt: new Date().toISOString()
    };
  }
};
