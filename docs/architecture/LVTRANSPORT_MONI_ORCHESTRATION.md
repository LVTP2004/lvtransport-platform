# MONI · Cierre de LVTransport

## Mandato operativo

Al comenzar un ciclo, comprobar conectividad Ethernet y Tailscale por separado, capacidad real del modelo en cada nodo y salud del staging. Preparar trabajo en paralelo cuando las tareas tengan superficie y datos independientes. Registrar despacho, inicio, fin y recibo. Una propuesta de un modelo es insumo para revisión. El cierre de una tarea requiere evidencia objetiva.

| Nodo | Trabajo |
| --- | --- |
| Minisforum | Coordinación MONI e integración. Priorizar dependencias, revisar diffs y ejecutar regresión en el repositorio. |
| Aspire | API y persistencia. Revisar estados, liberación de Stripe de prueba y repetición segura. Trabajar en copia aislada. |
| Viviana | Web y sesiones. Revisar acceso, mensajes visibles y dependencias del correo. Trabajar en copia aislada. |
| VPS | Contrastar evidencia sanitizada y disponibilidad. Las modificaciones de producción pasan por aprobación y validación. |
| Galaxy | Drive en la app LV instalada. Validar sesión, llegada y reporte de ausencia con una reserva propia de la prueba. |
| Fossibot | Ride, Control Tower y Founder en la app LV instalada. Verificar decisión, resultado del pago y auditoría. |

No compartir tokens, contactos ni secretos entre los nodos. Conservar los cambios existentes. Para candidatos: fijar commit, asignar rutas exclusivas, verificar diffs y pruebas y entregar evidencia antes de integrar. Galaxy y Fossibot deben tener rutas ADB vigentes. Las comprobaciones HTTP o de modelo no cuentan como aceptación de la app.

## Orden de aceptación

1. Conservar 30785 como línea base de cierre y captura de 29,25 EUR en Stripe de prueba.
2. Crear dos reservas de staging independientes. La primera termina con ausencia confirmada, cancelación y liberación sin captura. La segunda, con ausencia descartada y continuación en Drive. Registrar estado y resultado en ambos dispositivos.
3. En el reembolso, comprobar solicitante, aprobador distinto, referencia de Stripe de prueba, neto y repetición segura.
4. Habilitar SMTP de staging y comprobar entrega y canje en Ride, Drive, Control Tower y Founder. Mantener separado el bloqueo de configuración.
5. Registrar decisiones fiscales y de liquidación pendientes de Leonardo. Preparar respaldo y candidato cuando estén aceptados los flujos requeridos. Verificar salud, roles y versión instalada después de una publicación autorizada.

Cada recibo debe contener nodo, modelo, commit o identificador de build, caso, referencia de reserva, estado anterior y observado, prueba del proveedor en modo de prueba y bloqueo exacto si lo hay. Los trabajos en el mismo almacén o dispositivo se ordenan para evitar superponer sesiones u operaciones. La cola MONI disponible es serial y su catálogo de ingeniería está limitado a la validación de reservas. Los encargos fuera de ese catálogo se coordinan explícitamente desde el Minisforum hasta incorporar una capacidad probada con su política y recibo.

## Evidencia del primer ciclo · 27 de noviembre de 2026

- MONI guardó el plan operativo en su espacio de trabajo. Recibo `7d5923d9d559a9f82805ad035125cd81`.
- Aspire y Viviana ejecutaron Qwen3 0.6B por Ethernet para revisar estados de ausencia y el diagnóstico de acceso móvil, respectivamente. Minisforum ejecutó Qwen3.5 4B para proponer el orden de integración. Los resultados se tratan como propuestas y se contrastan con la evidencia de staging.
- El Qwen del VPS completó la revisión del recibo de validación de reservas mediante MONI. Tarea `d2c6b9467b620371f972e29f62b7774c`. El perfil de planificación de Qwen desde MONI fue rechazado por el registro activo. La integración de Galaxy Qwen no pudo ejecutar la tarea `474007735c151517b410d736716ec90a`: faltaba el forward USB asociado a su identidad registrada. La conexión ADB Wi-Fi para verificar la app siguió disponible.
- La app LV instalada se abrió en ambos Android bajo el indicador de Stripe de prueba. `/health` respondió 200 por ADB en ambos. Galaxy llegó a autenticar la cuenta Firebase de prueba, pero Drive no verificó la sesión operativa. Fossibot informó error de red durante el acceso a Ride. El endpoint de acceso de staging devolvió `emailCode: false`. Los nuevos viajes de ausencia y el reembolso siguen pendientes.
- Pasaron 82 pruebas Node, 22 Python, typecheck y builds de API y Web. La sesión no publicó un candidato ni ejecutó movimientos financieros.
