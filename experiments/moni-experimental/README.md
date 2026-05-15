# Moni Experimental — Autonomous Evolution Framework (External Sandbox)

Moni Experimental is an **external, isolated, non-production** AI evolution sandbox.

## Safety Boundary (Hard Rule)

Moni Experimental is not part of the production LV Transport Platform (LVTP) and must never:

- auto-deploy to production
- access production credentials
- read/write production operational databases
- control real bookings or dispatch
- modify production pricing

## Purpose

Moni Experimental is a synthetic operational simulation lab designed to continuously:

- simulate mobility operations
- generate synthetic customer/driver interactions
- evaluate operational reasoning quality
- refine prompt and behavior policies in a sandbox loop
- improve premium hospitality, multilingual behavior, and escalation handling

## Layered Architecture

1. **External Strategic Layer**: Leonidas AI (human-supervised strategic control)
2. **Experimental Evolution Layer**: Moni Experimental Sandbox
3. **Production Operational Layer**: LV Transport Platform

## Phase Model

The framework follows a progressive 9-phase path:

1. Basic simulation core
2. Memory foundation
3. Multi-agent simulation
4. Operational stress testing
5. Premium hospitality evolution
6. Autonomous evaluation engine
7. Controlled self-refinement loops
8. Strategic operational reasoning
9. Leonidas-class conceptual target (non-AGI, sandboxed)

## Runtime Loop

Each scheduled cycle executes:

1. Scenario generation
2. Persona generation
3. Pressure injection
4. Response generation
5. Scoring/evaluation
6. Memory logging
7. Prompt/policy refinement (guardrailed)
8. Next cycle

## Suggested Modular Components

- `scenario-engine`
- `persona-engine`
- `conversation-engine`
- `evaluation-engine`
- `memory-engine`
- `refinement-engine`
- `scheduler`
- `dashboard`
- `safety-guardrails`

## Initial Data Model (Concept)

```ts
interface SimulationCycleResult {
  cycleId: string;
  timestamp: string;
  language: 'nl' | 'en' | 'es' | 'fr';
  scenarioType: string;
  pressureEvents: string[];
  response: string;
  scores: {
    responseQuality: number;
    operationalAccuracy: number;
    emotionalTone: number;
    premiumHospitality: number;
    multilingualConsistency: number;
    dispatchCoherence: number;
    escalationHandling: number;
    vipBehavior: number;
    reassurance: number;
    bookingGuidance: number;
  };
  aggregateScore: number;
  memoryTags: string[];
  failures: string[];
  refinementsApplied: string[];
}
```

## Example Scheduler Policy

- every 5 minutes:
  - generate scenario
  - run simulated interaction
  - score result
  - store memory
  - apply bounded refinement

## Guardrails for Autonomous Evolution

- enforce no-production network target list
- enforce no secret retrieval policies
- enforce no outbound writes to production systems
- require explicit allowlist for integrations
- log all policy mutations for auditability
- support emergency global stop switch

## Dutch-First Multilingual Priority

Supported simulation languages:

- Dutch (priority)
- English
- Spanish
- French

## Dashboard Metrics

- total simulation cycles
- phase progression state
- average score by category
- multilingual performance trends
- incident/failure patterns
- memory growth over time
- operational maturity index

## Implementation Note

This README defines architecture and constraints only. Integrations with production LVTP systems remain forbidden unless a separate controlled interface is explicitly approved and sandbox-safe.


## MATRIX DIVERGENT LAB Extension

The MATRIX DIVERGENT LAB protocol is defined in:

- `matrix-divergent-lab.protocol.md`
- `matrix-divergent-lab.config.json`

This extension adds structured divergence simulation, weakness-chain intelligence, multi-branch response testing, emotional signal analysis, and founder-governed promotion gates while preserving strict production isolation.
