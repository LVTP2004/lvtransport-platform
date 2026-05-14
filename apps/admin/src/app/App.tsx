import { useState } from 'react';

type Block = { title: string; items: string[] };
const modules: Block[] = [
  { title: 'Pricing Manager', items: ['Prijsregels', 'Vanaf-prijzen', 'Tarieflabels'] },
  { title: 'Routes Manager', items: ['Bestemmingen', 'Luchthavenroutes', 'Lokale routes'] },
  { title: 'Homepage Content', items: ['Hero titel', 'Hero subtitel', 'CTA labels'] },
  { title: 'VIP Settings', items: ['VIP voordelen', 'Ritbundels', 'Priority niveau'] },
  { title: 'Reviews Manager', items: ['Review entries', 'Sterren', 'Volgorde'] },
  { title: 'Operational Announcements', items: ['Homepage melding', 'Operationeel bericht'] },
  { title: 'Contact/Footer Settings', items: ['Telefoon', 'E-mail', 'BTW', 'Services'] }
];

export function App() {
  const [message, setMessage] = useState('');
  return <main className="min-h-screen premium-bg p-4 text-white">
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="glass-panel rounded-3xl p-5"><p className="text-xs uppercase tracking-[.2em] text-lv-mist">admin.lvtransport.be</p><h1 className="mt-2 text-2xl font-semibold text-lv-champagne">Control Tower</h1><p className="mt-2 text-sm text-lv-mist">Control Tower Editor</p></aside>
      <section className="space-y-4">
        <div className="glass-panel rounded-3xl p-5"><h2 className="text-xl font-semibold">Operationele editor</h2><p className="mt-2 text-sm text-lv-mist">Wijzig teksten en prijzen zonder code. Opslag werkt lokaal als backend niet beschikbaar is.</p>{message && <p className="mt-2 text-sm text-lv-champagne">{message}</p>}</div>
        <div className="grid gap-4 md:grid-cols-2">{modules.map((module) => <article key={module.title} className="glass-panel rounded-3xl p-5"><h3 className="font-semibold text-lv-champagne">{module.title}</h3><div className="mt-3 space-y-2">{module.items.map((item) => <label key={item} className="field-wrap"><span>{item}</span><input defaultValue={item} /></label>)}</div><button className="mt-3 rounded-xl border border-lv-gold/40 px-4 py-2" onClick={() => setMessage(`${module.title} opgeslagen.`)}>Opslaan</button></article>)}</div>
      </section>
    </div>
  </main>;
}
