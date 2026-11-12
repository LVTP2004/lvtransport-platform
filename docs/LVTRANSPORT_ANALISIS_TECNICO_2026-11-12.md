# Análisis técnico de LVTransport

Fecha del informe: 12 de noviembre de 2026. Revisión y comprobaciones locales realizadas el 11 de noviembre de 2026.

Repositorio: `LVTP2004/lvtransport-platform`. Base revisada: [commit a7708afbdcba16dcef7e146c4501297daab3bdfd](https://github.com/LVTP2004/lvtransport-platform/commit/a7708afbdcba16dcef7e146c4501297daab3bdfd).

## Conclusión

LVTransport tiene una base recuperable para una plataforma de transporte, pero todavía no demuestra un recorrido operativo completo entre cliente, administrador y conductor. La prioridad es conectar y validar autenticación, reservas, asignación y ejecución de viajes.

Según lo indicado por el propietario, los módulos revisados no están activos en producción. Esta revisión no acredita un despliegue ni certifica la plataforma para uso real.

**Esta publicación contiene únicamente el análisis. Las correcciones y las pruebas descritas como locales no se incluyen en esta rama y no están incorporadas a main.** Los resultados de la copia corregida no deben interpretarse como resultados del código original.

## Hallazgos del código original

| Prioridad | Hallazgo | Consecuencia |
| --- | --- | --- |
| Alta | El proveedor de autenticación devolvía sesiones y tokens constantes sin comprobar la contraseña. | La identidad del usuario no quedaba validada por ese proveedor. |
| Alta | La utilidad JWT generaba una firma Base64 reversible que incluía el secreto. | Un token generado por esa utilidad podía revelar el secreto de firma. No se confirmó su conexión al servidor activo. |
| Alta | El middleware de autenticación aceptaba identidad y rol desde JSON Base64 sin verificación criptográfica. | No constituía una comprobación válida de identidad. No se encontraron consumidores en las fuentes activas revisadas. |
| Alta | Las reservas recibían precios calculados con 5 km y 15 minutos predeterminados y quedaban listas para facturar. | El estado guardado no reflejaba que precio y disponibilidad debían revisarse. |
| Alta | Admin y Driver contenían varias implementaciones concatenadas y errores de sintaxis. | Ambos fallaban en typecheck antes de su consolidación local. |
| Media | Nombre y teléfono eran opcionales en la validación de la API. | Una solicitud directa podía crear reservas sin contacto. |
| Media | El seguimiento cargaba y analizaba todo el archivo JSON de reservas con lectura síncrona. | El coste de consulta aumentaba con el historial y bloqueaba el proceso durante la lectura. |
| Media | Los controladores de salud versionados retornaban objetos sin enviar respuesta HTTP. | Las peticiones a esas rutas podían quedar sin respuesta. |

El helper heredado `password-hash.service.ts` utiliza un pseudoHash de 32 bits y no debe emplearse para contraseñas. La opción elegida es que Firebase gestione las credenciales.

Referencias de la base revisada:

- [Proveedor de autenticación](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/packages/auth/src/providers/firebase-auth.provider.ts).
- [Utilidad JWT](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/packages/auth/src/security/jwt.service.ts).
- [Middleware de identidad](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/api/src/auth/middleware/authenticate.ts).
- [Servicio de reservas](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/api/src/modules/bookings/service.ts).
- [Validación de reservas](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/api/src/modules/bookings/validation.ts).
- [Repositorio de reservas](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/api/src/modules/bookings/repository.ts).
- [Controladores de salud](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/api/src/controllers/health.controller.ts).
- [Admin](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/admin/src/app/App.tsx) y [Driver](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/apps/driver/src/app/App.tsx).
- [Helper de contraseñas](https://github.com/LVTP2004/lvtransport-platform/blob/a7708afbdcba16dcef7e146c4501297daab3bdfd/packages/auth/src/security/password-hash.service.ts).

## Correcciones preparadas localmente

En la copia de trabajo se retiraron las sesiones simuladas y la confianza en identidades Base64 sin verificar. La utilidad JWT heredada recibió HMAC SHA-256 mediante Web Crypto, aunque el futuro acceso con Firebase debe verificar los tokens de Google mediante su SDK oficial.

Las reservas nuevas exigen nombre y teléfono, conservan el precio pendiente y quedan con facturación `not_ready`. También se corrigió el envío de respuestas de salud. Los datos existentes no fueron migrados.

Admin y Driver se consolidaron alrededor de una sola implementación por panel. Se retiraron datos fijos y movimiento simulado del mapa de sus archivos principales. Los paneles incorporan controles de acceso por rol y errores visibles ante fallos de API. Driver filtra por identidad de cuenta y no confirma anticipadamente cambios de estado.

Estas mejoras permiten compilar los paneles, pero no completan su integración operativa: el router de la base revisada monta salud y reservas públicas, y faltan los endpoints autenticados que necesitan los paneles.

## Comprobaciones de la copia local corregida

| Comprobación | Resultado registrado |
| --- | --- |
| Instalación desde caché con lockfile congelado y scripts de instalación deshabilitados | Correcta |
| Typecheck de API, Admin, Driver, Web, Business y Web Grey | Correcto |
| Build general de Web, Admin, Driver y Business | Correcto |
| Build separado de API y Web Grey | Correcto |
| Pruebas de seguridad, reservas y salud | 11 pasan |
| Pruebas de roles y asignación de conductor | 6 pasan |
| Pruebas de renderizado inicial de los controles de acceso | 2 pasan |
| Pruebas de contratos de integración con Firebase | 10 pasan |
| Total de pruebas locales | 29 pasan |

Las pruebas Firebase usan sustitutos del SDK: no validan una conexión con Google ni la compatibilidad de tipos con los paquetes oficiales finalmente instalados. Las pruebas de renderizado tampoco equivalen a una prueba interactiva completa.

La copia se recuperó mediante el conector de GitHub, sin todo el historial remoto ni todos los recursos binarios. No se ejecutó una prueba E2E en navegador ni un servidor escuchando conexiones. Los indicadores de readiness siguen siendo estáticos. Las advertencias CSS y Browserslist registradas no se resolvieron en esta fase.

Los tests y cambios necesarios para reproducir estos resultados permanecen locales; publicar este informe no los añade al repositorio.

## Estado de Firebase

Se eligió Firebase Authentication para gestionar identidad y conservar las reservas y los permisos de negocio en la API.

Están preparados localmente un adaptador del SDK web, un verificador que solicita al SDK administrativo comprobar revocación y un middleware de identidad y permisos. El verificador consulta la cuenta actual para evitar conservar un rol retirado por el operador.

**La conexión real sigue pendiente:** no se han instalado los SDK, inicializado el proyecto, conectado los servicios de los paneles ni montado el middleware en las rutas operativas. El login de la copia corregida permanece cerrado sin proveedor configurado.

Para activarlo se necesita:

1. Crear el proyecto Firebase y registrar la aplicación web.
2. Habilitar el acceso por correo y contraseña.
3. Instalar los SDK oficiales y comprobar sus tipos reales.
4. Configurar el SDK administrativo con credenciales fuera del navegador y del repositorio.
5. Asignar roles y estado de cuenta desde un entorno administrativo.
6. Sincronizar renovación y cambios de sesión con los paneles.

La falta de resolución de red en la terminal y la ausencia de los SDK en caché impidieron descargarlos durante la preparación.

## Próximos hitos y criterios de aceptación

1. **Autenticación real.** Probar login, logout, renovación, cuenta deshabilitada y token revocado. Una cuenta Driver no debe entrar en Admin ni ejecutar sus operaciones.
2. **Reservas y asignación.** El operador debe listar una reserva persistida, revisar precio y disponibilidad y asignar un conductor real.
3. **Ejecución del viaje.** El conductor solo debe acceder a sus viajes. Los estados deben persistirse, respetar la versión y rechazar transiciones inválidas.
4. **Seguimiento.** El cliente debe consultar el estado confirmado, sin conductor, ubicación o ETA ficticios. La ubicación debe detenerse al terminar el viaje.
5. **Persistencia y recuperación.** Comprobar reinicios, concurrencia, reintentos e idempotencia con payloads diferentes; definir almacenamiento e índices adecuados.
6. **Validación integral.** Ejecutar el recorrido cliente → operador → conductor → finalización, incluyendo cortes de conexión y errores.

El primer piloto debe ser supervisado por el operador. Los módulos adicionales siguen dentro de la visión del proyecto, pero cada etapa debe quedar conectada y probada antes de considerarse terminada. No hay una medición objetiva que permita afirmar un porcentaje global de finalización.

## Alcance de esta publicación

Único archivo propuesto: `docs/LVTRANSPORT_ANALISIS_TECNICO_2026-11-12.md`, para dejar trazabilidad de hallazgos, resultados locales y trabajo pendiente.

Esta publicación no incorpora correcciones de código, tests, credenciales, dependencias ni cambios de infraestructura. No modifica el comportamiento de la API, los paneles ni el despliegue.
