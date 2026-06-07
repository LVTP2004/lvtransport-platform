import crypto from 'node:crypto';
import type { NotificationMessage, NotificationDeliveryLog, NotificationQueueEntry, NotificationLifecycleStatus } from './notification.types.js';

const DEFAULT_MAX_ATTEMPTS = 4;

export const notificationService = {
  queue(input: Omit<NotificationMessage, 'notificationId' | 'createdAt' | 'provider' | 'lifecycle'>) {
    const now = new Date().toISOString();
    return {
      queued: true,
      message: {
        ...input,
        notificationId: crypto.randomUUID(),
        createdAt: now,
        provider: 'internal_push_router',
        lifecycle: { status: 'queued' as NotificationLifecycleStatus, attempts: 0, maxAttempts: DEFAULT_MAX_ATTEMPTS, updatedAt: now },
      },
    };
  },
  getDeliveryLogs(): NotificationDeliveryLog[] { return []; },
  getOperationalQueue(): NotificationQueueEntry[] { return []; },
  getDiagnostics() { return { staleAfterMs: 600000, stale: [] }; },
  restoreActiveNotifications(_recipientId: string, _checkpoint?: string) { return []; },
  archiveOperationalAlertsForBooking(_bookingId: string) {},
  createDriverAssignmentDispatchNotification(input: { bookingId: string; customerId: string; driverId: string; adminId: string }) {
    return { customer: this.queue({ ...input, recipientId: input.customerId, audience: 'customer', type: 'driver_assigned', channels: ['in_app'], title: 'Driver assigned', body: 'Driver assigned.' }), driver: null, admin: null };
  },
};
