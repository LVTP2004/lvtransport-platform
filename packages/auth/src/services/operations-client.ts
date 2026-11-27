import type { AuthProviderAdapter } from '../interfaces/auth-provider.interface.js';

export type VerifiedPortalIdentity = { userId: string; role: string; status: 'active'; permissions: string[] };
export type PortalOAuthProvider = 'google' | 'microsoft';
export type OperationsProvider = Pick<AuthProviderAdapter, 'signInWithGoogle' | 'signInWithMicrosoft' | 'linkMicrosoftAccount'
  | 'signInWithCustomToken' | 'signInWithEmailLink' | 'getSession' | 'signOut' | 'rememberSession'>;
const portalRoles = {
  admin: ['admin', 'super_admin'],
  driver: ['driver'],
  customer: ['customer'],
  founder: ['founder'],
};

const requestMessages: Record<string, string> = {
  VERSION_CONFLICT: 'This booking changed. Refresh before trying again.',
  DRIVER_UNAVAILABLE: 'The driver needs to confirm availability again.',
  DRIVER_OR_VEHICLE_BUSY: 'This driver or vehicle is already assigned to another trip.',
  BOOKING_ALREADY_ASSIGNED: 'This booking already has an assignment.',
  TERMINAL_BOOKING: 'This booking is already closed.',
  INVALID_TRANSITION: 'This action does not match the current booking status.',
  IDEMPOTENCY_CONFLICT: 'This request differs from the previous operation. Refresh the booking.',
  VEHICLE_CONFLICT: 'This registration already belongs to a registered vehicle.',
  CUSTOMER_CANCELLATION_REQUIRES_SUPPORT: 'This booking has already entered dispatch. Contact support to request cancellation.',
  PORTAL_ACCESS_DENIED: 'This account does not have access to this area.',
  SESSION_CLOSED: 'Please sign in again.',
};
export class OperationsRequestError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(requestMessages[code] ?? 'The request could not be confirmed. Please refresh and try again.');
  }
}

/** Client-side presentation gate only. The API authorizes every operation independently. */
export class VerifiedOperationsClient {
  private closed = false;
  private presenceVehicleId: string | null = null;
  private sharedLocationBookingId: string | null = null;
  private sharedLocationSessionId: string | null = null;
  constructor(private readonly provider: OperationsProvider, private readonly apiBase: string,
    private readonly expectedRole: keyof typeof portalRoles, private readonly fetcher: typeof fetch = fetch,
    private readonly onUnauthorized: () => void = () => {}) {}

  async connect(emailSignIn?: { email: string; link: string }, remember = false,
    oauth: PortalOAuthProvider = 'google'): Promise<VerifiedPortalIdentity> {
    if (!emailSignIn && oauth === 'microsoft' && !this.allowsMicrosoft()) {
      throw new OperationsRequestError('PORTAL_ACCESS_DENIED', 403);
    }
    await this.provider.rememberSession?.(remember);
    const result = emailSignIn
      ? await this.provider.signInWithEmailLink?.(emailSignIn.email, emailSignIn.link)
      : oauth === 'microsoft' ? await this.provider.signInWithMicrosoft?.() : await this.provider.signInWithGoogle?.();
    if (!result?.isAuthenticated || this.closed) throw new Error('Authentication required');
    return this.verifySession();
  }

  private async emailCodeRequest(action: 'request' | 'redeem', body: Record<string, string>) {
    if (this.closed) throw new OperationsRequestError('SESSION_CLOSED', 401);
    const fetchRequest = this.fetcher;
    const response = await fetchRequest(this.apiBase.replace(/\/$/, '') + '/auth/email-code/' + action, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, portal: this.expectedRole }),
    });
    if (!response.ok) {
      throw new OperationsRequestError(response.status === 429 ? 'TRY_LATER' : 'EMAIL_CODE_NOT_ACCEPTED', response.status);
    }
    if (this.closed) throw new OperationsRequestError('SESSION_CLOSED', 401);
    return await response.json() as { challengeId?: string; token?: string };
  }

  async requestEmailCode(email: string): Promise<string> {
    const { challengeId } = await this.emailCodeRequest('request', { email });
    if (!challengeId || !/^[a-f0-9-]{36}$/.test(challengeId)) throw new Error('Invalid sign-in challenge');
    return challengeId;
  }

  async connectWithEmailCode(details: { email: string; challengeId: string; code: string }, remember: boolean) {
    const { token } = await this.emailCodeRequest('redeem', details);
    const signIn = this.provider.signInWithCustomToken?.bind(this.provider);
    if (!token || !signIn) throw new Error('Email code authentication is unavailable');
    await this.provider.rememberSession?.(remember);
    if (this.closed) throw new OperationsRequestError('SESSION_CLOSED', 401);
    const state = await signIn(token);
    if (!state.isAuthenticated || this.closed) throw new Error('Authentication required');
    return this.verifySession();
  }

  private allowsMicrosoft(): boolean {
    return this.expectedRole === 'driver' || this.expectedRole === 'customer';
  }

  async linkMicrosoftAccount(userId: string): Promise<void> {
    if (this.closed || !this.allowsMicrosoft() || !this.provider.linkMicrosoftAccount) {
      throw new OperationsRequestError('PORTAL_ACCESS_DENIED', 403);
    }
    await this.provider.linkMicrosoftAccount(userId);
    const identity = await this.verifySession();
    if (identity.userId !== userId) throw new OperationsRequestError('PORTAL_ACCESS_DENIED', 403);
  }

  async verifySession(): Promise<VerifiedPortalIdentity> {
    const response = await this.request<{ identity: VerifiedPortalIdentity }>(this.expectedRole === 'customer' ? '/auth/customer-session' : '/auth/session');
    const identity = response.identity;
    if (!identity || identity.status !== 'active' || !identity.userId || !portalRoles[this.expectedRole].includes(identity.role)
        || !Array.isArray(identity.permissions)
        || (this.expectedRole === 'founder' && !identity.permissions.includes('founder:read'))) {
      throw new OperationsRequestError('PORTAL_ACCESS_DENIED', 403);
    }
    return identity;
  }

  async request<T>(route: string, options: { body?: unknown; key?: string } = {}): Promise<T> {
    if (this.closed) throw new OperationsRequestError('SESSION_CLOSED', 401);
    if (!['/auth/session', '/auth/customer-session'].includes(route) && ((!route.startsWith('/operations/') && !route.startsWith('/customer/')) || route.includes('..') || route.includes('://'))) {
      throw new Error('Unsupported operation route');
    }
    const base = this.apiBase.replace(/\/$/, '');
    const session = await this.provider.getSession();
    if (!session.authenticated || !session.token || this.closed) throw new OperationsRequestError('AUTHENTICATION_REQUIRED', 401);
    // Call native browser fetch without using the client instance as its receiver.
    const fetchRequest = this.fetcher;
    const response = await fetchRequest(base + route, {
      method: options.body === undefined ? 'GET' : 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${session.token}`,
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(options.key ? { 'Idempotency-Key': options.key } : {}) },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
    if (this.closed) throw new OperationsRequestError('SESSION_CLOSED', 401);
    if (response.status === 401) {
      this.closed = true;
      try { this.onUnauthorized(); }
      finally { void this.provider.signOut().catch(() => {}); }
    }
    let body: any;
    try { body = await response.json(); } catch { throw new OperationsRequestError('INVALID_API_RESPONSE', response.status); }
    if (!response.ok || body?.success !== true) {
      throw new OperationsRequestError(typeof body?.code === 'string' ? body.code : 'REQUEST_FAILED', response.status);
    }
    if (route.startsWith('/operations/drivers/me') && typeof body?.driver?.vehicleId === 'string') {
      this.presenceVehicleId = body.driver.vehicleId;
    }
    if (/^\/operations\/bookings\/[^/]+\/location$/.test(route) && typeof body?.sharing === 'boolean') {
      if (body.sharing && typeof body.sessionId === 'string') {
        this.sharedLocationBookingId = route.split('/')[3]; this.sharedLocationSessionId = body.sessionId;
      } else if (body.sessionId === this.sharedLocationSessionId) {
        this.sharedLocationBookingId = null; this.sharedLocationSessionId = null;
      }
    }
    return body as T;
  }
  async disconnect(signOut = true): Promise<void> {
    try {
      if (!this.closed && this.sharedLocationBookingId) {
        try {
          await this.request(`/operations/bookings/${this.sharedLocationBookingId}/location`, { body: { sharing: false, sessionId: this.sharedLocationSessionId } });
        } catch { /* Still attempt availability withdrawal if the GPS request fails. */ }
      }
      if (!this.closed && this.expectedRole === 'driver' && this.presenceVehicleId) {
        await this.request('/operations/drivers/me/presence', {
          body: { availability: 'unavailable', vehicleId: this.presenceVehicleId },
        });
      }
    } catch { /* A failed/offline logout cannot forge a fresh heartbeat; server TTL still applies. */ }
    finally { this.closed = true; if (signOut) await this.provider.signOut(); }
  }
}
