import type { MoniIntent } from '../types/moni.types';

const intentPatterns: Array<{ intent: MoniIntent; pattern: RegExp }> = [
  { intent: 'tracking_request', pattern: /(track|volg|status|where is|waar is|reserveringscode|code)/i },
  { intent: 'airport_transfer', pattern: /(airport|luchthaven|zaventem|charleroi|antwerp|eindhoven|schiphol)/i },
  { intent: 'business_request', pattern: /(zakelijk|business|company|maandelijks|invoicing|recurring)/i },
  { intent: 'vip_request', pattern: /(vip|executive|discreet)/i },
  { intent: 'price_request', pattern: /(prijs|price|estimate|kost|fare)/i },
  { intent: 'contact_request', pattern: /(contact|bellen|phone|email|support|helpdesk)/i },
  { intent: 'complaint_or_problem', pattern: /(problem|klacht|issue|cancel|vertraging|delay)/i },
  { intent: 'booking_request', pattern: /(boek|book|reserve|rit|ride|taxi)/i },
  { intent: 'language_switch', pattern: /(english|español|nederlands|dutch|spanish)/i }
];

export const detectIntent = (text: string): MoniIntent => {
  const found = intentPatterns.find((entry) => entry.pattern.test(text));
  return found?.intent ?? 'general_question';
};
