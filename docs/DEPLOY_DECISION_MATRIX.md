# DEPLOY DECISION MATRIX — lvtransport.be visual layer

Fecha: 2026-05-18

## Opciones evaluadas

| Opción | Descripción | Beneficio | Riesgo | Probabilidad | Decisión sugerida |
|---|---|---|---|---|---|
| A | Mantener staging | Cero impacto en producción | Se retrasa salida visual nueva | Baja | Válida como paso intermedio |
| B | Cambiar nginx temporalmente a `web-consolidated-grey/dist` | Validación real de nueva capa visual | Si falla endpoint reservas, se cae conversión | Media-Alta | **Solo tras corregir endpoint y WhatsApp** |
| C | Fusionar `web-consolidated-grey` dentro de `apps/web` | Unificación de código | Alto riesgo por deuda/errores TS en legacy | Alta | No recomendado ahora |
| D | No desplegar todavía | Protege arquitectura consolidada | Retraso comercial | Media | **Recomendación actual** |

## Decisión propuesta para Founder

**Estado actual recomendado: Opción D**

Condición para mover a B:
1. Contrato API corregido y validado (`/api/v1/bookings`).
2. WhatsApp real configurado.
3. Build/typecheck reproducible en staging.
4. Smoke tests de formulario + tracking + health completados.

## Gobernanza (requiere aprobación explícita)

### Problema detectado:
Despliegue prematuro sin corregir contrato API.

Impacto:
Interrupción de reservas en producción.

Riesgo:
Alto.

Propuesta:
Gate de salida con checklist obligatorio previo a cualquier cambio nginx.

Comando sugerido, si aplica:
`curl -i https://api.lvtransport.be/api/v1/health`

Rollback:
Mantener docroot actual y no tocar configuración activa hasta aprobación.

Founder approval required: YES
