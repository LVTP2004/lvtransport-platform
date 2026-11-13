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

## Fixture de intercambio congelado y regresiones offline

La copia local [tests/fixtures/nexus_exchange_v1.json](tests/fixtures/nexus_exchange_v1.json)
es idéntica byte por byte al [fixture de Aspire #3 en 7a719403](https://github.com/LVTP2004/aspire-recovery/blob/7a719403a0f775975bf1c8011203b47a37b7de75/tests/fixtures/nexus_exchange_v1.json).
SHA-256 del archivo completo, incluido LF final:
`e7f081d6ffea68c8c97d5c5d7d29feab0246b95bd020e4accdd26097c5f1bd38`.
Los cuatro strings UTF-8 se convierten en bytes sin parsear/reserializar antes
de comprobar sus hashes. Ninguna prueba importa, consulta o necesita un checkout
de Aspire; no hay dependencia de ejecución entre repositorios. Los IDs, revisiones,
fuentes y claims son falsos y están identificados como sintéticos.

Las 24 pruebas de `tests/staging-candidate-audit.test.ts` fijan ese digest y los
cuatro hashes internos. Cubren PASS de integridad solamente; FAIL para bytes o
hashes alterados, campos duplicados/escapados, proyecciones y alcances internos
contradictorios; BLOCKED para contexto esperado ausente/incorrecto y autorización
vencida. Cada revisión, incluso PASS, comprueba las banderas de no autenticación,
autorización bloqueada, UNKNOWN y despacho/producción deshabilitados.

El fixture detectó correcciones necesarias en el Auditor: aceptar fechas UTC Z
válidas con o sin fracción, preservar microsegundos y rechazar fechas imposibles;
separar contexto incorrecto (BLOCKED) de contradicciones de hash/proyección (FAIL);
y calcular el hash de scope con claves ordenadas como el contrato Python. Los
enteros anchos de los diccionarios opacos se conservan exactamente al comparar
proyecciones para no redondear dos valores distintos como si fueran iguales.
Se conserva esa protección concurrente para enteros anchos. Se añaden casos para IDs
positivos de 31 bits, rechazo de saltos de línea finales, hashes del localizador
y contradicción entre todos los alcances antes de comparar el contexto externo.
La firma pública del Auditor y las exportaciones anteriores se conservan.

Tiempo de pruebas fijado por una sustitución local de Date.now, restaurada después
de cada caso. No acredita frescura real ni cambia la fuente de tiempo del módulo.
No autentica el localizador, no consume permisos y no ejecuta candidatos. Nexus
continúa bloqueado por autoridad/consumo atómico ausentes. Cambiar intencionalmente
el fixture requiere revisión y actualización coordinada de ambos pins, sin
reescribirlo automáticamente para que una prueba pase.

Comando focalizado desde la raíz: `node --import tsx packages/leo-auditoria/tests/staging-candidate-audit.test.ts`.
Verificación TypeScript focalizada sin emisión, limitada al Auditor, su prueba y
las exportaciones existentes; no se ejecutó build global ni de aplicaciones. Sin
dependencias nuevas, cambios de configuración, API comercial, workflows o ejecución operativa.
