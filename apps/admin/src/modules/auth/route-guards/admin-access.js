import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
const record = (value) => typeof value === 'object' && value !== null;
// These inputs must come from a verified provider, never browser storage,
// form fields or a locally decoded token. This is a policy check, not a token
// verifier. The current composition root has no real provider and denies all.
export function authorizeAdminSession(state, session, profile, now) {
    if (!Number.isFinite(now) || !record(state) || state.isAuthenticated !== true ||
        state.isLoading !== false || !record(state.user) || !record(state.tokens) ||
        !record(session) || session.authenticated !== true || session.provider !== 'firebase' ||
        !record(profile) || profile.status !== 'active' ||
        (profile.role !== 'admin' && profile.role !== 'super_admin'))
        return null;
    const userId = state.user.id;
    const token = state.tokens.accessToken;
    const expiresAt = state.tokens.expiresAt;
    if (typeof userId !== 'string' || !userId.trim() || profile.id !== userId ||
        session.userId !== userId || typeof token !== 'string' || !token.trim() ||
        session.token !== token || typeof expiresAt !== 'number' ||
        !Number.isFinite(expiresAt) || expiresAt <= now)
        return null;
    return { userId, accessToken: token, expiresAt };
}
export function AdminAccessGate({ access, children, now = Date.now() }) {
    // A render callback prevents operational components from mounting before
    // the parent has resolved provider authentication and the admin role policy.
    return _jsx(_Fragment, { children: access && Number.isFinite(now) && access.expiresAt > now ? children(access) : null });
}
