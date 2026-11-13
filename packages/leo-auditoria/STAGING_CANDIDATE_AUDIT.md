# Leo Auditor: revisión del paquete Nexus (borrador)

Este módulo añade una comprobación local de integridad para el intercambio
`atlas/staging-candidate/v1-draft` preparado por la PR Aspire #3. No consulta
GitHub, ATLAS, Aspire, Viviana ni ningún otro nodo; no accede al disco, red,
procesos, servicios ni archivos recuperados.

## Uso

`auditStagingCandidate` recibe los bytes exactos de `candidate.json`,
`envelope.json`, la propuesta MONI y el localizador JSON de revisión. También
requiere un contexto esperado que aporta el llamador: repositorio, commit, ruta,
proyecto y nodo destino. Rechaza JSON inválido, duplicación de claves, tamaños
excesivos, hashes o proyecciones inconsistentes, versiones desconocidas y
cualquier elevación de las banderas de política.

El resultado distingue tres casos:

- `PASS`: los bytes aportados, sus hashes, el alcance y la proyección coinciden.
  **Solo es consistencia estructural del paquete.**
- `FAIL`: el paquete es inválido, está alterado o contiene una contradicción.
- `BLOCKED`: falta contexto esperado o una dependencia de tiempo/autoridad no es
  verificable.

En todos los resultados, la autenticación queda `NOT_VERIFIED`, la autorización
`BLOCKED_AUTHORITY_NOT_VERIFIED`, la ejecución `NOT_PERFORMED`, el estado
operativo `UNKNOWN` y `approvalGranted`, `canDispatch` y `productionAllowed`
son `false`. Un campo JSON `decision: APPROVE`, un hash coincidente o `PASS` no
demuestra que una persona autorizada haya aprobado la propuesta.

## Límites deliberados

El código comprueba la forma del localizador de revisión de Founder OS y sus
vínculos con bytes, alcance, commit y fechas. No consulta si la revisión existe,
sigue vigente, pertenece a un actor enrolado, fue revocada o satisface la
protección efectiva de GitHub. La PR LVTransport #404 describe esa autoridad,
pero informa bloqueos de configuración y permisos; su localizador tampoco es
una credencial reusable. Por tanto, `PASS` **no habilita staging autorizado,
Forge, despacho ni producción**.

El análisis es una función pura respecto al sistema salvo el reloj local usado
para rechazar localizadores vencidos. No se debe tratar ese reloj como una
autoridad de tiempo externa. El llamador debe obtener el contexto esperado de
una configuración revisada; no debe inferirlo del propio candidato.

## Relación con Aspire Nexus

Aspire PR #3 añade el constructor de candidato con la misma forma de intercambio.
Su API pública también queda `BLOCKED` mientras no exista autoridad real y
consumo atómico por operación. Esta implementación de Auditor no crea esa
autoridad ni cambia el estado operativo de Aspire o Viviana, que continúa
`UNKNOWN`.

No se añadieron ejecuciones automáticas ni se cambió la configuración de CI.
