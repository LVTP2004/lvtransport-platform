import { useEffect, useRef, useState } from 'react';

type Booking = { id: string; code: string; status: string; assignedDriverName?: string; version: number };

const statusFlow = ['assigned', 'onderweg', 'arrived', 'in_progress', 'completed'] as const;
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [realtimeState, setRealtimeState] = useState<'connecting'|'connected'|'reconnecting'|'offline'>('connecting');
  const lastSequenceRef = useRef(0);

  const refresh = async () => {
    const response = await fetch(`${API_BASE}/bookings`);
    const result = await response.json();
    setBookings(result.bookings.filter((b: Booking) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned'));
  };

  useEffect(() => {
    refresh();
    let ws: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let attempts = 0;
    let active = true;

    const connect = () => {
      if (!active) return;
      setRealtimeState(attempts > 0 ? 'reconnecting' : 'connecting');
      const wsBase = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`;
      const query = lastSequenceRef.current > 0 ? `?lastSequence=${lastSequenceRef.current}` : '';
      ws = new WebSocket(`${wsBase}${query}`);
      ws.onopen = () => { attempts = 0; setRealtimeState('connected'); };
      ws.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data as string) as { event?: string; payload?: Booking | Booking[]; sequence?: number };
          if (typeof payload.sequence === 'number' && payload.sequence > lastSequenceRef.current) lastSequenceRef.current = payload.sequence;
          if (payload.event === 'booking.snapshot' && Array.isArray(payload.payload)) {
            setBookings(payload.payload.filter((b) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned'));
            return;
          }
          if (payload.event === 'booking.updated' && payload.payload && !Array.isArray(payload.payload)) {
            const bookingPayload = payload.payload;
            setBookings((current) => {
              const next = [...current];
              const index = next.findIndex((item) => item.id === bookingPayload.id);
              if (index >= 0) next[index] = bookingPayload;
              else if (bookingPayload.assignedDriverName === 'Marco V.' || bookingPayload.status === 'assigned') next.unshift(bookingPayload);
              return next.filter((b) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned');
            });
          }
        } catch {
          refresh();
        }
      };
      ws.onclose = () => {
        if (!active) return;
        attempts += 1;
        setRealtimeState('offline');
        reconnectTimer = window.setTimeout(connect, Math.min(15000, 1000 * 2 ** Math.min(attempts, 4)));
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => { active = false; if (reconnectTimer) window.clearTimeout(reconnectTimer); ws?.close(); };
  }, []);

  const updateStatus = async (booking: Booking) => {
    const idx = statusFlow.findIndex((s) => s === booking.status);
    if (idx < 0 || idx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[idx + 1];
    const optimistic = bookings.map((b) => b.id === booking.id ? { ...b, status: nextStatus, version: b.version + 1 } : b);
    setBookings(optimistic);
    const response = await fetch(`${API_BASE}/bookings/${booking.id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextStatus, actor: 'driver', expectedVersion: booking.version, idempotencyKey: `driver-${booking.id}-${booking.version}` })
    });
    if (!response.ok) refresh();
  };

  return <main className="min-h-screen bg-zinc-950 p-6 text-white">
    <h1 className="text-2xl font-bold text-amber-300">Driver Dispatch Realtime</h1>
    <p className="mt-1 text-sm text-zinc-400">Realtime link: <span className={realtimeState === 'connected' ? 'text-emerald-300' : realtimeState === 'reconnecting' ? 'text-amber-200' : 'text-rose-300'}>{realtimeState.toUpperCase()}</span></p>
    <div className="mt-4 grid gap-3">
      {bookings.map((booking) => <article key={booking.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <p className="font-semibold">{booking.code}</p>
        <p className="text-sm text-zinc-300">Status: {booking.status}</p>
        {booking.status === 'assigned' && <div className="mt-2 flex gap-2"><button className="rounded bg-amber-500 px-3 py-1 text-black" onClick={() => updateStatus(booking)}>Accept Ride</button><button className="rounded border border-zinc-600 px-3 py-1">Reject</button></div>}
        {booking.status !== 'assigned' && booking.status !== 'completed' && <button className="mt-2 rounded border border-zinc-600 px-3 py-1" onClick={() => updateStatus(booking)}>Next status</button>}
      </article>)}
    </div>
  </main>;
}
