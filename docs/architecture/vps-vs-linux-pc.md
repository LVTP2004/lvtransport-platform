# LVTP Architecture Separation: VPS vs Linux PC

## VPS — Founder OS / Production Layer

Public node:
- 51.222.107.59
- Dashboard: http://51.222.107.59:3005

Role:
- Main operational platform
- Founder OS
- Executive overview
- Governance
- Replay & lineage
- Incident intelligence
- MONI Assistant Core

## Linux PC — Cognitive Runtime Laboratory

Local node:
- acer-linux
- Local IP: 192.168.241.149
- Dashboard: http://192.168.241.149:4010

Role:
- Pre-production runtime cognition
- NATS event bus
- PostgreSQL event store
- Redis runtime state
- Moni Core service
- Semantic engine
- Risk engine
- Incident engine
- Recovery workflow engine

## GitHub Synchronization Rule

Linux PC is for build, test, validation, and pre-production.

VPS receives only stable, committed, pushed, and reviewed changes.

Flow:

Linux PC → GitHub → VPS

## Critical Boundary

Future agents must identify the node before executing actions.

Required check:

```bash
hostname
pwd
git branch --show-current
docker ps
systemctl --user --type=service --state=running | grep lvtp || true
EOF 
OEF
cat <<'EOF'
