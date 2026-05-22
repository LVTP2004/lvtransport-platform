export const prepareReviewQueueItem = (entry) => {
    const highPriority = entry.escalationRequired || entry.flags.length > 0;
    return {
        ...entry,
        priority: highPriority ? 'high' : 'normal',
        reason: highPriority ? 'Escalation or safety flags detected.' : 'Routine audit review.'
    };
};
