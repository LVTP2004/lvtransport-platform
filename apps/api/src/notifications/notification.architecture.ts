export const notificationArchitecture = {
  modules: {
    orchestration: 'notification-orchestrator',
    pushGateway: 'push-notification-gateway',
    realtimeLifecycle: 'operational-communication-lifecycle',
    reconnectRecovery: 'notification-recovery-service',
    diagnostics: 'notification-diagnostics-service',
    providers: ['firebase-fcm-ready', 'apns-ready', 'web-push-ready', 'email-provider-placeholder', 'sms-provider-placeholder'],
    deliveryLogging: 'delivery-log-service',
  },
  operationalCommunicationLifecycle: ['booking_created', 'booking_assigned', 'booking_en_route', 'ride_in_progress', 'ride_completed', 'booking_cancelled'],
  queues: {
    main: 'notification.queue.main',
    retry: 'notification.queue.retry',
    deadLetter: 'notification.queue.dead_letter',
    websocketReplay: 'notification.queue.realtime_replay',
    operationalEvent: 'notification.queue.operational_events',
  },
  reconnectRecovery: {
    mode: 'cursor_checkpoint_replay',
    consistency: 'at_least_once_with_deduplication',
    staleThresholdSec: 600,
  },
  retryPolicy: {
    strategy: 'exponential_backoff_with_jitter',
    maxAttempts: 6,
    scheduleSec: [30, 120, 600, 1800, 3600, 21600],
    moveToDeadLetterOnMaxAttempts: true,
  },
} as const;
