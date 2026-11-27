# Verificación de aprobación de alcance para Spec Guard

Este seguimiento agrega un verificador y CI con firmas sintéticas. El
Spec Guard requerido sigue fallando cuando detecta rutas protegidas. El
verificador se valida por separado antes de decidir cómo integrarlo al
control obligatorio.

## Frontera de confianza

El proceso que verifica toma el script y la política de la base de
confianza. Recibe de configuración protegida el ID numérico del
propietario y un archivo OpenSSH de firmantes. El principal del archivo
es `github-user-<ID>`. La clave privada permanece bajo control exclusivo
del propietario. El verificador necesita un token de GitHub de lectura
y acceso a los objetos Git del head y la base. El proceso nunca ejecuta
archivos, scripts, dependencias o workflows del candidato.

Un comentario directo del propietario transporta la aprobación
firmada. Un comentario por sí solo no acredita aprobación. El
verificador lee en GitHub el estado de la PR y su comentario antes de
verificar y vuelve a leerlos antes de devolver un resultado.

## Formato del recibo

Reservar el ID mediante un comentario y editarlo con el texto exacto y
su firma SSH. El recibo usa UTF-8, separador LF y orden fijo de campos.
Los marcadores siguientes son datos de ejemplo.

```text
schema=lvtransport-spec-guard/v1
repository=LVTP2004/lvtransport-platform
pull_request=<número de PR>
comment_id=<ID del comentario>
owner_id=<ID numérico del propietario>
base_ref=main
base_sha=<40 hexadecimales en minúscula>
head_sha=<40 hexadecimales en minúscula>
protected_paths_sha256=<64 hexadecimales en minúscula>
decision=approve-protected-scope
approved_at=<UTC YYYY-MM-DDTHH:MM:SSZ>
-----BEGIN SSH SIGNATURE-----
<firma OpenSSH>
-----END SSH SIGNATURE-----
```

La firma verifica el texto que precede a su encabezado, incluido el
último LF. El namespace es `spec-guard@lvtransport.be`. El digest se
calcula sobre rutas ordenadas por bytes, cada una seguida de NUL. El
diff usa la política actual para identificar rutas protegidas y
desactiva renombres para evaluar tanto origen como destino. Un recibo
caduca 24 horas después de su fecha. Una copia en otro comentario, PR
o commit se rechaza. Verificar otra vez el mismo recibo vigente permite
revalidar el mismo alcance y no concede una segunda aprobación.

## Uso del verificador

Desde un checkout de confianza que contenga ambos objetos Git:

```bash
python3 scripts/spec_guard_approval.py \
  --repository-dir /ruta/al/git-de-confianza \
  --pr 422 --comment-id <id> --owner-id <id> \
  --allowed-signers /ruta/a/firmantes-autorizados
```

`GH_TOKEN` se entrega por el entorno protegido. Una salida
`verified-protected-scope` certifica únicamente el alcance. Cualquier
error de GitHub, Git o firma bloquea el resultado. El CI de esta rama
ejecuta pruebas sintéticas sin acceso a credenciales del propietario.

## Condiciones para conectar el check obligatorio

1. Validar en un repositorio de ensayo la publicación del check con
   una identidad de CI independiente y como origen requerido en la
   protección de rama.
2. Mantener el análisis de contenido del Spec Guard existente y
   comprobar qué commit consume GitHub para el check requerido, incluido
   el resultado de merge cuando corresponda. Verificar que un check
   exitoso para un SHA en otra PR no autoriza esa segunda PR.
3. Revalidar al cambiar la base, head, firma, comentario o firmantes.
   Configurar invalidación de un check vigente ante retirada o
   caducidad antes de usarlo para integrar. Si GitHub o la red fallan,
   el resultado requerido debe quedar bloqueado.
4. Obtener decisión del propietario sobre el registro protegido de la
   clave y la transición. Mantener el Spec Guard actual como requerido
   hasta demostrar la equivalencia del control en ensayo.

La aprobación de alcance requiere una solicitud posterior y queda
separada de las decisiones de fusión y despliegue.
