import { useEffect, useState } from "react";

export default function OperationsContinuityConsole() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8787/memory/dashboard")
      .then(res => res.json())
      .then(data => {
        setDashboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 p-6">
        Loading operational cognition...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight">
            Operational Continuity Console
          </h1>

          <p className="text-zinc-500 mt-3">
            Read-only operational cognition surface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-zinc-500 text-sm mb-2">
              Total Docs
            </div>

            <div className="text-3xl font-semibold">
              {dashboard?.total_docs || 0}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-zinc-500 text-sm mb-2">
              Categories
            </div>

            <div className="text-3xl font-semibold">
              {Object.keys(dashboard?.categories || {}).length}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-zinc-500 text-sm mb-2">
              Cognition State
            </div>

            <div className="text-green-400 font-medium">
              operational
            </div>
          </div>

        </div>

        <div className="space-y-6">

          {Object.entries(dashboard?.categories || {}).map(([category, data]) => (
            <div
              key={category}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-medium capitalize">
                  {category}
                </h2>

                <div className="text-zinc-500 text-sm">
                  {data.count} records
                </div>
              </div>

              <div className="space-y-3">

                {data.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-zinc-800 rounded-xl p-4 bg-zinc-950"
                  >
                    <div className="text-sm text-zinc-400 mb-2">
                      {item.source}
                    </div>

                    <div className="text-base font-medium mb-2">
                      {item.title}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                      {(item.dates || []).map(date => (
                        <span
                          key={date}
                          className="border border-zinc-700 rounded-full px-2 py-1"
                        >
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
