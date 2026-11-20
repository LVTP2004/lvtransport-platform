# LV Transport Platform

LV Transport Platform is a **private premium mobility and delivery ecosystem** developed under the LV Transport identity.
It is functionally inspired by large multi-service transport platforms, while maintaining independent branding, product language, and implementation.

> **Important:** This repository must not copy Uber branding, design assets, text, or source code.

## Empieza aquí — estado revisado el 20 de noviembre de 2026 (UTC)

Ya existen implementación y entregas incrementales documentadas. Las secciones originales de planificación que se conservan más abajo orientan el producto; no afirman que todos los módulos estén terminados.

| Pregunta | Fuente y función |
| --- | --- |
| ¿Cuál es el plan del producto? | El [Plan Maestro](docs/PROJECT-MASTERPLAN.md) define las fases oficiales. [Founder Vision](docs/FOUNDER_VISION_STATEMENT.md) registra la visión del producto. |
| ¿Qué reglas rigen los cambios? | [Contrato de agentes](AGENTS.md) y [especificación bloqueada](docs/LVTRANSPORT_SPEC_LOCK.md). Leerlos junto con las decisiones posteriores del propietario y su alcance. |
| ¿Qué ha decidido el propietario? | El [registro de decisiones en el head revisado de #410](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/docs/LVTRANSPORT_DECISIONS.md) recoge requisitos y la autorización posterior de entregas verificadas. [#409](https://github.com/LVTP2004/lvtransport-platform/issues/409) y su [aclaración del 20 de noviembre](https://github.com/LVTP2004/lvtransport-platform/issues/409#issuecomment-7043875155) definen las superficies actuales. Una decisión no certifica su implementación. |
| ¿Dónde están las fuentes operativas consolidadas? | El [PR #410, en borrador](https://github.com/LVTP2004/lvtransport-platform/pull/410), revisado en [`c510828`](https://github.com/LVTP2004/lvtransport-platform/commit/c51082883254bdb8603b43723699f50affcedcd5), contiene fuentes de reservas, autenticación, portales, GPS y seguimiento. Su [estado de implementación](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/docs/architecture/LVTRANSPORT_IMPLEMENTATION_STATUS.md) distingue comprobaciones registradas, publicaciones y pendientes. Estos cambios no están integrados en `main`. |
| ¿Dónde está la referencia visual aprobada? | El [PR #416](https://github.com/LVTP2004/lvtransport-platform/pull/416) añade [un PNG conceptual](https://github.com/LVTP2004/lvtransport-platform/blob/588a151206e41b82a3ee3bb6cce4599f29949eee/docs/design/lvtransport-four-pages-reference.png). Registra cuatro bloques de producto; Cliente reúne las superficies pública y privada. El PR no implementa esas pantallas. |
| ¿Qué se publicó? | Los recibos fechados de [validación de reservas](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/verification/LVTP_BOOKING_VALIDATION_20261119.json), [sesiones web](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/verification/LVTP_SESSION_RELEASE_20261119.json) y [GPS/seguimiento](https://github.com/LVTP2004/lvtransport-platform/issues/411#issuecomment-7020861061) describen entregas concretas en la VPS. Son registros de publicación; no son una nueva comprobación en vivo ni prueban que se desplegara toda la rama. |
| ¿Qué falta aceptar? | [#411](https://github.com/LVTP2004/lvtransport-platform/issues/411) reúne el inicio real con Google y un viaje completo con cuentas, conductor y vehículo autorizados. Sigue abierto. |

### Cómo leer el estado de las fuentes, las entregas y la aceptación

Esta revisión tiene fecha. Al realizarla, `main` estaba en [`a7708af`, del 5 de noviembre de 2026](https://github.com/LVTP2004/lvtransport-platform/commit/a7708afbdcba16dcef7e146c4501297daab3bdfd); #410 era un borrador en `c510828` y #416 estaba abierto en [`588a151`](https://github.com/LVTP2004/lvtransport-platform/commit/588a151206e41b82a3ee3bb6cce4599f29949eee). Ninguno estaba integrado mediante merge. Consultar su estado actual en GitHub antes de iniciar trabajo nuevo.

Las fuentes de GPS y seguimiento se consolidaron en #410 el **19 de noviembre a las 20:19 UTC**, después del recibo de publicación correspondiente. La indicación anterior de que faltaba consolidarlas es histórica. La verificación desde instalación limpia registrada para esa consolidación no significa que producción se sustituyera por un build completo de la rama: las publicaciones aplicaron parches acotados a los artefactos existentes.

Conviene distinguir estos estados:

- **Plan o decisión del propietario:** comportamiento y autoridad previstos.
- **Fuente en un PR:** código disponible para revisión, identificado por commit.
- **Entrega publicada:** artefactos concretos y comprobaciones de un recibo fechado.
- **Comportamiento aceptado:** recorrido con cuentas reales y resultados registrados en #411.

#410 mantiene pendiente la revisión del bloqueo de Spec Guard. Un build web o una preview correctos no completan esa revisión ni la aceptación con cuentas reales.

### Modelo actual de superficies

La [aclaración del propietario](https://github.com/LVTP2004/lvtransport-platform/issues/409#issuecomment-7043875155) y su [confirmación de acceso](https://github.com/LVTP2004/lvtransport-platform/issues/409#issuecomment-7044335739) conservan la portada pública actual y distinguen **una superficie pública y cuatro accesos autenticados** dentro de los cuatro bloques visuales.

| Superficie | Acceso y función acordados |
| --- | --- |
| Web pública | Consultar servicios, solicitar un viaje y comprobar su estado por referencia sin iniciar sesión. |
| User Login · Ride | Viajes propios del cliente, historial de rutas, pagos reales y recibos disponibles. |
| Driver Login · MONI Drive | Viajes asignados, navegación y actualización del lifecycle; acceso de conductor autorizado por el servidor. |
| Admin Login · Control Tower | Reservas, asignaciones, conductores y flota; acceso operacional autorizado por el servidor. |
| Founder OS Login · MONI Core | Superficie ejecutiva y de gobernanza de LVTransport, con permisos propios. |

Registrarse como cliente no concede acceso Driver, Admin o Founder. Historial, pagos, recibos y sugerencias de rutas frecuentes son alcance acordado sujeto a implementación y verificación; esta tabla no certifica que estén terminados. La referencia visual no concede autoridad en backend.

El [registro de decisiones](https://github.com/LVTP2004/lvtransport-platform/blob/c51082883254bdb8603b43723699f50affcedcd5/docs/LVTRANSPORT_DECISIONS.md) también exige que LVTransport pueda venderse y funcionar independientemente de LVTP Core. Founder OS pertenece aquí al producto LVTransport; los servicios compartidos conservan las fronteras de proyecto, finanzas y permisos.

## Repository Purpose

Se conserva a continuación el propósito original del repositorio. Es una descripción del alcance del producto, no del grado de implementación.

This repository is the central workspace for planning and implementing:

- Public web presence
- Passenger ride operations
- Driver and courier operations
- Business/VIP client operations
- Food delivery module preparation
- Admin operations control tower
- Unified backend services and APIs
- Deployment and infrastructure configuration

## Estructura del repositorio

Se conserva la estructura de módulos original y se añade la entrada de fuentes web que identifica el [contrato de agentes](AGENTS.md). La presencia de una carpeta describe organización; no certifica que el módulo esté terminado ni identifica por sí sola el artefacto desplegado. La API es un servicio separado de la web estática.

- [current-site/](current-site/) — respaldo/base del sitio `lvtransport.be`
- [apps/web](apps/web/) — fuentes de la web pública; la consolidación actual se revisa en #410
- [apps/main-web](apps/main-web/) — módulo original de web pública y marketing
- [apps/ride](apps/ride/) — **LV Ride**, taxi y transporte premium de pasajeros
- [apps/driver](apps/driver/) — **LV Driver**, panel de conductores y repartidores
- [apps/admin](apps/admin/) — **LV Admin**, torre de control y panel operacional
- [apps/business](apps/business/) — **LV Business**, portal VIP/corporativo y suscripciones
- [apps/eats](apps/eats/) — **LV Eats**, pedidos de comida y entregas locales
- [apps/api](apps/api/) — **LV API**, backend central
- [docs/](docs/) — documentación de arquitectura, seguridad, planificación y operación
- [deploy/](deploy/) — material de despliegue e infraestructura; consultar el contrato antes de cualquier cambio operacional

## Core Modules

Se conservan las responsabilidades de producto del resumen original; no constituyen un inventario de funciones aceptadas.

1. **LV Ride**
   - Passenger booking and premium ride management.
2. **LV Eats**
   - Food ordering and local delivery workflows (prepared structurally for later phases).
3. **LV Business**
   - VIP/corporate accounts, subscriptions, invoicing, and account management.
4. **LV Driver**
   - Driver/courier onboarding, availability, task handling, and earnings visibility.
5. **LV Admin**
   - Operations supervision, dispatch support, support workflows, and control tools.
6. **LV API**
   - Central backend domain services, authentication, authorization, and integrations.

## Development Priorities (Official Phasing)

El [Plan Maestro](docs/PROJECT-MASTERPLAN.md) sigue siendo la base de planificación del producto. Se conservan sus prioridades oficiales; esta lista no declara fases completadas.

- **Phase 1:** LV Ride + LV Admin + LV Driver + LV API
- **Phase 2:** login, roles, bookings, tracking, emails
- **Phase 3:** LV Business/VIP
- **Phase 4:** LV Eats basic structure
- **Phase 5:** marketplace expansion

## Visión y referencias de planificación

| Documento | Función |
| --- | --- |
| [Founder Vision Statement](docs/FOUNDER_VISION_STATEMENT.md) | Visión del producto. |
| [Project Masterplan](docs/PROJECT-MASTERPLAN.md) | Alcance y prioridades oficiales por fases. |
| [Architecture](docs/ARCHITECTURE.md) | Planificación fundacional de arquitectura; leer junto con el contrato actual y la evidencia de implementación fechada. |
| [Security](docs/SECURITY.md) | Planificación y principios de seguridad. |
| [Roadmap](docs/ROADMAP.md) | Registro de planificación; no es la lista actual de aceptación en producción. |
| [Modules](docs/MODULES.md) | Responsabilidades previstas de los módulos. |
| [Functional Reference](docs/UBER-FUNCTIONAL-REFERENCE.md) | Investigación funcional, sujeta a identidad propia de LV Transport y a la prohibición de copiar. |

La etapa inicial centrada exclusivamente en documentación es histórica. Las fuentes fechadas del inicio permiten determinar qué está implementado, en revisión, publicado o pendiente de aceptación. Los materiales anteriores de planificación y recuperación conservan su función original; su título no demuestra el estado del sistema en ejecución.

## Copias de seguridad y recuperación

El protocolo y los scripts de respaldo y recuperación están en:

- [Protocolo de respaldo y recuperación](docs/operations/LVTP_BACKUP_AND_DISASTER_RECOVERY_PROTOCOL.md)
- [Script de respaldo](scripts/backup/lvtp-backup.sh)
- [Script de comprobación de restauración](scripts/backup/lvtp-restore-check.sh)

Estas referencias documentan trabajo de recuperación; la existencia de un script no certifica que se ejecutara un respaldo o una restauración concretos.
