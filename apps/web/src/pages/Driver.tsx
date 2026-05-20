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
}
