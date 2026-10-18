import { useState } from 'react';
import { Link } from 'react-router-dom';

const services = [
  { label: 'TAXI ANTWERPEN', title: 'Taxi Antwerpen', copy: 'Snel en comfortabel vervoer in Antwerpen en omgeving.', icon: '🚖' },
  { label: 'LUCHTHAVEN', title: 'Luchthavenvervoer', copy: 'Transfers naar Zaventem, Charleroi, Eindhoven, Schiphol en andere luchthavens.', icon: '✈' },
  { label: 'ZAKELIJK', title: 'Zakelijk vervoer', copy: 'Discreet vervoer voor bedrijven, vergaderingen, events en gasten.', icon: '▣' },
  { label: 'HAVEN', title: 'Havenvervoer', copy: 'Vervoer voor medewerkers en bezoekers van de haven van Antwerpen.', icon: '⚓' },
  { label: 'LANGE AFSTAND', title: 'Lange afstanden', copy: 'Comfortabele ritten door België en naar bestemmingen in de buurlanden.', icon: '➜' },
];

const routePrices = [
  { destination: 'Zaventem', price: '€80' },
  { destination: 'Brussel', price: '€80' },
  { destination: 'Mechelen', price: '€45' },
  { destination: 'Gent', price: '€100' },
  { destination: 'Schiphol', price: '€200' },
  { destination: 'Eindhoven', price: '€130' },
  { destination: 'Charleroi', price: '€150' },
  { destination: 'Breda', price: '€95' },
  { destination: 'Rotterdam', price: '€150' },
  { destination: 'Brugge', price: '€165' },
];

const whatsappUrl = 'https://wa.me/32466487936';
const routeRequestUrl = (destination: string) =>
  `${whatsappUrl}?text=${encodeURIComponent('Hallo, ik wil graag een rit naar ' + destination + ' reserveren.')}`;

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen bg-[#0b0c0e] text-white">
      <div className="mx-auto max-w-7xl px-3 pb-8 pt-3 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-3 z-40 rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <a href="#home" aria-label="LV Transport, naar de startpagina" onClick={closeMenu} className="shrink-0">
              <img src="/brand/lv-logo-header.svg" alt="LV Transport" className="h-10 w-auto sm:h-12" />
            </a>
            <button type="button" className="hamburger md:hidden" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? 'Sluiten' : 'Menu'}
            </button>
            <nav id="primary-navigation" aria-label="Hoofdnavigatie" className={`${menuOpen ? 'absolute left-3 right-3 top-[calc(100%+0.75rem)] grid gap-2 rounded-2xl border border-lv-gold/25 bg-[#171a20] p-4 shadow-xl' : 'hidden'} md:static md:flex md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
              <a href="#diensten" onClick={closeMenu} className="nav-link">Diensten</a>
              <Link to="/booking" onClick={closeMenu} className="nav-link">Boeken</Link>
              <a href="#prijzen" onClick={closeMenu} className="nav-link">Prijzen</a>
              <a href="#contact" onClick={closeMenu} className="nav-link">Contact</a>
              <a href="tel:+32466487936" className="btn-primary inline-flex min-h-10 items-center justify-center px-4">Bel nu</a>
            </nav>
          </div>
        </header>

        <section id="home" className="relative mt-3 min-h-[570px] overflow-hidden rounded-3xl border border-lv-gold/25 bg-[#111315] sm:min-h-[620px]">
          <div
            role="img"
            aria-label="Premium wagen in Antwerpen bij avond"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "linear-gradient(90deg, rgba(5,6,8,.94) 0%, rgba(5,6,8,.70) 42%, rgba(5,6,8,.18) 100%), linear-gradient(0deg, rgba(5,6,8,.96) 0%, transparent 55%), url('https://lvtransport-web3.netlify.app/images/lv-transport-hero.png')" }}
          />
          <div className="relative z-10 flex min-h-[570px] flex-col justify-between p-5 sm:min-h-[620px] sm:p-9 lg:p-12">
            <div className="max-w-xl pt-5 sm:pt-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-lv-gold/35 bg-black/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-lv-champagne">
                <span className="h-1.5 w-1.5 rounded-full bg-lv-gold" /> Antwerpen · België · 24/7 beschikbaar
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
                Betrouwbaar.<br />Comfortabel.<br /><span className="text-lv-champagne">Altijd op tijd.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-lv-mist sm:text-base">
                Premium vervoer in Antwerpen en België. Discreet, comfortabel en op reservatie.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/booking" className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-5">
                  Reserveer uw rit <span aria-hidden="true">→</span>
                </Link>
                <a href="#prijzen" className="btn-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5">
                  Bekijk tarieven <span aria-hidden="true">↘</span>
                </a>
              </div>
            </div>

            <div className="glass-panel mt-8 rounded-2xl border border-lv-gold/35 bg-black/75 p-4 shadow-2xl backdrop-blur-md sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-lv-champagne">LV Transport</p>
                  <h2 className="mt-1 text-xl font-semibold sm:text-2xl">Reserveer uw rit</h2>
                </div>
                <Link to="/booking" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-5">
                  Start uw reservering <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-lv-mist sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-3">⌖ Van / ophaaladres</div>
                <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-3">⌖ Naar / bestemming</div>
                <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-3">▦ Datum en tijd</div>
                <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-3">♙ Uw gegevens</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-3 text-xs text-lv-mist">
                <span><strong className="text-lv-champagne">24/7</strong> beschikbaar</span>
                <span><strong className="text-lv-champagne">✓</strong> Duidelijke afspraken</span>
                <span><strong className="text-lv-champagne">◆</strong> Veilig en betrouwbaar</span>
              </div>
            </div>
          </div>
        </section>

        <section id="diensten" className="scroll-mt-28 py-10 sm:py-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-lv-champagne">Onze diensten</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Onze diensten</h2>
            </div>
            <Link to="/booking" className="text-sm font-semibold text-lv-champagne underline decoration-lv-gold/40 underline-offset-4 hover:decoration-lv-gold">Boek uw rit <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((service) => (
              <article key={service.label} className="glass-panel service-card rounded-2xl p-5">
                <div className="text-3xl text-lv-champagne" aria-hidden="true">{service.icon}</div>
                <p className="mt-3 text-[10px] font-semibold tracking-[.18em] text-lv-champagne">{service.label}</p>
                <h3 className="mt-2 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-lv-mist">{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="prijzen" className="scroll-mt-28 py-8 sm:py-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-lv-champagne">Populaire bestemmingen</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Duidelijke tarieven</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-lv-mist">Vraag uw rit aan. We bevestigen de beschikbaarheid en de prijs voor uw reis.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {routePrices.map((route) => (
              <article key={route.destination} className="glass-panel rounded-2xl p-4 text-center">
                <p className="text-sm font-medium text-lv-mist">{route.destination}</p>
                <p className="mt-1 text-2xl font-semibold text-lv-champagne">{route.price}</p>
                <a href={routeRequestUrl(route.destination)} target="_blank" rel="noreferrer" className="btn-primary mt-3 inline-flex min-h-9 w-full items-center justify-center px-3 text-xs">
                  Reserveer <span aria-hidden="true" className="ml-1">↗</span>
                </a>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-lv-mist/70">Vaste prijsindicaties. De definitieve prijs wordt bevestigd bij uw reservering.</p>
        </section>

        <section className="glass-panel grid gap-5 rounded-3xl p-5 sm:grid-cols-2 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-lv-champagne">Uw rit volgen</p>
            <h2 className="mt-2 text-2xl font-semibold">Volg uw rit met uw reserveringscode</h2>
            <p className="mt-3 text-sm leading-6 text-lv-mist">Bekijk de actuele ritstatus via het bestaande reserverings- en trackingsysteem.</p>
          </div>
          <div className="flex items-center sm:justify-end">
            <Link to="/booking#tracking" className="btn-secondary inline-flex min-h-11 items-center justify-center px-5">Tracking openen <span aria-hidden="true" className="ml-2">→</span></Link>
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
