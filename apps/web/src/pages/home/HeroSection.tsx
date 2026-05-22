import { Link } from 'react-router-dom'

const surface =
  'rounded-2xl border border-[#c9a24a]/25 bg-[linear-gradient(180deg,rgba(11,14,20,.92),rgba(8,10,14,.95))] p-5 shadow-[0_0_0_1px_rgba(9,10,14,.8),0_24px_60px_rgba(0,0,0,.45)]'

const modules = [
  {
    id: '1. Client',
    title: 'Premium Experience',
    description:
      'Booking lifecycle entrypoint for premium rides, airport transfers, pricing estimation, customer state and tracking access.',
    to: '/booking',
    cta: 'Open reservation flow',
  },
  {
    id: '2. Driver',
    title: 'Operational Cockpit',
    description:
      'Ride acceptance, pickup and destination workflows connected to runtime progression and dispatch coordination.',
    to: '/driver',
    cta: 'Open driver cockpit',
  },
  {
    id: '3. Admin',
    title: 'Operational Control Tower',
    description:
      'Fleet supervision, SLA visibility, incident monitoring and continuity state across active operations.',
    to: '/admin',
    cta: 'Open admin tower',
  },
  {
    id: '4. Founder',
    title: 'Governance & Intelligence OS',
    description:
      'Deterministic governance, replay lineage, audit status and trust-state overview for executive control.',
    to: '/founder',
    cta: 'Open founder OS',
  },
]

export default function HeroSection() {
  return (
    <main className="min-h-screen bg-[#06080c] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="relative overflow-hidden rounded-3xl border border-[#c9a24a]/30 bg-[radial-gradient(circle_at_20%_20%,rgba(201,162,74,.18),transparent_42%),linear-gradient(135deg,#091019_0%,#0c1320_55%,#080c13_100%)] px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d9b666]">LV Transport Premium Operating System</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-[#f4f1ea] sm:text-5xl">
            Betrouwbaar. Comfortabel. Altijd op tijd.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Founder-approved convergence baseline across client premium experience, driver operational cockpit,
            admin control tower, and founder governance surface.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-300">
            <span className="rounded-full border border-[#c9a24a]/35 px-3 py-1">Dark graphite runtime UI</span>
            <span className="rounded-full border border-[#c9a24a]/35 px-3 py-1">Restrained gold accents</span>
            <span className="rounded-full border border-[#c9a24a]/35 px-3 py-1">Operational mission-control clarity</span>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <article className={surface} key={module.id}>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d9b666]">{module.id}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#f4f1ea]">{module.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{module.description}</p>
              <Link
                className="mt-4 inline-flex rounded-lg border border-[#c9a24a]/40 bg-[#0d121a]/80 px-3 py-2 text-sm text-[#f1d793] transition hover:bg-[#141d29]"
                to={module.to}
              >
                {module.cta}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
