import { listRecords, setRecord } from "../persistence/memory-store.js";
export function recordEvent(type, payload = {}) {
  const now = new Date().toISOString();
  return setRecord("events", { id: `event_${Date.now()}_${Math.random().toString(16).slice(2)}`, type, payload, createdAt: now, updatedAt: now });
}
export function listEvents() { return listRecords("events"); }
