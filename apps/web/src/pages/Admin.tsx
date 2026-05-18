import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number } }
type ServiceConfig = { id: string; name: string; basePrice: number; active: boolean }

export default function Admin() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')
  const [visibleText, setVisibleText] = useState('Reserva clara. GPS claro. Operación estable.')
  const [basePrice, setBasePrice] = useState(24)
  const [services, setServices] = useState<ServiceConfig[]>([
    { id: 'standard', name: 'Standard', basePrice: 24, active: true },
    { id: 'business', name: 'Business', basePrice: 35, active: true },
    { id: 'van', name: 'Van', basePrice: 42, active: false },
  ])

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

  const logs = [
    'MoniRide: GPS activo.',
    'Driver: estado actualizado.',
    'Founder: supervisión en curso.',
  ]

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin</h1>
      <p style={{ margin: 0 }}>Intervención mínima. Operación primero.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Textos visibles</h2>
        <input value={visibleText} onChange={(e) => setVisibleText(e.target.value)} style={inputStyle} />
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Precio base</h2>
        <input type='number' value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} style={inputStyle} />
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Tipos de servicio</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {services.map((service) => (
            <div key={service.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr .6fr .7fr', gap: 8 }}>
              <input value={service.name} onChange={(e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item))} style={inputStyle} />
              <input type='number' value={service.basePrice} onChange={(e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, basePrice: Number(e.target.value) } : item))} style={inputStyle} />
              <button type='button' onClick={() => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, active: !item.active } : item))} style={service.active ? enabledButton : disabledButton}>{service.active ? 'Activo' : 'Inactivo'}</button>
            </div>
          ))}
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Reservas y estados</h2>
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {metrics && <p>T: {metrics.total} · A: {metrics.active} · C: {metrics.completed} · X: {metrics.cancelled} · {(metrics.completionRate * 100).toFixed(1)}%</p>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {bookings.slice(0, 15).map((booking) => <li key={booking.id}>{booking.referenceCode} · {booking.lifecycle.state} · {booking.pickup} → {booking.destination}</li>)}
        </ul>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Logs y alertas</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>{logs.map((log) => <li key={log}>{log}</li>)}</ul>
        <p style={{ color: GOLD, marginBottom: 0 }}>Alerta simple: solo intervenir en emergencia.</p>
      </article>
    </section>
  </main>
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.15)',
  borderRadius: 12,
  padding: 14,
  background: '#0f1011',
}

const h2Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: GOLD,
  fontSize: 18,
}

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  borderRadius: 8,
  background: '#111214',
  color: 'white',
  padding: '9px 10px',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'Arial, sans-serif',
}

const enabledButton: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.4)',
  background: 'rgba(212,175,55,.2)',
  color: 'white',
  borderRadius: 8,
}

const disabledButton: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  background: 'transparent',
  color: '#d1d5db',
  borderRadius: 8,
}
