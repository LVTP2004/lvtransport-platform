import type {
  AdminAlert,
  BookingFlowDependencies,
  BookingRecord,
  BookingRequest,
  DispatchContext,
  DispatchDecision,
  DispatchOutcome,
  DriverCandidate,
} from "./types";
import { buildCustomerStatusNotification, buildDriverAssignmentNotification } from "./notifications";

const nowIso = () => new Date().toISOString();

const newBookingRecord = (id: string, request: BookingRequest, now: string): BookingRecord => ({
  id,
  request,
  status: "pending",
  createdAt: now,
  updatedAt: now,
});

const resolveLanguage = (request: BookingRequest): "nl" | "en" | "es" | "fr" => {
  if (request.requestedLanguage) return request.requestedLanguage;
  const text = `${request.pickupAddress} ${request.dropoffAddress} ${request.notes ?? ""}`.toLowerCase();
  if (/(straat|laan|plein|dank)/.test(text)) return "nl";
  if (/(aeropuerto|gracias|calle)/.test(text)) return "es";
  if (/(aeroport|merci|rue)/.test(text)) return "fr";
  return "en";
};

const scoreCandidate = (candidate: DriverCandidate, booking: BookingRecord, context: DispatchContext): DispatchDecision => {
  const reasons: string[] = [];
  const proximity = Math.max(0, 1 - (candidate.distanceKm ?? 99) / 15);
  const rating = (candidate.rating ?? 4.5) / 5;
  const workload = 1 - Math.min((candidate.activeWorkload ?? 0) / 5, 1);
  const reliability = candidate.reconnectReliability ?? 0.85;
  const airportPenalty = Math.min((context.airportCongestionIndex ?? 0.2) * 0.15, 0.2);
  const trafficPenalty = Math.min((context.trafficIndex ?? 0.2) * 0.1, 0.15);
  const vipBoost = booking.request.priority === "vip" ? 0.1 : booking.request.priority === "business" ? 0.05 : 0;
  const availabilityGate = candidate.availability === "available" ? 1 : 0;

  const score = Number(
    (availabilityGate * (proximity * 0.35 + rating * 0.25 + workload * 0.2 + reliability * 0.2 + vipBoost - airportPenalty - trafficPenalty)).toFixed(4),
  );

  reasons.push(`proximity:${proximity.toFixed(2)}`);
  reasons.push(`rating:${rating.toFixed(2)}`);
  reasons.push(`workload:${workload.toFixed(2)}`);
  reasons.push(`reliability:${reliability.toFixed(2)}`);
  if (vipBoost > 0) reasons.push(`priority_boost:${vipBoost.toFixed(2)}`);
  reasons.push(`traffic_penalty:${trafficPenalty.toFixed(2)}`);
  reasons.push(`airport_penalty:${airportPenalty.toFixed(2)}`);

  return { candidate, score, reasons };
};

export const startBookingFlow = async (
  bookingId: string,
  request: BookingRequest,
  deps: BookingFlowDependencies
): Promise<DispatchOutcome> => {
  const now = deps.now ?? nowIso;
  const booking = newBookingRecord(bookingId, request, now());
  booking.operationalIntelligence = { language: resolveLanguage(request) };

  const validation = await deps.validateBooking(request);
  if (!validation.valid) {
    booking.status = "issue";
    booking.issueMessage = validation.reason ?? "Booking validation failed.";
    booking.updatedAt = now();

    return {
      booking,
      notifications: [buildCustomerStatusNotification(booking, "We need a quick review before proceeding.")],
      adminAlert: createAdminAlert(booking, "validation_failed", booking.issueMessage, now()),
    };
  }

  booking.status = "validated";
  booking.updatedAt = now();

  try {
    const price = await deps.estimatePrice(request);
    booking.estimatedPrice = price.amount;
    booking.status = "priced";
    booking.updatedAt = now();
  } catch (error) {
    const pricingMessage =
      error instanceof Error && error.message ? error.message : "Pricing service unavailable during booking.";

    booking.status = "issue";
    booking.issueMessage = pricingMessage;
    booking.updatedAt = now();

    return {
      booking,
      notifications: [buildCustomerStatusNotification(booking, "We're reviewing your fare before dispatching a driver.")],
      adminAlert: createAdminAlert(booking, "pricing_unavailable", pricingMessage, now()),
    };
  }

  booking.trackingCode = deps.generateTrackingCode(booking.id);

  const candidates = await deps.requestDriverAssignment(booking);
  const dispatchContext = deps.dispatchContext ? await deps.dispatchContext(booking) : {};
  const decisions = (candidates ?? []).map((candidate) => scoreCandidate(candidate, booking, dispatchContext));
  const best = decisions.sort((a, b) => b.score - a.score)[0];

  if (!best || best.candidate.availability !== "available") {
    booking.status = "issue";
    booking.issueMessage = "No available driver accepted the booking yet.";
    booking.updatedAt = now();

    return {
      booking,
      notifications: [buildCustomerStatusNotification(booking, "We are still searching for a driver.")],
      adminAlert: createAdminAlert(booking, "driver_not_found", booking.issueMessage, now()),
    };
  }

  applyAssignedDriver(booking, best, now());

  return {
    booking,
    notifications: [
      buildCustomerStatusNotification(booking, "Driver assignment in progress."),
      buildDriverAssignmentNotification(booking),
    ],
  };
};

const applyAssignedDriver = (booking: BookingRecord, decision: DispatchDecision, timestamp: string) => {
  booking.assignedDriverId = decision.candidate.driverId;
  booking.status = "assigned";
  booking.updatedAt = timestamp;
  booking.operationalIntelligence = {
    ...(booking.operationalIntelligence ?? { language: "en" }),
    dispatchScore: decision.score,
    dispatchRationale: decision.reasons,
  };
};

const createAdminAlert = (
  booking: BookingRecord,
  reason: AdminAlert["reason"],
  message: string,
  timestamp: string
): AdminAlert => ({
  bookingId: booking.id,
  reason,
  message,
  timestamp,
});
