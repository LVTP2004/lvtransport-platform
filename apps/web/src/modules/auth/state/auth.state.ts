import { useMemo, useState } from 'react';
import type { AuthState } from '@lvtransport/auth';

export function useAuthState() {
  const [state, setState] = useState<AuthState>({ isAuthenticated: false, isLoading: false });
  return useMemo(() => ({ state, setState }), [state]);
}
