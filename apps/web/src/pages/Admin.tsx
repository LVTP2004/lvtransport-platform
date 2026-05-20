import { useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'invoiced'
type PaymentMethod = 'cash' | 'bancontact' | 'visa' | 'mastercard' | 'invoice'

type PaymentRecord = {
  id: string
  rideId: string
  rideCode: string
  customerName?: string
  driverId?: string
  subtotal: number
  btwPercentage: number
  btwAmount: number
  total: number
  currency: 'EUR'
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  invoiceNumber?: string
  createdAt: string
  paidAt?: string
  updatedAt: string
}

type PaymentHistoryResponse = {
  payments?: PaymentRecord[]
}

type PaymentFilter = {
  status: 'all' | PaymentStatus
  driver: string
  fromDate: string
  toDate: string
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'In afwachting',
  paid: 'Betaald',
  failed: 'Mislukt',
  refunded: 'Terugbetaald',
  invoiced: 'Gefactureerd',
}

export default function Admin() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusUpdateState, setStatusUpdateState] = useState<Record<string, 'idle' | 'saving' | 'error'>>({})
  const [filters, setFilters] = useState<PaymentFilter>({
    status: 'all',
    driver: '',
    fromDate: '',
    toDate: '',
  })

  useEffect(() => {
    void loadPayments()
  }, [])

  const loadPayments = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_V1_BASE}/admin/payments/history`)
      const json = (await response.json()) as PaymentHistoryResponse

      if (!response.ok) {
        throw new Error('Payment history momenteel niet beschikbaar.')
      }

      setPayments(Array.isArray(json.payments) ? json.payments : [])
    } catch (err) {
      setPayments([])
      setError(err instanceof Error ? err.message : 'Payment history momenteel niet beschikbaar.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (filters.status !== 'all' && payment.paymentStatus !== filters.status) return false
      if (filters.driver && payment.driverId !== filters.driver) return false
      if (filters.fromDate && payment.createdAt < filters.fromDate) return false
      if (filters.toDate && payment.createdAt > `${filters.toDate}T23:59:59.999Z`) return false
      return true
    })
  }, [filters, payments])

  const updatePaymentStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    setStatusUpdateState((prev) => ({ ...prev, [paymentId]: 'saving' }))

    try {
      const response = await fetch(`${API_V1_BASE}/admin/payments/${paymentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Status update mislukt. Controleer backend beschikbaarheid.')
      }

      setPayments((prev) => prev.map((payment) => (
        payment.id === paymentId
          ? { ...payment, paymentStatus: newStatus, updatedAt: new Date().toISOString() }
          : payment
      )))
      setStatusUpdateState((prev) => ({ ...prev, [paymentId]: 'idle' }))
    } catch {
      setStatusUpdateState((prev) => ({ ...prev, [paymentId]: 'error' }))
    }
  }

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin · Betalingshistoriek</h1>
      <p style={{ margin: 0, color: '#d1d5db' }}>Operationele continuïteit: BTW, statusopvolging, factuurseam en audit-ready structuur.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Filters</h2>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as PaymentFilter['status'] }))} style={inputStyle}>
            <option value='all'>Alle statussen</option>
            <option value='pending'>In afwachting</option>
            <option value='paid'>Betaald</option>
            <option value='failed'>Mislukt</option>
            <option value='refunded'>Terugbetaald</option>
            <option value='invoiced'>Gefactureerd</option>
          </select>
          <input value={filters.driver} onChange={(e) => setFilters((prev) => ({ ...prev, driver: e.target.value }))} placeholder='Driver ID' style={inputStyle} />
          <input type='date' value={filters.fromDate} onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))} style={inputStyle} />
          <input type='date' value={filters.toDate} onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))} style={inputStyle} />
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Betalingshistoriek</h2>
        {loading && <p>Laden…</p>}
        {!loading && error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {!loading && !error && filteredPayments.length === 0 && <p>Geen payment records beschikbaar. Factuur nog niet beschikbaar.</p>}

        {!loading && !error && filteredPayments.length > 0 && <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Rit</th><th>Klant</th><th>Driver</th><th>Subtotaal</th><th>BTW %</th><th>BTW</th><th>Totaal</th><th>Methode</th><th>Status</th><th>Factuur</th><th>Timestamps</th><th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.rideCode}</td>
                  <td>{payment.customerName ?? '—'}</td>
                  <td>{payment.driverId ?? '—'}</td>
                  <td>{formatMoney(payment.subtotal, payment.currency)}</td>
                  <td>{payment.btwPercentage}%</td>
                  <td>{formatMoney(payment.btwAmount, payment.currency)}</td>
                  <td>{formatMoney(payment.total, payment.currency)}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{PAYMENT_STATUS_LABELS[payment.paymentStatus]}</td>
                  <td>{payment.invoiceNumber ? `#${payment.invoiceNumber}` : 'Factuur nog niet beschikbaar.'}</td>
                  <td style={{ minWidth: 190 }}>
                    Aangemaakt: {formatDate(payment.createdAt)}<br />
                    Betaald: {payment.paidAt ? formatDate(payment.paidAt) : '—'}<br />
                    Bijgewerkt: {formatDate(payment.updatedAt)}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <button type='button' style={actionButton} onClick={() => updatePaymentStatus(payment.id, 'paid')}>Markeer betaald</button>
                      <button type='button' style={actionButton} onClick={() => updatePaymentStatus(payment.id, 'invoiced')}>Markeer gefactureerd</button>
                      <button type='button' style={actionButton} onClick={() => updatePaymentStatus(payment.id, 'refunded')}>Markeer terugbetaald</button>
                      {statusUpdateState[payment.id] === 'saving' && <small>Opslaan…</small>}
                      {statusUpdateState[payment.id] === 'error' && <small style={{ color: '#fca5a5' }}>Update mislukt</small>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>API seams (backend-integratie)</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>GET /api/v1/admin/payments/history</li>
          <li>POST /api/v1/admin/payments/:id/status</li>
          <li>GET /api/v1/admin/invoices/:id</li>
        </ul>
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

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: 14, background: '#0f1011',
}
const h2Style: React.CSSProperties = { margin: '0 0 8px', color: GOLD, fontSize: 18 }
const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, background: '#111214', color: 'white', padding: '9px 10px', width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif',
}
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: 13,
}
const actionButton: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.35)', borderRadius: 8, background: 'transparent', color: 'white', padding: '6px 8px', cursor: 'pointer',
}
