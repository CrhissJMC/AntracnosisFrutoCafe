# Casos de prueba funcionales CP01–CP10

Un caso por requerimiento funcional, tal como los define la Tabla 23 del informe. Se ejecutan sobre el sistema
completo (web, API, base de datos y servicio de los modelos) con usuarios de prueba de cada perfil; al terminar,
el script borra todo lo que creó: capturas con sus fotos, usuarios con sus comentarios y la versión de prueba del modelo.

## Resultado (21/11/2026, versión v0-preliminar)

| Caso | Requerimiento | Estado |
|---|---|---|
| CP01 | RF01 · Ingesta de imagen del fruto | Aprobado |
| CP02 | RF02 · Preprocesamiento | Aprobado |
| CP03 | RF03 · Clasificación con CNN | Aprobado |
| CP04 | RF04 · Diagnóstico visual inmediato | Aprobado |
| CP05 | RF05 · Registro de capturas | Aprobado |
| CP06 | RF06 · Validación experta | Aprobado |
| CP07 | RF07 · Base de conocimiento | Aprobado |
| CP08 | RF08 · Tablero de incidencia | Aprobado |
| CP09 | RF09 · Reentrenamiento y versionado | Aprobado |
| CP10 | RF10 · Gestión de usuarios y perfiles | Aprobado |

Pendiente: confirmar en un teléfono físico que «Tomar foto» abre la cámara (CP01). En el navegador solo se comprobó el
atributo `capture="environment"` del campo.

## Archivos

| Archivo | Contenido |
|---|---|
| `casos_de_prueba.mjs` | Pruebas automáticas contra la API real (50 verificaciones; con las 12 del navegador, 62 en total) |
| `resultados.json` | Resultado de cada verificación, con su detalle |
| `verificacion_navegador.json` | Lo que solo se ve en la pantalla: cámara, mensajes de error, semáforo, botón a las fichas, filtro del blog y pestañas por perfil |
| `evaluacion_prueba.json` | Métricas del conjunto de prueba (568 imágenes) usadas como evidencia en CP03 |
| `imagenes/` | Fotos del conjunto de prueba y variantes de resolución y orientación (una girada solo con la etiqueta EXIF) |

## Cómo ejecutarlas

Con el sistema encendido (`docker compose --profile ml up -d`). En Git Bash, antepón `MSYS_NO_PATHCONV=1` a cada comando.

```bash
docker compose cp pruebas api:/tmp/pruebas
docker compose exec -u root api chown -R node /tmp/pruebas
docker compose exec api node /tmp/pruebas/casos_de_prueba.mjs
docker compose cp api:/tmp/pruebas/resultados.json pruebas/resultados.json
```

El script usa la cuenta de administrador del `.env` y respeta el límite de 20 análisis por minuto, así que tarda unos dos minutos.
