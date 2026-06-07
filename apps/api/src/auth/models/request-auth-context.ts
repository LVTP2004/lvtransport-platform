export type AuthRole = 'customer' | 'driver' | 'admin' | 'super_admin';
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
