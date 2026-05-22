import type { NotificationDeliveryLogEntry, NotificationMessage } from './notification.types.js';

const MAX_RETRIES = 3;

export class NotificationService {
  private readonly deliveryLog: NotificationDeliveryLogEntry[] = [];

  queue(message: Omit<NotificationMessage, 'status' | 'retryCount'>) {
    const prepared: NotificationMessage = { ...message, status: 'queued', retryCount: 0 };
    return this.deliver(prepared);
  }

  private deliver(message: NotificationMessage) {
    const shouldFail = typeof message.data?.['forceFailure'] === 'boolean' && message.data.forceFailure;

    if (shouldFail && message.retryCount < MAX_RETRIES) {
      const retryingMessage: NotificationMessage = {
        ...message,
        status: 'retrying',
        retryCount: message.retryCount + 1
      };
      this.log(retryingMessage, 'Forced mock provider failure.');
      return this.deliver(retryingMessage);
    }

    if (shouldFail && message.retryCount >= MAX_RETRIES) {
      const failedMessage: NotificationMessage = { ...message, status: 'failed' };
      this.log(failedMessage, 'Max retries reached in mock provider.');
      return { queued: false, delivered: false, message: failedMessage };
    }

    const sentMessage: NotificationMessage = { ...message, status: 'sent' };
    this.log(sentMessage);
    return { queued: true, delivered: true, message: sentMessage };
  }

  getDeliveryLog() {
    return this.deliveryLog;
  }

  private log(message: NotificationMessage, error?: string) {
    this.deliveryLog.push({
      notificationId: message.notificationId,
      status: message.status,
      provider: 'mock_dev',
      attempts: message.retryCount + 1,
      lastAttemptAt: new Date().toISOString(),
      error
    });
  }
}
