import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
export function ProtectedRoute({ isAuthenticated, allowedRoles, role, children }) {
    const allowed = isAuthenticated && !!role && allowedRoles.includes(role);
    return _jsx(_Fragment, { children: allowed ? children : null });
}
