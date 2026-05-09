import type { RealtimeEventName } from "../events/names";

export interface RealtimeEventEnvelope<TPayload = Record<string, unknown>> {
  id: string;
  name: RealtimeEventName;
  timestamp: string;
  source: "firebase" | "websocket";
  correlationId?: string;
  payload: TPayload;
}

export interface RealtimeTransport {
  publish<TPayload>(event: RealtimeEventEnvelope<TPayload>): Promise<void>;
  subscribe(name: RealtimeEventName, listener: (event: RealtimeEventEnvelope) => void): () => void;
}
