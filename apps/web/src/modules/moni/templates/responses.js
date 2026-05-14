const intro = {
    nl: 'Natuurlijk, ik help u graag met uw rit bij LV Transport.',
    en: 'Of course, I can help with your booking at LV Transport.',
    es: 'Claro, le ayudo con su reserva en LV Transport.'
};
const intentReply = {
    nl: {
        price_request: 'Ik kan een geschatte prijs delen op basis van route, tijd, afstand en opties. Definitieve prijzen worden altijd bevestigd in het boekingssysteem.',
        tracking_request: 'Graag uw reserveringscode. U kunt die ook invoeren op de trackingpagina voor statusupdates: pending, confirmed, assigned, driver_on_route, pickup, in_progress, completed or cancelled.',
        contact_request: 'U kunt ons rechtstreeks contacteren voor dringende hulp. Ik help u ook graag eerst met een samenvatting van uw aanvraag.',
        business_request: 'Voor zakelijke klanten bieden we terugkerende ritten, vaste luchthavenroutes en maandelijkse facturatie op maat.',
        vip_request: 'Onze VIP-service omvat executive rides, discrete service en prioritaire dispatch.'
    },
    en: {}, es: {}
};
export const buildIntro = (lang) => intro[lang];
export const buildIntentReply = (lang, intent) => intentReply[lang][intent] ?? '';
