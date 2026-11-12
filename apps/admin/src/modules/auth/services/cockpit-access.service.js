import { authorizeAdminSession } from '../route-guards/admin-access';
export class AdminAuthorizationError extends Error {
}
// The service is a code-owned authentication dependency, never browser input.
// This function cannot authenticate the service itself. Its implementation must
// verify a real session; the current composition root explicitly returns signed out.
export async function verifyCurrentAdminAccess(service) {
    const state = await service.getInitialState();
    if (state.isAuthenticated !== true || state.isLoading !== false) {
        throw new AdminAuthorizationError('A verified admin session is required.');
    }
    const [session, profile] = await Promise.all([
        service.getSession(state.tokens?.accessToken), service.getUserProfile(),
    ]);
    const access = authorizeAdminSession(state, session, profile, Date.now());
    if (!access)
        throw new AdminAuthorizationError('A verified admin or super_admin session is required.');
    return access;
}
// Checking again here protects the fetch boundary even if a caller accidentally
// mounts a cockpit component without its render gate. No role or auth boolean
// supplied by a route/form can authorize requests. Tests inject a synthetic
// SessionReader only to test sequencing; it is not a production identity provider.
export async function loadAuthorizedCockpit(service, expected, apiBase, signal) {
    if (!Number.isFinite(expected.expiresAt) || Date.now() >= expected.expiresAt) {
        throw new AdminAuthorizationError('Admin session expired.');
    }
    let current;
    try {
        current = await verifyCurrentAdminAccess(service);
    }
    catch {
        throw new AdminAuthorizationError('Admin session could not be verified.');
    }
    if (signal.aborted || current.userId !== expected.userId ||
        current.accessToken !== expected.accessToken || Date.now() >= current.expiresAt) {
        throw new AdminAuthorizationError('Admin session changed or expired.');
    }
    const options = { headers: { Authorization: `Bearer ${current.accessToken}` }, signal };
    const responses = await Promise.all([
        fetch(`${apiBase}/admin/bookings`, options),
        fetch(`${apiBase}/drivers/live-states`, options),
        fetch(`${apiBase}/operations/incidents`, options),
    ]);
    if (responses.some((response) => response.status === 401 || response.status === 403)) {
        throw new AdminAuthorizationError('Operational access denied.');
    }
    if (responses.some((response) => !response.ok))
        throw new Error('Operational sources unavailable.');
    const [bookings, drivers, incidents] = await Promise.all(responses.map((response) => response.json()));
    if (signal.aborted || Date.now() >= Math.min(current.expiresAt, expected.expiresAt)) {
        throw new AdminAuthorizationError('Admin session changed or expired.');
    }
    if (!Array.isArray(bookings?.bookings) || !Array.isArray(drivers?.drivers) ||
        !Array.isArray(incidents?.incidents))
        throw new Error('Invalid operational response.');
    return { bookings: bookings.bookings, drivers: drivers.drivers, incidents: incidents.incidents };
}
