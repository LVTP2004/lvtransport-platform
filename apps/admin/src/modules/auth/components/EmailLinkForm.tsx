import { useState, type CSSProperties, type FormEvent } from 'react';
import type { FirebaseAuthProvider } from '@lvtransport/auth';

export type EmailSignIn = { email: string; link: string };

const copy = {
  en: {
    email: 'Email address',
    confirmEmail: 'Enter the email address you used to request the link.',
    remember: 'Keep me signed in on this device',
    otherMethods: 'Or sign in with',
    sendLink: 'Send me a sign-in link',
    confirmLink: 'Sign in with email link',
    sending: 'Sending…',
    verifying: 'Verifying…',
    google: 'Continue with Google',
    microsoft: 'Continue with Microsoft',
    sent: 'Check your email. Open the sign-in link to continue.',
    sendFailed: 'The sign-in link could not be sent. Try again later.',
    confirmFailed: 'This link could not be verified. Check your email address or request a new link.',
    newLink: 'Request a new link',
    limit: 'The sign-in email limit has been reached. Try again later or use an unused link already in your inbox.',
    retry: 'Too many attempts. Wait before trying again or use an unused sign-in link from your inbox.',
  },
  nl: {
    email: 'E-mailadres',
    confirmEmail: 'Vul het e-mailadres in waarmee u de link hebt aangevraagd.',
    remember: 'Aangemeld blijven op dit apparaat',
    otherMethods: 'Of meld u aan met',
    sendLink: 'Stuur mij een aanmeldlink',
    confirmLink: 'Aanmelden met e-maillink',
    sending: 'Verzenden…',
    verifying: 'Controleren…',
    google: 'Doorgaan met Google',
    microsoft: 'Doorgaan met Microsoft',
    sent: 'Controleer uw e-mail. Open de aanmeldlink om verder te gaan.',
    sendFailed: 'De aanmeldlink kon niet worden verzonden. Probeer het later opnieuw.',
    confirmFailed: 'Deze link kon niet worden geverifieerd. Controleer uw e-mailadres of vraag een nieuwe link aan.',
    newLink: 'Nieuwe link aanvragen',
    limit: 'De verzendlimiet voor aanmeldlinks is bereikt. Probeer het later opnieuw of gebruik een ongebruikte link in uw inbox.',
    retry: 'Te veel pogingen. Wacht even en probeer opnieuw, of gebruik een ongebruikte aanmeldlink uit uw inbox.',
  },
};

const controlStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 44,
  border: '1px solid #777780',
  borderRadius: 8,
  padding: '8px 12px',
};

export function EmailLinkForm({ createProvider, busy, onSignIn, onGoogle, onMicrosoft, suggestedEmail = '', language = 'en' }: {
  createProvider: () => FirebaseAuthProvider;
  busy: boolean;
  onSignIn: (details: EmailSignIn, remember: boolean) => Promise<void>;
  onGoogle: (remember: boolean) => Promise<void>;
  onMicrosoft?: (remember: boolean) => Promise<void>;
  suggestedEmail?: string;
  language?: keyof typeof copy;
}) {
  const url = new URL(window.location.href);
  const hasSignInLink = url.searchParams.get('mode') === 'signIn' && url.searchParams.has('oobCode');
  const portalUrl = new URL(url.origin);
  portalUrl.pathname = url.pathname;
  const [emailOverride, setEmailOverride] = useState<string>();
  const email = emailOverride ?? (hasSignInLink ? '' : suggestedEmail.trim());
  const [remember, setRemember] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean }>();
  const labels = copy[language];
  const disabled = busy || sending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim();
    if (!address || disabled) return;
    setMessage(undefined);
    setSending(true);
    try {
      if (hasSignInLink) {
        await onSignIn({ email: address, link: url.href }, remember);
      } else {
        await createProvider().sendEmailLink(address, portalUrl.href);
        setMessage({ text: labels.sent, error: false });
      }
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      const text = code === 'auth/quota-exceeded' ? labels.limit
        : code === 'auth/too-many-requests' ? labels.retry
        : hasSignInLink ? labels.confirmFailed : labels.sendFailed;
      setMessage({ text, error: true });
    } finally {
      setSending(false);
    }
  }

  const rememberChoice = <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32 }}>
    <input type="checkbox" checked={remember} disabled={disabled} style={{ accentColor: '#e4ac39' }}
      onChange={event => setRemember(event.target.checked)} />
    {labels.remember}
  </label>;

  return <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 400, margin: '16px 0' }}>
    {hasSignInLink && <p>{labels.confirmEmail}</p>}
    <label style={{ display: 'grid', gap: 6 }}>
      {labels.email}
      <input type="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
        style={{ ...controlStyle, color: '#f8fafc', backgroundColor: '#18181b', caretColor: '#f8fafc' }}
        value={email} onChange={event => setEmailOverride(event.target.value)} disabled={disabled} required />
    </label>
    {hasSignInLink && rememberChoice}
    <button type="submit" disabled={disabled}
      style={{ ...controlStyle, borderColor: '#e4ac39', backgroundColor: '#e4ac39', color: '#16120b', fontWeight: 650 }}>
      {hasSignInLink
        ? (sending ? labels.verifying : labels.confirmLink)
        : (sending ? labels.sending : labels.sendLink)}
    </button>
    {message && <p role={message.error ? 'alert' : 'status'}>{message.text}</p>}
    {hasSignInLink ? <a href={portalUrl.href} style={{ color: '#e4ac39', textDecoration: 'underline' }}>{labels.newLink}</a>
      : <>
        <p style={{ margin: 0, textAlign: 'center' }}>{labels.otherMethods}</p>
        <button type="button" disabled={disabled}
          style={{ ...controlStyle, backgroundColor: '#18181b', color: '#f8fafc' }}
          onClick={() => { setMessage(undefined); void onGoogle(remember); }}>
          {busy ? labels.verifying : labels.google}
        </button>
        {onMicrosoft && <button type="button" disabled={disabled}
          style={{ ...controlStyle, backgroundColor: '#18181b', color: '#f8fafc' }}
          onClick={() => { setMessage(undefined); void onMicrosoft(remember); }}>
          {busy ? labels.verifying : labels.microsoft}
        </button>}
        {rememberChoice}
      </>}
  </form>;
}
