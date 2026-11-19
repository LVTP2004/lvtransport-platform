import type { AuthRole } from '../models/request-auth-context.js';
import type { IdentityVerifier } from '../middleware/authenticate.js';

/** Subset of the official Admin SDK, supplied by trusted bootstrap, not HTTP. */
export interface AdminAuthSdk {
  verifyIdToken(token: string, checkRevoked: boolean): Promise<{
    uid: string; aud: string; iss: string; exp: number; iat: number; auth_time: number;
  }>;
  getUser(uid: string): Promise<{
    uid: string; disabled: boolean; customClaims?: Record<string, unknown>;
  }>;
}

export function createFirebaseIdentityVerifier(sdk: AdminAuthSdk, projectId: string,
  now: () => number = Date.now, options: { allowUnassignedCustomer?: boolean } = {}): IdentityVerifier {
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) throw new Error('Invalid Firebase project');
  return async token => {
    const decoded = await sdk.verifyIdToken(token, true);
    const seconds = now() / 1000;
    if (!decoded.uid || decoded.aud !== projectId || decoded.iss !== `https://securetoken.google.com/${projectId}`
        || ![decoded.exp, decoded.iat, decoded.auth_time].every(Number.isFinite)
        || decoded.exp <= seconds || decoded.iat > seconds || decoded.auth_time > seconds) {
      throw new Error('Invalid identity');
    }
    const account = await sdk.getUser(decoded.uid);
    const role = account.customClaims?.role;
    // Public customer sign-in may identify an unassigned account for its OWN
    // bookings only. No claims are written and operational verifiers remain strict.
    if (options.allowUnassignedCustomer === true && account.uid === decoded.uid && account.disabled === false
        && role === undefined && account.customClaims?.status === undefined) {
      return { userId: account.uid, role: 'customer', status: 'active' };
    }
    if (account.uid !== decoded.uid || account.disabled !== false || account.customClaims?.status !== 'active'
        || typeof role !== 'string' || !['customer', 'driver', 'admin', 'super_admin'].includes(role)) {
      throw new Error('Inactive or unauthorized identity');
    }
    return { userId: account.uid, role: role as AuthRole, status: 'active' };
  };
}
