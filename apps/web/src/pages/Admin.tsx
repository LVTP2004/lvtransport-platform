type AdminRuntimeModule = {
  name: string
  source: 'backend-contract' | 'deterministic-adapter' | 'integration-seam'
  status: 'operational' | 'degraded' | 'standby'
  detail: string
}

const adminModules: AdminRuntimeModule[] = [
  {
    name: 'Dispatch Queue',
    source: 'backend-contract',
    status: 'operational',
    detail: 'Bound to API dispatch lifecycle without synthetic queue injection.',
  },
  {
    name: 'Incident Oversight',
    source: 'integration-seam',
    status: 'standby',
    detail: 'Schema boundary reserved for incident service, no decorative KPIs rendered.',
  },
  {
    name: 'Fleet Runtime Health',
    source: 'deterministic-adapter',
    status: 'operational',
    detail: 'Deterministic adapter keeps UI stable until telemetry endpoint is attached.',
  },
  {
    name: 'Replay & Continuity',
    source: 'integration-seam',
    status: 'standby',
    detail: 'Operational continuity lane retained for event replay integration.',
  },
]

export default function Admin() {
  return (
    <main className="min-h-screen bg-[#07090d] p-5 text-zinc-100 sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="rounded-2xl border border-amber-400/25 bg-black/45 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Admin Surface</p>
          <h1 className="mt-2 text-2xl font-semibold">Operational Control Tower</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {adminModules.map((module) => (
            <article key={module.name} className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">{module.name}</h2>
                <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">{module.status}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{module.detail}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.12em] text-zinc-500">Source: {module.source}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
