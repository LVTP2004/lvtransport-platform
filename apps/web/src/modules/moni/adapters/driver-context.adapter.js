export const buildDriverSupportGuidance = (context) => {
    const topic = context.driver?.supportTopic?.toLowerCase();
    if (!topic)
        return 'Please share the driver support topic so operations can guide next steps.';
    if (topic.includes('delay'))
        return 'Driver delay reported. Ask dispatch to validate ETA and update the passenger.';
    if (topic.includes('pickup'))
        return 'Pickup issue reported. Confirm exact pickup pin and re-contact passenger before escalation.';
    if (topic.includes('safety'))
        return 'Safety-related issue detected. Stop automated guidance and escalate to owner/operator immediately.';
    return 'Driver support request received. Route to operations queue for manual resolution guidance.';
};
