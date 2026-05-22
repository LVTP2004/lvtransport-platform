export type AirportRuntimeStatus =
  | 'unknown'
  | 'scheduled'
  | 'boarding'
  | 'departed'
  | 'arrived'
  | 'delayed'
  | 'cancelled';

export type AirportRuntimeSnapshot = {
  provider: string;
  providerPriority: string[];
  status: AirportRuntimeStatus;
  delayMin: number;
  terminal: string | null;
  pickupBufferMin: number;
  synchronizedAt: string;
  notes: string[];
};

export type AirportRuntimeInput = {
  flightNumber?: string;
  airline?: string;
  terminal?: string;
  arrivalAirport?: string;
};
