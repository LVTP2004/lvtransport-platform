import type { BookingRecord as MoniBookingRecord, BookingStatus, NotificationEvent } from "./types";

export type MoniLocale = "en" | "es" | "fr" | "nl";

export interface MoniBookingIntake {
  pickupLocation?: string;
  destination?: string;
  date?: string;
  time?: string;
  passengerCount?: number;
  customerName?: string;
  contactMethod?: string;
  locale?: MoniLocale;
  notes?: string;
}

export interface BookingEngineCreateRequest {
  customerName: string;
  contactMethod: string;
  pickupLocation: string;
  destination: string;
  scheduledFor: string;
  passengerCount: number;
  notes?: string;
}

export interface BookingEngineRecord {
  id: string;
  status: string;
  referenceCode?: string;
}

export interface BookingEngineGateway {
  createBooking(input: BookingEngineCreateRequest, idempotencyKey: string): Promise<BookingEngineRecord>;
}

export interface MoniAuditLogger {
  log(event: MoniAuditEvent): Promise<void> | void;
}

export interface MoniAuditEvent {
  type:
    | "booking_intake_started"
    | "booking_intake_missing_fields"
    | "booking_engine_create_requested"
    | "booking_engine_create_success"
    | "booking_engine_create_failed"
    | "control_tower_escalation"
    | "handoff_to_human";
  conversationId: string;
  bookingId?: string;
  metadata: Record<string, string | number | boolean | null>;
  timestamp: string;
}

export interface MoniBookingAdapterDependencies {
  bookingEngine: BookingEngineGateway;
  auditLogger?: MoniAuditLogger;
  now?: () => string;
}

export interface MoniBookingAdapterResult {
  outcome: "needs_more_information" | "created" | "escalated" | "handoff_required";
  missingFields: Array<keyof Required<MoniBookingIntake>>;
  response: string;
  booking?: BookingEngineRecord;
  notifications: NotificationEvent[];
  safeFallbackUsed: boolean;
}

const REQUIRED_FIELDS: Array<keyof Required<MoniBookingIntake>> = [
  "pickupLocation",
  "destination",
  "date",
  "time",
  "passengerCount",
  "customerName",
  "contactMethod",
];

const RESPONSE_TEMPLATES: Record<MoniLocale, Record<string, string>> = {
  en: {
    intake_missing: "I can help with your booking. I still need: {{fields}}.",
    booking_created: "Your request was sent to LV booking and is now pending confirmation.",
    conflict_escalated: "I cannot complete this automatically. I escalated this to Control Tower.",
    handoff: "I am handing this conversation to a human operator for secure follow-up.",
    fallback: "I can only continue with verified booking data. Please share the missing details.",
  },
  es: {
    intake_missing: "Puedo ayudarte con tu reserva. Aún necesito: {{fields}}.",
    booking_created: "Tu solicitud fue enviada al sistema de reservas de LV y está pendiente de confirmación.",
    conflict_escalated: "No puedo completar esto automáticamente. Lo he escalado a Control Tower.",
    handoff: "Estoy transfiriendo esta conversación a un operador humano para seguimiento seguro.",
    fallback: "Solo puedo continuar con datos de reserva verificados. Comparte los detalles faltantes.",
  },
  fr: {
    intake_missing: "Je peux vous aider avec votre réservation. Il me manque encore : {{fields}}.",
    booking_created: "Votre demande a été envoyée au système de réservation LV et attend une confirmation.",
    conflict_escalated: "Je ne peux pas finaliser cela automatiquement. J'ai escaladé vers la Control Tower.",
    handoff: "Je transfère cette conversation à un opérateur humain pour un suivi sécurisé.",
    fallback: "Je peux continuer uniquement avec des données de réservation vérifiées. Merci d'envoyer les informations manquantes.",
  },
  nl: {
    intake_missing: "Ik kan helpen met je boeking. Ik heb nog nodig: {{fields}}.",
    booking_created: "Je aanvraag is naar het LV boekingssysteem gestuurd en wacht op bevestiging.",
    conflict_escalated: "Ik kan dit niet automatisch afronden. Ik heb dit geëscaleerd naar Control Tower.",
    handoff: "Ik draag dit gesprek over aan een menselijke operator voor veilige opvolging.",
    fallback: "Ik kan alleen doorgaan met geverifieerde boekingsgegevens. Deel de ontbrekende details.",
  },
};

export class MoniBookingAdapter {
  constructor(private readonly deps: MoniBookingAdapterDependencies) {}

  async handleBookingIntake(conversationId: string, intake: MoniBookingIntake): Promise<MoniBookingAdapterResult> {
    const now = this.deps.now?.() ?? new Date().toISOString();
    const locale = intake.locale ?? "en";

    await this.log({ type: "booking_intake_started", conversationId, metadata: { locale }, timestamp: now });

    const missingFields = this.getMissingFields(intake);
    if (missingFields.length > 0) {
      await this.log({
        type: "booking_intake_missing_fields",
        conversationId,
        metadata: { missingFields: missingFields.join(",") },
        timestamp: now,
      });

      return {
        outcome: "needs_more_information",
        missingFields,
        response: this.render(locale, "intake_missing", missingFields.join(", ")),
        notifications: [],
        safeFallbackUsed: true,
      };
    }

    const scheduledFor = `${intake.date}T${intake.time}`;
    const payload: BookingEngineCreateRequest = {
      customerName: intake.customerName!,
      contactMethod: intake.contactMethod!,
      pickupLocation: intake.pickupLocation!,
      destination: intake.destination!,
      scheduledFor,
      passengerCount: intake.passengerCount!,
      notes: intake.notes,
    };

    const idempotencyKey = `moni:${conversationId}:${scheduledFor}:${payload.customerName}`;

    await this.log({ type: "booking_engine_create_requested", conversationId, metadata: { idempotencyKey }, timestamp: now });

    try {
      const booking = await this.deps.bookingEngine.createBooking(payload, idempotencyKey);
      await this.log({
        type: "booking_engine_create_success",
        conversationId,
        bookingId: booking.id,
        metadata: { bookingStatus: booking.status, referenceCode: booking.referenceCode ?? null },
        timestamp: now,
      });

      return {
        outcome: "created",
        missingFields: [],
        response: this.render(locale, "booking_created"),
        booking,
        notifications: [],
        safeFallbackUsed: false,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "booking_engine_error";
      await this.log({
        type: "control_tower_escalation",
        conversationId,
        metadata: { reason },
        timestamp: now,
      });

      return {
        outcome: "escalated",
        missingFields: [],
        response: this.render(locale, "conflict_escalated"),
        notifications: [],
        safeFallbackUsed: true,
      };
    }
  }

  buildHandoffResponse(locale: MoniLocale, conversationId: string): string {
    void this.log({
      type: "handoff_to_human",
      conversationId,
      metadata: { reason: "sensitive_case" },
      timestamp: this.deps.now?.() ?? new Date().toISOString(),
    });
    return this.render(locale, "handoff");
  }

  buildStatusResponse(locale: MoniLocale, status: BookingStatus): string {
    return `Booking status: ${status}. ${this.render(locale, "fallback")}`;
  }

  private getMissingFields(intake: MoniBookingIntake): Array<keyof Required<MoniBookingIntake>> {
    return REQUIRED_FIELDS.filter((field) => {
      const value = intake[field];
      if (typeof value === "number") return value <= 0;
      return value === undefined || value === null || `${value}`.trim().length === 0;
    });
  }

  private render(locale: MoniLocale, key: string, fields?: string): string {
    const template = RESPONSE_TEMPLATES[locale][key] ?? RESPONSE_TEMPLATES.en.fallback;
    return fields ? template.replace("{{fields}}", fields) : template;
  }

  private async log(event: MoniAuditEvent): Promise<void> {
    await this.deps.auditLogger?.log(event);
  }
}
