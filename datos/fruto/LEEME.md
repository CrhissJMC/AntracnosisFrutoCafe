# Conjunto de datos del clasificador (sano / antracnosis)

Generado el 15/11/2026 con `ml/entrenamiento/preparar_datos.py` (semilla 42). Para regenerarlo desde la raíz del repositorio (con las fuentes descargadas como indica `datos/LEEME.md`):

```powershell
docker run --rm -u root -v "${PWD}\ml\entrenamiento:/ent:ro" -v "C:\ruta\fuentes-descargadas:/datasets:ro" -v "${PWD}\datos\fruto:/salida" antracnosis-ml python -I /ent/preparar_datos.py --datasets /datasets --salida /salida
```

## Resultado (una imagen = un fruto, 256×256 px)

| Conjunto | Antracnosis | Sano | Total | Grupos (fotos de origen) |
|---|---|---|---|---|
| train | 553 | 2 150 | 2 703 | 1 166 |
| val | 108 | 461 | 569 | 260 |
| test | 107 | 461 | 568 | 265 |
| **Total** | **768** | **3 072** | **3 840** | |

Por fuente:

| Fuente | Antracnosis | Sano |
|---|---|---|
| Coffee berry disease (Roboflow) | 559 | 82 |
| coffee cherry 20251206 (Roboflow) | 209 | 2 576 |
| Zenodo Cherry Coffe Bean (solo fotos recortadas) | — | 414 |

Ningún grupo (foto original, video o recortes de una misma foto) aparece en dos conjuntos: el script lo comprueba.

## Limpieza aplicada

| Paso | Descartadas |
|---|---|
| Fruto pequeño (lado < 40 px) | 2 750 |
| Borrosa (varianza del laplaciano < 15) | 718 |
| Duplicado (hash perceptual de 256 bits, ≤ 12 bits distintos) | 13 |
| Duplicado de otro grupo | 531 |
| Balance (sanos ≤ 4 × antracnosis) | 8 382 |

Otras decisiones:
- **Coffee berry disease:** cada foto es un fruto y la etiqueta es de la imagen completa; muchas anotaciones marcan solo una lesión pequeña (infección incipiente).
  De las copias aumentadas de Roboflow se usa una por foto original.
- **coffee cherry:** cada caja se recorta como cuadrado con 15 % de margen; `diseased` → antracnosis, el resto → sano.
- **Zenodo:** se excluyen los cuadros de video (dataset1, dataset3_1), desenfocados por movimiento: habrían enseñado «borroso = sano».
- **Balance:** se conservan primero los sanos fotografiados sobre fondo claro (coffee_berry, zenodo), igual que casi toda la antracnosis,
  para que el modelo no aprenda «fondo claro = enfermo».

## ⚠️ Hallazgo sobre la fuente principal
«Coffee berry disease» de Roboflow **reutiliza las fotos del dataset de maduración de Zenodo** (Pinto et al., Colombia):
531 de los «duplicados de otro grupo» son la misma foto en ambas fuentes. Un usuario anónimo de Roboflow les agregó la
etiqueta «Colletotrichum Kahawe», pero:
- C. kahawae no está reportado fuera de África, así que el nombre de la clase no es correcto para frutos colombianos;
- Zenodo clasifica esas fotos solo por madurez; entre las que Roboflow marca con antracnosis hay frutos «Secos» y
  «Sobremaduros» cuyo oscurecimiento puede ser secado y no enfermedad.

**Antes de entrenar el modelo final, un especialista debe revisar las 559 imágenes de antracnosis de coffee_berry**
(`train|val|test/antracnosis/coffee_berry/`). `descartes.csv` relaciona cada foto con su estado de madurez en Zenodo
(columna `valor` = grupo de coffee_berry que se conservó).

## Archivos
- `manifiesto.csv`: conjunto, clase, fuente, grupo, clase original, archivo, foto de origen, caja y nitidez de cada imagen.
- `descartes.csv`: cada fruto descartado y el motivo.
- `resumen.json`: conteos por paso, conjunto, clase y fuente.

## Licencias
Las tres fuentes son CC BY 4.0: citar a cada autor (ver `datos/fuentes/`).
