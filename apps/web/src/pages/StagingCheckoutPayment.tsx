import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { VerifiedOperationsClient } from '@lvtransport/auth';

type Payment = { status: 'ready' | 'processing' | 'authorized' | 'captured' | 'released' | 'expired';
  amountMinor: number; revision: number; receipt?: string; refundedMinor?: number; netPaidMinor?: number };
const labels = {
  ready: 'Klaar voor betaling', processing: 'Betaling wordt gecontroleerd', authorized: 'Gereserveerd in Stripe-testmodus',
  captured: 'Afgeschreven in Stripe-testmodus', released: 'Vrijgegeven in Stripe-testmodus',
  expired: 'Autorisatie verlopen. Bevestig het bedrag opnieuw.',
};
const money = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' });

function InvoiceRequestForm({ client, endpoint }: { client: VerifiedOperationsClient; endpoint: string }) {
  const [requestedAt, setRequestedAt] = useState<string | null>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void client.request<{ requestedAt: string | null }>(endpoint).then(result => {
      if (active) setRequestedAt(result.requestedAt);
    }).catch(() => {
      if (active) setError('De factuuraanvraag kon niet worden geladen.');
    });
    return () => { active = false; };
  }, [client, endpoint]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || requestedAt !== null) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const body = Object.fromEntries(['legalName', 'registration', 'address', 'country'].map(field => [field, form.get(field)]));
      const result = await client.request<{ requestedAt: string }>(endpoint, { body });
      setRequestedAt(result.requestedAt);
    } catch {
      setError('De aanvraag is niet bevestigd. Controleer de gegevens en probeer opnieuw.');
    } finally { setBusy(false); }
  }

  return <details>
    <summary>Zakelijke factuur aanvragen</summary>
    {error && <p role="alert">{error}</p>}
    {requestedAt && <p role="status">Factuuraanvraag ontvangen. De gegevens worden gecontroleerd.</p>}
    {requestedAt === null && <form className="grid gap-2" onSubmit={event => void submit(event)}>
      <label>Bedrijfsnaam <input name="legalName" required maxLength={160} /></label>
      <label>Ondernemings- of btw-nummer <input name="registration" required maxLength={30} /></label>
      <label>Factuuradres <input name="address" required maxLength={240} /></label>
      <label>Landcode <input name="country" required minLength={2} maxLength={2} pattern="[A-Za-z]{2}" placeholder="BE" /></label>
      <button type="submit" disabled={busy}>Aanvraag indienen</button>
    </form>}
  </details>;
}

export function StagingCheckoutPayment({ id, client, showOnReturn }: { id: string; client: VerifiedOperationsClient; showOnReturn: boolean }) {
  const [open, setOpen] = useState(showOnReturn);
  const [payment, setPayment] = useState<Payment | null>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const path = '/customer/staging-checkout/' + encodeURIComponent(id);
  useEffect(() => {
    if (!open) return;
    let current = true;
    let fetching = false;
    const load = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const result = await client.request<{ payment: Payment | null }>(path);
        if (current) { setPayment(result.payment); setError(''); }
      } catch { if (current) setError('De testbetaling kon niet worden geladen.'); }
      finally { fetching = false; }
    };
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => { current = false; window.clearInterval(timer); };
  }, [client, open, path]);
  async function pay() {
    if (inFlight.current || !payment || !['ready', 'expired'].includes(payment.status)) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const { url } = await client.request<{ url: string }>(path,
        { body: { expectedAmountMinor: payment.amountMinor, expectedRevision: payment.revision } });
      if (new URL(url).origin !== 'https://checkout.stripe.com') throw Error('Invalid Checkout URL');
      window.location.assign(url);
    } catch {
      setError('Stripe Checkout kon niet worden geopend.');
      setBusy(false);
      inFlight.current = false;
    }
  }
  return <div>
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      {open ? 'Testbetaling verbergen' : 'Bekijk testbetaling'}
    </button>
    {open && <>
      {error && <p role="alert">{error}</p>}
      {payment === undefined && !error && <p role="status">Testbetaling wordt geladen…</p>}
      {payment === null && <p>De testprijs wacht op bevestiging door Control Tower.</p>}
      {payment && <><p>Testbetaling · {money.format(payment.amountMinor / 100)}</p><p>{labels[payment.status]}</p>
        {(payment.status === 'ready' || payment.status === 'expired') && <button type="button" disabled={busy} onClick={() => void pay()}>
          {payment.status === 'expired' ? 'Opnieuw autoriseren met Stripe (test)' : 'Betalen met Stripe (test)'}
        </button>}
        {payment.status === 'captured' && payment.receipt && <>
          <p>Testbetalingsbewijs · {payment.receipt}</p>
          <InvoiceRequestForm client={client} endpoint={path + '/invoice-request'} />
        </>}
        {payment.refundedMinor !== undefined && payment.netPaidMinor !== undefined && <>
          <p>Terugbetaald · {money.format(payment.refundedMinor / 100)}</p>
          <p>Netto betaald · {money.format(payment.netPaidMinor / 100)}</p>
        </>}
      </>}
    </>}
  </div>;
}
