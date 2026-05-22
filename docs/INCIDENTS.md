# LVTransport — Incident Memory

---

# Incident 001
## PostgreSQL Restart Loop

### Problem
PostgreSQL container entered restart loop after Docker image upgrade.

### Root Cause
Database files were created under older PostgreSQL version and became incompatible with PostgreSQL 18 image.

### Symptoms
- container restart loop
- WAL incompatibility
- cluster version mismatch

### Resolution
- removed broken container
- removed incompatible volume
- recreated PostgreSQL 17 cleanly

### Prevention
- version pinning
- backup strategy
- migration validation before upgrades

---

# Incident 002
## Prometheus UNKNOWN Targets

### Problem
Prometheus targets stayed UNKNOWN.

### Root Cause
Docker networking and hostname resolution mismatch.

### Resolution
- created monitoring Docker network
- attached containers
- recreated Prometheus on monitoring network
- switched scrape targets to container names

### Prevention
- use shared Docker networks
- use internal container DNS
- avoid mixed localhost/public-IP scraping

---

# Incident 003
## Codex Architectural Drift

### Problem
Codex started improvising UX, architecture and operational concepts.

### Root Cause
Lack of centralized AI guardrails and operational memory.

### Resolution
- created AI guardrails
- consolidated operational philosophy
- documented founder-approved UX
- created operational memory system

### Prevention
- maintain docs/
- require scope confirmations
- preserve operational honesty
