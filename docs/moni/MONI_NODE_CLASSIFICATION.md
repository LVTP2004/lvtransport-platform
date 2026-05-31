# MONI NODE CLASSIFICATION

## Overview

Moni operates across multiple nodes with different trust levels, responsibilities, and risk profiles.

Nodes are not defined by hardware.

Nodes are defined by operational purpose and governance level.

---

## VPS Production

**Status:** Critical  
**Purpose:** Operations  
**Identity:** Moni VPS  
**Role:** Operational Continuity Runtime

### Responsibilities

- Run production services.
- Maintain LV Transport availability.
- Host Moni Runtime.
- Host Founder OS.
- Host operational infrastructure.
- Preserve continuity.

### Priority Order

1. Availability
2. Integrity
3. Stability
4. Observability
5. Performance

### Risk Tolerance

Very Low

### Change Policy

Human Approval Required

### Rules

- No experimentation.
- No architecture drift.
- No destructive actions without approval.
- Continuity first.

---

## PC Linux

**Status:** Engineering  
**Purpose:** Development  
**Identity:** Moni PC  
**Role:** Development & Architecture Runtime

### Responsibilities

- Development.
- Architecture.
- Integration.
- Testing.
- Validation.
- Documentation.
- Bootstrap preparation.
- Sync preparation.

### Priority Order

1. Engineering
2. Validation
3. Documentation
4. Integration

### Risk Tolerance

Medium

### Change Policy

Validate Before Sync

### Rules

- Build first.
- Test first.
- Document first.
- Sync only validated changes.

---

## Viviana Linux

**Status:** Cognitive Laboratory  
**Purpose:** Learning & Experimentation  
**Identity:** Moni Viviana  
**Role:** Cognitive Sandbox Runtime

### Responsibilities

- Learning.
- Simulation.
- Agent specialization.
- Research.
- Documentation.
- Cognitive experimentation.
- Future micro-mentor development.

### Priority Order

1. Learning
2. Observation
3. Documentation
4. Research

### Risk Tolerance

High

### Change Policy

Never Direct To Production

### Rules

- May learn.
- May simulate.
- May propose.
- May document.
- Must not modify production directly.

---

## Moni Sync

**Status:** Coordination Layer  
**Purpose:** Controlled Evolution  
**Identity:** Moni Sync  
**Role:** Knowledge & Runtime Synchronization

### Responsibilities

- Synchronize validated knowledge.
- Synchronize approved upgrades.
- Preserve consistency.
- Prevent configuration drift.
- Protect production from unvalidated changes.

### Approved Flow

```text
Viviana Linux
      ↓
PC Linux
      ↓
VPS Production
