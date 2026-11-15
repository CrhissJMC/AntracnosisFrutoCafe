"""Evalúa un modelo .keras en train, val y test con las mismas métricas que entrenar.py.

Sirve para dos comparaciones:
  1. ¿Aprendió?  Comparar con la LÍNEA BASE: las redes sin entrenar (exportar_sin_entrenar.py)
     rinden como el azar (AUC ~ 0,5). Un modelo entrenado debe superarla con claridad en val y test.
  2. ¿Memorizó?  Comparar train con val/test del MISMO modelo. Si en train es casi perfecto y en
     val/test cae mucho (por ejemplo, más de 10 puntos de AUC o de recall), memorizó las fotos de
     entrenamiento en vez de aprender los síntomas. Como la división es por grupo, val y test solo
     tienen fotos que el modelo nunca vio.

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

from entrenar import CLASES, dataset, listar_imagenes, metricas, predecir

CONJUNTOS = ("train", "val", "test")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--datos", type=Path, required=True, help="carpeta de preparar_datos.py (train/val/test)")
    p.add_argument("--modelo", type=Path, required=True, help="archivo .keras")
    p.add_argument("--salida", type=Path, help="JSON con el resultado (por defecto, junto al modelo)")
    p.add_argument("--lote", type=int, default=64)
    a = p.parse_args()

    cfg_path = a.modelo.with_suffix(".json")
    cfg = json.loads(cfg_path.read_text(encoding="utf-8")) if cfg_path.exists() else {}
    inferior = float(cfg.get("umbral_inferior", 0.35))
    superior = float(cfg.get("umbral_superior", 0.65))
    modelo = keras.saving.load_model(a.modelo, compile=False)

    resultado = {
        "modelo": a.modelo.stem,
        "version": cfg.get("version", "desconocida"),
        "fecha": datetime.now().isoformat(timespec="seconds"),
        "umbrales": {"inferior": inferior, "superior": superior},
        "conjuntos": {},
    }
    for s in CONJUNTOS:
        items = listar_imagenes(a.datos.resolve() / s)
        y, prob = predecir(modelo, dataset(items, a.lote))
        m = metricas(y, prob, inferior, superior)
        m["probabilidad_media"] = {CLASES[c]: round(float(prob[y == c].mean()), 4) for c in (0, 1)}
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

    salida = a.salida or a.modelo.with_name(f"{a.modelo.stem}_evaluacion.json")
    salida.write_text(json.dumps(resultado, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Guardado en", salida)


if __name__ == "__main__":
    main()
