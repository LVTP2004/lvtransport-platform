import type { ReactNode } from 'react';
import type { UserRole } from '@lvtransport/auth';

export function ProtectedRoute({
  isAuthenticated,
  allowedRoles,
  role,
  children
}: {
  isAuthenticated: boolean;
  allowedRoles: UserRole[];
  role?: UserRole;
  children: ReactNode;
}) {
  const allowed = isAuthenticated && !!role && allowedRoles.includes(role);
  return <>{allowed ? children : null}</>;
}
