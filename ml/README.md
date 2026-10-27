# Servicio de los modelos (`ml/`)

Servicio interno en Python (FastAPI + TensorFlow) que ejecuta los modelos y calcula los mapas Grad-CAM.
Solo lo llama la API del sitio por la red interna de Docker; **no se expone a internet**.

```
Navegador ──► web (nginx) ──► api (Node) ──► ml (Python) ──► ml/modelos/*.keras
```

## Encenderlo

Es pesado (TensorFlow), por eso tiene su propio perfil:

```powershell
docker compose --profile ml up -d --build
```

Sin este servicio, la página **Diagnóstico** sigue funcionando y avisa que el modelo no está activo.

## Agregar los modelos entrenados

1. Entrena en Google Colab (ver el ejemplo de abajo).
2. Copia los archivos a la carpeta `ml/modelos/` con **estos nombres exactos**:

   | Modelo | Archivo | Configuración (opcional) |
   |---|---|---|
   | EfficientNet-B0 | `efficientnet_b0.keras` | `efficientnet_b0.json` |
   | MobileNetV2 | `mobilenet_v2.keras` | `mobilenet_v2.json` |

3. No hace falta reiniciar nada: el servicio detecta los archivos y los carga en el primer análisis.
   Si reemplazas un archivo, se vuelve a cargar solo.

Los archivos `.keras` **no se suben a Git** (pesan mucho y dependen de la autorización del dataset).

## Archivo de configuración (`<modelo>.json`)

Todos los campos son opcionales:

```json
{
  "version": "v1",
  "classes": ["sano", "incipiente", "avanzado"],
  "input_size": 224,
  "preprocess": "none",
  "umbral_sano": 0.7,
  "gradcam_layer": "top_conv"
}
```

| Campo | Qué hace | Valor por defecto |
|---|---|---|
| `version` | Se muestra en el resultado y queda registrada (RNF08) | `v1` |
| `classes` | Orden de las salidas del modelo. **Debe coincidir con el orden del entrenamiento** | `sano, incipiente, avanzado` |
| `input_size` | Tamaño de entrada en píxeles | `224` |
| `preprocess` | `none` (el modelo recibe 0–255), `mobilenet_v2` (escala a −1…1) o `rescale` (0…1) | EfficientNet: `none` · MobileNetV2: `mobilenet_v2` |
| `umbral_sano` | Un fruto solo se clasifica como sano si esa probabilidad supera el umbral (reduce falsos negativos) | sin umbral |
| `gradcam_layer` | Capa convolucional para Grad-CAM. Si se omite, se usa la última capa convolucional | automática |

Si el entrenamiento solo tiene **dos clases**, usa `"classes": ["sano", "avanzado"]` o adapta las clases del sitio.

## Ejemplo de exportación en Colab

Crea la red base con `input_tensor=` para que sus capas queden al nivel superior del modelo:
así el Grad-CAM funciona sin configuración extra.

```python
import keras

inputs = keras.Input((224, 224, 3))
base = keras.applications.EfficientNetB0(include_top=False, weights="imagenet", input_tensor=inputs)
base.trainable = False                      # fase 1: solo la cabeza
x = keras.layers.GlobalAveragePooling2D()(base.output)
x = keras.layers.Dropout(0.3)(x)
outputs = keras.layers.Dense(3, activation="softmax")(x)
model = keras.Model(inputs, outputs)

# ... entrenamiento (fase 1 y fase 2) ...

model.save("efficientnet_b0.keras")         # descárgalo y cópialo en ml/modelos/
```

Para MobileNetV2 es igual, con `keras.applications.MobileNetV2` y guardando `mobilenet_v2.keras`.
Si en el entrenamiento aplicaste `keras.applications.mobilenet_v2.preprocess_input` fuera del modelo,
deja `"preprocess": "mobilenet_v2"`; si lo incluiste como capa dentro del modelo, usa `"preprocess": "none"`.

## API interna

| Método | Ruta | Uso |
|---|---|---|
| GET | `/health` | Qué modelos están disponibles y su versión |
| POST | `/predict` | `{ "image": "data:image/jpeg;base64,…", "models": ["efficientnet_b0"] }` → clase, confianza, probabilidades, Grad-CAM y tiempo |
