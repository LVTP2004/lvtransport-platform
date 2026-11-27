import { useEffect, useState, type FormEvent } from 'react';

export type EmailCodeSignIn = { email: string; challengeId: string; code: string };
type Props = {
  apiBase: string;
  busy: boolean;
  language?: 'nl' | 'en';
  suggestedEmail?: string;
  onRequest: (email: string) => Promise<string>;
  onSignIn: (details: EmailCodeSignIn, remember: boolean) => Promise<void>;
};

const copy = {
  nl: { title: 'Inloggen met een code', email: 'E-mailadres', code: 'Code van zes cijfers', request: 'Stuur code',
    submit: 'Code bevestigen', remember: 'Onthoud dit apparaat', change: 'Ander e-mailadres', resend: 'Stuur nieuwe code',
    sent: 'Als dit account toegang heeft, ontvangt u een code per e-mail.', failed: 'De code kon niet worden aangevraagd. Probeer het opnieuw.' },
  en: { title: 'Sign in with a code', email: 'Email address', code: 'Six-digit code', request: 'Send code',
    submit: 'Verify code', remember: 'Remember this device', change: 'Change email address', resend: 'Send a new code',
    sent: 'If this account has access, a code will be sent by email.', failed: 'The code could not be requested. Try again.' },
};

export function EmailCodeForm({ apiBase, busy, suggestedEmail = '', language = 'en', onRequest, onSignIn }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState(suggestedEmail);
  const [challenge, setChallenge] = useState<string>();
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);
  const [resendBlocked, setResendBlocked] = useState(false);
  const [error, setError] = useState(false);
  const labels = copy[language];

  useEffect(() => {
    const controller = new AbortController();
    void fetch(apiBase + '/auth/sign-in-methods', { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(methods => { if (!controller.signal.aborted) setEnabled(methods?.emailCode === true); })
      .catch(() => {});
    return () => controller.abort();
  }, [apiBase]);

  useEffect(() => {
    if (!resendBlocked) return;
    const timer = window.setTimeout(() => setResendBlocked(false), 60_000);
    return () => window.clearTimeout(timer);
  }, [resendBlocked]);

  async function request() {
    if (busy || pending || resendBlocked) return;
    setPending(true);
    setError(false);
    try {
      setChallenge(await onRequest(email.trim()));
      setCode('');
      setResendBlocked(true);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) {
      await request();
      return;
    }
    if (!busy && !pending && /^\d{6}$/.test(code)) await onSignIn({ email: email.trim(), challengeId: challenge, code }, remember);
  }

  if (!enabled) return null;

  return <form className="my-4 grid max-w-md gap-3" onSubmit={event => void submit(event)}>
    <h2>{labels.title}</h2>
    <label>{labels.email} <input type="email" autoComplete="email" value={email} required maxLength={254}
      readOnly={Boolean(challenge)} onChange={event => setEmail(event.target.value)} /></label>
    {challenge && <>
      <p role="status">{labels.sent}</p>
      <label>{labels.code} <input type="text" inputMode="numeric" autoComplete="one-time-code"
        pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value)} /></label>
      <label><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /> {labels.remember}</label>
      <button type="button" disabled={busy || pending || resendBlocked} onClick={() => void request()}>{labels.resend}</button>
      <button type="button" disabled={busy || pending} onClick={() => { setChallenge(undefined); setCode(''); setError(false); }}>{labels.change}</button>
    </>}
    {error && <p role="alert">{labels.failed}</p>}
    <button className="rounded bg-amber-400 px-4 py-2 text-black" type="submit" disabled={busy || pending || (!challenge && resendBlocked)}>
      {challenge ? labels.submit : labels.request}
    </button>
  </form>;
}
