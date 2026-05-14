import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type ServiceType = 'Standaard' | 'Luchthaven' | 'Zakelijk' | 'LV VIP';

type PriceRoute = { from: string; to: string; price: number };

const pricingRoutes: PriceRoute[] = [
  { from: 'Antwerpen', to: 'Brussels Airport', price: 145 },
  { from: 'Antwerpen', to: 'Charleroi', price: 210 },
  { from: 'Antwerpen', to: 'Gent', price: 120 },
  { from: 'Antwerpen', to: 'Rotterdam', price: 155 },
  { from: 'Antwerpen', to: 'Schiphol', price: 260 },
  { from: 'Antwerpen', to: 'Eindhoven', price: 190 },
  { from: 'Antwerpen', to: 'Antwerp Airport', price: 85 },
  { from: 'Antwerpen', to: 'Antwerpen Centrum', price: 35 },
  { from: 'Antwerpen', to: 'Berchem', price: 30 }
];

export function App() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [from, setFrom] = useState('Antwerpen Centrum');
  const [to, setTo] = useState('Brussels Airport');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Luchthaven');
  const [bookingCode, setBookingCode] = useState('LV-2026-001');
  const [notice, setNotice] = useState('');

  const estimate = useMemo(() => {
    const direct = pricingRoutes.find((r) => r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase());
    if (direct) return direct.price;
    const airportBoost = /airport|brussels|charleroi|schiphol|eindhoven|antwerp/i.test(to) ? 28 : 0;
    const serviceBoost = serviceType === 'LV VIP' ? 40 : serviceType === 'Zakelijk' ? 18 : 0;
    return Math.max(32, Math.round((from.length * 1.6 + to.length * 2.2) + airportBoost + serviceBoost));
  }, [from, to, serviceType]);

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = `LV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingCode(code);
    setNotice(`Bedankt. Uw ritaanvraag is ontvangen. Reservatiecode: ${code}. We bevestigen zo snel mogelijk.`);
  };

  return <div className="premium-bg min-h-screen text-white">
    <header className="sticky top-0 z-40 border-b border-lv-gold/25 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <img src="/lv-logo.png" onError={(e) => { e.currentTarget.src = '/lv-logo.svg'; }} className="h-11 w-auto" alt="LV Transport" />
        <button className="rounded-lg border border-lv-gold/30 px-3 py-2 md:hidden" onClick={() => setMobileMenu((v) => !v)}>☰</button>
        <nav className="hidden items-center gap-2 md:flex">
          {['Home', 'Boeken', 'Prijzen', 'Volg uw taxi', 'Diensten', 'LV VIP', 'Contact'].map((label) => {
            const ids: Record<string, string> = { Home: 'home', Boeken: 'boeken', Prijzen: 'prijzen', 'Volg uw taxi': 'tracking', Diensten: 'diensten', 'LV VIP': 'vip', Contact: 'contact' };
            return <a key={label} href={`#${ids[label]}`} className="rounded-full border border-lv-gold/30 bg-black/30 px-3 py-1.5 text-sm hover:bg-lv-gold/15">{label}</a>;
          })}
          <a href="https://driver.lvtransport.be" className="rounded-full border border-lv-gold/30 px-3 py-1.5 text-sm">Driver</a>
          <a href="https://admin.lvtransport.be" className="rounded-full border border-lv-gold/30 px-3 py-1.5 text-sm">Admin</a>
        </nav>
      </div>
      {mobileMenu && <nav className="space-y-2 border-t border-lv-gold/20 bg-black/70 p-4 md:hidden">{['home', 'boeken', 'prijzen', 'tracking', 'diensten', 'vip', 'contact'].map((id) => <a key={id} href={`#${id}`} onClick={() => setMobileMenu(false)} className="block rounded-xl border border-lv-gold/25 px-4 py-3 text-base capitalize">{id === 'tracking' ? 'Volg uw taxi' : id === 'vip' ? 'LV VIP' : id}</a>)}<a href="https://driver.lvtransport.be" className="block rounded-xl border border-lv-gold/25 px-4 py-3">Driver</a><a href="https://admin.lvtransport.be" className="block rounded-xl border border-lv-gold/25 px-4 py-3">Admin</a></nav>}
    </header>

    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <section id="home" className="glass-panel rounded-3xl p-6 lg:p-10">
        <h1 className="text-3xl font-semibold lg:text-5xl">Premium vervoer in Antwerpen en heel België</h1>
        <p className="mt-4 max-w-3xl text-lv-mist">Luxe taxi, airport transfer, private rides, VIP/business transport, 24/7 professionele service.</p>
        <div className="mt-6 flex flex-wrap gap-3"><a href="#boeken"><Button>Boek uw rit</Button></a><a href="#prijzen"><Button variant="secondary">Bekijk prijzen</Button></a><a href="#tracking"><Button variant="secondary">Volg uw taxi</Button></a></div>
        <div className="mt-6 grid gap-3 lg:grid-cols-6">{[
          ['Van', <input value={from} onChange={(e) => setFrom(e.target.value)} list="plaatsen" />],
          ['Bestemming', <input value={to} onChange={(e) => setTo(e.target.value)} list="plaatsen" />],
          ['Datum', <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />],
          ['Uur', <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />],
          ['Type service', <select value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}><option>Standaard</option><option>Luchthaven</option><option>Zakelijk</option><option>LV VIP</option></select>],
          ['Geschatte prijs', <div><p className="text-2xl font-semibold text-lv-champagne">€ {estimate}</p><a href="#boeken" className="mt-2 inline-block text-sm text-lv-champagne underline">Boek deze rit</a></div>]
        ].map(([label, control]) => <label className="field-wrap" key={String(label)}><span>{label}</span><div className="mt-2">{control}</div></label>)}</div>
        <datalist id="plaatsen"><option>Antwerpen Centrum</option><option>Brussels Airport</option><option>Charleroi</option><option>Schiphol</option><option>Eindhoven</option><option>Berchem</option></datalist>
      </section>

      <section id="boeken" className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Boeken</h2>
        <form onSubmit={submitBooking} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {['naam', 'telefoon', 'e-mail', 'ophaaladres', 'bestemming', 'datum', 'uur', 'type rit', 'aantal passagiers', 'opmerkingen'].map((f) => <label key={f} className="field-wrap"><span>{f}</span>{f === 'opmerkingen' ? <textarea className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" rows={3} /> : <input required={f !== 'opmerkingen'} type={f === 'datum' ? 'date' : f === 'uur' ? 'time' : f === 'e-mail' ? 'email' : 'text'} />}</label>)}
          <div className="md:col-span-2 lg:col-span-3"><Button>Rit aanvragen</Button>{notice && <p className="mt-3 text-sm text-lv-champagne">{notice}</p>}</div>
        </form>
      </section>

      <section id="prijzen" className="glass-panel rounded-3xl p-6 overflow-hidden">
        <h2 className="text-2xl font-semibold">Prijzen</h2>
        <div className="price-carousel mt-4 flex gap-4 overflow-x-auto pb-3">{pricingRoutes.map((r) => <article key={r.from + r.to} className="route-card min-w-[260px]"><div><p>{r.from} → {r.to}</p><p className="text-xs text-lv-mist">Premium route</p></div><strong>Vanaf €{r.price}</strong></article>)}</div>
      </section>

      <section id="tracking" className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Volg uw taxi</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2"><label className="field-wrap"><span>Reservatiecode</span><input value={bookingCode} onChange={(e) => setBookingCode(e.target.value)} /></label><div className="field-wrap"><span>Status</span><button className="mt-2 rounded-xl border border-lv-gold/40 px-4 py-2">Taxi volgen</button><ul className="mt-3 space-y-1 text-sm text-lv-mist"><li>aanvraag ontvangen</li><li>chauffeur toegewezen</li><li>onderweg</li><li>aangekomen</li><li>voltooid</li></ul></div></div>
        <div className="mt-4 rounded-2xl border border-lv-gold/30 bg-black/45 p-4"><p className="text-sm text-lv-mist">Premium trackingvisual actief</p><div className="mt-3 h-36 rounded-xl bg-gradient-to-r from-black/60 via-lv-gold/20 to-black/60" /></div>
      </section>

      <section id="diensten" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><a href="#boeken" className="glass-panel rounded-3xl p-5 service-link"><h3>Taxi Antwerpen</h3><p className="text-sm text-lv-mist">Lokale ritten met snelle boeking.</p></a><a href="#boeken" className="glass-panel rounded-3xl p-5 service-link"><h3>Luchthavenvervoer</h3><p className="text-sm text-lv-mist">Brussels Airport, Charleroi, Eindhoven, Schiphol, Antwerp Airport.</p></a><article className="glass-panel rounded-3xl p-5"><h3>Zakelijk vervoer</h3><p className="text-sm text-lv-mist">Bedrijfsklanten, facturen, vaste routes en maandtransport.</p></article><a href="#vip" className="glass-panel rounded-3xl p-5 service-link"><h3>LV VIP</h3><p className="text-sm text-lv-mist">Prioriteit, comfort en loyaliteitsvoordelen.</p></a></section>
      <section id="vip" className="glass-panel rounded-3xl p-6"><h2 className="text-2xl font-semibold">LV VIP</h2><p className="mt-2 text-lv-mist">Priority service, comfort, loyalty en executive ervaring met ritbundels.</p></section>
    </main>

    <footer id="contact" className="mx-4 mb-6 rounded-3xl border border-lv-gold/25 bg-black/55 p-6 backdrop-blur-xl"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3"><div><img src="/lv-logo.png" onError={(e)=>{e.currentTarget.src='/lv-logo.svg';}} className="h-12" /><p className="mt-2 text-sm">Taxi · Luchthavenvervoer · Privéritten · Premium vervoer 24/7</p></div><div className="text-sm"><p>+32 466 48 79 36</p><p>info@lvtransport.be</p><p>www.lvtransport.be</p><p>BTW BE 1036.807.066</p></div><div className="text-sm md:text-right"><p>© 2026 LV Transport. Alle rechten voorbehouden.</p></div></div></footer>
    <MoniAssistant />
  </div>;
}
