import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type DriverHistoryEntry = {
  id: string
  rideId: string
  rideCode?: string
  eventType: 'accepted' | 'cancelled' | 'completed' | 'gps_activated' | string
  timestamp: string
  paymentReference?: string
}

export default function Driver() {
  const [history, setHistory] = useState<DriverHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_V1_BASE}/driver/history`)
        const json = await response.json()
        if (!response.ok) throw new Error(json?.message || 'Drivergeschiedenis ophalen mislukt.')
        setHistory(Array.isArray(json?.events) ? json.events : [])
      } catch (err) {
        setHistory([])
        setError(err instanceof Error ? err.message : 'Drivergeschiedenis ophalen mislukt.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '28px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 720, margin: '0 auto', border: '1px solid rgba(212,175,55,.35)', borderRadius: 14, padding: 16 }}>
      <h1 style={{ marginTop: 0, color: GOLD }}>Driver · History</h1>
      <p style={{ marginTop: 0, color: '#d1d5db' }}>Overzicht van geaccepteerde, geannuleerde en afgewerkte ritten met operationele tijdstempels.</p>
      {loading ? <p style={mutedStyle}>Geschiedenis laden…</p> : null}
      {error ? <p style={{ ...mutedStyle, color: '#fca5a5' }}>{error}</p> : null}
      {!loading && history.length === 0 ? <p style={mutedStyle}>Geen geschiedenis beschikbaar.</p> : null}
      {history.length > 0 ? <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
        {history.map((entry) => (
          <li key={entry.id}>
            {entry.timestamp} · {entry.rideCode ?? entry.rideId} · {entry.eventType}
            {entry.paymentReference ? ` · payment ref: ${entry.paymentReference}` : ''}
          </li>
        ))}
      </ul> : null}
    </section>
  </main>
}

const mutedStyle: React.CSSProperties = {
  margin: 0,
  color: '#d1d5db',
}
