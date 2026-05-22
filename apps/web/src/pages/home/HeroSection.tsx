import { Link } from 'react-router-dom'

type SurfaceModule = {
  id: string
  title: string
  description: string
  to: string
  cta: string
  runtimeBinding: string
  continuityRule: string
}

const surface =
  'rounded-2xl border border-[#c9a24a]/25 bg-[linear-gradient(180deg,rgba(11,14,20,.92),rgba(8,10,14,.95))] p-5 shadow-[0_0_0_1px_rgba(9,10,14,.8),0_24px_60px_rgba(0,0,0,.45)]'

const modules: SurfaceModule[] = [
  {
    id: '1. Client',
    title: 'Premium Experience',
    description: 'Reservation entrypoint bound to booking and calculation contracts without local mock fallbacks.',
    to: '/booking',
    cta: 'Open reservation flow',
    runtimeBinding: 'booking.create + pricing.calculate contracts',
    continuityRule: 'No synthetic confirmation codes or session-only success states.',
  },
  {
    id: '2. Driver',
    title: 'Operational Cockpit',
    description: 'Assignment, route and readiness lanes with deterministic adapter states until runtime contracts bind.',
    to: '/driver',
    cta: 'Open driver cockpit',
    runtimeBinding: 'dispatch.assignment + ride.lifecycle contracts',
    continuityRule: 'No fake ETA, fake passenger or synthetic trip telemetry.',
  },
  {
    id: '3. Admin',
    title: 'Operational Control Tower',
    description: 'Operations continuity surface wired to verified modules and explicit integration seams only.',
    to: '/admin',
    cta: 'Open admin tower',
    runtimeBinding: 'operations.feed + incident.lifecycle contracts',
    continuityRule: 'No decorative analytics or demo dashboard widgets.',
  },
  {
    id: '4. Founder',
    title: 'Governance & Intelligence OS',
    description: 'Executive audit visibility preserving deterministic lineage and compliance boundaries.',
    to: '/founder',
    cta: 'Open founder OS',
    runtimeBinding: 'governance.summary + replay.lineage contracts',
    continuityRule: 'Audit-safe visibility with explicit source ownership per panel.',
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
            Runtime-safe convergence baseline across client, driver, admin and founder operational surfaces.
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <article className={surface} key={module.id}>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d9b666]">{module.id}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#f4f1ea]">{module.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{module.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.12em] text-zinc-500">Binding: {module.runtimeBinding}</p>
              <p className="mt-1 text-xs text-zinc-400">{module.continuityRule}</p>
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
