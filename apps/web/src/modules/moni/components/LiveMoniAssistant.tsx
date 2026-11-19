import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { readBookingStatus } from '../services/booking-status-client';

const statusLabel: Record<string, string> = { pending: 'Aanvraag ontvangen', assigned: 'Toegewezen', accepted: 'Geaccepteerd',
  en_route: 'Onderweg', arrived: 'Aangekomen', in_progress: 'Rit bezig', completed: 'Afgerond', cancelled: 'Geannuleerd', failed: 'Niet uitgevoerd' };

/** Project-scoped read-only help. No fictitious AI connection, learning store or privileged tools. */
export function LiveMoniAssistant() {
  const [open, setOpen] = useState(false), [reference, setReference] = useState('');
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const alive = useRef(true), pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  async function lookup(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setMessage('');
    try {
      const booking = await readBookingStatus(reference, import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be');
      if (alive.current) setMessage(`${booking.referenceCode}: ${statusLabel[booking.status]}.`);
    } catch (error) { if (alive.current) setMessage(error instanceof Error ? error.message : 'De aanvraagstatus kan nu niet worden bevestigd.'); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  return <aside className="mx-auto max-w-7xl px-4 py-5 text-white" aria-label="Moni Ride">
    <button className="btn-secondary rounded-xl px-4 py-2" aria-expanded={open} aria-controls="moni-live-help" onClick={() => setOpen(value => !value)}>Moni Ride · Hulp bij uw aanvraag</button>
    {open && <section id="moni-live-help" className="mt-3 max-w-lg space-y-3 rounded-2xl border border-amber-400/30 bg-zinc-950 p-5">
      <h2 className="text-xl">Moni Ride</h2>
      <p>Ik help u een aanvraag te doen of de geregistreerde status te controleren.</p>
      <div className="flex flex-wrap gap-4"><Link to="/booking">Rit aanvragen</Link><a href="/#prijzen">Tarieven bekijken</a><a href="/#contact">Contact</a></div>
      <form onSubmit={lookup} className="flex flex-wrap gap-3">
        <label>Uw referentiecode <input className="rounded bg-zinc-800 p-2" required maxLength={100} value={reference} onChange={event => setReference(event.target.value)} /></label>
        <button disabled={busy} type="submit">{busy ? 'Controleren…' : 'Status controleren'}</button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>}
  </aside>;
}
