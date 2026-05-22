import { useEffect, useMemo, useState } from 'react';
import type { AuthState, UserRole } from '@lvtransport/auth';

const STORAGE_KEY = 'lvtransport.admin.auth';

export interface PortalAuthState extends AuthState {
  role?: UserRole;
}

const initialState: PortalAuthState = { isAuthenticated: false, isLoading: false };

export function useAuthState() {
  const [state, setState] = useState<PortalAuthState>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setState(JSON.parse(saved) as PortalAuthState);
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
