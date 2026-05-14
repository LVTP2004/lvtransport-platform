import { useState } from 'react';

type Ride = { code: string; from: string; to: string; status: 'toegewezen'|'onderweg'|'aangekomen'|'voltooid' };

export function App() {
  const [ride, setRide] = useState<Ride>({ code: 'LV-2026-5312', from: 'Antwerpen Centrum', to: 'Brussels Airport', status: 'toegewezen' });
  const [accepted, setAccepted] = useState(false);

  return <main className="min-h-screen premium-bg p-4 text-white">
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="glass-panel rounded-3xl p-5"><h1 className="text-2xl font-semibold text-lv-champagne">Driver Dashboard</h1><p className="text-sm text-lv-mist">Mobiele dispatchweergave voor chauffeurs.</p></header>
      <section className="glass-panel rounded-3xl p-5"><h2 className="font-semibold">Toegewezen rit</h2><p className="mt-2">{ride.code} • {ride.from} → {ride.to}</p><p className="text-sm text-lv-mist">Status: {ride.status}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => { setAccepted(true); setRide({ ...ride, status: 'onderweg' }); }} className="rounded-xl bg-lv-gold px-4 py-2 text-black">Accepteren</button><button className="rounded-xl border border-lv-gold/35 px-4 py-2">Weigeren</button></div></section>
      <section className="glass-panel rounded-3xl p-5"><h2 className="font-semibold">Status updates</h2><div className="mt-3 grid gap-2 sm:grid-cols-3"><button onClick={() => setRide({ ...ride, status: 'onderweg' })} className="rounded-xl border border-lv-gold/35 px-3 py-2">Onderweg</button><button onClick={() => setRide({ ...ride, status: 'aangekomen' })} className="rounded-xl border border-lv-gold/35 px-3 py-2">Aangekomen</button><button onClick={() => setRide({ ...ride, status: 'voltooid' })} className="rounded-xl border border-lv-gold/35 px-3 py-2">Voltooid</button></div><div className="mt-4 h-36 rounded-2xl border border-lv-gold/30 bg-black/45 p-3 text-sm text-lv-mist">Live locatie/tracking visual {accepted ? 'actief' : 'stand-by'}.</div></section>
    </div>
  </main>;
}
