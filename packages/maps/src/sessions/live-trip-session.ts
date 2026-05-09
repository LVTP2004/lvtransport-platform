export type LiveTripSession = {
  sessionId: string;
  tripId: string;
  driverId: string;
  customerId: string;
  startedAt: string;
  endedAt?: string;
  status: 'preparing' | 'active' | 'paused' | 'ended';
};
