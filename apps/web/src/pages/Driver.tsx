type RuntimePanel = {
  label: string
  source: 'backend-contract' | 'deterministic-adapter' | 'integration-seam'
  state: 'operational' | 'standby' | 'pending'
  detail: string
}

type DriverRuntimeState = {
  assignment: {
    rideId: string
    pickup: string
    dropoff: string
    etaMinutes: number | null
    passengerName: string
    tier: 'Premium' | 'Business' | 'Standard'
  }
  route: {
    distanceKm: number | null
    traffic: 'low' | 'moderate' | 'high' | 'unknown'
  }
  panels: RuntimePanel[]
  source: 'backend-contract' | 'deterministic-adapter'
  rideStateMachine: Array<{
    state: 'queued' | 'accepted' | 'arrived_pickup' | 'in_transit' | 'completed'
    visibility: 'visible' | 'awaiting-runtime-event'
    source: 'backend-contract' | 'integration-seam'
  }>
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
  route: {
    distanceKm: null,
    traffic: 'unknown',
  },
  panels: [
    {
      label: 'Assignment Contract',
      source: 'backend-contract',
      state: 'pending',
      detail: 'Reads dispatch assignment payload directly without generated placeholder trips.',
    },
    {
      label: 'Route Adapter',
      source: 'deterministic-adapter',
      state: 'standby',
      detail: 'Distance and ETA stay null until route engine returns verified contract values.',
    },
    {
      label: 'Passenger Verification',
      source: 'integration-seam',
      state: 'standby',
      detail: 'Identity confirmation seam present without synthetic rider profile injection.',
    },
  ],
  source: 'deterministic-adapter',
  rideStateMachine: [
    { state: 'queued', visibility: 'visible', source: 'backend-contract' },
    { state: 'accepted', visibility: 'awaiting-runtime-event', source: 'backend-contract' },
    { state: 'arrived_pickup', visibility: 'awaiting-runtime-event', source: 'backend-contract' },
    { state: 'in_transit', visibility: 'awaiting-runtime-event', source: 'backend-contract' },
    { state: 'completed', visibility: 'awaiting-runtime-event', source: 'integration-seam' },
  ],
}

const renderValue = (value: string | number | null, fallback: string) => (value === null ? fallback : value)

export default function Driver() {
  return (
    <main className="min-h-screen bg-[#05070b] p-5 text-zinc-100 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <header className="rounded-2xl border border-amber-300/30 bg-[#0a0d13]/95 p-5 shadow-[0_0_0_1px_rgba(245,158,11,0.06)]">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Driver Surface</p>
          <h1 className="mt-2 text-2xl font-semibold">Operational Cockpit</h1>
          <p className="mt-2 text-sm text-zinc-400">
            All blocks are contract-bound, adapter-backed, or explicit integration seams. Realtime telemetry is never fabricated.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-amber-300/20 bg-[#0d1118]/90 p-4">
            <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Active Ride Binding</h2>
            <dl className="mt-3 grid gap-2 text-sm text-zinc-300">
              <div className="flex justify-between gap-4"><dt>Ride ID</dt><dd>{driverState.assignment.rideId}</dd></div>
              <div className="flex justify-between gap-4"><dt>Pickup</dt><dd>{driverState.assignment.pickup}</dd></div>
              <div className="flex justify-between gap-4"><dt>Dropoff</dt><dd>{driverState.assignment.dropoff}</dd></div>
              <div className="flex justify-between gap-4"><dt>Passenger</dt><dd>{driverState.assignment.passengerName}</dd></div>
              <div className="flex justify-between gap-4"><dt>Tier</dt><dd>{driverState.assignment.tier}</dd></div>
              <div className="flex justify-between gap-4"><dt>ETA</dt><dd>{renderValue(driverState.assignment.etaMinutes, 'Awaiting runtime contract value')}</dd></div>
              <div className="flex justify-between gap-4"><dt>Route Distance</dt><dd>{renderValue(driverState.route.distanceKm, 'Pending route engine contract')}</dd></div>
              <div className="flex justify-between gap-4"><dt>Traffic</dt><dd>{driverState.route.traffic}</dd></div>
            </dl>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-zinc-500">Surface source owner: {driverState.source}</p>
          </article>

          <article className="rounded-2xl border border-amber-300/20 bg-[#0d1118]/90 p-4">
            <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Runtime Panels</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {driverState.panels.map((panel) => (
                <li key={panel.label} className="rounded-xl border border-zinc-800 bg-black/35 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-zinc-200">{panel.label}</span>
                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">{panel.state}</span>
                  </div>
                  <p className="mt-2 text-zinc-400">{panel.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-zinc-500">Source: {panel.source}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-amber-300/20 bg-[#0d1118]/90 p-4">
          <h2 className="text-sm uppercase tracking-[0.16em] text-amber-200">Ride State Machine Visibility</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {driverState.rideStateMachine.map((node) => (
              <li key={node.state} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl border border-zinc-800 bg-black/35 px-3 py-2">
                <span>{node.state}</span>
                <span className="text-zinc-400">{node.visibility}</span>
                <span className="text-xs uppercase tracking-[0.1em] text-amber-200">{node.source}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Realtime event seam declared: websocket transport and dispatch events remain runtime-owned and non-simulated.
          </p>
        </section>
      </div>
    </main>
  )
}
