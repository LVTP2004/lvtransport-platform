export const notificationArchitecture = {
  modules: {
    orchestration: 'notification-orchestrator',
    templates: 'template-registry',
    preferences: 'preference-service',
    providers: ['email-provider-placeholder', 'push-provider-placeholder', 'sms-provider-placeholder', 'whatsapp-provider-placeholder'],
    deliveryLogging: 'delivery-log-service'
  },
  queues: {
    main: 'notification.queue.main',
    retry: 'notification.queue.retry',
    deadLetter: 'notification.queue.dead_letter',
    webhook: 'notification.queue.webhook_events'
  },
  retryPolicy: {
    strategy: 'exponential_backoff_with_jitter',
    maxAttempts: 6,
    scheduleSec: [30, 120, 600, 1800, 3600, 21600],
    moveToDeadLetterOnMaxAttempts: true
  },
  webhooks: [
    'notification.requested.v1',
    'notification.queued.v1',
    'notification.processing.v1',
    'notification.sent.v1',
    'notification.delivered.v1',
    'notification.failed.v1',
    'notification.dead_lettered.v1'
  ]
} as const;
