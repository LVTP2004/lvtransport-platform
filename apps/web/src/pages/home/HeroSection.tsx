import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const services = [
  { label: 'TAXI ANTWERPEN', title: 'Taxi in Antwerpen', detail: 'Comfortabel vervoer in Antwerpen en de omliggende gemeenten.' },
  { label: 'AIRPORT', title: 'Luchthavenvervoer', detail: 'Transfers naar Zaventem, Charleroi, Eindhoven, Schiphol en andere luchthavens.' },
  { label: 'BUSINESS', title: 'Zakelijk vervoer', detail: 'Discreet vervoer voor bedrijven, vergaderingen, events en gasten.' },
  { label: 'HAVEN', title: 'Havenvervoer', detail: 'Vervoer voor medewerkers en bezoekers van de haven van Antwerpen.' },
  { label: 'LONG DISTANCE', title: 'Lange afstanden', detail: 'Comfortabele ritten door België en naar bestemmingen in de buurlanden.' },
];

const whatsappUrl = 'https://wa.me/32466487936';

function AntwerpNightIllustration() {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Illustratie van premium vervoer in Antwerpen bij avond" className="h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#252a31" />
          <stop offset="1" stopColor="#101318" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8bd79" stopOpacity=".05" />
          <stop offset=".5" stopColor="#d8bd79" stopOpacity=".28" />
          <stop offset="1" stopColor="#d8bd79" stopOpacity=".03" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <rect width="720" height="420" rx="28" fill="url(#sky)" />
      <circle cx="516" cy="92" r="92" fill="#cda95d" opacity=".09" filter="url(#glow)" />
      <path d="M0 250h60v-67h28v67h25v-98h39v98h20v-52h33v52h28v-130h35v130h26v-85h29v85h28v-118h44v118h26v-72h28v72h30v-103h38v103h31v-60h24v60h38v-88h31v88h37v170H0z" fill="#20252c" />
      <path d="M0 286h720M0 311h720M0 337h720" stroke="#c9a75e" strokeOpacity=".12" />
      <path d="M0 320c153-44 332-46 720 0v100H0z" fill="url(#road)" />
      <path d="M360 308c-116 6-223 31-327 74m327-74c116 6 223 31 327 74" fill="none" stroke="#d4af67" strokeOpacity=".32" strokeDasharray="3 10" />
      <g transform="translate(94 160)">
        <path d="M55 105c11-27 42-49 91-56l74-9c35-4 74-1 108 15l58 28 44 7c15 3 25 14 28 29l4 20h-24a35 35 0 0 0-68 0H170a35 35 0 0 0-68 0H67l-12-10z" fill="#171b20" stroke="#d8bd79" strokeWidth="2.4" />
        <path d="m173 57-40 6c-27 5-48 17-61 35l121-2zM204 56l-3 40 180-2-50-25c-31-15-72-17-127-13z" fill="#b9c0c5" fillOpacity=".14" stroke="#d8bd79" strokeOpacity=".7" />
        <path d="M113 113h248m-293 6h28m381 0h17" stroke="#f0cf78" strokeWidth="3" strokeLinecap="round" />
        <circle cx="136" cy="138" r="24" fill="#111419" stroke="#8e7950" strokeWidth="4" />
        <circle cx="136" cy="138" r="9" fill="#6f7378" />
        <circle cx="410" cy="138" r="24" fill="#111419" stroke="#8e7950" strokeWidth="4" />
        <circle cx="410" cy="138" r="9" fill="#6f7378" />
        <text x="273" y="119" fill="#d8bd79" fontSize="9" fontFamily="Arial, sans-serif" letterSpacing="2" textAnchor="middle">LV TRANSPORT</text>
      </g>
      <rect x="24" y="24" width="672" height="372" rx="22" fill="none" stroke="#d4af67" strokeOpacity=".25" />
      <g fill="#d4af67">
        <circle cx="64" cy="64" r="3" /><circle cx="78" cy="64" r="3" opacity=".55" /><circle cx="92" cy="64" r="3" opacity=".28" />
      </g>
      <text x="54" y="364" fill="#e1cf9c" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="3">ANTWERPEN · BELGIË</text>
    </svg>
  );
}

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    const description = 'Premium taxi en luchthavenvervoer in Antwerpen en heel België. Reserveer uw rit bij LV Transport, 24/7 bereikbaar.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const createdMeta = !meta;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
    document.title = 'LV Transport | Premium taxi in Antwerpen';
    document.documentElement.lang = 'nl';

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      if (meta && createdMeta) meta.remove();
      else if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen text-white" style={{ background: "radial-gradient(ellipse at 73% 8%, rgba(212,175,55,.09), transparent 35%), linear-gradient(180deg, #151619 0%, #1b1d21 52%, #202329 100%)" }}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-3 z-40 rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <a href="#home" aria-label="LV Transport, naar de startpagina" onClick={closeMenu} className="shrink-0">
              <img src="/brand/lv-logo-header.svg" alt="LV Transport" className="h-10 w-auto sm:h-12" />
            </a>
            <button type="button" className="hamburger md:hidden" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? 'Sluiten' : 'Menu'}
            </button>
            <nav id="primary-navigation" aria-label="Hoofdnavigatie" className={`${menuOpen ? 'absolute left-3 right-3 top-[calc(100%+0.75rem)] grid gap-2 rounded-2xl border border-lv-gold/25 bg-[#171a20] p-4 shadow-gold-md' : 'hidden'} md:static md:flex md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
              <a href="#diensten" onClick={closeMenu} className="nav-btn nav-btn--secondary">Diensten</a>
              <Link to="/prijzen/" onClick={closeMenu} className="nav-btn nav-btn--secondary">Prijs berekenen</Link>
              <a href="#contact" onClick={closeMenu} className="nav-btn nav-btn--secondary">Contact</a>
              <Link to="/booking" onClick={closeMenu} className="nav-btn nav-btn--primary">Reserveer uw rit</Link>
            </nav>
          </div>
        </header>

        <section id="home" className="grid items-center gap-8 pb-12 pt-10 sm:pb-16 sm:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-12 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-lv-gold/30 bg-lv-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-lv-champagne">
              <span className="h-1.5 w-1.5 rounded-full bg-lv-gold" /> Antwerpen · België · 24/7 op reservatie
            </p>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              Betrouwbaar.<br />Comfortabel.<br /><span className="text-lv-champagne">Altijd op tijd.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-lv-mist sm:text-lg">
              Premium vervoer in Antwerpen en heel België. Reserveer uw rit voor luchthaven, zakenvervoer of uw dagelijkse bestemming.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-base">
                Reserveer uw rit <span aria-hidden="true">→</span>
              </Link>
              <Link to="/prijzen/" className="btn-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-base">
                Bereken uw prijs <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm text-lv-mist">
              <span className="inline-flex items-center gap-2"><span className="text-lv-champagne">24/7</span> Beschikbaar op reservatie</span>
              <span className="inline-flex items-center gap-2"><span className="text-lv-champagne">✓</span> Duidelijke afspraken</span>
              <span className="inline-flex items-center gap-2"><span className="text-lv-champagne">◆</span> Comfortabele ritten</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-lv-gold/10 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-lv-gold/30 bg-[#171a20] p-2 shadow-gold-md sm:p-3">
              <AntwerpNightIllustration />
            </div>
            <div className="glass-panel absolute -bottom-5 left-4 rounded-2xl px-4 py-3 sm:left-8 sm:px-5">
              <p className="text-xs uppercase tracking-[.16em] text-lv-mist">LV Transport</p>
              <p className="mt-1 text-sm font-semibold text-lv-champagne">Antwerpen & heel België</p>
            </div>
          </div>
        </section>

        <section id="diensten" className="scroll-mt-28 py-10 sm:py-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-lv-champagne">Onze diensten</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Een comfortabele rit, van vertrek tot aankomst.</h2>
            </div>
            <Link to="/booking" className="text-sm font-semibold text-lv-champagne underline decoration-lv-gold/40 underline-offset-4 hover:decoration-lv-gold">Boek uw rit <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((service, index) => (
              <article key={service.label} className="glass-panel service-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[.18em] text-lv-champagne">{service.label}</span>
                  <span className="text-xs text-white/35">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-lv-mist">{service.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel grid gap-6 rounded-3xl p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-lv-champagne">Uw rit begint eenvoudig</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Vraag uw rit aan wanneer het u past.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-lv-mist">Kies uw bestemming en gewenste tijd. Voor een prijs op maat kunt u vooraf uw route berekenen of ons rechtstreeks contacteren.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to="/booking" className="btn-primary inline-flex min-h-11 items-center justify-center px-5">Reserveer uw rit</Link>
            <Link to="/prijzen/" className="btn-secondary inline-flex min-h-11 items-center justify-center px-5">Prijs berekenen</Link>
          </div>
        </section>

        <footer id="contact" className="scroll-mt-28 mt-10 border-t border-lv-gold/20 py-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
            <div>
              <img src="/brand/lv-logo-header.svg" alt="LV Transport" className="h-10 w-auto" />
              <p className="mt-3 max-w-sm text-sm leading-6 text-lv-mist">Premium vervoer in Antwerpen en heel België. Discreet, comfortabel en op reservatie beschikbaar.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-lv-champagne">Contact</p>
              <a href="tel:+32466487936" className="mt-3 block text-sm text-white hover:text-lv-champagne">+32 466 48 79 36</a>
              <a href="mailto:info@lvtransport.be" className="mt-1 block text-sm text-lv-mist hover:text-lv-champagne">info@lvtransport.be</a>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 px-5">
              Chat via WhatsApp <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="mt-8 text-xs text-white/45">© {new Date().getFullYear()} LV Transport. Alle rechten voorbehouden.</p>
        </footer>
      </div>
    </main>
  );
}
