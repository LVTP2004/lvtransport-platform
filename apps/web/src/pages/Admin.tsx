import { useMemo, useState } from 'react'

const GOLD = '#d4af37'

type CoordinationStatus = 'monitoring' | 'investigating' | 'mitigated' | 'escalated'
type AckStatus = 'pending' | 'acknowledged'

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
type OperatorAssignment = {
  operator: string
  role: string
  assignedAt: string
  assignedBy: string
  reason: string
}

type IncidentEvent = {
  id: string
  timestamp: string
  actor: string
  action: string
  detail: string
  immutableHash: string
}

type Incident = {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
  status: CoordinationStatus
  ackStatus: AckStatus
  ackAt?: string
  assignmentLineage: OperatorAssignment[]
  timeline: IncidentEvent[]
}

const initialIncidents: Incident[] = [
  {
    id: 'inc-2418',
    title: 'Airport pickup latency drift',
    severity: 'high',
    status: 'investigating',
    ackStatus: 'pending',
    assignmentLineage: [
      { operator: 'Nora V.', role: 'Dispatch lead', assignedAt: '2026-05-21T08:04:00Z', assignedBy: 'Scheduler-7', reason: 'Primary queue variance > 14%' },
      { operator: 'Marcos R.', role: 'Driver liaison', assignedAt: '2026-05-21T08:09:00Z', assignedBy: 'Nora V.', reason: 'Driver ETA reconciliation required' },
    ],
    timeline: [
      { id: 'evt-1', timestamp: '2026-05-21T08:01:00Z', actor: 'Ops sentinel', action: 'incident_opened', detail: 'Latency threshold breached for airport corridor.', immutableHash: 'a9f8-0102' },
      { id: 'evt-2', timestamp: '2026-05-21T08:10:00Z', actor: 'Nora V.', action: 'triage_started', detail: 'Started deterministic route replay.', immutableHash: 'a9f8-0103' },
    ],
  },
  {
    id: 'inc-2420',
    title: 'Night fleet fuel card mismatch',
    severity: 'medium',
    status: 'monitoring',
    ackStatus: 'acknowledged',
    ackAt: '2026-05-21T07:25:00Z',
    assignmentLineage: [
      { operator: 'Elias P.', role: 'Finance operations', assignedAt: '2026-05-21T07:08:00Z', assignedBy: 'Scheduler-2', reason: 'Mismatch checksum verification' },
    ],
    timeline: [
      { id: 'evt-3', timestamp: '2026-05-21T07:05:00Z', actor: 'Ops sentinel', action: 'incident_opened', detail: 'Fuel card settlement checksum divergence.', immutableHash: 'b4c1-4421' },
      { id: 'evt-4', timestamp: '2026-05-21T07:25:00Z', actor: 'Elias P.', action: 'incident_acknowledged', detail: 'Ownership accepted for finance reconciliation.', immutableHash: 'b4c1-4422' },
    ],
  },
]

export default function Admin() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidents[0]?.id ?? '')
  const [ackActor, setAckActor] = useState('')

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0] ?? null,
    [incidents, selectedIncidentId],
  )

  const acknowledgeIncident = () => {
    if (!selectedIncident || !ackActor.trim() || selectedIncident.ackStatus === 'acknowledged') return

    const ackAt = new Date().toISOString()
    const event: IncidentEvent = {
      id: `evt-${selectedIncident.timeline.length + 10}`,
      timestamp: ackAt,
      actor: ackActor.trim(),
      action: 'incident_acknowledged',
      detail: 'Acknowledged operational ownership without mutating prior records.',
      immutableHash: `${selectedIncident.id}-${selectedIncident.timeline.length + 10}`,
    }

    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === selectedIncident.id
          ? {
              ...incident,
              ackStatus: 'acknowledged',
              ackAt,
              timeline: [...incident.timeline, event],
            }
          : incident,
      ),
    )
    setAckActor('')
  }

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Operator Collaboration</h1>
      <p style={{ margin: 0 }}>Structured coordination only. No chat or copilot intervention.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Operator coordination views</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          {incidents.map((incident) => (
            <button key={incident.id} type='button' onClick={() => setSelectedIncidentId(incident.id)} style={incident.id === selectedIncident?.id ? selectedCoordinationCard : coordinationCard}>
              <strong>{incident.id}</strong>
              <span>{incident.title}</span>
              <span>Severity: {incident.severity.toUpperCase()}</span>
              <span>Status: {incident.status}</span>
              <span>Ack: {incident.ackStatus}</span>
            </button>
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
      {selectedIncident && <>
        <article style={cardStyle}>
          <h2 style={h2Style}>Incident collaboration timeline</h2>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            {selectedIncident.timeline.map((event) => <li key={event.id}><strong>{new Date(event.timestamp).toLocaleString()}</strong> · {event.actor} · {event.action}<br />{event.detail}<br /><small style={{ color: '#9ca3af' }}>Immutable hash: {event.immutableHash}</small></li>)}
          </ol>
        </article>

        <article style={cardStyle}>
          <h2 style={h2Style}>Operator assignment lineage</h2>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            {selectedIncident.assignmentLineage.map((assignment, index) => <li key={`${assignment.operator}-${assignment.assignedAt}`}>
              <strong>Step {index + 1}</strong>: {assignment.operator} ({assignment.role}) · Assigned by {assignment.assignedBy}<br />
              <small>{new Date(assignment.assignedAt).toLocaleString()} · Reason: {assignment.reason}</small>
            </li>)}
          </ul>
        </article>

        <article style={cardStyle}>
          <h2 style={h2Style}>Acknowledgement flow</h2>
          <p style={{ marginTop: 0 }}>Incident {selectedIncident.id} is currently <strong>{selectedIncident.ackStatus}</strong>{selectedIncident.ackAt ? ` at ${new Date(selectedIncident.ackAt).toLocaleString()}` : ''}.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input value={ackActor} onChange={(e) => setAckActor(e.target.value)} placeholder='Operator name for acknowledgement' style={inputStyle} disabled={selectedIncident.ackStatus === 'acknowledged'} />
            <button type='button' onClick={acknowledgeIncident} style={selectedIncident.ackStatus === 'acknowledged' ? disabledButton : enabledButton} disabled={selectedIncident.ackStatus === 'acknowledged'}>
              {selectedIncident.ackStatus === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}
            </button>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: 0 }}>Audit trail is append-only. Existing timeline and lineage records are immutable.</p>
        </article>
      </>}
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

const coordinationCard: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  textAlign: 'left',
  border: '1px solid rgba(255,255,255,.2)',
  borderRadius: 10,
  padding: 10,
  background: '#131517',
  color: 'white',
}

const selectedCoordinationCard: React.CSSProperties = {
  ...coordinationCard,
  border: '1px solid rgba(212,175,55,.65)',
  background: 'rgba(212,175,55,.12)',
}

const enabledButton: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.4)',
  background: 'rgba(212,175,55,.2)',
  color: 'white',
  borderRadius: 8,
  padding: '9px 12px',
}

const disabledButton: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  background: 'transparent',
  color: '#d1d5db',
  borderRadius: 8,
  padding: '9px 12px',
}
