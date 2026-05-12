import { logger } from '../utils/logger.js';
import type { BookingActor, BookingLifecycleStatus } from './booking-operational-state.service.js';

export type OperationalDomain = 'booking' | 'driver' | 'admin' | 'customer' | 'realtime' | 'sync';
export type OperationalLevel = 'info' | 'warn' | 'error';

export type OperationalLogEntry = {
  at: string;
  level: OperationalLevel;
  domain: OperationalDomain;
  action: string;
  bookingId?: string;
  actor?: BookingActor | 'realtime' | 'api';
  state?: string;
  details?: Record<string, unknown>;
};

const OP_LOG_LIMIT = 500;
const bookingTimeline = new Map<string, Array<{ at: string; status: BookingLifecycleStatus; actor: BookingActor; note?: string }>>();
const operationalLogs: OperationalLogEntry[] = [];

const pushLog = (entry: OperationalLogEntry): void => {
  operationalLogs.push(entry);
  if (operationalLogs.length > OP_LOG_LIMIT) operationalLogs.splice(0, operationalLogs.length - OP_LOG_LIMIT);
  const base = `${entry.domain}.${entry.action}`;
  if (entry.level === 'error') logger.error(base, entry);
  else if (entry.level === 'warn') logger.warn(base, entry);
  else logger.info(base, entry);
};

export const operationalObservabilityService = {
  log(entry: Omit<OperationalLogEntry, 'at'> & { at?: string }): void {
    pushLog({ ...entry, at: entry.at ?? new Date().toISOString() });
  },

  logTransition(params: { bookingId: string; from: BookingLifecycleStatus; to: BookingLifecycleStatus; actor: BookingActor; note?: string; at?: string }): void {
    const at = params.at ?? new Date().toISOString();
    const existing = bookingTimeline.get(params.bookingId) ?? [];
    existing.push({ at, status: params.to, actor: params.actor, note: params.note });
    bookingTimeline.set(params.bookingId, existing);
    pushLog({
      at,
      level: 'info',
      domain: 'booking',
      action: 'state.transition',
      bookingId: params.bookingId,
      actor: params.actor,
      state: `${params.from}->${params.to}`,
      details: { note: params.note },
    });
  },

  warnInvalidTransition(params: { bookingId: string; from: BookingLifecycleStatus; to: BookingLifecycleStatus; actor: BookingActor; reason: string; at?: string }): void {
    pushLog({
      at: params.at ?? new Date().toISOString(),
      level: 'warn',
      domain: 'booking',
      action: 'state.invalid_transition',
      bookingId: params.bookingId,
      actor: params.actor,
      state: `${params.from}->${params.to}`,
      details: { reason: params.reason },
    });
  },

  logSyncConflict(params: { bookingId: string; expectedVersion: number; actualVersion: number; actor: BookingActor; at?: string }): void {
    pushLog({
      at: params.at ?? new Date().toISOString(),
      level: 'warn',
      domain: 'sync',
      action: 'version.conflict',
      bookingId: params.bookingId,
      actor: params.actor,
      details: { expectedVersion: params.expectedVersion, actualVersion: params.actualVersion },
    });
  },

  seedInitialTimeline(bookingId: string, status: BookingLifecycleStatus, actor: BookingActor, at: string, note?: string): void {
    bookingTimeline.set(bookingId, [{ at, status, actor, note }]);
  },

  getBookingTimeline(bookingId: string) {
    return bookingTimeline.get(bookingId) ?? [];
  },

  getOperationalLogs() {
    return [...operationalLogs];
  },
};
