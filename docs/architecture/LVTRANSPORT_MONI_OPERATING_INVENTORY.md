# Inventario operativo de LVTransport y MONI

Verificado el 27 de noviembre de 2026 en Minisforum. Para delegar una tarea, MONI debe comprobar tres cosas en el nodo elegido: herramienta instalada, prueba reciente de funcionamiento y capacidad autorizada para la acción. Un servicio de laboratorio detenido y una instancia operativa son registros distintos.

| Herramienta | Ubicación o interfaz | Estado comprobado | Uso autorizado de MONI y brecha |
| --- | --- | --- | --- |
| Bruno 4.3.0 | Menú de aplicaciones y `~/.local/opt/bruno-4.3.0/opt/Bruno/bruno` | Paquete y ejecutable presentes. Sin colección LVTransport localizada | Pruebas manuales de API. Preparar una colección versionada de staging y verificar su ejecución antes de ofrecerla al Job Manager |
| Playwright 1.65.1 | Dependencia `@playwright/test` del repositorio LVTransport y Chromium en `~/.cache/ms-playwright` | Chromium 159.0.8154.6 arrancó. La comprobación leyó un encabezado y obtuvo HTTP 200 de staging en modo Stripe de prueba | Preparar una suite de staging con comando fijo y recibo. La comprobación web se ejecutó localmente y la aceptación de la app LV instalada sigue su propio flujo |
| Uptime Kuma 2.5.12 | Contenedor `uptime-kuma`, interfaz privada en el puerto 13001 | Running, healthy. HTTP 302 en la entrada local | El supervisor ya lee salud pública y de staging. Falta un conector autorizado si MONI va a leer eventos o inventario de monitores de Kuma |
| n8n de LVTransport 2.46.6 | Contenedor `lvtp-n8n-notifications` | Running y `/healthz` respondió OK. Telegram sigue pendiente de prueba de entrega | Staging usa el webhook de notificaciones en modo SMS simulado. Una ejecución de avisos reales necesita su autorización y evidencia |
| n8n de laboratorio MONI | Contenedor `moni-v10-test-n8n` | Detenido, código 255 | Mantener como instancia de laboratorio. El flujo de LVTransport usa su contenedor dedicado |
| Ollama 0.40.16 | `/usr/local/bin/ollama` y modelo `moni-engineering:9b` ID `5eea597482b7` | Servicio accesible y catálogo confirmado. El piloto #220 produjo un parche con el respaldo Ollama | Reutilizar los perfiles de ingeniería, diagnóstico y revisión existentes. Registrar modelo y nodo por encargo |
| OpenCode 1.19.6 | `~/.opencode/bin/opencode` y `~/.local/share/moni-workflows/engineer.py` | CLI responde. En #220 alcanzó el proveedor y agotó el plazo; Ollama produjo el candidato | Mantener el perfil fijo y el respaldo existente. Comprobar ejecución dentro del plazo antes de ampliar el alcance |
| LM Studio | `~/.lmstudio/bin/lms`, CLI commit `138dcff` | Instalado. Servidor detenido durante la lectura. #216 conserva una prueba anterior de inferencia | Usar como proveedor opcional cuando el servicio esté disponible y el perfil lo autorice |
| ADB 34.0.4 y scrcpy 5.0.1 | Minisforum, `adb` y `~/.local/bin/scrcpy` | ADB detectó Galaxy. Fossibot no figuró en esa consulta. Se confirmó la versión de scrcpy | El supervisor puede recuperar el túnel de staging para modelos conocidos. Falta habilitar la tarea de aceptación en app instalada con un recibo por portal |
| Deskflow 1.17.0 e Input Leaf | `galaxy-deskflow-wifi.service` e Input Leaf en Galaxy | Sesión TCP establecida por Tailscale. La prueba anterior confirmó la reconexión automática tras reiniciar el relay | Control interactivo autorizado y verificación del estado. Conservar TLS y la restricción al dispositivo conocido |
| Tailscale 1.104.7 | `tailscale` y red privada de equipos | La sesión Deskflow desde Galaxy estaba establecida en la red privada | Usar destinos y acceso ya autorizados. Los observadores de Aspire y Viviana conservan sus enlaces locales |
| Stripe CLI 1.55.15 | `lvtp-stripe-staging-listener.service` | Listener activo. El backend confirmó `payments: stripe-test` | Reusar solo el listener de staging y verificar entregas firmadas con evidencia del receptor |
| Grafana de laboratorio | Contenedor `moni-v10-test-grafana` | Detenido, código 1. Versión exacta sin verificar | Pendiente diagnosticar el arranque antes de asignarle observabilidad operativa |

## Actualización y ejecución

El supervisor y el Job Manager existentes son el punto de integración. Cada nuevo perfil debe fijar nodo, herramienta, entradas, evidencia y alcance. En cada ciclo documentar la última comprobación y el bloqueo o la reparación autorizada. Los perfiles que ya funcionan pueden seguir cuando otro queda bloqueado. Versionar en GitHub los cambios de capacidad y enlazar los resultados desde Founder OS y MONI. El inventario inicial es una instantánea. La actualización automática aún debe implementarse y verificarse.

El despacho automático de dos perfiles fijos ya se comprobó. La ampliación del catálogo y la publicación de una PR de ingeniería con CI siguen en [MONI Core #222](https://github.com/LVTP2004/moni-core-runtime/issues/222). [Continuidad de la cola](LVTRANSPORT_MONI_QUEUE_CONTINUITY_2026_11_27.md) · [Deskflow y Galaxy](LVTRANSPORT_GALAXY_DESKFLOW_RECONNECT.md).
