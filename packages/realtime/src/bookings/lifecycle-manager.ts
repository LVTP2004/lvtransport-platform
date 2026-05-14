import { BookingLifecycle } from '../models/enums.js';
import type { BookingActor, BookingRecord, BookingTimelineEntry } from '../models/realtime.js';

const IMMUTABLE_STATUSES = new Set<BookingLifecycle>([BookingLifecycle.COMPLETED, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]);

const ALLOWED_TRANSITIONS: Record<BookingLifecycle, ReadonlySet<BookingLifecycle>> = {
  [BookingLifecycle.PENDING]: new Set([BookingLifecycle.ASSIGNED, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]),
  [BookingLifecycle.ASSIGNED]: new Set([BookingLifecycle.ACCEPTED, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]),
  [BookingLifecycle.ACCEPTED]: new Set([BookingLifecycle.EN_ROUTE, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]),
  [BookingLifecycle.EN_ROUTE]: new Set([BookingLifecycle.ARRIVED, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]),
  [BookingLifecycle.ARRIVED]: new Set([BookingLifecycle.IN_PROGRESS, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]),
  [BookingLifecycle.IN_PROGRESS]: new Set([BookingLifecycle.COMPLETED, BookingLifecycle.CANCELLED, BookingLifecycle.FAILED]),
  [BookingLifecycle.COMPLETED]: new Set(),
  [BookingLifecycle.CANCELLED]: new Set(),
  [BookingLifecycle.FAILED]: new Set()
};

const EVENT_TTL_MS = 5 * 60 * 1000;
const processedEvents = new Map<string, number>();

export function isImmutableLifecycleStatus(status: BookingLifecycle): boolean {
  return IMMUTABLE_STATUSES.has(status);
}

export function canTransitionLifecycle(from: BookingLifecycle, to: BookingLifecycle): boolean {
  if (from === to) return true;
  if (isImmutableLifecycleStatus(from)) return false;
  return ALLOWED_TRANSITIONS[from].has(to);
}

export function registerLifecycleEvent(idempotencyKey: string): boolean {
  const now = Date.now();
  for (const [key, ts] of processedEvents.entries()) {
    if (now - ts > EVENT_TTL_MS) processedEvents.delete(key);
  }
  if (processedEvents.has(idempotencyKey)) return false;
  processedEvents.set(idempotencyKey, now);
  return true;
}

export function applyLifecycleTransition(record: BookingRecord, nextStatus: BookingLifecycle, actor: BookingActor, note?: string): BookingRecord {
  if (!canTransitionLifecycle(record.status, nextStatus)) {
    throw new Error(`Invalid lifecycle transition: ${record.status} -> ${nextStatus}`);
  }

  const at = new Date().toISOString();
  const timelineEntry: BookingTimelineEntry = { status: nextStatus, actor, at, note };

  return {
    ...record,
    status: nextStatus,
    version: record.version + 1,
    updatedAt: at,
    timeline: [...record.timeline, timelineEntry]
  };
}
