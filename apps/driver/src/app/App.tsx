import { useMemo, useState } from 'react';

type TripState = 'Pickup' | 'On route' | 'Arrived' | 'Completed';

const tripStates: TripState[] = ['Pickup', 'On route', 'Arrived', 'Completed'];

const performanceStats = [
  { label: 'Acceptance rate', value: '96%', detail: 'Top 10% today' },
  { label: 'Cancellation', value: '1.2%', detail: 'Excellent consistency' },
  { label: 'Avg. rating', value: '4.96', detail: 'From 248 riders' },
  { label: 'On-time pickup', value: '94%', detail: 'Strong punctuality' }
];

const rideHistory = [
  { id: 'LV-9012', rider: 'Ava M.', route: 'Bellagio → The Venetian', fare: '$24.80', status: 'Completed' },
  { id: 'LV-9011', rider: 'Noah P.', route: 'Wynn → Airport T1', fare: '$31.20', status: 'Completed' },
  { id: 'LV-9010', rider: 'Sophia R.', route: 'Aria → Fremont Street', fare: '$19.30', status: 'Completed' }
];

const notifications = [
  { title: 'Driver assigned: BK-10928', note: 'Pickup at Fontainebleau • customer tracking live', time: 'Just now' },
  { title: 'Performance badge unlocked', note: 'Maintained 4.9+ rating this week', time: '18m ago' },
  { title: 'Vehicle inspection reminder', note: 'Schedule check before May 15', time: '1h ago' }
];

export function App() {
  const [online, setOnline] = useState(true);
  const [tripStep, setTripStep] = useState<TripState>('Pickup');

  const stateIndex = useMemo(() => tripStates.indexOf(tripStep), [tripStep]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 pb-10 sm:gap-5 sm:p-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-6">
        <aside className="space-y-4 rounded-3xl border border-amber-500/20 bg-zinc-900/90 p-4 shadow-xl shadow-black/30 backdrop-blur transition-all duration-300">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Driver status</p>
            <h1 className="mt-2 text-2xl font-semibold">LV Transport</h1>
            <p className="mt-1 text-sm text-zinc-300">Premium Mobility Console</p>
            <button
              type="button"
              onClick={() => setOnline((prev) => !prev)}
              className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
                online
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300'
              }`}
            >
              <span>{online ? 'You are Online' : 'You are Offline'}</span>
              <span
                className={`h-5 w-10 rounded-full p-0.5 transition-all ${online ? 'bg-emerald-500/80' : 'bg-zinc-700'}`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${online ? 'translate-x-5' : ''}`}
                />
              </span>
            </button>
          </div>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold text-amber-200">Earnings Summary</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <MetricCard label="Today" value="$286.40" />
              <MetricCard label="Week" value="$1,940" />
              <MetricCard label="Trips" value="18" />
              <MetricCard label="Bonus" value="$74" />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold text-amber-200">Performance</h2>
            <div className="mt-3 space-y-2">
              {performanceStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{item.label}</span>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="order-first space-y-4 lg:order-none">
          <div className="rounded-3xl border border-amber-500/30 bg-zinc-900 p-4 shadow-2xl shadow-black/30 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-amber-200">Map-ready Navigation Layout</h2>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">Android Optimized</span>
            </div>
            <div className="mt-4 h-56 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/70 p-4 sm:h-72">
              <p className="text-sm text-zinc-400">Reserved for future GPS + map canvas.</p>
              <p className="mt-2 text-xs text-zinc-500">Component structure is prepared for realtime trip coordinate integration.</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button className="rounded-2xl bg-amber-500 px-5 py-4 text-base font-semibold text-zinc-900 transition hover:bg-amber-400 active:scale-[0.99]">
                Accept Ride
              </button>
              <button className="rounded-2xl border border-zinc-600 bg-zinc-800 px-5 py-4 text-base font-semibold transition hover:border-zinc-500 hover:bg-zinc-700 active:scale-[0.99]">
                Reject Ride
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-amber-200">Active Trip State</h3>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              {tripStates.map((state, index) => (
                <button
                  key={state}
                  className={`rounded-xl border px-2 py-3 transition ${
                    index <= stateIndex ? 'border-amber-400 bg-amber-500/20 text-amber-100' : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                  onClick={() => setTripStep(state)}
                >
                  {state}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              <p className="text-xs text-zinc-400">Current phase</p>
              <p className="mt-1 text-lg font-semibold text-amber-200">{tripStep}</p>
              <p className="mt-2 text-sm text-zinc-400">Trip cards, rider ETA, and navigation actions will attach to this state engine.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-amber-200">Ride History</h3>
            <div className="mt-3 space-y-2">
              {rideHistory.map((ride) => (
                <article key={ride.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 transition hover:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{ride.route}</p>
                    <span className="text-sm font-semibold text-amber-200">{ride.fare}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{ride.id} • {ride.rider}</p>
                  <span className="mt-2 inline-flex rounded-full border border-emerald-600/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{ride.status}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-xl shadow-black/20">
          <section className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-4">
            <h3 className="text-sm font-semibold text-amber-200">Incoming Ride Request</h3>
            <p className="mt-1 text-xs text-zinc-400">Sound-ready component structure</p>
            <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-900 p-3">
              <p className="text-sm font-medium">Rider: Olivia K.</p>
              <p className="mt-1 text-xs text-zinc-400">Pickup: Caesars Palace • 2 min away</p>
              <p className="mt-1 text-xs text-zinc-400">Dropoff: Resorts World</p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-900">Accept</button>
                <button className="flex-1 rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm">Reject</button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <h3 className="text-sm font-semibold text-amber-200">Vehicle Information</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>Model: Tesla Model Y</li>
              <li>Plate: LVT-2481</li>
              <li>Color: Black Metallic</li>
              <li>Fuel/Battery: 82%</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <h3 className="text-sm font-semibold text-amber-200">Profile & Settings</h3>
            <div className="mt-3 space-y-2 text-sm">
              <button className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-left">Driver preferences</button>
              <button className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-left">Shift & availability</button>
              <button className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-left">Safety toolkit</button>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <h3 className="text-sm font-semibold text-amber-200">Notifications Center</h3>
            <div className="mt-3 space-y-2">
              {notifications.map((item) => (
                <article key={item.title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{item.note}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">{item.time}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 transition hover:-translate-y-0.5 hover:border-amber-500/40">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-amber-100">{value}</p>
    </div>
  );
}
