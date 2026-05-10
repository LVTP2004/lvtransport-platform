import { CreateCheckoutSessionDto, RetryPaymentDto } from '../dto/payment.dto';
import { PaymentSessionStatus } from '../enums/payment.enums';

export class PaymentArchitectureService {
  createCheckoutSession(_dto: CreateCheckoutSessionDto) {
    return {
      implementation: 'placeholder',
      nextStep: 'wire provider adapters for Stripe/Payconiq and secure checkout redirect flow',
      status: PaymentSessionStatus.CREATED,
    };
  }

  scheduleRetry(_dto: RetryPaymentDto) {
    return {
      implementation: 'placeholder',
      strategy: ['exponential_backoff', 'retry_cap', 'manual_recovery_queue'],
    };
  }
}
