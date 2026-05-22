export const adminNotificationArchitecture = {
    adminAlerts: ['driver_assignment_delay', 'payment_anomaly', 'retry_queue_growth', 'vip_incident'],
    operationalViews: ['notification_queue_monitor', 'delivery_log_explorer', 'template_versioning'],
    webhookSubscriptions: [
        'notification.failed.v1',
        'notification.dead_lettered.v1',
        'notification.delivered.v1'
    ],
    appResponsibilities: {
        incidentEscalation: true,
        manualReplay: true,
        preferenceOverrides: true
    }
};
