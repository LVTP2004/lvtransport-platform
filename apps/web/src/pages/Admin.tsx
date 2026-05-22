import { useEffect, useMemo, useState } from 'react'
import { useMemo, useState } from 'react'

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
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number }; [key: string]: unknown }
type ServiceConfig = { id: string; name: string; basePrice: number; active: boolean }
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


type StageActionType = 'recovery_replay_request' | 'notification_retry_request' | 'migration_approval_review' | 'integrity_issue_acknowledgement' | 'recovery_escalation_review'
type EntityType = 'booking' | 'notification' | 'migration' | 'integrity_issue' | 'recovery_case'

type ActionDraft = {
  id: string
  title: string
  action_type: StageActionType
  target_entity_type: EntityType
  target_entity_id: string
  correlation_id?: string
  request_id?: string
  triggering_evidence: string[]
  source_lineage: string[]
  required_reason: string
  dry_run_expectation: string
  approval_checklist: { id: string; label: string; checked: boolean }[]
  dryRun: {
    would_happen: string[]
    would_be_audited: string[]
    evidence_supporting_action: string[]
    missing: string[]
  }
}

const actionTemplates: ActionDraft[] = [
  {
    id: 'stg-recovery-replay-01',
    title: 'Recovery replay request',
    action_type: 'recovery_replay_request',
    target_entity_type: 'booking',
    target_entity_id: 'BK-778245',
    correlation_id: 'corr-9fb7b0e5',
    request_id: 'req-rpl-2026-0518-01',
    triggering_evidence: ['Recovery pipeline reported partial checkpoint application at 2026-05-20T22:14:03Z.', 'Booking lifecycle hash mismatch between checkpoint-17 and current read model.'],
    source_lineage: ['ops.monitor.recovery', 'audit.checkpoints.v3', 'booking.lifecycle.readmodel'],
    required_reason: '',
    dry_run_expectation: 'Preview should show replay boundary and no write side effects.',
    approval_checklist: [
      { id: 'rbac-reviewed', label: 'Operator role and scope validated', checked: false },
      { id: 'evidence-reviewed', label: 'Evidence reviewed and deterministic', checked: false },
      { id: 'blast-radius', label: 'Dry-run blast radius reviewed', checked: false },
      { id: 'reason-recorded', label: 'Explicit reason documented', checked: false },
    ],
    dryRun: {
      would_happen: ['Replay span: checkpoint-17 → checkpoint-24 would be simulated.', 'Lifecycle projection diff for BK-778245 would be generated for review only.', 'No workflow execution command would be dispatched.'],
      would_be_audited: ['action_type, target_entity_type, target_entity_id', 'correlation_id/request_id linkage', 'reason text and checklist state snapshot'],
      evidence_supporting_action: ['Hash mismatch is repeatable in two independent reads.', 'Replay boundary remains within single booking scope.'],
      missing: ['Founder approval note not attached yet.'],
    },
  },
  {
    id: 'stg-notif-retry-01',
    title: 'Notification retry request',
    action_type: 'notification_retry_request',
    target_entity_type: 'notification',
    target_entity_id: 'NTF-55290',
    correlation_id: 'corr-2a8807e2',
    request_id: 'req-notif-2026-0519-11',
    triggering_evidence: ['Delivery provider timeout recorded 3x with same payload hash.', 'Downstream channel health back to green during last 15 minutes.'],
    source_lineage: ['notifications.dispatch.audit', 'provider.latency.window', 'ops.alert.timeline'],
    required_reason: '',
    dry_run_expectation: 'Preview should estimate recipients and duplicate suppression behavior.',
    approval_checklist: [
      { id: 'dup-check', label: 'Duplicate suppression check complete', checked: false },
      { id: 'recipient-scope', label: 'Recipient scope verified', checked: false },
      { id: 'reason-recorded', label: 'Explicit reason documented', checked: false },
    ],
    dryRun: {
      would_happen: ['Retry simulation would target 1 pending recipient.', 'Template variables would be re-resolved against current read snapshot.', 'No outbound notification send would occur.'],
      would_be_audited: ['notification id and channel', 'retry eligibility computation', 'reason + checklist + source lineage'],
      evidence_supporting_action: ['Payload hash stable across timeout attempts.', 'Channel health indicates transient failure resolved.'],
      missing: ['Customer-impact note has not been linked.'],
    },
  },
  {
    id: 'stg-migration-approval-01',
    title: 'Migration approval review',
    action_type: 'migration_approval_review',
    target_entity_type: 'migration',
    target_entity_id: 'MIG-2026-05-17-driver-ledger',
    triggering_evidence: ['Pre-flight integrity scan returned no drift in sampled rows.', 'Rollback rehearsal completed successfully in staging.'],
    source_lineage: ['migration.preflight.report', 'staging.rollback.audit'],
    required_reason: '',
    dry_run_expectation: 'Preview should list impacted tables and rollback hooks.',
    approval_checklist: [
      { id: 'schema-reviewed', label: 'Schema diff reviewed', checked: false },
      { id: 'rollback-ready', label: 'Rollback path reviewed', checked: false },
      { id: 'reason-recorded', label: 'Explicit reason documented', checked: false },
    ],
    dryRun: {
      would_happen: ['Migration plan steps would be rendered as read-only sequence.', 'Estimated lock windows and service surfaces would be shown.', 'No schema command would be executed.'],
      would_be_audited: ['migration id and revision hashes', 'operator reviewer identity context', 'approval checklist completion state'],
      evidence_supporting_action: ['No sample drift detected in pre-flight checks.', 'Rollback rehearsal artifacts available for review.'],
      missing: ['Final maintenance window sign-off missing.'],
    },
  },
  {
    id: 'stg-integrity-ack-01',
    title: 'Integrity issue acknowledgement',
    action_type: 'integrity_issue_acknowledgement',
    target_entity_type: 'integrity_issue',
    target_entity_id: 'INT-10122',
    correlation_id: 'corr-9e5e4a7f',
    triggering_evidence: ['Integrity monitor flagged orphaned waypoint rows.', 'Affected scope limited to 2 bookings with archived status.'],
    source_lineage: ['integrity.monitor.ruleset-4', 'db.consistency.scan.hourly'],
    required_reason: '',
    dry_run_expectation: 'Preview should state acknowledgement impact and follow-up ownership.',
    approval_checklist: [
      { id: 'scope-verified', label: 'Scope and severity verified', checked: false },
      { id: 'owner-assigned', label: 'Follow-up owner identified', checked: false },
      { id: 'reason-recorded', label: 'Explicit reason documented', checked: false },
    ],
    dryRun: {
      would_happen: ['Issue would be marked ready for tracked remediation planning.', 'Escalation reminders would be previewed for the assigned owner.', 'No integrity-state mutation would occur.'],
      would_be_audited: ['issue id and severity', 'evidence references', 'operator reason and checklist state'],
      evidence_supporting_action: ['Orphaned rows reproduced in read-only scanner.', 'Scope constrained to archived bookings only.'],
      missing: ['Root-cause ticket link not attached.'],
    },
  },
  {
    id: 'stg-recovery-escalation-01',
    title: 'Recovery escalation review',
    action_type: 'recovery_escalation_review',
    target_entity_type: 'recovery_case',
    target_entity_id: 'RCV-20341',
    request_id: 'req-esc-2026-0520-03',
    triggering_evidence: ['Automated retries exceeded threshold with unchanged failure signature.', 'Cross-service dependency unavailable for 42 minutes.'],
    source_lineage: ['recovery.policy.thresholds', 'service-dependency.health.audit', 'incident.timeline'],
    required_reason: '',
    dry_run_expectation: 'Preview should outline escalation path and audit expectations.',
    approval_checklist: [
      { id: 'policy-match', label: 'Escalation policy match confirmed', checked: false },
      { id: 'stakeholder-ready', label: 'Stakeholder notification plan reviewed', checked: false },
      { id: 'reason-recorded', label: 'Explicit reason documented', checked: false },
    ],
    dryRun: {
      would_happen: ['Escalation chain would identify incident commander and founder observer.', 'System would preview freeze points for recovery workflow.', 'No escalation action would be dispatched.'],
      would_be_audited: ['recovery case id + request id', 'policy threshold evidence', 'reason and checklist completeness'],
      evidence_supporting_action: ['Retry threshold exceeded with deterministic signature.', 'Dependency outage duration exceeds policy trigger.'],
      missing: ['Incident commander acceptance not logged yet.'],
    },
  },
]

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

  const [rideHistory, setRideHistory] = useState<RideHistoryEvent[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEvent[]>([])
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryEvent[]>([])
  const [moniRideHistory, setMoniRideHistory] = useState<MoniRideHistoryEvent[]>([])
  const [visibleText, setVisibleText] = useState('Reserva clara. GPS claro. Operación estable.')
  const [basePrice, setBasePrice] = useState(24)
  const [services, setServices] = useState<ServiceConfig[]>([
    { id: 'standard', name: 'Standard', basePrice: 24, active: true },
    { id: 'business', name: 'Business', basePrice: 35, active: true },
    { id: 'van', name: 'Van', basePrice: 42, active: false },
  ])
  const [drafts, setDrafts] = useState<ActionDraft[]>(actionTemplates)

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
  const logs = ['MoniRide: GPS activo.', 'Driver: estado actualizado.', 'Founder: supervisión en curso.']

  const stagedSummary = useMemo(() => {
    const reasonsComplete = drafts.filter((draft) => draft.required_reason.trim().length > 0).length
    const checklistComplete = drafts.filter((draft) => draft.approval_checklist.every((item) => item.checked)).length
    return { total: drafts.length, reasonsComplete, checklistComplete }
  }, [drafts])

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ margin: 0, color: GOLD }}>Admin</h1>
      <p style={{ margin: 0 }}>Intervención mínima. Operación primero.</p>

      <article style={cardStyle}>
        <h2 style={h2Style}>Operator Action Staging Workspace</h2>
        <p style={{ marginTop: 0, color: '#d1d5db' }}>Read-only safety workspace. Staging only: prepares intent, evidence and dry-run expectations. No execution path is available in UI.</p>
        <p style={{ marginTop: 0 }}>Staged actions: {stagedSummary.total} · reasons complete: {stagedSummary.reasonsComplete} · checklists complete: {stagedSummary.checklistComplete}</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {drafts.map((draft) => {
            const isReasonComplete = draft.required_reason.trim().length > 0
            const missingCount = draft.dryRun.missing.length + (isReasonComplete ? 0 : 1)
            return <section key={draft.id} style={stagingCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, color: GOLD }}>{draft.title}</h3>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(255,255,255,.2)' }}>staging-only</span>
              </div>

              <div style={metaGridStyle}>
                <MetaRow label='action_type' value={draft.action_type} />
                <MetaRow label='target_entity_type' value={draft.target_entity_type} />
                <MetaRow label='target_entity_id' value={draft.target_entity_id} />
                <MetaRow label='correlation_id' value={draft.correlation_id ?? 'not provided'} />
                <MetaRow label='request_id' value={draft.request_id ?? 'not provided'} />
                <MetaRow label='dry-run expectation' value={draft.dry_run_expectation} />
              </div>

              <TwoColumnBlock leftTitle='Triggering evidence' rightTitle='Source lineage' leftItems={draft.triggering_evidence} rightItems={draft.source_lineage} />

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: GOLD }}>Required operator reason</span>
                <textarea
                  value={draft.required_reason}
                  onChange={(event) => setDrafts((prev) => prev.map((item) => item.id === draft.id ? { ...item, required_reason: event.target.value } : item))}
                  placeholder='Explain why this action should be considered based on deterministic evidence.'
                  style={textAreaStyle}
                />
              </label>

              <div>
                <p style={{ margin: '10px 0 6px', color: GOLD }}>Approval checklist</p>
                <div style={{ display: 'grid', gap: 4 }}>
                  {draft.approval_checklist.map((check) => (
                    <label key={check.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type='checkbox' checked={check.checked} onChange={() => setDrafts((prev) => prev.map((item) => item.id === draft.id ? { ...item, approval_checklist: item.approval_checklist.map((entry) => entry.id === check.id ? { ...entry, checked: !entry.checked } : entry) } : item))} />
                      <span>{check.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={dryRunStyle}>
                <h4 style={{ margin: '0 0 8px', color: GOLD }}>Dry-run visualization</h4>
                <TwoColumnBlock leftTitle='What would happen' rightTitle='What would be audited' leftItems={draft.dryRun.would_happen} rightItems={draft.dryRun.would_be_audited} />
                <TwoColumnBlock leftTitle='Evidence supporting action' rightTitle='What is missing' leftItems={draft.dryRun.evidence_supporting_action} rightItems={[...draft.dryRun.missing, ...(!isReasonComplete ? ['Operator reason is still required.'] : [])]} />
                <p style={{ marginBottom: 0, color: missingCount === 0 ? '#86efac' : '#fca5a5' }}>Readiness: {missingCount === 0 ? 'Complete for supervised approval handoff.' : `${missingCount} blocking item(s) remain before supervised approval handoff.`}</p>
              </div>
            </section>
          })}
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

      <article style={cardStyle}><h2 style={h2Style}>Textos visibles</h2><input value={visibleText} onChange={(e) => setVisibleText(e.target.value)} style={inputStyle} /></article>
      <article style={cardStyle}><h2 style={h2Style}>Precio base</h2><input type='number' value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} style={inputStyle} /></article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Admin audit trail</h2>
        {auditEntries.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={auditEntries.map((entry) => `${entry.timestamp} · ${entry.actor} · ${entry.action} · ${entry.previousValue ?? '-'} → ${entry.newValue ?? '-'}${entry.reason ? ` · ${entry.reason}` : ''}`)} />}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Payment continuity history</h2>
        {paymentHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={paymentHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId ?? '—'} · ${event.status}${event.btwReference ? ` · BTW ${event.btwReference}` : ''}${event.invoiceReference ? ` · Invoice ${event.invoiceReference}` : ''}${event.message ? ` · ${event.message}` : ''}`)} />}
        <h2 style={h2Style}>Approvals, execution history, dry-run lineage and operator accountability</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {immutableExecutionRecords.map((record) => (
            <li key={`history-${record.execution_id}`}>{record.approval_id} · {record.execution_status} · operator {record.operator_id} · {record.timestamp}</li>
          ))}
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
        <h2 style={h2Style}>Reservas y estados</h2>
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {metrics && <p>T: {metrics.total} · A: {metrics.active} · C: {metrics.completed} · X: {metrics.cancelled} · {(metrics.completionRate * 100).toFixed(1)}%</p>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>{bookings.slice(0, 15).map((booking) => <li key={booking.id}>{booking.referenceCode} · {booking.lifecycle.state} · {booking.pickup} → {booking.destination}</li>)}</ul>
        <h2 style={h2Style}>Execution rejection history</h2>
        <p style={{ marginTop: 0, color: '#d1d5db' }}>Deterministic rejection reasons rendered from immutable history.</p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {rejectionHistory.length === 0 && <li>No rejected execution records.</li>}
          {rejectionHistory.map((entry) => <li key={`${entry.execution_id}-${entry.reason}`}>{entry.approval_id} · {entry.execution_id} · {entry.reason} · {entry.timestamp}</li>)}
        </ul>
        <p style={{ color: '#9ca3af', marginBottom: 0 }}>Supported rejection reasons: {rejectionReasonCatalog.join(', ')}.</p>
      </article>
      {selectedIncident && <>
        <article style={cardStyle}>
          <h2 style={h2Style}>Incident collaboration timeline</h2>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            {selectedIncident.timeline.map((event) => <li key={event.id}><strong>{new Date(event.timestamp).toLocaleString()}</strong> · {event.actor} · {event.action}<br />{event.detail}<br /><small style={{ color: '#9ca3af' }}>Immutable hash: {event.immutableHash}</small></li>)}
          </ol>
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
        <h2 style={h2Style}>MoniRide event history</h2>
        {moniRideHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={moniRideHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId ?? '—'} · ${event.eventType}${event.message ? ` · ${event.message}` : ''}`)} />}
      </article>

      <article style={cardStyle}>
        <h2 style={h2Style}>Notification history</h2>
        {notificationHistory.length === 0 ? <p style={emptyStateStyle}>Geen geschiedenis beschikbaar.</p> : <HistoryList items={notificationHistory.map((event) => `${event.timestamp} · ${event.rideCode ?? event.rideId ?? '—'} · ${event.channel} · ${event.status}${event.failureReason ? ` · ${event.failureReason}` : ''}`)} />}
      </article>
      <article style={cardStyle}><h2 style={h2Style}>Logs y alertas</h2><ul style={{ margin: 0, paddingLeft: 18 }}>{logs.map((log) => <li key={log}>{log}</li>)}</ul><p style={{ color: GOLD, marginBottom: 0 }}>Alerta simple: solo intervenir en emergencia.</p></article>
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

function HistoryList({ items }: { items: string[] }) {
  return <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>{items.map((item) => <li key={item}>{item}</li>)}</ul>
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.15)',
  borderRadius: 12,
  padding: 14,
  background: '#0f1011',
function MetaRow({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'grid', gap: 2 }}><span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span><span>{value}</span></div>
}

function TwoColumnBlock({ leftTitle, rightTitle, leftItems, rightItems }: { leftTitle: string; rightTitle: string; leftItems: string[]; rightItems: string[] }) {
  return <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
    <div><p style={{ margin: '8px 0 6px', color: GOLD }}>{leftTitle}</p><ul style={{ margin: 0, paddingLeft: 18 }}>{leftItems.map((item) => <li key={item}>{item}</li>)}</ul></div>
    <div><p style={{ margin: '8px 0 6px', color: GOLD }}>{rightTitle}</p><ul style={{ margin: 0, paddingLeft: 18 }}>{rightItems.map((item) => <li key={item}>{item}</li>)}</ul></div>
  </div>
}

const cardStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: 14, background: '#0f1011' }
const stagingCardStyle: React.CSSProperties = { border: '1px solid rgba(212,175,55,.25)', borderRadius: 10, padding: 12, background: 'rgba(255,255,255,.01)', display: 'grid', gap: 10 }
const dryRunStyle: React.CSSProperties = { border: '1px dashed rgba(255,255,255,.3)', borderRadius: 8, padding: 10, display: 'grid', gap: 8 }
const metaGridStyle: React.CSSProperties = { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }
const h2Style: React.CSSProperties = { margin: '0 0 8px', color: GOLD, fontSize: 18 }
const inputStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, background: '#111214', color: 'white', padding: '9px 10px', width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }
const textAreaStyle: React.CSSProperties = { ...inputStyle, minHeight: 78, resize: 'vertical' }
const enabledButton: React.CSSProperties = { border: '1px solid rgba(212,175,55,.4)', background: 'rgba(212,175,55,.2)', color: 'white', borderRadius: 8 }
const disabledButton: React.CSSProperties = { border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: '#d1d5db', borderRadius: 8 }
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

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,.2)',
  borderRadius: 10,
  padding: 10,
  background: '#131519',
}

const h2Style: React.CSSProperties = {
  margin: '0 0 8px',
const thStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,.2)',
  textAlign: 'left',
  padding: 8,
  color: GOLD,
}

const emptyStateStyle: React.CSSProperties = {
  margin: 0,
  color: '#c5c7cb',
const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,.1)',
  padding: 8,
  verticalAlign: 'top',
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
