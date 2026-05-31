#!/bin/bash
set -e

ROOT="$HOME/lvtransport-platform"
DATA="$ROOT/LVTP-DATA"
CANON="$DATA/CANONICAL"
DOCS="$ROOT/docs"
FOUNDER_DOCS="$DOCS/founder"
MONI_DOCS="$DOCS/moni"
OUT="$CANON/START_HERE.md"

cd "$ROOT"

mkdir -p \
  "$CANON" \
  "$FOUNDER_DOCS" \
  "$MONI_DOCS" \
  "$DATA/LIBRARY" \
  "$DATA/COLD_STORAGE" \
  "$DATA/MEMORY/founder" \
  "$DATA/MEMORY/moni"

cat > "$CANON/MONI_DEFINITION_V1.md" << 'MD'
# MONI DEFINITION V1

Status: APPROVED  
Author: Leonardo Vargas  
Category: Governance  

Moni is not a chatbot.  
Moni is not an assistant.  
Moni is not a single application.  

Moni is the Intelligent Nervous System of LVTP.

Moni observes.  
Moni remembers.  
Moni classifies.  
Moni synchronizes.  
Moni provides context.  

Founder governs.  
Leonardo decides.  
Systems execute.  
Moni ensures that knowledge survives.

## Canonical Authority Hierarchy

Leonardo Vargas  
↓  
Founder OS  
↓  
Moni  
↓  
Operational Systems

Leonardo decides.  
Founder governs.  
Moni informs.  
Systems execute.
MD

cp "$CANON/MONI_DEFINITION_V1.md" "$MONI_DOCS/MONI_DEFINITION_V1.md"

cat > "$OUT" << 'MD'
# LVTP CANONICAL START HERE

Status: ACTIVE  
Source Of Truth: LVTP-DATA + GitHub  
Primary Node: PC Linux  
Production Node: VPS  
Isolated Lab Node: Viviana Linux  

## Current Truth

LVTP is in Founder-Controlled Preproduction.

Public commercial production is not active yet.

Target operational readiness: October 2026.

## Canonical Documents

- FOUNDER_OS_CONSTITUTION.md
- MONI_DEFINITION_V1.md

## Public Surfaces

- LV Ride
- LV Driver
- LV Control Tower

## Private Surfaces

- Founder OS
- Moni Core
- Business Intelligence
- Governance
- Memory
- Approvals
- Strategy

## Runtime Nodes

### VPS Production

Source of operational runtime truth.

### PC Linux

Primary development, library and integration node.

### Viviana Linux

Isolated cognitive laboratory.

## Memory Layers

### Founder Memory

Vision, decisions, priorities and strategy.

### Moni Memory

Operational context, classifications, summaries and knowledge.

### Cold Storage

Prompts, PRs, audits, reports and historical evidence.

## Rules

- Founder OS is private.
- Founder OS is not Admin.
- Moni is not Founder.
- Moni informs.
- Founder governs.
- Leonardo decides.
- GitHub stores synchronized canonical source.
- LVTP-DATA stores local canonical library.
MD

cat > "$CANON/SOURCE_OF_TRUTH_POLICY.md" << 'MD'
# SOURCE OF TRUTH POLICY

Status: ACTIVE

## Canonical Source

LVTP-DATA is the canonical local knowledge library.

GitHub is the synchronized development source of truth.

## Runtime Source

VPS is the operational runtime source of truth.

## Cognitive Lab

Viviana Linux is isolated and may analyze, simulate and propose.

Viviana Linux must not mutate production.

## Sync Direction

VPS evidence flows toward PC Linux.

PC Linux validates and prepares stable changes.

GitHub stores reviewed canonical changes.

Production receives only stable approved changes.

## Founder Rule

Founder approval is required for production execution.

END
MD

cp "$CANON/SOURCE_OF_TRUTH_POLICY.md" "$DOCS/SOURCE_OF_TRUTH_POLICY.md"

echo "=== CANONICAL LIBRARY CREATED ==="
find "$CANON" -maxdepth 1 -type f | sort

echo ""
echo "=== GIT STATUS ==="
git status --short

echo ""
echo "=== READY TO COMMIT ==="
