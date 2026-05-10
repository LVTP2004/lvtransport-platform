import { CreateCheckoutSessionDto, RetryPaymentDto } from '../dto/payment.dto';
import { PaymentRetryStrategy, PaymentSessionStatus } from '../enums/payment.enums';

export class PaymentArchitectureService {
  createCheckoutSession(dto: CreateCheckoutSessionDto) {
    return {
      implementation: 'placeholder',
      provider: dto.provider,
      nextStep: 'wire provider adapters for Stripe/Payconiq and secure checkout redirect flow',
      status: PaymentSessionStatus.CREATED,
      lifecycle: ['created', 'checkout_pending', 'authorized', 'capture_pending', 'captured'],
    };
  }

  scheduleRetry(_dto: RetryPaymentDto) {
    return {
      implementation: 'placeholder',
      strategy: [
        PaymentRetryStrategy.EXPONENTIAL_BACKOFF,
        PaymentRetryStrategy.FIXED_INTERVAL,
        PaymentRetryStrategy.MANUAL_RECOVERY,
      ],
      retryQueue: 'payment-retry-jobs',
    };
  }
}
