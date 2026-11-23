# LVTransport — decisiones de Leonardo y continuidad

Registro: conversación del 15 de noviembre de 2026. Requisitos acordados, no
certificación de implementación. Las instrucciones posteriores de Leonardo prevalecen.
Consultar junto a LVTRANSPORT_SPEC_LOCK.md y al estado de implementación.

| Decisión confirmada | Consecuencia para el trabajo |
| --- | --- |
| Desarrollar LVTransport.be de principio a fin, funcional, sin demo | Continuar implementación/pruebas; un análisis o primer enlace no equivale a plataforma terminada |
| Reutilizar la información y componentes existentes | Auditar integración antes de crear servicios, frameworks, stores o arquitectura paralela |
| Flota propia y conductores/vehículos externos | Mantener ambos modelos; no reducir el producto a una sola flota |
| Incluir cliente, driver, admin, Founder OS y finanzas | No omitir superficies; separar permisos, propiedad y autoridad financiera |
| LVTransport pertenece a LVTP Core y tiene su propio MONI Assistant | Reutilizar MONI Core Runtime y sus fronteras; no convertir el modelo IA en autoridad |
| LVTransport debe poder venderse y funcionar sin LVTP Core | Datos, finanzas y permisos de proyecto propios; servicios compartidos sustituibles y accesos anteriores revocables |
| Usar principios BBox útiles | Identidad, estados/relaciones/capabilities, evidencia, separación intención/observación; no copiar firmware/XMO ni las 81 ideas automáticamente |
| Primero superar simulaciones/pruebas | Diferenciar tests sintéticos y E2E real; no anunciar proveedores, pagos o hardware como conectados sin evidencia |
| Comisiones y límites reales deben definirse | Importes y porcentajes de simulación no son reglas aprobadas de producción |
| Autorización admin ya registrada para cuenta concreta | Ver architecture/FIREBASE_ADMIN_AUTHORIZATION.md; no preguntar otra vez por el mismo grant ni extenderlo a otras cuentas/Founder/Finance |
| Sin merge automático ni despliegue de producción en la fase actual | Preparar cambios verificables; no confundir autorización de implementación con publicación o movimiento real de dinero |

### Acceso sin contraseña solicitado el 20 de noviembre de 2026

| Portal | Cuenta indicada |
| --- | --- |
| Founder OS | `leonardo-vargas@lvtransport.be` |
| Control Tower | `info@lvtransport.be` |
| Driver | `leo.vargas@outlook.be` |
| Ride (Cliente) | `leo-vargas@hotmail.be` |

Leonardo solicita un acceso sencillo que no pida usuario y contraseña en cada
visita. Las asignaciones anteriores registran la intención del propietario.
El flujo principal acordado para los cuatro portales privados consiste en
escribir el correo una vez, recibir un código de un solo uso e introducirlo
en la misma página. Tras verificar el código, el servidor confirma los
permisos del portal y el usuario puede optar por recordar su sesión en ese
dispositivo. La portada y la solicitud pública de reserva siguen disponibles
sin cuenta. El formulario publicado todavía verifica por enlace. El código
requiere configurar un servicio de envío de correo transaccional.

La activación requiere verificar la identidad y aplicar los permisos en el
servidor. Founder OS todavía comparte la autorización de Admin en el código
local y necesita una autorización propia para distinguirlo de Control Tower.

### Alta de conductores en Amberes

El propietario indicó seguir la secuencia de alta que Uber publica para
Bélgica. LVTransport tendrá una entrada independiente para conductores.
La cuenta permite iniciar una solicitud y consultar su estado antes de
obtener el permiso operativo. El recorrido es crear y verificar la cuenta,
elegir conducción con flota o con operador y vehículo propios, acreditar
la habilitación aplicable y completar la revisión de Control Tower.
Solo se habilitan disponibilidad y asignaciones con conductor y vehículo
vigentes. La caducidad bloquea nuevas asignaciones hasta nueva revisión.

Control Tower tendrá una página privada de seguimiento de conductores y
vehículos. El personal autorizado puede consultar el estado y los vencimientos,
pedir correcciones, actualizar la relación con una flota o vehículo y aprobar,
rechazar o suspender la habilitación con un motivo. Cada cambio registra
quién lo hizo, cuándo y el motivo. El conductor ve su estado y los pasos que
le corresponden. El servidor comprueba el permiso para cada acción y la
vigencia de la habilitación al aceptar nuevas asignaciones.

### Founder OS · portal privado del propietario

Founder OS tendrá su propia página privada, reservada al propietario
autenticado y autorizado por el servidor. Desde allí puede consultar la
operación completa, incluidos reservas, viajes, flota, conductores,
incidencias, auditoría y finanzas. Puede gobernar permisos y aprobaciones.
Las acciones sensibles se autorizan y auditan en el servidor. El acceso
ejecutivo a datos financieros no constituye autorización para ejecutar pagos.

La referencia de proceso es [Uber Bélgica](https://www.uber.com/be/nl/drive/requirements/).
Para Amberes se aplican los requisitos oficiales de
[tarjeta de conductor](https://www.vlaanderen.be/mobiliteit-en-openbare-werken/taxi/bestuurderspas-voor-taxichauffeurs)
y [licencia de taxi](https://www.vlaanderen.be/mobiliteit-en-openbare-werken/taxi/vergunning-voor-taxidiensten)
de Flandes. Los certificados médicos y de antecedentes se tramitan según la
autoridad competente. La plataforma registra la documentación y vigencia
necesarias para la revisión. Antes de admitir copias de documentos sensibles,
se debe determinar la base legal, acceso y plazo de conservación.

La etapa anterior de solo análisis terminó cuando Leonardo solicitó implementar
la plataforma funcional. Se mantiene su resultado como evidencia histórica, no
como prohibición de programar indefinidamente. Un mensaje de estado/tiempo o
aclaración no cancela el trabajo ya autorizado.

No pedir reiteradamente aprobación para lectura, código local, archivos de
trabajo y pruebas reversibles dentro del alcance. Las restricciones del sandbox
pueden requerir aprobación técnica para HTTP loopback o escritura fuera del
workspace; explicar su motivo sin convertirlas en una nueva decisión de producto.

Estado comprobable y pendientes: architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md.
No afirmar que toda la plataforma está terminada al cerrar una entrega parcial.

## Base visual elegida — 16-11-2026

Leonardo identificó «Calm Luxury Mobility, Realtime Intelligence» (HomeOriginal.tsx)
como base aprovechable pero incompleta, y autorizó completar esa base y conectarla
a las funciones reales. No equivale a aprobar el comportamiento histórico de
localStorage, identidad simulada, ETA fijo o señales LIVE sin evidencia. La solicitud
es completar la plataforma, no declarar terminada la web por esta publicación.

Referencia #409: Cliente→MONI Ride; Driver→MONI Drive; Admin→MONI Assistant/Control
Tower; Founder→MONI Core/Governance & Intelligence OS. Incorporación UX en análisis
según ISSUE409_UX_SURFACES.md; no autorización de nuevos permisos ni datos ficticios.

#128: referencia Founder/chat recibida para análisis únicamente. Reutilizar código
MONI, CommandCenter, OperationsConsole y AuditReplay existente según evidencia;
no implementar chat/voz/acciones hasta revisar el análisis. Ver ISSUE128_UX_REFERENCE_NOTES.md.

## Continuidad autorizada — 19-11-2026

Leonardo autorizó publicar en GitHub cada avance verificado y desplegar en la VPS
las entregas cuyas pruebas sean positivas. Esta decisión posterior sustituye la
restricción de despliegue de la fase anterior; no autoriza merge automático,
movimientos financieros, nuevos roles ni cambios ajenos a la entrega.
Cada despliegue debe preservar cambios existentes, datos y configuración, contar
con respaldo y verificar el resultado. Usar Devstral, Qwen y MONI disponibles para
tareas acotadas; sus propuestas requieren revisión y pruebas antes de integrarse.
Esto no certifica desarrollo autónomo continuo ni autoriza eludir controles técnicos.
