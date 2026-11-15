"""Exporta las dos redes SIN ENTRENAR a ml/modelos/ para probar el sistema de punta a punta.

La base trae los pesos de ImageNet, pero la cabeza (probabilidad de antracnosis) tiene
pesos al azar: las predicciones NO significan nada. El .json lleva la versión
"sin-entrenar" para que se vea en la pantalla de diagnóstico.

Uso:  python exportar_sin_entrenar.py --salida ../modelos
"""

import argparse
import json
from pathlib import Path

import keras

from modelos import ARQUITECTURAS, config_servicio, construir_modelo


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--salida", type=Path, default=Path(__file__).resolve().parent.parent / "modelos")
    args = parser.parse_args()
    args.salida.mkdir(parents=True, exist_ok=True)

    keras.utils.set_random_seed(42)
    for model_id, arq in ARQUITECTURAS.items():
        modelo, _ = construir_modelo(model_id)
        modelo.save(args.salida / f"{model_id}.keras")
        cfg = config_servicio(model_id, version="sin-entrenar")
        (args.salida / f"{model_id}.json").write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"{arq['nombre']}: {modelo.count_params():,} parámetros -> {args.salida / (model_id + '.keras')}")


if __name__ == "__main__":
    main()
