import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
export function ProtectedRoute({ allowed, children }) { return _jsx(_Fragment, { children: allowed ? children : null }); }
