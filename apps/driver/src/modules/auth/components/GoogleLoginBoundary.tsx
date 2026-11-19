import { useEffect, useRef, useState, type ReactNode } from 'react';
import { OperationsRequestError, VerifiedOperationsClient, type VerifiedPortalIdentity } from '@lvtransport/auth';
import type { FirebaseAuthProvider } from '@lvtransport/auth';

type Connected = { client: VerifiedOperationsClient; identity: VerifiedPortalIdentity };

function loginErrorMessage(error: unknown): string {
  if (error instanceof OperationsRequestError) {
    if (error.code === 'PORTAL_ACCESS_DENIED') return 'The verified account does not have access to this panel.';
    if (error.status === 401) return 'LVTransport could not verify the Google session (HTTP 401).';
    return `LVTransport could not confirm the session (HTTP ${error.status}).`;
  }

  const code = error instanceof Error && 'code' in error ? error.code : undefined;
  if (typeof code === 'string' && /^auth\/[a-z-]{1,64}$/.test(code)) {
    return `Google sign-in could not be completed (${code}).`;
  }
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'TypeError')) {
    return 'The browser could not complete the sign-in request. Check the connection and try again.';
  }
  return 'Access could not be verified. Try again.';
}

/** Only a verified API session can mount the operational child. */
export function GoogleLoginBoundary({ title, createProvider, expectedRole, renderOperations }: {
  title: string;
  createProvider: () => FirebaseAuthProvider;
  expectedRole: 'admin' | 'driver' | 'customer';
  renderOperations: (connection: Connected) => ReactNode;
}) {
  const clientRef = useRef<VerifiedOperationsClient | null>(null);
  const pending = useRef(false);
  const alive = useRef(true);
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState<Connected | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; void clientRef.current?.disconnect().catch(() => {}); };
  }, []);

  async function login() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    let client: VerifiedOperationsClient | null = null;
    try {
      const configured = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1').replace(/\/$/, '');
      const apiBase = configured.endsWith('/api/v1') ? configured : configured + '/api/v1';
      client = new VerifiedOperationsClient(createProvider(), apiBase, expectedRole, fetch, () => {
        if (alive.current) { setConnection(null); setError('Your session is no longer authorized. Sign in again.'); }
      });
      clientRef.current = client;
      const identity = await client.connect();
      if (!alive.current) { await client.disconnect(); return; }
      setConnection({ client, identity });
    } catch (error) {
      await client?.disconnect().catch(() => {});
      if (alive.current) { setConnection(null); setError(loginErrorMessage(error)); }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  async function logout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    const client = clientRef.current;
    setConnection(null);
    try { await client?.disconnect(); }
    catch { if (alive.current) setError('Sign-out could not be confirmed.'); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  return <main className="min-h-screen bg-zinc-950 p-6 text-white">
    <h1 className="text-3xl mb-4">{title}</h1>
    <p role="status">{expectedRole === 'customer' ? (connection ? 'Uw account is verbonden.' : 'Meld u aan om uw eigen reserveringen te bekijken.')
      : connection ? 'Operational access verified by the server.' : 'Sign in with Google. Operational access remains locked.'}</p>
    {error && <p role="alert">{error}</p>}
    <button className="my-4 rounded bg-amber-400 px-4 py-2 text-black" disabled={busy} onClick={connection ? logout : login}>
      {busy ? 'Please wait...' : connection ? 'Logout' : 'Continue with Google'}
    </button>
    {connection && renderOperations(connection)}
  </main>;
}
