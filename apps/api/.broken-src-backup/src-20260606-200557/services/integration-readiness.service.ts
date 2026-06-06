import { env } from '../config/env.js';

type ReadinessState = 'ready' | 'disabled';
type ProviderReadiness = { provider: string; state: ReadinessState; reason?: string };

const hasValue = (value?: string) => Boolean(value && !value.includes('PLACEHOLDER'));

export const integrationReadinessService = {
  getSnapshot() {
    const payments: ProviderReadiness[] = [
      hasValue(env.stripeSecretKey) ? { provider: 'stripe', state: 'ready' } : { provider: 'stripe', state: 'disabled', reason: 'missing_STRIPE_SECRET_KEY' },
      hasValue(env.payconiqApiKey) ? { provider: 'payconiq', state: 'ready' } : { provider: 'payconiq', state: 'disabled', reason: 'missing_PAYCONIQ_API_KEY' },
    ];
    const email: ProviderReadiness[] = [
      hasValue(env.mailProviderApiKey) && hasValue(env.mailFromAddress)
        ? { provider: 'transactional_email', state: 'ready' }
        : { provider: 'transactional_email', state: 'disabled', reason: 'missing_MAIL_PROVIDER_API_KEY_or_MAIL_FROM_ADDRESS' },
    ];
    const maps: ProviderReadiness[] = [
      hasValue(env.googleMapsApiKey) ? { provider: 'google_maps', state: 'ready' } : { provider: 'google_maps', state: 'disabled', reason: 'missing_GOOGLE_MAPS_API_KEY' },
    ];
    return {
      generatedAt: new Date().toISOString(),
      payments,
      email,
      maps,
      allReady: [...payments, ...email, ...maps].every((item) => item.state === 'ready'),
      safeModeActive: true,
      diagnostics: 'Integrations are readiness-checked only. Live charging and outbound emails remain disabled until explicit production activation.'
    };
  }
};

