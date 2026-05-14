export type BookingState =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'driver_on_route'
  | 'pickup'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type OperationalEvent =
  | 'booking_request'
  | 'delayed_pickup'
  | 'flight_delay'
  | 'booking_cancellation'
  | 'route_change'
  | 'eta_request'
  | 'lost_booking_code'
  | 'payment_confusion'
  | 'repeated_questions'
  | 'incomplete_booking'
  | 'unavailable_route'
  | 'unavailable_pricing'
  | 'api_unavailable'
  | 'duplicate_requests';

export interface SimulationTurn {
  customerId: string;
  language: 'nl' | 'en' | 'es';
  state: BookingState;
  event: OperationalEvent;
}

export function moniResponse(turn: SimulationTurn): string {
  const opening = turn.language === 'nl'
    ? 'Ik help u meteen verder.'
    : turn.language === 'es'
      ? 'Le ayudo de inmediato.'
      : 'I will assist you right away.';

  const stateHint = `Huidige status: ${turn.state}.`;

  const handlers: Record<OperationalEvent, string> = {
    booking_request: 'Ik verzamel nu uw ritgegevens en bevestig stap voor stap.',
    delayed_pickup: 'Uw chauffeur is vertraagd; ik monitor live en geef direct een nieuwe ETA.',
    flight_delay: 'Dank voor de update. Ik pas de ophaaltijd aan op basis van uw nieuwe landingstijd.',
    booking_cancellation: 'Ik help u de boeking veilig te annuleren en bevestig de annulatiestatus.',
    route_change: 'Ik werk de route direct bij en bevestig het aangepaste traject.',
    eta_request: 'Ik controleer de actuele aankomsttijd en geef u een duidelijke update.',
    lost_booking_code: 'Geen probleem, ik valideer uw rit via naam en tijdstip en help u verder.',
    payment_confusion: 'Ik licht de betaalstappen helder toe zodat u precies weet wat nu nodig is.',
    repeated_questions: 'Ik vat alles rustig samen en bevestig wat al geregeld is.',
    incomplete_booking: 'Er ontbreekt nog informatie; ik begeleid u per stap tot de boeking compleet is.',
    unavailable_route: 'Deze route is nu niet beschikbaar, ik bied direct een haalbaar alternatief.',
    unavailable_pricing: 'De prijs is nu niet direct beschikbaar; ik bevestig een alternatief voorstel.',
    api_unavailable: 'Er is tijdelijk een vertraging in verwerking, maar ik bewaak uw aanvraag en ga verder.',
    duplicate_requests: 'Ik zie dubbele aanvragen en consolideer die veilig tot één correcte boeking.'
  };

  return `${opening} ${stateHint} ${handlers[turn.event]}`;
}
