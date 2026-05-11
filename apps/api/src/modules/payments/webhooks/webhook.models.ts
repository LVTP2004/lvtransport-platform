import { PaymentProvider } from '../enums/payment.enums';

export interface PaymentWebhookEnvelope<TData = unknown> {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  eventVersion: string;
  occurredAt: string;
  signatureValidated: boolean;
  replayGuardKey: string;
  data: TData;
}

export interface PaymentWebhookHandlerResult {
  accepted: boolean;
  replayDetected: boolean;
  requiresRetry?: boolean;
  reason?: string;
}

export interface PaymentWebhookRegistryEntry {
  eventType: string;
  internalAction: 'payment.session.updated' | 'payment.refund.updated' | 'payout.updated' | 'audit.append';
}
