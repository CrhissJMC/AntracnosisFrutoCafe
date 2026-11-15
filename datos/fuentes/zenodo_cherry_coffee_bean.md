# Cherry Coffe Bean Dataset (Zenodo)

- Autores: Pinto, Víctor Hugo; Paz, Carlos Fabián; Campo, Diego Andrés (2024)
- DOI: https://doi.org/10.5281/zenodo.14271151
- Licencia: CC BY 4.0 (citar la fuente)
- Descargado: 15/11/2026, MD5 de los 4 zip verificados contra Zenodo

## Contenido (3 795 imágenes JPG, un fruto por imagen, 5 estados de madurez)

| Subconjunto | Origen | Verdes | Pintones | Maduros | Sobremaduros | Secos | Total |
|---|---|---|---|---|---|---|---|
| dataset1 | cuadros de video | 265 | 259 | 271 | 160 | 372 | 1 327 |
| dataset2_cropped | fotos recortadas | 76 | 131 | 277 | 99 | 51 | 634 |
| dataset3_1 | cuadros de video | 143 | 269 | 498 | 265 | 350 | 1 525 |
| dataset4_1_cropped | fotos recortadas | 60 | 45 | 86 | 54 | 64 | 309 |

## Uso en el proyecto
- Todas las imágenes son frutos **sin antracnosis**: aportan a la clase **sano**.
- «Secos» y «Sobremaduros» son oscuros y pueden parecer frutos momificados:
  sirven de ejemplos difíciles para que el modelo no confunda secado con enfermedad.
- dataset1 y dataset3_1 salen de videos: los cuadros consecutivos son casi iguales.
  Al dividir 70/15/15, mantener los cuadros del mismo video (prefijo `IMG_xxxx.MOV`) en el mismo conjunto.
