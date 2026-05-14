import { getMissingBookingFields, explainBookingStatus, explainOnboardingStatus } from '../adapters/booking-context.adapter';
import { buildDriverSupportGuidance } from '../adapters/driver-context.adapter';
import { detectLanguage } from '../logic/language';
import type { MoniAudience, MoniContextEnvelope, MoniEscalationReason, MoniIntent, MoniResponse } from '../types/moni.types';
import { MONI_OWNER_ESCALATION_CONTACT, customerResponseRules } from '../rules/response-rules';

const escalationKeywords: Array<{ reason: MoniEscalationReason; pattern: RegExp }> = [
  { reason: 'payment', pattern: /(payment|refund|chargeback|factura|factuur)/i },
  { reason: 'complaint', pattern: /(complaint|klacht|queja)/i },
  { reason: 'safety', pattern: /(safety|danger|unsafe|accident|security)/i },
  { reason: 'legal', pattern: /(legal|lawyer|attorney|juridisch)/i },
  { reason: 'sensitive', pattern: /(private|confidential|internal)/i }
];

const buildReviewPrompt = (context: MoniContextEnvelope): string => {
  if ((context.booking?.status ?? '').toLowerCase() !== 'completed') {
    return 'Reviews are available for verified completed rides only. Share your booking code and I will confirm eligibility.';
  }
  return 'Thank you for riding with LVTP. You can leave a verified premium review for punctuality, professionalism, comfort, operational communication, airport reliability, and overall premium experience.';
};

export const buildMoniResponse = (input: {
  audience: MoniAudience;
  userText: string;
  intent: MoniIntent;
  context: MoniContextEnvelope;
}): MoniResponse => {
  const language = detectLanguage(input.userText);
  const escalation = escalationKeywords.find((x) => x.pattern.test(input.userText));

  const text =
    input.intent === 'booking_status_explanation'
      ? explainBookingStatus(input.context.booking?.status)
      : input.intent === 'missing_booking_info'
        ? `Missing required booking details: ${getMissingBookingFields(input.context).join(', ') || 'none'}.`
        : input.intent === 'driver_support'
          ? buildDriverSupportGuidance(input.context)
          : input.intent === 'onboarding_support'
            ? explainOnboardingStatus(input.context)
            : input.intent === 'lifecycle_update'
              ? explainBookingStatus(input.context.booking?.status)
              : input.intent === 'review_request'
                ? buildReviewPrompt(input.context)
          : input.intent === 'admin_operational_summary'
            ? `Active: ${input.context.admin?.activeBookings ?? 0}, delayed: ${input.context.admin?.delayedBookings ?? 0}, incidents: ${input.context.admin?.openIncidents ?? 0}.`
            : customerResponseRules.safeFallback;

  return {
    language,
    audience: input.audience,
    intent: input.intent,
    text,
    escalation: escalation
      ? { required: true, reason: escalation.reason, owner: MONI_OWNER_ESCALATION_CONTACT }
      : { required: false },
    audit: { safe: true, flags: escalation ? [escalation.reason] : [], timestampIso: new Date().toISOString() }
  };
};
