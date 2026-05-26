# LVTP Local Failover Plan

Priority: lvtransport.be must work first.

Primary:
- VPS

Fallback:
- Acer Linux Runtime Node

Fallback requirements:
- Linux powered on
- Network available
- Docker available
- Runtime healthy
- Tunnel or DNS failover configured in future phase

Current status:
- Local runtime operational
- Docker available
- systemd runtime enabled
- health checks available

Future:
- Cloudflare Tunnel
- Automated health probe
- DNS switch plan
- Backup deploy script
