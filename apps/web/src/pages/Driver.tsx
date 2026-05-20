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

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'In afwachting',
  paid: 'Betaald',
  failed: 'Mislukt',
  refunded: 'Terugbetaald',
  invoiced: 'Gefactureerd',
}

export default function Driver() {
  const [payments, setPayments] = useState<DriverPaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_V1_BASE}/driver/payments/history`)
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.message || 'Driver payment history ophalen mislukt.')
        setPayments(Array.isArray(payload?.payments) ? payload.payments : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Driver payment history ophalen mislukt.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const visiblePayments = useMemo(
    () => payments.filter((payment) => statusFilter === 'all' || payment.paymentStatus === statusFilter),
    [payments, statusFilter],
  )

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '24px 14px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 780, margin: '0 auto', display: 'grid', gap: 12 }}>
      <article style={cardStyle}>
        <h1 style={{ marginTop: 0, marginBottom: 8, color: GOLD }}>Driver · Betalingen</h1>
        <p style={{ marginTop: 0 }}>Alleen rit-gerelateerde betalingen. Geen bedrijfsbrede omzet of admin-analytics.</p>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | PaymentStatus)} style={inputStyle}>
          <option value='all'>Alle statussen</option>
          <option value='pending'>In afwachting</option>
          <option value='paid'>Betaald</option>
          <option value='failed'>Mislukt</option>
          <option value='refunded'>Terugbetaald</option>
          <option value='invoiced'>Gefactureerd</option>
        </select>
      </article>

      <article style={cardStyle}>
        <h2 style={{ marginTop: 0, color: GOLD, fontSize: 18 }}>Payment history</h2>
        {loading && <p>Betalingen laden…</p>}
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {!loading && !error && visiblePayments.length === 0 && (
          <p style={{ marginBottom: 0 }}>Nog geen betalingsoverzicht beschikbaar. API-seam: <code>/api/v1/driver/payments/history</code>.</p>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {visiblePayments.map((payment) => (
            <article key={payment.id} style={itemStyle}>
              <p style={lineStyle}><strong>Rit:</strong> {payment.rideCode}</p>
              <p style={lineStyle}><strong>Totaal:</strong> € {payment.total.toFixed(2)} {payment.currency}</p>
              <p style={lineStyle}><strong>BTW:</strong> {payment.btwPercentage}% (€ {payment.btwAmount.toFixed(2)} inbegrepen)</p>
              <p style={lineStyle}><strong>Methode:</strong> {payment.paymentMethod}</p>
              <p style={lineStyle}><strong>Status:</strong> {statusLabel[payment.paymentStatus]}</p>
              <p style={lineStyle}><strong>Aangemaakt:</strong> {payment.createdAt}</p>
              <p style={lineStyle}><strong>Betaald op:</strong> {payment.paidAt ?? 'Nog niet betaald'}</p>
            </article>
          ))}
        </div>
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,.2)',
  padding: '10px 12px',
  background: '#0b0b0b',
  color: 'white',
}

const itemStyle: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.28)',
  borderRadius: 10,
  padding: 12,
  background: '#101113',
}

const lineStyle: React.CSSProperties = {
  margin: '4px 0',
  fontSize: 14,
}
