# LVTP Matrix Evolution Extended — Implementation Guide

## Purpose

This guide operationalizes the **MATRIX EVOLUTION EXTENDED** mission into a repeatable runtime loop with measurable, reviewable outputs.

## Execution Loop

Every iteration must execute the same sequence:

1. **Observation**
2. **Validation**
3. **Classification**
4. **Alignment**
5. **Refinement**
6. **Hardening**
7. **Measurement**
8. **Simplification**
9. **Evolution**

## Runtime Report Generator

Use:

- `scripts/ops/lvtp-matrix-evolution-extended-loop.js`
- `pnpm ops:matrix-evolution`

The generator writes:

- `docs/reports/LVTP_MATRIX_EVOLUTION_EXTENDED_REPORT.json`
- `docs/reports/LVTP_MATRIX_EVOLUTION_EXTENDED_REPORT.md`

## Required Inputs Per Cycle

### Phase scores (0-100)

All 16 phases are required and must be passed as CLI flags:

- `runtimeEvolutionLoop`
- `weaknessAlignmentEngine`
- `operationalTruthMatrix`
- `immersiveMapEvolution`
- `moniCoreEvolution`
- `moniRideEvolution`
- `moniExperimentalEvolutionLab`
- `lvMessengerEvolution`
- `lvPayEvolution`
- `airportIntelligenceEvolution`
- `failureRecoveryEvolution`
- `pwaImmersionEvolution`
- `premiumSimplicityEvolution`
- `continuousScorecardEvolution`
- `realWorldPilotEvolution`
- `matrixEvolutionFinalState`

### Cross-cutting signals (0-100)

- `lifecycleTruth`
- `realtimeSync`
- `emotionalCalmness`
- `resilience`
- `founderVisibility`
- `controlledAiEvolution`

### Alignment arrays

Pipe-delimited lists:

- `anomaliesObserved`
- `anomaliesResolved`
- `refinementActions`
- `simplificationWins`
- `nextCycleFocus`

### Weakness chains payload

`weaknesses` must be a JSON array. Each entry should include:

- `id`
- `summary`
- `subsystemOwner`
- `emotionalImpact`
- `operationalRisk`
- `connectedWeaknesses` (array)
- `rootCauseChain` (array)

## Example Run

```bash
pnpm ops:matrix-evolution \
  --runtimeEvolutionLoop=91 \
  --weaknessAlignmentEngine=90 \
  --operationalTruthMatrix=93 \
  --immersiveMapEvolution=89 \
  --moniCoreEvolution=90 \
  --moniRideEvolution=88 \
  --moniExperimentalEvolutionLab=87 \
  --lvMessengerEvolution=92 \
  --lvPayEvolution=94 \
  --airportIntelligenceEvolution=89 \
  --failureRecoveryEvolution=90 \
  --pwaImmersionEvolution=88 \
  --premiumSimplicityEvolution=91 \
  --continuousScorecardEvolution=93 \
  --realWorldPilotEvolution=90 \
  --matrixEvolutionFinalState=89 \
  --lifecycleTruth=93 \
  --realtimeSync=92 \
  --emotionalCalmness=90 \
  --resilience=91 \
  --founderVisibility=95 \
  --controlledAiEvolution=92 \
  --anomaliesObserved='late reconnect|eta drift' \
  --anomaliesResolved='late reconnect' \
  --refinementActions='reconnect retry backoff tuned|eta smoothing patch' \
  --simplificationWins='reduced map overlay density' \
  --nextCycleFocus='airport night pickup escalation discipline' \
  --weaknesses='[{"id":"W-1","summary":"Late websocket reconnect under degraded LTE","subsystemOwner":"Core Runtime","emotionalImpact":"high","operationalRisk":"high","connectedWeaknesses":["W-2"],"rootCauseChain":["late websocket reconnect","stale gps","incorrect eta","airport confusion","moni reassurance trigger","customer anxiety"]}]'
```

## Founder Review Discipline

- Promote only founder-approved refinements.
- Keep Moni Experimental isolated from autonomous production mutation.
- Use score deltas and anomaly recurrence to decide rollout confidence.
- Prioritize simplification wins that improve calmness without reducing operational truth.
