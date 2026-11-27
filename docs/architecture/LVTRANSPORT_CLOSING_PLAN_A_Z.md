# Plan de cierre de LVTransport de la A a la Z

**Estado:** plan listo para revisión. Despacho en pausa.  
**Objetivo:** completar, aceptar y publicar el alcance de lanzamiento de lvtransport.be, con la app LV instalada, operaciones de reserva y flota, pagos, identidad, facturación y recuperación verificadas.

## Punto de partida

La reserva de staging **30785** completó el viaje y concilió **29,25 EUR** entre Ride, Stripe de prueba y Founder. **33926** verificó ausencia confirmada, cancelación y liberación sin captura. **23888** verificó ausencia descartada, continuación y captura. Conservar estas referencias como evidencia y repetir los casos afectados si el candidato cambia su comportamiento. La última verificación técnica registró 82 pruebas Node, 22 Python, typecheck y compilaciones de API y Web aprobados.

Los bloqueos de partida son la segunda cuenta aprobadora de reembolsos, SMTP de staging, las decisiones fiscales y comerciales, y la aprobación del candidato de publicación. La cola MONI activa es serial y tiene perfiles acotados. Aspire, Viviana y Minisforum ya han respondido con sus Qwen locales. VPS completó una revisión por MONI. El uso de los Qwen de Galaxy y Fossibot depende de restablecer sus enlaces de inferencia. Ambos Android pueden ejecutar aceptación de la app aunque su modelo no esté disponible.

## Responsabilidad y colas por nodo

Cada cola ejecuta **una tarea a la vez** en su nodo. Las colas de nodos distintos se solapan cuando sus dependencias y recursos lo permiten. Cuando una tarea queda bloqueada, el nodo puede avanzar la siguiente tarea elegible de su cola.

| Cola | Responsable y encargos, en orden de prioridad |
| --- | --- |
| **Minisforum** | Codex dirige la integración y MONI mantiene el registro. Su Qwen revisa dependencias y riesgos. A → B → C → V → W → X → Z. |
| **Aspire** | Qwen de API y persistencia. E → J → O → R. Entrega candidatos aislados y evidencia de servidor. |
| **Viviana** | Qwen de frontend e identidad. F → I → L → P → S. Entrega candidatos aislados y evidencia de portal. |
| **VPS** | Qwen de verificación y operación. K → Q → T. El operador coordina con Minisforum la publicación y realiza la verificación posterior U → Y. |
| **Galaxy** | App LV para los flujos de Drive y Control Tower. H → M → N. Qwen puede asistir en revisión cuando se verifique su enlace USB. |
| **Fossibot** | App LV para Ride, Founder y la comprobación final en el dispositivo principal. D → G. Repite las partes móviles de W e Y con la Galaxy. Su Qwen puede asistir cuando responda su túnel de inferencia. |
| **Leonardo** | Designa responsables y aprueba las decisiones de negocio en K y Q, y autoriza la publicación en X. |

Qwen propone implementaciones y revisa evidencia. Codex revisa los parches, integra cambios compatibles y verifica las pruebas. Los dispositivos Android aportan la evidencia de los portales. El servicio de inferencia de un Android y la sesión de la app LV se tratan como recursos distintos.

## Tareas de la A a la Z

| ID | Nodo | Depende de | Trabajo y evidencia de cierre |
| --- | --- | --- | --- |
| **A** | Minisforum | — | Fijar el commit, los cambios locales que corresponden al candidato y la matriz de alcance. Registrar las referencias 30785, 33926 y 23888 y qué casos se deben repetir. Entrega un manifiesto del candidato. |
| **B** | Minisforum | A | Inventariar Ethernet, Tailscale, ADB, modelos y capacidades MONI. Verificar salud de staging, identidad de cada WebAPK y Stripe en modo de prueba. Entrega una ficha de disponibilidad por nodo y bloqueos recuperables. |
| **C** | Minisforum | B | Preparar y comprobar las colas independientes con dos trabajos inocuos en nodos distintos. Registrar intervalos de ejecución superpuestos, aislamiento, recuperación tras interrupción y bloqueo de un descendiente cuando falla su padre. |
| **D** | Fossibot | A | Preparar sesión Ride y Founder, túnel ADB y entorno instalado. Verificar portada, indicador de pruebas y roles con cuentas autorizadas. Entrega capturas sanitizadas, estado de sesión y versión del build. |
| **E** | Aspire | A | Revisar reservas, idempotencia, disponibilidad, flota y ciclo Drive en API. Ejecutar regresiones de duplicado, cancelación, reasignación y persistencia tras reinicio. Entrega logs y parches acotados si hay fallos reproducibles. |
| **F** | Viviana | A | Revisar Portal, Ride, Drive, Control Tower y Founder. Verificar rutas, mensajes, tarifa desglosada, accesibilidad y comportamiento con rol incorrecto. Entrega matriz por portal y correcciones aisladas cuando correspondan. |
| **G** | Fossibot | D, E, F | Repetir los recorridos de reserva, asignación, captura y ausencia afectados por el candidato. Contrastar los resultados con los registros 30785, 33926 y 23888. Entrega estados de app y proveedor y el motivo de cualquier caso heredado. |
| **H** | Galaxy | A | Preparar Drive y Control Tower en la app LV instalada. Comprobar llegada, reporte, reasignación y vista de viaje sin cruzar cuentas ni referencias. Entrega sesión de pruebas verificada y evidencia de flota válida. |
| **I** | Viviana | A | Inventariar Firebase y el flujo de código por correo de los cuatro portales. Verificar configuración SMTP de staging y alcance por rol. Entrega una prueba reproducible y el requisito de secreto que falte. |
| **J** | Aspire | E | Revisar idempotencia de captura, webhook firmado, liberación y reembolsos. Cubrir tarifa revisada, autorización vencida, entrega duplicada y recuperación de conciliación. Entrega resultados por caso y parche cuando sea necesario. |
| **K** | VPS con Leonardo | A | Preparar la decisión sobre la segunda cuenta aprobadora de reembolsos. Leonardo confirma la identidad autorizada, separada de la solicitante. Entrega aprobación registrada y alcance exclusivo de staging para el ensayo. |
| **L** | Viviana | I | Configurar el correo transaccional en staging cuando esté disponible el acceso al proveedor y el remitente autorizado. Verificar entrega de prueba y que la API anuncie el código habilitado. Entrega evidencia sin publicar secretos. |
| **M** | Galaxy | H, J, K | Probar un reembolso parcial y después el saldo. Usar una reserva capturada, petición y aprobación con cuentas distintas, Stripe de prueba y verificación de idempotencia. Entrega importes, actores, registros del proveedor y neto en Ride y Founder. |
| **N** | Galaxy | D, H, L | Coordinar con Fossibot la entrega y el canje del código en los cuatro portales. Verificar código vencido, canje repetido y portal incorrecto. Entrega una fila por rol y dispositivo, sin guardar códigos. |
| **O** | Aspire | J, Q | Implementar o ajustar emisión fiscal y rectificación según decisiones aprobadas. Verificar importe, vínculo a reserva y referencia del documento con el proveedor de prueba. Entrega verificaciones y artefactos sanitizados. |
| **P** | Viviana | F, O | Verificar en Ride el recibo y el acceso al documento correspondiente, y en Founder la conciliación de cobro, reembolso y rectificación. Entrega evidencia por reserva y rol. |
| **Q** | VPS con Leonardo | A | Resolver las decisiones de negocio para el lanzamiento: datos fiscales del emisor, tratamiento fiscal revisado, proveedor, reglas de emisión y rectificación, comisión, topes, calendario y tratamiento de reembolsos. Entrega decisiones fechadas. Si la flota externa se difiere, registrar explícitamente el alcance y su efecto en el lanzamiento. |
| **R** | Aspire | O, Q | Validar el cálculo de liquidación y su auditoría según el alcance aprobado. Probar viajes, comisiones, ajustes por reembolso y reintentos sin ejecutar liquidaciones reales. Entrega conciliación por conductor y período. |
| **S** | Viviana | F, I | Completar revisión de funcionamiento y soporte de los portales, incluida la integración de MONI donde esté dentro del alcance. Verificar fallos recuperables, acceso por rol y avisos operativos requeridos. Entrega lista de incidencias resueltas y pendientes con impacto. |
| **T** | VPS | A | Inventariar la web, API y configuración de la publicación existente. Preparar procedimiento de respaldo y rollback. Verificar integridad y restaurar una copia aislada con Aspire. Entrega referencia del respaldo, pasos probados y responsables. |
| **U** | VPS | T | Preparar la verificación de publicación: salud pública, rutas directas, permisos, identificación del build y señales para revertir. Entrega comandos y resultados esperados por entorno. |
| **V** | Minisforum | C, E, F, G, J, M, N, P, R, S | Integrar solo diffs revisados. Resolver incompatibilidades, ejecutar suites de repo y fijar candidato e identificadores de build. Entrega PR, diffs, logs y alcance exacto del candidato. |
| **W** | Minisforum con Galaxy y Fossibot | V, U | Ejecutar aceptación final del candidato en las apps LV instaladas. Conciliar las referencias que correspondan y confirmar identidades, flota y pagos de prueba. Entrega acta de aceptación y excepciones pendientes. |
| **X** | Minisforum con Leonardo | W, T | Confirmar decisión de publicación, respaldo vigente de web y API, ventana y responsable de rollback. Entrega autorización y referencia verificadas. |
| **Y** | VPS con Minisforum | X | Publicar el candidato autorizado y comprobar salud, rutas directas, permisos en los cuatro portales y versión en ambas apps. Si una comprobación esencial falla, activar el procedimiento de reversión. Entrega recibo de publicación o rollback. |
| **Z** | Minisforum | Y | Cerrar la evidencia en GitHub y entregar el estado a operaciones. Registrar incidencias abiertas aceptadas, responsables, límites del lanzamiento y siguiente revisión. |

## Cómo debe orquestar MONI

1. **Registrar antes de despachar.** Por tarea, guardar ID estable, nodo, modelo, dependencias, commit o build, alcance de escritura, recursos exclusivos, tiempo máximo y prueba de cierre. Los resultados quedan vinculados a la tarea aunque cambie el proceso que la ejecuta.
2. **Separar capacidad registrada de ejecución.** Las tareas admitidas se envían a MONI con su identificador idempotente. Para otras tareas, Codex coordina los ejecutores locales ya autorizados en Aspire, Viviana y Minisforum, una cola por nodo. Activar un adaptador nuevo solo tras verificar su contrato, sus límites y su recibo.
3. **Dar prioridad a trabajo listo.** Tras A, las primeras tareas independientes son B, D, E, F, H y K. I, Q y T también quedan elegibles y esperan el cupo de su nodo. Después del inventario B, demostrar concurrencia con C. Un bloqueo de identidad, SMTP o finanzas afecta a los descendientes de esa tarea. Los otros nodos mantienen trabajo elegible.
4. **Reservar recursos compartidos.** Dar exclusividad por checkout editable, dispositivo, reserva, identidad activa y almacén de staging cuando haya mutaciones. Lecturas independientes pueden solaparse. Galaxy y Fossibot pueden operar en la misma reserva con roles distintos y una secuencia acordada. Para dos ensayos simultáneos, usar reservas separadas y evitar reutilizar la misma disponibilidad de conductor o vehículo.
5. **Distinguir estados.** Usar pendiente, lista, en ejecución, bloqueada, entregada, aprobada y cerrada. Un trabajo solo cuenta como simultáneo cuando hay intervalos de ejecución superpuestos en los recibos. Una salida de Qwen queda entregada hasta que sus pruebas y revisión la conviertan en evidencia.
6. **Recuperar sin duplicar.** Verificar el resultado persistido antes de reintentar. Reintentar comprobaciones de lectura acotadas cuando proceda. En operaciones de reserva o pago, usar la clave de idempotencia y cotejar primero el estado en la API y el proveedor.
7. **Informar por nodo.** Cada actualización enumera tarea actual, tareas listas, último recibo y bloqueo. Escalar a Leonardo solo las decisiones reservadas, las credenciales que falten y las autorizaciones de publicación o finanzas.

## Criterio de salida

La plataforma queda lista para operar cuando hay un candidato identificable aceptado en las apps LV, conciliación reproducible de reservas y Stripe de prueba, acceso y permisos comprobados, y facturación y liquidación verificadas según el alcance de lanzamiento acordado. La publicación exige autorización vigente, respaldo restaurable y verificación posterior de salud, roles y versión. Toda tarea cerrada tiene evidencia revisable y referencia en GitHub.
