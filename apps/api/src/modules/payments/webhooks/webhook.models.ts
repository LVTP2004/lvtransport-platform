import { PaymentProvider } from '../enums/payment.enums';

export interface PaymentWebhookEnvelope<TData = unknown> {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  occurredAt: string;
  signatureValidated: boolean;
  data: TData;
}

export interface PaymentWebhookHandlerResult {
  accepted: boolean;
  replayDetected: boolean;
  reason?: string;
}
