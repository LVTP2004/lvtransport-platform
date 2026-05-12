const forbiddenCustomerTopics = [
  'backend',
  'vps',
  'api key',
  'github',
  'codex',
  'admin internals',
  'infrastructure'
];

const prohibitedClaims = ['invent_price', 'invent_driver_location', 'invent_booking_status', 'auto_email', 'auto_invoice'];

export const MONI_OWNER_ESCALATION_CONTACT = 'Leonardo Daniel Vargas Hinojosa';

export const customerResponseRules = {
  neverExposeInternalTopics: forbiddenCustomerTopics,
  prohibitedClaims,
  safeFallback:
    'I can only share verified booking and operations information. For sensitive details, I will escalate to the owner/operator.'
};

export const adminResponseRules = {
  mustUseOperationalTone: true,
  includeUncertaintyWhenDataMissing: true,
  noUnverifiedStatus: true,
  noFabricatedMetrics: true
};
