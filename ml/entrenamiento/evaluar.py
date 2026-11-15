"""Evalúa un modelo .keras en train, val y test con las mismas métricas que entrenar.py.

Sirve para dos comparaciones:
  1. ¿Aprendió?  Comparar con la LÍNEA BASE: las redes sin entrenar (exportar_sin_entrenar.py)
     rinden como el azar (AUC ~ 0,5). Un modelo entrenado debe superarla con claridad en val y test.
  2. ¿Memorizó?  Comparar train con val/test del MISMO modelo. Si en train es casi perfecto y en
     val/test cae mucho (por ejemplo, más de 10 puntos de AUC o de recall), memorizó las fotos de
     entrenamiento en vez de aprender los síntomas. Como la división es por grupo, val y test solo
     tienen fotos que el modelo nunca vio.
  3. ¿Aprendió el síntoma o la fuente?  El desglose por fuente muestra cómo clasifica los frutos sanos
     y enfermos de cada conjunto de origen. Si los sanos de una fuente salen casi todos como antracnosis,
     el modelo se guía por el tipo de foto (fondo, cámara) y no por la lesión.

Los umbrales se leen del <modelo>.json junto al .keras (los que eligió entrenar.py, o 0,35/0,65 por defecto).
La AUC y la pérdida logarítmica no dependen de los umbrales: son la comparación más justa con la línea base.

Uso:
  python evaluar.py --datos /ruta/fruto --modelo /ruta/modelos/mobilenet_v2.keras --salida linea_base_mobilenet_v2.json
"""

import argparse
import json
from datetime import datetime
from pathlib import Path

import keras
import numpy as np

from entrenar import CLASES, dataset, elegir_umbrales, listar_imagenes, metricas, predecir
from modelos import config_servicio

CONJUNTOS = ("train", "val", "test")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--datos", type=Path, required=True, help="carpeta de preparar_datos.py (train/val/test)")
    p.add_argument("--modelo", type=Path, required=True, help="archivo .keras")
    p.add_argument("--salida", type=Path, help="JSON con el resultado (por defecto, junto al modelo)")
    p.add_argument("--lote", type=int, default=64)
    p.add_argument("--elegir-umbrales", metavar="VERSION",
                   help="elige los umbrales con validación (como entrenar.py) y escribe <modelo>.json con esta versión; "
                        "útil si el entrenamiento guardó el modelo pero no llegó a evaluarlo")
    a = p.parse_args()

    cfg_path = a.modelo.with_suffix(".json")
    cfg = json.loads(cfg_path.read_text(encoding="utf-8")) if cfg_path.exists() else {}
    modelo = keras.saving.load_model(a.modelo, compile=False)

    preds = {}
    for s in CONJUNTOS:
        items = listar_imagenes(a.datos.resolve() / s)
        preds[s] = (items, *predecir(modelo, dataset(items, a.lote)))

    if a.elegir_umbrales:
        inferior, superior = elegir_umbrales(preds["val"][1], preds["val"][2])
        cfg = config_servicio(a.modelo.stem, a.elegir_umbrales, inferior, superior)
        cfg_path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Umbrales elegidos con validación: {inferior} / {superior} -> {cfg_path}")
    inferior = float(cfg.get("umbral_inferior", 0.35))
    superior = float(cfg.get("umbral_superior", 0.65))

    resultado = {
        "modelo": a.modelo.stem,
        "version": cfg.get("version", "desconocida"),
        "fecha": datetime.now().isoformat(timespec="seconds"),
        "umbrales": {"inferior": inferior, "superior": superior},
        "conjuntos": {},
    }
    for s in CONJUNTOS:
        items, y, prob = preds[s]
        m = metricas(y, prob, inferior, superior)
        m["probabilidad_media"] = {CLASES[c]: round(float(prob[y == c].mean()), 4) for c in (0, 1)}
        # Desglose por fuente (subcarpeta <clase>/<fuente>/): una buena métrica global puede esconder que
        # el modelo falla con un tipo de foto (fondo, cámara) y acierta por la fuente, no por el síntoma.
        fuentes = np.array([ruta.parent.name for ruta, _, _ in items])
        m["por_fuente"] = {}
        for f in sorted(set(fuentes)):
            for c in (0, 1):
                sel = (fuentes == f) & (y == c)
                if sel.any():
                    q = prob[sel]
                    m["por_fuente"][f"{f}/{CLASES[c]}"] = {
                        "n": int(sel.sum()),
                        "antracnosis": round(float((q >= superior).mean()), 3),
                        "revisar": round(float(((q >= inferior) & (q < superior)).mean()), 3),
                        "sano": round(float((q < inferior).mean()), 3),
                    }
        resultado["conjuntos"][s] = m
        print(f"{s:5s}  n={m['n']:5d}  AUC={m['auc']:.3f}  pérdida={m['perdida_logaritmica']:.3f}  "
              f"recall={m['recall_antracnosis']:.3f}  precisión={m['precision_antracnosis']:.3f}  "
              f"F1={m['f1_antracnosis']:.3f}  revisar={m['porcentaje_revisar']:.1f} %")

    tr, te = resultado["conjuntos"]["train"], resultado["conjuntos"]["test"]
    resultado["brecha_train_test"] = {
        "auc": round(tr["auc"] - te["auc"], 4),
        "recall_antracnosis": round(tr["recall_antracnosis"] - te["recall_antracnosis"], 4),
        "f1_antracnosis": round(tr["f1_antracnosis"] - te["f1_antracnosis"], 4),
    }
    print("Brecha train − test:", resultado["brecha_train_test"])
    print("Prueba por fuente (proporción de cada resultado):")
    for k, v in te["por_fuente"].items():
        print(f"  {k:26s} n={v['n']:4d}  antracnosis={v['antracnosis']:.2f}  revisar={v['revisar']:.2f}  sano={v['sano']:.2f}")

    salida = a.salida or a.modelo.with_name(f"{a.modelo.stem}_evaluacion.json")
    salida.write_text(json.dumps(resultado, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Guardado en", salida)


if __name__ == "__main__":
    main()
