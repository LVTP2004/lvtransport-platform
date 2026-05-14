import { useEffect, useMemo, useState } from 'react';

type Booking = { id: string; referenceCode?: string; code?: string; serviceType: string; status: string; updatedAt?: string; assignedDriverId?: string };
type Driver = { driverId: string; state: string; activeBookingId?: string; lastUpdatedAt?: string };
type Incident = { code: string; severity: string; message: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

const statusTone: Record<string, string> = {
  assigned: 'text-amber-200 bg-amber-500/15 border-amber-400/35',
  accepted: 'text-sky-200 bg-sky-500/15 border-sky-400/35',
  en_route: 'text-violet-200 bg-violet-500/15 border-violet-400/35',
  arrived: 'text-indigo-200 bg-indigo-500/15 border-indigo-400/35',
  in_progress: 'text-cyan-200 bg-cyan-500/15 border-cyan-400/35',
  completed: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/35',
  cancelled: 'text-rose-200 bg-rose-500/15 border-rose-400/35',
  failed: 'text-rose-200 bg-rose-500/15 border-rose-400/35'
};

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

  return <main className="min-h-screen bg-lvtp-obsidian p-5 text-zinc-100">
    <div className="lvtp-network absolute inset-0 pointer-events-none opacity-50" />
    <div className="relative mx-auto max-w-7xl space-y-5">
      <header className="lvtp-shell rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" /><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">LV Transport · Premium Control Tower</p><h1 className="text-xl font-semibold text-amber-200">Realtime operationeel overzicht</h1></div></div>
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${sync === 'live' ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100' : sync === 'recovering' ? 'border-amber-300/40 bg-amber-400/15 text-amber-100' : 'border-rose-300/40 bg-rose-400/15 text-rose-100'}`}>{sync}</span>
        </div>
        <p className="mt-3 text-sm text-zinc-300">Professionele dispatch-opvolging voor luchthaven-, business- en VIP-service met founder-level controle.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Boekingen', bookings.length], ['Actieve ritten', active], ['Beschikbare chauffeurs', drivers.length], ['Waarschuwingen', warnings]].map(([label, value]) => <article key={label} className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase text-zinc-400">{label}</p><p className="mt-2 text-2xl font-semibold text-amber-100">{value}</p></article>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="lvtp-card xl:col-span-2 rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Boekingen</h2>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-zinc-400"><tr><th className="py-2 text-left">Referentie</th><th className="py-2 text-left">Service</th><th className="py-2 text-left">Status</th><th className="py-2 text-left">Chauffeur</th></tr></thead><tbody>{bookings.map((b) => <tr key={b.id} className="border-t border-zinc-800/80"><td className="py-2">{b.referenceCode ?? b.code ?? b.id}</td><td>{b.serviceType}</td><td><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusTone[b.status] ?? 'border-zinc-600 bg-zinc-800 text-zinc-200'}`}>{b.status}</span></td><td>{b.assignedDriverId ?? 'Nog niet toegewezen'}</td></tr>)}</tbody></table></div>
        </article>
        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Readiness</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300"><li>Synchronisatie blijft realtime actief met herstelmodus.</li><li>Rittoewijzing en escalatie volgen premium lifecycle regels.</li><li>Fallbackcommunicatie via klantnummer beschikbaar.</li><li>Founder beta monitoring staat klaar.</li></ul>
        </article>
      </section>
    </div>
  </main>;
}
