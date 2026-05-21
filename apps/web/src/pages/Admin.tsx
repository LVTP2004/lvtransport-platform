import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number } }

type RideHistoryEvent = {
  id: string
  rideId: string
  rideCode?: string
  actorType: 'customer' | 'driver' | 'admin' | 'moni_assistant' | 'system'
  actorId?: string
  eventType: string
  previousStatus?: string
  nextStatus?: string
  message?: string
  timestamp: string
}

type AuditEntry = {
  id: string
  actor: string
  action: string
  previousValue?: string
  newValue?: string
  reason?: string
  timestamp: string
}

type PaymentHistoryEvent = {
  id: string
  rideId?: string
  rideCode?: string
  status: 'payment_pending' | 'payment_paid' | 'invoice_generated' | 'refund_requested' | 'refund_completed' | string
  btwReference?: string
  invoiceReference?: string
  message?: string
  timestamp: string
}

type NotificationHistoryEvent = {
  id: string
  rideId?: string
  rideCode?: string
  channel: 'whatsapp' | 'sms' | 'email' | 'manual'
  status: 'pending' | 'sent' | 'failed' | 'retrying'
  failureReason?: string
  timestamp: string
}

type MoniRideHistoryEvent = {
  id: string
  rideId?: string
  rideCode?: string
  eventType: 'tracking_lookup' | 'fallback_triggered' | 'customer_support_request' | 'tracking_unavailable' | 'continuity_recovery_event' | 'operational_warning' | string
  message?: string
  timestamp: string
}

export default function Admin() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')

  const [rideHistory, setRideHistory] = useState<RideHistoryEvent[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEvent[]>([])
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryEvent[]>([])
  const [moniRideHistory, setMoniRideHistory] = useState<MoniRideHistoryEvent[]>([])

  useEffect(() => {
    void (async () => {
      try {
        const [metricsRes, bookingsRes, rideHistoryRes, paymentsRes, auditRes, notificationsRes, moniRideRes] = await Promise.all([
          fetch(`${API_V1_BASE}/admin/bookings/metrics`),
          fetch(`${API_V1_BASE}/admin/bookings`),
          fetch(`${API_V1_BASE}/admin/history/rides`),
          fetch(`${API_V1_BASE}/admin/history/payments`),
          fetch(`${API_V1_BASE}/admin/history/audit`),
          fetch(`${API_V1_BASE}/admin/history/notifications`),
          fetch(`${API_V1_BASE}/admin/history/moniride`),
        ])

        const [metricsJson, bookingsJson, rideHistoryJson, paymentsJson, auditJson, notificationsJson, moniRideJson] = await Promise.all([
          metricsRes.json(),
          bookingsRes.json(),
          rideHistoryRes.json().catch(() => ({})),
          paymentsRes.json().catch(() => ({})),
          auditRes.json().catch(() => ({})),
          notificationsRes.json().catch(() => ({})),
          moniRideRes.json().catch(() => ({})),
        ])

        if (!metricsRes.ok || !bookingsRes.ok) {
          throw new Error(metricsJson?.message || bookingsJson?.message || 'Admin data ophalen mislukt.')
        }

        setMetrics(metricsJson.metrics ?? null)
        setBookings(Array.isArray(bookingsJson.bookings) ? bookingsJson.bookings : [])
        setRideHistory(Array.isArray(rideHistoryJson.history) ? rideHistoryJson.history : [])
        setPaymentHistory(Array.isArray(paymentsJson.history) ? paymentsJson.history : [])
        setAuditEntries(Array.isArray(auditJson.history) ? auditJson.history : [])
        setNotificationHistory(Array.isArray(notificationsJson.history) ? notificationsJson.history : [])
        setMoniRideHistory(Array.isArray(moniRideJson.history) ? moniRideJson.history : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Admin data ophalen mislukt.')
      }
    })()
  }, [])

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin</h1>
      <p style={{ margin: 0 }}>Operational memory. Audit first.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Reservas y estados</h2>
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {metrics && <p>T: {metrics.total} · A: {metrics.active} · C: {metrics.completed} · X: {metrics.cancelled} · {(metrics.completionRate * 100).toFixed(1)}%</p>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {bookings.slice(0, 15).map((booking) => <li key={booking.id}>{booking.referenceCode} · {booking.lifecycle.state} · {booking.pickup} → {booking.destination}</li>)}
        </ul>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Ride lifecycle history</h2>
        {rideHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={rideHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId} · ${event.actorType} · ${event.eventType}${event.previousStatus || event.nextStatus ? ` · ${event.previousStatus ?? '-'} → ${event.nextStatus ?? '-'}` : ''}${event.message ? ` · ${event.message}` : ''}`)} />}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Admin audit trail</h2>
        {auditEntries.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={auditEntries.map((entry) => `${entry.timestamp} · ${entry.actor} · ${entry.action} · ${entry.previousValue ?? '-'} → ${entry.newValue ?? '-'}${entry.reason ? ` · ${entry.reason}` : ''}`)} />}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Payment continuity history</h2>
        {paymentHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={paymentHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId ?? '—'} · ${event.status}${event.btwReference ? ` · BTW ${event.btwReference}` : ''}${event.invoiceReference ? ` · Invoice ${event.invoiceReference}` : ''}${event.message ? ` · ${event.message}` : ''}`)} />}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>MoniRide event history</h2>
        {moniRideHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={moniRideHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId ?? '—'} · ${event.eventType}${event.message ? ` · ${event.message}` : ''}`)} />}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Notification history</h2>
        {notificationHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={notificationHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId ?? '—'} · ${event.channel} · ${event.status}${event.failureReason ? ` · ${event.failureReason}` : ''}`)} />}
      </article>
    </section>
  </main>
}

function HistoryList({ items }: { items: string[] }) {
  return <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>{items.map((item) => <li key={item}>{item}</li>)}</ul>
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

const emptyStateStyle: React.CSSProperties = {
  margin: 0,
  color: '#c5c7cb',
}
