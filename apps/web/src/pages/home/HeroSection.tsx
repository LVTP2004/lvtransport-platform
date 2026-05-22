import { Link } from 'react-router-dom'

const panel = 'rounded-2xl border border-amber-400/25 bg-[#111318]/85 p-5 shadow-[0_0_0_1px_rgba(0,0,0,.4)]'

export default function HeroSection() {
  return (
    <main className="min-h-screen bg-[#07090d] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="rounded-2xl border border-amber-400/25 bg-black/50 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300">LV Transport Premium Operating System</p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-100 sm:text-4xl">Betrouwbaar. Comfortabel. Altijd op tijd.</h1>
          <p className="mt-3 max-w-3xl text-sm text-zinc-300">Founder-approved operating baseline across client premium experience, driver operational cockpit, admin control tower, and founder governance surface.</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className={panel}>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">1. Client</p>
            <h2 className="mt-2 text-xl font-semibold">Premium Experience</h2>
            <p className="mt-2 text-sm text-zinc-300">Reservation and route-intent entry point with operational tone and restrained luxury UI.</p>
            <Link className="mt-4 inline-flex rounded-lg border border-amber-400/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-400/10" to="/booking">Open reservation flow</Link>
          </article>

          <article className={panel}>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">2. Driver</p>
            <h2 className="mt-2 text-xl font-semibold">Operational Cockpit</h2>
            <p className="mt-2 text-sm text-zinc-300">Driver-specific cockpit for lifecycle execution. No simulated telemetry is introduced in this surface.</p>
            <Link className="mt-4 inline-flex rounded-lg border border-amber-400/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-400/10" to="/driver">Open driver cockpit</Link>
          </article>

          <article className={panel}>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">3. Admin</p>
            <h2 className="mt-2 text-xl font-semibold">Operational Control Tower</h2>
            <p className="mt-2 text-sm text-zinc-300">Dispatch and operations control surface with governance-safe visual language.</p>
            <Link className="mt-4 inline-flex rounded-lg border border-amber-400/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-400/10" to="/admin">Open admin tower</Link>
          </article>

          <article className={panel}>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">4. Founder</p>
            <h2 className="mt-2 text-xl font-semibold">Governance & Intelligence OS</h2>
            <p className="mt-2 text-sm text-zinc-300">Read-only governance overview for executive control and evidence review pathways.</p>
            <Link className="mt-4 inline-flex rounded-lg border border-amber-400/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-400/10" to="/founder">Open founder OS</Link>
          </article>
        </section>
      </div>
    </main>
  )
}
