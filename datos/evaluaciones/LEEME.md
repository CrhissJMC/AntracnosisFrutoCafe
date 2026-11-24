# Evaluaciones de los modelos

Cada archivo es la salida de `ml/entrenamiento/evaluar.py` sobre `datos/fruto` (train, val y test).

| Archivo | Qué es |
|---|---|
| `linea_base_efficientnet_b0.json` | EfficientNet-B0 **sin entrenar** (versión `sin-entrenar`), 15/11/2026 |
| `linea_base_mobilenet_v2.json` | MobileNetV2 **sin entrenar** (versión `sin-entrenar`), 15/11/2026 |

Después de entrenar, evaluar cada modelo con el mismo comando y guardar como `<modelo>_<versión>.json` para compararlo con la línea base.

## Línea base (redes sin entrenar, umbrales 0,35 / 0,65)

| Modelo | Conjunto | AUC | Pérdida | Recall | Precisión | F1 | % revisar |
|---|---|---|---|---|---|---|---|
| EfficientNet-B0 | train | 0,312 | 0,795 | 0,040 | 0,090 | 0,055 | 89,3 |
| EfficientNet-B0 | val | 0,248 | 0,815 | 0,009 | 0,017 | 0,012 | 88,4 |
| EfficientNet-B0 | test | 0,232 | 0,808 | 0,019 | 0,037 | 0,025 | 89,3 |
| MobileNetV2 | train | 0,467 | 1,439 | 0,906 | 0,203 | 0,332 | 8,7 |
| MobileNetV2 | val | 0,451 | 1,492 | 0,917 | 0,188 | 0,312 | 7,2 |
| MobileNetV2 | test | 0,414 | 1,458 | 0,869 | 0,179 | 0,298 | 8,8 |

Cómo leerla:
- **Sin entrenar no sirven:** EfficientNet casi nunca dice «antracnosis» (recall ~0,02) y MobileNetV2 lo dice casi siempre
  (recall ~0,9 pero precisión ~0,18, que es solo la proporción de enfermos en el conjunto).
- **AUC lejos de 0,5:** la cabeza al azar apunta «al revés», pero los rasgos de ImageNet ya distinguen algo las clases
  (EfficientNet: 1 − 0,232 = 0,77 en test). Parte puede deberse a diferencias entre fuentes (fondo, cámara), no al síntoma.
  **El modelo entrenado debe superar 0,77 (EfficientNet) y 0,59 (MobileNetV2) de AUC en test para decir que aprendió.**
- **Memorización:** se mide con la brecha train − test del modelo entrenado; sin entrenar es pequeña (≤ 0,08 de AUC) porque no hubo nada que memorizar.

## Versión v0-preliminar (15/11/2026, GPU RTX 4060)

| Modelo | Conjunto | AUC | Recall | Precisión | F1 | % revisar | Umbrales |
|---|---|---|---|---|---|---|---|
| EfficientNet-B0 | train | 0,988 | 0,939 | 0,820 | 0,875 | 18,3 | 0,04 / 0,80 |
| EfficientNet-B0 | test | 0,960 | 0,822 | 0,733 | 0,775 | 22,0 | |
| MobileNetV2 | train | 0,979 | 0,929 | 0,768 | 0,841 | 18,0 | 0,07 / 0,74 |
| MobileNetV2 | test | 0,960 | 0,888 | 0,679 | 0,769 | 19,0 | |

- **Aprendieron:** AUC en test 0,96 frente a 0,23 / 0,41 sin entrenar.
- **No memorizaron:** brecha de AUC train − test de 0,03 y 0,02 (recall: 0,12 y 0,04; EfficientNet-B0 muestra algo de sobreajuste).
- **Pero se guían en parte por el fondo:** en test, ningún fruto sano sobre fondo claro sale como «sano»
  (Zenodo: 27–45 % antracnosis y el resto revisar; Coffee berry: 83 % antracnosis), mientras que los sanos del
  cafetal salen sanos en 82–83 %. `gradcam_v0-preliminar.jpg` muestra atención en el fondo (filas 2 y 3).
- Archivos: `efficientnet_b0_v0-preliminar.json`, `mobilenet_v2_v0-preliminar.json` (con desglose por fuente),
  `entrenamiento_v0*.log`.

## Versión v1-aumento (24/11/2026, GPU RTX 4060)

Entrenada con `datos/fruto_aumentado`: 4 variantes de cada foto de entrenamiento (espejo, rotada, zoom y borrosa),
de 2 703 a 13 515 imágenes. Validación y prueba son las mismas fotos reales que en v0, así que la comparación es directa.

| Modelo | Versión | AUC | Recall | Precisión | F1 | Falsas alarmas | Antracnosis como «sano» | % revisar | Umbrales |
|---|---|---|---|---|---|---|---|---|---|
| MobileNetV2 | v0 | 0,960 | 0,888 | 0,679 | 0,769 | 45 | 1 | 19,0 | 0,07 / 0,74 |
| MobileNetV2 | **v1** | **0,972** | 0,878 | **0,783** | **0,828** | **26** | 2 | **15,5** | 0,01 / 0,69 |
| EfficientNet-B0 | v0 | 0,960 | **0,822** | 0,733 | 0,775 | 32 | 2 | 22,0 | 0,04 / 0,80 |
| EfficientNet-B0 | v1 | **0,969** | 0,785 | **0,778** | **0,781** | **24** | **1** | **13,7** | 0,05 / 0,70 |

Comparación pareada en las mismas 568 fotos de prueba (`comparacion_v0_v1.json`):
- **MobileNetV2:** AUC +0,012, IC 95 % 0,002–0,023; McNemar p = 0,012. La v1 es significativamente mejor y pasa a ser
  la versión activa; la v0 queda en `ml/modelos/v0-preliminar/`.
- **EfficientNet-B0:** AUC +0,009, IC 95 % 0,001–0,017; McNemar p = 0,58. Mejora la AUC y la precisión, pero el recall
  baja a 0,785, así que la versión activa sigue siendo la v0. La v1 no se versiona.
- **Sesgo de fondo:** con MobileNetV2 v1, los frutos sanos de Zenodo (fondo claro) clasificados como antracnosis bajan
  de 45 % a 13 %; la mayoría pasa a «revisar». Con EfficientNet-B0 v1, el 43 % sale «sano» (v0: 0 %).
- **Memorización:** la brecha de recall entre entrenamiento y prueba sube (MobileNetV2 0,11, EfficientNet-B0 0,16),
  porque el modelo ve muchas variantes de las mismas fotos. La brecha de AUC sigue siendo pequeña (0,03).
- **Entrenamiento:** el ajuste fino de MobileNetV2 falló dos veces con `CUDNN_STATUS_EXECUTION_FAILED` y funcionó sin el
  compilador XLA (`entrenar.py --sin-xla`).
