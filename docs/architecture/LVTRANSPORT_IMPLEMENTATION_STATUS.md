# LVTransport — estado verificable de implementación

Actualizado: 2026-11-15. Decisiones: ../LVTRANSPORT_DECISIONS.md.
Implementación local autorizada de plataforma funcional. Sin merge. Despliegue VPS autorizado, realizado y verificado: ver VPS_DEPLOYMENT_2026_11_16.md.
La plataforma completa todavía no está terminada ni validada en producción.

## Recorrido implementado

Reserva pública → JSON existente → intake operacional con identidad conservada.
Admin autenticado → vehículo registrado (propio/externo) → conductor autorizado y
presencia reciente → asignación persistida en la misma reserva → conductor asignado
acepta/inicia/completa mediante transiciones canónicas → tracking del mismo registro.
No se inventan Trip IDs: la ejecución física usa por ahora el lifecycle existente.

Asignaciones, versiones, recibos idempotentes y transiciones de auditoría sobreviven
reinicios. Las escrituras usan fichero temporal, fsync, rename y lectura de comprobación.
La consistencia de comandos requiere UN proceso escritor Node: esto no ofrece bloqueo
multiproceso ni una transacción distribuida. No desplegar varios escritores sobre ese JSON.
El Map histórico conserva la función de intake compatible; no es autoridad del nuevo
flujo persistido. No se sobrescriben proyecciones históricas avanzadas al leer intake.

## Identidad y superficies reales

Firebase SDK oficial → sesión verificada en backend; cada comando vuelve a verificar
identidad/estado/alcance. La cuenta admin autorizada anteriormente sigue documentada;
no se aplicaron nuevos grants. Los conductores deben existir con role=driver y
status=active en Firebase; no hay conductores sembrados ni botones para autoasignar roles.

Cliente: acceso Google de alcance propio, reservas vinculadas al UID verificado,
consulta y cancelación de reservas propias pendientes. Una cuenta Firebase sin claims
puede identificarse como cliente solo mediante el verificador explícito de ese alcance;
esto no escribe claims ni abre Operations. No se reclaman reservas anónimas por email.
El formulario conserva el envío anónimo existente cuando no hay sesión de cliente.

Admin: reservas persistidas, alta de vehículos propios/externos, disponibilidad real,
asignación y cancelación. Driver: vehículo, disponibilidad, heartbeat separado de la
intención, reservas asignadas y acciones válidas del lifecycle. Refresco y errores sin
éxitos optimistas. Las pantallas reutilizadas se montan también desde la web pública.

Ubicación: opt-in del conductor asignado con permiso del navegador; sesiones de envío
invalidan muestras/stop atrasados de sesiones anteriores. Solo admin y cliente dueño
ven coordenadas recientes. Tracking anónimo no expone GPS. Observaciones efímeras,
expiran en dos minutos, no se guardan en el JSON y no equivalen a posición físicamente
verificada. El fin del viaje detiene el acceso a su posición. No se inventan ETAs.

MoniRide: ayuda discreta, enlaces y consulta al tracking real; no afirma conexión con
un modelo IA, motor de pagos ni MONI Core. Founder conserva una frontera explícita:
admin no recibe autoridad Founder/Finance. Falta conectar su superficie real.

## Patrones BBox aplicados

Identidad estable, relaciones explícitas conductor/vehículo/reserva, estado deseado
separado de presencia observada, timestamps/frescura, autorización backend,
idempotencia, auditoría y lectura posterior a escritura. Sin XMO, firmware copiado,
subjects NATS nuevos, otro control plane ni microservicios adicionales.

## Verificación

11 pruebas HTTP operativas: recorrido completo con disco temporal y reinicio,
permisos/versión/transiciones, revocación, concurrencia y doble asignación,
heartbeat atrasado, propiedad cliente, cancelación idempotente, health y GPS consentido.
5 pruebas HTTP de intake: deduplicación, fallo de proyección/escritura y recuperación.
9 auth-boundary, 4 SDK Firebase, 4 panel-entry, 6 cliente operacional,
2 cliente de tracking MoniRide, 2 sesión HTTP y 1 launcher; 22 simulaciones Python.
Total comprobado: 66 pruebas correctas, sin fallos en las suites enumeradas.
Datos e identidades sintéticos se limitan a tests, sin insertar registros de producción.
Typecheck de las apps y builds web/admin/driver/business y API correctos en copia
temporal; git diff --check correcto. No se generan mirrors en el repo.
Estas pruebas no sustituyen Google Login real en navegador ni aceptación en producción.

## Pendientes concretos

- Verificar Google Login en navegador con cuentas/vehículos autorizados.
- Firebase: lvtransport.be y www.lvtransport.be añadidos con autorización explícita
  y lectura posterior correcta; ver FIREBASE_AUTHORIZED_DOMAINS.md. Login real
  en navegador sigue pendiente.
- Dispatch automático, expiración/reasignación automática y recuperación operacional
  offline no están demostrados por este flujo; no trasladar garantías del Map antiguo.
- Finance/pagos/facturas/liquidaciones: proveedor y comisiones/límites definitivos
  pendientes. Las tarifas públicas existentes se preservan. No hubo movimientos reales.
- Founder OS y conexión de MONI Assistant de proyecto requieren integración real,
  manteniendo separación de autoridad y posibilidad de venta independiente.
- Observabilidad/readiness de proveedores: UNKNOWN cuando no se ha comprobado;
  liveness HTTP no certifica Firebase, pagos ni infraestructura.
- Despliegue VPS inicial realizado con autorización específica posterior: Nginx/PM2,
  HTTPS y firewall configurados; DNS conservado. Merge no realizado. Ver informe de despliegue.

## Archivos de esta fase y justificación de alcance

El alcance es la plataforma completa, no una modificación visual de homepage.
Se preservan cambios previos/concurrentes; package.json/lock y otros archivos de auth
ya modificados previamente no se reinterpretan como cambios de esta fase.

| Archivo | Motivo |
| --- | --- |
| AGENTS.md | Referencia persistente a decisiones y trabajo vigente |
| docs/LVTRANSPORT_DECISIONS.md | Requisitos confirmados, autoridad y límites |
| docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md | Estado, evidencia y pendientes |
| apps/api/src/modules/bookings/service.ts | Intake tras persistencia y alcance de identidad |
| apps/api/src/modules/bookings/operational-projection.ts | Compatibilidad sin sobrescribir operación avanzada |
| apps/api/src/modules/bookings/repository.ts | Escritura verificable y operaciones sobre almacén existente |
| apps/api/src/modules/bookings/dto.ts | Identidad verificada interna y relación de asignación |
| apps/api/src/modules/bookings/fingerprint.ts | Separar dedupe público de identidad verificada |
| apps/api/src/modules/bookings/operations.ts | Comandos, permisos, idempotencia, presencia y GPS |
| apps/api/src/routes/v1/customer-booking.routes.ts | Factory de servicio y contrato público conservado |
| apps/api/src/routes/v1/booking-operations.routes.ts | API autenticada de operaciones |
| apps/api/src/routes/v1/customer-account.routes.ts | Recursos propios del cliente verificado |
| apps/api/src/routes/v1/auth-session.routes.ts | Sesión de cliente de alcance explícito |
| apps/api/src/routes/v1/index.ts | Montaje con instancia operacional compartida |
| apps/api/src/auth/services/firebase-admin-bootstrap.ts | Verificador cliente y directorio real driver, sin grants |
| apps/api/src/auth/services/firebase-identity-verifier.ts | Alcance cliente opcional en verificador confiable |
| apps/api/src/controllers/health.controller.ts | Respuestas HTTP y readiness honesto |
| packages/auth/src/services/operations-client.ts | Peticiones verificadas y cierre de presencia/GPS |
| packages/auth/src/index.ts | Exportar cliente y tipos reutilizables |
| packages/auth/src/providers/firebase-auth.provider.ts | Admitir superficie cliente sin otorgar roles |
| apps/admin/src/app/VerifiedPortal.tsx | Montaje autenticado de operación persistida |
| apps/admin/src/app/BookingOperations.tsx | Gestión real de reservas/flota/asignación |
| apps/admin/src/modules/auth/components/GoogleLoginBoundary.tsx | Verificación backend antes de abrir pantalla |
| apps/driver/src/app/VerifiedPortal.tsx | Montaje autenticado de operación driver |
| apps/driver/src/app/DriverOperations.tsx | Disponibilidad, viaje y consentimiento GPS |
| apps/driver/src/modules/auth/components/GoogleLoginBoundary.tsx | Sesión verificada compartiendo contrato |
| apps/web/src/pages/OperationsAccess.tsx | Reutilizar portales; frontera Founder explícita |
| apps/web/src/pages/PublicBooking.tsx | Reserva real y reintentos idempotentes sin mirrors obsoletos |
| apps/web/src/pages/CustomerAccount.tsx | Recursos y seguimiento del propio cliente |
| apps/web/src/pages/PublicHome.tsx | Conservar Hero y ayuda MoniRide discreta |
| apps/web/src/modules/moni/components/LiveMoniAssistant.tsx | Ayuda/tracking con datos reales |
| apps/web/src/modules/moni/components/MoniAssistant.tsx | Reexportar implementación real |
| apps/web/src/modules/moni/services/booking-status-client.ts | Validar respuesta/ref sin inventar estados |
| apps/web/src/main.tsx | Montaje y carga diferida de superficies existentes |
| apps/web/tailwind.config.ts | Incluir estilos de las cuatro pantallas reutilizadas |
| tests/booking-operations-http.test.mjs | Intake real con persistencia temporal |
| tests/operational-platform-http.test.mjs | E2E HTTP, permisos, concurrencia y GPS |
| tests/auth-boundary.test.mjs | Aislamiento del alcance cliente |
| tests/auth-session-http.test.mjs | Sesión cliente no abre sesión operacional |
| tests/operations-client.test.mjs | Cliente verificado, errores y permisos |
| tests/public-booking-client.test.mjs | Tracking MoniRide sin inferencias falsas |

No se reemplaza API productiva por mock, localStorage ni demo. No se cambian tarifas,
rutas públicas, lifecycle canónico, Hero, configuración de despliegue ni mirrors JS.

### Continuidad: cierre de sesión (2026-11-15)

Corregido en packages/auth/src/services/operations-client.ts: el fallo al detener
el GPS ya no impide intentar retirar disponibilidad antes de cerrar la sesión.
Regresión añadida en tests/operations-client.test.mjs; seis pruebas del cliente
correctas. Son los dos archivos de código/pruebas modificados en este seguimiento;
este informe registra el resultado. No cambian endpoints, lifecycle, permisos reales,
producción, dependencias ni mocks de producción.

### Autorización de publicación

Leonardo autorizó desplegar en la VPS ubuntu@51.222.107.59. Primera conexión SSH
rechazada porque su clave ED25519 no figura en known_hosts. No se desactivó la
verificación de host ni se modificó la VPS. Pendiente verificar identidad SSH.

### VPS publicada (16-11-2026)

SSH validado y publicación completada; la falta de acceso registrada anteriormente
quedó resuelta mediante la clave pública instalada por Leonardo. HTTPS/archivos/API
y lectura Firebase desde VPS verificados. Ver VPS_DEPLOYMENT_2026_11_16.md.

### Base visual seleccionada publicada — 16-11-2026

Leonardo eligió Calm Luxury Mobility como base incompleta. HeroSection.tsx ahora
usa su identidad visual y consulta tracking real; mantiene tarifas/servicios y
enlaza reservas/portales existentes. Cuatro accesos MONI según #409, sin nuevos
permisos. Ver CALM_LUXURY_HOME_2026_11_16.md (archivos, checks y respaldo).
#128 se mantiene exclusivamente como análisis; no se implementó chat/voz/gobernanza.

### Entrega verificada — revocación HTTP 401 (18-11-2026)

Solicitud de Leonardo: coordinar modelos locales y registrar en GitHub cada avance
verificado. Este registro distingue la entrega del trabajo previo aún sin commit.

- `packages/auth/src/services/operations-client.ts`: invalidar el cliente y ejecutar
  cierre de sesión antes de interpretar el cuerpo de una respuesta HTTP 401.
  Un callback de presentación que falla tampoco evita intentar signOut.
- `tests/operations-client.test.mjs`: regresiones para 401 con HTML, cuerpo vacío,
  JSON inválido y callback que falla; las siguientes solicitudes quedan bloqueadas.
- Este documento: evidencia y límites de la entrega.

Reproducción: la prueba de cuerpos no JSON falló antes del arreglo (callback no
invocado). Tras el arreglo, 8 pruebas del cliente, 9 de auth-boundary y 2 de tracking
pasan (19 en total). Typecheck de web/admin/driver correcto. Builds Vite de esas
3 apps correctos con salida en /tmp, sin generar bundles/mirrors en el repositorio.
`git diff --check` correcto. Validación sobre el workspace completo existente;
no equivale a certificar un checkout limpio de esta entrega aislada.

Orquestación ejecutada: Qwen3:8b (93,84 s) y Gemma4:12b (73,02 s), por turnos en
Minisforum, revisaron el código anterior con una pregunta dirigida sobre 401 no JSON.
Ambos describieron el fallo; no son descubrimientos independientes ni pruebas de
corrección. Qwen propuso un test incompatible con este contrato y no se copió.
Los tests ejecutables y el parche fueron revisados por Codex.

VPS: leonidas-ollama.service activo; modelo qwen3:1.7b confirmado por /api/tags.
Se encargó revisión independiente por /api/chat: completó 220 tokens sin texto en
message.content; no se acepta como revisión útil ni como cambio realizado.
No se editó código ni configuración de producción en la VPS.

Artefactos de ejecución temporales: /tmp/lvtp-local-reviews-20261118/ y
/tmp/lvtp-vps-review-20261118.txt (no persistentes ni necesarios para usar el arreglo).
No hubo nuevos permisos de usuario, cambios de endpoints/lifecycle/dependencias,
mock de API, merge o despliegue. Esta entrega no termina la plataforma completa.

### Entrega publicada — validación de reservas (19-11-2026)

Autorización posterior de Leonardo: desplegar entregas con pruebas positivas y
registrar cada avance en GitHub; ver LVTRANSPORT_DECISIONS.md. Sin merge automático.

MONI devolvió trabajos aislados de ingeniería completados de Codex y Devstral,
ambos sobre validation.ts. Se revisó la propuesta de Devstral (tarea
0f26cbb49d34c3c671fb4affb01c11cb), adaptando comprobaciones null para conservar los
errores de campos ausentes. Cuatro guardas rechazan payload array y pickup,
destination o fecha con tipos incorrectos antes de trim/Date. Se conserva el alias
scheduledAt, la precedencia de scheduleAt, normalización y reglas existentes.

Pruebas propias: antes, 3 de 4 regresiones fallaban; después pasan 4 de validación,
8 de cliente operacional y 16 HTTP de reservas/operación (28 en total). Typecheck
API, bundle esbuild y diff --check correctos. Qwen3:1.7b revisó cobertura desde la
VPS, pero su respuesta confundía casos válidos: descartada como evidencia de
aceptación. No se aplicaron sus sugerencias. Esto demuestra consumo de un parche
acotado de MONI/Devstral, no autonomía general ni ejecución sin supervisión.

Despliegue 2026-11-19 06:31:54 UTC: baseline reconstruida idéntica byte por byte a
la API activa (SHA256 3db485aa…); candidate solo añade las cuatro comprobaciones
(SHA256 ffd82bdb…). Backup: /home/ubuntu/lvtp-backups/booking-validation-20261119T063154Z.
Sustitución atómica de server.cjs y reinicio de lvtransport-api con su configuración
existente. /health volvió a 200; tres endpoints privados mantienen 401; dos
solicitudes deliberadamente inválidas rechazadas con 400 antes de crear reservas.
No se escribieron datos de reservas ni se cambiaron Nginx, DNS, SSL, puertos,
variables, dependencias o permisos. La web permanece intacta.

La corrección de sesiones del 18-11 sigue pendiente de despliegue web: los assets
publicados difieren de la copia local y no se sobrescribieron cambios ajenos.
Evidencia persistente y hashes: verification/LVTP_BOOKING_VALIDATION_20261119.json.

Archivos de esta entrega y motivo:
- apps/api/src/modules/bookings/validation.ts: cuatro comprobaciones de tipos.
- tests/booking-validation.test.mjs: regresiones y compatibilidad del contrato.
- docs/LVTRANSPORT_DECISIONS.md: autorización posterior de entregas a VPS/GitHub.
- docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md: resultado y pendientes.
- verification/LVTP_BOOKING_VALIDATION_20261119.json: recibos, hashes y verificación.

API autorizada por el alcance funcional; no se tocaron archivos prohibidos fuera
del alcance. No se reemplazó API por mocks, demo ni almacenamiento del navegador.
