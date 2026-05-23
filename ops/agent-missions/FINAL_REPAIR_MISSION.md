# LV Transport Final Repair Mission

NO crear demos.
NO reemplazar con HTML temporal.
NO tocar runtime-os/public como solución frontend.

Objetivo:
1. Reparar build real de `apps/web`.
2. Reparar tipos rotos en packages/auth y packages/realtime.
3. Usar GitHub main o rama final estable.
4. Compilar frontend real.
5. Servir únicamente en `lvtransport.be`.
6. Mantener backend/API si compila.
7. Entregar reporte técnico en ops/reports/final-repair-report.md.

Comandos obligatorios:
- pnpm install --no-frozen-lockfile
- pnpm --filter @lvtransport/web build
- pnpm --filter @lvtransport/api build
- pm2 status
- sudo nginx -t
- curl -I http://lvtransport.be

Criterio de éxito:
- `lvtransport.be` responde 200
- PM2 online
- build web sin errores
- no demo fallback
