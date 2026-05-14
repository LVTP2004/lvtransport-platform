export const BOOKING_STATES = [
    'pending',
    'confirmed',
    'assigned',
    'driver_on_route',
    'pickup',
    'in_progress',
    'completed',
    'cancelled'
];
const TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['assigned', 'cancelled'],
    assigned: ['driver_on_route', 'cancelled'],
    driver_on_route: ['pickup', 'cancelled'],
    pickup: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
};
export const TERMINAL_STATES = new Set(['completed', 'cancelled']);
export const normalizeBookingState = (input) => {
    if (!input)
        return null;
    const candidate = input.trim().toLowerCase();
    if (BOOKING_STATES.includes(candidate))
        return candidate;
    if (candidate === 'accepted')
        return 'confirmed';
    if (candidate === 'onderweg' || candidate === 'arrived')
        return 'driver_on_route';
    return null;
};
export const resolveLifecycleState = (current, incomingRaw) => {
    const incoming = normalizeBookingState(incomingRaw);
    if (!incoming)
        return current;
    if (!current)
        return incoming;
    if (incoming === current)
        return current;
    if (TERMINAL_STATES.has(current))
        return current;
    if (TRANSITIONS[current].includes(incoming))
        return incoming;
    return current;
};
