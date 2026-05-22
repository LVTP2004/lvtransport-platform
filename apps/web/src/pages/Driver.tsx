export default function Driver() {
  return (
    <main className="min-h-screen bg-[#07090d] p-5 text-zinc-100 sm:p-8">
      <div className="mx-auto grid max-w-5xl gap-4">
        <header className="rounded-2xl border border-amber-400/25 bg-black/45 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Driver Surface</p>
          <h1 className="mt-2 text-2xl font-semibold">Operational Cockpit</h1>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
            <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Current Assignment</h2>
            <p className="mt-2 text-sm text-zinc-300">Lifecycle-aware cockpit baseline restored without synthetic realtime data.</p>
          </article>
          <article className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
            <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Vehicle & Route Ops</h2>
            <p className="mt-2 text-sm text-zinc-300">Telemetry styling preserved while avoiding fake status generation.</p>
          </article>
        </section>
      </div>
    </main>
  )
}
