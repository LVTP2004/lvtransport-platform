export type RideStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';

export const FINAL_RIDE_STATUSES: readonly RideStatus[] = [
  'completed',
  'cancelled',
  'failed',
];

export const RIDE_STATUS_TRANSITIONS: Record<RideStatus, readonly RideStatus[]> = {
  pending: ['assigned', 'cancelled', 'failed'],
  assigned: ['accepted', 'cancelled', 'failed'],
  accepted: ['en_route', 'cancelled', 'failed'],
  en_route: ['arrived', 'cancelled', 'failed'],
  arrived: ['in_progress', 'cancelled', 'failed'],
  in_progress: ['completed', 'failed'],
  completed: [],
  cancelled: [],
  failed: [],
};

export function isFinalRideStatus(status: RideStatus): boolean {
  return FINAL_RIDE_STATUSES.includes(status);
}

export function canTransitionRideStatus(from: RideStatus, to: RideStatus): boolean {
  return RIDE_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function normalizeLegacyRideStatus(input: string): RideStatus {
  const normalized = input.trim().toLowerCase();

  const legacyMap: Record<string, RideStatus> = {
    request_received: 'pending',
    confirmed: 'pending',
    assignment_pending: 'pending',
    driver_assigned: 'assigned',
    driver_accepted: 'accepted',
    driver_arriving: 'en_route',
    on_route: 'en_route',
    passenger_onboard: 'in_progress',
    started: 'in_progress',
    done: 'completed',
  };

  return legacyMap[normalized] ?? (normalized as RideStatus);
}
