export type LeoOrchestrationPayload = {
  correlationId: string;
  conversationId: string;
  channel: 'customer' | 'admin' | 'driver';
  language: string;
  prompt: string;
  contextSummary: string;
};

export const buildLeoOrchestrationPayload = (payload: LeoOrchestrationPayload): LeoOrchestrationPayload => payload;
