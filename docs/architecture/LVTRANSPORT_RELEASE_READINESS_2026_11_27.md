# Preparación de publicación de LVTransport

Verificación del 27 de noviembre de 2026. El candidato técnico de web y API quedó empaquetado y los respaldos anteriores de ambos componentes superaron una prueba de arranque aislada. La aceptación externa sigue abierta. La recuperación del almacén de staging se verificó en una copia aislada.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Backend de staging | HTTP 200 con `staging: true` y `payments: stripe-test` | GET en loopback a `/health` |
| Fossibot y Galaxy | Ambos aparecieron en ADB con el túnel inverso TCP 44224 activo | `adb devices -l` y `adb reverse --list` por dispositivo |
| Correo | `emailCode: true`, Gmail autenticó por TLS y el operador confirmó la llegada del primer código de Ride en el Fossibot | GET a `/api/v1/auth/sign-in-methods`, solicitud HTTP 202 y confirmación de recepción. Canje y sesión Ride verificados desde el WebAPK del F109 |
| Reembolso con dos cuentas | Falta `refund-approver-uids` en el almacén aislado de staging | Comprobación de existencia sin exposición de identidades |
| Copia web anterior | HTML y un recurso JavaScript devolvieron HTTP 200 y coincidieron byte a byte con la extracción | HTTP efímero en loopback en Aspire |
| Copia de API anterior | El bundle recuperado de Aspire arrancó y respondió HTTP 200 en `/health` | Puerto efímero en loopback de Minisforum, entorno limpio y dependencias locales |
| Candidato técnico | 82 pruebas Node, 22 Python, typecheck y builds API y web correctos | Candidato local `~/.local/share/moni/lvtp-parallel/release-candidate-48wKWD/` con `result.json`, logs, archivos comprimidos y `SHA256SUMS` verificado |

Para facturación siguen pendientes la razón social, domicilio y número de empresa o IVA del emisor, el tratamiento fiscal, el proveedor y canal, la serie y momento de emisión, y la persona que emite o aprueba rectificaciones. Para flota externa faltan la base y porcentaje de comisión, mínimos y topes, ajustes por reembolsos posteriores al cierre, calendario y fecha de corte y responsables de aprobación y ejecución. La prueba 30785 ya concilió 29,25 EUR en Stripe de prueba, Ride y Founder.

La prueba de arranque del respaldo cubre artefactos de aplicación. Se archivaron y extrajeron los datos de staging en un directorio privado. El repositorio real leyó los registros restaurados y se recuperaron las capturas de 30785 y 23888, la liberación de 33926, dos conductores, dos vehículos y cuatro registros de webhook. Un webhook restaurado coincidió con la sesión de 30785. La copia temporal se retiró tras conservar un recibo sin datos personales. Queda por verificar la recuperación de configuración y permisos externos y el respaldo de datos de producción. Antes de publicar siguen pendientes la entrega y el canje en Drive, Control Tower y Founder, aprobación de reembolso por una segunda cuenta de staging, decisiones fiscales y de liquidación, y validación del candidato definitivo desde la app LV instalada. La verificación posterior a un despliegue queda pendiente. [Informe de continuidad](LVTRANSPORT_MONI_HANDOFF_2026_11_27.md)

## Acceso por código aceptado en Ride

El primer canje devolvió 401 porque el SDK de Firebase de staging intentaba firmar un token por IAM y obtuvo `auth/insufficient-permission`. El backend de staging usa ahora la credencial de servicio local del proyecto aislado, validada previamente, para firmar. En el WebAPK del F109, se solicitó un código nuevo, se recibió en Gmail y se introdujo por el inspector de la app mediante ADB. El canje, el inicio de sesión de Firebase y `/auth/customer-session` devolvieron HTTP 200. Ride mostró «Uw account is verbonden». La corrección de contraste del formulario se aplicó a la pantalla abierta y se preparó en el código fuente local. El backend confirmó `payments: stripe-test` tras reiniciar. La prueba se limitó a Ride.
