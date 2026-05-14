import { useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type Airport = { name: string; code: string; base: number };
const airports: Airport[] = [
  { name: 'Brussels Airport', code: 'BRU', base: 145 },
  { name: 'Charleroi', code: 'CRL', base: 210 },
  { name: 'Eindhoven', code: 'EIN', base: 190 },
  { name: 'Schiphol', code: 'AMS', base: 260 },
  { name: 'Antwerp Airport', code: 'ANR', base: 85 }
];

const routes = [
  ['Antwerpen', 'Brussels Airport', 145],
  ['Antwerpen', 'Charleroi', 210],
  ['Antwerpen', 'Gent', 120],
  ['Antwerpen', 'Rotterdam', 155],
  ['Antwerpen', 'Schiphol', 260],
  ['Antwerpen', 'Eindhoven', 190]
];

export function App() {
  const [from, setFrom] = useState('Antwerpen Centrum');
  const [to, setTo] = useState('Brussels Airport');
  const [airport, setAirport] = useState(airports[0]);
  const [code, setCode] = useState('LV-2026-001');

  const estimate = useMemo(() => {
    const airportBoost = /airport|bru|crl|ams|ein|anr/i.test(to) ? 20 : 0;
    const distanceScore = Math.max(14, Math.round((from.length + to.length) * 1.4));
    return Math.round(distanceScore * 2.2 + airportBoost);
  }, [from, to]);

  return <div className="premium-bg min-h-screen text-white">
    <header className="sticky top-0 z-40 border-b border-lv-gold/25 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <img src="/lv-logo.png" onError={(e) => { e.currentTarget.src = '/lv-logo.svg'; }} className="h-12 w-auto" alt="LV Transport" />
        <nav className="hidden flex-wrap items-center justify-center gap-2 md:flex">
          {['Home','Boeken','Prijzen','Volg uw taxi','Diensten','LV VIP','Contact'].map((label) => {
            const ids: Record<string, string> = { Home:'home', Boeken:'boeken', Prijzen:'prijzen', 'Volg uw taxi':'tracking', Diensten:'diensten', 'LV VIP':'vip', Contact:'contact' };
            return <a key={label} href={`#${ids[label]}`} className="rounded-full border border-lv-gold/30 bg-black/30 px-3 py-1 text-sm hover:bg-lv-gold/15">{label}</a>;
          })}
        </nav>
        <div className="flex gap-2">
          <a href="https://driver.lvtransport.be" className="rounded-full border border-lv-gold/30 px-3 py-1 text-sm">Driver</a>
          <a href="https://admin.lvtransport.be" className="rounded-full border border-lv-gold/30 px-3 py-1 text-sm">Admin</a>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <section id="home" className="glass-panel rounded-3xl p-6 lg:p-10">
        <h1 className="text-3xl font-semibold lg:text-5xl">Premium vervoer in Antwerpen en heel België</h1>
        <p className="mt-4 max-w-3xl text-lv-mist">Professioneel luxevervoer voor luchthavenritten, zakelijke verplaatsingen en VIP-mobiliteit met realtime opvolging en discrete service.</p>
        <div className="mt-6 flex flex-wrap gap-3"><a href="#boeken"><Button>Boek uw rit</Button></a><a href="#prijzen"><Button variant="secondary">Bekijk prijzen</Button></a><a href="#tracking"><Button variant="secondary">Volg uw taxi</Button></a></div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="field-wrap"><span>Van</span><input value={from} onChange={(e) => setFrom(e.target.value)} list="plaatsen" /></label>
          <label className="field-wrap"><span>Bestemming</span><input value={to} onChange={(e) => setTo(e.target.value)} list="plaatsen" /></label>
          <article className="field-wrap"><span>Live prijsindicatie</span><p className="mt-2 text-3xl font-semibold text-lv-champagne">€ {estimate}</p><p className="mt-2 text-xs text-lv-mist">Realtime simulatie met luchthavendetectie en afstandsinschatting.</p></article>
        </div>
        <datalist id="plaatsen"><option>Antwerpen Centrum</option><option>Brussels Airport</option><option>Gent Sint-Pieters</option><option>Rotterdam Centrum</option><option>Schiphol Airport</option></datalist>
      </section>

      <section id="boeken" className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Boeken</h2><p className="mt-2 text-lv-mist">Boekingsarchitectuur blijft behouden met premium interface en dark map integratie.</p>
      </section>

      <section id="prijzen" className="glass-panel rounded-3xl p-6 overflow-hidden">
        <h2 className="text-2xl font-semibold">Prijzen</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
          {routes.map(([a,b,p]) => <article key={`${a}${b}`} className="route-card min-w-[240px]"><div><p>{a} → {b}</p><p className="text-xs text-lv-mist">Vaste premium route</p></div><strong>Vanaf €{p}</strong></article>)}
        </div>
      </section>

      <section id="tracking" className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Volg uw taxi</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2"><label className="field-wrap"><span>Boekingscode</span><input value={code} onChange={(e)=>setCode(e.target.value)} /></label><article className="field-wrap"><span>Realtime status</span><p className="mt-2">Chauffeur onderweg • ETA 7 min • Code {code}</p></article></div>
      </section>

      <section id="diensten" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <a href="#boeken" className="glass-panel rounded-3xl p-5 service-link"><h3>Taxi Antwerpen</h3><p className="text-sm text-lv-mist">Snelle premium ritten in Antwerpen.</p></a>
        <article className="glass-panel rounded-3xl p-5"><h3>Luchthavenvervoer</h3><select className="mt-3 w-full rounded-xl bg-black/40 p-2" value={airport.code} onChange={(e)=>setAirport(airports.find((a)=>a.code===e.target.value) ?? airports[0])}>{airports.map((a)=><option key={a.code} value={a.code}>{a.name}</option>)}</select><p className="mt-2 text-sm">Vanaf €{airport.base}</p></article>
        <article className="glass-panel rounded-3xl p-5"><h3>Zakelijk vervoer</h3><p className="text-sm text-lv-mist">Facturatie, maandaccounts, vaste contracten en corporate SLA.</p></article>
        <a id="vip" href="#contact" className="glass-panel rounded-3xl p-5 service-link"><h3>LV VIP</h3><p className="text-sm text-lv-mist">Prioriteit, loyaliteit, executive service en abonnementsconcept.</p></a>
      </section>

      <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl font-semibold">5-sterren ervaringen</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="route-card">“Perfecte luchthavenservice, altijd stipt.” ★★★★★</div><div className="route-card">“Onze directie kiest enkel LV VIP.” ★★★★★</div><div className="route-card">“Strakke opvolging en premium chauffeurs.” ★★★★★</div></div></section>
    </main>

    <footer id="contact" className="mx-4 mb-6 rounded-3xl border border-lv-gold/25 bg-black/55 p-6 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3"><div><img src="/lv-logo.png" onError={(e)=>{e.currentTarget.src='/lv-logo.svg';}} className="h-12" /></div><div className="text-sm"><p>Telefoon: +32 000 00 00 00</p><p>E-mail: info@lvtransport.be</p><p>Website: lvtransport.be</p><p>BTW: BE 0000.000.000</p></div><div className="text-sm md:text-right"><p>© 2026 LV Transport. Alle rechten voorbehouden.</p><p>Juridische kennisgeving</p></div></div>
    </footer>
    <MoniAssistant />
  </div>;
}
