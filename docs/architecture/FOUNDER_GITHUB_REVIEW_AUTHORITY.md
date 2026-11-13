# Founder OS: autoridad de revisión protegida GitHub (v1-draft)

Consolidación con la propuesta concurrente #405: se conserva este contrato por
exigir intención explícita en la review y política de humanos enrolados. Se
añaden controles de force-push/borrado y rechazo de metadata de bypass ausente;
no se infiere una lista vacía de un campo que no pudo comprobarse. Esta ampliación
permite únicamente una prueba explícita GraphQL si REST omite el campo vacío. Un comentario
posterior no crea ni revoca aprobación; las decisiones decisivas sí se reevalúan.
La suite actual contiene 29 pruebas sintéticas. Ninguna prueba activa autoridad.

Propuesta nueva, independiente de #403, #394 y del trabajo activo de MONI #98.
Base LVTransport: `a7708afbdcba16dcef7e146c4501297daab3bdfd`.
No modifica la API comercial, Firebase o servicios. La protección de main se
configuró en esta ampliación mediante autorización administrativa expresa; la
autoridad de aprobación sigue sin habilitarse.

## Resultado de la comprobación actual — 2026-11-13

Antes del cambio, main devolvió protected=false y el único ruleset estaba
deshabilitado. El conector GitHub no pudo leer protección: HTTP 403. La sesión
existente de `gh` sí acreditó permiso administrativo, lectura del estado sin
protección (404 Branch not protected) y cero reglas efectivas. Se usó esa vía
para configurar exclusivamente main, según el perfil
[founder-main-protection.v1.json](contracts/founder-main-protection.v1.json).

La respuesta de escritura y las lecturas REST/GraphQL posteriores confirmaron:

| Control | Estado observado después de configurar |
|---|---|
| Rama main protegida / PR requerida | Activo |
| Aprobaciones requeridas | Una revisión aprobatoria GitHub |
| Descartar aprobaciones al cambiar commits | Activo |
| Aprobación del último push | Activo; debe aprobar alguien distinto del autor del push |
| Incluir administradores | Activo (enforce_admins=true) |
| Actores de bypass PR | Cero, confirmado explícitamente por GraphQL |
| Force-push y borrado | Deshabilitados |
| Reglas efectivas de rulesets | Ninguna; el ruleset listado sigue disabled |

GitHub omitió bypass_pull_request_allowances en el GET REST tras aceptar las
listas vacías. Esa ausencia NO se consideró prueba: la consulta de la regla
aplicada a refs/heads/main devolvió pattern=main, totalCount=0 y hasNextPage=false.
El adaptador ahora puede usar esa prueba explícita, nunca un valor vacío supuesto.

**Founder OS permanece BLOCKED.** El conector sigue recibiendo HTTP 403 para
protección; no se ha trasladado ni mostrado su token ni el de la sesión
administrativa. No se instaló política de personas/alcance o credencial de
lectura para el módulo. Una aprobación requerida por GitHub no identifica por sí
sola a un humano autorizado por Founder OS. El alta sigue pendiente.

El perfil JSON no es un script ni se aplica al importar el módulo. Incluye
required_status_checks=null porque no existía protección ni reglas efectivas
previas; no se quitaron requisitos CI activos. **No reaplicar ese PUT si aparecen
checks u otras reglas más fuertes:** preservarlas y dejar BLOCKED si el adaptador
no puede verificarlas. No se modifica fusión automática (el repositorio la tenía
deshabilitada y esta PR no tiene auto-merge). No se creó ni guardó ningún token.

## Qué implementa esta propuesta

`tools/founder_os/github_review_authority.py` ofrece
`register_founder_decision(record_bytes, policy=None, token=None)` y la operación
de comprobación `inspect_protected_review` con los mismos argumentos. Por defecto
ambas devuelven BLOCKED, sin red. Una llamada explícita con política del operador
y token de lectura usa HTTPS con validación TLS contra **api.github.com**, sin
redirecciones, URLs configurables o callbacks de autenticación. Solo realiza GET
y una consulta GraphQL estática de lectura; nunca publica revisiones ni ejecuta
mutaciones, merges, despacho, comandos o consultas a nodos.

Un token y una `AuthorityPolicy` son configuración privilegiada del host, nunca
campos enviados por el navegador ni cargados desde la propuesta revisada. No se
instalan credenciales, certificados o infraestructura en esta entrega. Los
fixtures usan transportes privados sustituidos por pruebas y datos falsos
identificados como sintéticos; no se presentan como aprobación o conexión real.

## Enrolamiento por ID estable: alta y revocación pendientes

No se elige al usuario del CLI, propietario, autor de PR o persona que envía un
JSON como aprobador por defecto. No se publica un ID supuesto. Hoy no hay un
aprobador enrolado y la configuración predeterminada sigue ausente/BLOCKED.

El custodio administrativo debe mantener fuera de propuestas y requests un
registro protegido con: ID numérico estable GitHub, vínculo privado a la persona
autorizada, repositorio/rama/ruta/scope exactos, alta/vigencia, estado activo o
revocado, versión de política y referencia de auditoría del cambio. No contiene
tokens; la referencia de evidencia y datos personales no se publican aquí.
`AuthorityPolicy.human_ids` solo contiene IDs de las altas vigentes y revisadas,
como frozenset de enteros positivos; una lista vacía bloquea antes de consultar.

Alta:

1. Designar custodio y persona autorizada mediante un proceso independiente de la
   propuesta; comprobar control de cuenta y SSO/MFA según la política real. Un
   objeto GitHub User no acredita por sí solo persona física o MFA por decisión.
2. Resolver el ID desde la API GitHub para esa cuenta ya identificada y confirmar
   su permiso actual write/maintain/admin en este repositorio. El login es una
   etiqueta de consulta mutable, no la clave de enrolamiento. No usar roles del
   navegador, Firebase placeholder o IDs de los fixtures.
3. Registrar el alta y scope mediante cambio administrativo auditable. Instalar
   una nueva política del host fuera del commit revisado; cada verificación debe
   cargar una versión vigente, no construir su allowlist desde el localizador.
4. Presentar bytes/hash/scope/caducidad y recoger una revisión protegida con la
   intención explícita de la siguiente sección. La PR debe estar lista, no draft;
   el revisor no puede ser su autor y GitHub exige aprobación tras el último push.
   Revisar código con un LGTM ordinario no registra consentimiento operativo.

Revocación:

1. Retirar el ID de todas las políticas activas y registrar motivo, hora y nueva
   versión, sin reescribir el historial. Si no puede asegurarse distribución
   actual de la política, detener verificación y conservar BLOCKED.
2. Invalidar decisiones pendientes y resultados cacheados; cada uso vuelve a
   consultar estado/permisos/revisión y a usar la política vigente. El módulo no
   mantiene un caché de permisos ni un almacén de enrolamiento automático.
3. Ante compromiso o baja, el administrador debe retirar permisos/SSO y revocar
   credenciales mediante sus canales seguros. No se hace por este cambio. Un
   cambio de login conserva el ID; otra cuenta con el mismo login no hereda alta.

La credencial administrativa usada para protección es independiente del lector
de Founder OS. El administrador debe conceder al lector acceso de solo lectura
a Contents, Pull requests, metadata de permisos y Administration para protección,
y comprobar las consultas GraphQL autorizadas. La integración actual no supera
esta última lectura. No se extrae el token del CLI para habilitarla ni se crean
credenciales nuevas. Si cualquier permiso, persona o vigencia no es verificable,
la salida es BLOCKED. Los requisitos de MFA/biometría por decisión no soportados
no se sustituyen por booleanos: requieren una autoridad adicional revisada.

## Registro intercambiable y consentimiento explícito

El registro JSON `founder/github-protected-review/v1-draft` exige exactamente:

`schema, repository, pull_number, head_sha, proposal_path, proposal_sha256,
scope, actor_id, review_id, decision, issued_at, expires_at`.

`actor_id` es el ID numérico estable de la cuenta GitHub, no su nombre visible.
La autoridad exige usuario GitHub de tipo User enrolado por el operador, distinto
del autor de la PR, con permiso actual write/maintain/admin comprobado por API.
El enrolamiento debe vincular la cuenta a una persona autorizada; User por sí
solo no prueba persona física ni MFA/biometría en cada decisión. Si se exige esa
prueba adicional, esta vía no la implementa y debe permanecer bloqueada.

La decisión APPROVE no se deduce de un LGTM. La revisión **APPROVED** del head
exacto debe tener como cuerpo un objeto JSON completo con exactamente:

`schema=founder/github-review-intent/v1-draft, head_sha, proposal_path,
proposal_sha256, scope_sha256, decision=APPROVE, expires_at`.

No se crea ese cuerpo en nombre de nadie. El operador debe presentar esa
intención, ver los bytes y el alcance y enviar personalmente una revisión por
la interfaz autorizada GitHub. Una revisión de código ordinaria no se convierte
silenciosamente en autorización operativa. La cuenta y el ID de revisión se
resuelven desde GitHub; los valores declarados por el cliente se comparan, no
se creen. REJECT o CHANGES_REQUESTED nunca conceden aprobación por esta vía.

`proposal_sha256` se recalcula sobre **bytes exactos** obtenidos de Contents API
en el head completo. Se exige archivo regular, base64 válido, tamaño y SHA-1 de
blob coherentes. Scope es `{project, target_node, operations}`; operaciones únicas
y ordenadas, sin comodines, iguales a la política del host, la propuesta y la
intención de revisión. Su hash usa JSON UTF-8 compacto con claves ordenadas,
sin normalización Unicode. No se confía en roles de la API comercial.

Dos formas de propuesta son reconocidas de forma explícita:

- `founder/authorized-proposal/v1-draft`: `schema, proposal_id, scope, expires_at`.
- Sobre proposal de `moni/atlas-vnext-data/v1-draft`, definido en
  [#98, revisión c08948aa](https://github.com/LVTP2004/moni-core-runtime/blob/c08948aa65bf2f2c5aeb42ba84584a898bd36810/integration/federation/ATLAS_VNEXT_STAGE1.md).
  Se comprueban forma exterior/política no operativa, fecha y scope; no se importa
  ni duplica Atlas Maps, ni se certifican afirmaciones o fuentes por aprobarlo.

La segunda forma no tiene expiración de propuesta propia: la aprobación queda
limitada por la fecha explícita de la intención firmemente vinculada al hash.
En la primera, la expiración de propuesta y revisión deben coincidir. `issued_at`
debe ser el submitted_at de GitHub; fecha futura, expiración alcanzada o duración
superior a 15 minutos bloquean. El reloj confiable del host es una dependencia;
esta no es una autoridad de tiempo externa.

## Protección y comprobación vigente

Se exige PR abierta, no borrador, sin fork y con head exacto; base protegida con
enforce_admins, descarte de aprobaciones antiguas y aprobación del último push.
La primera versión soporta un aprobador requerido, sin CODEOWNERS ni allowances
de bypass. Reglas efectivas de rulesets, CODEOWNERS o requisitos más complejos
devuelven BLOCKED hasta tener adaptador revisado: **no debilitar controles para
acomodar el código**. Gate GraphQL debe informar APPROVED y CLEAN para el mismo
head/base. Revisiones eliminadas, descartadas, sustituidas, de otro commit o con
permisos revocados bloquean. Cien revisiones o paginación no resuelta bloquean.

Si REST devuelve allowances, debe contener explícitamente users/teams/apps
vacíos. Si omite el campo, se exige una consulta GraphQL estática autenticada de
la regla aplicada a la referencia exacta: nombre de rama y pattern iguales a la
base configurada, ID de regla presente, conteo entero cero de todos los actores y
hasNextPage=false. Un error, campo ausente, patrón wildcard, otra rama, conteo
positivo o prueba paginada bloquea. GraphQL no puede anular un bypass explícito
o metadata REST parcial/inválida. La prueba y el ID de regla se incluyen en las
dos capturas: un cambio durante la verificación también bloquea. Es una lectura,
no mutación GraphQL, y no modifica requisitos para permitir el pase.

Se consultan dos veces los estados relevantes y deben coincidir; la observación
completa debe terminar en 30 segundos y antes de expirar. Eso detecta cambios
durante la consulta, pero **no** crea una transacción atómica con GitHub. El
registro retornado es un localizador sin firma, no un bearer token, ni almacén
duradero, ni consumo único. No se debe guardar/reutilizar un VERIFIED_REVIEW
como permiso: MONI volverá a comprobar en vivo cada consumo.

Según la documentación de [protección](https://docs.github.com/en/rest/branches/branch-protection),
leerla requiere Administration:read. También hacen falta Contents:read,
Pull requests:read y metadata suficiente para
[permisos del colaborador](https://docs.github.com/en/rest/collaborators/collaborators).
El [gate GraphQL](https://docs.github.com/en/graphql/reference/pulls) es otra lectura,
no permiso de fusión. El custodio debe verificar los permisos reales del token.

## Salidas y límites

Con configuración y evidencia actual verificadas, la salida es VERIFIED_REVIEW
con review_verified=true, checked_at y el registro revisado. Eso acredita solo
la revisión de una cuenta GitHub enrolada para esos bytes/scope/tiempo. Ante
cualquier dato no comprobable devuelve BLOCKED con código concreto, sin cuerpo
HTTP, token o datos personales en errores. No se publican registros reales.

**Siempre**: approval_granted=false, can_dispatch=false, operational_status=UNKNOWN.
No se conecta esta autoridad con un ejecutor. Autenticación GitHub no demuestra
identidad de ATLAS, salud de Aspire/Viviana, staging seguro o ejecución Forge.
El backend/almacén duradero, política de enrolamiento/revocación, custodia y
consumo único siguen pendientes; un futuro executor requerirá su propia revisión.

Pruebas: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p test_github_review_authority.py -v`.
Solo fixtures sintéticos; sin llamadas reales del módulo ni credenciales nuevas.
No cambia TypeScript o configuración de build; no se ejecutan workflows.

## Comprobaciones de esta ampliación

29 pruebas offline: configuración ausente, allowlist vacía o actor no enrolado,
revocación y cambio de login/ID, 403 en cada lectura necesaria, controles ausentes,
rulesets/CODEOWNERS/multi-review no soportados y las pruebas explícitas GraphQL de
bypass. Se preservan las pruebas de intención, bytes, scope, caducidad y bloqueo
de despacho. Los positivos usan sustituciones privadas de I/O y solo acreditan
comportamiento de tests; no son aprobación real.

El cliente de autoridad no cambia su firma pública ni añade callbacks de confianza.
Los consumidores que fijen una copia anterior deben revisar su pin por separado;
no se actualizan otros repositorios o PR en esta tarea. El perfil administrativo
se comprobó en vivo por CLI; no se ejecuta el módulo con credenciales reales ni se
emite una aprobación. Sintaxis Python y diff revisados; sin build/typecheck de
aplicaciones, workflows, nodos, Forge, producción, fusión o despliegue.
