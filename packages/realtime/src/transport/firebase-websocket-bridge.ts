import type { RealtimeEventEnvelope, RealtimeTransport } from "./event-bus.js";

export interface BridgeAdapters {
  firebase: RealtimeTransport;
  websocket: RealtimeTransport;
}

export class FirebaseWebsocketBridge implements RealtimeTransport {
  constructor(private readonly adapters: BridgeAdapters) {}

  async publish<TPayload>(event: RealtimeEventEnvelope<TPayload>): Promise<void> {
    await this.adapters.firebase.publish({ ...event, source: "firebase" });
    await this.adapters.websocket.publish({ ...event, source: "websocket" });
  }

  subscribe(name: RealtimeEventEnvelope["name"], listener: (event: RealtimeEventEnvelope) => void): () => void {
    const unsubscribeFirebase = this.adapters.firebase.subscribe(name, listener);
    const unsubscribeWebsocket = this.adapters.websocket.subscribe(name, listener);

    return () => {
      unsubscribeFirebase();
      unsubscribeWebsocket();
    };
  }
}
