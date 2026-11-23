import { useRef, useState, type FormEvent } from 'react';
import { readBookingStatus } from '../../modules/moni/services/booking-status-client';
import { Link, useNavigate } from 'react-router-dom';
import { routePrices } from '../../modules/pricing/constants/route-prices';

const services = [
  { label: 'TAXI ANTWERPEN', title: 'Taxi Antwerpen', copy: 'Snel en comfortabel vervoer in Antwerpen en omgeving.', icon: '🚖' },
  { label: 'LUCHTHAVEN', title: 'Luchthavenvervoer', copy: 'Transfers naar Zaventem, Charleroi, Eindhoven, Schiphol en andere luchthavens.', icon: '✈' },
  { label: 'ZAKELIJK', title: 'Zakelijk vervoer', copy: 'Discreet vervoer voor bedrijven, vergaderingen, events en gasten.', icon: '▣' },
  { label: 'HAVEN', title: 'Havenvervoer', copy: 'Vervoer voor medewerkers en bezoekers van de haven van Antwerpen.', icon: '⚓' },
  { label: 'LANGE AFSTAND', title: 'Lange afstanden', copy: 'Comfortabele ritten door België en naar bestemmingen in de buurlanden.', icon: '➜' },
];

const whatsappUrl = 'https://wa.me/32466487936';
const routeRequestUrl = (destination: string) =>
  `${whatsappUrl}?text=${encodeURIComponent('Hallo, ik wil graag een rit naar ' + destination + ' reserveren.')}`;

export default function HeroSection() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [reference, setReference] = useState('');
  const [tracking, setTracking] = useState('');
  const [checking, setChecking] = useState(false);
  const pending = useRef(false);
  async function checkBooking(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setChecking(true); setTracking('');
    try {
      const result = await readBookingStatus(reference, import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be');
      const labels: Record<string, string> = { pending: 'Aanvraag ontvangen', assigned: 'Toegewezen', accepted: 'Geaccepteerd', en_route: 'Onderweg', arrived: 'Aangekomen', in_progress: 'Rit bezig', completed: 'Afgerond', cancelled: 'Geannuleerd', failed: 'Niet uitgevoerd' };
      setTracking(`${result.referenceCode}: ${labels[result.status]}.`);
    } catch (error) {
      setTracking(error instanceof Error ? error.message : 'De aanvraagstatus kan nu niet worden bevestigd.');
    } finally { pending.current = false; setChecking(false); }
  }

  return (
    <main className="premium-shell min-h-screen text-white">
      <div className="mx-auto max-w-6xl space-y-5 px-4 pb-8 pt-4 sm:px-6">
        <header className="glass-panel sticky top-3 z-40 rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <a href="#home" aria-label="LV Transport, naar de startpagina" onClick={closeMenu} className="shrink-0">
              <img src="/brand/lv-logo-header.svg" alt="LV Transport" className="h-10 w-auto sm:h-12" />
            </a>
            <button type="button" className="hamburger lg:hidden" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? 'Sluiten' : 'Menu'}
            </button>
            <nav id="primary-navigation" aria-label="Hoofdnavigatie" className={`${menuOpen ? 'absolute left-3 right-3 top-[calc(100%+0.75rem)] grid gap-2 rounded-2xl border border-lv-gold/25 bg-[#171a20] p-4 shadow-xl' : 'hidden'} lg:static lg:flex lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
              <a href="#diensten" onClick={closeMenu} className="nav-link">Diensten</a>
              <Link to="/booking" onClick={closeMenu} className="nav-link">Boeken</Link>
              <a href="#tracking" onClick={closeMenu} className="nav-link">Volg uw rit</a>
              <a href="#prijzen" onClick={closeMenu} className="nav-link">Prijzen</a>
              <a href="#contact" onClick={closeMenu} className="nav-link">Contact</a>
              <Link to="/ride" onClick={closeMenu} className="nav-link text-lv-champagne">Inloggen / registreren</Link>
              <a href="tel:+32466487936" className="btn-primary inline-flex min-h-10 items-center justify-center px-4">Bel nu</a>
            </nav>
          </div>
        </header>

        <section id="home" className="glass-panel hero-panel scroll-mt-28 rounded-3xl p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.25em] text-lv-champagne">LV Transport Platform · Antwerpen</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Uw taxi, met zorg geregeld.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-lv-mist">Premium vervoer in Antwerpen en België. Discreet, comfortabel en op reservatie.</p>
          <form className="lv-quick-booking" onSubmit={event => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            navigate('/booking', { state: { pickup: fields.get('pickup'), destination: fields.get('destination') } });
          }}>
            <label>Vertrekadres<input name="pickup" placeholder="Bijv. Antwerpen-Centraal" required /></label>
            <label>Bestemming<input name="destination" placeholder="Bijv. Luchthaven Zaventem" required /></label>
            <button type="submit" className="btn-primary">Reserveer uw rit</button>
            <a href="#prijzen" className="btn-secondary">Bekijk tarieven</a>
          </form>
          <div className="mt-8 flex flex-wrap gap-5 border-t border-lv-gold/20 pt-5 text-sm text-lv-mist"><span>Antwerpen & België</span><span>Taxi · Luchthaven · Zakelijk</span><a className="text-lv-champagne" href="tel:+32466487936">+32 466 48 79 36</a></div>
        </section>

        <section aria-label="Uw reservering" className="grid gap-3 sm:grid-cols-3">
          {[['01', 'Vraag uw rit aan', 'Vul uw route, datum en contactgegevens in.'], ['02', 'Bevestig de afspraken', 'We bevestigen de beschikbaarheid en de prijs voor uw reis.'], ['03', 'Bekijk uw aanvraag', 'Controleer de geregistreerde status met uw referentiecode.']].map(([step, title, copy]) => <article key={step} className="glass-panel rounded-2xl p-5"><p className="text-xs tracking-widest text-lv-champagne">{step}</p><h2 className="mt-3 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-lv-mist">{copy}</p></article>)}
        </section>

        <section id="tracking" className="glass-panel scroll-mt-28 rounded-3xl p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div><p className="text-xs uppercase tracking-[.2em] text-lv-champagne">Volg uw rit</p><h2 className="mt-3 text-2xl font-semibold">Uw aanvraag, helder in beeld.</h2><p className="mt-3 text-sm leading-6 text-lv-mist">Controleer de geregistreerde status met de referentiecode van uw reservering. Bekijk uw eigen ritgegevens na het inloggen bij uw reserveringen.</p><Link to="/ride" className="mt-4 inline-block text-sm text-lv-champagne underline underline-offset-4">Mijn reserveringen</Link></div>
            <form onSubmit={checkBooking} className="space-y-3">
              <label htmlFor="home-booking-reference" className="block text-sm text-lv-mist">Uw referentiecode</label>
              <input id="home-booking-reference" autoComplete="off" spellCheck={false} className="w-full rounded-xl border border-lv-gold/30 bg-black/25 px-4 py-3 text-white" required maxLength={100} value={reference} disabled={checking} onChange={event => { setReference(event.target.value); setTracking(''); }} />
              <button type="submit" disabled={checking} className="btn-primary inline-flex min-h-11 items-center justify-center px-5 disabled:opacity-60">{checking ? 'Controleren…' : 'Status controleren'}</button>
              {tracking && <p role="status" aria-live="polite" className="break-words text-sm leading-6 text-lv-mist">{tracking}</p>}
            </form>
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
          <nav aria-label="LVTransport portalen" className="mt-8 grid gap-3 border-t border-lv-gold/20 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['/ride', 'Client', 'MONI Ride', 'Mijn reserveringen'],
              ['/driver', 'Driver', 'MONI Drive', 'Operational Cockpit'],
              ['/admin', 'Admin', 'MONI Assistant', 'Control Tower'],
              ['/founder', 'Founder', 'MONI Core', 'Governance & Intelligence OS'],
            ].map(([path, role, moni, description]) => <Link key={path} to={path} className="glass-panel rounded-2xl p-4 transition-colors hover:border-lv-gold/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lv-gold"><span className="text-xs uppercase tracking-widest text-lv-mist">{role}</span><strong className="mt-2 block text-base text-lv-champagne">{moni}</strong><span className="mt-1 block text-xs text-lv-mist">{description}</span></Link>)}
          </nav>
          <p className="mt-8 text-xs text-white/45">© {new Date().getFullYear()} LV Transport. Alle rechten voorbehouden.</p>
        </footer>
      </div>
    </main>
  );
}
