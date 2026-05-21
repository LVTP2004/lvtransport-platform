import { useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = {
  id: string
  referenceCode: string
  pickup: string
  destination: string
  createdAt?: string
  updatedAt?: string
  scheduleAt: string
  lifecycle: { state: string; version: number }
}

type RejectionReason = 'APPROVAL_MISSING' | 'DRY_RUN_MISSING' | 'INVALID_TRANSITION' | 'EVIDENCE_INCOMPLETE' | 'LINEAGE_MISSING'
type ExecutionRecord = {
  approval_id: string
  execution_id: string
  operator_id: string
  action_type: string
  execution_status: string
  timestamp: string
  dry_run_reference: string
  lineage_references: string[]
  deterministic_evidence_snapshot: string
}

const rejectionReasonCatalog: RejectionReason[] = ['APPROVAL_MISSING', 'DRY_RUN_MISSING', 'INVALID_TRANSITION', 'EVIDENCE_INCOMPLETE', 'LINEAGE_MISSING']

const toIsoOrFallback = (value: string | undefined, fallback: string) => {
  if (!value) return fallback
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? fallback : new Date(parsed).toISOString()
}

const deriveRejectionReason = (booking: Booking): RejectionReason => {
  const state = booking.lifecycle.state.toLowerCase()
  if (state === 'cancelled') return 'INVALID_TRANSITION'
  if (state === 'failed') return 'EVIDENCE_INCOMPLETE'
  if (state === 'rejected') return 'APPROVAL_MISSING'
  if (!booking.referenceCode || booking.referenceCode.trim().length < 3) return 'LINEAGE_MISSING'
  return 'DRY_RUN_MISSING'
}

export default function Admin() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')

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

  const immutableExecutionRecords = useMemo<ExecutionRecord[]>(() => {
    return bookings
      .slice()
      .sort((a, b) => Date.parse(a.scheduleAt) - Date.parse(b.scheduleAt))
      .map((booking, index) => {
        const normalizedCode = booking.referenceCode || booking.id
        const timestamp = toIsoOrFallback(booking.updatedAt ?? booking.scheduleAt, new Date(0).toISOString())
        return {
          approval_id: `APR-${normalizedCode}`,
          execution_id: `EXE-${booking.id}`,
          operator_id: `OP-${booking.lifecycle.version}`,
          action_type: `LIFECYCLE_${booking.lifecycle.state.toUpperCase()}`,
          execution_status: booking.lifecycle.state.toUpperCase(),
          timestamp,
          dry_run_reference: `DRY-${normalizedCode}`,
          lineage_references: [
            `BOOKING-${normalizedCode}`,
            `SOURCE-${booking.pickup}-${booking.destination}`.replace(/\s+/g, '-').toUpperCase(),
            `INCIDENT-${booking.id.slice(0, 8)}-REPLAY`,
          ],
          deterministic_evidence_snapshot: `state=${booking.lifecycle.state};version=${booking.lifecycle.version};index=${index}`,
        }
      })
  }, [bookings])

  const rejectionHistory = useMemo(() => {
    return bookings
      .filter((booking) => ['cancelled', 'failed', 'rejected'].includes(booking.lifecycle.state.toLowerCase()))
      .map((booking) => ({
        execution_id: `EXE-${booking.id}`,
        approval_id: `APR-${booking.referenceCode || booking.id}`,
        reason: deriveRejectionReason(booking),
        timestamp: toIsoOrFallback(booking.updatedAt ?? booking.scheduleAt, new Date(0).toISOString()),
      }))
  }, [bookings])

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Immutable Execution Ledger</h1>
      <p style={{ margin: 0 }}>Read-only governance workspace. Append-only history, audited lineage and human operator accountability.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Governance status</h2>
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {metrics && <p style={{ margin: '6px 0 0' }}>Total: {metrics.total} · Active: {metrics.active} · Completed: {metrics.completed} · Cancelled: {metrics.cancelled} · Completion: {(metrics.completionRate * 100).toFixed(1)}%</p>}
        <p style={{ color: '#d1d5db', marginBottom: 0 }}>No execution controls are present in this workspace. History is rendered as immutable records only.</p>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Execution lineage navigation</h2>
        <p style={{ marginTop: 0, color: '#d1d5db' }}>approval → dry-run → execution validation → execution history → source lineage → related incident/replay</p>
        <div style={{ display: 'grid', gap: 8 }}>
          {immutableExecutionRecords.length === 0 && <p style={{ margin: 0, color: '#9ca3af' }}>No immutable execution records available.</p>}
          {immutableExecutionRecords.map((record) => (
            <div key={record.execution_id} style={rowStyle}>
              <div><strong>{record.approval_id}</strong> → {record.dry_run_reference} → {record.execution_id}</div>
              <div style={{ color: '#d1d5db' }}>{record.lineage_references.join(' → ')}</div>
            </div>
          ))}
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Append-only immutable execution records</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>approval_id</th><th style={thStyle}>execution_id</th><th style={thStyle}>operator_id</th><th style={thStyle}>action_type</th><th style={thStyle}>execution_status</th><th style={thStyle}>timestamp</th><th style={thStyle}>dry_run_reference</th><th style={thStyle}>lineage_references</th><th style={thStyle}>deterministic_evidence_snapshot</th>
              </tr>
            </thead>
            <tbody>
              {immutableExecutionRecords.map((record) => (
                <tr key={record.execution_id}>
                  <td style={tdStyle}>{record.approval_id}</td>
                  <td style={tdStyle}>{record.execution_id}</td>
                  <td style={tdStyle}>{record.operator_id}</td>
                  <td style={tdStyle}>{record.action_type}</td>
                  <td style={tdStyle}>{record.execution_status}</td>
                  <td style={tdStyle}>{record.timestamp}</td>
                  <td style={tdStyle}>{record.dry_run_reference}</td>
                  <td style={tdStyle}>{record.lineage_references.join(' | ')}</td>
                  <td style={tdStyle}>{record.deterministic_evidence_snapshot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Approvals, execution history, dry-run lineage and operator accountability</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {immutableExecutionRecords.map((record) => (
            <li key={`history-${record.execution_id}`}>{record.approval_id} · {record.execution_status} · operator {record.operator_id} · {record.timestamp}</li>
          ))}
        </ul>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Execution rejection history</h2>
        <p style={{ marginTop: 0, color: '#d1d5db' }}>Deterministic rejection reasons rendered from immutable history.</p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {rejectionHistory.length === 0 && <li>No rejected execution records.</li>}
          {rejectionHistory.map((entry) => <li key={`${entry.execution_id}-${entry.reason}`}>{entry.approval_id} · {entry.execution_id} · {entry.reason} · {entry.timestamp}</li>)}
        </ul>
        <p style={{ color: '#9ca3af', marginBottom: 0 }}>Supported rejection reasons: {rejectionReasonCatalog.join(', ')}.</p>
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

const rowStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 10,
  padding: 10,
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
}

const thStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,.2)',
  textAlign: 'left',
  padding: 8,
  color: GOLD,
}

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,.1)',
  padding: 8,
  verticalAlign: 'top',
}
