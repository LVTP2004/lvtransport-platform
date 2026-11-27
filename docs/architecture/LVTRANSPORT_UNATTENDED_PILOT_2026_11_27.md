# Ensayo de trabajo distribuido I/J del 27 de noviembre de 2026

Referencia `tLMz48`. Se tomó una copia aislada del árbol de integración local sobre `a7708afbdcba16dcef7e146c4501297daab3bdfd` con los cambios de staging existentes. El ensayo usó datos sintéticos y Stripe simulado.

| Plan | Nodo para revisión Qwen | Prueba integrada por Codex en Minisforum |
| --- | --- | --- |
| I | Viviana | Sin servicio de entrega, `emailCode: false`, respuesta no almacenable y rutas de solicitud y canje desactivadas. |
| J | Aspire | Una cuenta financiera habilitada puede solicitar un reembolso, recibe HTTP 409 al intentar aprobarlo ella misma y no produce escrituras de reembolso en Stripe. |

Minisforum verificó 15/15 pruebas mediante `node --import tsx --test tests/auth-session-http.test.mjs apps/api/src/modules/payments/staging-checkout.test.ts`. El parche incremental pasa `git apply --check` sobre el árbol de integración. Parche y evidencias locales en `~/.local/share/moni/lvtp-parallel/unattended-tLMz48/`.

Las revisiones Qwen se despacharon por SSH a servicios de usuario de systemd. El primer despacho falló porque el ejecutable de Ollama no estaba disponible en su entorno. El segundo usó directamente la API local en loopback y ambos servicios arrancaron después de la corrección. El código de las pruebas se preparó y verificó en Minisforum.

El relevo anteriormente validado corresponde al piloto C2 de lectura pública. Sigue pendiente validar la reasignación de un encargo de ingeniería al interrumpir su ejecutor y recuperar la cola si cae su propio host. Para la aceptación real de I/J todavía se requieren entrega de correo, acceso por portal y una segunda cuenta de finanzas verificada en staging para el reembolso en Stripe de prueba. También faltan las decisiones fiscales y de liquidación y la aceptación final en dispositivo. Este ensayo no realizó ningún despliegue.
