import { useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
const GOLD = '#d4af37'

type Metrics = { total: number; completed: number; cancelled: number; active: number; completionRate: number }
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; lifecycle: { state: string; version: number } }
type ServiceConfig = { id: string; name: string; basePrice: number; active: boolean }

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
  const [drafts, setDrafts] = useState<ActionDraft[]>(actionTemplates)

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
        </div>
      </article>

      <article style={cardStyle}><h2 style={h2Style}>Textos visibles</h2><input value={visibleText} onChange={(e) => setVisibleText(e.target.value)} style={inputStyle} /></article>
      <article style={cardStyle}><h2 style={h2Style}>Precio base</h2><input type='number' value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} style={inputStyle} /></article>

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
        <ul style={{ margin: 0, paddingLeft: 18 }}>{bookings.slice(0, 15).map((booking) => <li key={booking.id}>{booking.referenceCode} · {booking.lifecycle.state} · {booking.pickup} → {booking.destination}</li>)}</ul>
      </article>

      <article style={cardStyle}><h2 style={h2Style}>Logs y alertas</h2><ul style={{ margin: 0, paddingLeft: 18 }}>{logs.map((log) => <li key={log}>{log}</li>)}</ul><p style={{ color: GOLD, marginBottom: 0 }}>Alerta simple: solo intervenir en emergencia.</p></article>
    </section>
  </main>
}

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
