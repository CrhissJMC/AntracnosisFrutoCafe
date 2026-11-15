"""Definición de las dos redes del proyecto: EfficientNet-B0 y MobileNetV2.

Ambas usan transferencia de aprendizaje (informe, 2.7.2):
  - Base convolucional preentrenada en ImageNet, sin su clasificador original.
  - Cabeza nueva: GlobalAveragePooling -> Dropout -> Dense(1, sigmoide).
    La salida es la probabilidad de antracnosis, que es lo que espera ml/app.py.

El preprocesamiento va DENTRO del modelo, así el servicio le pasa la foto en 0-255
("preprocess": "none") y no hay riesgo de preprocesar distinto al entrenar y al predecir.

La base se crea con `input_tensor=` para que sus capas queden al nivel superior del
modelo: así el Grad-CAM de ml/app.py encuentra la última capa convolucional.
"""

import keras

INPUT_SIZE = 224

# id (nombre del archivo en ml/modelos/) -> datos de cada arquitectura
ARQUITECTURAS = {
    "efficientnet_b0": {
        "nombre": "EfficientNet-B0",
        "base": keras.applications.EfficientNetB0,
        # EfficientNet de Keras ya trae su normalización y recibe 0-255.
        "preprocesar": None,
        "gradcam_layer": "top_activation",
    },
    "mobilenet_v2": {
        "nombre": "MobileNetV2",
        "base": keras.applications.MobileNetV2,
        # MobileNetV2 espera valores entre -1 y 1.
        "preprocesar": lambda x: keras.layers.Rescaling(1 / 127.5, offset=-1.0, name="escala_mobilenet")(x),
        "gradcam_layer": "out_relu",
    },
}


def construir_modelo(model_id, pesos="imagenet", dropout=0.3):
    """Devuelve (modelo, base). La base queda congelada (fase 1 del entrenamiento)."""
    if model_id not in ARQUITECTURAS:
        raise ValueError(f"Arquitectura desconocida: {model_id}. Opciones: {', '.join(ARQUITECTURAS)}")
    arq = ARQUITECTURAS[model_id]

    entradas = keras.Input((INPUT_SIZE, INPUT_SIZE, 3), name="imagen")
    x = arq["preprocesar"](entradas) if arq["preprocesar"] else entradas
    base = arq["base"](
        include_top=False, weights=pesos, input_tensor=x, input_shape=(INPUT_SIZE, INPUT_SIZE, 3)
    )
    base.trainable = False

    x = keras.layers.GlobalAveragePooling2D(name="promedio_global")(base.output)
    x = keras.layers.Dropout(dropout, name="dropout")(x)
    salida = keras.layers.Dense(1, activation="sigmoid", name="prob_antracnosis")(x)
    modelo = keras.Model(entradas, salida, name=model_id)
    return modelo, base


def config_servicio(model_id, version, umbral_inferior=0.35, umbral_superior=0.65):
    """Contenido de <model_id>.json que lee ml/app.py."""
    return {
        "version": version,
        "classes": ["sano", "antracnosis"],
        "input_size": INPUT_SIZE,
        "preprocess": "none",
        "umbral_inferior": umbral_inferior,
        "umbral_superior": umbral_superior,
        "gradcam_layer": ARQUITECTURAS[model_id]["gradcam_layer"],
    }
