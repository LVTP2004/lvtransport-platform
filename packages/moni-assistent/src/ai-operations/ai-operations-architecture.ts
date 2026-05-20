import type { BookingRecord } from '../types';

/**
 * Future-safe AI Operations contracts.
 *
 * These interfaces are preparation-only and do not change current production
 * behavior. They define extension points for multilingual responses,
 * escalation handling, audit logging, and prompt templates.
 */

export interface MoniAssistantCoreContext {
  booking?: BookingRecord;
  locale?: string;
  channel?: 'web' | 'admin' | 'driver' | 'api';
}

export interface MultilingualResponse {
  locale: string;
  text: string;
  fallbackLocale?: string;
}

export interface EscalationQueueItem {
  id: string;
  bookingId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  createdAt: string;
}

export interface AIAuditLogEntry {
  id: string;
  bookingId?: string;
  operation: 'response' | 'escalation' | 'context_read' | 'prompt_render';
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface OperationalPromptTemplate {
  id: string;
  name: string;
  purpose: 'booking_assistance' | 'status_update' | 'escalation_summary';
  template: string;
  active: boolean;
}
