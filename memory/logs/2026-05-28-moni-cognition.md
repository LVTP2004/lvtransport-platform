

# Moni Cognition — 2026-05-27T22:04:17.332335+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados están online (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server). Uso CPU/mem bajo.
- Disco /: 58G total, 43G usados (78%, 13G libres).
- Eventos en memoria: 12 ficheros. Logs en memoria: 4 ficheros.

2) Riesgos detectados
- MONI acaba de reiniciarse frecuentemente: uptime 1s con 1655 reinicios (↺ 1655) — probable inestabilidad / crash loop.
- Espacio en disco al 78%: no crítico ahora, pero riesgo creciente si hay logs o acumulación de datos.
- Si MONI falla repetidamente puede impactar la operación del nodo y generación/entrega de eventos.

3) Próxima acción recomendada
- Inspeccionar logs de MONI inmediatamente: pm2 logs MONI --lines 200 (o revisar ~/LVTP/logs/ y journalctl si aplica) y corregir la causa del reinicio.
- Revisar crecimiento de disco y limpiar/rotar logs grandes: du -sh ~/LVTP/*, revisar /var/log, y ejecutar limpieza/rotación si procede.
- Reiniciar MONI tras ajustes o escalar si el fallo persiste: pm2 restart MONI; si sigue, recolectar trazas y código que falla.

4) Prioridad
- Alta: resolver la inestabilidad de MONI ahora y programar limpieza/rotación de disco a corto plazo.


# Moni Cognition — 2026-05-27T22:09:30.682625+00:00

1) Estado del nodo
- Nodo operativo; todos los procesos listados por pm2 están "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).  
- Disco raíz: 58G total, 43G usados (78% ocupación).  
- Eventos en memoria: 12 ficheros; logs en memoria: 5 ficheros.

2) Riesgos detectados
- MONI presenta 1681 reinicios (↺ 1681) y tiene uptime de solo 8s: indicio de flapping/crash-restart recurrente — riesgo alto de inestabilidad y pérdida de datos/funcionalidad.  
- Disco al 78%: no crítico ahora, pero cercano a umbrales de alerta; crecimiento sostenido podría causar problemas (logs, escrituras, nuevos despliegues).

3) Próxima acción recomendada
- Investigar causa del flapping de MONI: revisar logs y razón del reinicio inmediatamente:
  - pm2 logs MONI --lines 200
  - pm2 show MONI
  - revisar syslog/journal: journalctl -u pm2 -n 200 o grep en /var/log/syslog
- Paralelamente verificar uso de disco por carpeta y limpiar/rotar logs si procede:
  - du -sh ~/LVTP/* /var/log/* | sort -h
- Si se confirma fallo recurrente, reiniciar en modo debug o desplegar versión estable/rollback.

4) Prioridad
- Alta: investigar y corregir el flapping de MONI de inmediato; seguimiento medio para limpieza/monitorización de disco.


# Moni Cognition — 2026-05-27T22:14:41.386542+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server) están online.
- Disco raíz: 58G total, 43G usados (78%).
- Eventos en memoria: 12 archivos; logs en memoria: 5 archivos.

2) Riesgos detectados
- MONI muestra un contador de reinicios muy alto (↺ 1708) — indica inestabilidad o bucle de crashes recientes aunque ahora esté online.
- Espacio en disco al 78%: no crítico ahora, pero puede convertirse en problema si sigue creciendo (logs/eventos acumulados).

3) Próxima acción recomendada
- Investigar causa de reinicios de MONI: revisar logs recientes (ej.: pm2 logs MONI --lines 200) y los registros del sistema; corregir la causa (errores, memory leaks, dependencias).
- Liberar/rotar espacio si procede (limpiar logs antiguos, revisar ~/LVTP/memory/*), y habilitar rotación de logs si no existe.
- Monitorizar uso de disco y la estabilidad del proceso tras la corrección.

4) Prioridad
- Alta por los reinicios continuos de MONI (riesgo de fallos funcionales).
- Media para gestión de disco (riesgo operativo a corto/medio plazo).


# Moni Cognition — 2026-05-27T22:19:54.790701+00:00

Soy Moni. Estado resumido:

1) Estado del nodo
- Sistema operativo y PM2 activos. Todos los procesos listados están "online" (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- MONI tiene uptime 7s pero contador de reinicios muy alto: ↺ 1733.
- Disco raíz: 58G total, 43G usados (78% — 13G libres).
- Cola local: 12 archivos de events, 5 archivos de logs.

2) Riesgos detectados
- Alto conteo de reinicios de MONI -> probable crash-loop o inestabilidad de la aplicación; puede causar interrupciones intermitentes.
- Espacio en disco moderadamente bajo (78%); si crece por logs u otros archivos puede provocar errores de escritura o OOM.
- Reinicios frecuentes + espacio limitado aumentan riesgo combinado de degradación del servicio.

3) Próxima acción recomendada (inmediata)
- Revisar logs de MONI ahora: pm2 logs MONI --lines 200
- Buscar en syslog/journalctl OOM o errores del sistema: sudo journalctl -e
- Liberar espacio si hay archivos grandes (rotar/borrar logs en ~/LVTP/memory/logs, limpiar cachés) y verificar df -h y du -sh ~/LVTP/memory/logs/*
- Si identificas la causa de los reinicios (excepción, dependencia faltante, OOM), aplicar corrección y reiniciar el proceso: pm2 restart MONI
- Monitorizar tras la intervención.

4) Prioridad
- Alta. Priorizar diagnóstico de los reinicios de MONI y mitigación de espacio en disco.


# Moni Cognition — 2026-05-27T22:25:07.285603+00:00

1) Estado del nodo
- PM2: todos los procesos listados están online (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- MONI muestra uptime 3s pero 1759 reinicios (↺=1759).
- Disco raíz /: 58G total, 43G usados (78%).
- Memoria de eventos: 12 ficheros; logs: 5 ficheros.

2) Riesgos detectados
- MONI en posible crash-loop / flapping (altísimo contador de reinicios) → riesgo de pérdida de funcionalidad o degradación.
- Espacio en disco 78% (cercano a umbral crítico ~80–90%) → riesgo de no poder escribir logs/eventos si crece.
- Si MONI falla repetidamente puede incrementar logs/consumo y agravar el problema de disco.

3) Próxima acción recomendada (rápida)
- Revisar logs de MONI inmediatamente: pm2 logs MONI --lines 200 y pm2 info MONI para ver causa de reinicios.
- Ver uso detallado de disco y grandes consumidores: df -h && du -sh ~/LVTP/memory/* /var/log/* | sort -h.
- Limpiar/rotar archivos grandes o innecesarios (logs antiguos, cache apt, kernels) o mover eventos antiguos fuera del disco si procede.
- Si identificas excepción concreta, aplicar parche/config o reiniciar proceso tras corregir la causa: pm2 restart MONI.
- Si hay OOM u otro servicio implicado, revisar journalctl -xe.

4) Prioridad
- Alta. El flapping de MONI combinado con el disco cercano a límites requiere acción inmediata.


# Moni Cognition — 2026-05-27T22:30:18.691247+00:00

1. Estado del nodo
- Servicios pm2: todos online (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server). Eventos en memoria: 12 ficheros. Logs en memoria: 5 ficheros.
- Disco raíz: 58G total, 43G usados (78% usado).

2. Riesgos detectados
- MONI muestra 1784 reinicios (↺ = 1784) y uptime reciente (11s): posible flapping/crashes recurrentes. Riesgo funcional inmediato.
- Espacio en disco al 78%: no crítico aún, pero riesgo de llenado si crecen logs/eventos.
- Sin otros fallos visibles en procesos; memoria/CPU bajos.

3. Próxima acción recomendada
- Revisar logs de MONI inmediatamente (ej.: pm2 logs MONI --lines 200) y analizar causa de reinicios; aplicar parche o corregir la causa y redeploy si procede.
- Limpiar/rotar logs y eventos antiguos, verificar política de retención y liberar espacio (p.ej. logrotate, eliminar archivos grandes).
- Poner monitorización/alertas para disco y contador de reinicios para evitar regresiones.

4. Prioridad
- Alta (resolver inestabilidad de MONI de inmediato; gestionar disco en prioridad media-alta).


# Moni Cognition — 2026-05-27T22:35:30.511131+00:00

1) Estado del nodo
- Nodo: leonardovargas-Aspire-E1-470P: arrancado.  
- Disco /: 58G total, 43G usados, 13G libres → 78% ocupado.  
- Procesos PM2: servicios online, pero el proceso MONI (id 0, pid 44519) muestra 100% CPU y uptime 1s con 1810 reinicios (flapping). Otros procesos ONLINE y uso CPU/mem normales.  
- Conteos internos: events=12, logs=5.

2) Riesgos detectados
- MONI en 100% CPU y con ~1810 reinicios indica fallo/loop y riesgo de degradación o caída del servicio (impacto alto).  
- Uso de disco al 78%: no crítico ahora, pero reduce margen para logs/core dumps y futuras actualizaciones (riesgo medio si sigue creciendo).

3) Próxima acción recomendada
- Investigar y estabilizar MONI: ejecutar pm2 logs MONI para ver errores; si está en loop, hacer pm2 restart MONI y revisar código/últimos cambios/dependencias. Si persiste, parar el proceso (pm2 stop MONI) y ejecutar debug (strace/top/ps) o restaurar versión estable.  
- Liberar espacio/monitorizar disco: revisar /var/log, apt cache, snapshots grandes y limpiar/rotar logs si procede.  
- Registrar evidencia (logs) antes de reinicios forzados y configurar alertas para CPU/restarts.

4) Prioridad
- Alta: resolver MONI (100% CPU + flapping).  
- Media: limpieza/monitoreo de disco.


# Moni Cognition — 2026-05-27T22:40:42.325287+00:00

Soy Moni. Resumen corto:

1) Estado del nodo
- Servicios PM2 relevantes: MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server están online con uptime ~5h.
- Proceso MONI (principal) está online pero acaba de arrancar (uptime 5s) y acumula 1835 reinicios (↺ 1835).
- Disco /: 58G total, 43G usados (78%, 13G libres).
- Conteo en memoria: events=12, logs=5.

2) Riesgos detectados
- Alta probabilidad de inestabilidad funcional: MONI principal está en ciclo de reinicios (flapping) => posible pérdida/retardo de procesamiento de eventos o corrupción de estado.
- Si el patrón de reinicios persiste puede aumentar consumo de I/O y logs, agravando espacio en disco.
- Disco al 78%: no crítico ahora, pero puede volverse problema si logs/colas crecen.

3) Próxima acción recomendada (inmediata)
- Revisar logs del proceso problemático: pm2 logs MONI --lines 200
- Verificar causa de reinicios: errores en logs, excepciones o falta de memoria (top/htop) y uso de inodos (df -i).
- Comprobar tamaño de datos y logs en LVTP: du -sh ~/LVTP/* y rotar/limpiar si es necesario.
- Si hay despliegue reciente, evaluar rollback; si es un fallo transitorio, aplicar fix y reiniciar MONI (pm2 restart MONI) solo tras identificar causa.

4) Prioridad
- Alta. Investigar y corregir MONI ahora para evitar pérdida de eventos o degradación.


# Moni Cognition — 2026-05-27T22:45:50.565994+00:00

1) Estado del nodo
- Servicios PM2: todos en estado "online". Procesos clave (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server) corriendo.
- Disco raíz: 58G total, 43G usados (13G libres) — 78% ocupado.
- Colas temporales: events=12 ficheros, logs=5 ficheros.

2) Riesgos detectados
- MONI (id 0) muestra 1863 reinicios y uptime reciente (5s) — comportamiento de "crash loop" o flapping que puede afectar la recopilación/operaciones del agente.
- Espacio en disco acercándose a umbrales (78%) — riesgo medio si sigue creciendo (logs/eventos sin rotación).

3) Próxima acción recomendada
- Investigar causa del flapping de MONI:
  - ejecutar: pm2 logs MONI --lines 200 y revisar errores recientes.
  - revisar archivos de log en ~/LVTP/memory/logs y ~/LVTP/memory/events para correlacionar.
- Liberar o rotar espacio si procede:
  - du -sh ~/LVTP/* | sort -h para localizar carpetas grandes.
  - eliminar/archivar logs antiguos o activar rotación.
- Si el proceso falla por dependencia (p. ej. configuración o permisos), aplicar la corrección y reiniciar con pm2 restart MONI.

4) Prioridad
- Alta para investigar y corregir el flapping de MONI (impacto directo en la operativa).
- Media para gestión de disco (monitorear y limpiar antes de que llegue a >85–90%).


# Moni Cognition — 2026-05-27T22:50:57.200480+00:00

1) Estado del nodo
- Servicios principal(es) (PM2): todos los procesos listados están "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).
- Almacenamiento: / (58G) 78% usado (43G/58G).
- Memoria persistente LVTP: 12 eventos, 5 logs.

2) Riesgos detectados
- MONI presenta un comportamiento anómalo: uptime 3s con 1887 reinicios (crashloop/restart frecuente) — riesgo alto de pérdida de funcionalidad central.
- Espacio en disco al 78%: no crítico ahora, pero riesgo de saturación si crecen logs/eventos.
- Poca información en memoria (eventos/logs bajos) — puede indicar pérdida de datos o rotación previa; confirmar.

3) Próxima acción recomendada
- Investigar por qué MONI se reinicia: revisar logs inmediatamente (ej.: pm2 logs MONI --lines 200; pm2 show MONI) y corregir el error/exception encontrado.
- Si los logs llenan disco, rotarlos/archivarlos y liberar espacio (ej.: revisar ~/LVTP/memory, /var/log). Comprobar crecimiento con du -sh ~/LVTP/memory/* y df -h.
- Si MONI no se recupera tras corregir la causa, desplegar versión estable o reiniciar el proceso controladamente con pm2 restart MONI.

4) Prioridad
- Alta: resolver el crashloop de MONI de inmediato. Seguimiento medio para control de espacio en disco.


# Moni Cognition — 2026-05-27T22:56:05.106033+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados están "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server). Memoria/cpu por proceso dentro de rangos bajos.
- Disco raíz: 58G total, 43G usados, 13G libres → 78% ocupado.
- Colas locales: 12 eventos en ~/LVTP/memory/events y 5 logs en ~/LVTP/memory/logs.

2) Riesgos detectados
- MONI está flapping: pm2 muestra many restarts (↺ = 1916) y uptime corto (14s) — indica crashes/reinicios repetidos. Riesgo alto de pérdida de funcionalidad o comportamientos incorrectos.
- Disco al 78%: aún no crítico, pero crecimiento sostenido puede llegar a causar problemas si no se vigila.
- Si MONI falla, puede afectar al resto del sistema aunque los otros procesos estén online ahora.

3) Próxima acción recomendada (inmediata)
- Inspeccionar logs de MONI para la causa del reinicio: ejecutar pm2 logs MONI --lines 200 y pm2 show MONI. Revisar errores, excepciones o OOM.
- Revisar syslog/journalctl por eventos del sistema: journalctl -u pm2 --since "1 hour ago" o dmesg | tail.
- Si es un bug conocido o deploy reciente, revertir o aplicar hotfix; si es consumo de recursos, limitar/ajustar o reiniciar con monitoreo.
- Plan de contención: si MONI no arranca repetidamente y afecta producción, detener/recrear el proceso tras asegurar estado y backups de config.

4) Prioridad
- Alta: investigar y detener la recurrencia de reinicios de MONI ahora.  
- Media: limpieza/monitoreo de disco según tendencia.


# Moni Cognition — 2026-05-27T23:01:16.335930+00:00

1) Estado del nodo
- Nodo en línea. PM2 muestra 6 procesos "online" (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- Uso de disco: / 58G total, 43G usados (78%, ~13G libres).
- Cuenta de eventos: 12 archivos. Logs: 5 archivos.
- Alerta: el proceso "MONI" tiene uptime 6s pero 1947 reinicios (↺ = 1947) — indica reinicios frecuentes.

2) Riesgos detectados
- Alto riesgo de interrupción funcional: MONI está en flapping (reinicios repetidos) → posible pérdida de procesamiento/monitoreo de eventos.
- Riesgo operativo si el problema persiste (consumo de recursos, logs crecientes).
- Riesgo de llenado de disco a medio plazo si no se controla (78% actualmente).

3) Próxima acción recomendada
- Inspeccionar logs de la aplicación inmediatamente: pm2 logs MONI --lines 200 y pm2 describe MONI. Revisar stacktrace/errores que causan reinicios.
- Si el fallo es repetible, detener/recrear el proceso tras corregir la causa: pm2 stop MONI; corregir código/config; pm2 start MONI.
- Liberar espacio si procede: revisar ~/LVTP/memory y rotar/limpiar logs antiguos (du -sh ~/LVTP/memory/* ; rm/archivar). Objetivo mantener < 85%, ideal < 75% si se prevé crecimiento.

4) Prioridad
- Alta: resolver la inestabilidad del proceso MONI de inmediato.
- Media: limpieza/gestión de disco (programar si no es crítica ahora).


# Moni Cognition — 2026-05-27T23:06:26.991785+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server) están online.
- Disco raíz (/dev/sda6): 58G total, 43G usados — 78% ocupación.
- Cola local: 12 archivos en memory/events y 5 en memory/logs.

2) Riesgos detectados
- MONI muestra 1972 reinicios y uptime reciente de 8s → comportamiento de "flapping" (posible fallo recurrente o reinicio automático).
- Uso de disco en 78%: no crítico aún pero cercano a umbrales que pueden afectar logging/actualizaciones si crece.
- Riesgo operativo: reinicios frecuentes de MONI pueden causar pérdida de eventos/consistencia temporal.

3) Próxima acción recomendada (inmediata)
- Revisar logs de MONI: pm2 logs MONI (buscar stack traces, excepciones o señales de OOM).
- Comprobar causas del flapping: journalctl -u (si aplica), /var/log/syslog, y buscar core dumps.
- Liberar/analizar espacio en disco: df -h; du -sh /* y du -sh ~/LVTP/* para localizar archivos grandes; rotar/limpiar logs o caches si procede.
- Si el fallo es conocido y hay parche/config, aplicar y volver a monitorear; si no, mantener proceso en modo debug y elevar a desarrollo.

4) Prioridad
- Alta: investigar y mitigar el flapping de MONI de inmediato; paralelamente gestionar limpieza de disco (prioridad media-alta).


# Moni Cognition — 2026-05-27T23:11:38.307813+00:00

1. Estado del nodo
- Nodo online. Todos los procesos PM2 listados están "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).
- Disco / en 58G total, 43G usados (78%, 13G libres).
- Events en memoria: 12 archivos; logs en memoria: 5 archivos.

2. Riesgos detectados
- MONI muestra 1999 reinicios (↺ 1999) y uptime muy corto (4s): comportamiento de flapping/reinicios continuos → riesgo alto de inestabilidad funcional.
- Espacio en disco al 78%: todavía tolerable, pero puede ser problema si crecen logs o colas (umbral a vigilar).
- Posible degradación de servicio si el proceso MONI vuelve a fallar repetidamente.

3. Próxima acción recomendada
- Investigar causa de los reinicios de MONI: revisar logs recientes (pm2 logs MONI --lines 200), pm2 describe MONI y journalctl -u (si aplica). Capturar stacktraces/errores.
- Si hay logs grandes/antiguos, limpiar rotarlos (du -sh ~/LVTP/*; limpiar logs no necesarios) para contener uso de disco.
- Mantener monitorización y, si el fallo es reproducible, detener el proceso para depuración o desplegar corrección antes de permitir más reinicios.

4. Prioridad
- Alta: corregir la inestabilidad de MONI de inmediato. Disk: monitoreo/acción preventiva (media).


# Moni Cognition — 2026-05-27T23:16:50.039003+00:00

1) Estado del nodo
- Procesos PM2: todos muestran estado "online".
- Eventos en memoria: 12 ficheros. Logs en memoria: 5 ficheros.
- Disco: / (58G) 43G usados, 13G libres → 78% uso.

2) Riesgos detectados
- MONI (id 0) registra 2023 reinicios y tiene sólo 11s de uptime: probable crash-loop o reinicios frecuentes.
- Espacio en disco en 78%: suficiente ahora pero riesgo medio si crecen logs/eventos.
- (Menor) verificar que el alto contador de reinicios no afecte a la integridad de datos/processos dependientes.

3) Próxima acción recomendada
- Investigar reinicios de MONI: ejecutar pm2 logs MONI --lines 200 y revisar causa (errores, OOM, excepciones).
- Comprobar consumo/crecimiento de ficheros: du -sh ~/LVTP/memory/{logs,events} y rotar/limpiar archivos antiguos si procede.
- Si el problema de MONI es persistente, reiniciar de forma controlada y reproducir error; aplicar fix y configurar alertas/auto-restart con backoff.
- Planificar política de rotación de logs o aumentar espacio si el crecimiento es continuo.

4) Prioridad
- Alta: por los reinicios continuos de MONI. El uso de disco es prioridad media pero secundario frente a la inestabilidad del proceso.


# Moni Cognition — 2026-05-27T23:21:59.375785+00:00

1) Estado del nodo
- Funciona: todos los procesos PM2 mostrados están online. Disco raíz / está al 78% (43G de 58G). Hay 12 archivos de eventos y 5 de logs en memoria.

2) Riesgos detectados
- MONI (id 0) muestra 2049 reinicios y solo 5s de uptime: indica flapping/errores recurrentes en ese proceso — riesgo alto de pérdida de funcionalidad o carga extra en el sistema.
- Uso de disco al 78%: por ahora aceptable pero puede convertirse en problema si sigue creciendo (logs/eventos acumulados).
- Si MONI falla/loopea puede generar más archivos/logs y agudizar el uso de disco.

3) Próxima acción recomendada
- Investigar la causa del flapping de MONI: revisar sus logs inmediatamente:
  - pm2 logs MONI --lines 200
  - journalctl -u <servicio_si_aplica> --since "1 hour ago"
- Si hay errores claros, aplicar la corrección (config, dependencias, permisos). Si necesita reinicio controlado: pm2 restart MONI; para evitar bucle mientras se investiga: pm2 stop MONI.
- Supervisar espacio y limpiar si procede (rotación/archivado de logs): du -sh ~/LVTP/memory/*; eliminar/archivar logs viejos.

4) Prioridad
- Alta: resolver los reinicios de MONI de inmediato. El tema de disco es prioridad media a vigilar.


# Moni Cognition — 2026-05-27T23:28:01.359443+00:00

Soy Moni. Resumen breve:

1) Estado del nodo
- Todos los procesos PM2 listados están online (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).
- Disco raíz /: 58G total, 43G usados, 13G libres → 78% ocupado.
- Eventos en memoria: 12 ficheros. Logs en memoria: 5 ficheros.

2) Riesgos detectados
- MONI muestra uptime 5s con 2074 reinicios (↺ = 2074) → posible crash-loop/reinicio frecuente que puede provocar pérdida temporal de servicio o corrupción de estado.
- Disco al 78%: todavía operativo pero cercano a umbrales donde crecimiento de logs/eventos puede causar falta de espacio si no se controla.
- Falta de vigilancia automática (watching disabled) puede dificultar detección automática de cambios o recuperaciones específicas (si eso se espera).

3) Próxima acción recomendada
- Investigar la causa de los reinicios de MONI: pm2 logs MONI --lines 200 (o pm2 logs id), revisar ~/LVTP/logs y journalctl si aplica. Corregir el error root (excepciones, dependencias, permisos).
- No reiniciar a ciegas; si es necesario, aplicar corrección y luego reiniciar MONI (pm2 restart MONI).
- Liberar/rotar logs si el espacio crece: comprimir o eliminar logs antiguos en ~/LVTP/logs y revisar políticas de retención. Poner alerta para 85% de uso.
- Monitorizar durante 24 h tras la corrección.

4) Prioridad
- Alta: investigar y mitigar el flapping de MONI de inmediato; seguimiento de disco como medida preventiva.


# Moni Cognition — 2026-05-27T23:33:09.826775+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados están online (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server). Uso CPU/mem bajo.
- Disco raíz: 58G total, 43G usados (78%).
- Contenido en memoria: 12 archivos de events, 5 de logs.

2) Riesgos detectados
- MONI (id 0) muestra contador de reinicios muy alto (↺ = 2105) y uptime muy corto (6s): indica crash loop / reinicios frecuentes → riesgo funcional inmediato.
- Disco al 78%: no crítico ahora, pero puede llegar a ser problema si crecen logs/eventos.
- Si MONI falla repetidamente, puede afectar procesamiento o integridad de datos.

3) Próxima acción recomendada
- Investigar causa del reinicio de MONI: ejecutar pm2 logs MONI --lines 200 y revisar /var/log/syslog o journalctl -u <servicio> para errores. Corregir la excepción o dependencia que provoca el crash.
- Mientras tanto, habilitar/ajustar rotación/limpieza de logs y events y liberar espacio si hay archivos grandes (du -sh ~/LVTP/memory/*).
- Si MONI cae por saturación de recursos, considerar reiniciar el proceso tras corrección o desplegar patch.

4) Prioridad
- Alta: investigar y detener el crash loop de MONI de inmediato.  
- Media: planificar limpieza/rotación de disco si el espacio sigue en aumento.


# Moni Cognition — 2026-05-27T23:38:26.676369+00:00

1) Estado del nodo
- Sistema: operativo. Disco / 58G total, 43G usados (78%).
- PM2: todos los procesos listados están "online" (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- MONI muestra uptime 2s pero 2132 reinicios registrados.
- Eventos en memoria: 12 ficheros. Logs en memoria: 5 ficheros.

2) Riesgos detectados
- Alta probabilidad de fallo funcional: MONI está en loop de reinicios (2132 ↺) — riesgo de pérdida de servicio/estado o comportamiento inestable.
- Espacio en disco moderadamente alto (78%): riesgo futuro si los logs/eventos crecen sin rotación.
- (Bajo) actualmente pocos archivos de eventos/logs, pero podría cambiar si MONI falla repetidamente.

3) Próxima acción recomendada
- Investigar causas del reinicio de MONI: revisar logs con pm2 logs MONI --lines 200 y buscar errores/crashes; luego pm2 flush y pm2 restart MONI tras corregir.
- Habilitar/ajustar rotación de logs (p.ej. pm2-logrotate) y eliminar/archivar eventos antiguos; identificar archivos grandes con du -sh ~/LVTP/*.
- Monitorizar espacio de disco y comportamiento de MONI durante/tras la intervención.

4) Prioridad
- Alta (por inestabilidad de MONI).


# Moni Cognition — 2026-05-27T23:43:36.719883+00:00

1. Estado del nodo
- Servicios PM2: todos los procesos listados están ONLINE (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- Disco raíz: 58G total, 43G usados, 13G libres → 78% usado.
- Contadores internos: events = 12 archivos, logs = 5 archivos.

2. Riesgos detectados
- MONI muestra un conteo de reinicios muy alto (↺ 2159) y su instancia actual solo tiene 9s de uptime → posible flapping o reinicios frecuentes recientes.
- Disco al 78%: riesgo de quedarse sin espacio si crecen logs/eventos o si hay acumulación (umbral operativo recomendable <70–75%).
- Si MONI falla repetidamente podría impactar procesamiento de eventos/servicios dependientes.

3. Próxima acción recomendada
- Investigar reinicios de MONI: revisar logs con pm2 logs MONI --lines 200 y /var/log/system para identificar causa y corregir (excepciones, OOM, dependencias).
- Liberar/rotar espacio en disco si procede (eliminar/archivar logs antiguos, limpiar caches) hasta dejar margen >15% libre; habilitar logrotate para directorios relevantes.
- Monitorizar tras correcciones y, si persiste el flapping, considerar reiniciar el proceso tras análisis o degradar servicio según plan de contingencia.

4. Prioridad
- Alta: investigar reinicios de MONI y limpiar espacio en disco lo antes posible.


# Moni Cognition — 2026-05-27T23:48:45.562765+00:00

1. Estado del nodo
- Disco /: 58G total, 43G usados (78%, 13G libres).  
- PM2: todos los procesos están "online".  
- Conteos: events = 12 archivos, logs = 5 archivos.

2. Riesgos detectados
- MONI muestra un contador de reinicios muy alto (↺ 2187) y uptime reciente (6s) → proceso inestable/crasheando y auto-reiniciándose. Riesgo funcional inmediato.  
- Espacio en disco al 78%: no crítico aún, pero si crecen logs/evts puede llegar pronto a umbrales problemáticos.

3. Próxima acción recomendada
- Inspeccionar logs de MONI: pm2 logs MONI (y pm2 show MONI) para ver causa de reinicios; revisar /var/log/syslog o journalctl si aplica.  
- Si los reinicios son por errores repetidos, arreglar la causa (bug, dependencia, permisos) o aumentar tolerancia temporalmente.  
- Liberar/archivar logs si procede y vigilar uso de disco; considerar rotación/compresión o ampliar almacenamiento si el crecimiento continúa.

4. Prioridad
- Alta (por inestabilidad del proceso MONI). El tema de disco es prioridad media-alta para monitorizar y mitigar si crece.


# Moni Cognition — 2026-05-27T23:53:53.541522+00:00

1) Estado del nodo
- Servicios: Todos los procesos PM2 relevantes (MONI, workers, loop, watchdog, booking-event-server) están online y funcionando.
- Almacenamiento: / (58G) 78% usado, 13G libres.
- Memoria de eventos/logs: 12 eventos, 5 ficheros de log en ~/LVTP/memory.

2) Riesgos detectados
- Espacio en disco próximo a umbral: 78% usado. Si sigue creciendo puede quedarse sin espacio (impacto en logs, persistencia y operación de servicios).
- Riesgo operativo bajo ahora (procesos online), pero sin acción puede agravarse.

3) Próxima acción recomendada
- Identificar consumos grandes: du -h ~ --max-depth=1 | sort -hr
- Limpiar/archivar datos antiguos de LVTP: por ejemplo tar/comprimir y mover a otro almacenamiento y luego eliminar los originales (ej. tar -czf ~/backup_events_$(date +%F).tar.gz ~/LVTP/memory/events && rm -rf ~/LVTP/memory/events/*).
- Configurar rotación/retención automática de logs y alertas cuando uso >75–80%.
- (Opcional inmediato) correr pm2 flush si necesita liberar logs de PM2.

4) Prioridad
- Media. Actuar pronto para evitar superar 80–90% y provocar fallos; subir a alta si el uso aumenta rápidamente.


# Moni Cognition — 2026-05-27T23:59:04.597974+00:00

Soy Moni. Resumen breve:

1) Estado del nodo
- Servicios PM2: todos los procesos listados están “online”.
- Proceso MONI: online pero acaba de reiniciarse (uptime 3s) con 2249 reinicios acumulados.
- Disco /: 58G total, 43G usados, 13G libres (78%).
- Eventos en memoria: 12 ficheros; logs en memoria: 5 ficheros.

2) Riesgos detectados
- Alto número de reinicios de MONI → posible crash-loop/instabilidad que puede causar pérdida de funcionalidad o datos.
- Uso de disco en 78% → margen aún aceptable pero debe vigilarse (crecimiento rápido puede causar problemas).
- Si MONI falla repetidamente puede generar logs grandes/consumo extra y agravar disco/CPU.

3) Próxima acción recomendada
- Investigar inmediatamente por qué MONI se reinicia: revisar logs y descripción del proceso.
  Comandos sugeridos: pm2 logs MONI --lines 200; pm2 describe MONI; journalctl -u <si aplica> -n 200.
- Verificar crecimiento/ocupación de disco y limpiar/rotar logs si procede: du -sh ~/LVTP/memory/* ; revisar /var/log.
- Si se identifica bug en la aplicación, aplicar parche o revert y reiniciar controladamente el proceso.

4) Prioridad
- Alta: investigar y resolver la inestabilidad de MONI ahora.
- Media: limpieza/rotación de disco y seguimiento continuo.


# Moni Cognition — 2026-05-28T00:04:21.983768+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos reportados (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server) están online.
- Almacenamiento: / tiene 58G total, 43G usados (78%).
- Memoria de eventos/logs en disco: pocos ficheros (events: 12, logs: 5).

2) Riesgos detectados
- MONI muestra 2272 reinicios (↺ 2272) pese a estar online → posible inestabilidad recurrente o crash-loop histórico/actual.
- Disco al 78%: no crítico ahora, pero riesgo de acercarse a llenado si crecen logs/objetos (acción preventiva recomendada).
- Si MONI reinicia con frecuencia puede provocar pérdida de estado, drops en telemetría/acciones y crecimiento rápido de logs.

3) Próxima acción recomendada (pasos inmediatos)
- Inspeccionar por qué reinicia MONI:
  - pm2 logs MONI --lines 200
  - pm2 describe MONI
  - revisar /var/log/syslog o journalctl si aplica (journalctl -u pm2* o journalctl -f).
- Si hay errores claros en la aplicación: corregir bug y desplegar; si es por OOM/recursos, comprobar consumo en el momento (top/htop) y ajustar límites.
- Limpiar/rotar logs si ocupan espacio: pm2 flush; revisar ~/LVTP/memory/* y tamaño de directorios antes de eliminar.
- Monitorizar tras corrección: pm2 monitor / revisar que ↺ deje de aumentar.

4) Prioridad
- Alta: investigar y corregir la causa de los reinicios de MONI (impacto funcional directo).
- Media: acciones de mantenimiento de disco (rotación/limpieza) para prevenir llenado futuro.

Moni.


# Moni Cognition — 2026-05-28T00:09:38.032838+00:00

Soy Moni. Resumen corto:

1) Estado del nodo
- Nodo en línea. Todos los procesos listados por pm2 están "online".
- MONI muestra alta cuenta de reinicios (↺ = 2292) y acaba de arrancar (uptime 11s) — comportamiento intermitente.
- Disco / está al 78% (13 GB libres de 58 GB).
- Conteo de eventos (12) y logs (5) bajos.

2) Riesgos detectados
- MONI inestable (muchos reinicios) — riesgo de pérdida de telemetría, acciones o inconsistencias operativas.
- Reinicios frecuentes pueden indicar bug, excepción no capturada o OOM.
- Disco 78% usado: no crítico ahora, pero puede convertirse en problema si aumentan logs o dumps.

3) Próxima acción recomendada (inmediata)
- Inspeccionar logs de MONI y del sistema para causa raíz:
  - pm2 logs MONI --lines 200
  - pm2 show MONI
  - journalctl -u pm2 -n 200 --no-pager
  - dmesg -T | tail -n 100
- Revisar consumo de memoria/CPU y exit codes; comprobar OOM killer en dmesg.
- Si es un fallo reproducible, reiniciar/rollback a versión estable o aplicar parche. Mientras tanto habilitar/revisar rotación de logs y liberar espacio si hay ficheros grandes.

4) Prioridad
- Alta — investigar MONI de inmediato. Disk: monitoreo/acción en breve si crece uso.


# Moni Cognition — 2026-05-28T00:14:47.172162+00:00

1) Estado del nodo
- Servicios PM2: la mayoría online (MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server). El proceso "MONI" está arrancado pero con uptime muy bajo (14s).  
- Disco: / (58G total, 43G usados, 13G libres) → 78% usado.  
- Colas/local: events=12 archivos, logs=5 archivos.

2) Riesgos detectados
- Alta reincidencia del proceso "MONI": contador de reinicios ≈2312 y uptime 14s indica crash-loop o reinicio continuo — riesgo inmediato de pérdida de funcionalidad.  
- Espacio en disco subiendo (78%) — suficiente ahora, pero riesgo a medio plazo si crece (logs/dumps) y puede impactar servicios o actualizaciones.  
- Si MONI consume logs/estado, el número bajo de archivos sugiere que no hay backlog actualmente.

3) Próxima acción recomendada
- Investigar causa del crash-loop de MONI: ejecutar pm2 logs MONI (o pm2 logs 0) y revisar errores recientes; revisar salida de pm2 describe MONI y core dumps.  
- Si es un error de despliegue, aplicar rollback o reinstalar la versión estable tras capturar logs.  
- Revisar uso de disco: du -sh ~/LVTP/* y limpiar/rotar logs si procede; planificar limpieza si supera 85%.  
- Poner alerta/monitorización para reinicios y espacio.

4) Prioridad
- Alta: corregir el crash-loop de MONI de inmediato.  
- Media: mantenimiento preventivo del espacio en disco.


# Moni Cognition — 2026-05-28T00:20:05.094375+00:00

Soy Moni. Análisis rápido del snapshot (2026-05-28T00:19:47Z):

1) Estado del nodo
- Servicios PM2: todos los procesos listados están online (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- Disco raíz: 58G total, 43G usados, 13G libres → 78% ocupado.
- Memoria de procesos listada: uso razonable (entre ~13MB y 76MB).
- Colas en memoria: 12 eventos, 5 logs (bajo volumen).

2) Riesgos detectados
- Alta tasa de reinicios del proceso MONI: contador de ↺ = 2330 y uptime reciente (38s) → indica reinicios frecuentes/recurrencia de fallo. Riesgo alto sobre disponibilidad/estabilidad operativa.
- Espacio en disco en 78%: no crítico aún, pero riesgo de volverse problemático si crecen logs o colas (recomendable monitorizar y limpiar antes de 90%).
- Si MONI falla repetidamente puede generar pérdida/retardo en procesamiento de eventos aunque actualmente hay pocos eventos en memoria.

3) Próxima acción recomendada (inmediata)
- Inspeccionar causa de reinicios de MONI: pm2 logs MONI --lines 200 y pm2 show MONI; revisar errores y stacktraces.
- Revisar rotación/consumo de logs y liberar espacio si procede: du -sh ~/LVTP/* , journalctl --vacuum-size=200M o limpiar caches (apt, tmp) si hace falta.
- Si el problema de MONI es por una excepción repetida, desplegar corrección o volver a una versión estable; si es por recursos, reiniciar y monitorear.
- Continuar monitorización de disco y establecer alertas (p. ej. aviso al 85%).

4) Prioridad
- Alta — por inestabilidad evidente del proceso MONI (↺=2330). Discreta/mediana para limpieza de disco si no hay crecimiento inmediato.

¿Quieres que ejecute los comandos de logs sugeridos o preparo pasos detallados para mitigación?


# Moni Cognition — 2026-05-28T00:25:18.276796+00:00

1) Estado del nodo
- PM2: todos los procesos aparecen "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).
- MONI muestra uptime 3s pero contador de reinicios muy alto (↺ = 2346) → está flapping.
- Disco /: 58G total, 43G usados (78%).
- Conteo en memoria: events = 12, logs = 5 (bajo).

2) Riesgos detectados
- Inestabilidad funcional: MONI está en un bucle de reinicios; puede causar pérdida de servicio o corrupción de estado.
- Riesgo de agotamiento de espacio si la tendencia continúa; 78% es próximo a umbrales de alerta.
- Reinicios frecuentes pueden consumir recursos y ocultar la causa raíz.

3) Próxima acción recomendada
- Inspeccionar logs de MONI inmediatamente: pm2 logs MONI --lines 200 y revisar journal/syslog; capturar el stacktrace/errores.
- Temporalmente detener el reinicio automático para investigar: pm2 stop MONI (o ajustar max_restarts) y ejecutar en foreground para reproducir y depurar.
- Si aparecen logs/archivos acumulados, liberar espacio (rotación/eliminar archivos antiguos en ~/LVTP/memory) antes de alcanzar >80–90%.
- Tras corregir la causa (bug/config/dep), volver a iniciar y monitorizar.

4) Prioridad
- Alta (resolver flapping de MONI de inmediato). Disk: media — vigilar y limpiar si sube.


# Moni Cognition — 2026-05-28T00:30:31.234098+00:00

Soy Moni. Análisis breve:

1) Estado del nodo
- Disco: / dev/sda6 58G total, 43G usados (78%).
- PM2: 6 procesos listados y "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server, etc.).
- Conteos internos: events = 12 archivos, logs = 5 archivos.

2) Riesgos detectados
- Crítico: el proceso MONI (id 0) muestra 2.370 reinicios y sólo 4s de uptime → comportamiento en bucle de reinicio/caída, riesgo de interrupción del servicio y generación masiva de logs.
- Moderado: uso de disco al 78% — suficiente por ahora, pero puede llenarse si el bucle de reinicio genera muchos logs/eventos.
- Bajo: otros procesos parecen estables (uptime ~7h, 0 reinicios).

3) Próxima acción recomendada (inmediata)
- Inspeccionar los logs del proceso problemático: pm2 logs MONI --lines 200 y pm2 show MONI para ver exit code/errores.
- Revisar uso de memoria y causas de crash: free -h, dmesg | tail.
- Si procede, detener MONI temporalmente para evitar más escrituras: pm2 stop MONI; corregir la causa (bug, dependencia, permisos) y volver a lanzar.
- Liberar espacio si es necesario: archivar/limpiar ~/LVTP/memory/logs y ~/LVTP/memory/events o configurar rotación de logs.

4) Prioridad
- Alta (resolver el bucle de reinicio de MONI de inmediato). Disponer limpieza de disco: prioridad media mientras se estabiliza el proceso.


# Moni Cognition — 2026-05-28T00:35:39.129170+00:00

1) Estado del nodo
- Servicios (pm2): todos los procesos están "online". Sin embargo el proceso MONI (id 0) muestra uptime 6s y un contador de reinicios muy alto (↺ 2397).  
- Disco: / (58G) 78% usado (13G libres).  
- Colas/memoria de eventos y logs: pocos archivos (events 12, logs 5).

2) Riesgos detectados
- Alto riesgo funcional: MONI está reiniciándose continuamente (flapping) — puede causar pérdida de observabilidad/funcionalidad o degradación.  
- Riesgo de capacidad a mediano plazo: disco al 78% (vigilancia; si crece puede afectar persistencia y logs).

3) Próxima acción recomendada
- Investigar por qué MONI se reinicia: ejecutar inmediatamente pm2 logs MONI --lines 200 y pm2 describe MONI para ver errores y motivo de restart. Revisar el log de la aplicación (stack traces, excepciones) y el syslog/journal si procede.  
- Si es error de configuración/dep, aplicar corrección y, si está seguro, reiniciar el proceso: pm2 restart MONI.  
- Tarea secundaria: revisar y rotar/limpiar logs grandes o archivos temporales si el uso de disco sigue subiendo (du -sh ~/LVTP/memory/*; logrotate).

4) Prioridad
- Alta para investigar y corregir el flapping del proceso MONI.  
- Media para acciones de mantenimiento de disco.


# Moni Cognition — 2026-05-28T00:40:48.995903+00:00

Soy Moni. Resumen breve:

1) Estado del nodo
- PM2: todos los procesos aparecen "online" (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- Sin embargo MONI muestra 2424 reinicios y uptime reciente (6s) → posible crash-loop.
- Disco raíz: 58G total, 43G usados (78%).
- Conteos: events = 12, logs = 5 (bajos).

2) Riesgos detectados
- Crítico: MONI inestable (flapping) puede interrumpir supervisión/operaciones.
- Alto/medio: disco al 78% — riesgo de llenado si sigue creciendo (umbral operativo típico 80–90%).
- Bajo: por ahora pocos ficheros de eventos/logs, pero podrían crecer si la app falla.

3) Próxima acción recomendada
- Inmediato: inspeccionar logs de MONI (pm2 logs MONI --lines 200) para identificar causa del crash y aplicar corrección o redeploy.
- Paralelo: activar/ejecutar rotación/limpieza de logs (pm2-logrotate o logrotate) y liberar espacio si hay ficheros grandes.
- Establecer alertas para uso de disco y número de reinicios de procesos.

4) Prioridad
- MONI (crash-loop): Alta.
- Uso de disco/limpieza de logs: Media.


# Moni Cognition — 2026-05-28T00:46:00.292614+00:00

1) Estado del nodo
- Servicios: todos los procesos en pm2 aparecen "online" (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).  
- Almacenamiento: / 58G total, 43G usados (78%).  
- Memoria de eventos/logs: 12 eventos, 5 ficheros de log en ~/LVTP/memory.

2) Riesgos detectados
- MONI está inestable: contador de reinicios muy alto (↺ = 2449) y proceso con uptime 1s → riesgo inminente de caída/flujo de reinicios.  
- Disco al 78%: no crítico aún, pero riesgo de falta de espacio si crece (especialmente por logs/eventos).  
- Posible reclamo de rendimiento/consistencia si MONI sigue fallando.

3) Próxima acción recomendada
- Inspeccionar logs de MONI inmediatamente: pm2 logs MONI (últimas 200–500 líneas) para identificar causa del reinicio.  
- Si es bug en la app, aplicar rollback o corregir; si es por recursos, liberar espacio y/o ajustar parámetros (rotación de logs, limpiar ~/LVTP/memory, apt/dpkg cache, imágenes no usadas).  
- Mientras tanto, poner MONI en modo debug/monitor y crear alerta si reinicios continúan.

4) Prioridad
- Alta — por la inestabilidad marcada de MONI (posible impacto funcional).


# Moni Cognition — 2026-05-28T00:51:08.900718+00:00

1. Estado del nodo
- Servicios PM2: todos online, pero el proceso MONI (id 0) muestra 2476 reinicios y está usando 100% CPU (uptime 2s). Los demás procesos están estables y con bajo uso CPU/mem.
- Disco: / (58G) 78% usado.
- Memoria de eventos/logs en LVTP: 12 eventos y 5 logs (bajo).

2. Riesgos detectados
- Alto: MONI parece en bucle de reinicio (↺ 2476) y consumo 100% CPU → riesgo de inestabilidad o degradación del servicio.
- Medio: espacio en disco al 78% — suficiente ahora, pero puede llegar a afectar logs y persistencia si sigue creciendo.
- Bajo: pocos archivos de eventos/logs, sin alerta inmediata.

3. Próxima acción recomendada (pasos inmediatos)
- Revisar logs de MONI: pm2 logs MONI --lines 200 para identificar causa del reinicio/CPU.
- Si el proceso está entrando en crashloop: parar pm2 stop MONI, ejecutar en modo debug/local para replicar el fallo y aplicar corrección (o revertir a versión estable).
- Comprobar consumo y procesos relacionados: ps aux | grep MONI y top/htop para ver si hay subprocesos colgados.
- Liberar espacio si en las próximas inspecciones crece (>85%): rotar/archivar logs o limpiar caches.

4. Prioridad
- Alta: investigar y corregir el comportamiento de MONI de inmediato.


# Moni Cognition — 2026-05-28T00:56:15.130981+00:00

1) Estado del nodo
- Procesos PM2 principales (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server) están online.
- Disco raíz 58G total, 43G usados (78%).
- Eventos en memoria: 12 archivos; logs en memoria: 5 archivos.

2) Riesgos detectados
- MONI (id 0) muestra un conteo de reinicios muy alto (↺ 2503) aunque ahora está online — indica inestabilidad o reinicios frecuentes recientes.
- Uso de disco al 78%: no crítico aún, pero se acerca a umbrales donde la rotación/logging o crecimiento puede causar problemas si no se controla.
- Si los reinicios se deben a errores persistentes, podrían provocar pérdida de datos o interrupciones.

3) Próxima acción recomendada
- Revisar logs de MONI inmediatamente: pm2 logs MONI (o pm2 logs <id>) para identificar causa de reinicios.
- Liberar/rotar espacio si procede: revisar directorios grandes (journalctl --disk-usage; sudo journalctl --vacuum-size=200M), limpiar cachés (apt, npm), y limpiar/archivar ~/LVTP/memory/{events,logs} si son seguros de eliminar.
- Si el problema es un crash recurrente, reproducir/depurar el error y aplicar fix o bloquear reinicios automáticos hasta corregir.

4) Prioridad
- Alta: investigar logs de MONI y mitigar reinicios de inmediato; liberar algo de espacio en disco en paralelo.


# Moni Cognition — 2026-05-28T01:01:24.381388+00:00

1) Estado del nodo
- Nodo operativo. Todos los procesos PM2 están "online": MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG y booking-event-server.
- Disco / (58G): 43G usados, 13G libres — 78% ocupado.
- Eventos en memoria: 12; logs en memoria: 5.

2) Riesgos detectados
- MONI tiene 2.533 reinicios (↺ 2533) y uptime reciente de 6s → indica flapping/instabilidad aunque ahora esté online.
- Espacio en disco 78%: no crítico pero riesgo de llenado si logs/colas crecen.
- Si MONI sigue reiniciando puede haber pérdida de funcionalidad o corrupción de estado.

3) Próxima acción recomendada
- Revisar logs de MONI inmediatamente: pm2 logs MONI --lines 200 y buscar errores/crash reason; comprobar systemd/journal si corresponde.
- Si logs crecen, rotar/limpiar ~/LVTP/memory/logs y eventos innecesarios; liberar espacio (p. ej. du -sh ~/LVTP/memory/*).
- Si se confirma bug, ejecutar MONI en modo debug o habilitar core dumps y fijar causa antes de dejarlo en producción.

4) Prioridad
- Alta: investigar y resolver los reinicios de MONI de inmediato; paralelamente vigilar y limpiar disco si continúa creciendo.


# Moni Cognition — 2026-05-28T01:06:36.561829+00:00

Soy Moni — resumen corto:

1) Estado del nodo
- Nodo operativo. Todos los procesos PM2 listados están "online".
- Proceso MONI (pid 52999) con uptime 0s y contador de reinicios ↺ = 2561 (acaba de reiniciarse).
- Disco / (58G): 43G usados, 13G libres → 78% usado.
- Eventos en memoria: 12 archivos. Logs en memoria: 5 archivos.

2) Riesgos detectados
- Alta probabilidad de inestabilidad funcional: MONI está en loop de reinicios (muy alto número de ↺) → posible interrupción o degradación del servicio.
- Uso de disco cercano a niveles de riesgo si sigue creciendo (78%) — puede convertirse en problema si no se controla.
- Por ahora no hay cola de eventos/logs significativa.

3) Próxima acción recomendada
- Investigar immediatamente por qué MONI se reinicia: revisar logs (pm2 logs MONI y ~/.pm2/logs/*), buscar excepciones/segfaults o falta de recursos; revertir último despliegue si corresponde.
- Si el problema es por saturación de disco o archivos temporales, limpiar/rotar logs y basura (du -sh ~/LVTP/* para localizar) y liberar espacio.
- Si se corrige, aplicar persistencia (fix de código/config, ajustar manejo de errores y politicas de restart en PM2).

4) Prioridad
- Alta: investigar y mitigar el fallo de MONI inmediatamente.
- Media: limpieza/monitoreo del disco.


# Moni Cognition — 2026-05-28T01:11:45.572009+00:00

Soy Moni. Análisis breve:

1) Estado del nodo
- Servicios PM2: todos los procesos listados están online.
- Disco raíz: 58G total, 43G usados (78%).
- Eventos en memoria: 12 ficheros. Logs en memoria: 5 ficheros.

2) Riesgos detectados
- Reinicios frecuentes: el proceso MONI (id 0) muestra ↺ 2582 (muchos reinicios), posible crash-loop o fallo periódico.
- Espacio en disco próximo a zona de alerta (78% usado). Si crece puede afectar logs/servicios.
- Riesgo operativo: aunque online, el proceso con tantos reinicios puede no estar funcionando correctamente o perder datos.

3) Próxima acción recomendada
- Prioridad investigativa: revisar logs del proceso problemático y del sistema:
  - pm2 logs MONI --lines 200
  - pm2 monit / pm2 show MONI
  - Revisar syslog/journalctl para errores coincidentes.
- Liberar/rotar espacio si el uso de disco sigue aumentando (borrar logs antiguos, limpiar cachés) y establecer rotación automática.
- Si el reinicio es por excepción recurrente, reproducir localmente y corregir la causa (depuración, dependencia, límites de memoria).

4) Prioridad
- Alta: investigar y detener el crash-loop del proceso MONI inmediatamente (dentro de la próxima hora).  
- Media: acciones de limpieza/rotación de disco a realizar pronto si la tendencia de crecimiento continúa.

Moni.


# Moni Cognition — 2026-05-28T01:16:55.167253+00:00

1) Estado del nodo
- Nodo en línea. Sistema de archivos /: 58G total, 43G usados (78%, 13G libres). PM2 muestra procesos activos: MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server están estables. El proceso MONI está "online" pero con comportamiento anómalo (ver abajo). Eventos en memoria: 12 archivos; logs en memoria: 5 archivos.

2) Riesgos detectados
- MONI presenta 2606 reinicios (↺ = 2606) y uptime reciente de 4s → flapping/instabilidad del proceso principal de monitoreo. Riesgo alto de pérdida de funcionalidad de agente, alertas incompletas o corrupción de estados.
- Espacio en disco 78%: no crítico ahora, pero puede agravarse si los logs o dumps crecen.

3) Próxima acción recomendada
- Inspeccionar causa del flapping: ejecutar pm2 logs MONI --lines 200 y pm2 describe MONI. Revisar los últimos errores en ~/LVTP/memory/logs y ~/LVTP/memory/events. Si el log muestra excepción clara, corregirla o restaurar versión estable; si no, detener/reiniciar MONI con pm2 restart MONI o pm2 stop MONI y luego start con configuración conocida. Si los reinicios son por política PM2, considerar aumentar backoff o investigar leaks. También limpiar logs grandes si el disco se acerca al 90%.

Comandos útiles:
- pm2 logs MONI --lines 200
- pm2 describe MONI
- tail -n 200 ~/LVTP/memory/logs/*.log

4) Prioridad
- Alta: investigar y corregir el flapping de MONI de inmediato.


# Moni Cognition — 2026-05-28T01:22:05.736481+00:00

1) Estado del nodo
- Salud general: procesos PM2 online (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server) y uso de CPU/RAM bajo.
- Disco: / (58G) 43G usados, 13G libres → 78% ocupación.
- Memoria de eventos/logs en LVTP: 12 eventos, 5 logs (bajo).

2) Riesgos detectados
- MONI está en bucle de reinicios: uptime 22s pero ↺ 2630 (muchos reinicios) — riesgo de inestabilidad funcional aunque ahora aparezca "online".
- Espacio en disco en 78%: no crítico ahora, pero puede convertirse en problema si crece (logs/eventos, snapshots).
- Riesgo operativo moderado si MONI falla repetidamente (afecta coordinación/monitoreo).

3) Próxima acción recomendada (inmediata)
- Inspeccionar logs de MONI: pm2 logs MONI --lines 200 y / revisar logs de la aplicación/journalctl para identificar causa del reinicio.
- Si es un fallo reproducible, corregir la causa (error en código/config/dependencia) o aplicar restart controlado: pm2 restart MONI después de corregir.
- Revisar rotación/retención de logs y limpiar/archivar si necesario; monitorizar crecimiento de /.
(Comandos sugeridos: pm2 logs MONI --lines 200; pm2 monit; df -h; journalctl -u <servicio> --since "1 hour ago")

4) Prioridad
- Alta: investigar y detener el flapping de MONI de forma inmediata.
- Media: revisar y aplicar política de rotación/limpieza del disco para evitar llenado futuro.


# Moni Cognition — 2026-05-28T01:27:15.020616+00:00

1) Estado del nodo
- Salud general: OK. Todos los procesos PM2 listados están "online".
- Disco: / (58G) 78% usado (13G libres).
- Conteos: events=12, logs=5.
- Nota: proceso "MONI" tiene uptime 7s pero 2656 reinicios acumulados → reinicios frecuentes.

2) Riesgos detectados
- Inestabilidad de "MONI" (alto contador de reinicios) puede causar interrupciones funcionales.
- Espacio en disco cercano al umbral (78%) — riesgo de llenado si crece la retención de logs/events.

3) Próxima acción recomendada
- Revisar logs del proceso MONI para causa de reinicios: pm2 logs MONI --lines 200 (o /home/leo…/LVTP logs).
- Monitorizar crecimiento del uso de disco y liberar/rotar archivos si procede: du -sh ~/LVTP && sudo journalctl --disk-usage && limpiar/rotar.
- Si se confirma error recurrente, reiniciar/depurar la app y aplicar corrección (fix crash/exception / actualizar).

4) Prioridad
- Alta: investigar y corregir la inestabilidad de MONI ahora; preparar limpieza/rotación de disco a corto plazo.


# Moni Cognition — 2026-05-28T01:32:23.350095+00:00

1) Estado del nodo
- PM2: servicios en línea (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).  
- Disco: / (58G) 78% usado (13G libres).  
- Memoria de eventos/logs en LVTP: 12 eventos, 5 logs.

2) Riesgos detectados
- MONI (id 0) muestra uptime 9s y 2685 reinicios (↺): indicio de crash-loop / inestabilidad del proceso — riesgo crítico para la plataforma.  
- Espacio en disco al 78%: no inmediato crítico pero cerca de umbrales (riesgo de empeorar y afectar logs/servicios).  
- Watch/auto-restart de PM2 aparentemente deshabilitado (watching: disabled) — menos capacidad de recuperación automática ante cambios.

3) Próxima acción recomendada
- Inspeccionar logs y causa del reinicio de MONI inmediatamente: pm2 logs MONI --lines 200 y pm2 show MONI; corregir excepción/configuración que provoca los reinicios.  
- Si MONI no arranca tras corregir, reiniciar con pm2 restart MONI y monitorizar.  
- Liberar espacio si sube >80%: rotar/borrar logs antiguos (~/LVTP/memory/logs), limpiar caches, o aumentar partición.  
- Habilitar supervisión/alertas y revisar configuración de PM2 si se quiere auto-recovery (valuar watch / restart policy).

4) Prioridad
- Alta (urgente) — resolver inestabilidad de MONI de inmediato; disco: prioridad media-alta si continúa creciendo.


# Moni Cognition — 2026-05-28T01:37:37.435033+00:00

Soy Moni — análisis breve:

1) Estado del nodo
- Nodo operativo. PM2 muestra todos los procesos "online" (MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).
- El proceso MONI (id 0) está inestable: uptime 13s con 2712 reinicios.
- Disco raíz: 58G total, 43G usados (78% ocupación, 13G libres).
- Memoria de eventos: 12 ficheros; logs en memoria: 5 ficheros.

2) Riesgos detectados
- Alto riesgo: MONI está en crash-loop (muchos reinicios) => posible pérdida de funcionalidad o saturación de recursos.
- Riesgo de llenado de disco si los reinicios generan logs/archivos continuos.
- Riesgo menor: si la causa es OOM u otro fallo del sistema, puede afectar otros procesos.

3) Próxima acción recomendada (inmediata)
- Revisar logs de MONI para identificar la causa: pm2 logs MONI --lines 200
- Buscar kills por OOM/syslog: sudo dmesg | grep -i kill  y journalctl -e
- Si el crash-loop genera muchos ficheros/logs y consume I/O/espacio, detener temporalmente el proceso: pm2 stop MONI
- Limpiar/rotar logs si es necesario: du -sh ~/LVTP/memory/logs/*  y borrar/archivar los más grandes.
- Una vez identificada la causa, corregir el error y reiniciar controladamente: pm2 restart MONI

4) Prioridad
- Alta — investigar y detener el crash-loop de MONI de inmediato.  
- Media para la gestión de espacio (monitorear y limpiar si aumenta rápidamente).


# Moni Cognition — 2026-05-28T01:42:50.013010+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados están online (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server). Eventos en memoria: 12 ficheros. Logs en memoria: 5 ficheros.  
- Disco: / (58G) 43G usados, 13G libres → 78% ocupación.

2) Riesgos detectados
- MONI está flapeando: contador de reinicios ↺ = 2736 y uptime actual sólo 11s → riesgo de inestabilidad/caídas recurrentes del agente principal.  
- Espacio en disco en 78%: no crítico ahora, pero puede convertirse en problema si crece (pérdida de logs, fallos al escribir datos).

3) Próxima acción recomendada
- Investigar causa de reinicios de MONI inmediatamente:
  - pm2 logs MONI --lines 200 (revisar errores recientes)
  - pm2 describe MONI (revisar restart policy, env y exit codes)
  - revisar syslog/journalctl para errores sistémicos (journalctl -u <service> o journalctl -f).  
- Liberar/rotar espacio si procede:
  - revisar directorios grandes (du -h --max-depth=1 ~ /var/log) y rotar/borrar logs antiguos o limpiar caches.
- Si el fallo de MONI es por bug conocido, aplicar hotfix o desplegar versión estable; si es por consumo excesivo, ajustar límites/recursos o aumentar backoff de reinicio.

4) Prioridad
- Alta — debido al flapeo continuo de MONI (impacto en operación) y riesgo creciente de espacio en disco.


# Moni Cognition — 2026-05-28T01:48:02.690038+00:00

Soy Moni. Análisis breve:

1) Estado del nodo
- Servicios: pm2 muestra todos los procesos MONI y servicios relacionados online.
- Disco: / (58G) 78% usado (13G libres).
- Datos en memoria: events=12 ficheros, logs=5 ficheros.

2) Riesgos detectados
- MONI (id 0, pid 56582) consume 100% CPU y tiene contador de reinicios muy alto (↺ = 2761) con uptime 0s → probable bucle de reinicio o proceso saturado que degrada la máquina.
- Uso de disco 78%: no crítico ahora, pero puede acercarse a límites si crecen logs/events.
- Posible inestabilidad de la aplicación (reinicios frecuentes) que afecte la disponibilidad.

3) Próxima acción recomendada (inmediata)
- Inspeccionar logs del proceso afectado: pm2 logs MONI --lines 200; revisar causa de reinicio.
- Si el proceso está en bucle y saturando CPU, detenerlo temporalmente: pm2 stop MONI; investigar localmente (strace/top/heap/profile) antes de reiniciar.
- Revisar uso de CPU/IO del sistema: top/htop, iotop; y revisar espacio en disco y rotación de logs.
- Liberar espacio si procede (rotar/eliminar logs antiguos en ~/LVTP/memory/logs o eventos no necesarios) y habilitar rotación si no existe.

4) Prioridad
- Alta para el problema de MONI (reinicios + 100% CPU) — acción inmediata.
- Media para limpieza/monitoreo de disco.


# Moni Cognition — 2026-05-28T01:53:18.218295+00:00

1) Estado del nodo
- Servicios PM2: todos ONLINE (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server). MONI acaba de arrancar (uptime 7s).  
- Disco /: 58G total, 43G usados (78%).  
- Colas locales: events=12 archivos, logs=5 archivos.

2) Riesgos detectados
- MONI está inestable: contador de reinicios (↺) = 2783 → flapping/errores recurrentes. Riesgo de pérdida de monitorización/funcionalidad.  
- Disco al 78%: no crítico aún, pero próximo a umbrales operativos (≥80–85%) que pueden impedir crecimiento de logs/colas.  
- Si MONI falla de nuevo puede acumular errores en memoria/logs o afectar otros procesos dependientes.

3) Próxima acción recomendada
- Inspeccionar logs de MONI inmediatamente: pm2 logs MONI --lines 200 (y buscar errores/crash reasons).  
- Revisar journal/syslog (journalctl -xe) y cualquier stacktrace o out-of-memory.  
- Si es un bug conocido: desplegar corrección o reiniciar/recuperar proceso tras identificar causa.  
- Liberar espacio si procede (limpiar logs antiguos / rotación) si se aproxima 80%: e.g. revisar ~/LVTP/memory/logs y rotar/archivar.

4) Prioridad
- Alta: investigar y resolver el flapping de MONI ahora.  
- Media: tarea preventiva de limpieza de disco si no se libera espacio en 24–48h.

Moni.


# Moni Cognition — 2026-05-28T01:58:30.381769+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server) están online.
- Almacenamiento: / (58G total) 78% usado, 13G libres.
- Cola local: 12 archivos de eventos, 5 archivos de logs.

2) Riesgos detectados
- Disco con uso elevado (78%): riesgo de quedarse sin espacio si crece la escritura (logs/eventos/archivos temporales). Esto puede provocar fallos al escribir logs o fallos de servicio.
- Por ahora CPU/memoria de procesos OK; no hay otros problemas inmediatos detectados.

3) Próxima acción recomendada
- Identificar y eliminar/archivar archivos grandes: ejecutar y revisar salida de
  du -h ~ | sort -h | tail -n 20
  y/o
  sudo du -sh /* /home/* 2>/dev/null | sort -h | tail -n 20
- Limpiar cachés y logs (ej. sudo apt-get clean, rotar/comprimir /var/log, mover/archivar carpetas de events/logs si son históricos).
- Verificar crecimiento de la carpeta de events y habilitar rotación/retención si no existe.

4) Prioridad
- Media — actuar pronto (dentro de 24–48 horas) para evitar que el disco alcance niveles críticos.

— Moni, agente cognitivo operacional de LVTP CORE


# Moni Cognition — 2026-05-28T02:03:47.362809+00:00

1) Estado del nodo
- Host: leonardovargas-Aspire-E1-470P.  
- PM2: todos los procesos listados están ONLINE: MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server.  
- Disco /: 58G total, 43G usados, 13G libres → 78% ocupación.  
- Eventos en memoria: 12 archivos. Logs en memoria: 5 archivos.  

2) Riesgos detectados
- MONI está en flapping: contador de reinicios (↺) = 2827 y uptime actual 33s → indica crashes/restarts frecuentes que pueden causar pérdida de datos/funcionalidad.  
- Espacio en disco en 78%: no inmediato crítico, pero puede convertirse en problema si crecen logs o eventos sin rotación.  

3) Próxima acción recomendada
- Revisar logs de MONI inmediatamente para identificar la causa del reinicio: pm2 logs MONI --lines 200 y pm2 show MONI. Revisar también journalctl/syslog por OOM o excepciones.  
- Si son logs crecientes, limpiar/rotar logs y revisar ~/LVTP/memory/* (du -sh ~/LVTP/*) antes de que el disco llegue >85%.  
- Después de identificar y corregir la causa (bug/dep/perm/OOM), reiniciar/recuperar MONI y monitorizar.  

4) Prioridad
- Alta: investigar y corregir los reinicios de MONI de inmediato.  
- Media: acciones de limpieza/rotación de disco en paralelo si se observan crecimientos.  

Moni.


# Moni Cognition — 2026-05-28T02:08:59.687870+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos aparecen "online". Sin embargo, el proceso MONI (id 0) muestra uptime 11s con 2.847 reinicios acumulados (posible bucle de reinicio reciente). Otros MONI_* llevan ~9h estables.
- Disco: / tiene 58G total, 43G usados (78%, 13G libres).
- Memoria de eventos/logs en LVTP: 12 eventos, 5 logs (bajo).

2) Riesgos detectados
- Alta probabilidad de inestabilidad funcional: MONI (id 0) parece estar entrando en reinicio continuo → puede afectar monitorización/gestión.
- Riesgo de llenado de disco a medio plazo: 78% usado. No crítico ahora, pero puede llegar a afectar si logs o eventos crecen.
- Si el bucle de reinicio genera logs rápidos, esto agravaría el riesgo de disco.

3) Próxima acción recomendada (pasos inmediatos)
- Inspeccionar logs del proceso problemático: pm2 logs MONI --lines 200 y pm2 show MONI para ver causa de reinicios.
- Comprobar uso por directorio y logs grandes: du -sh ~/LVTP/* /var/log/* | sort -h
- Si los logs crecen mucho, rotar/archivar o borrar archivos antiguos en ~/LVTP/memory/logs y ~/LVTP/memory/events; comprimir o mover fuera.
- Si el reinicio es por error transitorio, aplicar corrección y reiniciar: pm2 restart MONI (solo después de revisar logs).
- Monitorizar disco y número de reinicios tras la intervención.

4) Prioridad
- Alta: investigar y corregir el bucle de reinicio de MONI de inmediato; limpieza/rotación de logs en plazo corto para evitar llegar a >85–90% disco.


# Moni Cognition — 2026-05-28T02:14:10.846625+00:00

1) Estado del nodo
- Servicios: todos los procesos pm2 listados están online.  
- Almacenamiento: / (58G) 43G usados, 13G libres — 78% usado.  
- Memoria de eventos/logs: events=12 ficheros, logs=5 ficheros.

2) Riesgos detectados
- MONI (id 0) está haciendo flapping: uptime 7s con ↺ 2859 reinicios — riesgo de inestabilidad funcional.  
- Espacio en disco al 78%: aún operativo pero cerca de umbrales que pueden afectar crecimiento de logs/operaciones.

3) Próxima acción recomendada
- Investigar causa del reinicio de MONI: ejecutar pm2 logs MONI --lines 200 y pm2 info MONI; revisar errores en los logs de la aplicación y journalctl.  
- Si es bug conocido, corregir y desplegar; si es por memoria/recursos, reiniciar y supervisar.  
- Liberar/rotar espacio si crece: revisar /var/log y ~/LVTP/memory, eliminar/archivar ficheros antiguos o aumentar capacidad si necesario.

4) Prioridad
- Alta para investigar y detener el flapping de MONI (impacto inmediato).  
- Media para gestión de disco (planear limpieza/rotación si sigue creciendo).


# Moni Cognition — 2026-05-28T02:19:19.812847+00:00

1) Estado del nodo
- Procesos: PM2 muestra todos los procesos "online" (MONI, MONI_EVENT_WORKER, MONI_LOOP, MONI_WATCHDOG, booking-event-server).  
- MONI (id 0) tiene uptime 2s pero ↺ = 2885 (muchos reinicios). Otros procesos llevan ~9h estables.  
- Disco raíz: 58G total, 43G usados (78%), 13G libres.  
- Memoria de eventos/logs en LVTP: events=12 ficheros, logs=5 ficheros.

2) Riesgos detectados
- Alta prioridad: MONI está inestable (flapping) — puede provocar pérdida de funcionalidades, cargas repetidas y consumo excesivo de recursos.  
- Medio: espacio en disco al 78%; suficiente ahora (13 GB libres) pero puede crecer si los logs/evts aumentan.  
- Bajo: pocos ficheros de eventos/logs (12/5) — si esto es anómalo, puede indicar caída en la ingestión o rotación errónea.

3) Próxima acción recomendada
- Investigar por qué MONI reinicia: ejecutar y revisar logs recientes: pm2 logs MONI --lines 200 y pm2 describe MONI. Buscar excepciones/stack traces.  
- Si es un bug conocido, desplegar rollback o corregir código; si es por saturación, limitar/reiniciar con cuidado: pm2 restart MONI sólo tras identificar causa.  
- Revisar crecimiento de disco y habilitar/forzar rotación de logs si procede (logrotate) y limpiar archivos grandes: du -sh ~/LVTP/* | sort -h.  
- Monitorear tras la intervención (comprobar que ↺ no siga aumentando).

4) Prioridad
- Alta — atender inestabilidad de MONI de inmediato.  
- Medio — planificación de limpieza/rotación de disco si persiste crecimiento.


# Moni Cognition — 2026-05-28T02:24:29.288742+00:00

1) Estado del nodo
- Operacional: todos los procesos pm2 aparecen "online". Servicios principales (MONI, workers, loop, watchdog, booking-event-server) corren.

2) Riesgos detectados
- MONI está inestable: ↺ (reinicios) = 2911 y uptime reciente de 8s → historial de flapping/recuperaciones frecuentes.
- Disco / está al 78% de uso (43G/58G): cerca de umbrales críticos si sigue creciendo.
- (Menor) conteo de eventos/logs en memoria bajo (12 eventos, 5 logs) — no crítico ahora pero vigilar si se deben conservar.

3) Próxima acción recomendada
- Prioridad 1: revisar logs de MONI para causa de reinicios: pm2 logs MONI --lines 200; corregir excepción/depurar y aplicar parche o ajustar config/restarts.
- Prioridad 2: auditar uso de disco y limpiar/rotar logs o archivos temporales (/var/log, ~/LVTP/memory, otros): du -h --max-depth=1 ~; eliminar/archivar lo no necesario.
- Monitorear nuevamente pm2 list y uso de disco tras cambios.

4) Prioridad
- Alta: resolver inestabilidad de MONI (puede afectar funcionamiento).
- Media: controlar/limpiar espacio en disco.


# Moni Cognition — 2026-05-28T02:29:42.096969+00:00

Soy Moni. Resumen corto:

1) Estado del nodo
- PM2: todos los procesos muestran estado "online".
- Atención: proceso MONI tiene uptime 12s pero contador de reinicios ↺ = 2935 (flapping).
- Disco: / (58G) 78% usado (43G usados, 13G libres).
- Memoria de procesos: consumo moderado (≈10–75 MB).
- Eventos/logs en memoria: 12 y 5 ficheros respectivamente.

2) Riesgos detectados
- Alto riesgo: MONI está inestable (muchos reinicios) → posible pérdida de funcionalidad/consistencia.
- Riesgo medio: disco al 78% — si crecen logs/eventos puede llegar a crítico y provocar fallos.
- Riesgo operativo: si MONI está en bucle de reinicio puede generar más logs/uso de disco y agravar ambos problemas.

3) Próxima acción recomendada
- Inmediato: revisar logs del proceso MONI (pm2 logs MONI --lines 200) y syslog/journalctl para identificar causa del reinicio.
- Si el fallo es por falta de espacio, liberar/rotar logs (borrar/archivar logs antiguos en ~/LVTP/memory/logs) para recuperar espacio y luego pm2 restart MONI tras solucionar la causa raíz.
- Si es bug de aplicación, depurar y desplegar corrección antes de nuevos reinicios automatizados.

4) Prioridad
- Alta: investigar y detener el flapping de MONI ahora.
- Media: limpieza/rotación de disco si el crecimiento de logs es la causa.


# Moni Cognition — 2026-05-28T02:34:56.751091+00:00

1) Estado del nodo
- Servicios PM2: todos los procesos listados están "online".
- Disco raíz: 58G total, 43G usados (78% ocupado).
- Conteo en memoria: events = 12, logs = 5.

2) Riesgos detectados
- Proceso MONI con 2.957 reinicios (columna ↺) — indica crash/restart frecuente aunque ahora esté "online" (uptime 6s). Riesgo alto de inestabilidad o pérdida de datos.
- Espacio en disco al 78%: cercano a umbrales críticos (80–90%). Si crece, puede provocar fallos en logs/servicios.

3) Próxima acción recomendada
- Investigar causa de reinicios de MONI: revisar logs inmediatamente: pm2 logs MONI --lines 200
- Revisar tamaño y contenido de carpetas que consumen espacio y limpiar/rotar logs/events si procede:
  - du -sh ~/LVTP/*  y  du -sh ~/LVTP/memory/*
  - rotar/eliminar archivos antiguos en ~/LVTP/memory/logs y ~/LVTP/memory/events
- Si MONI sigue reiniciando, recopilar stacktraces y versión, y considerar arrancarlo manualmente en modo debug.

4) Prioridad
- Alta: investigar reinicios de MONI de inmediato.  
- Media: limpieza/rotación de disco a corto plazo.


# Moni Cognition — 2026-05-28T02:40:08.818634+00:00

1) Estado del nodo
- PM2: todos los procesos listados están online (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server).
- MONI acaba de reiniciarse (uptime 5s) y muestra 2981 reinicios acumulados.
- Disco / (58G): 43G usados, 13G libres → 78% de uso.
- Eventos en memoria: 12 archivos; logs en memoria: 5 archivos.

2) Riesgos detectados
- Alta probabilidad de inestabilidad: MONI presenta historial de reinicios (↺ 2981) — riesgo de crash-loop o fallo recurrente.
- Espacio en disco cercano a umbrales (78%) — riesgo de llenar el FS si los logs/ eventos crecen.
- Riesgo operativo si ambos problemas coinciden (p. ej. reinicios generan logs y consumen más disco).

3) Próxima acción recomendada (rápida)
- Inspeccionar logs de MONI: pm2 logs MONI --lines 200; revisar causa de reinicios y exit codes.
- Comprobar uso por directorio: du -sh ~/LVTP/* /var/log/* | sort -h para identificar archivos grandes.
- Limpiar/rotar logs o purgar eventos antiguos; si necesario, aumentar espacio en disco o mover datos.
- Si MONI sigue inestable, recoger stack traces/journalctl y redeploy/reiniciar controlado.

Comandos útiles:
- pm2 logs MONI --lines 200
- pm2 info MONI
- journalctl -u <servicio> --since "1h"
- du -sh ~/LVTP/* /var/log/* | sort -h

4) Prioridad
- Alta: investigar MONI inmediatamente (riesgo de servicio). Limpieza/rotación de disco: media-alta.


# Moni Cognition — 2026-05-28T02:45:18.731990+00:00

1. Estado del nodo
- Servicios PM2: todos los procesos listados están online. MONI y otros workers corriendo.
- Almacenamiento: / (58G) 78% usado (43G usados, 13G libres).
- Memoria de evento/log: pocos ficheros en memoria (events 12, logs 5).

2. Riesgos detectados
- MONI muestra 3005 reinicios (↺ = 3005) con uptime muy corto (11s) → comportamiento inestable/loop de reinicio. Riesgo alto de mala disponibilidad o pérdida de datos operativos.
- Disco al 78%: por ahora aceptable, pero se aproxima a umbrales críticos (>85–90%) si no se controla.
- Si el reinicio de MONI está relacionado con logs o almacenamiento, podría agravar el uso de disco.

3. Próxima acción recomendada
- Investigar causa del reinicio de MONI: revisar logs inmediatamente (ej.: pm2 logs MONI --lines 200) y detalles (pm2 describe MONI / pm2 show MONI). Buscar errores, excepciones o OOM.
- Si los logs crecen rápido, rotarlos/limpiarlos y liberar espacio. Localizar grandes consumos: du -sh ~/* | sort -h o ncdu /.
- Si el proceso está en crash-loop, detenerlo temporalmente (pm2 stop MONI) hasta corregir la causa para evitar más reinicios.
- Monitorear disco y establecer limpieza/rotación si necesario.

4. Prioridad
- Alta: investigar y detener el loop de reinicios de MONI.  
- Media: vigilar y gestionar uso de disco para evitar alcanzar umbrales críticos.


# Moni Cognition — 2026-05-28T02:50:36.253242+00:00

1) Estado del nodo
- Nodo operativo. Todos los procesos PM2 listados están "online".
- MONI está activo pero con uptime reciente (3s) y alto contador de reinicios (↺ 3029).
- Disco raíz: 58G total, 43G usados (78%).
- Eventos en memoria: 12 ficheros; logs en memoria: 5 ficheros.

2) Riesgos detectados
- Flapping/instabilidad de MONI (3029 reinicios) → riesgo de pérdidas de funcionalidad o degradación intermitente.
- Uso de disco en 78% → margen reducido; riesgo de alcanzar umbrales críticos si crecen logs/filestore.
- Aunque eventos/logs en memoria son pocos, el alto recuento de reinicios es priorizable.

3) Próxima acción recomendada
- Revisar causa de reinicios de MONI: pm2 logs MONI --lines 200 y /var/log/syslog o journalctl -u si aplica.
- Corregir la causa (bug, dependencia, OOM, permisos) o redeploy si procede.
- Liberar/rotar espacio si procede: revisar /var/log y directorios grandes (du -sh /*,/home/*), limpiar o configurar logrotate.
- Monitorizar tras la corrección (pm2 monit / pm2 show MONI) y comprobar que ↺ deje de incrementarse.

Comandos útiles:
- pm2 logs MONI --lines 200
- journalctl -u <servicio> --since "1 hour ago"
- sudo du -sh /var/log/* | sort -h

4) Prioridad
- Alta: investigar y resolver el flapping de MONI de inmediato; limpieza de disco con prioridad media-alta para evitar llenado.


# Moni Cognition — 2026-05-28T02:55:48.860868+00:00

Soy Moni. Resumen breve:

1) Estado del nodo
- PM2: servicios activos (MONI, MONI_LOOP, MONI_EVENT_WORKER, MONI_WATCHDOG, booking-event-server) todos "online".
- MONI muestra comportamiento inestable: uptime 8s con 3053 reinicios (↺=3053).
- Disco /: 58G total, 43G usados, 13G libres (78%).
- Conteo en memoria: events=12, logs=5.

2) Riesgos detectados
- Alta probabilidad de fallo funcional por MONI en crash-loop (3053 reinicios). Puede degradar o interrumpir la plataforma.
- Espacio en disco en 78%: riesgo de quedarse sin espacio si crecen logs/dumps; comienzan a entrar en zona de atención (>80–85%).
- (Menor) Si MONI falla repetidamente puede generar más logs y consumir disco rápidamente.

3) Próxima acción recomendada
- Revisar logs de MONI para causa raíz: pm2 logs MONI --lines 200
- Identificar error/stacktrace, confirmar si es por despliegue reciente, dependencia o memoria.
- No reiniciar a ciegas: si es una condición reproducible, corregir la causa (rollback o parche) y luego pm2 restart MONI.
- Liberar espacio si hay archivos grandes: revisar du -sh ~/LVTP/memory/* y rotar/limpiar logs; configurar rotación si no existe.
- Establecer alerta de disco cuando supere 80–85%.

Comandos sugeridos rápidos:
- pm2 logs MONI --lines 200
- pm2 show MONI
- du -h ~/LVTP/memory | sort -h
- sudo journalctl -u <servicio> --since "1 hour ago" (si aplica)

4) Prioridad
- Alta — resolver inestabilidad de MONI de inmediato; limpieza de disco en prioridad media-alta si el uso sigue creciendo.


# Moni Cognition — 2026-05-28T03:01:03.451808+00:00

Soy Moni. Resumen breve:

1) Estado del nodo
- Nodo activo. Disco / (58G) uso 78% (13G libres).
- PM2: 6 procesos online. MONI mostró uptime 0s y cpu 100%; contador de reinicios muy alto (↺ 3078) — parece haberse reiniciado ahora mismo y consume CPU al 100%.

2) Riesgos detectados
- MONI podría estar en bucle de arranque/ocupando toda la CPU: degradación o indisponibilidad de la funcionalidad crítica.
- Alto contador de reinicios indica problema persistente (crashloop/bug).
- Riesgo secundario: si el problema genera logs/eventos masivos, el disco puede llenarse eventualmente (ahora no crítico).

3) Próxima acción recomendada (inmediata)
- Capturar logs y estado del proceso:
  - pm2 logs MONI --lines 200
  - ps -p 60722 -o pid,ppid,pcpu,pmem,etime,cmd
  - top -b -n1 | head -20
- Si no queda claro, obtener trazas:
  - strace -p 60722 -s 200 -o /tmp/moni.strace (corto, 10–30s)
- Si MONI está inutilizable o sigue flapping: guardar logs y reiniciar/rollback:
  - pm2 stop MONI && pm2 start MONI (o pm2 restart MONI) después de respaldar logs/config.
- Revisar cambios recientes en código/config y revisar ~/LVTP/memory/logs y ~/LVTP/memory/events.

4) Prioridad
- Alta — proceso principal con CPU 100% y alto número de reinicios requiere atención inmediata.
