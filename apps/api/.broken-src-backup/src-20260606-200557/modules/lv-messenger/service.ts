import { randomUUID } from 'node:crypto';
import type { BookingRecord, LVMessage } from '../bookings/dto.js';

export const lvMessengerService = {
  initializeThread(): { threadId: string; messages: LVMessage[]; lastMessageAt: string } {
    const now = new Date().toISOString();
    return {
      threadId: `lvm-${randomUUID()}`,
      messages: [{
        id: randomUUID(),
        at: now,
        channel: 'customer',
        messageType: 'premium_confirmation',
        tone: 'calm',
        content: 'Your ride is being coordinated in realtime by LV Messenger.',
      }],
      lastMessageAt: now,
    };
  },

  append(booking: BookingRecord, message: LVMessage): void {
    booking.lvMessenger.messages.push(message);
    booking.lvMessenger.lastMessageAt = message.at;
  },

  appendBatch(booking: BookingRecord, messages: LVMessage[]): void {
    for (const msg of messages) this.append(booking, msg);
  }
};

