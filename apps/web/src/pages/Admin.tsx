import { useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number }; [key: string]: unknown }
type ServiceConfig = { id: string; name: string; basePrice: number; active: boolean }

type EvidenceKind = 'entity' | 'incident' | 'replay' | 'transition' | 'migration' | 'runbook' | 'audit'
type RelationshipType =
  | 'correlation_match'
  | 'request_match'
  | 'lineage_reference'
  | 'source_reference'
  | 'entity_reference'
  | 'replay_chain'

type EvidenceNode = {
  id: string
  label: string
  kind: EvidenceKind
  timestamp?: string
  correlationId?: string
  requestId?: string
  lineageRefs: string[]
  sourceRefs: string[]
  explicitEntityRefs: string[]
}

type EvidenceRelationship = {
  id: string
  from: string
  to: string
  relationshipType: RelationshipType
  sourceEvidence: string
  lineageReference?: string
  correlationId?: string
  requestId?: string
  deterministicReason: string
  timestamp?: string
}

const parseTokenList = (value: unknown): string[] => {
  if (typeof value !== 'string') return []
  return value
    .split(/[\s,;|]+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

const stringifyMaybe = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

const collectNodeRefs = (record: Record<string, unknown>) => {
  const lineageRefs = new Set<string>()
  const sourceRefs = new Set<string>()
  const explicitEntityRefs = new Set<string>()

  Object.entries(record).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase()
    if (normalizedKey.includes('lineage')) {
      parseTokenList(stringifyMaybe(value)).forEach((token) => lineageRefs.add(token))
    }
    if (normalizedKey.includes('source')) {
      parseTokenList(stringifyMaybe(value)).forEach((token) => sourceRefs.add(token))
    }
    if (normalizedKey.includes('entity') || normalizedKey.includes('reference')) {
      parseTokenList(stringifyMaybe(value)).forEach((token) => explicitEntityRefs.add(token))
    }
  })

  return {
    lineageRefs: [...lineageRefs],
    sourceRefs: [...sourceRefs],
    explicitEntityRefs: [...explicitEntityRefs],
  }
}

const buildBookingNodes = (bookings: Booking[]): EvidenceNode[] =>
  bookings.flatMap((booking) => {
    const baseRecord = booking as Record<string, unknown>
    const correlationId = stringifyMaybe(baseRecord.correlation_id ?? baseRecord.correlationId)
    const requestId = stringifyMaybe(baseRecord.request_id ?? baseRecord.requestId)
    const refs = collectNodeRefs(baseRecord)

    const entityNode: EvidenceNode = {
      id: `entity:${booking.id}`,
      label: `${booking.referenceCode} · ${booking.pickup} → ${booking.destination}`,
      kind: 'entity',
      timestamp: booking.scheduleAt,
      correlationId: correlationId || undefined,
      requestId: requestId || undefined,
      ...refs,
    }

    const transitionNode: EvidenceNode = {
      id: `transition:${booking.id}:${booking.lifecycle.version}`,
      label: `${booking.referenceCode} lifecycle ${booking.lifecycle.state}`,
      kind: 'transition',
      timestamp: booking.scheduleAt,
      correlationId: correlationId || undefined,
      requestId: requestId || undefined,
      lineageRefs: [entityNode.id, ...refs.lineageRefs],
      sourceRefs: refs.sourceRefs,
      explicitEntityRefs: [entityNode.id, ...refs.explicitEntityRefs],
    }

    return [entityNode, transitionNode]
  })

const dedupeRelationshipId = (from: string, to: string, relationshipType: RelationshipType, reason: string) => `${from}->${to}#${relationshipType}#${reason}`

const createRelationships = (nodes: EvidenceNode[]): EvidenceRelationship[] => {
  const relationships = new Map<string, EvidenceRelationship>()

  nodes.forEach((node) => {
    node.explicitEntityRefs.forEach((ref) => {
      if (nodes.some((candidate) => candidate.id === ref)) {
        const reason = 'Explicit entity reference token matches known evidence node id.'
        const id = dedupeRelationshipId(node.id, ref, 'entity_reference', reason)
        relationships.set(id, {
          id,
          from: node.id,
          to: ref,
          relationshipType: 'entity_reference',
          sourceEvidence: node.label,
          lineageReference: ref,
          correlationId: node.correlationId,
          requestId: node.requestId,
          deterministicReason: reason,
          timestamp: node.timestamp,
        })
      }
    })
  })

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const left = nodes[i]
      const right = nodes[j]

      if (left.correlationId && right.correlationId && left.correlationId === right.correlationId) {
        const reason = 'Matching correlation_id values.'
        const id = dedupeRelationshipId(left.id, right.id, 'correlation_match', reason)
        relationships.set(id, {
          id,
          from: left.id,
          to: right.id,
          relationshipType: 'correlation_match',
          sourceEvidence: `${left.label} ↔ ${right.label}`,
          correlationId: left.correlationId,
          deterministicReason: reason,
          timestamp: left.timestamp ?? right.timestamp,
        })
      }

      if (left.requestId && right.requestId && left.requestId === right.requestId) {
        const reason = 'Matching request_id values.'
        const id = dedupeRelationshipId(left.id, right.id, 'request_match', reason)
        relationships.set(id, {
          id,
          from: left.id,
          to: right.id,
          relationshipType: 'request_match',
          sourceEvidence: `${left.label} ↔ ${right.label}`,
          requestId: left.requestId,
          deterministicReason: reason,
          timestamp: left.timestamp ?? right.timestamp,
        })
      }

      const sharedLineage = left.lineageRefs.find((lineageRef) => right.lineageRefs.includes(lineageRef))
      if (sharedLineage) {
        const reason = 'Shared lineage reference token.'
        const id = dedupeRelationshipId(left.id, right.id, 'lineage_reference', `${reason}:${sharedLineage}`)
        relationships.set(id, {
          id,
          from: left.id,
          to: right.id,
          relationshipType: 'lineage_reference',
          sourceEvidence: `${left.label} ↔ ${right.label}`,
          lineageReference: sharedLineage,
          correlationId: left.correlationId ?? right.correlationId,
          requestId: left.requestId ?? right.requestId,
          deterministicReason: reason,
          timestamp: left.timestamp ?? right.timestamp,
        })
      }

      const sharedSource = left.sourceRefs.find((sourceRef) => right.sourceRefs.includes(sourceRef))
      if (sharedSource) {
        const reason = 'Shared source reference token.'
        const id = dedupeRelationshipId(left.id, right.id, 'source_reference', `${reason}:${sharedSource}`)
        relationships.set(id, {
          id,
          from: left.id,
          to: right.id,
          relationshipType: 'source_reference',
          sourceEvidence: `${left.label} ↔ ${right.label}`,
          lineageReference: sharedSource,
          correlationId: left.correlationId ?? right.correlationId,
          requestId: left.requestId ?? right.requestId,
          deterministicReason: reason,
          timestamp: left.timestamp ?? right.timestamp,
        })
      }

      if (left.kind === 'replay' && right.kind === 'replay') {
        const chainRef = left.lineageRefs.find((lineageRef) => right.explicitEntityRefs.includes(lineageRef) || right.lineageRefs.includes(lineageRef))
        if (chainRef) {
          const reason = 'Replay chain linked by explicit lineage token.'
          const id = dedupeRelationshipId(left.id, right.id, 'replay_chain', `${reason}:${chainRef}`)
          relationships.set(id, {
            id,
            from: left.id,
            to: right.id,
            relationshipType: 'replay_chain',
            sourceEvidence: `${left.label} ↔ ${right.label}`,
            lineageReference: chainRef,
            correlationId: left.correlationId ?? right.correlationId,
            requestId: left.requestId ?? right.requestId,
            deterministicReason: reason,
            timestamp: left.timestamp ?? right.timestamp,
          })
        }
      }
    }
  }

  return [...relationships.values()]
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

  const evidenceNodes = useMemo(() => buildBookingNodes(bookings), [bookings])
  const evidenceRelationships = useMemo(() => createRelationships(evidenceNodes), [evidenceNodes])

  const navigationChain = ['timeline', 'replay', 'incident', 'migration', 'runbook', 'related entity', 'source lineage']

  const groups: Array<{ title: string; kinds: EvidenceKind[] }> = [
    { title: 'Related incidents', kinds: ['incident'] },
    { title: 'Related replays', kinds: ['replay'] },
    { title: 'Related transitions', kinds: ['transition'] },
    { title: 'Related runbooks', kinds: ['runbook'] },
    { title: 'Related migrations', kinds: ['migration'] },
    { title: 'Related entities', kinds: ['entity'] },
    { title: 'Related audit events', kinds: ['audit'] },
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
        <h2 style={h2Style}>Operational correlation graph</h2>
        <p style={{ marginTop: 0 }}>Deterministic navigation: {navigationChain.join(' → ')}</p>
        {evidenceRelationships.length === 0 ? (
          <p style={{ color: '#d1d5db' }}>Insufficient deterministic evidence. No relationships are rendered.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {evidenceRelationships.slice(0, 20).map((relationship) => (
              <li key={relationship.id}>
                <strong>{relationship.relationshipType}</strong> · {relationship.from} → {relationship.to}<br />
                reason: {relationship.deterministicReason}; source: {relationship.sourceEvidence}; lineage: {relationship.lineageReference ?? 'n/a'}; correlation: {relationship.correlationId ?? 'n/a'}; request: {relationship.requestId ?? 'n/a'}; ts: {relationship.timestamp ?? 'n/a'}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Evidence map panels</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {groups.map((group) => {
            const related = evidenceRelationships.filter((relationship) => {
              const fromNode = evidenceNodes.find((node) => node.id === relationship.from)
              const toNode = evidenceNodes.find((node) => node.id === relationship.to)
              return (fromNode && group.kinds.includes(fromNode.kind)) || (toNode && group.kinds.includes(toNode.kind))
            })

            return (
              <section key={group.title} style={panelStyle}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: GOLD }}>{group.title}</h3>
                {related.length === 0 ? (
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>No proven relationship evidence.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 16, display: 'grid', gap: 4 }}>
                    {related.slice(0, 5).map((relationship) => (
                      <li key={relationship.id} style={{ fontSize: 13 }}>{relationship.relationshipType}: {relationship.from} → {relationship.to}</li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
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

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.2)',
  borderRadius: 10,
  padding: 10,
  background: '#131519',
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
