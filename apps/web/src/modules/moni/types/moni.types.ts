export type MoniLanguage = 'nl' | 'es' | 'en';

export type MoniIntent =
  | 'booking_request'
  | 'price_request'
  | 'airport_transfer'
  | 'business_request'
  | 'vip_request'
  | 'tracking_request'
  | 'contact_request'
  | 'complaint_or_problem'
  | 'language_switch'
  | 'general_question';

export type MoniBookingFields = {
  pickup?: string;
  destination?: string;
  date?: string;
  time?: string;
  passengers?: string;
  luggage?: string;
  vehiclePreference?: string;
  flightNumber?: string;
  terminal?: string;
  returnTrip?: string;
  businessVipNeeds?: string;
  name?: string;
  phone?: string;
  email?: string;
};

export type MoniMessage = { role: 'assistant' | 'user'; text: string };
