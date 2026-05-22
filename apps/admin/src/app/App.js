import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AccountStatus, UserRole } from '@lvtransport/auth';
import { adminAuthProvider, adminAuthService } from '../modules/auth/services/auth-client.service';
export function App() {
    const [authState, setAuthState] = useState({ isAuthenticated: false, isLoading: true });
    const [email, setEmail] = useState('admin@lvtransport.dev');
    const [password, setPassword] = useState('password123');
    const [allowed, setAllowed] = useState(false);
    useEffect(() => { adminAuthService.getInitialState().then(setAuthState); }, []);
    const login = async () => { const t = await adminAuthService.signIn({ email, password }); const u = await adminAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.ADMIN) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
    const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
    if (!authState.isAuthenticated)
        return _jsxs("main", { className: 'min-h-screen bg-zinc-900 p-8 text-white', children: [_jsx("h1", { className: 'text-3xl mb-4', children: "Admin Login" }), _jsx("input", { className: 'text-black p-2 mr-2', value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { className: 'text-black p-2 mr-2', type: 'password', value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { className: 'bg-amber-400 text-black px-3 py-2 rounded', onClick: login, children: "Sign in" })] });
    if (!allowed)
        return _jsxs("main", { className: 'min-h-screen bg-zinc-900 p-8 text-white', children: ["Access denied", _jsx("button", { onClick: logout, children: "Logout" })] });
    return _jsxs("main", { className: 'min-h-screen bg-zinc-900 text-white p-8', children: [_jsx("h1", { className: 'text-3xl text-amber-300', children: "Control Tower" }), _jsx("p", { children: "Authenticated admin session persisted with Firebase placeholder config." }), _jsx("button", { onClick: logout, children: "Logout" })] });
}
