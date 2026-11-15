# coffee cherry 20251206 (Roboflow Universe)

- Autor: usuario «1» (2025) · https://universe.roboflow.com/1-hqah6/coffee-cherry-20251206
- Licencia: CC BY 4.0 (citar la fuente)
- Fork en la cuenta del equipo: `crhiss-magallan/coffee-cherry-20251206-jwcjq`, versión 1
  (sin preprocesamiento ni aumento), formato COCO (cajas) · descargado el 15/11/2026

## Contenido
- 1 639 imágenes (995 fotos originales distintas), mediana de 12 frutos por foto, en rama y sobre mesa.
- Frutos anotados (cajas):

| Clase | Frutos | Fotos que la contienen |
|---|---|---|
| unripe | 17 578 | 1 419 |
| ripe | 2 643 | 456 |
| semi_ripe | 1 720 | 392 |
| dry | 1 003 | 254 |
| overripe | 555 | 187 |
| **diseased** | **336** | **62** |

## Revisión de la clase `diseased`
Una muestra de 32 recortes (`coffee_cherry_20251206_muestra_diseased.jpg`) muestra sobre todo lesiones oscuras, hundidas y
necróticas sobre frutos verdes, pintones y maduros, compatibles con antracnosis (Tabla 12 del informe).
No se ven perforaciones de broca. Aun así la etiqueta es genérica: **confirmar con un especialista** antes
de usarla como «antracnosis».

## Cómo usarlo
- Recortar cada caja → una imagen por fruto, nombre `foto__N.jpg` (los recortes de una foto van juntos).
- `diseased` → antracnosis (tras revisión). Las demás clases → sano.
- Los frutos son pequeños (lado mediano ~60–80 px): descartar recortes de menos de ~40 px.
- Ignorar la división de Roboflow: el proyecto usa 70/15/15 por grupo.
