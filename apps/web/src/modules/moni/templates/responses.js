const intro = {
    nl: 'Moni Core is actief. Ik begeleid u kalm en realtime via Moni Ride binnen het LV Transport ecosysteem.',
    en: 'Moni Core is active. I will guide you calmly and in realtime through Moni Ride in the LV Transport ecosystem.',
    es: 'Moni Core está activo. Le guiaré con calma y en tiempo real a través de Moni Ride en el ecosistema LV Transport.',
    fr: 'Moni Core est actif. Je vous guide avec calme et en temps réel via Moni Ride dans l’écosystème LV Transport.'
};
const intentReply = {
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
export const buildIntro = (lang) => intro[lang];
export const buildIntentReply = (lang, intent) => intentReply[lang][intent] ?? '';
