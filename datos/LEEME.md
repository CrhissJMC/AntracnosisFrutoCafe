# Datos del proyecto

| Carpeta | Contenido |
|---|---|
| `fruto/` | Conjunto preparado con `ml/entrenamiento/preparar_datos.py`: 3 840 imágenes de un fruto (768 con antracnosis, 3 072 sanas) en `train/`, `val/` y `test/`, con `manifiesto.csv`, `descartes.csv`, `resumen.json` y su `LEEME.md` |
| `evaluaciones/` | Resultados de `ml/entrenamiento/evaluar.py`: línea base sin entrenar y versión v0, más el mapa Grad-CAM de ejemplo |
| `fuentes/` | Ficha de cada conjunto de origen: autor, enlace, licencia, contenido y advertencias |

Con esta carpeta y los modelos de `ml/modelos/` se puede entrenar, evaluar y usar el sistema sin descargar nada más.

## Licencias
Las tres fuentes son **CC BY 4.0**: el conjunto preparado se redistribuye citando a cada autor.
- Coffee berry disease — usuario «detection date», Roboflow Universe (2025): https://universe.roboflow.com/detection-date/coffee-berry-disease
- coffee cherry 20251206 — usuario «1», Roboflow Universe (2025): https://universe.roboflow.com/1-hqah6/coffee-cherry-20251206
- Cherry Coffe Bean Dataset — Pinto, V. H.; Paz, C. F.; Campo, D. A. (2024), Zenodo: https://doi.org/10.5281/zenodo.14271151

## Volver a generar el conjunto desde las fuentes originales (opcional)
Las fuentes originales pesan unos 630 MB y no están en el repositorio. Para regenerar `fruto/`:

1. Crear una carpeta (por ejemplo `C:\ruta\fuentes-descargadas`) con estas subcarpetas:
   - `roboflow_coffee_berry_disease/datos/`: exportación **COCO Segmentation** de la versión 1 (cuenta gratuita en Roboflow).
   - `roboflow_coffee_cherry_20251206/datos/`: *Fork* del proyecto a una cuenta gratuita, versión sin preprocesamiento ni aumento, exportada en **COCO**.
   - `zenodo_cherry_coffee_bean/`: los cuatro `.zip` de Zenodo descomprimidos (`dataset1`, `dataset2_cropped`, `dataset3_1`, `dataset4_1_cropped`).
2. Ejecutar el comando de `fruto/LEEME.md` desde la raíz del repositorio. Con la misma semilla (42) se obtiene la misma división.
