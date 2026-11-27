# Continuidad de la cola de LVTransport en MONI

El 27 de noviembre de 2026 se verificó que el Job Manager existente ejecuta trabajos en cola sin mantener abierto el despacho. Se incorporó al [contrato de agentes](../../AGENTS.md) la obligación de registrar el resultado y continuar con el siguiente encargo autorizado del plan A–Z.

| Encargo | Job | Resultado |
| --- | --- | --- |
| Codex CLI, validación de reservas en copia aislada | `676461e48b31bca1c84296a97501c501` | COMPLETE, recibo `8d8329a91b3f0a165248050de1c81d15`. Base `a7708afbdcba16dcef7e146c4501297daab3bdfd`, typecheck y nueve comprobaciones correctas. SHA-256 del parche `070e744a5d6eb2895d006a702b86aa981b46132d3ce187f0e24aca280aa162df`. |
| Diagnóstico Qwen | `a5c1aa9ab4d84c8d16a498da97879e29` | COMPLETE, recibo `441d2d681e5080a0c632c1231cc6f246`. |
| Revisión Qwen del resultado | `a211fe0df23bb961c33d50b880b9391d` | BLOCKED, recibo `5c745875cb4c2690fd58834dc4f9a889`. El ejecutor informó `Capability unavailable or baseline rejected`. |
| Resumen independiente por Qwen en el VPS | `78f7e51ab2693e48346c8486e5281a26` | COMPLETE, recibo `1abd83b8b9101d72f1af594124bb58e1`. Se despachó después del bloqueo de revisión. Es un resumen del recibo, no una segunda ejecución de los tests. |

Repetir la solicitud de Codex conservó el mismo job y la misma tarea, en COMPLETE. El parche solo se probó contra la base fijada. La copia de integración ya contenía cambios para el mismo archivo de validación y se conservaron. Pasaron las cuatro pruebas de validación de reservas de esa copia, trece pruebas de acceso y Checkout y el typecheck de las aplicaciones. Las pruebas de la cola verificaron en aislamiento conciliación después de reinicio, persistencia de un resultado ya guardado sin reejecución y clasificación de una interrupción ambigua. El informe de unittest indicó 18 pruebas ejecutadas y una omisión.

Los primeros dos encargos fueron encolados desde esta sesión. También se despacharon desde aquí la revisión y el resumen del VPS. La cola ejecutó y conservó los resultados por su cuenta. Queda pendiente que MONI seleccione y despache por sí mismo el siguiente encargo real del plan A–Z, recupere una tarea de ingeniería interrumpida en otro nodo y devuelva la evidencia tras el cierre del chat. El perfil activo de Codex está fijado a la validación de reservas. La ampliación debe reutilizar el broker y reconciliar el despacho, la rama y la PR mediante una sola identidad de trabajo. [Integración pendiente en MONI Core #222](https://github.com/LVTP2004/moni-core-runtime/issues/222#issuecomment-7226061455)

## Segundo ensayo con despacho automático

Se añadió un selector finito al supervisor de Minisforum en `~/.local/share/moni/lvtp-supervisor/supervisor.py` (SHA-256 `7c541129098df58c331cac101f6a67a135c163c1b6dcf27ccb657463122c84a6`). El timer existente `moni-lvtp-supervisor.timer` llama al supervisor cada 35 segundos tras finalizar su última ejecución. El supervisor consulta el Job Manager existente, conserva identificadores fijos y solo despacha el piloto si el backend confirma Stripe de prueba. El estado queda en el JSON del supervisor y sus eventos.

- **20:04:29 UTC.** El supervisor despachó Codex en `488d80130fa4ba1f4084a1cdcaf7bf08`. Terminó COMPLETE con nueve comprobaciones y recibo `6f6b98fc4842d887be2135e88c3f3c60`.
- **20:05:07 UTC.** El temporizador observó el primer resultado y despachó automáticamente Qwen en `c473497fb13f9732de309eab316f86bb`. Terminó COMPLETE con recibo `0fd800d8c7b0c69d3b98b01307132a7e`.

En SQLite temporal se probaron selección serial, no repetir un despacho ya vinculado, un reintento de ingeniería ante `AMBIGUOUS_INTERRUPTION`, reconocimiento del intento hijo y continuación con el encargo independiente si ese intento queda bloqueado. El broker sigue siendo la fuente de estado. El reintento ante una caída real todavía requiere una prueba de operación. El piloto cubre dos perfiles fijos existentes. Quedan pendientes el catálogo general de encargos A–Z, el relevo real entre nodos de ingeniería y la publicación automática con CI de #222. La evidencia de este ensayo se publicó manualmente en GitHub.
