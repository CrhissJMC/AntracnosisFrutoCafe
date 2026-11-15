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

1. Entrena en la PC del equipo con la GPU, dentro de WSL2 (ver el ejemplo de abajo).
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
  "classes": ["sano", "antracnosis"],
  "input_size": 224,
  "preprocess": "none",
  "umbral_inferior": 0.35,
  "umbral_superior": 0.65,
  "gradcam_layer": "top_conv"
}
```

| Campo | Qué hace | Valor por defecto |
|---|---|---|
| `version` | Se muestra en el resultado y queda registrada (RNF08) | `v1` |
| `classes` | Orden de las salidas si el modelo termina en softmax. Con una sola neurona sigmoide se ignora: la salida es la probabilidad de antracnosis | `sano, antracnosis` |
| `input_size` | Tamaño de entrada en píxeles | `224` |
| `preprocess` | `none` (el modelo recibe 0–255), `mobilenet_v2` (escala a −1…1) o `rescale` (0…1) | EfficientNet: `none` · MobileNetV2: `mobilenet_v2` |
| `umbral_inferior` | Por debajo de esta probabilidad de antracnosis el fruto es **sano** | `0.35` |
| `umbral_superior` | Desde esta probabilidad el fruto es **antracnosis**; entre ambos umbrales el resultado es **revisar** (el modelo no está seguro) | `0.65` |
| `gradcam_layer` | Capa convolucional para Grad-CAM. Si se omite, se usa la última capa convolucional | automática |

Los umbrales se fijan con el conjunto de validación: el superior, para alcanzar el recall de 85 % en antracnosis (RNF01); la zona intermedia envía los casos dudosos al especialista en lugar de darlos por sanos. Si el inferior no es menor que el superior, el servicio usa los valores por defecto.

## Modelos y entrenamiento (`ml/entrenamiento/`)

| Archivo | Qué hace |
|---|---|
| `modelos.py` | Define las dos redes: base de ImageNet (EfficientNet-B0 o MobileNetV2) + `GlobalAveragePooling → Dropout(0.3) → Dense(1, sigmoide)`. El preprocesamiento va dentro del modelo (`"preprocess": "none"`) |
| `exportar_sin_entrenar.py` | Guarda las dos redes **sin entrenar** en `ml/modelos/` (versión `sin-entrenar`) para probar el sistema de punta a punta. Sus predicciones no significan nada |
| `entrenar.py` | División 70/15/15 por grupo, aumento de datos, entrenamiento en dos fases, pesos de clase, umbrales con validación, métricas con prueba |
| `requirements.txt` | Dependencias para entrenar con GPU (WSL2) |

### Datos de entrada
Una imagen por fruto, en dos carpetas (se admiten subcarpetas por fuente):

```
datos/
  sano/          zenodo/Maduros/..., coffee_berry/...
  antracnosis/   coffee_berry/...
```

Para que la división no mezcle imágenes casi iguales entre entrenamiento y prueba, todo un **grupo** va al mismo conjunto:
los cuadros de un video (`IMG_0832.MOV_111.jpg`) y los recortes de una misma foto, que deben nombrarse `foto__1.jpg`, `foto__2.jpg`.

### Entrenar
```powershell
# con GPU, dentro de WSL2
pip install -r ml/entrenamiento/requirements.txt
cd ml/entrenamiento
python entrenar.py --datos /ruta/a/datos --modelo efficientnet_b0 --version v1
python entrenar.py --datos /ruta/a/datos --modelo mobilenet_v2 --version v1
```

Sin GPU se puede usar la imagen del servicio (en CPU, más lento):
```powershell
docker run --rm -u root -v "${PWD}\ml\entrenamiento:/ent:ro" -v "C:\ruta\datos:/datos:ro" -v "${PWD}\ml\modelos:/salida" -w /ent antracnosis-ml python entrenar.py --datos /datos --modelo mobilenet_v2 --salida /salida
```

Cada entrenamiento deja en `ml/modelos/`: `<modelo>.keras`, `<modelo>.json` (con los umbrales elegidos),
`<modelo>_metricas.json` (matriz de confusión, recall, precisión, F1 y % «revisar» en validación y prueba) y
`<modelo>_division.csv` (a qué conjunto fue cada imagen). Los umbrales se eligen con validación:
el superior es el mayor que mantiene recall ≥ 85 % (RNF01) y el inferior deja como «sano» como máximo el 2 % de los frutos con antracnosis.

### Probar el sistema sin entrenar
```powershell
docker compose --profile ml build ml
docker run --rm -u root -v "${PWD}\ml\entrenamiento:/ent:ro" -v "${PWD}\ml\modelos:/salida" -w /ent antracnosis-ml python exportar_sin_entrenar.py --salida /salida
docker compose --profile ml up -d
```

## API interna

| Método | Ruta | Uso |
|---|---|---|
| GET | `/health` | Qué modelos están disponibles y su versión |
| POST | `/predict` | `{ "image": "data:image/jpeg;base64,…", "models": ["efficientnet_b0"] }` → resultado (sano, revisar o antracnosis), probabilidad de antracnosis, umbrales, Grad-CAM y tiempo |
