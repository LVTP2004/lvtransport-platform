import type { RideStatus } from './ride-lifecycle';

export type DispatchAssignmentStatus =
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export type DriverDecision = 'accept' | 'reject';

export type DispatchAssignment = {
  id: string;
  bookingId: string;
  customerId: string;
  driverId: string;
  status: DispatchAssignmentStatus;
  createdAt: string;
  respondedAt?: string;
  expiresAt?: string;
  source?: 'dispatch' | 'admin' | 'system';
};

export type DispatchRideTransition = {
  bookingId: string;
  from: RideStatus;
  to: RideStatus;
  actorId: string;
  actorType: 'driver' | 'admin' | 'system';
  idempotencyKey: string;
};
