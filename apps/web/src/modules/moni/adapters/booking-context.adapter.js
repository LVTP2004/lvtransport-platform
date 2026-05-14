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
        assigned: 'A driver has been assigned to your ride.',
        on_route: 'Your driver is now on the way to your pickup point.',
        accepted: 'Your assigned driver has acknowledged your ride.',
        en_route: 'The assigned driver is on the way.',
        arrived: 'Your driver has arrived at the pickup location.',
        in_progress: 'Your ride is currently in progress.',
        completed: 'Your ride has been completed.',
        cancelled: 'This booking has been cancelled.',
        failed: 'This booking needs operational support. Please contact support with your booking code.'
    };
    return map[normalized] ?? 'Booking status is currently unverified. Please share your booking code for confirmation.';
};
export const explainOnboardingStatus = (context) => {
    const onboarding = context.onboarding ?? {};
    const missing = [];
    if (!onboarding.googleConnected)
        missing.push('Google Sign-In');
    if (!onboarding.emailVerified)
        missing.push('email verification');
    if (!onboarding.phoneVerified)
        missing.push('phone confirmation');
    if (!onboarding.identityVerified)
        missing.push('verified identity check');
    if (!missing.length) {
        return 'Your premium onboarding is fully verified. You can proceed with booking, tracking, and VIP/business operations.';
    }
    return `To unlock premium operational actions, please complete: ${missing.join(', ')}.`;
};
