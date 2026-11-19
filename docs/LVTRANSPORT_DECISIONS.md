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
