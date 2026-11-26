# Pruebas pendientes de pagos LVTransport

## Arranque

Desde la raíz del repositorio, con las dependencias instaladas:

```sh
node tools/release/bootstrap-payment-acceptance.mjs
```

Para verificar un candidato aislado:

```sh
node tools/release/bootstrap-payment-acceptance.mjs --workspace /ruta/al/candidato
```

El comando ejecuta pruebas Node y Python, typecheck y builds de API y Web.
Genera logs y un resultado JSON en un directorio temporal. Las pruebas
externas quedan registradas como no ejecutadas por el bootstrap. Registrar
su evidencia aquí o en el registro de implementación cuando se complete
cada caso. Si una comprobación automatizada falla, el comando devuelve
un código distinto de cero y conserva el resultado de las demás.

## Orden de aceptación

| Caso | Prueba y resultado requerido | Estado |
| --- | --- | --- |
| Ausencia del pasajero | En el Fossibot, Driver registra la ausencia de una reserva autorizada. Control Tower revisa y confirma. Stripe de pruebas libera la autorización, el importe capturado es cero, Ride refleja la liberación y el historial identifica a quien reportó y a quien resolvió. Repetir la resolución y comprobar que solo existe una liberación. | Implementado en staging y verificado por HTTP con adaptador. Pendiente de aceptación en el Fossibot con Stripe de pruebas. |
| Reembolso parcial | Completar y capturar un viaje de prueba. Control Tower solicita un importe menor que la captura e indica el motivo. Verificar rechazo de una aprobación desde un rol sin autorización financiera. Con el rol autorizado, Stripe de pruebas devuelve el importe al medio original una sola vez y Ride muestra el saldo restante. | Implementado y verificado por HTTP con adaptador. Pendiente de UID aprobador y prueba con Stripe. |
| Reembolso total y límites | Reembolsar el saldo pendiente, consultar nuevamente el resultado, repetir la solicitud y enviar otra superior al saldo. El importe acumulado coincide con la captura, el último exceso se rechaza y la bitácora conserva importes y aprobaciones. | Implementado y verificado por HTTP con adaptador. Pendiente de prueba con Stripe. |
| Notificaciones firmadas y recuperación | En Stripe de pruebas, cerrar Ride antes del retorno. Entregar eventos válidos, duplicados, desordenados y con firma inválida. Reiniciar entre recepción y conciliación. El servidor rechaza la firma inválida, recupera los eventos válidos y mantiene un pago y un recibo por reserva. | Receptor y recuperación implementados en staging. Pruebas HTTP locales con adaptador. Pendiente de evidencia de punta a punta con Stripe. |
| Factura y rectificación | Con datos fiscales aprobados y un perfil de prueba, emitir una factura tras la captura, comprobar sus datos e importes y verificar el documento rectificativo después de un reembolso. | Depende de definir los datos y el proceso de emisión. |
| Liquidación a conductores externos | Con un conductor externo de staging, comprobar que un viaje capturado entra en la liquidación autorizada y que un reembolso concurrente ajusta el saldo antes de confirmarla. | Depende de definir comisiones, límites y calendario. |
| Viaje real | Cuando ocurra el viaje autorizado, observar Driver desde salida hasta cierre y contrastar el estado en Ride, Control Tower y Founder. Cualquier pago real requiere autorización separada. | Producción ya comprobada hasta aceptación. |

## Evidencia que ya existe

El servidor aislado lee los UID de administradores aprobadores de staging
desde `refund-approver-uids` en el almacén temporal, uno por línea. Sin el
archivo, ningún UID puede aprobar. Control Tower requiere que la solicitud
y la aprobación procedan de cuentas distintas. El registro conserva el
motivo, ambos actores, el importe y la respuesta del proveedor. Ride
muestra el neto después de que Stripe confirma el reembolso.

El servidor aislado activa `POST /api/v1/staging-checkout/webhook`
cuando el almacén temporal contiene `stripe-webhook-secret` con el secreto
de firma del listener de prueba. Mantener ese archivo fuera del repositorio.
Reenviar únicamente los eventos de sesión de Checkout incluidos en el
receptor. El servidor guarda el ID de entrega y concilia consultando
la sesión actual de Stripe. Conserva las entregas pendientes para reintento
en el mismo almacén al reiniciar.

El Fossibot ya verificó el recorrido completo en staging, el Checkout con
tarjeta de prueba y la renovación tras revisión de tarifa o vencimiento
reproducido. El bootstrap conserva sus regresiones automatizadas.
Las referencias y reservas de producción quedan fuera de los ensayos de staging.

Cada resultado nuevo debe incluir candidato, entorno, identificador de
reserva de prueba, estado esperado y observado, y una prueba del resultado
en la API o el proveedor. Guardar pantallas sin credenciales ni datos de pago.
