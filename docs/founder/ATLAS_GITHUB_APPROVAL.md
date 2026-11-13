# Founder OS: referencia de revisión GitHub para ATLAS

Primera vía propuesta, sin servidor nuevo, Firebase ni API comercial. El núcleo,
contrato y decisión final pertenecen a MONI. Este repositorio presenta la
solicitud humana y recoge referencias verificables; no inventa actores ni ACL.

## Estado real comprobado el 2026-11-13

- `main`: la API devolvió `Branch not protected` (404).
- El único ruleset listado estaba `disabled`; no sustituye protección activa.
- Resultado actual: **BLOCKED**. No se ha creado una aprobación ni configurado
  protecciones, actores, credenciales o infraestructura. Tener permisos admin
  para consultar el repositorio no autoriza automáticamente a aprobar ATLAS.

## Solicitud y registro

El módulo `scripts/founder_os/atlas_github_approval.py` prepara datos mediante
`build_request(proposal_bytes, issued_at=..., expires_at=...)`. Requiere los
bytes canónicos de una propuesta MONI; no acepta un actor ni un booleano de
autenticación. La solicitud contiene el sobre de propuesta completo, SHA-256,
alcance exacto, emisión y expiración. Perfil inicial: proyecto `MONI`, destino
`none`, operación `map.read`, caducidad máxima 15 minutos. Otros destinos y
operaciones quedan bloqueados hasta una revisión específica.

La persona abre una PR dedicada hacia `main` cuyo único archivo cambiado sea
`docs/founder/approvals/atlas-request.json`. No se crea esa PR de aprobación en
esta entrega. El archivo debe incluir el objeto completo para revisión humana,
no solo un hash opaco. Cualquier cambio produce otro head SHA y requiere nuevas
revisiones. La PR debe estar abierta y lista para revisión, nunca en borrador,
cerrada, fusionada o procedente de otro repositorio en esta primera vía.

`collect_record(number)` consulta exclusivamente GitHub mediante credenciales
ya configuradas de `gh`; no crea ni imprime tokens. Usa host fijo github.com,
GET y una consulta GraphQL fija sin mutaciones. La salida es `BLOCKED` si falta
evidencia; si todos los chequeos de recopilación pasan, produce un registro
`moni/atlas-github-review-reference/v1`, `PENDING_MONI_VERIFICATION` que contiene:

- Repositorio, número de PR, head SHA completo, blob SHA y SHA-256 del archivo.
- Hash de propuesta, alcance, decisión y caducidad vinculados a esa solicitud.
- IDs numéricos y logins públicos de actores obtenidos de GitHub, IDs de
  revisión y fecha. No se toman del solicitante ni de un modelo.
- `trust=UNVERIFIED_UNTIL_MONI_RECHECK`, `approval_granted=false`, `can_dispatch=false`.

No es un bearer token ni una aprobación ejecutable. MONI no debe confiar en el
JSON, estado, actor o permisos declarados por el registro: debe volver a leer
GitHub y compararlos con una política local revisada de actores autorizados.

## Chequeos conservadores de GitHub

La protección clásica debe exigir revisiones, descartar aprobaciones obsoletas,
exigir aprobación del último push, impedir bypass de administradores y listas
de bypass de usuarios/teams/apps, y prohibir force-push y borrado. El quorum
debe ser de 1 a 6 personas. Rulesets adicionales activos/evaluate no están
soportados: se bloquean en vez de adivinar su interacción o sus excepciones.

Se leen el blob exacto y su integridad Git, revisiones actuales, permiso actual
de colaborador y `reviewDecision` calculado por GitHub. Solo personas `User`
con permisos write/maintain/admin, distintas del autor de la PR, pueden aportar
una decisión candidata. Eso acredita su cuenta GitHub, no su rol de fundador:
MONI debe exigir además una allowlist explícita de IDs autorizados para el alcance.
No se usa la autenticación comercial ni el placeholder de #394.

Se conserva la última revisión decisiva por persona; un comentario no aprueba,
una revisión dismissed no cuenta y un CHANGES_REQUESTED impide avanzar. Se
comprueban commit de revisión, emisión, caducidad y antigüedad máxima de 15 min.
Si hay 100 revisiones o más, se bloquea en vez de aceptar una página parcial.
Se vuelve a leer PR, protección, revisiones y gate para detectar cambios.
Un fallo HTTP, falta de permisos, timeout o configuración desconocida bloquea.

Permisos de consulta necesarios según GitHub: metadatos/contents y pull requests
read, administration read para protección y permisos de colaboradores, y acceso
GraphQL de lectura. La política no solicita escribir reviews, configurar ramas,
fusionar, lanzar Actions ni modificar servicios. No se amplían permisos aquí.

## Límites y verificación

Las lecturas separadas de GitHub no constituyen una transacción atómica; el
registro no elimina carreras posteriores ni es autorización para despacho.
No hay consumo único, revocación almacenada, instalación de servicios o firmas
propias. El estado debe comprobarse de nuevo en cualquier futuro punto de uso.
El reloj y equipo del verificador son infraestructura confiable pendiente de
revisión operativa; el compromiso de una cuenta/host no se resuelve con un hash.

Las pruebas offline usan IDs y revisiones sintéticos, no autenticación real.
Spec Guard ejecutará ese módulo en su job GitHub-hosted existente; no se añade
workflow. No hay cambios en API, Firebase, reservas, web, paquetes ni despliegue.
Build/typecheck web no se ejecutan porque no cambia código de aplicación.

Fuentes oficiales: [protección de ramas](https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28),
[revisiones](https://docs.github.com/en/rest/pulls/reviews?apiVersion=2022-11-28),
[permisos de colaboradores](https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28).
No se fusiona esta propuesta. Las PR #394, #399 y #403 permanecen independientes.
