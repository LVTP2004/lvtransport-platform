# Red y dispositivos de pruebas de LVTransport

## Topología

| Equipo | Conexión | Uso |
| --- | --- | --- |
| Minisforum | Ethernet local y Tailscale | Puesto de operaciones, ADB y backend aislado de staging |
| Aspire | Ethernet al Minisforum y Tailscale | API, persistencia y ensayos de restauración |
| Viviana | Ethernet al Minisforum y Tailscale | Sesión web independiente para Ride y seguimiento |
| Galaxy Tab A9+ (SM-X210R) | USB disponible y ADB inalámbrico verificado | Segundo dispositivo Android para la app LV y teclado y ratón compartidos |
| Fossibot F109 S | ADB inalámbrico verificado | Dispositivo principal de aceptación en la app LV |
| VPS | Tailscale | Servidor de publicación y operación |

## Aspire y Viviana

El Minisforum tiene los alias locales `aspire-ethernet` y
`viviana-ethernet` en `~/.ssh/config`. Los alias seleccionan las
direcciones IPv4 de Ethernet y validan la identidad SSH del equipo.
En Viviana se usa su clave SSH ya configurada.

```sh
ssh aspire-ethernet
ssh viviana-ethernet
estado-equipos
```

El último comando está en `~/.local/bin/estado-equipos` en el
Minisforum. Comprueba la ruta y la respuesta por Ethernet e interroga
el estado de Tailscale por SSH. Si Tailscale muestra `NeedsLogin` y
Ethernet responde, el equipo sigue disponible en la red local.

El 27 de noviembre de 2026 se comprobó que las claves de ambos equipos
habían caducado. Se reautorizaron en el navegador y `tailscale ping`
verificó una ruta directa por la dirección Ethernet de cada equipo
desde el Minisforum. Si vuelve a caducar una clave, usar SSH Ethernet
para comprobar `tailscale status`, iniciar la reautorización si hace
falta y confirmar el equipo en el navegador. Tras el inicio de sesión,
comprobar de nuevo `estado-equipos` y `tailscale ping <equipo>`.

## Android y staging

Ejecutar `adb devices -l` para identificar por modelo la Galaxy o el
Fossibot. Al usar Wi‑Fi, el puerto de depuración puede cambiar al
reconectar. Se debe seleccionar el dispositivo de forma explícita.

```sh
adb -s <dispositivo> reverse tcp:44224 tcp:44224
adb -s <dispositivo> reverse --list
```

El backend aislado escucha en el puerto 44224 del Minisforum. Su
respuesta de salud esperada es HTTP 200 con `staging: true` y
`payments: stripe-test`. Abrir la app LV instalada, confirmar la portada
«Uw taxi, met zorg geregeld.» y abrir Ride de aceptación en
`/aceptacion-lv/ride/`. El indicador esperado es «Testomgeving ·
Stripe-testmodus». En la Galaxy se concedió a lvtransport.be el permiso
de acceso local para llegar al túnel. El modelo de la Galaxy y el
Fossibot se verificaron nuevamente por ADB el 27 de noviembre.

## Teclado y ratón del Minisforum en la Galaxy

Deskflow en el Minisforum e Input Leaf en Android comparten teclado y
ratón. El cursor cruza hacia la Galaxy por el borde derecho y vuelve por
el izquierdo. La Galaxy ejecuta sus propias apps Android.

- El servicio de usuario `galaxy-deskflow.service` fue iniciado como
  unidad transitoria. Deskflow escucha solo en `127.0.0.1:24800` y usa
  TLS. La configuración de pantalla se guarda localmente en
  `~/.config/galaxy-deskflow/layout.conf`. El portapapeles compartido
  está deshabilitado.
- En la Galaxy, Input Leaf tiene el nombre de pantalla `Galaxy` y
  conecta a `127.0.0.1:24800` a través de
  `adb -s <galaxy> reverse tcp:24800 tcp:24800`. Ante un certificado
  nuevo se coteja su huella con el certificado local antes de aceptarlo.
- Se verificó en el registro de Deskflow el cruce del cursor en ambos
  sentidos. Android concedió a Input Leaf el servicio de accesibilidad.
  La escritura en otra app Android y el modo nativo de Shizuku quedan
  pendientes de verificación. Shizuku se instaló e inició, y la velocidad
  del puntero Android se dejó en +2.
- Al reconectar, comprobar el túnel ADB, el estado de Deskflow y la
  conexión en Input Leaf. Tras reiniciar el Minisforum hay que volver
  a iniciar la unidad transitoria.

Las claves SSH y TLS, las credenciales de staging y los enlaces de
autorización se conservan en los equipos correspondientes.
