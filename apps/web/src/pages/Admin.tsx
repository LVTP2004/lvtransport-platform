import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number } }

export default function Admin() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        const [metricsRes, bookingsRes] = await Promise.all([
          fetch(`${API_V1_BASE}/admin/bookings/metrics`),
          fetch(`${API_V1_BASE}/admin/bookings`),
        ])
        const metricsJson = await metricsRes.json()
        const bookingsJson = await bookingsRes.json()
        if (!metricsRes.ok || !bookingsRes.ok) throw new Error(metricsJson?.message || bookingsJson?.message || 'Admin data ophalen mislukt.')
        setMetrics(metricsJson.metrics ?? null)
        setBookings(Array.isArray(bookingsJson.bookings) ? bookingsJson.bookings : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Admin data ophalen mislukt.')
      }
    })()
  }, [])

  return <div style={{ background: '#0b0b0b', color: 'white', minHeight: '100vh', padding: '40px' }}>
    <h1>LV Admin Control Tower</h1>
    <p>Operationele boekingen en lifecycle overzicht uit de productie-API.</p>
    {error && <p>{error}</p>}
    {metrics && <p>Totaal: {metrics.total} • Actief: {metrics.active} • Voltooid: {metrics.completed} • Geannuleerd: {metrics.cancelled} • Completion: {(metrics.completionRate * 100).toFixed(1)}%</p>}
    <ul>
      {bookings.slice(0, 20).map((booking) => (
        <li key={booking.id}>{booking.referenceCode} • {booking.lifecycle.state} • {booking.pickup} → {booking.destination} • {new Date(booking.scheduleAt).toLocaleString('nl-BE')}</li>
      ))}
    </ul>
  </div>
}
