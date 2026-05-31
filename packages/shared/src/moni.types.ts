import type { RideStatus } from './ride-lifecycle';
import type { TrackingCode } from './tracking';

export type MoniVerifiedContext = {
  booking?: {
    id: string;
    trackingCode: TrackingCode;
    status: RideStatus;
    pickup?: string;
    destination?: string;
    scheduledAt?: string;
    assignedDriverId?: string;
    assignedDriverName?: string;
  };
  verification: {
    source: 'api';
    verifiedAt: string;
  };
};
