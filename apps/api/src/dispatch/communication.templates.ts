export type PremiumCommunicationTemplateKey =
  | 'assignment_ack'
  | 'driver_en_route'
  | 'airport_pickup_instructions'
  | 'eta_update'
  | 'recovery_escalation';

export interface PremiumCommunicationTemplate {
  key: PremiumCommunicationTemplateKey;
  channel: 'sms' | 'email' | 'push';
  etaCadenceMinutes?: number;
  body: string;
}

export const premiumCommunicationTemplates: PremiumCommunicationTemplate[] = [
  {
    key: 'assignment_ack',
    channel: 'push',
    body: 'Your LV Ride is confirmed. Your chauffeur is preparing for pickup.',
  },
  {
    key: 'driver_en_route',
    channel: 'sms',
    etaCadenceMinutes: 5,
    body: 'Your chauffeur is en route. We will keep ETA updates every 5 minutes.',
  },
  {
    key: 'airport_pickup_instructions',
    channel: 'sms',
    body: 'Airport pickup: your chauffeur will wait at the premium arrivals meeting point with name-board.',
  },
  {
    key: 'eta_update',
    channel: 'push',
    etaCadenceMinutes: 3,
    body: 'ETA update: your chauffeur arrival has been refreshed in realtime.',
  },
  {
    key: 'recovery_escalation',
    channel: 'email',
    body: 'Operations escalation has been activated to protect your premium service continuity.',
  },
];
