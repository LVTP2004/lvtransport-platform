import { NOTIFICATION_CHANNELS } from '../constants/index.js';

export type NotificationChannel =
  | (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS]
  | 'sms'
  | 'whatsapp'
  | 'webhook';

export type NotificationAudience = 'customer' | 'driver' | 'admin' | 'support' | 'business';
export type NotificationProvider = 'mock_dev';

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_status_update'
  | 'driver_assignment'
  | 'dispatch_event'
  | 'admin_alert'
  | 'operational_warning'
  | 'customer_tracking_link'
  | 'booking_cancellation';

export type NotificationLifecycleStatus =
  | 'queued'
  | 'processing'
  | 'delivered'
  | 'retrying'
  | 'failed'
  | 'archived';

export type NotificationTemplateKind =
  | 'booking_confirmation'
  | 'booking_status_update'
  | 'driver_assigned'
  | 'admin_new_booking_alert';

export interface BookingNotificationContext {
  bookingId: string;
  customerId: string;
  status: 'pending' | 'confirmed' | 'driver_assigned' | 'en_route' | 'completed' | 'cancelled';
  pickup: string;
  dropoff: string;
  scheduledAt: string;
  trackingCode: string;
  trackingUrl: string;
  driverId?: string;
  driverName?: string;
}

export interface NotificationMessage {
  notificationId: string;
  bookingId?: string;
  recipientId: string;
  audience: NotificationAudience;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
  provider: NotificationProvider;
  lifecycle: {
    status: NotificationLifecycleStatus;
    attempts: number;
    maxAttempts: number;
    updatedAt: string;
    retryAt?: string;
    failureReason?: string;
    archivedAt?: string;
  };
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  bookingId?: string;
  recipientId: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  provider: NotificationProvider;
  status: NotificationLifecycleStatus;
  attempt: number;
  occurredAt: string;
  failureReason?: string;
}

export interface NotificationTemplateSet {
  email: { subject: string; preview: string; html: string; text: string };
  whatsapp: { text: string; variables: Record<string, string> };
}
