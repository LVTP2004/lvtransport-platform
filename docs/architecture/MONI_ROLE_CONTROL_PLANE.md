# Roles de LVTransport y relación con MONI

La API verifica la identidad con Firebase antes de asignar permisos a partir
del rol validado. Las pantallas de los portales usan esa sesión para acceder a
las operaciones del servidor.

| Rol de API | Permisos asignados |
| --- | --- |
| `customer` | `book:ride`, `manage:profile` |
| `driver` | `driver:update_status` |
| `admin` | `admin:read`, `admin:write` |
| `super_admin` | Permisos de Admin, `admin:secure_action`, `audit:read` |
| `founder` | `founder:read` |

El alcance también depende de la operación. La API aplica comprobaciones de
propiedad y asignación en las rutas de reservas. El portal Founder dispone
de lectura y su rol requiere un buzón verificado.

MONI puede apoyar la explicación y la revisión de información. Las decisiones
sobre acceso y cambios operativos corresponden a los permisos del servidor y
a las autorizaciones humanas aplicables. La aprobación de cambios protegidos
en GitHub sigue el procedimiento de revisión del propietario descrito en el
[estado de implementación](./LVTRANSPORT_IMPLEMENTATION_STATUS.md).

La [PR #407](https://github.com/LVTP2004/lvtransport-platform/pull/407) conserva
la propuesta histórica de superficies y capacidades de MONI. Sus propuestas
de roles adicionales y autoridad financiera siguen sujetas a diseño,
autorización y validación antes de incorporarse al producto.
