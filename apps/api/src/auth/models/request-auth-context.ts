const authRoles = ['customer', 'driver', 'admin', 'super_admin', 'founder'] as const;
export type AuthRole = typeof authRoles[number];
export const isAuthRole = (value: unknown): value is AuthRole => authRoles.some(role => role === value);
export type AuthStatus = 'active' | 'inactive' | 'pending';

export type RequestAuthContext = {
  auth?: {
    userId: string;
    role: AuthRole;
    status: AuthStatus;
    token: string;
    permissions: string[];
  };
};
