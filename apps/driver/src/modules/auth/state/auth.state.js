import { useEffect, useMemo, useState } from 'react';
const STORAGE_KEY = 'lvtransport.driver.auth';
const initialState = { isAuthenticated: false, isLoading: false };
export function useAuthState() {
    const [state, setState] = useState(initialState);
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setState(JSON.parse(saved));
        }
    }, []);
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);
    const clearSession = () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(initialState);
    };
    return useMemo(() => ({ state, setState, clearSession }), [state]);
}
