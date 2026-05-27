export function assessRisk(eventType: string, semantic: any) {
  if (semantic.risk_level === "high") {
    return {
      risk_score: 90,
      recommendation: "Immediate operator review required."
    };
  }

  if (semantic.risk_level === "medium") {
    return {
      risk_score: 50,
      recommendation: "Monitor event progression and confirm continuity."
    };
  }

  if (semantic.risk_level === "low") {
    return {
      risk_score: 10,
      recommendation: "No action required. Continue monitoring."
    };
  }

  return {
    risk_score: 30,
    recommendation: "Unknown event. Add semantic rule if repeated."
  };
}
