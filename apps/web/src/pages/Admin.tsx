import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number } }
type ServiceConfig = { id: string; name: string; basePrice: number; active: boolean }

type WorkflowState = 'detected' | 'triaged' | 'stabilizing' | 'recovering' | 'validated' | 'closed'
type WorkflowType = 'incident' | 'recovery' | 'escalation' | 'acknowledgement' | 'handoff'

type WorkflowCheckpoint = { id: string; label: string; owner: string; requiredEvidence: string; status: 'pending' | 'complete'; completedAt?: string }
type HandoffRecord = { id: string; from: string; to: string; reason: string; acknowledgedAt: string; evidence: string }
type WorkflowLifecycle = {
  id: string
  type: WorkflowType
  title: string
  state: WorkflowState
  deterministicPath: WorkflowState[]
  checkpoints: WorkflowCheckpoint[]
  evidenceRequirements: string[]
  supervision: 'human_confirmed'
  lastUpdatedAt: string
  handoff?: HandoffRecord
}


export default function Admin() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')
  const [visibleText, setVisibleText] = useState('Reserva clara. GPS claro. Operación estable.')
  const [basePrice, setBasePrice] = useState(24)
  const [services, setServices] = useState<ServiceConfig[]>([
    { id: 'standard', name: 'Standard', basePrice: 24, active: true },
    { id: 'business', name: 'Business', basePrice: 35, active: true },
    { id: 'van', name: 'Van', basePrice: 42, active: false },
  ])

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

  const workflowLifecycles: WorkflowLifecycle[] = [
    {
      id: 'wf-incident-001',
      type: 'incident',
      title: 'Dispatch outage in Brussels zone',
      state: 'stabilizing',
      deterministicPath: ['detected', 'triaged', 'stabilizing', 'recovering', 'validated', 'closed'],
      checkpoints: [
        { id: 'cp-1', label: 'Incident acknowledged by operator', owner: 'Ops Lead', requiredEvidence: 'Timestamped acknowledgement', status: 'complete', completedAt: '2026-05-21T08:13:00Z' },
        { id: 'cp-2', label: 'Scope and blast radius confirmed', owner: 'Dispatch Commander', requiredEvidence: 'Affected rides snapshot', status: 'complete', completedAt: '2026-05-21T08:17:00Z' },
        { id: 'cp-3', label: 'Stability monitor green for 15 minutes', owner: 'Reliability Operator', requiredEvidence: 'Telemetry trend capture', status: 'pending' },
      ],
      evidenceRequirements: ['Incident timeline', 'Telemetry screenshot', 'Manual supervisor sign-off'],
      supervision: 'human_confirmed',
      lastUpdatedAt: '2026-05-21T08:20:00Z',
    },
    {
      id: 'wf-recovery-002',
      type: 'recovery',
      title: 'Driver assignment recovery workflow',
      state: 'recovering',
      deterministicPath: ['detected', 'triaged', 'stabilizing', 'recovering', 'validated', 'closed'],
      checkpoints: [
        { id: 'cp-4', label: 'Rollback fallback enabled', owner: 'Platform Ops', requiredEvidence: 'Rollback command log', status: 'complete', completedAt: '2026-05-21T08:09:00Z' },
        { id: 'cp-5', label: 'Assignment queue drain validated', owner: 'Dispatch QA', requiredEvidence: 'Queue depth report', status: 'pending' },
      ],
      evidenceRequirements: ['Recovery playbook reference', 'Queue depth metrics', 'Human validator confirmation'],
      supervision: 'human_confirmed',
      lastUpdatedAt: '2026-05-21T08:19:00Z',
    },
    {
      id: 'wf-escalation-003',
      type: 'escalation',
      title: 'Escalation to founder on premium itinerary delays',
      state: 'triaged',
      deterministicPath: ['detected', 'triaged', 'stabilizing', 'recovering', 'validated', 'closed'],
      checkpoints: [
        { id: 'cp-6', label: 'Severity scoring completed', owner: 'Incident Manager', requiredEvidence: 'Severity worksheet', status: 'complete', completedAt: '2026-05-21T08:11:00Z' },
        { id: 'cp-7', label: 'Escalation accepted by supervisor', owner: 'Founder Operator', requiredEvidence: 'Supervisor acceptance note', status: 'pending' },
      ],
      evidenceRequirements: ['Severity rubric', 'Escalation reason log', 'Supervisor acknowledgement'],
      supervision: 'human_confirmed',
      lastUpdatedAt: '2026-05-21T08:18:00Z',
    },
    {
      id: 'wf-ack-004',
      type: 'acknowledgement',
      title: 'Customer impact acknowledgement workflow',
      state: 'validated',
      deterministicPath: ['detected', 'triaged', 'stabilizing', 'recovering', 'validated', 'closed'],
      checkpoints: [
        { id: 'cp-8', label: 'Impact list reviewed', owner: 'Customer Ops', requiredEvidence: 'Affected customer list', status: 'complete', completedAt: '2026-05-21T08:10:00Z' },
        { id: 'cp-9', label: 'Acknowledgement copy approved', owner: 'Operations Supervisor', requiredEvidence: 'Approved communication snippet', status: 'complete', completedAt: '2026-05-21T08:15:00Z' },
      ],
      evidenceRequirements: ['Approved communication template', 'Approval timestamp'],
      supervision: 'human_confirmed',
      lastUpdatedAt: '2026-05-21T08:16:00Z',
    },
    {
      id: 'wf-handoff-005',
      type: 'handoff',
      title: 'Operator handoff during shift transition',
      state: 'stabilizing',
      deterministicPath: ['detected', 'triaged', 'stabilizing', 'recovering', 'validated', 'closed'],
      checkpoints: [
        { id: 'cp-10', label: 'Outgoing operator summary completed', owner: 'Shift A Lead', requiredEvidence: 'Handoff summary note', status: 'complete', completedAt: '2026-05-21T08:05:00Z' },
        { id: 'cp-11', label: 'Incoming operator acknowledgement', owner: 'Shift B Lead', requiredEvidence: 'Acknowledged handoff receipt', status: 'complete', completedAt: '2026-05-21T08:07:00Z' },
      ],
      evidenceRequirements: ['Handoff summary', 'Acknowledgement signature', 'Open incident list'],
      supervision: 'human_confirmed',
      lastUpdatedAt: '2026-05-21T08:17:00Z',
      handoff: {
        id: 'ho-224',
        from: 'Shift A Lead',
        to: 'Shift B Lead',
        reason: 'Scheduled transition with active premium incidents',
        acknowledgedAt: '2026-05-21T08:07:00Z',
        evidence: 'Signed handoff digest #HD-2026-05-21-08',
      },
    },
  ]

  const logs = [
    'MoniRide: GPS activo.',
    'Driver: estado actualizado.',
    'Founder: supervisión en curso.',
  ]

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin</h1>
      <p style={{ margin: 0 }}>Intervención mínima. Operación primero.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Textos visibles</h2>
        <input value={visibleText} onChange={(e) => setVisibleText(e.target.value)} style={inputStyle} />
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Precio base</h2>
        <input type='number' value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} style={inputStyle} />
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Tipos de servicio</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {services.map((service) => (
            <div key={service.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr .6fr .7fr', gap: 8 }}>
              <input value={service.name} onChange={(e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item))} style={inputStyle} />
              <input type='number' value={service.basePrice} onChange={(e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, basePrice: Number(e.target.value) } : item))} style={inputStyle} />
              <button type='button' onClick={() => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, active: !item.active } : item))} style={service.active ? enabledButton : disabledButton}>{service.active ? 'Activo' : 'Inactivo'}</button>
            </div>
          ))}
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Reservas y estados</h2>
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {metrics && <p>T: {metrics.total} · A: {metrics.active} · C: {metrics.completed} · X: {metrics.cancelled} · {(metrics.completionRate * 100).toFixed(1)}%</p>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {bookings.slice(0, 15).map((booking) => <li key={booking.id}>{booking.referenceCode} · {booking.lifecycle.state} · {booking.pickup} → {booking.destination}</li>)}
        </ul>
      </article>


      <article style={cardStyle}>
        <h2 style={h2Style}>Operational workflow lifecycles (read-only)</h2>
        <p style={{ marginTop: 0, color: '#cbd5e1' }}>Cognition-first view: observability only, no autonomous execution controls.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {workflowLifecycles.map((workflow) => (
            <section key={workflow.id} style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: 12, background: '#111214' }}>
              <p style={{ margin: 0, color: GOLD, fontWeight: 700 }}>{workflow.title}</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13 }}>{workflow.type.toUpperCase()} · state: <strong>{workflow.state}</strong> · supervision: {workflow.supervision}</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13 }}>Deterministic states: {workflow.deterministicPath.join(' → ')}</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13 }}>Evidence requirements: {workflow.evidenceRequirements.join(' · ')}</p>
              <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
                {workflow.checkpoints.map((checkpoint) => (
                  <li key={checkpoint.id}>
                    {checkpoint.label} ({checkpoint.status}) · owner: {checkpoint.owner} · evidence: {checkpoint.requiredEvidence}
                    {checkpoint.completedAt ? ` · completed: ${checkpoint.completedAt}` : ''}
                  </li>
                ))}
              </ul>
              {workflow.handoff && (
                <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                  Handoff record: {workflow.handoff.from} → {workflow.handoff.to} · {workflow.handoff.reason} · acknowledged: {workflow.handoff.acknowledgedAt} · evidence: {workflow.handoff.evidence}
                </p>
              )}
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>Last updated: {workflow.lastUpdatedAt}</p>
            </section>
          ))}
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Logs y alertas</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>{logs.map((log) => <li key={log}>{log}</li>)}</ul>
        <p style={{ color: GOLD, marginBottom: 0 }}>Alerta simple: solo intervenir en emergencia.</p>
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

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  borderRadius: 8,
  background: '#111214',
  color: 'white',
  padding: '9px 10px',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'Arial, sans-serif',
}

const enabledButton: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.4)',
  background: 'rgba(212,175,55,.2)',
  color: 'white',
  borderRadius: 8,
}

const disabledButton: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  background: 'transparent',
  color: '#d1d5db',
  borderRadius: 8,
}
