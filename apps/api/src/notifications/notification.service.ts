import type {
  NotificationDeliveryLog,
  NotificationLifecycleState,
  NotificationMessage
} from './notification.types.js';

export class NotificationService {
  queue(message: NotificationMessage) {
    return {
      queued: true,
      queueName: 'notification.queue.main',
      state: 'queued' as NotificationLifecycleState,
      message
    };
  }

  scheduleRetry(notificationId: string, attempt: number, nextAttemptAt: string) {
    return {
      notificationId,
      attempt,
      nextAttemptAt,
      queueName: 'notification.queue.retry',
      state: 'retrying' as NotificationLifecycleState
    };
  }

  recordDeliveryLog(log: NotificationDeliveryLog) {
    return {
      persisted: true,
      collection: 'notification_delivery_logs',
      log
    };
  }
}
