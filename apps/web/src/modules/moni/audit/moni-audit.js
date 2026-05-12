export const toAuditEntry = (response) => ({
    responseId: `moni_${Date.now()}`,
    language: response.language,
    intent: response.intent,
    audience: response.audience,
    escalationRequired: response.escalation.required,
    flags: response.audit.flags,
    createdAtIso: response.audit.timestampIso
});
