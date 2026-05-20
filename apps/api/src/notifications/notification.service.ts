import { randomUUID } from 'node:crypto';
import type { DeliveryLogEntry, NotificationMessage, NotificationTemplate } from './notification.types.js';

const MAX_RETRIES = 3;

class MockNotificationProvider {
  readonly name = 'mock-dev' as const;

  send(message: NotificationMessage) {
    const forcedFailure = typeof message.data?.['forceFail'] === 'boolean' && message.data['forceFail'] === true;

    return {
      ok: !forcedFailure,
      providerMessageId: `mock_${randomUUID().slice(0, 8)}`,
      errorMessage: forcedFailure ? 'Forced failure for dev retry flow.' : undefined
    };
  }
}

export class NotificationService {
  private readonly provider = new MockNotificationProvider();
  private readonly deliveryLog: DeliveryLogEntry[] = [];

  queue(message: NotificationMessage) {
    const notificationId = message.id ?? randomUUID();
    let attempt = 1;
    let result = this.provider.send({ ...message, id: notificationId });

    while (!result.ok && attempt < MAX_RETRIES) {
      attempt += 1;
      this.pushLog(notificationId, message, 'retrying', attempt - 1, result.errorMessage);
      result = this.provider.send({ ...message, id: notificationId });
    }

    const finalStatus = result.ok ? 'sent' : 'failed';
    const entry = this.pushLog(notificationId, message, finalStatus, attempt, result.errorMessage);

    return {
      queued: true,
      notificationId,
      status: finalStatus,
      provider: this.provider.name,
      delivery: entry
    };
  }

  getDeliveryLog() {
    return this.deliveryLog;
  }

  buildEmailTemplate(template: NotificationTemplate) {
    return {
      ...template,
      html: `<h1>${template.subject}</h1><p>${template.previewText}</p>${template.bodyLines
        .map((line) => `<p>${line}</p>`)
        .join('')}${template.ctaUrl ? `<a href="${template.ctaUrl}">${template.ctaLabel ?? 'Open'}</a>` : ''}`,
      text: `${template.subject}\n${template.previewText}\n${template.bodyLines.join('\n')}\n${template.ctaUrl ?? ''}`.trim()
    };
  }

  buildWhatsAppTemplate(message: { header: string; body: string; footer?: string; ctaUrl?: string }) {
    return {
      channel: 'whatsapp',
      provider: this.provider.name,
      template: {
        header: message.header,
        body: message.body,
        footer: message.footer ?? 'Reply STOP to opt out in production.',
        ctaUrl: message.ctaUrl
      }
    };
  }

  private pushLog(
    notificationId: string,
    message: NotificationMessage,
    status: DeliveryLogEntry['status'],
    attempt: number,
    errorMessage?: string
  ) {
    const now = new Date().toISOString();
    const entry: DeliveryLogEntry = {
      id: randomUUID(),
      notificationId,
      bookingId: message.bookingId,
      channel: message.channel,
      provider: this.provider.name,
      status,
      attempt,
      errorMessage,
      payload: {
        title: message.title,
        body: message.body,
        recipientId: message.recipientId,
        audience: message.audience,
        eventType: message.eventType,
        ...message.data
      },
      createdAt: now,
      updatedAt: now
    };
    this.deliveryLog.unshift(entry);
    return entry;
  }
}
