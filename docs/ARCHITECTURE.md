# LVTransport — Architecture

## Infrastructure Stack

### VPS Layer
- Ubuntu 25.04
- Docker
- nginx
- PM2

---

# AI Layer

## Ollama
Local LLM inference.

## OpenWebUI
Operational AI interface.

---

# Data Layer

## PostgreSQL
Transactional persistence.

## Redis
Cache, sessions, queues.

## Qdrant
Vector memory and embeddings.

---

# Observability Layer

## Prometheus
Metrics collection.

## Grafana
Visualization and operational dashboards.

## Node Exporter
System metrics.

## cAdvisor
Docker/container metrics.

## Uptime Kuma
Availability monitoring.

---

# Core Operational Domains

- booking lifecycle
- dispatch orchestration
- operational memory
- recovery tooling
- tracking
- notifications
- payments
- audit history

---

# Architectural Philosophy

Infrastructure is operational product infrastructure.

Observability is mandatory.

Operational continuity is mandatory.

Persistence integrity is mandatory.
