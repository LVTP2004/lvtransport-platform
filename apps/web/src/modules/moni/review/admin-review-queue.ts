import type { MoniAuditEntry } from '../audit/moni-audit';

export type MoniReviewQueueItem = MoniAuditEntry & {
  priority: 'normal' | 'high';
  reason: string;
};

export const prepareReviewQueueItem = (entry: MoniAuditEntry): MoniReviewQueueItem => {
  const highPriority = entry.escalationRequired || entry.flags.length > 0;
  return {
    ...entry,
    priority: highPriority ? 'high' : 'normal',
    reason: highPriority ? 'Escalation or safety flags detected.' : 'Routine audit review.'
  };
};
