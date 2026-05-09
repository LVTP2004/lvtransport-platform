import type { ReactNode } from 'react';
export function ProtectedRoute({ allowed, children, fallback }: { allowed: boolean; children: ReactNode; fallback?: ReactNode }) {
  return <>{allowed ? children : fallback ?? null}</>;
}
