export const driverNotificationArchitecture = {
  driverEvents: ['driver_assignment', 'booking_status_update', 'support_ticket_update', 'vip_business_update'],
  channelsPrepared: ['in_app', 'push', 'sms'],
  appResponsibilities: {
    rideAssignmentAlerts: true,
    shiftAnnouncements: true,
    silentHoursForNonCritical: true
  },
  productionIntegrationsDeferred: {
    pushProvider: true,
    smsProvider: true
  }
} as const;
