import { useState } from 'react';
import { Button } from '@lvtransport/ui';

const navLinks = ['Services', 'VIP & Business', 'Fleet', 'Safety', 'Contact'];

const services = [
  { title: 'Airport Transfers', desc: 'On-time, flight-aware pickups with premium chauffeur support.' },
  { title: 'City Executive Rides', desc: 'Discreet, comfortable transport for daily business mobility.' },
  { title: 'Event Logistics', desc: 'Coordinated multi-vehicle planning for conferences and private events.' }
];

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-lv-black text-white">
      <header className="sticky top-0 z-40 border-b border-lv-gold/20 bg-lv-black/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div className="font-display text-xl font-semibold tracking-wide text-lv-champagne">LV Transport</div>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link} href="#" className="text-sm text-lv-mist transition-colors hover:text-lv-champagne">
                {link}
              </a>
            ))}
          </div>
          <div className="hidden md:block">
            <Button size="sm">Book Consultation</Button>
          </div>
          <button
            type="button"
            className="rounded-lg border border-lv-gold/40 p-2 text-lv-champagne transition hover:bg-lv-gold/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </nav>
        <div
          className={`overflow-hidden border-t border-lv-gold/20 bg-lv-charcoal/95 px-6 transition-all duration-300 md:hidden ${mobileOpen ? 'max-h-80 py-4' : 'max-h-0 py-0'}`}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a key={link} href="#" className="text-sm text-lv-mist transition-colors hover:text-lv-champagne">
                {link}
              </a>
            ))}
            <Button size="sm" className="mt-2 w-full">
              Book Consultation
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-20 md:grid-cols-2 md:px-8">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-lv-gold/30 bg-lv-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lv-champagne">
              Premium Ground Mobility
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Enterprise transport, elevated for every mile.</h1>
            <p className="max-w-xl text-lv-mist md:text-lg">
              Delivering black-car precision, VIP-ready comfort, and operational reliability for modern teams and travelers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="shadow-gold-md">Request a Proposal</Button>
              <Button variant="secondary">Explore Fleet</Button>
            </div>
          </div>
          <div className="rounded-2xl border border-lv-gold/20 bg-lv-gold-gradient p-8 shadow-gold-lg transition-transform duration-500 hover:-translate-y-1">
            <p className="text-sm uppercase tracking-[0.2em] text-lv-champagne">Service Snapshot</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {['24/7 Dispatch', 'SLA-backed Reliability', 'Corporate Billing', 'Real-time Coordination'].map((item) => (
                <div key={item} className="rounded-xl border border-lv-gold/20 bg-lv-charcoal/70 p-4 text-sm text-lv-mist">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-lv-gold/10 bg-lv-graphite/60">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
            <h2 className="text-3xl font-semibold">Services</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {services.map((service) => (
                <article key={service.title} className="rounded-2xl border border-lv-gold/20 bg-lv-charcoal/70 p-6 transition hover:border-lv-gold/50 hover:shadow-gold-sm">
                  <h3 className="text-xl font-medium text-lv-champagne">{service.title}</h3>
                  <p className="mt-3 text-sm text-lv-mist">{service.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <div className="rounded-3xl border border-lv-gold/20 bg-lv-charcoal p-8 md:p-12">
            <h2 className="text-3xl font-semibold">VIP & Business Mobility</h2>
            <p className="mt-4 max-w-3xl text-lv-mist">
              Purpose-built for executives, partners, and high-value guests with discreet chauffeurs, priority routing, and concierge-level ride standards.
            </p>
          </div>
        </section>

        <section className="bg-lv-gold-gradient">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center md:px-8">
            <div>
              <h2 className="text-3xl font-semibold">Ready to elevate your transport operations?</h2>
              <p className="mt-2 text-lv-mist">Launch with a premium fleet strategy tailored to your organization.</p>
            </div>
            <Button size="lg" className="animate-pulse">
              Start Booking Setup
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-lv-gold/20 bg-lv-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-lv-mist md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 LV Transport. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-lv-champagne">Privacy</a>
            <a href="#" className="transition-colors hover:text-lv-champagne">Terms</a>
            <a href="#" className="transition-colors hover:text-lv-champagne">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
