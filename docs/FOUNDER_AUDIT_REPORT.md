# FOUNDER AUDIT REPORT — LVTP2004/lvtransport-platform

Fecha de auditoría: 2026-05-18 (UTC)
Modo: **conservador / solo lectura + propuesta documental**.

## 1) Estado actual validado (según evidencia en repo)

- Existe una nueva app frontend `apps/web-consolidated-grey` basada en Vite + React + TypeScript.
- El backend API expone prefijo `/api/v1` y rutas de salud operativas (`/health` con redirect interno y `/api/v1/health`).
- Existe endpoint de reservas en backend (`POST /api/v1/bookings`) y endpoints de tracking (`/api/v1/tracking/...`).
- La app `apps/web` actual presenta errores TypeScript estructurales (sintaxis/JSX) que rompen typecheck.

## 2) Qué está listo

- Estructura base de `web-consolidated-grey` clara, mínima y mantenible para una capa visual estática.
- Formulario de reserva implementado en frontend.
- Integración visual de mapa (iframe Google Maps) implementada.
- Canal WhatsApp visible en CTA (actualmente placeholder).
- Backend ya contiene los bloques necesarios para health/tracking/bookings bajo `/api/v1`.

## 3) Qué falta antes de promover a capa oficial

- Corregir contrato de integración frontend-grey ↔ API:
  - Frontend-grey apunta a `https://api.lvtransport.be/bookings`.
  - API está montada bajo `/api/v1/bookings`.
- Definir número real de WhatsApp (no placeholder).
- Completar hardening frontend (validación de inputs, sanitización de feedback UI, política CSP y headers en nginx para estáticos).
- Ejecutar build/typecheck real en entorno con acceso npm (la auditoría no pudo instalar dependencias por 403 de registry).

## 4) Riesgos críticos detectados

### Problema detectado:
Mismatch de ruta de reservas entre frontend-grey y API (`/bookings` vs `/api/v1/bookings`).

Impacto:
Fallo funcional de reservas en producción (flujo principal de negocio degradado).

Riesgo:
Alto.

Propuesta:
Parametrizar `VITE_API_BASE_URL` en frontend-grey y consumir `${VITE_API_BASE_URL}/bookings` donde `VITE_API_BASE_URL` apunte a `https://api.lvtransport.be/api/v1`.

Comando sugerido, si aplica:
`pnpm --filter @lvtransport/web-consolidated-grey typecheck && pnpm --filter @lvtransport/web-consolidated-grey build`

Rollback:
Mantener nginx sirviendo frontend actual mientras se valida staging de grey.

Founder approval required: YES

---

### Problema detectado:
Placeholder de WhatsApp (`000000000000`) en CTA y footer.

Impacto:
Pérdida de leads/contactos; percepción de producto incompleto.

Riesgo:
Alto.

Propuesta:
Sustituir placeholder por número operativo real y validar formato internacional E.164.

Comando sugerido, si aplica:
N/A (cambio de contenido controlado).

Rollback:
Revertir solo el contenido del número si hay error de dato.

Founder approval required: YES

---

### Problema detectado:
`apps/web` legacy con errores TS/JSX activos.

Impacto:
Riesgo de ruptura en pipelines globales/monorepo y confusión operativa.

Riesgo:
Medio-Alto.

Propuesta:
No fusionar aún. Mantener `apps/web` aislada, abrir plan de saneamiento técnico por fases.

Comando sugerido, si aplica:
`pnpm --filter @lvtransport/web typecheck`

Rollback:
Sin cambios runtime; solo mantener aislamiento actual.

Founder approval required: YES

---

### Problema detectado:
No se pudo validar instalación de dependencias por restricción de registry (`ERR_PNPM_FETCH_403`).

Impacto:
No hay evidencia reproducible local de build final durante esta auditoría.

Riesgo:
Medio.

Propuesta:
Validar en staging/VPS con credenciales npm correctas o mirror autorizado.

Comando sugerido, si aplica:
`pnpm install && pnpm --filter @lvtransport/web-consolidated-grey build`

Rollback:
No aplicar cambios productivos hasta obtener build reproducible.

Founder approval required: YES

## 5) Recomendación final

**Recomendación: D) no desplegar todavía**

Motivo:
- Hay bloqueo funcional de endpoint en frontend-grey (ruta API incompatible).
- Hay placeholder en contacto crítico (WhatsApp).
- Falta evidencia de build reproducible en este entorno (limitación registry).

## 6) Próximo paso propuesto (sin ejecutar cambios)

1. Corregir contrato API en rama controlada.
2. Configurar WhatsApp real.
3. Ejecutar pruebas de staging documentadas en `docs/FRONTEND_GREY_VALIDATION.md`.
4. Si todo pasa, evaluar opción B temporal (nginx a dist grey) con rollback inmediato definido.
