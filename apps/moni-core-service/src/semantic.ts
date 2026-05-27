export function interpretEvent(eventType: string, payload: any) {
  if (eventType === "booking.created") {
    return {
      semantic_status: "booking_initialized",
      meaning: "A new booking entered the operational system.",
      risk_level: "low"
    };
  }

  if (eventType === "dispatch.assigned") {
    return {
      semantic_status: "driver_assignment_confirmed",
      meaning: "A driver was assigned to a booking.",
      risk_level: "low"
    };
  }

  if (eventType === "ride.started") {
    return {
      semantic_status: "ride_in_progress",
      meaning: "A ride lifecycle has started.",
      risk_level: "medium"
    };
  }

  if (eventType === "runtime.degraded") {
    return {
      semantic_status: "runtime_degradation_detected",
      meaning: "The runtime reported degraded operational state.",
      risk_level: "high"
    };
  }

  return {
    semantic_status: "unclassified_event",
    meaning: "Event received but no semantic rule exists yet.",
    risk_level: "unknown"
  };
}
