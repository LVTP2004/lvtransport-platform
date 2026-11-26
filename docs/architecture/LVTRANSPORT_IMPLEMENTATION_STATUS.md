# LVTransport — estado verificable de implementación

Actualizado: 2026-11-15. Decisiones: ../LVTRANSPORT_DECISIONS.md.
Implementación local autorizada de plataforma funcional. Sin merge. Despliegue VPS autorizado, realizado y verificado: ver VPS_DEPLOYMENT_2026_11_16.md.
La plataforma completa todavía no está terminada ni validada en producción.

## Continuidad del historial

Consultar el [inventario de commits, PR y pendientes de staging](continuidad-historica-2026-11-20/README.md) antes de recuperar o sustituir funciones históricas.

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

### Sesiones publicadas conservando la web — 19-11-2026

La corrección 401 del 18-11 ya está desplegada. La web activa no correspondía al
build del workspace; para preservar sus cambios se preparó un paquete acotado:
compilación de operations-client.ts, sustitución de su clase mediante AST en el
módulo publicado y nuevos nombres/referencias para los cuatro JS alcanzables.
Las cuatro entradas HTML solo cambian la referencia del script. CSS, textos,
rutas, componentes de presentación y assets anteriores permanecen intactos.
No se editaron mirrors generados del repositorio ni se publicó el build local completo.

Herramienta reproducible de preparación (solo escribe un directorio nuevo /tmp):
`node tools/release/prepare-session-patch.mjs SNAPSHOT_PUBLICO /tmp/SALIDA_NUEVA`
Requiere snapshot completo de la web; rechaza enlaces simbólicos, una salida
existente y una clase de cliente con una interfaz inesperada. El manifiesto
registra hashes anteriores/nuevos y fuente. No realiza red, despliegue ni reinicios.
Para comprobar la clase compilada:
`node tests/operations-client.test.mjs --artifact=/tmp/SALIDA_NUEVA/deployed-client.cjs`
El fichero de prueba aislado no se publica en la web.

Verificación: 8 pruebas sobre fuente y las mismas 8 sobre cliente compilado,
parse de los cuatro módulos nuevos y typecheck web/admin/driver correctos.
Firefox headless comparó el texto de /, /booking/, /admin/, /driver/ y /founder
con el snapshot publicado; coincidió antes y después del despliegue. El navegador
importó además el módulo servido por HTTPS y comprobó un 401 HTML con fetch
sintético local al test: callback y signOut una vez, petición posterior bloqueada.
Esto no creó reservas ni verificó Google Login con una cuenta real.
Una primera prueba navegaba antes de acabar los imports diferidos y cancelaba una
descarga; se corrigió la espera del harness, y la repetición pasó sin errores JS.

Publicado 2026-11-19 07:07:15 UTC con comprobación previa de hashes, assets antes que
HTML, reemplazos atómicos, respaldo completo y rollback de entradas disponible.
Backup: /home/ubuntu/lvtp-backups/session-web-20261119T070715Z.
Ocho archivos comprobados byte a byte por HTTPS; cinco rutas y www correctos;
health API 200 y endpoints privados 401. CSS y API sin modificaciones, sin cambio
Nginx/PM2/DNS/SSL/puertos/variables/dependencias ni datos operacionales.
Evidencia: verification/LVTP_SESSION_RELEASE_20261119.json.

Archivos de esta entrega:
- tools/release/prepare-session-patch.mjs: preparar paquete mínimo desde fuente y snapshot.
- tests/operations-client.test.mjs: ejecutar las mismas regresiones contra el artefacto compilado.
- verification/LVTP_SESSION_RELEASE_20261119.json: manifiesto y recibos de pruebas/publicación.
- docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md: registrar resultado y aceptación pendiente.

No hubo cambios de producto fuera del alcance autorizado ni API sustituida por demo.
La aceptación Google real y el viaje completo con recursos autorizados siguen pendientes.

### Verificación tras el reinicio — 19-11-2026

Las entregas de reservas y sesiones constan en el PR #410, abierto. Los ocho
archivos de la corrección de sesiones servidos por HTTPS coinciden con los
SHA-256 del manifiesto. La API en api.lvtransport.be responde 200 JSON en
`/health` y 401 JSON a las lecturas anónimas de sesión, reservas operativas y
reservas de cliente. La portada y las rutas de reserva, Admin, Driver y Founder
responden 200 en el dominio público.

En el workspace actual pasan 53 pruebas Node y 22 de simulación Python.
También pasan el typecheck de las apps y los builds de web, admin, driver y
business con salida temporal. Este seguimiento actualiza solo este registro.

Para la aceptación en producción falta iniciar sesión en navegador con
Google y confirmar un conductor activo y un vehículo autorizado para la
prueba. El recorrido debe vincular una sola referencia desde la reserva del
cliente y la asignación de Admin hasta la aceptación, inicio y finalización
por el conductor, y comprobar los estados visibles en tracking. En esta
verificación se hicieron únicamente lecturas públicas y anónimas de producción.

### Corrección de acceso en Firefox — 19-11-2026

Firefox reprodujo un TypeError al utilizar la instancia del cliente como receptor
de fetch, antes de contactar a la API. Con fetch invocado como función, Firefox
headless recibió y aceptó una sesión Admin de un servidor de prueba local.
Las nueve pruebas del cliente pasan sobre la fuente y el artefacto compilado.
El typecheck de las apps pasa.

Publicado con respaldo en
`/home/ubuntu/lvtp-backups/browser-fetch-20261119T161743Z`. Los ocho archivos
verificados por HTTPS conservan el grafo de la web publicada. La API y Firebase
mantienen sus permisos. Falta confirmar el inicio con Google con la cuenta real,
seguido de una reserva y viaje usando un conductor y un vehículo autorizados.

- `packages/auth/src/services/operations-client.ts` corrige la llamada nativa.
- `tests/operations-client.test.mjs` comprueba el receptor y una sesión Admin.
- `tools/release/prepare-session-patch.mjs` reconoce el cliente ya publicado.
- Este registro documenta reproducción, verificación y respaldo.

Los dos componentes `GoogleLoginBoundary.tsx` de Admin y Driver contienen
diagnóstico adicional en el workspace local. Pasaron sus pruebas de entrada,
typecheck y builds Web/Admin/Driver. El parche en producción incluye únicamente
la corrección de fetch.

### Aceptación registrada y trabajo paralelo — 19-11-2026

El issue [#411](https://github.com/LVTP2004/lvtransport-platform/issues/411)
mantiene pendiente la aceptación con Google y un viaje de extremo a extremo
con recursos autorizados. Las pruebas locales usan identidades sintéticas.

- `apps/api/src/modules/bookings/operations.ts` elimina las observaciones y la
  sesión de GPS solo después de confirmar la escritura de la transición terminal.
- `tests/operational-platform-http.test.mjs` reproduce la pérdida de GPS tras un
  fallo antes del commit y comprueba que un reintento confirmado sí cierra el GPS.
- `apps/web/src/pages/PublicBooking.tsx` reutiliza el cliente de tracking que
  valida referencia y estado y descarta respuestas de consultas sustituidas.
- Este registro documenta los cambios y enlaza la aceptación pendiente.

Pasan 55 pruebas Node, 22 simulaciones Python, typecheck, build Web, bundle API
y `git diff --check`. Las dos correcciones quedan locales. La rama del PR #410
no contiene la base completa de esos módulos. Para publicar código de forma
reproducible queda consolidar la base, conservando los cambios existentes.

### Reanudación de la revisión tras el reinicio — 19-11-2026

Volvieron a pasar las 12 pruebas HTTP de la plataforma operativa, incluido el
fallo de escritura terminal con GPS activo, el typecheck y el build web con
salida temporal. Al consultar el árbol del PR #410 en `4b3216ea`, se confirmó
que siguen faltando `apps/api/src/modules/bookings/operations.ts`,
`apps/api/src/routes/v1/booking-operations.routes.ts`,
`apps/web/src/pages/PublicBooking.tsx` y `tests/operational-platform-http.test.mjs`.
El PR ya tiene los archivos de entrada `apps/web/src/main.tsx` y
`packages/auth/src/index.ts`, que deben compararse con sus versiones locales al
consolidar la base. La aceptación con identidades y recursos reales continúa en
el issue #411.

`qwen3-coder:30b` no pudo iniciar en Ollama por falta de memoria en la GPU.
La revisión directa comprobó que la limpieza de GPS se ejecuta después de
`repository.transact`, y la prueba HTTP confirmó que un fallo antes de guardar
preserva la sesión hasta el reintento exitoso.

### GPS y seguimiento publicados en la VPS — 19-11-2026

Entrega `gps-tracking-20261119T194949Z`. Se aplicaron parches acotados sobre
los artefactos activos para preservar las correcciones de producción. El bundle
de API difiere únicamente en la limpieza de GPS después de confirmar la
transacción. La web conserva su grafo de módulos y usa el cliente de seguimiento
existente para validar la referencia y el estado y descartar respuestas antiguas.
Se añadieron cuatro JS versionados y se actualizaron las referencias del script
en `index.html`, `booking/index.html`, `admin/index.html` y `driver/index.html`.

Pasaron 55 pruebas locales de Node, typecheck y build web. Sobre el bundle de
API candidato pasaron las 12 pruebas HTTP; la regresión de GPS falló como se
esperaba sobre el bundle anterior. Pasaron cuatro pruebas sobre el artefacto web
y una en Firefox. La comprobación previa al reinicio encontró cero reservas
asignadas activas. Se reinició `lvtransport-api` con su configuración existente.

Tras publicar, los ocho archivos web coincidieron por SHA-256 con las
respuestas HTTPS. Founder y tracking respondieron 200. La salud de la API
respondió 200 JSON, las tres rutas privadas 401 JSON y una referencia de
seguimiento inexistente 404 JSON. SHA-256 de la API activa:
`32b706018d3d479cc97fcffeded253646811763249b49dc8bb0817704fbeb6ed`.
Respaldo y manifiesto: `/home/ubuntu/lvtp-backups/gps-tracking-20261119T194949Z`.
Se conservaron los assets anteriores, los datos, el acceso real a la API y la
configuración de la VPS. La aceptación con Google y un viaje autorizado sigue
en el issue #411.

Las fuentes quedaron consolidadas en el PR #410, commit `c510828`. En una copia
limpia pasaron la instalación con lockfile congelado, 34 pruebas, el typecheck y
los builds de API, Web, Admin, Driver y Business. La lista de archivos e
integración está en el commit. Este paso no volvió a publicar en la VPS.

### Acceso sin contraseña con sesión recordada — 20-11-2026

Ride, Driver, Control Tower y Founder OS usan un formulario compartido con
enlace de correo y Google. El botón principal informa del envío y el formulario
confirma si el enlace se ha enviado. La sesión en el navegador es opcional y
se selecciona en el dispositivo donde se completa el acceso. Al volver al
portal, la web verifica otra vez el usuario y sus permisos con la API.
Cerrar sesión elimina la sesión guardada.

Founder OS guarda su sesión por separado de Control Tower en Firebase. El
backend conserva el permiso operativo de Admin que se usaba anteriormente
para Founder. Los correos del registro de decisiones se mantienen como
asignaciones previstas, pendientes de activación y verificación en producción.

Pasaron 12 pruebas de sesión y autorización, y el typecheck y la compilación
de Web, Admin y Driver. En Firefox a 420 px se verificaron los formularios
iniciales y de confirmación de los cuatro portales. La comprobación de navegador
no envió correos ni inició sesiones reales.

Publicado en la VPS el 20-11-2026 a las 08:30 UTC. Se añadieron cuatro módulos
JS versionados y solo se cambió la referencia al módulo principal en
`index.html`, `booking/index.html`, `admin/index.html` y `driver/index.html`.
El módulo público principal coincide byte por byte al normalizar las referencias
a los módulos de acceso. Los dos archivos CSS se conservan. Se verificaron por
HTTPS los hashes de las cuatro entradas, cuatro módulos y dos CSS. En Firefox
se comprobaron los cuatro formularios iniciales y las cuatro pantallas de
confirmación sin enviar correos. Queda por validar el acceso con las cuentas
reales. Respaldo: `/home/ubuntu/lvtp-backups/login-ux-20261120T083000Z`.

En local, «Mis reservas» sugiere el correo ya escrito en el formulario de
reserva. Una edición manual tiene prioridad, incluso si se borra el campo.
La sugerencia dura lo que dura la página. Firefox verificó el prellenado y la
edición sin enviar datos. Pasaron el typecheck de Web, Admin y Driver y el
build de Web. Publicado a las 09:41 UTC del 20-11-2026. El formulario
distingue la cuota agotada de un bloqueo temporal por demasiados intentos.
Firefox verificó el prellenado en producción sin enviar reservas ni correos.
Coincidieron los hashes HTTPS de los cuatro HTML, cuatro módulos y dos CSS.
Respaldo: `/home/ubuntu/lvtp-backups/email-prefill-20261120T094121Z`.

### Separación de Founder OS y Control Tower

La API local exige el rol `founder` activo y el correo verificado para conceder
`founder:read`. Founder puede consultar reservas, vehículos y conductores.
La vista de Founder omite datos de contacto y notas de reserva. Las escrituras
operativas conservan sus controles actuales y el panel Founder verifica el
permiso nuevo mediante la API antes de mostrar datos.

Pasaron 36 pruebas de autorización y operaciones, incluido el recorrido de
una reserva en un entorno aislado. Pasaron el typecheck de API, Web, Admin y
Driver y los builds aislados de API y Web. La separación sigue local. En
Firebase, el correo de Tower ya está verificado y le falta el rol. Driver ya
tiene el rol activo. Ride y Founder requieren una primera verificación.

### Alternativas de inicio de sesión

Ride y Driver tienen una integración local con Microsoft que utiliza la
verificación de sesión de la API y permite vincular Microsoft a un usuario
Firebase existente. El proveedor está deshabilitado en la interfaz hasta
configurar Microsoft en Firebase. Pasaron 13 pruebas de cliente, el typecheck
de Web, Admin y Driver y el build web con las dos configuraciones.

La revisión de producción confirmó que Firebase todavía no tiene configurado
el proveedor Microsoft y que la API no tiene un remitente de correo
transaccional configurado. El acceso por código para Tower y Founder está
pendiente de un servicio de entrega. No se modificaron cuentas ni permisos.

### Pagos en staging privado

Ride muestra el estado de la testbetaling por reserva verificada y el recibo
de simulación tras la captura. El servicio de staging usa una tarifa
confirmada de prueba de 42,50 EUR y una operación de reconciliación reservada
al administrador de pruebas. En la VPS, la prueba de integración verificó la
autorización, la captura después de finalizar, el mismo recibo al repetir,
la liberación al cancelar y la denegación de acceso para otros roles.

Pasaron tres pruebas del módulo de pagos, los typechecks de Web y API y el
build Web. El servicio de staging se reinició para publicar el cambio.
Producción y el emulador de identidad siguieron operativos. La integración
con un proveedor real, la tarifa operativa y la conciliación automática
siguen pendientes.

### Recuperación automática de pagos en staging privado

Al confirmar la tarifa de prueba con el rol de operaciones se registra una
autorización persistente. La tarea de recuperación consulta las autorizaciones
pendientes al iniciar y periódicamente. Captura tras completar el viaje y
libera tras cancelar o fallar. La automatización permanece activa en staging.

En la VPS se pausó la tarea, se finalizó la reserva de prueba 04928 y se
canceló otra. Ambas conservaron sus autorizaciones hasta reiniciar el
servicio privado. Al reiniciar, se recuperaron la captura y la liberación.
Las comprobaciones posteriores devolvieron el mismo recibo y ninguna emisión
para la cancelación. Pasaron las tres pruebas del servicio, el typecheck de
API y la compilación del bundle privado. Producción queda fuera del alcance.

### Reanudación tras el reinicio del 21-11-2026

Se verificó el árbol local existente con 63 pruebas Node, incluidas las
pruebas HTTP por loopback, el typecheck de las aplicaciones y el build de
Web con salida temporal. Se actualizaron las pruebas de entrada de Admin,
Driver y Founder para proporcionar la URL del navegador y verificar la
pantalla de acceso vigente. La prueba del popup de Google ahora proporciona
los exports que usa el adaptador actual de Firebase.

La copia local temporal del staging privado ya no existe. La consulta de
solo lectura a la VPS encontró el bundle `server-payments-auto.cjs` en
`/home/ubuntu/lvtp-staging/lvtransport-preview-d3638b86bce3`. Pasó
`node --check`. El archivo inicial de staging conserva fuentes de acceso
por código, pero su índice no incluye las fuentes de pagos. La comprobación
de procesos no confirmó que el worker del bundle estuviera activo. Quedan
pendientes la recuperación de las fuentes de pagos y la verificación
funcional del servicio privado. La consulta no leyó datos de pagos ni
reinició servicios.

### Fuentes de pagos recuperadas y comprobación del staging privado

Se recuperaron del historial el servicio de pagos simulados, su ruta de
lectura autenticada y las tres pruebas. El repositorio de staging conserva
la enumeración que utiliza el worker para retomar autorizaciones pendientes.
Las pruebas abren de nuevo el archivo y verifican que una captura o una
liberación elimina la autorización de la lista de recuperación. Pasaron las
tres pruebas y el typecheck de API. La ruta recuperada se mantiene sin montar.

El PID del servicio privado ejecuta `server-tower-reassignment.cjs`, una
versión posterior a `server-payments-auto.cjs`. Su endpoint local de salud
respondió con emulador de Firebase, pagos simulados y
`paymentRecovery: true`. Esta comprobación fue de solo lectura y no
ejecutó una nueva conciliación. Queda por repetir la prueba integral sobre
el bundle actual con reservas de prueba y recuperar el punto de entrada
completo de staging.

### Conciliación automática verificada en el staging activo

La prueba integral se ejecutó contra el bundle activo de Control Tower en
staging privado. Antes de crear reservas, verificó el emulador de identidad,
el buzón de pruebas, el modo de pagos simulados, la recuperación habilitada y
el permiso vigente del conductor de pruebas. Control Tower confirmó una
tarifa simulada de 42,50 EUR para cada reserva.

- La reserva de prueba 38407 recorrió asignación, aceptación, recogida y
  finalización. El worker capturó el importe automáticamente. El recibo se
  conservó al consultarlo de nuevo después de otros ciclos del worker.
- La reserva de prueba 44281 se canceló después de autorizar el importe.
  El worker liberó la autorización automáticamente y no emitió recibo.
- El cliente no pudo confirmar tarifas y Control Tower no pudo consultar el
  pago por la ruta reservada al pasajero. El seguimiento público reflejó la
  finalización y Founder pudo consultar el estado sin datos de contacto.

La prueba se ejecutó con identidades, vehículo y reservas de staging. No
reinició el servicio, desplegó código ni realizó cargos reales. La
recuperación del punto de entrada completo de staging sigue pendiente.

### Punto de entrada de staging recuperado

`tools/release/staging-entry-recovery.patch` conserva el punto de entrada
`preview-vps/entry.ts` y los ajustes de API necesarios para compilarlo.
El parche se comprobó sobre una copia aislada de `apps/api/src` que incluye
las fuentes de pagos simulados recuperadas anteriormente. La copia pasó
el typecheck de API, el build de esbuild para Node 22 y `node --check`.

La sección compilada desde `var projectId` hasta el final coincide con
la del bundle activo `server-tower-reassignment.cjs` de staging. SHA-256:
`41446720fe0db9b8cc81c4d7c9edb079d4d52ad9a1792934fd28aec10e916b8e`.
La coincidencia cubre el punto de entrada compilado. Los módulos que lo
preceden en el bundle no se compararon byte por byte. El modo Stripe de
prueba aparece en las fuentes recuperadas. La entrega activa se verificó
con pagos simulados.

El parche debe aplicarse a una copia aislada con `git apply`. Para compilar,
usar el esbuild instalado con Vite, `preview-vps/entry.ts` como entrada,
`bundle: true`, plataforma Node, formato CJS, destino Node 22 y
`firebase-admin/app`, `firebase-admin/auth` y `express` como externos.
No se ejecutó el nuevo bundle ni se modificó el servicio privado.

### Prueba integral del bundle reconstruido

El 21 de noviembre de 2026 se arrancó una copia byte por byte del bundle
reconstruido en un directorio temporal. Usó el emulador local de Firebase
Auth con el proyecto de demostración `demo-lvtransport-otp`, el buzón de
pruebas y un almacén de reservas nuevo. Los cuatro roles iniciaron sesión
por código. El conductor empezó sin permiso vigente, presentó un documento
de prueba por la API y obtuvo la aprobación de Control Tower.

- La reserva de prueba 47151 recorrió asignación, aceptación, recogida y
  finalización. El worker capturó automáticamente 42,50 EUR simulados y el
  recibo se mantuvo igual después de otros ciclos del worker.
- En la reserva de prueba 19187, el worker liberó la autorización al
  cancelar y la respuesta del cliente no incluyó recibo.
- La prueba comprobó la idempotencia de la creación y la asignación, el
  seguimiento público, la vista de Founder sin datos de contacto y la
  denegación de acciones fuera de los permisos de cada rol.

La prueba integral HTTP terminó con código 0. El servidor temporal y el
emulador se detuvieron al terminar. Se probó el modo de pagos simulados,
con Stripe deshabilitado y sin acceso a los datos del staging activo.

### Recuperación de pagos simulados tras reiniciar el servidor

Una segunda prueba pausó el worker y dejó dos autorizaciones persistidas
en un almacén temporal nuevo. Antes de detener el servidor, verificó por
HTTP que ambas seguían autorizadas después de finalizar la reserva 62780
y cancelar la 33058. Se arrancó el mismo bundle con el mismo almacén y se
reactivó el worker. Sin repetir las acciones de viaje ni confirmar de
nuevo las tarifas, el worker capturó 42,50 EUR simulados para la primera
reserva y liberó la segunda autorización sin emitir recibo. El recibo de
la primera se mantuvo estable durante los ciclos siguientes.

La prueba HTTP terminó con código 0. El emulador de Firebase Auth se
mantuvo activo durante el reinicio del servidor. Stripe permaneció
deshabilitado y el staging activo quedó intacto.

### Conciliación local con GitHub · #418 · 23-11-2026

El entorno local autorizado leyó el repositorio `leonardo-AI-Series`.
`HEAD` y `main` en GitHub coincidían en
`a7708afbdcba16dcef7e146c4501297daab3bdfd`. Antes de actualizar este
registro había 40 archivos modificados y 75 sin seguimiento. El inventario
temporal registra sus rutas y huellas SHA-256 antes de esta actualización.
Las referencias de las PR se descargaron a una copia aislada en
`/tmp/lvtp-418.BLkXLgL5/repo`.

- #410, borrador (`c5108288`): 29 de 59 archivos coinciden byte por
  byte con el árbol local y 30 tienen versiones locales distintas.
- #416 (`588a1512`): su único archivo de referencia visual falta en el
  árbol local.
- #417 (`68fab8df`): sus seis archivos documentales no están incorporados
  en el árbol local.

El puente MONI sigue en modo de solo lectura, con el índice del Minisforum
del 19-11-2026 fuera del umbral de frescura. Su ejecutor limita las escrituras
automáticas a `scratch`. La ejecución de Git local mediante MONI sigue
bloqueada por falta de capacidad autenticada.

Sobre las fuentes locales pasaron 63 pruebas Node, los typechecks de Web,
Admin, Driver y API con el compilador de cada aplicación, y el build Vite
de Web con salida temporal. Queda pendiente respaldar de forma duradera
las fuentes locales, revisar los 30 archivos divergentes y validar un
candidato integrado antes de abrir la PR de conciliación.

### Candidato local de integración · #418

Se preservaron las fuentes locales en un archivo privado con SHA-256 verificado.
La rama local `integration/418` conserva el historial de las PR #410, #416 y
#417. Sobre esa base incorpora las versiones locales de las fuentes operativas,
sus recursos y pruebas. Los cambios a espejos JavaScript, cachés de compilación
y documentos locales ajenos a esta integración se conservaron en el respaldo.
Los manifiestos de dependencias y el lockfile coinciden con #410.

El candidato pasó 63 pruebas Node, 22 pruebas de simulación Python, los
typechecks de Web, Admin, Driver y API, el build Web y la comprobación SHA-256
del archivo histórico de #417. Las pruebas utilizaron las dependencias ya
instaladas. La rama y el inventario completo se guardaron junto al respaldo
privado. Quedan pendientes la revisión de publicación, la PR en GitHub
y la aceptación integral de staging.

### Conciliación Minisforum y GitHub · 25 de noviembre de 2026

La PR #427 incorporó la integración a `main` en `498eefe`. Esta entrada
actualiza los pendientes de publicación y aceptación de las notas anteriores.
El árbol candidato pasó 69 pruebas Node, 22 pruebas Python, comprobaciones de
tipos de Web, Admin, Driver y API, y el build Web. El recorrido HTTP con Firebase
de staging completó una reserva sintética y confirmó su persistencia tras un
reinicio de la API. La repetición en Firefox completó Ride, Control Tower,
Driver y Founder con una sesión nueva después de un HTTP 401 en el primer
intento de inicio de sesión en Ride. La evidencia figura en la PR #427.

La PR #426 incorporó el uso de la revisión nativa del propietario en Spec Guard.
La PR #429 corrigió los falsos positivos de la portada. La tarea #428 registra
el respaldo privado, su restauración verificada y la comparación con GitHub.

La PR #431 añadió la actualización periódica de una copia separada de
`main` en el Minisforum. La primera sincronización terminó correctamente.
El checkout operativo conserva su trabajo local. La actualización de la copia
no publica cambios locales. El workflow de despliegue al VPS sigue pausado.

La [arquitectura de roles](./MONI_ROLE_CONTROL_PLANE.md) resume los controles
vigentes y las propuestas de MONI pendientes de revisión.

### Revisión de las cinco superficies y estados de reserva

La revisión parte del commit inicial `2bbfa63` del 9 de mayo y del inventario
histórico, y contrasta los puntos de entrada con `main@e66c905` y el
candidato de pagos #437. El historial de main contiene 759 commits
alcanzables y 476 en primera ascendencia en ese corte. Entre los hitos
recuperables están Booking MVP (#28 y #102), Stripe/Payconiq (#33),
facturación (#74), despacho (#371) e integración operativa (#427).
La presencia de un módulo histórico no acredita que su ruta esté activa.

| Superficie | Base conectada en main | Componente pendiente o por aceptar |
| --- | --- | --- |
| Portal | Portada y solicitud real con referencia del servidor y seguimiento por código. | Verificar el recorrido móvil de origen, destino, fecha, revisión y resultado como un flujo continuo. |
| Ride | Reservas propias, cancelación según estado y seguimiento autenticado. | Conectar tarifa confirmada y suplementos, autorización, recibo y reembolso mediante el candidato Stripe de staging. |
| Drive | Disponibilidad, asignación y transiciones del viaje con identidad verificada. | Reporte de ausencia con motivo y revisión por Control Tower. Validar fallos de conexión y relectura del mismo viaje. |
| Control Tower | Cola de reservas, vehículos, asignación y cancelación. | Confirmación de tarifa, revisión de ausencia y gestión de reembolsos con permiso financiero separado. |
| Founder OS | Vista de gobierno con acceso separado y proyecciones operativas. | Conectar la lectura financiera a evidencia confirmada, con permisos y trazabilidad. |

La API principal monta Booking, cliente y operaciones. El módulo histórico
de arquitectura de pagos mantiene estados en memoria y usa adaptadores
de ejemplo. Stripe Checkout, notificaciones firmadas y reembolsos están
en el PR #437, con validación externa de staging pendiente. Facturación
y liquidaciones externas siguen pendientes de las decisiones registradas
en el plan de aceptación.

El cambio propuesto para Portal y Ride usa las etiquetas en neerlandés
que ya mostraba MONI. La confirmación, el seguimiento público y la
reserva autenticada presentan el mismo estado recibido de la API.

La verificación pública encontró HTTP 200 en Portal, Booking, Ride, Drive,
Control Tower y Founder OS, y en el estado de salud de la API. Las listas
de reservas privadas devolvieron HTTP 401 sin sesión. El Fossibot mostró la
portada, Ride y el formulario de Booking en producción sin enviar datos.
El cambio pasó 74 pruebas Node, 22 Python, el typecheck y el build Web en un
candidato aislado de `e66c905` con dependencias congeladas.
