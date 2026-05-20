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

type PaymentAuditEvent = {
  actorId: string
  actorType: 'admin' | 'founder' | 'system'
  paymentId: string
  previousStatus: PaymentStatus
  newStatus: PaymentStatus
  timestamp: string
}

type DateFilter = 'all' | 'today' | 'last7'

const statusLabel: Record<PaymentStatus, string> = {
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
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all')
  const [driverFilter, setDriverFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [actionMessage, setActionMessage] = useState('')
  const [auditPreview, setAuditPreview] = useState<PaymentAuditEvent | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_V1_BASE}/admin/payments/history`)
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.message || 'Payment history ophalen mislukt.')
        setPayments(Array.isArray(payload?.payments) ? payload.payments : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment history ophalen mislukt.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const drivers = useMemo(() => {
    const ids = new Set<string>()
    payments.forEach((payment) => {
      if (payment.driverId) ids.add(payment.driverId)
    })
    return Array.from(ids).sort()
  }, [payments])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (statusFilter !== 'all' && payment.paymentStatus !== statusFilter) return false
      if (driverFilter !== 'all' && payment.driverId !== driverFilter) return false
      if (dateFilter === 'all') return true

      const created = new Date(payment.createdAt).getTime()
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      if (dateFilter === 'today') return now - created <= dayMs
      if (dateFilter === 'last7') return now - created <= dayMs * 7
      return true
    })
  }, [payments, statusFilter, driverFilter, dateFilter])

  const handleStatusChange = async (payment: PaymentRecord, newStatus: PaymentStatus) => {
    setActionMessage('')
    setError('')

    const seamPayload = {
      actorId: 'admin-session',
      actorType: 'admin' as const,
      paymentId: payment.id,
      previousStatus: payment.paymentStatus,
      newStatus,
      timestamp: new Date().toISOString(),
    }

    try {
      const res = await fetch(`${API_V1_BASE}/admin/payments/${payment.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, audit: seamPayload }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.message || 'Status update niet beschikbaar. Backend-seam actief.')
      }

      setPayments((prev) => prev.map((item) => item.id === payment.id ? {
        ...item,
        paymentStatus: newStatus,
        updatedAt: new Date().toISOString(),
        paidAt: newStatus === 'paid' ? new Date().toISOString() : item.paidAt,
      } : item))
      setAuditPreview(seamPayload)
      setActionMessage(`Status bijgewerkt: ${payment.rideCode} → ${statusLabel[newStatus]}.`)
    } catch (err) {
      setAuditPreview(seamPayload)
      setActionMessage('Statuswijziging voorbereid voor audit, maar niet opgeslagen. Backend-seam vereist.')
      setError(err instanceof Error ? err.message : 'Status update niet beschikbaar.')
    }
  }

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin · Payments</h1>
      <p style={{ margin: 0 }}>Betalingscontinuïteit, BTW-basis en factuurseams. Geen gesimuleerde boekhouding.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | PaymentStatus)} style={inputStyle}>
            <option value='all'>Alle statussen</option>
            <option value='pending'>In afwachting</option>
            <option value='paid'>Betaald</option>
            <option value='failed'>Mislukt</option>
            <option value='refunded'>Terugbetaald</option>
            <option value='invoiced'>Gefactureerd</option>
          </select>
          <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} style={inputStyle}>
            <option value='all'>Alle drivers</option>
            {drivers.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)} style={inputStyle}>
            <option value='all'>Alle datums</option>
            <option value='today'>Laatste 24 uur</option>
            <option value='last7'>Laatste 7 dagen</option>
          </select>
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Payment history</h2>
        {loading && <p>Payment history laden…</p>}
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {actionMessage && <p style={{ color: GOLD }}>{actionMessage}</p>}
        {!loading && !error && filteredPayments.length === 0 && (
          <p style={{ marginBottom: 0 }}>
            Geen payment records beschikbaar. API-seam actief via <code>/api/v1/admin/payments/history</code>.
          </p>
        )}

        {!loading && filteredPayments.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1020 }}>
              <thead>
                <tr>
                  {['Rit', 'Klant', 'Driver', 'Subtotaal', 'BTW %', 'BTW bedrag', 'Totaal', 'Methode', 'Status', 'Factuur', 'Aangemaakt', 'Betaald', 'Bijgewerkt', 'Acties'].map((head) => (
                    <th key={head} style={thStyle}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={tdStyle}>{payment.rideCode}</td>
                    <td style={tdStyle}>{payment.customerName ?? '—'}</td>
                    <td style={tdStyle}>{payment.driverId ?? '—'}</td>
                    <td style={tdStyle}>€ {payment.subtotal.toFixed(2)}</td>
                    <td style={tdStyle}>{payment.btwPercentage}%</td>
                    <td style={tdStyle}>€ {payment.btwAmount.toFixed(2)}</td>
                    <td style={tdStyle}>€ {payment.total.toFixed(2)} {payment.currency}</td>
                    <td style={tdStyle}>{payment.paymentMethod}</td>
                    <td style={tdStyle}>{statusLabel[payment.paymentStatus]}</td>
                    <td style={tdStyle}>{payment.invoiceNumber ?? 'Factuur nog niet beschikbaar.'}</td>
                    <td style={tdStyle}>{payment.createdAt}</td>
                    <td style={tdStyle}>{payment.paidAt ?? '—'}</td>
                    <td style={tdStyle}>{payment.updatedAt}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'grid', gap: 6 }}>
                        <button type='button' onClick={() => handleStatusChange(payment, 'paid')} style={actionButton}>Markeer betaald</button>
                        <button type='button' onClick={() => handleStatusChange(payment, 'invoiced')} style={actionButton}>Markeer gefactureerd</button>
                        <button type='button' onClick={() => handleStatusChange(payment, 'refunded')} style={actionButton}>Markeer terugbetaald</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Export & factuur-seams</h2>
        <p style={{ marginTop: 0 }}>Koppeling voorbereid voor: <code>GET /api/v1/admin/invoices/:id</code> en exportpijplijn.</p>
        <p style={{ marginBottom: 0 }}>Deze laag genereert geen facturen en simuleert geen accounting totals.</p>
      </article>

      {auditPreview && (
        <article style={cardStyle}>
          <h2 style={h2Style}>Audit preview (laatste statusactie)</h2>
          <pre style={preStyle}>{JSON.stringify(auditPreview, null, 2)}</pre>
        </article>
      )}
    </section>
  </main>
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.15)',
  borderRadius: 12,
  padding: 14,
  background: '#0f1011',
}
const h2Style: React.CSSProperties = { margin: '0 0 8px', color: GOLD, fontSize: 18 }
const inputStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, background: '#111214', color: 'white', padding: '9px 10px', width: '100%', boxSizing: 'border-box' }
const thStyle: React.CSSProperties = { textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,.2)', padding: '8px 6px', color: GOLD, fontWeight: 600, fontSize: 13 }
const tdStyle: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,.08)', padding: '8px 6px', verticalAlign: 'top', fontSize: 13 }
const actionButton: React.CSSProperties = { border: '1px solid rgba(212,175,55,.4)', background: 'rgba(212,175,55,.1)', color: 'white', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }
const preStyle: React.CSSProperties = { margin: 0, background: '#0b0b0b', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: 12, overflowX: 'auto', fontSize: 12 }
