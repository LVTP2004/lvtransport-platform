const gold = '#d4af37'

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

export default function Founder() {
  return (
    <main style={{ background: '#050505', color: 'white', minHeight: '100vh', padding: '48px 22px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <a href="/" style={{ color: gold, textDecoration: 'none', fontWeight: 800 }}>← LV Transport</a>
        <p style={{ color: gold, letterSpacing: 4, fontWeight: 900, marginTop: 24 }}>FOUNDER CONTROL TOWER</p>
        <h1 style={{ fontSize: 'clamp(42px, 8vw, 74px)', margin: '10px 0 18px', lineHeight: .95 }}>Operational visibility without chaos.</h1>
        <p style={{ maxWidth: 760, color: '#d1d5db', lineHeight: 1.8, fontSize: 18 }}>
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
