"""Servicio interno de inferencia: ejecuta los modelos .keras y calcula Grad-CAM.

Solo lo llama la API del sitio por la red interna de Docker; no se expone a internet.
Si un modelo no está en MODELS_DIR, el servicio lo informa como "no disponible".
"""

import base64
import io
import json
import logging
import os
import time
import warnings
from pathlib import Path

import numpy as np
from fastapi import FastAPI, HTTPException
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format='{"level":"%(levelname)s","msg":"%(message)s"}')
log = logging.getLogger("ml")
# Aviso inofensivo de Keras 3 al llamar a un modelo funcional con un tensor en vez de una lista.
warnings.filterwarnings("ignore", message="The structure of `inputs` doesn't match")

MODELS_DIR = Path(os.getenv("MODELS_DIR", "/models"))
MAX_IMAGE_BYTES = 8 * 1024 * 1024
# Clases del modelo (sano y antracnosis). "revisar" no es una clase: es la zona entre los dos umbrales.
DEFAULT_CLASSES = ["sano", "antracnosis"]
DEFAULT_THRESHOLDS = (0.35, 0.65)

# Modelos que el sitio conoce. Cada uno se carga desde MODELS_DIR/<id>.keras y,
# opcionalmente, MODELS_DIR/<id>.json con su configuración (ver ml/README.md).
CATALOG = {
    "efficientnet_b0": {"name": "EfficientNet-B0", "preprocess": "none"},
    "mobilenet_v2": {"name": "MobileNetV2", "preprocess": "mobilenet_v2"},
}

app = FastAPI(title="Servicio de diagnóstico de antracnosis", docs_url=None, redoc_url=None)
_cache = {}  # id -> (modelo, config, fecha de modificación del archivo)


def _config(model_id):
    cfg = {
        "version": "v1",
        "classes": DEFAULT_CLASSES,
        "input_size": 224,
        "preprocess": CATALOG[model_id]["preprocess"],
        "umbral_inferior": DEFAULT_THRESHOLDS[0],
        "umbral_superior": DEFAULT_THRESHOLDS[1],
        "gradcam_layer": None,
    }
    meta = MODELS_DIR / f"{model_id}.json"
    if meta.exists():
        cfg.update(json.loads(meta.read_text(encoding="utf-8")))
    if not 0 <= float(cfg["umbral_inferior"]) < float(cfg["umbral_superior"]) <= 1:
        # Umbrales invertidos o fuera de rango: se usan los de por defecto en vez de dar resultados absurdos.
        log.warning(f"umbrales_invalidos {model_id}")
        cfg["umbral_inferior"], cfg["umbral_superior"] = DEFAULT_THRESHOLDS
    return cfg


def _load(model_id):
    """Carga el modelo (y lo recarga si el archivo cambió). Devuelve None si no existe."""
    path = MODELS_DIR / f"{model_id}.keras"
    if not path.exists():
        _cache.pop(model_id, None)
        return None
    mtime = path.stat().st_mtime
    cached = _cache.get(model_id)
    if cached and cached[2] == mtime:
        return cached
    import keras  # import diferido: el servicio arranca rápido aunque no haya modelos

    model = keras.saving.load_model(path, compile=False)
    entry = (model, _config(model_id), mtime)
    _cache[model_id] = entry
    log.info(f"modelo_cargado {model_id}")
    return entry


def _decode(data_url):
    if "," not in data_url:
        raise HTTPException(400, "Imagen inválida")
    raw = base64.b64decode(data_url.split(",", 1)[1], validate=True)
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "La imagen supera los 8 MB")
    try:
        img = Image.open(io.BytesIO(raw))
        img = ImageOps.exif_transpose(img).convert("RGB")  # respeta la orientación de la cámara
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(400, "No se pudo leer la imagen") from exc
    return img


def _prepare(img, cfg):
    """Recorte central cuadrado + redimensionado al tamaño de entrada + preprocesamiento del modelo."""
    size = int(cfg["input_size"])
    img = ImageOps.fit(img, (size, size), Image.Resampling.BILINEAR)
    x = np.asarray(img, dtype="float32")[None, ...]
    if cfg["preprocess"] == "mobilenet_v2":
        x = x / 127.5 - 1.0
    elif cfg["preprocess"] == "rescale":
        x = x / 255.0
    return img, x


def _disease_output(probs, classes):
    """Índice de la salida con la probabilidad de antracnosis.
    Admite una neurona sigmoide (una sola salida) o una softmax con la clase 'antracnosis'."""
    if probs.size == 1:
        return 0
    if "antracnosis" not in classes or len(classes) != probs.size:
        raise HTTPException(500, "La configuración del modelo no indica la salida de la clase antracnosis")
    return classes.index("antracnosis")


def _decide(p, low, high):
    """Resultado según los dos umbrales de la versión: sano, revisar (el modelo no está seguro) o antracnosis."""
    if p < float(low):
        return "sano"
    if p >= float(high):
        return "antracnosis"
    return "revisar"


def _gradcam(model, x, class_index, layer_name):
    """Mapa Grad-CAM como PNG en base64, o None si la arquitectura no lo permite."""
    import tensorflow as tf

    try:
        if layer_name:
            layer = model.get_layer(layer_name)
        else:
            layer = next(l for l in reversed(model.layers) if len(getattr(l, "output", np.zeros(0)).shape) == 4)
        grad_model = tf.keras.Model(model.inputs, [layer.output, model.output])
        with tf.GradientTape() as tape:
            conv_out, preds = grad_model(x)
            score = preds[:, class_index]
        grads = tape.gradient(score, conv_out)
        weights = tf.reduce_mean(grads, axis=(0, 1, 2))
        cam = tf.nn.relu(tf.reduce_sum(conv_out[0] * weights, axis=-1)).numpy()
        if cam.max() > 0:
            cam = cam / cam.max()
        return cam
    except Exception as exc:  # noqa: BLE001 — Grad-CAM es opcional: el diagnóstico sigue sin él
        log.warning(f"gradcam_no_disponible {exc}")
        return None


def _overlay(img, cam):
    heat = Image.fromarray(np.uint8(cam * 255)).resize(img.size, Image.Resampling.BILINEAR)
    h = np.asarray(heat, dtype="float32") / 255.0
    color = np.stack([h, h * 0.45, np.zeros_like(h)], axis=-1) * 255  # rojo-naranja según la intensidad
    base = np.asarray(img, dtype="float32")
    alpha = (0.55 * h)[..., None]
    mixed = np.uint8(base * (1 - alpha) + color * alpha)
    buf = io.BytesIO()
    Image.fromarray(mixed).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


class PredictIn(BaseModel):
    image: str = Field(max_length=12 * 1024 * 1024)
    models: list[str] = Field(min_length=1, max_length=len(CATALOG))
    gradcam: bool = True


@app.get("/health")
def health():
    models = []
    for model_id, info in CATALOG.items():
        available = (MODELS_DIR / f"{model_id}.keras").exists()
        cfg = _config(model_id) if available else {}
        models.append({"id": model_id, "name": info["name"], "available": available, "version": cfg.get("version")})
    return {"status": "ok", "models": models}


@app.post("/predict")
def predict(body: PredictIn):
    unknown = [m for m in body.models if m not in CATALOG]
    if unknown:
        raise HTTPException(400, f"Modelo desconocido: {', '.join(unknown)}")
    if not any((MODELS_DIR / f"{m}.keras").exists() for m in body.models):
        # Ningún modelo pedido está entrenado: se informa sin procesar la imagen.
        return {"results": [{"model": m, "name": CATALOG[m]["name"], "available": False} for m in body.models]}
    img = _decode(body.image)

    results = []
    for model_id in body.models:
        entry = _load(model_id)
        if entry is None:
            results.append({"model": model_id, "name": CATALOG[model_id]["name"], "available": False})
            continue
        model, cfg, _ = entry
        start = time.perf_counter()
        shown, x = _prepare(img, cfg)
        probs = np.asarray(model(x, training=False)[0], dtype="float64").ravel()
        disease = _disease_output(probs, cfg["classes"])
        p = float(probs[disease])
        low, high = float(cfg["umbral_inferior"]), float(cfg["umbral_superior"])
        result = _decide(p, low, high)
        # El mapa siempre resalta la evidencia de antracnosis: dónde ve lesiones la red.
        cam = _gradcam(model, x, disease, cfg["gradcam_layer"]) if body.gradcam else None
        elapsed = int((time.perf_counter() - start) * 1000)
        results.append(
            {
                "model": model_id,
                "name": CATALOG[model_id]["name"],
                "available": True,
                "version": cfg["version"],
                "class": result,
                "probability": round(p, 4),
                "thresholds": {"inferior": low, "superior": high},
                "probabilities": {"sano": round(1 - p, 4), "antracnosis": round(p, 4)},
                "gradcam": _overlay(shown, cam) if cam is not None else None,
                "time_ms": elapsed,
            }
        )
        log.info(f"prediccion {model_id} {result} p={p:.3f} {elapsed}ms")
    return {"results": results}
