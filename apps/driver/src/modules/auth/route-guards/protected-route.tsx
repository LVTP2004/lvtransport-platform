import type { ReactNode } from 'react';
export function ProtectedRoute({ allowed, children }: { allowed: boolean; children: ReactNode }) { return <>{allowed ? children : null}</>; }
