# Coffee berry disease (Roboflow Universe)

- Autor: usuario «detection date» (2025) · https://universe.roboflow.com/detection-date/coffee-berry-disease
- Licencia: CC BY 4.0 (citar la fuente)
- Versión: v1 (2025-12-29), formato COCO Segmentation · descargado el 15/11/2026

## Contenido
- 1 677 imágenes = **646 fotos originales × ~2,6** por aumento de datos de Roboflow
  (volteos, rotaciones de 90° y ±15°). Todas redimensionadas a 256×256 estiradas.
- Anotaciones: `Colletotrichum Kahawe` 2 191 · `healty` 231 · `cofffee-berry` (categoría padre, sin uso).
- 1 244 imágenes tienen un solo fruto; el resto tiene de 2 a 10.

| Fotos originales | Imágenes (con aumento) |
|---|---|
| Antracnosis (Colletotrichum Kahawe): **559** | 1 434 |
| Sano (healty): **82** | 228 |
| Sin anotación: 5 | 15 |

## ⚠️ Procedencia
Las fotos son las del dataset de maduración de Zenodo (Pinto et al., 2024, Colombia; ver
`zenodo_cherry_coffee_bean.md`) con etiquetas de lesión agregadas por un usuario anónimo de Roboflow.
La clase dice «Colletotrichum Kahawe», pero C. kahawae solo está reportado en África: las etiquetas deben
revisarse con un especialista. Además, cada foto es un solo fruto: muchas anotaciones marcan solo una lesión
pequeña, no el fruto entero (la etiqueta se toma por imagen).

## Cómo usarlo
- Recortar cada fruto con su máscara o caja → una imagen por fruto, nombre `foto__N.jpg`.
- Las copias aumentadas comparten el prefijo antes de `_jpg.rf.`: deben ir al mismo conjunto
  que su original (o descartarse y aplicar el aumento propio solo a entrenamiento).
- Ignorar la división train/valid/test de Roboflow (92/4/4): el proyecto usa 70/15/15 por grupo.
- Patógeno C. kahawae (África): validar con fotos de frutos de Amazonas.
