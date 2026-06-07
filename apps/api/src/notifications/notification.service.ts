import crypto from 'node:crypto';
import { emitNotificationEvent } from './notification.events.js';
import type { NotificationDeliveryLogEntry, NotificationMessage } from './notification.types.js';

const MAX_RETRIES = 3;

export class NotificationService {
  private readonly deliveryLog: NotificationDeliveryLogEntry[] = [];

  queue(input: Omit<NotificationMessage, 'status' | 'retryCount' | 'occurredAt'>) {
    const message: NotificationMessage = {
      ...input,
      notificationId: input.notificationId ?? crypto.randomUUID(),
      status: 'queued',
      retryCount: 0,
      occurredAt: new Date().toISOString()
    };

    return this.deliver(message);
  }

  private deliver(message: NotificationMessage): { queued: boolean; delivered: boolean; message: NotificationMessage } {
    const forceFailure = message.data?.forceFailure === true;
    const retryCount = message.retryCount ?? 0;

    if (forceFailure && retryCount < MAX_RETRIES) {
      const retrying = { ...message, status: 'retrying' as const, retryCount: retryCount + 1 };
      this.log(retrying, 'Forced mock provider failure.');
      return this.deliver(retrying);
    }

    const finalMessage = {
      ...message,
      status: forceFailure ? 'failed' as const : 'sent' as const
    };

    this.log(finalMessage, forceFailure ? 'Max retries reached in mock provider.' : undefined);

    emitNotificationEvent({
      notificationId: finalMessage.notificationId!,
      type: finalMessage.template,
      status: finalMessage.status,
      occurredAt: new Date().toISOString(),
      payload: finalMessage.data
    });

    return {
      queued: finalMessage.status !== 'failed',
      delivered: finalMessage.status === 'sent',
      message: finalMessage
    };
  }

  getDeliveryLog() {
    return this.deliveryLog;
  }

  private log(message: NotificationMessage, error?: string) {
    this.deliveryLog.push({
      notificationId: message.notificationId!,
      status: message.status ?? 'queued',
      provider: 'mock_dev',
      attempts: (message.retryCount ?? 0) + 1,
      lastAttemptAt: new Date().toISOString(),
      error
    });
  }
}

export const notificationService = new NotificationService();
