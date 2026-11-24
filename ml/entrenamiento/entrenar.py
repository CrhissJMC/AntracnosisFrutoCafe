"""Entrena EfficientNet-B0 o MobileNetV2 para clasificar frutos de café: sano o antracnosis.

Estructura de los datos (una imagen = un fruto recortado; se admiten subcarpetas por fuente).
Lo normal es usar la carpeta que genera preparar_datos.py, ya dividida:

    fruto/{train,val,test}/{sano,antracnosis}/<fuente>/<grupo>__<n>.jpg

Si se pasa una carpeta sin dividir (datos/sano y datos/antracnosis), el script divide
70/15/15 por GRUPO, para no evaluar con imágenes casi iguales a las de entrenamiento:
  - Cuadros de un mismo video («IMG_0832.MOV_111.jpg») forman un grupo.
  - Recortes de una misma foto deben llamarse «foto__1.jpg», «foto__2.jpg»: forman un grupo.
Todo el grupo va al mismo conjunto. El conjunto de prueba solo se usa al final.

Entrenamiento en dos fases (informe, 2.7.2):
  1. Base congelada: solo se entrena la cabeza (lr 1e-3).
  2. Ajuste fino: se descongelan las últimas capas de la base (lr 1e-5); BatchNorm sigue congelada.

Umbrales (RNF01 y RNF05), elegidos con el conjunto de VALIDACIÓN:
  - superior: el mayor valor que mantiene recall >= 85 % en antracnosis.
  - inferior: el mayor valor que deja como «sano» a lo sumo el 2 % de los frutos con antracnosis.
  Entre ambos, el resultado es «revisar».

Uso:
    python entrenar.py --datos ../../../datasets/fruto --modelo efficientnet_b0
    python entrenar.py --datos ../../../datasets/fruto --modelo mobilenet_v2 --version v1

Genera en --salida (por defecto ml/modelos/): <modelo>.keras, <modelo>.json (lo lee el servicio),
<modelo>_metricas.json y <modelo>_division.csv (qué imagen fue a qué conjunto).
"""

import argparse
import csv
import json
import random
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

import keras
import numpy as np
import tensorflow as tf

from modelos import ARQUITECTURAS, INPUT_SIZE, config_servicio, construir_modelo

CLASES = ["sano", "antracnosis"]  # índice 1 = antracnosis = salida de la sigmoide
EXTENSIONES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
RECALL_OBJETIVO = 0.85
MAX_ANTRACNOSIS_COMO_SANO = 0.02


# ---------------------------------------------------------------- datos y división
def grupo_de(ruta, raiz):
    """Clave de grupo: carpeta de origen + nombre sin el sufijo de cuadro de video o de recorte."""
    nombre = ruta.stem.split("__")[0].split(".MOV_")[0].split(".mp4_")[0]
    return f"{ruta.parent.relative_to(raiz).parts[1:]}|{nombre}"


def listar_imagenes(raiz):
    items = []
    for etiqueta, clase in enumerate(CLASES):
        carpeta = raiz / clase
        if not carpeta.is_dir():
            raise SystemExit(f"Falta la carpeta {carpeta}")
        for ruta in sorted(carpeta.rglob("*")):
            if ruta.suffix.lower() in EXTENSIONES:
                items.append((ruta, etiqueta, grupo_de(ruta, raiz)))
    if not items:
        raise SystemExit(f"No hay imágenes en {raiz}")
    return items


def dividir(items, semilla, proporciones=(0.70, 0.15, 0.15)):
    """Asigna grupos completos a train/val/test buscando 70/15/15 dentro de cada clase."""
    grupos = defaultdict(list)
    for item in items:
        grupos[item[2]].append(item)
    claves = sorted(grupos)
    random.Random(semilla).shuffle(claves)

    totales = Counter(etq for _, etq, _ in items)
    llevados = {s: Counter() for s in ("train", "val", "test")}
    division = {}
    for clave in claves:
        clase = Counter(etq for _, etq, _ in grupos[clave]).most_common(1)[0][0]
        # el conjunto que esté más por debajo de su cuota en la clase dominante del grupo
        faltas = {
            s: p * totales[clase] - llevados[s][clase]
            for s, p in zip(("train", "val", "test"), proporciones)
        }
        destino = max(faltas, key=faltas.get)
        division[clave] = destino
        for _, etq, _ in grupos[clave]:
            llevados[destino][etq] += 1
    return {s: [it for it in items if division[it[2]] == s] for s in ("train", "val", "test")}


def cargar(ruta):
    img = tf.io.decode_image(tf.io.read_file(ruta), channels=3, expand_animations=False)
    img.set_shape([None, None, 3])
    # Recorte central + 224 px: lo mismo que hace ml/app.py al predecir.
    return keras.layers.Resizing(INPUT_SIZE, INPUT_SIZE, crop_to_aspect_ratio=True)(tf.cast(img, tf.float32))


def dataset(items, lote, aumentar=None, mezclar=False, semilla=42):
    rutas = [str(r) for r, _, _ in items]
    etiquetas = np.array([e for _, e, _ in items], dtype="float32")
    ds = tf.data.Dataset.from_tensor_slices((rutas, etiquetas))
    if mezclar:
        ds = ds.shuffle(len(rutas), seed=semilla, reshuffle_each_iteration=True)
    ds = ds.map(lambda r, e: (cargar(r), e), num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(lote)
    if aumentar is not None:
        ds = ds.map(lambda x, e: (aumentar(x, training=True), e), num_parallel_calls=tf.data.AUTOTUNE)
    return ds.prefetch(tf.data.AUTOTUNE)


def aumento_de_datos():
    """Solo para entrenamiento (RNF04: tolerancia a la iluminación)."""
    return keras.Sequential(
        [
            keras.layers.RandomFlip("horizontal_and_vertical"),
            keras.layers.RandomRotation(0.15),
            keras.layers.RandomZoom(0.1),
            keras.layers.RandomBrightness(0.2, value_range=(0, 255)),
            keras.layers.RandomContrast(0.2),
        ],
        name="aumento",
    )


# ---------------------------------------------------------------- umbrales y métricas
def elegir_umbrales(y, p):
    candidatos = np.round(np.arange(0.01, 1.0, 0.01), 2)
    positivos = y == 1
    if positivos.sum() == 0:
        return 0.35, 0.65
    recall = {t: float((p[positivos] >= t).mean()) for t in candidatos}
    superior = max([t for t in candidatos if recall[t] >= RECALL_OBJETIVO], default=0.5)
    inferior = max([t for t in candidatos if recall[t] >= 1 - MAX_ANTRACNOSIS_COMO_SANO], default=0.01)
    if inferior >= superior:
        inferior = max(0.01, round(superior - 0.05, 2))
    return float(inferior), float(superior)


def auc(y, p):
    """Área bajo la curva ROC (no depende de los umbrales): 0,5 = azar, 1 = separa perfecto."""
    pos, neg = p[y == 1], p[y == 0]
    if len(pos) == 0 or len(neg) == 0:
        return float("nan")
    rangos = np.argsort(np.argsort(np.concatenate([pos, neg]))) + 1
    return float((rangos[: len(pos)].sum() - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg)))


def perdida_log(y, p):
    """Entropía cruzada binaria media: ~0,69 = azar con clases iguales; baja si el modelo acierta con seguridad."""
    p = np.clip(p, 1e-7, 1 - 1e-7)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))


def metricas(y, p, inferior, superior):
    pred = (p >= superior).astype(int)  # «antracnosis» solo desde el umbral superior
    vp = int(((pred == 1) & (y == 1)).sum())
    fp = int(((pred == 1) & (y == 0)).sum())
    fn = int(((pred == 0) & (y == 1)).sum())
    vn = int(((pred == 0) & (y == 0)).sum())
    recall = vp / (vp + fn) if vp + fn else 0.0
    precision = vp / (vp + fp) if vp + fp else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    revisar = (p >= inferior) & (p < superior)
    return {
        "n": int(len(y)),
        "auc": round(auc(y, p), 4),
        "perdida_logaritmica": round(perdida_log(y, p), 4),
        "matriz_confusion": {"VP": vp, "FP": fp, "FN": fn, "VN": vn},
        "recall_antracnosis": round(recall, 4),
        "precision_antracnosis": round(precision, 4),
        "f1_antracnosis": round(f1, 4),
        "exactitud": round((vp + vn) / len(y), 4) if len(y) else 0.0,
        "porcentaje_revisar": round(float(revisar.mean()) * 100, 2) if len(y) else 0.0,
        "antracnosis_dadas_por_sanas": int(((p < inferior) & (y == 1)).sum()),
        "cumple_RNF01": recall >= RECALL_OBJETIVO,
    }


def predecir(modelo, ds):
    y = np.concatenate([e.numpy() for _, e in ds]).astype(int)
    p = modelo.predict(ds, verbose=0).ravel()
    return y, p


# ---------------------------------------------------------------- entrenamiento
def compilar(modelo, lr, jit=True):
    modelo.compile(
        optimizer=keras.optimizers.Adam(lr),
        loss="binary_crossentropy",
        metrics=[
            keras.metrics.BinaryAccuracy(name="exactitud"),
            keras.metrics.Recall(name="recall"),
            keras.metrics.Precision(name="precision"),
            keras.metrics.AUC(name="auc"),
        ],
        # Sin XLA (--sin-xla): evita el error CUDNN_STATUS_EXECUTION_FAILED que aparece en algunos ajustes finos en la GPU.
        jit_compile="auto" if jit else False,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--datos", type=Path, required=True, help="carpeta con sano/ y antracnosis/")
    parser.add_argument("--modelo", choices=list(ARQUITECTURAS), required=True)
    parser.add_argument("--salida", type=Path, default=Path(__file__).resolve().parent.parent / "modelos")
    parser.add_argument("--version", default=datetime.now().strftime("v%Y%m%d"))
    parser.add_argument("--epocas-fase1", type=int, default=15)
    parser.add_argument("--epocas-fase2", type=int, default=20)
    parser.add_argument("--capas-ajuste-fino", type=int, default=40, help="últimas capas de la base que se descongelan")
    parser.add_argument("--lote", type=int, default=32)
    parser.add_argument("--semilla", type=int, default=42)
    parser.add_argument("--sin-xla", action="store_true", help="compila sin XLA (si la GPU falla con CUDNN_STATUS_EXECUTION_FAILED)")
    args = parser.parse_args()

    keras.utils.set_random_seed(args.semilla)
    args.salida.mkdir(parents=True, exist_ok=True)
    nombre = ARQUITECTURAS[args.modelo]["nombre"]

    raiz = args.datos.resolve()
    if all((raiz / s).is_dir() for s in ("train", "val", "test")):
        # División ya hecha por preparar_datos.py: se respeta tal cual.
        partes = {s: listar_imagenes(raiz / s) for s in ("train", "val", "test")}
        print("Usando la división de", raiz)
    else:
        partes = dividir(listar_imagenes(raiz), args.semilla)
    for s, lista in partes.items():
        conteo = Counter(CLASES[e] for _, e, _ in lista)
        print(f"{s:5s}: {len(lista):5d} imágenes  {dict(conteo)}")
    with open(args.salida / f"{args.modelo}_division.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["conjunto", "clase", "grupo", "ruta"])
        for s, lista in partes.items():
            for ruta, e, g in lista:
                w.writerow([s, CLASES[e], g, ruta.relative_to(raiz).as_posix()])

    # Pesos de clase: compensan que haya muchos más frutos sanos que con antracnosis.
    n_train = Counter(e for _, e, _ in partes["train"])
    if len(n_train) < 2:
        raise SystemExit("El conjunto de entrenamiento necesita imágenes de ambas clases")
    total = sum(n_train.values())
    pesos_clase = {c: total / (2 * n_train[c]) for c in (0, 1)}
    print("Pesos de clase:", {CLASES[c]: round(v, 3) for c, v in pesos_clase.items()})

    ds_train = dataset(partes["train"], args.lote, aumentar=aumento_de_datos(), mezclar=True, semilla=args.semilla)
    ds_val = dataset(partes["val"], args.lote)
    ds_test = dataset(partes["test"], args.lote)

    modelo, base = construir_modelo(args.modelo)
    parada = lambda: keras.callbacks.EarlyStopping(  # noqa: E731
        monitor="val_auc", mode="max", patience=5, restore_best_weights=True
    )

    print(f"\n== {nombre} · fase 1: base congelada")
    compilar(modelo, 1e-3, jit=not args.sin_xla)
    h1 = modelo.fit(ds_train, validation_data=ds_val, epochs=args.epocas_fase1,
                    class_weight=pesos_clase, callbacks=[parada()])

    print(f"\n== {nombre} · fase 2: ajuste fino de las últimas {args.capas_ajuste_fino} capas")
    base.trainable = True
    for capa in base.layers[: -args.capas_ajuste_fino]:
        capa.trainable = False
    for capa in base.layers:
        if isinstance(capa, keras.layers.BatchNormalization):
            capa.trainable = False
    compilar(modelo, 1e-5, jit=not args.sin_xla)
    h2 = modelo.fit(ds_train, validation_data=ds_val, epochs=args.epocas_fase2,
                    class_weight=pesos_clase, callbacks=[parada()])

    # Se guarda ya entrenado, antes de evaluar: si la evaluación falla no se pierde el entrenamiento.
    modelo.save(args.salida / f"{args.modelo}.keras")

    # Umbrales con validación; la evaluación final, una sola vez, con prueba.
    y_val, p_val = predecir(modelo, ds_val)
    inferior, superior = elegir_umbrales(y_val, p_val)
    y_test, p_test = predecir(modelo, ds_test)
    # Entrenamiento sin aumento: si aquí es casi perfecto y en prueba cae mucho, el modelo memorizó.
    y_tr, p_tr = predecir(modelo, dataset(partes["train"], args.lote))
    m_tr = metricas(y_tr, p_tr, inferior, superior)
    m_te = metricas(y_test, p_test, inferior, superior)
    # Curvas de aprendizaje por época (fase 1 y luego fase 2): pérdida y AUC de train y val.
    curvas = {
        k: [round(float(v), 4) for v in h1.history.get(k, []) + h2.history.get(k, [])]
        for k in ("loss", "val_loss", "auc", "val_auc", "recall", "val_recall")
    }
    resultado = {
        "modelo": nombre,
        "version": args.version,
        "fecha": datetime.now().isoformat(timespec="seconds"),
        "umbrales": {"inferior": inferior, "superior": superior},
        "imagenes": {s: dict(Counter(CLASES[e] for _, e, _ in l)) for s, l in partes.items()},
        "epocas": {"fase1": len(h1.history["loss"]), "fase2": len(h2.history["loss"])},
        "entrenamiento": m_tr,
        "validacion": metricas(y_val, p_val, inferior, superior),
        "prueba": m_te,
        "brecha_train_test": {
            "auc": round(m_tr["auc"] - m_te["auc"], 4),
            "recall_antracnosis": round(m_tr["recall_antracnosis"] - m_te["recall_antracnosis"], 4),
            "f1_antracnosis": round(m_tr["f1_antracnosis"] - m_te["f1_antracnosis"], 4),
        },
        "curvas": curvas,
    }

    cfg = config_servicio(args.modelo, args.version, inferior, superior)
    (args.salida / f"{args.modelo}.json").write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
    (args.salida / f"{args.modelo}_metricas.json").write_text(
        json.dumps(resultado, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(json.dumps(resultado["prueba"], indent=2, ensure_ascii=False))
    print(f"\nGuardado en {args.salida}. El servicio ml lo carga solo en el próximo análisis.")


if __name__ == "__main__":
    main()
