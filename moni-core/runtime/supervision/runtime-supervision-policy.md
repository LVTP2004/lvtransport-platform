# LVTP Runtime Supervision Policy

Priority:
lvtransport.be must work first.

Runtime supervision rules:
- Runtime health must be observable.
- Web runtime must respond on port 5173.
- systemd must restart runtime when it fails.
- Docker runtime must remain available.
- Heartbeats must be appendable and auditable.
- No runtime mutation without approval.
- No architecture redesign during runtime recovery.
