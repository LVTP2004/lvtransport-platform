import type { MoniResponse } from '../types/moni.types';

export type MoniAuditEntry = {
  responseId: string;
  language: string;
  intent: string;
  audience: string;
  escalationRequired: boolean;
  flags: string[];
  createdAtIso: string;
};

export const toAuditEntry = (response: MoniResponse): MoniAuditEntry => ({
  responseId: `moni_${Date.now()}`,
  language: response.language,
  intent: response.intent,
  audience: response.audience,
  escalationRequired: response.escalation.required,
  flags: response.audit.flags,
  createdAtIso: response.audit.timestampIso
});
