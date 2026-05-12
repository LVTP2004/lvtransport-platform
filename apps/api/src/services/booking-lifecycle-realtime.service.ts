import { eventBus } from '../events/event-bus.js';
import { BOOKING_EVENTS, WS_EVENTS } from '../constants/index.js';

export type BookingLifecycleStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingLifecycleEvent {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: BookingLifecycleStatus;
  occurredAt: string;
  version?: number;
  metadata?: Record<string, unknown>;
}

interface BookingLifecycleSnapshot {
  bookingId: string;
  customerId: string;
  driverId?: string;
  status: BookingLifecycleStatus;
  version: number;
  updatedAt: string;
  lastEventFingerprint: string;
}

const statusOrder: BookingLifecycleStatus[] = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
const terminalStatuses = new Set<BookingLifecycleStatus>(['completed', 'cancelled']);
const dedupeWindowMs = 30_000;

const statusRank = (status: BookingLifecycleStatus): number => statusOrder.indexOf(status);
const fingerprint = (event: BookingLifecycleEvent): string => [event.bookingId, event.status, event.occurredAt, event.driverId ?? 'none'].join(':');

export class BookingLifecycleRealtimeService {
  private readonly lifecycleByBooking = new Map<string, BookingLifecycleSnapshot>();
  private readonly dedupeCache = new Map<string, number>();

  initialize(): void {
    eventBus.on(BOOKING_EVENTS.CREATED, (payload) => {
      const normalizedEvent = this.normalizeEvent(payload as Partial<BookingLifecycleEvent>);
      if (!normalizedEvent) {
        return;
      }

      const accepted = this.applyLifecycleEvent(normalizedEvent);
      if (!accepted) {
        return;
      }

      eventBus.emit(WS_EVENTS.BOOKING_UPDATED, accepted);
    });
  }

  getSnapshot(bookingId: string): BookingLifecycleSnapshot | undefined {
    return this.lifecycleByBooking.get(bookingId);
  }

  getAllSnapshots(): BookingLifecycleSnapshot[] {
    return [...this.lifecycleByBooking.values()];
  }

  applyLifecycleEvent(event: BookingLifecycleEvent): BookingLifecycleSnapshot | null {
    this.cleanupDedupeCache();

    const eventFingerprint = fingerprint(event);
    if (this.dedupeCache.has(eventFingerprint)) {
      return null;
    }

    const current = this.lifecycleByBooking.get(event.bookingId);
    if (current && !this.isProgressionAllowed(current, event)) {
      return null;
    }

    const snapshot: BookingLifecycleSnapshot = {
      bookingId: event.bookingId,
      customerId: event.customerId,
      driverId: event.driverId ?? current?.driverId,
      status: event.status,
      version: Math.max(current?.version ?? 0, event.version ?? 0) + 1,
      updatedAt: event.occurredAt,
      lastEventFingerprint: eventFingerprint
    };

    this.lifecycleByBooking.set(event.bookingId, snapshot);
    this.dedupeCache.set(eventFingerprint, Date.now());

    return snapshot;
  }

  private normalizeEvent(payload: Partial<BookingLifecycleEvent>): BookingLifecycleEvent | null {
    if (!payload.bookingId || !payload.customerId) {
      return null;
    }

    const status = payload.status ?? 'pending';
    if (!statusOrder.includes(status)) {
      return null;
    }

    return {
      bookingId: payload.bookingId,
      customerId: payload.customerId,
      driverId: payload.driverId,
      status,
      occurredAt: payload.occurredAt ?? new Date().toISOString(),
      version: payload.version,
      metadata: payload.metadata
    };
  }

  private isProgressionAllowed(current: BookingLifecycleSnapshot, incoming: BookingLifecycleEvent): boolean {
    if (terminalStatuses.has(current.status) && current.status !== incoming.status) {
      return false;
    }

    const incomingRank = statusRank(incoming.status);
    const currentRank = statusRank(current.status);

    if (incoming.version && incoming.version <= current.version) {
      return false;
    }

    if (incomingRank < currentRank) {
      return false;
    }

    if (incoming.status === 'accepted' && !incoming.driverId && !current.driverId) {
      return false;
    }

    return true;
  }

  private cleanupDedupeCache(): void {
    const threshold = Date.now() - dedupeWindowMs;
    for (const [key, createdAt] of this.dedupeCache.entries()) {
      if (createdAt < threshold) {
        this.dedupeCache.delete(key);
      }
    }
  }
}

export const bookingLifecycleRealtimeService = new BookingLifecycleRealtimeService();
