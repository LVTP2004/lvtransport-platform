# Founder OS: autoridad de revisión protegida GitHub (v1-draft)

Consolidación con la propuesta concurrente #405: se conserva este contrato por
exigir intención explícita en la review y política de humanos enrolados. Se
añaden controles de force-push/borrado y rechazo de metadata de bypass ausente;
no se infiere una lista vacía de un campo que no pudo comprobarse. Un comentario
posterior no crea ni revoca aprobación; las decisiones decisivas sí se reevalúan.
La ampliación añade tres pruebas sintéticas (18 en total). No activa autoridad.

Propuesta nueva, independiente de #403, #394 y del trabajo activo de MONI #98.
Base LVTransport: `a7708afbdcba16dcef7e146c4501297daab3bdfd`.
No modifica la API comercial, Firebase, servicios ni configuración GitHub.

## Resultado de la comprobación actual — 2026-11-13

La API de GitHub devolvió `protected=false` para `main`. El único ruleset listado
estaba `disabled`. Consultar `branches/main/protection` con la integración
conectada devolvió **403 Resource not accessible by integration**. No se pudo
acreditar una autoridad protegida con los permisos actuales. No se cambia esa
configuración ni se obtiene un token nuevo: **el estado real sigue BLOCKED**.
Los accesos informados por un repositorio no sustituyen el permiso del token
para leer protección. No hay enrolamiento de personas configurado por defecto.

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
