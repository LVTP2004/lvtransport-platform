import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

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

type AdminAuditEntry = {
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
  eventType: 'payment_pending' | 'payment_paid' | 'invoice_generated' | 'refund_requested' | 'refund_completed' | string
  previousStatus?: string
  nextStatus?: string
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
  eventType: string
  severity?: 'info' | 'warning' | 'critical'
  message?: string
  timestamp: string
}

type EndpointState<T> = { data: T[]; loading: boolean; error: string }

export default function Admin() {
  const [rideHistory, setRideHistory] = useState<EndpointState<RideHistoryEvent>>({ data: [], loading: true, error: '' })
  const [auditHistory, setAuditHistory] = useState<EndpointState<AdminAuditEntry>>({ data: [], loading: true, error: '' })
  const [paymentHistory, setPaymentHistory] = useState<EndpointState<PaymentHistoryEvent>>({ data: [], loading: true, error: '' })
  const [notificationHistory, setNotificationHistory] = useState<EndpointState<NotificationHistoryEvent>>({ data: [], loading: true, error: '' })
  const [moniRideHistory, setMoniRideHistory] = useState<EndpointState<MoniRideHistoryEvent>>({ data: [], loading: true, error: '' })

  useEffect(() => {
    const loadHistory = async <T,>(endpoint: string, setter: (next: EndpointState<T>) => void, key: string) => {
      setter({ data: [], loading: true, error: '' })
      try {
        const response = await fetch(`${API_V1_BASE}${endpoint}`)
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json?.message || 'Historiek ophalen mislukt.')
        }
        const payload = Array.isArray(json?.[key]) ? json[key] : []
        setter({ data: payload, loading: false, error: '' })
      } catch (err) {
        setter({ data: [], loading: false, error: err instanceof Error ? err.message : 'Historiek ophalen mislukt.' })
      }
    }

    void Promise.all([
      loadHistory<RideHistoryEvent>('/admin/history/rides', setRideHistory, 'events'),
      loadHistory<AdminAuditEntry>('/admin/history/audit', setAuditHistory, 'entries'),
      loadHistory<PaymentHistoryEvent>('/admin/history/payments', setPaymentHistory, 'events'),
      loadHistory<NotificationHistoryEvent>('/admin/history/notifications', setNotificationHistory, 'events'),
      loadHistory<MoniRideHistoryEvent>('/admin/history/moniride', setMoniRideHistory, 'events'),
    ])
  }, [])

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin · Operational Memory</h1>
      <p style={{ margin: 0 }}>Chronologische continuïteit voor ritten, audits, betalingen en notificaties.</p>

      <HistoryCard title='Ride lifecycle history' state={rideHistory}>
        {(event) => <li key={event.id}>{event.timestamp} · {event.rideCode ?? event.rideId} · {event.actorType} · {event.eventType}</li>}
      </HistoryCard>

      <HistoryCard title='Admin audit trail' state={auditHistory}>
        {(entry) => <li key={entry.id}>{entry.timestamp} · {entry.actor} · {entry.action} · {entry.previousValue ?? '—'} → {entry.newValue ?? '—'}</li>}
      </HistoryCard>

      <HistoryCard title='Payment continuity history' state={paymentHistory}>
        {(event) => <li key={event.id}>{event.timestamp} · {event.rideCode ?? event.rideId ?? '—'} · {event.eventType} · {event.previousStatus ?? '—'} → {event.nextStatus ?? '—'}</li>}
      </HistoryCard>

      <HistoryCard title='MoniRide event history' state={moniRideHistory}>
        {(event) => <li key={event.id}>{event.timestamp} · {event.rideCode ?? event.rideId ?? '—'} · {event.eventType} · {event.severity ?? 'info'}</li>}
      </HistoryCard>

      <HistoryCard title='Notification history' state={notificationHistory}>
        {(event) => <li key={event.id}>{event.timestamp} · {event.channel} · {event.status}{event.failureReason ? ` · ${event.failureReason}` : ''}</li>}
      </HistoryCard>
    </section>
  </main>
}

type HistoryCardProps<T extends { id: string }> = {
  title: string
  state: EndpointState<T>
  children: (item: T) => React.ReactNode
}

function HistoryCard<T extends { id: string }>({ title, state, children }: HistoryCardProps<T>) {
  return <article style={cardStyle}>
    <h2 style={h2Style}>{title}</h2>
    {state.loading ? <p style={mutedStyle}>Historiek laden…</p> : null}
    {state.error ? <p style={{ ...mutedStyle, color: '#fca5a5' }}>{state.error}</p> : null}
    {!state.loading && state.data.length === 0 ? <p style={mutedStyle}>Geen geschiedenis beschikbaar.</p> : null}
    {state.data.length > 0 ? <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>{state.data.map(children)}</ul> : null}
  </article>
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

const mutedStyle: React.CSSProperties = {
  margin: 0,
  color: '#d1d5db',
}
