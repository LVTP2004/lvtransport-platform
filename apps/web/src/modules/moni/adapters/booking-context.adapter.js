export const requiredBookingFields = [
    'pickup',
    'destination',
    'date',
    'time',
    'passengers',
    'contactDetails'
];
export const getMissingBookingFields = (context) => {
    const known = context.booking?.knownFields ?? {};
    return requiredBookingFields.filter((field) => !known[field]);
};
export const explainBookingStatus = (status) => {
    const normalized = (status ?? 'unknown').toLowerCase();
    const map = {
        pending: 'Your booking is pending review by dispatch.',
        accepted: 'Your booking has been accepted by operations.',
        assigned: 'A driver has been assigned to your ride.',
        onderweg: 'The assigned driver is on the way.',
        arrived: 'Your driver has arrived at the pickup location.',
        in_progress: 'Your ride is currently in progress.',
        completed: 'Your ride has been completed.',
        cancelled: 'This booking has been cancelled.'
    };
    return map[normalized] ?? 'Booking status is currently unverified. Please share your booking code for confirmation.';
};
