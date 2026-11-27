# Piloto de relevo entre Aspire y Viviana

Fecha: 27 de noviembre de 2026. Tarea de referencia: C del plan A–Z.  
Trabajo: `LVTP-C-20261127-01`. Alcance autorizado: comprobación pública de web y API de solo lectura, con resumen de Qwen.

## Configuración aplicada

Aspire guardó la cola aislada en SQLite y ejecutó el primer intento. Viviana ejecutó el respaldo y consultó el mismo registro por un enlace SSH existente y verificado. Los dos procesos se iniciaron como servicios de usuario acotados en sus propios equipos. El nodo activo renovaba una reserva de trabajo de 18 segundos. Cada reclamación recibía un número de intento y el registro solo aceptaba el resultado del intento vigente. Minisforum coordinó el arranque y observó el resultado.

Qwen3 0.6B se ejecutó localmente en ambos nodos. El cierre se verificó con web HTTP 200 y API HTTP 200 con `ok: true`. El texto del modelo fue un resumen auxiliar. El hash SHA-256 del código desplegado en los dos nodos es `3db14911333ce2cc5d6b8a9929000c0897f1411d9d319b9b8c2b65699217b0ea`.

## Evidencia del relevo

| Hora UTC | Nodo | Evento |
| --- | --- | --- |
| 18:01:20.534 | Registro en Aspire | Encargo en cola |
| 18:01:20.927 | Aspire | Reclamó el intento 1 |
| 18:01:26.511 | Aspire | Inició Qwen y guardó las comprobaciones |
| 18:02:00.365 | Registro en Aspire | Venció el intento 1 tras detener solo el trabajador del piloto |
| 18:02:00.365 | Viviana | Reclamó el mismo encargo como intento 2 |
| 18:02:08.381 | Viviana | Inició Qwen y guardó las comprobaciones |
| 18:02:14.310 | Viviana | Guardó el único resultado final |
| 18:02:41.678 | Registro en Aspire | Rechazó una entrega tardía de prueba del intento 1 |

Se verificó un solo evento `COMMITTED`. Viviana esperaba mientras el intento 1 seguía reservado y continuó automáticamente después de su vencimiento. Los dos diagnósticos independientes del lote MONI `1fb558d9d2f55ef27f81b43189d30489` terminaron en `COMPLETED`. El observador de salud de Aspire permaneció activo.

## Alcance verificado y condiciones de continuidad

El relevo se probó al detener un trabajador y mantener accesible el registro de Aspire. Los servicios de los trabajadores se ejecutaron en sus propios nodos. El Minisforum se mantuvo encendido durante el ensayo. La cola permanente, el respaldo del propio registro ante la pérdida completa de Aspire y la reasignación de trabajos de escritura siguen pendientes. Cualquier extensión requiere un perfil autorizado, exclusividad verificable y un ensayo separado del fallo del registro.

El piloto solo consultó la web y la API públicas. Los servicios y datos de producción permanecieron fuera de la ejecución del piloto.
