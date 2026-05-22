import { useEffect, useState } from 'react'
import { useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'invoiced'
type PaymentMethod = 'cash' | 'bancontact' | 'visa' | 'mastercard' | 'invoice'

type DriverPaymentRecord = {
  id: string
  rideCode: string
  total: number
  currency: 'EUR'
  btwPercentage: number
  btwAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  createdAt: string
  paidAt?: string
}

type DriverPaymentHistoryResponse = {
  payments?: DriverPaymentRecord[]
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'In afwachting',
  paid: 'Betaald',
  failed: 'Mislukt',
  refunded: 'Terugbetaald',
  invoiced: 'Gefactureerd',
}

export default function Driver() {
  const [payments, setPayments] = useState<DriverPaymentRecord[]>([])
type DriverStatus = 'idle' | 'accepted' | 'cancelled'
type DriverHistoryEntry = {
  id: string
  rideId: string
  rideCode?: string
  eventType: 'accepted' | 'cancelled' | 'completed' | 'gps_activated' | string
  timestamp: string
  status: 'accepted' | 'cancelled' | 'completed' | string
  acceptedAt?: string
  cancelledAt?: string
  completedAt?: string
  gpsActivatedAt?: string
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
        const response = await fetch(`${API_V1_BASE}/driver/payments/history`)
        const json = (await response.json()) as DriverPaymentHistoryResponse

        if (!response.ok) throw new Error('Betalingshistoriek momenteel niet beschikbaar.')
        setPayments(Array.isArray(json.payments) ? json.payments : [])
      } catch (err) {
        setPayments([])
        setError(err instanceof Error ? err.message : 'Betalingshistoriek momenteel niet beschikbaar.')
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

  const sortedPayments = useMemo(
    () => [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [payments],
  )

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '28px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 720, margin: '0 auto', border: '1px solid rgba(212,175,55,.35)', borderRadius: 14, padding: 16 }}>
      <h1 style={{ marginTop: 0, color: GOLD }}>Driver · Betalingshistoriek</h1>
      <p style={{ color: '#d1d5db' }}>Overzicht van afgewerkte ritbetalingen. Inclusief BTW-continuïteit en status.</p>

      {loading && <p>Laden…</p>}
      {!loading && error && <p style={{ color: '#fca5a5' }}>{error}</p>}
      {!loading && !error && sortedPayments.length === 0 && <p>Geen betalingen beschikbaar.</p>}

      {!loading && !error && sortedPayments.length > 0 && <div style={{ display: 'grid', gap: 10 }}>
        {sortedPayments.map((payment) => (
          <article key={payment.id} style={itemCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <strong>{payment.rideCode}</strong>
              <span style={statusPill}>{PAYMENT_STATUS_LABELS[payment.paymentStatus]}</span>
            </div>
            <p style={{ margin: '8px 0 4px' }}>Totaal: <strong>{formatMoney(payment.total, payment.currency)}</strong></p>
            <p style={{ margin: '0 0 4px', color: '#d1d5db' }}>BTW inbegrepen: {payment.btwPercentage}% ({formatMoney(payment.btwAmount, payment.currency)})</p>
            <p style={{ margin: '0 0 4px', color: '#d1d5db' }}>Methode: {payment.paymentMethod}</p>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>Aangemaakt: {formatDate(payment.createdAt)} · Betaald: {payment.paidAt ? formatDate(payment.paidAt) : '—'}</p>
          </article>
        ))}
      </div>}
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

function formatMoney(value: number, currency: 'EUR') {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency }).format(value)
}

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString('nl-BE')
}

const itemCard: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: 10,
  padding: 12,
  background: '#0f1011',
}

const statusPill: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.4)',
  color: '#f5deb3',
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 12,
const mutedStyle: React.CSSProperties = {
  margin: 0,
  color: '#d1d5db',
}

const historyCardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.16)',
  borderRadius: 10,
  padding: 12,
  background: '#0f1011',
}
