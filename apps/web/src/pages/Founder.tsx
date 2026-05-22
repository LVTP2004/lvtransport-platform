export default function Founder() {
  return (
    <main className="min-h-screen bg-[#07090d] p-5 text-zinc-100 sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="rounded-2xl border border-amber-400/25 bg-black/45 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Founder Surface</p>
          <h1 className="mt-2 text-2xl font-semibold">Governance & Intelligence OS</h1>
        </header>
        <section className="grid gap-4 md:grid-cols-3">
          {['Executive Overview', 'Operational Integrity', 'Decision Evidence'].map((title) => (
            <article key={title} className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
              <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">{title}</h2>
              <p className="mt-2 text-sm text-zinc-300">Governance panel baseline restored for founder-controlled operations.</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
