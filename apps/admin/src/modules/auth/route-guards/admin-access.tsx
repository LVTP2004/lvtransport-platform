import type { ReactNode } from 'react';

export interface AdminAccess {
  userId: string;
  accessToken: string;
  expiresAt: number;
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// These inputs must come from a verified provider, never browser storage,
// form fields or a locally decoded token. This is a policy check, not a token
// verifier. The current composition root has no real provider and denies all.
export function authorizeAdminSession(
  state: unknown, session: unknown, profile: unknown, now: number
): AdminAccess | null {
  if (!Number.isFinite(now) || !record(state) || state.isAuthenticated !== true ||
      state.isLoading !== false || !record(state.user) || !record(state.tokens) ||
      !record(session) || session.authenticated !== true || session.provider !== 'firebase' ||
      !record(profile) || profile.status !== 'active' ||
      (profile.role !== 'admin' && profile.role !== 'super_admin')) return null;
  const userId = state.user.id;
  const token = state.tokens.accessToken;
  const expiresAt = state.tokens.expiresAt;
  if (typeof userId !== 'string' || !userId.trim() || profile.id !== userId ||
      session.userId !== userId || typeof token !== 'string' || !token.trim() ||
      session.token !== token || typeof expiresAt !== 'number' ||
      !Number.isFinite(expiresAt) || expiresAt <= now) return null;
  return { userId, accessToken: token, expiresAt };
}

export function AdminAccessGate({ access, children, now = Date.now() }: {
  access: AdminAccess | null;
  children: (access: AdminAccess) => ReactNode;
  now?: number;
}) {
  // A render callback prevents operational components from mounting before
  // the parent has resolved provider authentication and the admin role policy.
  return <>{access && Number.isFinite(now) && access.expiresAt > now ? children(access) : null}</>;
}
