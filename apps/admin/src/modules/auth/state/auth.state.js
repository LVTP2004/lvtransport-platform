import { useMemo, useState } from 'react';
export function useAuthState() { const [state, setState] = useState({ isAuthenticated: false, isLoading: false }); return useMemo(() => ({ state, setState }), [state]); }
