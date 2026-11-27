# Reconexión de teclado y ratón entre Minisforum y Galaxy

El registro de Deskflow anotó `client "Galaxy" is dead` mientras el servidor seguía escuchando. La Galaxy se veía por USB en modo MTP, pero ADB no mostraba dispositivos y el último puerto inalámbrico conocido rechazaba la conexión. El registro identifica la pérdida de la conexión del cliente. La causa exacta en Android queda sin confirmar.

- `galaxy-deskflow-server.service` mantiene Deskflow en loopback TCP 24800 con la configuración TLS y el mapa de pantallas existentes. Reinicia tras cuatro segundos si el proceso cae. El inicio de sesión gráfico también inicia la unidad mediante `~/.config/autostart/galaxy-deskflow.desktop`.
- `galaxy-deskflow-reconnect.timer` comprueba el enlace cada 15 segundos al finalizar la comprobación anterior. El script `~/.config/galaxy-deskflow/reconnect.sh` prefiere ADB USB, intenta el último destino inalámbrico autorizado si no encuentra el dispositivo y comprueba el modelo Galaxy antes de restaurar únicamente el túnel inverso TCP 24800.
- Se comprobó una terminación controlada del servidor y el arranque automático de un proceso nuevo que escuchó en loopback. El temporizador está activo. El túnel y la reconexión del cliente quedan pendientes de comprobar cuando la Galaxy vuelva a aparecer en ADB con depuración activa y autorizada. Si cambia el puerto inalámbrico, actualizar el destino conocido o usar la conexión USB con depuración.

## Conexión Wi-Fi permanente verificada

Se configuró `galaxy-deskflow-wifi.service` para iniciar y reiniciar un relay TCP sobre la IP Tailscale de Minisforum. El relay solo admite la IP Tailscale de la Galaxy y reenvía el flujo TLS al Deskflow local en TCP 24800. Input Leaf guardó el nuevo destino como favorito, conservó el perfil anterior y confirmó su huella TLS contra el certificado de Minisforum. El interruptor **Auto-connect on launch** estaba activo.

Deskflow confirmó `client "Galaxy" has connected` y se verificó una conexión TCP desde la IP Tailscale de la Galaxy. Tras reiniciar el relay de forma controlada, Input Leaf reconectó automáticamente por Wi-Fi. El puerto ADB actualizado sirve para administración y como respaldo del túnel. La conexión principal de teclado y ratón ya usa directamente Tailscale y no requiere que ese puerto ADB permanezca disponible.
