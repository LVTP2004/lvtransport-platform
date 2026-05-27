export function shouldCreateIncident(risk: any) {
  return risk.risk_score >= 80;
}

export function buildIncident(eventType: string, risk: any) {
  if (eventType === "runtime.degraded") {
    return {
      severity: "HIGH",
      recovery_action: "restart_lvtp_runtime",
      recommendation: risk.recommendation
    };
  }

  return {
    severity: "HIGH",
    recovery_action: "operator_review_required",
    recommendation: risk.recommendation
  };
}
