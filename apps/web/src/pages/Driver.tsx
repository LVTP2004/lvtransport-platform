import { useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type DriverStatus = 'idle' | 'accepted' | 'cancelled'
type DriverHistoryEntry = {
  id: string
  rideId: string
  rideCode?: string
  status: 'accepted' | 'cancelled' | 'completed' | string
  acceptedAt?: string
  cancelledAt?: string
  completedAt?: string
  gpsActivatedAt?: string
  paymentReference?: string
}

export default function Driver() {
  const [tripCode, setTripCode] = useState('')
  const [status, setStatus] = useState<DriverStatus>('idle')
  const [message, setMessage] = useState('Esperando viaje')
  const [history, setHistory] = useState<DriverHistoryEntry[]>([])

  const validCode = useMemo(() => /^\d{5}$/.test(tripCode), [tripCode])

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/driver/history`)
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) return
        setHistory(Array.isArray(payload.history) ? payload.history : [])
      } catch {
        setHistory([])
      }
    })()
  }, [])

  const acceptRide = () => {
    if (!validCode) {
      setMessage('Código inválido. Debe tener 5 dígitos.')
      return
    }
    setStatus('accepted')
    setMessage('Viaje aceptado. GPS automático activo.')
  }

  const cancelRide = () => {
    if (!validCode) {
      setMessage('Ingresa código válido para anular.')
      return
    }
    setStatus('cancelled')
    setMessage('Viaje anulado por driver.')
  }

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '28px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 720, margin: '0 auto', border: '1px solid rgba(212,175,55,.35)', borderRadius: 14, padding: 16, display: 'grid', gap: 14 }}>
      <h1 style={{ marginTop: 0, color: GOLD }}>Driver</h1>
      <p style={{ margin: 0 }}>Estado: <strong>{status}</strong></p>
      <input value={tripCode} onChange={(e) => setTripCode(e.target.value)} placeholder='Código de viaje (5 dígitos)' style={inputStyle} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type='button' onClick={acceptRide} style={buttonStyle}>Aceptar viaje</button>
        <button type='button' onClick={cancelRide} style={{ ...buttonStyle, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,.25)' }}>Anular viaje</button>
      </div>
      <p style={{ margin: 0, color: GOLD }}>{message}</p>

      <article style={historyCardStyle}>
        <h2 style={{ margin: '0 0 8px', color: GOLD, fontSize: 18 }}>Driver history</h2>
        {history.length === 0 ? <p style={{ margin: 0, color: '#c5c7cb' }}>Geen geschiedenis beschikbaar.</p> : (
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {history.map((entry) => <li key={entry.id}>{entry.rideCode ?? entry.rideId} · {entry.status} · {entry.acceptedAt ?? entry.cancelledAt ?? entry.completedAt ?? '—'}{entry.gpsActivatedAt ? ` · GPS ${entry.gpsActivatedAt}` : ''}{entry.paymentReference ? ` · ${entry.paymentReference}` : ''}</li>)}
          </ul>
        )}
      </article>
    </section>
  </main>
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,.2)',
  padding: '10px 12px',
  background: '#0b0b0b',
  color: 'white',
  fontFamily: 'Arial, sans-serif',
}

const buttonStyle: React.CSSProperties = {
  background: GOLD,
  color: '#111214',
  border: 'none',
  borderRadius: 10,
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer',
}

const historyCardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.16)',
  borderRadius: 10,
  padding: 12,
  background: '#0f1011',
}
