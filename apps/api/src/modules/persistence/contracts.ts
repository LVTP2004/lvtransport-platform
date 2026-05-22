export type RideStatus = string;
export type PaymentStatus = string;

export interface RideRecord {
  id: string;
  rideCode: string | null;
  status: RideStatus;
  payloadJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  rideId: string | null;
  status: PaymentStatus;
  payloadJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEventRecord {
  id: string;
  entityType: string | null;
  entityId: string | null;
  eventType: string;
  payloadJson: string;
  timestamp: string;
}

export interface MessageEventRecord {
  id: string;
  eventType: string;
  payloadJson: string;
  timestamp: string;
}

export interface NotificationAttemptRecord {
  id: string;
  status: string;
  payloadJson: string;
  timestamp: string;
}

export interface RecoveryEventRecord {
  id: string;
  status: string;
  payloadJson: string;
  timestamp: string;
}
