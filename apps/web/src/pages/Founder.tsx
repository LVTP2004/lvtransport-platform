type GovernanceLane = {
  lane: string
  source: 'backend-contract' | 'deterministic-adapter' | 'integration-seam'
  narrative: string
  checkpoint: string
}

const governanceLanes: GovernanceLane[] = [
  {
    lane: 'Executive Overview',
    source: 'backend-contract',
    narrative: 'Summarizes verified operational indicators emitted by runtime services.',
    checkpoint: 'No synthetic KPI expansion permitted.',
  },
  {
    lane: 'Governance & Compliance',
    source: 'integration-seam',
    narrative: 'Reserved integration seam for policy and compliance event ingestion.',
    checkpoint: 'Waiting for policy service contract binding.',
  },
  {
    lane: 'Replay Intelligence',
    source: 'deterministic-adapter',
    narrative: 'Deterministic placeholder narrative for audit replay pipeline readiness.',
    checkpoint: 'Adapter stays static until replay service emits runtime events.',
  },
  {
    lane: 'System Health',
    source: 'backend-contract',
    narrative: 'Uses existing runtime health contract to keep founder visibility operational.',
    checkpoint: 'Contract-only health states shown.',
  },
]

export default function Founder() {
  return (
    <main className="min-h-screen bg-[#07090d] p-5 text-zinc-100 sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="rounded-2xl border border-amber-400/25 bg-black/45 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Founder Surface</p>
          <h1 className="mt-2 text-2xl font-semibold">Governance & Intelligence OS</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {governanceLanes.map((item) => (
            <article key={item.lane} className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
              <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">{item.lane}</h2>
              <p className="mt-2 text-sm text-zinc-300">{item.narrative}</p>
              <p className="mt-2 text-sm text-zinc-400">{item.checkpoint}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.12em] text-zinc-500">Source: {item.source}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
