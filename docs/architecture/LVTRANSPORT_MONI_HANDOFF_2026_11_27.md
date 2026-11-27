# Informe de continuidad de LVTransport y MONI

Corte del 27 de noviembre de 2026. Este informe permite a ChatGPT retomar el proyecto con las pruebas realizadas, las decisiones de gobernanza y los bloqueos vigentes. LVTransport demostró un viaje completo con Stripe de prueba y ambos desenlaces de ausencia desde la app instalada. MONI demostró trabajo en paralelo y el relevo de una comprobación de disponibilidad. La aceptación para clientes reales y el relevo de tareas de ingeniería siguen abiertos.

## Aceptación de LVTransport

| Flujo | Resultado verificado |
| --- | --- |
| App instalada | Fossibot F109 y Galaxy Tab SM-X210R accedieron al candidato de staging desde el WebAPK LV. Se restauró el túnel inverso ADB 44224 y se verificó la recuperación de las sesiones operativas. |
| Viaje 30785 en F109 | Control Tower asignó expedientes vigentes. Drive aceptó, registró salida, llegada, inicio y cierre. Ride mostró «Afgerond» y Founder mostró «Captured» y «Net paid €29.25». Stripe de prueba confirmó 2.925 céntimos EUR capturados. |
| Webhook de 30785 | Se registró la recepción de un evento de Stripe de prueba correlacionado con la sesión de 30785. La captura final se comprobó también consultando directamente el PaymentIntent. |
| Ausencia confirmada 33926 en Galaxy | Drive reportó ausencia y Control Tower confirmó. La reserva quedó cancelada. Stripe de prueba confirmó la liberación de la autorización con 0 EUR capturados. |
| Ausencia descartada 23888 en Galaxy | Control Tower descartó el informe y el viaje se completó. La reserva quedó completada y Stripe de prueba registró la captura. |
| Pruebas de correo y reembolso | En Minisforum pasaron 15 de 15 pruebas del piloto I/J con datos sintéticos. Sin servicio de entrega, la API anuncia `emailCode: false` y desactiva las rutas de código. Una cuenta de finanzas que intenta aprobar su propia solicitud recibe HTTP 409 y produce cero escrituras en Stripe simulado. |

La referencia del viaje completo es **30785**. Conserva **55113** como referencia histórica de la solicitud original. El repositorio local conserva la cronología detallada en `docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md`, con evidencias de staging. [Piloto I/J y comando de reproducción](LVTRANSPORT_UNATTENDED_PILOT_2026_11_27.md)

## Equipos y operación distribuida

- **Minisforum** aloja el entorno de integración, el panel de MONI y la supervisión periódica. El supervisor consulta la disponibilidad pública y staging y puede restaurar el túnel ADB del dispositivo conocido cuando confirma que el backend está en modo Stripe de prueba.
- **Aspire y Viviana** usan Ethernet para el acceso local y conservan Tailscale. Ejecutan observadores independientes y Qwen local. Se registró ejecución simultánea y se comprobó que Viviana seguía observando cuando se pausó el observador de Aspire.
- **VPS** ejecutó un encargo de resumen en la cola MONI. Se validaron los hashes de los respaldos de web y API en VPS y Aspire. Queda por arrancar los servicios desde esos respaldos y comprobar la recuperación de datos.
- **Galaxy y Fossibot** sirven para aceptación en la app LV. Galaxy también se configuró para visualizar el panel privado y recibir teclado y ratón desde Minisforum mediante Deskflow. El panel distingue conectividad de actividad, muestra las colas A–Z y permite seguir registros de ejecución.

En el piloto C2 se detuvo el ejecutor de Aspire, expiró su concesión y Viviana tomó el mismo encargo. Viviana verificó HTTP 200 en web y API. El registro aceptó un único resultado y rechazó la entrega tardía de Aspire. El host del registro permaneció disponible durante el ensayo. [Evidencia del relevo C2](LVTRANSPORT_RELAY_PILOT_2026_11_27.md)

En el piloto I/J las revisiones Qwen se ejecutaron en servicios separados de SSH. Aspire propuso un estado HTTP incorrecto y Viviana agotó su primer intento y devolvió una revisión parcial en el segundo. Codex preparó y verificó el parche de pruebas en una copia aislada de Minisforum. [Evidencia del piloto I/J](LVTRANSPORT_UNATTENDED_PILOT_2026_11_27.md)

## Gobernanza para trabajar sin supervisión

Founder OS establece el alcance delegado. MONI observa, diagnostica y coordina. LEONIDAS prioriza, ORACLE evalúa el riesgo y FORGE o Nexus ejecutan dentro del alcance autorizado. Las comprobaciones rutinarias y el desarrollo en staging pueden avanzar bajo una autorización vigente. Roles, pagos y cambios protegidos de producción se rigen por sus autorizaciones específicas. Los resultados de Qwen se contrastan con pruebas reproducibles antes de integrar cambios.

El plan A–Z registra tareas, dependencias y responsables por nodo. Fue recuperada la gobernanza histórica de MONI Core y de los repositorios de recuperación de Aspire y Viviana, junto con el historial de LVTransport. [Plan de cierre A–Z](LVTRANSPORT_CLOSING_PLAN_A_Z.md) · [PR con la configuración y evidencias](https://github.com/LVTP2004/lvtransport-platform/pull/447)

## Próximos pasos y criterios de cierre

1. **Correo.** Habilitar SMTP en staging y comprobar entrega y canje del código con las cuentas correspondientes en Ride, Drive, Control Tower y Founder.
2. **Reembolso.** Configurar en staging una segunda cuenta de finanzas verificada en `refund-approver-uids`. Ejecutar solicitud y aprobación separadas, conciliar el resultado con Stripe de prueba y comprobar el registro.
3. **Facturación y liquidación.** Cerrar datos fiscales, reglas de emisión y rectificación, cálculo de comisiones y criterio de liquidación. La conciliación del cobro de 30785 ya iguala Stripe, Ride y Founder en 29,25 EUR.
4. **Autonomía de MONI.** Demostrar que otro nodo toma un encargo de ingeniería al interrumpirse su ejecutor y conserva un único resultado validado. Después, demostrar recuperación de la cola si cae su propio host. Probar un canal de alertas operativo para incidentes fuera del alcance delegado.
5. **Publicación.** Validar el candidato en el dispositivo, comprobar que el respaldo de web y API permite restaurar los servicios y confirmar la autorización vigente. Tras publicar, verificar salud de la API, permisos de los cuatro portales y versión cargada por la app LV instalada.

La continuidad del trabajo debe partir del plan A–Z y conservar los cambios locales existentes. Las pruebas de pagos de esta etapa se limitan a Stripe de prueba y a proveedores simulados en las suites locales.
