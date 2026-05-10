export const webNotificationArchitecture = {
  customerEvents: [
    'booking_confirmation',
    'booking_status_update',
    'customer_tracking_link',
    'payment_confirmation',
    'invoice_preparation',
    'booking_cancellation',
    'support_ticket_update',
    'vip_business_update'
  ],
  channelsPrepared: ['in_app', 'email', 'push', 'sms', 'whatsapp'],
  appResponsibilities: {
    preferencesUi: true,
    deliveryTimelineUi: true,
    trackingLinkNotifications: true,
    liveStatusFeed: true
  }
} as const;
