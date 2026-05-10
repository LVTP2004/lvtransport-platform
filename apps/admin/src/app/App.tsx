import { useEffect, useState, type ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string;
  trend?: string;
  tone?: 'gold' | 'emerald' | 'blue' | 'rose';
};

function MetricCard({ title, value, trend, tone = 'gold' }: MetricCardProps) {
  const toneClass = {
    gold: 'from-amber-400/20 to-amber-300/5 border-amber-400/30 text-amber-200',
    emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-400/30 text-emerald-200',
    blue: 'from-sky-400/20 to-sky-300/5 border-sky-400/30 text-sky-200',
    rose: 'from-rose-400/20 to-rose-300/5 border-rose-400/30 text-rose-200',
  }[tone];

  return (
    <article className={`rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5`}>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {trend && <p className="mt-2 text-xs text-zinc-300">{trend}</p>}
    </article>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2 text-amber-300">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}


type AdminBooking = {
  id: string;
  referenceCode: string;
  serviceType: string;
  status: string;
  scheduledAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

const navItems = [
  { label: 'Dashboard', icon: '◫' },
  { label: 'Bookings', icon: '◈' },
  { label: 'Dispatch', icon: '⌖' },
  { label: 'Fleet', icon: '▣' },
  { label: 'Drivers', icon: '◍' },
  { label: 'Incidents', icon: '⚠' },
  { label: 'Settings', icon: '⚙' },
];


export function App() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings`);
        const payload = await res.json();
        setBookings(payload.bookings ?? []);
      } catch {
        setBookings([]);
      }
    };
    // TODO: Replace polling with realtime Firestore listeners when persistence is connected.
    load();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-zinc-800 bg-black/90 p-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">LV Transport</p>
            <h1 className="mt-1 text-2xl font-bold text-amber-300">Control Tower</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ label, icon }, index) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  index === 0
                    ? 'bg-amber-400/20 text-amber-200'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <span className="w-4 text-center">{icon}</span> {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Operations Center</p>
              <p className="text-lg font-medium text-white">Regional Dispatch & Service Health</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm transition hover:border-amber-300 hover:text-amber-200">Today</button>
              <button className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 transition hover:border-amber-300 hover:text-amber-200">
                <span>🔔</span>
              </button>
            </div>
          </header>

          <div className="space-y-5 p-5">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Revenue Today" value="$84,290" trend="+6.4% vs yesterday" tone="gold" />
              <MetricCard title="Active Rides" value="148" trend="12 nearing destination" tone="emerald" />
              <MetricCard title="Driver Utilization" value="91%" trend="Across 3 operating zones" tone="blue" />
              <MetricCard title="Critical Alerts" value="3" trend="2 requires dispatch intervention" tone="rose" />
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
              <div className="space-y-5 xl:col-span-2">
                <Panel title="Booking Management" icon={<span>◈</span>}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                        <tr>
                          {['Reference', 'Service', 'Status', 'Schedule'].map((h) => (
                            <th key={h} className="px-2 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((row) => (
                          <tr key={row.id} className="border-t border-zinc-800 text-zinc-200 transition hover:bg-zinc-900/70">
                            <td className="px-2 py-3">{row.referenceCode}</td>
                            <td className="px-2 py-3">{row.serviceType}</td>
                            <td className="px-2 py-3">{row.status}</td>
                            <td className="px-2 py-3">{new Date(row.scheduledAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <div className="grid gap-5 md:grid-cols-2">
                  <Panel title="Active Rides" icon={<span>◉</span>}>
                    <ul className="space-y-3 text-sm text-zinc-300">
                      <li className="rounded-xl bg-zinc-900/80 p-3">Ride #R-8821 • Downtown to Terminal 1 • 14 min</li>
                      <li className="rounded-xl bg-zinc-900/80 p-3">Ride #R-8830 • Convention to Bellagio • 9 min</li>
                      <li className="rounded-xl bg-zinc-900/80 p-3">Ride #R-8833 • Wynn to Airport • 21 min</li>
                    </ul>
                  </Panel>

                  <Panel title="Driver Monitoring" icon={<span>◍</span>}>
                    <div className="grid gap-3 text-sm">
                      {['On Duty 126', 'Break 14', 'Offline 8'].map((d) => (
                        <div key={d} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition hover:border-amber-300/40">{d}</div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>

              <div className="space-y-5">
                <Panel title="Live Status Widgets" icon={<span>◌</span>}>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p className="rounded-lg bg-zinc-900 p-2">System Health: <span className="text-emerald-300">Stable</span></p>
                    <p className="rounded-lg bg-zinc-900 p-2">Avg Wait Time: <span className="text-amber-200">5m 42s</span></p>
                    <p className="rounded-lg bg-zinc-900 p-2">Traffic Index: <span className="text-rose-300">High</span></p>
                  </div>
                </Panel>

                <Panel title="Alerts & Incidents" icon={<span>⚠</span>}>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2">Engine anomaly • Unit DV-14</li>
                    <li className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">Late pickup cluster • Sector West</li>
                    <li className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2">Road closure • Strip Blvd</li>
                  </ul>
                </Panel>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <Panel title="Dispatch Overview" icon={<span>⌖</span>}><p className="text-sm text-zinc-300">56 open dispatch tasks, 18 pending route approvals.</p></Panel>
              <Panel title="Fleet Overview" icon={<span>▣</span>}><p className="text-sm text-zinc-300">184 vehicles total • 169 available • 10 maintenance • 5 offline.</p></Panel>
              <Panel title="Admin Settings" icon={<span>⚙</span>}><p className="text-sm text-zinc-300">Role profiles, escalation rules, and SLA thresholds configuration panel placeholder.</p></Panel>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <Panel title="Customer Activity" icon={<span>◎</span>}><p className="text-sm text-zinc-300">Bookings/hour peak: 94 • Repeat customer ratio: 47% • App satisfaction: 4.8/5.</p></Panel>
              <Panel title="Audit / Activity Log" icon={<span>◷</span>}><p className="text-sm text-zinc-300">10:32 Dispatch reassigned R-8821 • 10:29 Fare override approved • 10:25 Driver status updated.</p></Panel>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
