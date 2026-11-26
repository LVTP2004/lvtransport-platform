import { useRef, useState, type FormEvent } from 'react';
import type { VerifiedOperationsClient } from '@lvtransport/auth';

type Refund = { id: string; amountMinor: number; reason: string; requestedBy: string;
  approval?: { by: string }; provider?: { status: string } };
type Refunds = { refunds: Refund[]; canApprove: boolean; actorId: string };
const money = new Intl.NumberFormat('en-BE', { style: 'currency', currency: 'EUR' });

export function StagingCheckoutRefunds({ id, client }: { id: string; client: VerifiedOperationsClient }) {
  const path = '/operations/staging-checkout/' + encodeURIComponent(id) + '/refunds';
  const [data, setData] = useState<Refunds>();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const draft = useRef<{ requestId: string; amountMinor: number; reason: string }>();

  async function run(action?: () => Promise<unknown>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await action?.();
      setData(await client.request<Refunds>(path));
    } catch {
      setError('The Stripe test refund operation could not be confirmed. Refresh before trying again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function request(event: FormEvent) {
    event.preventDefault();
    const value = amount.trim();
    const amountMinor = Math.round(Number(value.replace(',', '.')) * 100);
    if (!/^\d{1,6}(?:[,.]\d{1,2})?$/.test(value) || amountMinor < 1 || !reason.trim()) {
      setError('Enter an amount in EUR and a reason.');
      return;
    }
    const trimmedReason = reason.trim();
    if (draft.current?.amountMinor !== amountMinor || draft.current.reason !== trimmedReason) {
      draft.current = { requestId: crypto.randomUUID(), amountMinor, reason: trimmedReason };
    }
    const body = draft.current;
    void run(async () => {
      await client.request(path, { body });
      draft.current = undefined;
      setAmount('');
      setReason('');
    });
  }

  return <details onToggle={event => { if (event.currentTarget.open) void run(); }}>
    <summary>Stripe test refunds</summary>
    {error && <p role="alert">{error}</p>}
    <button type="button" onClick={() => void run()} disabled={busy}>Refresh test refunds</button>
    {data && <form onSubmit={request}>
      <label>Refund amount in EUR <input required inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} /></label>
      <label>Refund reason <input required maxLength={500} value={reason} onChange={event => setReason(event.target.value)} /></label>
      <button disabled={busy} type="submit">Request test refund</button>
    </form>}
    {data?.refunds.map(refund => <div key={refund.id}>
      <p>{money.format(refund.amountMinor / 100)} · {refund.reason} · {refund.provider?.status ?? (refund.approval ? 'Awaiting Stripe' : 'Awaiting approval')}</p>
      {data.canApprove && !refund.approval && refund.requestedBy !== data.actorId && <button type="button" disabled={busy}
        onClick={() => void run(() => client.request(path + '/' + encodeURIComponent(refund.id) + '/approve', { body: {} }))}>
        Approve test refund
      </button>}
    </div>)}
  </details>;
}
