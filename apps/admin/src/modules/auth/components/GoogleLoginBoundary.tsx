import { EmailLinkForm, type EmailSignIn } from './EmailLinkForm';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LVTP_MICROSOFT_SIGN_IN_ENABLED, OperationsRequestError, VerifiedOperationsClient, type PortalOAuthProvider, type VerifiedPortalIdentity } from '@lvtransport/auth';
import type { FirebaseAuthProvider } from '@lvtransport/auth';

type Connected = { client: VerifiedOperationsClient; identity: VerifiedPortalIdentity };

const microsoftCopy = {
  en: {
    link: 'Link Microsoft account',
    linked: 'Microsoft account linked.',
    conflict: 'Sign in to your existing LVTransport account, then choose Link Microsoft account.',
    inUse: 'This Microsoft account is already linked to a different LVTransport account.',
    unavailable: 'Microsoft sign-in is unavailable. Use another sign-in method.',
    recentLogin: 'Sign out and sign in again before linking your Microsoft account.',
  },
  nl: {
    link: 'Microsoft-account koppelen',
    linked: 'Microsoft-account gekoppeld.',
    conflict: 'Meld u aan bij uw bestaande LVTransport-account en kies daarna Microsoft-account koppelen.',
    inUse: 'Dit Microsoft-account is al aan een ander LVTransport-account gekoppeld.',
    unavailable: 'Aanmelden met Microsoft is niet beschikbaar. Gebruik een andere aanmeldmethode.',
    recentLogin: 'Meld u af en opnieuw aan voordat u uw Microsoft-account koppelt.',
  },
};

function microsoftError(error: unknown, labels: typeof microsoftCopy.en): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  switch (code) {
    case 'auth/account-exists-with-different-credential': return labels.conflict;
    case 'auth/credential-already-in-use': return labels.inUse;
    case 'auth/operation-not-allowed': return labels.unavailable;
    case 'auth/requires-recent-login': return labels.recentLogin;
    default: return loginErrorMessage(error);
  }
}

function loginErrorMessage(error: unknown): string {
  if (error instanceof OperationsRequestError) {
    if (error.code === 'PORTAL_ACCESS_DENIED') return 'The verified account does not have access to this panel.';
    if (error.status === 401) return 'LVTransport could not verify the session (HTTP 401).';
    return `LVTransport could not confirm the session (HTTP ${error.status}).`;
  }

  const code = error instanceof Error && 'code' in error ? error.code : undefined;
  if (typeof code === 'string' && /^auth\/[a-z-]{1,64}$/.test(code)) {
    return `Sign-in could not be completed (${code}).`;
  }
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'TypeError')) {
    return 'The browser could not complete the sign-in request. Check the connection and try again.';
  }
  return 'Access could not be verified. Try again.';
}

/** Only a verified API session can mount the operational child. */
export function GoogleLoginBoundary({ title, createProvider, expectedRole, renderOperations, suggestedEmail }: {
  title: string;
  createProvider: () => FirebaseAuthProvider;
  expectedRole: 'admin' | 'driver' | 'customer';
  renderOperations: (connection: Connected) => ReactNode;
  suggestedEmail?: string;
}) {
  const clientRef = useRef<VerifiedOperationsClient | null>(null);
  const pending = useRef(false);
  const alive = useRef(true);
  const [busy, setBusy] = useState(true);
  const [connection, setConnection] = useState<Connected | null>(null);
  const [error, setError] = useState('');
  const [microsoftLinked, setMicrosoftLinked] = useState(false);
  const language = expectedRole === 'customer' ? 'nl' : 'en';
  const microsoft = microsoftCopy[language];
  const microsoftEnabled = LVTP_MICROSOFT_SIGN_IN_ENABLED && expectedRole !== 'admin';
  function makeClient(provider: FirebaseAuthProvider) {
    const configured = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1').replace(/\/$/, '');
    const apiBase = configured.endsWith('/api/v1') ? configured : configured + '/api/v1';
    const client = new VerifiedOperationsClient(provider, apiBase, expectedRole, fetch, () => {
      if (alive.current && clientRef.current === client) {
        setConnection(null);
        setError('Your session is no longer authorized. Sign in again.');
      }
    });
    return client;
  }

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    async function restore() {
      let client: VerifiedOperationsClient | undefined;
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('mode') === 'signIn' && url.searchParams.has('oobCode')) return;
        const provider = createProvider();
        const state = await provider.getInitialState();
        if (cancelled || !state.isAuthenticated) return;
        client = makeClient(provider);
        const identity = await client.verifySession();
        if (cancelled) return;
        clientRef.current = client;
        setConnection({ client, identity });
      } catch (cause) {
        if (cancelled) return;
        if (cause instanceof OperationsRequestError && cause.status === 403) {
          await client?.disconnect().catch(() => {});
        }
        if (!cancelled) setError(loginErrorMessage(cause));
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void restore();
    return () => {
      cancelled = true;
      alive.current = false;
      const client = clientRef.current;
      clientRef.current = null;
      void client?.disconnect(false).catch(() => {});
    };
  }, [createProvider, expectedRole]);

  async function login(emailSignIn?: EmailSignIn, remember = false, oauth: PortalOAuthProvider = 'google') {
    if (pending.current || busy) return;
    pending.current = true;
    setBusy(true);
    setError('');
    let client: VerifiedOperationsClient | undefined;
    try {
      client = makeClient(createProvider());
      clientRef.current = client;
      const identity = await client.connect(emailSignIn, remember, oauth);
      if (!alive.current || clientRef.current !== client) return;
      if (emailSignIn) {
        window.history.replaceState(window.history.state, '', window.location.pathname);
      }
      setMicrosoftLinked(oauth === 'microsoft');
      setConnection({ client, identity });
    } catch (cause) {
      if (!alive.current || (client && clientRef.current !== client)) return;
      await client?.disconnect().catch(() => {});
      if (alive.current) { setConnection(null); setError(oauth === 'microsoft' ? microsoftError(cause, microsoft) : loginErrorMessage(cause)); }
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function logout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    const client = clientRef.current;
    setConnection(null);
    setMicrosoftLinked(false);
    try { await client?.disconnect(); }
    catch { if (alive.current) setError('Sign-out could not be confirmed.'); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  async function linkMicrosoft() {
    if (!connection || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await connection.client.linkMicrosoftAccount(connection.identity.userId);
      if (alive.current) setMicrosoftLinked(true);
    } catch (cause) {
      if (alive.current) setError(microsoftError(cause, microsoft));
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return <main className="min-h-screen bg-zinc-950 p-6 text-white">
    <h1 className="text-3xl mb-4">{title}</h1>
    <p role="status">{expectedRole === 'customer' ? (connection ? 'Uw account is verbonden.' : 'Meld u aan om uw eigen reserveringen te bekijken.')
      : connection ? 'Operational access verified by the server.' : 'Sign in to access this panel.'}</p>
    {error && <p role="alert">{error}</p>}
    {connection ? <button className="my-4 rounded bg-amber-400 px-4 py-2 text-black" disabled={busy} onClick={logout}>
      {expectedRole === 'customer' ? 'Afmelden' : 'Sign out'}
    </button> : <EmailLinkForm createProvider={createProvider} busy={busy} onSignIn={login} suggestedEmail={suggestedEmail}
      onGoogle={remember => login(undefined, remember)} language={language}
      onMicrosoft={microsoftEnabled ? remember => login(undefined, remember, 'microsoft') : undefined} />}
    {connection && microsoftEnabled && (microsoftLinked ? <p role="status">{microsoft.linked}</p>
      : <button className="rounded px-4 py-2" style={{ marginLeft: 8, border: '1px solid #777780' }}
        disabled={busy} onClick={() => void linkMicrosoft()}>
        {microsoft.link}
      </button>)}
    {connection && renderOperations(connection)}
  </main>;
}
