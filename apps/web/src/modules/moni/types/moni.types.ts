export type MoniLanguage = 'nl' | 'es' | 'en' | 'fr';

export type MoniAudience = 'customer' | 'admin' | 'driver' | 'business';
export type MoniBranch = 'core' | 'ride' | 'driver' | 'control' | 'business' | 'airport' | 'experimental';

export type MoniEvolutionLevel = 1 | 2 | 3 | 4 | 5;

export type MoniIntent =
  | 'booking_request'
  | 'booking_status_explanation'
  | 'missing_booking_info'
  | 'admin_operational_summary'
  | 'driver_support'
  | 'onboarding_support'
  | 'lifecycle_update'
  | 'review_request'
  | 'airport_transfer'
  | 'business_request'
  | 'vip_request'
  | 'contact_request'
  | 'language_switch'
  | 'price_request'
  | 'tracking_request'
  | 'payment_issue'
  | 'complaint_or_problem'
  | 'safety_or_legal'
  | 'escalation_request'
  | 'general_question';

export type MoniBookingFields = {
  pickup?: string;
  destination?: string;
  date?: string;
  time?: string;
  passengers?: string;
  contactDetails?: string;
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

export type MoniEscalationReason = 'sensitive' | 'unclear' | 'payment' | 'complaint' | 'safety' | 'legal';

export type MoniContextEnvelope = {
  onboarding?: {
    googleConnected?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    identityVerified?: boolean;
  };
  booking?: { bookingId?: string; status?: string; knownFields?: MoniBookingFields };
  admin?: { activeBookings?: number; delayedBookings?: number; openIncidents?: number; notes?: string[] };
  driver?: { driverId?: string; activeRideId?: string; supportTopic?: string };
};

export type MoniResponse = {
  branch: MoniBranch;
  evolutionLevel: MoniEvolutionLevel;
  language: MoniLanguage;
  audience: MoniAudience;
  intent: MoniIntent;
  text: string;
  escalation: { required: boolean; reason?: MoniEscalationReason; owner?: string };
  audit: { safe: boolean; flags: string[]; timestampIso: string };
};

export type MoniLearningClassification =
  | 'successful_booking'
  | 'incomplete_booking'
  | 'unclear_intent'
  | 'customer_confusion'
  | 'price_question'
  | 'tracking_issue'
  | 'airport_vip_request'
  | 'complaint'
  | 'escalation_needed'
  | 'potential_improvement';

export type MoniReviewStatus = 'draft' | 'reviewed' | 'approved' | 'rejected' | 'production_enabled';

export type MoniLearningRecord = {
  interactionId: string;
  timestamp: string;
  language: MoniLanguage;
  intent: MoniIntent;
  bookingStage: string;
  success: boolean;
  failureReason: string;
  customerEmotion: string;
  moniResponseQuality: number;
  operationalRisk: 'low' | 'medium' | 'high';
  suggestedImprovement: string;
  reviewStatus: MoniReviewStatus;
  classification: MoniLearningClassification;
  scores: {
    clarityScore: number;
    customerSatisfactionSignal: number;
    completionSuccess: number;
    bookingConversion: number;
    responseAccuracy: number;
    operationalRiskScore: number;
    toneQuality: number;
    escalationCorrectness: number;
  };
  weaknessPatterns: string[];
};
