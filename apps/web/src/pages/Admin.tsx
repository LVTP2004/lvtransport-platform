import { useMemo, useState } from 'react'

const GOLD = '#d4af37'

type CoordinationStatus = 'monitoring' | 'investigating' | 'mitigated' | 'escalated'
type AckStatus = 'pending' | 'acknowledged'

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
