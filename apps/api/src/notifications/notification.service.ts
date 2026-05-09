import type { NotificationMessage } from './notification.types.js';

export class NotificationService {
  queue(message: NotificationMessage) {
    // TODO: connect Firebase/Supabase/email providers.
    return { queued: true, message };
  }
}
