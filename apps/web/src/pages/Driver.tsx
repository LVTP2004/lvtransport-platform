type DriverRuntimeState = {
  assignment: {
    rideId: string
    pickup: string
    dropoff: string
    etaMinutes: number | null
    passengerName: string
    tier: 'Premium' | 'Business' | 'Standard'
  }
  operations: {
    checklist: Array<{ label: string; status: 'ready' | 'pending' | 'blocked' }>
    route: { distanceKm: number | null; traffic: 'low' | 'moderate' | 'high' | 'unknown' }
  }
  source: 'backend-contract' | 'deterministic-adapter'
}

const driverState: DriverRuntimeState = {
  assignment: {
    rideId: 'awaiting-dispatch-binding',
    pickup: 'Dispatch-originated pickup point',
    dropoff: 'Dispatch-confirmed destination',
    etaMinutes: null,
    passengerName: 'Assigned via control tower',
    tier: 'Premium',
  },
  operations: {
    checklist: [
      { label: 'Vehicle readiness', status: 'ready' },
      { label: 'Passenger manifest', status: 'pending' },
      { label: 'Traffic confirmation', status: 'pending' },
    ],
    route: { distanceKm: null, traffic: 'unknown' },
  },
  source: 'deterministic-adapter',
}

export default function Driver() {
  return (
    <main className="min-h-screen bg-[#07090d] p-5 text-zinc-100 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <header className="rounded-2xl border border-amber-400/25 bg-black/45 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Driver Surface</p>
          <h1 className="mt-2 text-2xl font-semibold">Operational Cockpit</h1>
          <p className="mt-2 text-sm text-zinc-400">Runtime source: {driverState.source}</p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
            <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Current Assignment</h2>
            <dl className="mt-3 grid gap-2 text-sm text-zinc-300">
              <div className="flex justify-between gap-4"><dt>Ride ID</dt><dd>{driverState.assignment.rideId}</dd></div>
              <div className="flex justify-between gap-4"><dt>Pickup</dt><dd>{driverState.assignment.pickup}</dd></div>
              <div className="flex justify-between gap-4"><dt>Dropoff</dt><dd>{driverState.assignment.dropoff}</dd></div>
              <div className="flex justify-between gap-4"><dt>Passenger</dt><dd>{driverState.assignment.passengerName}</dd></div>
              <div className="flex justify-between gap-4"><dt>Tier</dt><dd>{driverState.assignment.tier}</dd></div>
              <div className="flex justify-between gap-4"><dt>ETA</dt><dd>{driverState.assignment.etaMinutes ? `${driverState.assignment.etaMinutes} min` : 'Awaiting live contract value'}</dd></div>
            </dl>
          </article>

          <article className="rounded-2xl border border-amber-400/20 bg-[#111318]/85 p-4">
            <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Route & Readiness</h2>
            <p className="mt-3 text-sm text-zinc-300">
              Distance: {driverState.operations.route.distanceKm ? `${driverState.operations.route.distanceKm} km` : 'Pending route engine'}
            </p>
            <p className="mt-1 text-sm text-zinc-300">Traffic model: {driverState.operations.route.traffic}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {driverState.operations.checklist.map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/35 px-3 py-2">
                  <span>{item.label}</span>
                  <span className="text-amber-200">{item.status}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}
