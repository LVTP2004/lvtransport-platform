export interface ValidateJwtTokenDto {
  token: string;
  audience: 'web' | 'admin' | 'driver' | 'api-internal';
}

export interface RecordFraudSignalDto {
  customerId?: string;
  paymentSessionId?: string;
  signalType: 'velocity_spike' | 'geo_mismatch' | 'device_risk' | 'chargeback_pattern';
  score: number;
}
