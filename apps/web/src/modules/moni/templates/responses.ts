import type { MoniIntent, MoniLanguage } from '../types/moni.types';

const intro: Record<MoniLanguage, string> = {
  nl: 'Natuurlijk, ik help u graag met uw rit bij LV Transport.',
  en: 'Of course, I can help with your booking at LV Transport.',
  es: 'Claro, le ayudo con su reserva en LV Transport.',
  fr: 'Bien sûr, je peux vous aider avec votre réservation chez LV Transport.'
};

const intentReply: Record<MoniLanguage, Partial<Record<MoniIntent, string>>> = {
  nl: {
    booking_request: 'Ik kan uw boeking voorbereiden zodra ophaalpunt, bestemming, datum, uur, passagiers en contactgegevens bevestigd zijn.',
    booking_status_explanation: 'Ik deel alleen geverifieerde statusinformatie uit het boekingssysteem.',
    admin_operational_summary: 'Ik kan een operationele samenvatting geven op basis van bevestigde metrics.',
    driver_support: 'Ik kan basis chauffeurondersteuning geven en escaleren als nodig.'
  },
  en: {
    booking_request: 'I can prepare your booking once pickup, destination, date, time, passenger count, and contact details are confirmed.'
  },
  es: {
    booking_request: 'Puedo preparar su reserva cuando confirme recogida, destino, fecha, hora, pasajeros y datos de contacto.'
  },
  fr: {
    booking_request: 'Je peux préparer votre réservation après confirmation du départ, destination, date, heure, passagers et coordonnées.'
  }
};

export const buildIntro = (lang: MoniLanguage) => intro[lang];
export const buildIntentReply = (lang: MoniLanguage, intent: MoniIntent) => intentReply[lang][intent] ?? '';
