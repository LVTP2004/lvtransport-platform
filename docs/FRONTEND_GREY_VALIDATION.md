# FRONTEND GREY VALIDATION — checklist conservador

Fecha: 2026-05-18
Ámbito: `apps/web-consolidated-grey`

## 1) Validación técnica observada

- Stack: Vite + React + TypeScript (estructura mínima correcta).
- UI: tema grey/gold consistente.
- Responsive: usa `flex-wrap`, `grid auto-fit`, `clamp()` para títulos.
- Formulario: campos requeridos presentes (pickup, destination, date, time, passengers, phone).
- Mapa: iframe Google Maps con `loading="lazy"`.
- WhatsApp: presente pero con número placeholder.

## 2) Hallazgos de seguridad frontend

### Problema detectado:
No hay validación robusta de formato en teléfono/inputs más allá de `required`.

Impacto:
Mayor ruido de datos en API y mala calidad de reservas.

Riesgo:
Medio.

Propuesta:
Agregar validación cliente (regex E.164 mínimo para phone, rangos date/time/passengers) y mensajes UX.

Comando sugerido, si aplica:
`pnpm --filter @lvtransport/web-consolidated-grey typecheck`

Rollback:
Revert del commit de validaciones UI si afectara conversión.

Founder approval required: YES

---

### Problema detectado:
Endpoint hardcodeado a dominio/ruta no alineada con API versionada.

Impacto:
Reserva falla incluso con API sana.

Riesgo:
Alto.

Propuesta:
Usar variable de entorno `VITE_API_BASE_URL` + rutas relativas versionadas.

Comando sugerido, si aplica:
`pnpm --filter @lvtransport/web-consolidated-grey build`

Rollback:
Volver a versión anterior del frontend estático.

Founder approval required: YES

## 3) Cómo probar staging (sin tocar producción)

1. Build de grey en entorno con acceso npm.
2. Servir `dist` en vhost staging separado (sin modificar vhost productivo).
3. Probar:
   - carga inicial,
   - navegación anchors,
   - envío reserva (201 esperado),
   - fallback controlado cuando API falla,
   - tracking en API,
   - links WhatsApp.
4. Verificar CORS desde staging domain hacia API.

## 4) Rollback plan

- Si falla UX o reservas: volver inmediatamente al docroot anterior.
- No tocar PM2 (permanece solo API).
- No habilitar 4173 ni `vite preview`.

## 5) Criterio de pase para recomendar B

- Build reproducible OK.
- Booking POST funcional contra `/api/v1/bookings`.
- WhatsApp real validado.
- Smoke test cross-device (mobile/desktop) sin bloqueos críticos.
