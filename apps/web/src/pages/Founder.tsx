const gold = '#d4af37'

type OperationalArtifact = {
  artifact_id: string
  type: string
  status: 'ok' | 'missing' | 'warning'
  correlation_id?: string
  request_id?: string
  source_lineage: string[]
  runbook_ref?: string
  detail: string
}

type RecommendationGroup =
  | 'Integrity'
  | 'Recovery'
  | 'Replay'
  | 'Transition'
  | 'Migration'
  | 'Evidence completeness'
  | 'Operational continuity'

type DeterministicRecommendation = {
  id: string
  group: RecommendationGroup
  recommendation_type: string
  triggering_evidence: string[]
  source_lineage: string[]
  correlation_id?: string
  request_id?: string
  runbook_ref?: string
  deterministic_reason: string
  advisory: string
}

const metrics = [
  ['Operational continuity signal', 'Deterministic'],
  ['Operator authority', 'Required'],
  ['Mutation pathways', 'Disabled'],
  ['Replay execution', 'Not permitted']
]
type OperationalMemoryEntry = {
  continuityWindowId: string
  checkpoint: 'captured' | 'missing'
}

type ExecutionLedgerEntry = {
  runId: string
  outcome: 'success' | 'failed_recovery'
  replayState: 'none' | 'pending'
}

type LineageEntry = {
  operationId: string
  migrationState: 'healthy' | 'degraded'
  evidenceLinked: boolean
}

type DeterministicEvidence = {
  expectedContinuityWindows: number
}

type OperationalEvidence = {
  operationalMemory: OperationalMemoryEntry[]
  executionLedger: ExecutionLedgerEntry[]
  lineage: LineageEntry[]
  deterministicEvidence: DeterministicEvidence
}

type DegradedState = 'clear' | 'degraded'

type TelemetrySurface = {
  title: string
  value: string
  state: DegradedState
  reason: string
}

const operationalEvidence: OperationalEvidence = {
  operationalMemory: [
    { continuityWindowId: 'window-2026-05-21-1', checkpoint: 'captured' },
    { continuityWindowId: 'window-2026-05-21-2', checkpoint: 'captured' },
    { continuityWindowId: 'window-2026-05-21-3', checkpoint: 'missing' }
  ],
  executionLedger: [
    { runId: 'exec-1402', outcome: 'success', replayState: 'none' },
    { runId: 'exec-1403', outcome: 'failed_recovery', replayState: 'pending' },
    { runId: 'exec-1404', outcome: 'success', replayState: 'none' }
  ],
  lineage: [
    { operationId: 'op-a12', migrationState: 'healthy', evidenceLinked: true },
    { operationId: 'op-a13', migrationState: 'degraded', evidenceLinked: true },
    { operationId: 'op-a14', migrationState: 'healthy', evidenceLinked: false }
  ],
  deterministicEvidence: {
    expectedContinuityWindows: 4
  }
}

function deriveTelemetrySurfaces(evidence: OperationalEvidence): TelemetrySurface[] {
  const integrityBroken = evidence.lineage.some((entry) => !entry.evidenceLinked)
  const replayBacklog = evidence.executionLedger.filter((entry) => entry.replayState === 'pending').length
  const failedRecovery = evidence.executionLedger.filter((entry) => entry.outcome === 'failed_recovery').length
  const degradedMigrations = evidence.lineage.filter((entry) => entry.migrationState === 'degraded').length
  const executionCount = evidence.executionLedger.length
  const continuityCaptured = evidence.operationalMemory.filter((entry) => entry.checkpoint === 'captured').length
  const continuityExpected = evidence.deterministicEvidence.expectedContinuityWindows

  return [
    {
      title: 'Integrity state',
      value: integrityBroken ? 'Degraded' : 'Clear',
      state: integrityBroken ? 'degraded' : 'clear',
      reason: integrityBroken
        ? 'Lineage has operations without linked deterministic evidence.'
        : 'Every lineage operation is linked to deterministic evidence.'
    },
    {
      title: 'Replay backlog',
      value: `${replayBacklog} pending`,
      state: replayBacklog > 0 ? 'degraded' : 'clear',
      reason: replayBacklog > 0
        ? 'Execution ledger contains pending replay work.'
        : 'Execution ledger has no pending replay work.'
    },
    {
      title: 'Failed recovery counts',
      value: String(failedRecovery),
      state: failedRecovery > 0 ? 'degraded' : 'clear',
      reason: failedRecovery > 0
        ? 'At least one recovery attempt failed in execution ledger.'
        : 'No failed recovery entries in execution ledger.'
    },
    {
      title: 'Migration health',
      value: degradedMigrations > 0 ? `${degradedMigrations} degraded` : 'Healthy',
      state: degradedMigrations > 0 ? 'degraded' : 'clear',
      reason: degradedMigrations > 0
        ? 'Lineage includes degraded migration states.'
        : 'All lineage migration states are healthy.'
    },
    {
      title: 'Execution counts',
      value: `${executionCount} deterministic runs`,
      state: 'clear',
      reason: 'Count comes directly from execution ledger entries.'
    },
    {
      title: 'Operational continuity coverage',
      value: `${continuityCaptured}/${continuityExpected} windows`,
      state: continuityCaptured < continuityExpected ? 'degraded' : 'clear',
      reason: continuityCaptured < continuityExpected
        ? 'Operational memory is missing required continuity checkpoints.'
        : 'Operational memory covers all required continuity checkpoints.'
    }
  ]
}

const telemetrySurfaces = deriveTelemetrySurfaces(operationalEvidence)

const operationalMemoryArtifacts: OperationalArtifact[] = [
  {
    artifact_id: 'evt-ops-1001',
    type: 'integrity-checksum',
    status: 'warning',
    correlation_id: 'corr-airport-044',
    request_id: 'req-7791',
    source_lineage: ['operational-memory/checksums/airport-leg-044', 'audit-log/shift-a/entry-190'],
    runbook_ref: 'RB-INT-002',
    detail: 'Checksum mismatch between dispatch snapshot and archived lifecycle segment.'
  },
  {
    artifact_id: 'evt-ops-1002',
    type: 'transition-proof',
    status: 'missing',
    correlation_id: 'corr-driver-088',
    source_lineage: ['operational-memory/transitions/driver-088', 'lifecycle-journal/driver-088'],
    runbook_ref: 'RB-TRN-004',
    detail: 'Transition handoff evidence absent for ARRIVED -> BOARDING.'
  },
  {
    artifact_id: 'evt-ops-1003',
    type: 'replay-guard',
    status: 'warning',
    correlation_id: 'corr-payment-219',
    request_id: 'req-9912',
    source_lineage: ['operational-memory/replay-guards/payment-219', 'audit-log/shift-b/entry-011'],
    runbook_ref: 'RB-RPL-001',
    detail: 'Replay guard flagged repeated request_id observation in read-only evidence stream.'
  },
  {
    artifact_id: 'evt-ops-1004',
    type: 'migration-lineage',
    status: 'missing',
    correlation_id: 'corr-migrate-012',
    source_lineage: ['operational-memory/migrations/batch-012'],
    runbook_ref: 'RB-MIG-003',
    detail: 'Source lineage missing destination checkpoint acknowledgment.'
  }
]

function buildDeterministicRecommendations(artifacts: OperationalArtifact[]): DeterministicRecommendation[] {
  const recommendations: DeterministicRecommendation[] = []

  for (const artifact of artifacts) {
    if (artifact.type === 'integrity-checksum' && artifact.status === 'warning') {
      recommendations.push({
        id: `rec-${artifact.artifact_id}`,
        group: 'Integrity',
        recommendation_type: 'Integrity warning',
        triggering_evidence: [artifact.detail],
        source_lineage: artifact.source_lineage,
        correlation_id: artifact.correlation_id,
        request_id: artifact.request_id,
        runbook_ref: artifact.runbook_ref,
        deterministic_reason: 'Rule INT-CHK-01 matched: checksum warning state requires operator integrity review.',
        advisory: 'Operator decision required. No automatic correction will run.'
      })
    }

    if (artifact.type === 'transition-proof' && artifact.status === 'missing') {
      recommendations.push({
        id: `rec-${artifact.artifact_id}`,
        group: 'Transition',
        recommendation_type: 'Transition anomaly',
        triggering_evidence: [artifact.detail],
        source_lineage: artifact.source_lineage,
        correlation_id: artifact.correlation_id,
        runbook_ref: artifact.runbook_ref,
        deterministic_reason: 'Rule TRN-EVD-02 matched: missing transition proof must be escalated as advisory anomaly.',
        advisory: 'Operator verification required before any lifecycle interpretation.'
      })
    }

    if (artifact.type === 'replay-guard' && artifact.status === 'warning') {
      recommendations.push({
        id: `rec-${artifact.artifact_id}`,
        group: 'Replay',
        recommendation_type: 'Replay caution',
        triggering_evidence: [artifact.detail],
        source_lineage: artifact.source_lineage,
        correlation_id: artifact.correlation_id,
        request_id: artifact.request_id,
        runbook_ref: artifact.runbook_ref,
        deterministic_reason: 'Rule RPL-GRD-03 matched: replay guard warning requires manual request lineage confirmation.',
        advisory: 'No replay execution is permitted from this panel.'
      })
    }

    if (artifact.type === 'migration-lineage' && artifact.status === 'missing') {
      recommendations.push({
        id: `rec-${artifact.artifact_id}`,
        group: 'Migration',
        recommendation_type: 'Missing lineage',
        triggering_evidence: [artifact.detail],
        source_lineage: artifact.source_lineage,
        correlation_id: artifact.correlation_id,
        runbook_ref: artifact.runbook_ref,
        deterministic_reason: 'Rule MIG-LIN-04 matched: incomplete migration lineage produces deterministic advisory notice.',
        advisory: 'Operator sign-off required. System will not mutate migration records automatically.'
      })
    }
  }

  const hasCorrelationMismatch = artifacts.some((artifact) => artifact.status === 'warning' && !artifact.correlation_id)
  if (hasCorrelationMismatch) {
    recommendations.push({
      id: 'rec-correlation-mismatch',
      group: 'Operational continuity',
      recommendation_type: 'Correlation mismatch',
      triggering_evidence: ['One or more warning artifacts have no correlation_id.'],
      source_lineage: ['operational-memory/index'],
      deterministic_reason: 'Rule OPS-COR-05 matched: warning evidence without correlation identifier cannot be auto-attributed.',
      advisory: 'Operator mapping required. No autonomous escalation will occur.'
    })
  }

  const hasInsufficientEvidence = artifacts.some((artifact) => artifact.status === 'missing')
  if (hasInsufficientEvidence) {
    recommendations.push({
      id: 'rec-insufficient-evidence',
      group: 'Evidence completeness',
      recommendation_type: 'Missing evidence',
      triggering_evidence: ['At least one required artifact is missing in operational memory.'],
      source_lineage: ['operational-memory/required-artifacts-index'],
      deterministic_reason: 'Rule EVD-COMP-06 matched: incomplete artifact set triggers insufficient-evidence advisory state.',
      advisory: 'Insufficient evidence: operator interpretation required; no incident cause is inferred.'
    })
  }

  return recommendations
}

const recommendations = buildDeterministicRecommendations(operationalMemoryArtifacts)

export default function Founder() {
  return (
    <main style={{ background: '#050505', color: 'white', minHeight: '100vh', padding: '48px 22px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <a href="/" style={{ color: gold, textDecoration: 'none', fontWeight: 800 }}>← LV Transport</a>
        <p style={{ color: gold, letterSpacing: 4, fontWeight: 900, marginTop: 24 }}>FOUNDER CONTROL TOWER</p>
        <h1 style={{ fontSize: 'clamp(42px, 8vw, 74px)', margin: '10px 0 18px', lineHeight: .95 }}>Operational visibility without chaos.</h1>
        <p style={{ maxWidth: 760, color: '#d1d5db', lineHeight: 1.8, fontSize: 18 }}>
          Deterministic operational cognition panels provide advisory-only recommendations from explicit evidence. Operator decision is always required.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 36 }}>
          {metrics.map(([title, value]) => (
            <article key={title} style={{ border: '1px solid rgba(212,175,55,.22)', borderRadius: 24, padding: 22, background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))' }}>
              <p style={{ color: '#a1a1aa', marginTop: 0 }}>{title}</p>
              <strong style={{ color: gold, fontSize: 30 }}>{value}</strong>
            </article>
          ))}
        </div>

        <section style={{ marginTop: 34, border: '1px solid rgba(255,255,255,.08)', borderRadius: 28, padding: 24, background: '#101010' }}>
          <h2 style={{ marginTop: 0 }}>Deterministic operational recommendations</h2>
          <p style={{ color: '#a1a1aa', margin: '10px 0 0' }}>Advisory-only output. No automatic execution, replay, mutation, or autonomous escalation paths exist in this panel.</p>

          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} style={{ border: '1px solid rgba(255,255,255,.09)', borderRadius: 16, padding: 16, background: 'rgba(255,255,255,.03)' }}>
                <p style={{ margin: 0, color: gold, fontWeight: 700 }}>{recommendation.group} · {recommendation.recommendation_type}</p>
                <p style={{ marginBottom: 8, color: '#d4d4d8' }}>{recommendation.deterministic_reason}</p>
                <p style={{ margin: '8px 0', color: '#a1a1aa' }}>Triggering evidence: {recommendation.triggering_evidence.join(' | ')}</p>
                <p style={{ margin: '8px 0', color: '#a1a1aa' }}>Source lineage: {recommendation.source_lineage.join(' → ')}</p>
                <p style={{ margin: '8px 0', color: '#a1a1aa' }}>
                  Correlation: {recommendation.correlation_id ?? 'not available'} · Request: {recommendation.request_id ?? 'not available'}
                </p>
                <p style={{ margin: '8px 0', color: '#a1a1aa' }}>Runbook: {recommendation.runbook_ref ?? 'not available'}</p>
                <p style={{ margin: '8px 0 0', color: '#f5f5f5' }}>{recommendation.advisory}</p>
              </article>
            ))}
          </div>
        </section>
          Deterministic telemetry derived only from operational memory, execution ledger, lineage, and evidence links.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 36 }}>
          {telemetrySurfaces.map((surface) => (
            <article
              key={surface.title}
              style={{
                border: `1px solid ${surface.state === 'degraded' ? 'rgba(248,113,113,.4)' : 'rgba(212,175,55,.22)'}`,
                borderRadius: 24,
                padding: 22,
                background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))'
              }}
            >
              <p style={{ color: '#a1a1aa', marginTop: 0 }}>{surface.title}</p>
              <strong style={{ color: surface.state === 'degraded' ? '#fca5a5' : gold, fontSize: 30 }}>{surface.value}</strong>
              <p style={{ color: '#c7c7c7', marginBottom: 0, lineHeight: 1.5 }}>{surface.reason}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
