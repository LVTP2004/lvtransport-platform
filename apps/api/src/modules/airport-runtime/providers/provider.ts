import type {
  AirportRuntimeInput,
  AirportRuntimeSnapshot,
} from '../types.js';

export interface AirportRuntimeProvider {
  name: string;
  read(input: AirportRuntimeInput): Promise<AirportRuntimeSnapshot | null>;
}
