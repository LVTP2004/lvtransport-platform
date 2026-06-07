export interface ValidateJwtTokenDto {
  token: string;
  audience: 'web' | 'admin' | 'driver' | 'api-internal';
}

export interface RecordFraudSignalDto {
  customerId?: string;
  paymentSessionId?: string;
  signalType: 'velocity_spike' | 'geo_mismatch' | 'device_risk' | 'chargeback_pattern';
  score: number;
  source: 'api' | 'webhook' | 'ops';
}

export interface RecordAuditEntryDto {
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  reason?: string;
}
