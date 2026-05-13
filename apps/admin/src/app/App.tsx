import { useEffect, useMemo, useState } from 'react';

type Booking = { id: string; referenceCode?: string; code?: string; serviceType: string; status: string; updatedAt?: string; assignedDriverId?: string };
type Driver = { driverId: string; state: string; activeBookingId?: string; lastUpdatedAt?: string };
type Incident = { code: string; severity: string; message: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sync, setSync] = useState<'live' | 'recovering' | 'degraded'>('recovering');

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingRes, driverRes, incidentRes] = await Promise.all([
          fetch(`${API_BASE}/admin/bookings`),
          fetch(`${API_BASE}/drivers/live-states`),
          fetch(`${API_BASE}/operations/incidents`)
        ]);
        const b = await bookingRes.json();
        const d = await driverRes.json();
        const i = await incidentRes.json();
        setBookings(Array.isArray(b.bookings) ? b.bookings : []);
        setDrivers(Array.isArray(d.drivers) ? d.drivers : []);
        setIncidents(Array.isArray(i.incidents) ? i.incidents : []);
        setSync('live');
      } catch {
        setSync('degraded');
      }
    };
    load();
    const poll = setInterval(() => { setSync((p) => p === 'degraded' ? 'recovering' : p); load(); }, 12000);
    return () => clearInterval(poll);
  }, []);

  const active = useMemo(() => bookings.filter((b) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status)).length, [bookings]);
  const warnings = useMemo(() => incidents.filter((i) => i.severity !== 'info').length, [incidents]);

  return <main className="min-h-screen bg-zinc-950 p-5 text-zinc-100">
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-2xl border border-amber-300/25 bg-black/80 p-4">
        <div className="flex items-center gap-3"><img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" /><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">LV Transport · Control Tower</p><h1 className="text-xl font-semibold text-amber-300">Realtime operationeel overzicht</h1></div></div>
        <p className="mt-2 text-sm text-zinc-300">Professionele ritopvolging voor luchthaven-, business- en VIP-service.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"><p className="text-xs uppercase text-zinc-400">Boekingen</p><p className="mt-2 text-2xl font-semibold">{bookings.length}</p></article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"><p className="text-xs uppercase text-zinc-400">Actieve ritten</p><p className="mt-2 text-2xl font-semibold">{active}</p></article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"><p className="text-xs uppercase text-zinc-400">Beschikbare chauffeurs</p><p className="mt-2 text-2xl font-semibold">{drivers.length}</p></article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"><p className="text-xs uppercase text-zinc-400">Waarschuwingen</p><p className="mt-2 text-2xl font-semibold">{warnings}</p></article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Boekingen</h2>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-zinc-400"><tr><th className="py-2 text-left">Referentie</th><th className="py-2 text-left">Service</th><th className="py-2 text-left">Status</th><th className="py-2 text-left">Chauffeur</th></tr></thead><tbody>{bookings.map((b) => <tr key={b.id} className="border-t border-zinc-800"><td className="py-2">{b.referenceCode ?? b.code ?? b.id}</td><td>{b.serviceType}</td><td>{b.status}</td><td>{b.assignedDriverId ?? 'Nog niet toegewezen'}</td></tr>)}</tbody></table></div>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Readiness</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300"><li>Synchronisatie: <span className={sync === 'live' ? 'text-emerald-300' : sync === 'recovering' ? 'text-amber-300' : 'text-rose-300'}>{sync}</span></li><li>LV Transport volgt elke rit actief op.</li><li>Fallbackcommunicatie via klantnummer beschikbaar.</li><li>Founder beta monitoring staat klaar.</li></ul>
        </article>
      </section>
    </div>
  </main>;
}
