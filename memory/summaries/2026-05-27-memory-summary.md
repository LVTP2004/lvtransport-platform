

# Moni Memory Summary — 2026-05-27T17:00:53.203906+00:00

1) Estado operacional actual
- Nodo: leonardovargas-Aspire-E1-470P — Linux operativo, estructura LVTP preparada.  
- Servicios: MONI está arrancando continuamente (flapping), MONI_LOOP y (últimamente) MONI_EVENT_WORKER y MONI_WATCHDOG aparecen online bajo PM2.  
- Indexado: conteo de archivos indexados estable en 11 (volumen bajo).  
- Almacenamiento: disco raíz ~58G total, 43G usados → 78% ocupado (∼13G libres).  
- Conectividad/externos: sincronización con VPS (linux_vps) OK; offload de storage completado OK; OpenAI API operativa.

2) Eventos importantes (resumen)
- Reiteradas arranques/caídas de MONI: múltiples eventos MONI_DAEMON_START y MONI_ANALYSIS_COMPLETE entre 16:53–17:00 UTC.  
- Watchdog reporta reinicios altos y en ascenso: 163 (16:53) → 196 (17:00).  
- Informes Moni repetidos indicando sólo 11 ficheros indexados (16:57 → 17:00).  
- Storage offload finalizado correctamente a 2026-05-27T16:38:42Z.  
- Ciclos de cognición MONI_LOOP OK en 16:41, 16:46, 16:51, 16:57.

3) Errores detectados / anomalías
- Flapping de MONI: reinicios muy frecuentes (>=160 y subiendo), uptime muy corto; en al menos una observación MONI consumió 100% CPU. Riesgo de interrupciones en el procesamiento.  
- MONI_EVENT_WORKER estuvo citado como "errored" en análisis previo (posible impacto en colas/eventos).  
- Indexación baja: sólo 11 archivos indexados — volumen inusualmente bajo si se esperaba mayor ingesta.  
- Disco al 78% — riesgo de llenado si aumentan logs o backlog.

4) Acciones realizadas (observadas)
- Informes Moni periódicos (análisis e indexado) generados y registrados.  
- Storage offload a /home/.../from-vps completado OK (16:38:42Z).  
- Sincronización remota con VPS confirmada (16:03:23Z).  
- PM2 y procesos MONI han estado siendo reiniciados automáticamente (evidencia: eventos MONI_DAEMON_START y WATCHDOG).

5) Riesgos
- Alto: pérdida/retardo en procesamiento de eventos y búsquedas por flapping de MONI y/o caída del worker.  
- Alto/Medio: índice incompleto (11 ficheros) produce búsquedas/alertas inexactas y posible pérdida de visibilidad.  
- Medio: si los reinicios generan mucho logging, el disco (78%) puede llenarse y producir errores de escritura o fallos en servicios.  
- Medio/Bajo: consumo CPU extremo en MONI puede degradar toda la máquina.

6) Próximos pasos recomendados (prioridad y comandos sugeridos)
Prioridad alta — actuación inmediata:
- Recolectar logs y diagnosticar MONI:
  - pm2 logs MONI --lines 200
  - pm2 logs MONI_EVENT_WORKER --lines 200
  - journalctl -u <servicio-si-aplica> --no-pager -n 200
  - si MONI tiene PID problemático: top -H -p <PID> o strace/ps aux para hilos intensivos.
- Contener: si no hay diagnóstico inmediato, capturar logs y reiniciar con:
  - pm2 restart MONI
  - pm2 restart MONI_EVENT_WORKER
- Liberar/rotar espacio en disco (bajar por debajo ~75%):
  - du -sh ~/LVTP/* ; limpiar logs antiguos
  - sudo journalctl --vacuum-size=200M
- Investigar indexación baja:
  - Revisar state/servicio del indexador (p. ej. systemctl status <indexer> o logs en /var/log/lvtp/)
  - Forzar reindexación o re-scan; monitorizar files_indexed por 10–30 min.
- Si persiste el flapping o hay excepciones del código: capturar traces (stack/trace), empaquetar logs y escalar al equipo de desarrollo/infrastr.

Comandos útiles rápidos:
- pm2 status; pm2 logs MONI --lines 200
- ps aux | grep MONI ; top -p <PID>
- df -h
- du -sh ~/LVTP/* | sort -h
- sudo journalctl --vacuum-size=200M

7) Timeline breve (títulos y marcas principales)
- 2026-05-27T16:03:23Z — Sync linux_vps OK.  
- 2026-05-27T16:38:42Z — STORAGE_OFFLOAD completado OK (desde 51.222.107.59).  
- 16:41:32–16:57:12 UTC — Ciclos de cognición MONI_LOOP reportan estado OK (16:41, 16:46, 16:51, 16:57).  
- 16:53:21 → 17:00:24 UTC — WATCHDOG informa reinicios MONI en ascenso: 163 → 196 (incremento constante minuto a minuto).  
- 16:53–17:00 UTC — Repetidos MONI_DAEMON_START y MONI_ANALYSIS_COMPLETE; files_indexed sube de 10 a 11, pero se mantiene muy bajo.  
- 17:00:29.216596+00:00 — timestamp de contexto actual.

Resumen ejecutivo (1 frase)
- Estado crítico-moderado: MONI está en flapping (reinicios frecuentes y picos de CPU) con indexación anormalmente baja y disco en 78% — requiere diagnóstico inmediato (logs/contención) y limpieza de espacio; luego reindexado y, si procede, escalado.
