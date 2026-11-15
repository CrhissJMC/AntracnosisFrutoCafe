"""Prepara el conjunto de datos del clasificador: un fruto por imagen, dos clases, dividido 70/15/15.

Fuentes (informe, 4.3.1; cada una con su FUENTE.md en la carpeta de datasets):
  coffee_berry   Roboflow «Coffee berry disease» (COCO Segmentation; un fruto por foto)
                 etiqueta por imagen: con alguna lesión 'Colletotrichum Kahawe' -> antracnosis
                 (incluye lesiones incipientes pequeñas) · solo 'healty' -> sano
  coffee_cherry  Roboflow «coffee cherry 20251206» (COCO, cajas)
                 diseased -> antracnosis · unripe, semi_ripe, ripe, overripe, dry -> sano
  zenodo         Zenodo «Cherry Coffe Bean Dataset», solo las fotos recortadas (5 estados de madurez) -> sano

Pasos:
  1. Recorte: cada fruto anotado se recorta como un cuadrado alrededor de su caja (+15 % de margen)
     y se guarda a 256 px. Las fotos de Zenodo ya vienen recortadas.
  2. Unificación de etiquetas en sano y antracnosis; se descarta la categoría genérica.
  3. Limpieza:
       - frutos pequeños (lado menor de la caja < --min-lado px);
       - imágenes borrosas (varianza del laplaciano < --min-nitidez);
       - duplicados y casi duplicados (hash perceptual dHash, distancia <= --dist-duplicado).
         Las copias aumentadas de Roboflow y los cuadros casi iguales de un video caen aquí.
  4. Balance: los frutos sanos se limitan a --max-sano-por-antracnosis veces los frutos con
     antracnosis (muestreo al azar con semilla, por grupo).
  5. División 70/15/15 por grupo y por fuente, con semilla fija: todos los recortes de una misma
     foto y todos los cuadros de un mismo video quedan en el mismo conjunto.

Salida:
  <salida>/{train,val,test}/{sano,antracnosis}/<fuente>/<grupo>__<n>.jpg
  <salida>/manifiesto.csv   una fila por imagen: conjunto, clase, fuente, grupo, origen y caja
  <salida>/descartes.csv    qué se descartó y por qué
  <salida>/resumen.json     conteos por paso, conjunto, clase y fuente

Uso (desde la imagen del servicio ml):
  python preparar_datos.py --datasets /datasets --salida /datasets/fruto
"""

import argparse
import csv
import json
import random
import shutil
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

TAM = 256
MARGEN = 0.15
CONJUNTOS = ("train", "val", "test")
PROPORCIONES = (0.70, 0.15, 0.15)

ETIQUETAS = {
    "coffee_cherry": {
        "diseased": "antracnosis",
        "unripe": "sano",
        "semi_ripe": "sano",
        "ripe": "sano",
        "overripe": "sano",
        "dry": "sano",
    },
}


# ------------------------------------------------------------------ lectura de fuentes
def grupo_roboflow(nombre):
    """Foto original: Roboflow agrega '_jpg.rf.<hash>' a cada copia exportada."""
    base = nombre.rsplit(".", 1)[0]
    for marca in ("_jpg.rf.", "_jpeg.rf.", "_png.rf.", ".rf."):
        if marca in base:
            return base.split(marca)[0]
    return base


def leer_coco(carpeta, fuente):
    """Devuelve una entrada por fruto anotado.

    Roboflow exporta varias copias aumentadas (volteos, rotaciones) de cada foto original; el hash
    perceptual no las reconoce porque cambian la orientación. Se usa una sola copia por foto original:
    la de nombre menor, para que el resultado sea reproducible."""
    anotaciones = []
    mapa = ETIQUETAS[fuente]
    for split in ("train", "valid", "test"):
        f = carpeta / split / "_annotations.coco.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        cats = {c["id"]: c["name"] for c in d["categories"]}
        imgs = {i["id"]: i for i in d["images"]}
        for a in d["annotations"]:
            anotaciones.append((split, imgs[a["image_id"]], cats[a["category_id"]], a))
    copia_elegida = {}
    for split, im, _, _ in anotaciones:
        g = grupo_roboflow(im["file_name"])
        copia_elegida[g] = min(copia_elegida.get(g, f"{split}/{im['file_name']}"), f"{split}/{im['file_name']}")

    items = []
    for split, im, original, a in anotaciones:
        if original not in mapa:  # categoría padre genérica ('object', 'cofffee-berry'...)
            continue
        if copia_elegida[grupo_roboflow(im["file_name"])] != f"{split}/{im['file_name']}":
            continue
        items.append({
            "fuente": fuente,
            "grupo": grupo_roboflow(im["file_name"]),
            "ruta": carpeta / split / im["file_name"],
            "caja": [round(v, 1) for v in a["bbox"]],
            "clase": mapa[original],
            "clase_original": original,
        })
    return items


def leer_coffee_berry(carpeta):
    """Coffee berry disease: cada foto muestra UN fruto sobre fondo claro. Las anotaciones de
    'Colletotrichum Kahawe' a veces cubren el fruto entero y a veces solo una lesión pequeña
    (infección incipiente), así que la etiqueta es de la imagen completa: antracnosis si tiene
    alguna lesión anotada, sano si solo tiene 'healty'.

    De las copias que exportó Roboflow se usa la de menos relleno negro (las rotadas dejan
    esquinas negras); a igualdad, la de nombre menor."""
    por_foto = defaultdict(dict)  # grupo -> {ruta: set(clases)}
    for split in ("train", "valid", "test"):
        f = carpeta / split / "_annotations.coco.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        cats = {c["id"]: c["name"] for c in d["categories"]}
        imgs = {i["id"]: carpeta / split / i["file_name"] for i in d["images"]}
        for ruta in imgs.values():
            por_foto[grupo_roboflow(ruta.name)].setdefault(ruta, set())
        for a in d["annotations"]:
            ruta = imgs[a["image_id"]]
            por_foto[grupo_roboflow(ruta.name)][ruta].add(cats[a["category_id"]])

    def relleno_negro(ruta):
        a = np.asarray(Image.open(ruta).convert("L"))
        return float((a < 12).mean())

    items = []
    for grupo, copias in sorted(por_foto.items()):
        clases = set().union(*copias.values())
        if "Colletotrichum Kahawe" in clases:
            clase, original = "antracnosis", "Colletotrichum Kahawe"
        elif "healty" in clases:
            clase, original = "sano", "healty"
        else:
            continue  # foto sin anotar
        ruta = min(copias, key=lambda r: (round(relleno_negro(r), 2), r.name))
        items.append({"fuente": "coffee_berry", "grupo": grupo, "ruta": ruta, "caja": None,
                      "clase": clase, "clase_original": original})
    return items


def leer_zenodo(carpeta):
    """Solo los subconjuntos de fotos recortadas (dataset2_cropped y dataset4_1_cropped). Los de
    video (dataset1, dataset3_1) son cuadros desenfocados por movimiento sobre madera: el filtro de
    nitidez no los detecta (la madera sí es nítida) y enseñarían al modelo «borroso = sano»."""
    items = []
    for ruta in sorted(carpeta.rglob("*.jpg")):
        if "cropped" not in ruta.parent.parent.name:
            continue
        estado = ruta.parent.name  # Verdes, Pintones, Maduros, Sobremaduros, Secos
        nombre = ruta.stem.split(".MOV_")[0].split(".mp4_")[0]
        subconjunto = ruta.parent.parent.name
        items.append({
            "fuente": "zenodo",
            "grupo": f"{subconjunto}-{nombre}",
            "ruta": ruta,
            "caja": None,
            "clase": "sano",
            "clase_original": estado,
        })
    return items


# ------------------------------------------------------------------ imagen
_cache = {}


def abrir(ruta):
    """Abre la foto una sola vez aunque tenga muchos frutos anotados (se procesan en orden)."""
    if ruta not in _cache:
        _cache.clear()
        _cache[ruta] = ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")
    return _cache[ruta]


def recortar(item):
    img = abrir(item["ruta"])
    if item["caja"] is None:
        return ImageOps.pad(img, (TAM, TAM), color=(0, 0, 0)) if img.width != img.height else img.resize((TAM, TAM))
    x, y, w, h = item["caja"]
    lado = max(w, h) * (1 + 2 * MARGEN)
    cx, cy = x + w / 2, y + h / 2
    caja = (cx - lado / 2, cy - lado / 2, cx + lado / 2, cy + lado / 2)
    # crop() rellena con negro lo que queda fuera de la foto: se reemplaza por el borde más cercano
    izq, arr = max(0, int(caja[0])), max(0, int(caja[1]))
    der, aba = min(img.width, int(caja[2])), min(img.height, int(caja[3]))
    recorte = img.crop((izq, arr, der, aba))
    return ImageOps.pad(recorte, (TAM, TAM), method=Image.Resampling.BILINEAR, color=_color_borde(recorte))


def _color_borde(img):
    a = np.asarray(img)
    borde = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return tuple(int(v) for v in np.median(borde, axis=0))


def nitidez(img):
    """Varianza del laplaciano en escala de grises a 128 px: valores bajos = foto borrosa."""
    g = np.asarray(img.convert("L").resize((128, 128)), dtype="float32")
    lap = -4 * g[1:-1, 1:-1] + g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:]
    return float(lap.var())


def dhash(img, n=16):
    """Hash perceptual de 256 bits. Con 8×8 (64 bits) frutos distintos centrados sobre el mismo
    fondo claro salían como duplicados."""
    g = np.asarray(img.convert("L").resize((n + 1, n)), dtype="int16")
    return np.packbits((g[:, 1:] > g[:, :-1]).ravel())


# ------------------------------------------------------------------ división
def dividir_por_grupo(items, semilla):
    """Asigna grupos completos a train/val/test buscando 70/15/15 dentro de cada clase."""
    grupos = defaultdict(list)
    for it in items:
        grupos[it["grupo"]].append(it)
    claves = sorted(grupos)
    random.Random(semilla).shuffle(claves)
    # primero los grupos con antracnosis, que son escasos, para repartirlos bien
    claves.sort(key=lambda k: -sum(i["clase"] == "antracnosis" for i in grupos[k]))
    totales = Counter(i["clase"] for i in items)
    llevados = {s: Counter() for s in CONJUNTOS}
    for clave in claves:
        clase = Counter(i["clase"] for i in grupos[clave]).most_common(1)[0][0]
        falta = {s: p * totales[clase] - llevados[s][clase] for s, p in zip(CONJUNTOS, PROPORCIONES)}
        destino = max(falta, key=falta.get)
        for it in grupos[clave]:
            it["conjunto"] = destino
            llevados[destino][it["clase"]] += 1


# ------------------------------------------------------------------ principal
def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--datasets", type=Path, required=True, help="carpeta con las tres fuentes descargadas")
    p.add_argument("--salida", type=Path, required=True)
    p.add_argument("--min-lado", type=float, default=40)
    p.add_argument("--min-nitidez", type=float, default=15)
    p.add_argument("--dist-duplicado", type=int, default=12, help="bits distintos (de 256) para considerar duplicado")
    p.add_argument("--max-sano-por-antracnosis", type=float, default=4)
    p.add_argument("--semilla", type=int, default=42)
    a = p.parse_args()

    fuentes = {
        "coffee_berry": a.datasets / "roboflow_coffee_berry_disease" / "datos",
        "coffee_cherry": a.datasets / "roboflow_coffee_cherry_20251206" / "datos",
        "zenodo": a.datasets / "zenodo_cherry_coffee_bean",
    }
    items = leer_coffee_berry(fuentes["coffee_berry"]) + leer_coco(fuentes["coffee_cherry"], "coffee_cherry")
    items += leer_zenodo(fuentes["zenodo"])
    resumen = {"1_anotados": dict(Counter((i["fuente"], i["clase"]) for i in items).items())}
    print(f"Frutos anotados: {len(items)}")

    descartes = []

    def descartar(it, motivo, valor=""):
        descartes.append([it["fuente"], it["clase"], it["grupo"], it["ruta"].name, it["caja"], motivo, valor])

    # 1. Tamaño mínimo
    quedan = []
    for it in items:
        if it["caja"] is not None and min(it["caja"][2], it["caja"][3]) < a.min_lado:
            descartar(it, "fruto pequeño", round(min(it["caja"][2:]), 1))
        else:
            quedan.append(it)
    items = quedan

    # 2. Recorte, nitidez y hash. Las clases escasas primero, para que en un duplicado se quede la de antracnosis.
    #    Los recortes no se guardan en memoria: se vuelven a generar al escribir los elegidos.
    items.sort(key=lambda i: (i["clase"] != "antracnosis", i["fuente"], str(i["ruta"]), str(i["caja"])))
    hashes = np.zeros((len(items), 32), dtype=np.uint8)
    grupos_vistos = []
    quedan = []
    for k, it in enumerate(items):
        if k % 2000 == 0:
            print(f"  limpieza {k}/{len(items)}")
        img = recortar(it)
        it["nitidez"] = round(nitidez(img), 1)
        if it["nitidez"] < a.min_nitidez:
            descartar(it, "borrosa", it["nitidez"])
            continue
        h = dhash(img)
        n = len(grupos_vistos)
        if n:
            distancias = np.unpackbits(hashes[:n] ^ h, axis=1).sum(axis=1)
            j = int(distancias.argmin())
            if distancias[j] <= a.dist_duplicado:
                repetido = grupos_vistos[j]
                descartar(it, "duplicado" if repetido == it["grupo"] else "duplicado de otro grupo", repetido)
                continue
        hashes[n] = h
        grupos_vistos.append(it["grupo"])
        quedan.append(it)
    items = quedan
    resumen["2_tras_limpieza"] = dict(Counter((i["fuente"], i["clase"]) for i in items).items())

    # 3. Balance: limitar los sanos. Casi toda la antracnosis viene de fotos de un fruto sobre fondo
    #    claro (coffee_berry); para que el modelo no aprenda «fondo claro = enfermo» se conservan
    #    primero todos los sanos con ese tipo de foto (coffee_berry y zenodo) y el resto del cupo se
    #    completa al azar con frutos sanos de coffee_cherry (en rama).
    n_antr = sum(i["clase"] == "antracnosis" for i in items)
    tope = int(a.max_sano_por_antracnosis * n_antr)
    rng = random.Random(a.semilla)
    sanos = [i for i in items if i["clase"] == "sano"]
    prioridad = {"coffee_berry": 0, "zenodo": 1, "coffee_cherry": 2}
    rng.shuffle(sanos)
    sanos.sort(key=lambda i: prioridad[i["fuente"]])
    if len(sanos) > tope:
        elegidos = set(id(i) for i in sanos[:tope])
        for i in sanos[tope:]:
            descartar(i, "balance de clases")
        items = [i for i in items if i["clase"] == "antracnosis" or id(i) in elegidos]
    resumen["3_tras_balance"] = dict(Counter((i["fuente"], i["clase"]) for i in items).items())

    # 4. División por grupo, dentro de cada fuente
    for fuente in fuentes:
        dividir_por_grupo([i for i in items if i["fuente"] == fuente], a.semilla)

    # 5. Escritura
    if a.salida.exists():
        for s in CONJUNTOS:
            shutil.rmtree(a.salida / s, ignore_errors=True)
    a.salida.mkdir(parents=True, exist_ok=True)
    contador = Counter()
    filas = []
    items.sort(key=lambda i: (str(i["ruta"]), str(i["caja"])))
    print(f"Escribiendo {len(items)} imágenes...")
    for it in items:
        it["img"] = recortar(it)
        contador[(it["fuente"], it["grupo"])] += 1
        grupo_seguro = "".join(c if c.isalnum() or c in "-_" else "_" for c in it["grupo"])
        destino = a.salida / it["conjunto"] / it["clase"] / it["fuente"] / f"{grupo_seguro}__{contador[(it['fuente'], it['grupo'])]}.jpg"
        destino.parent.mkdir(parents=True, exist_ok=True)
        it.pop("img").save(destino, quality=95)
        filas.append([it["conjunto"], it["clase"], it["fuente"], it["grupo"], it["clase_original"],
                      destino.relative_to(a.salida).as_posix(), it["ruta"].name, it["caja"], it["nitidez"]])

    with open(a.salida / "manifiesto.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["conjunto", "clase", "fuente", "grupo", "clase_original", "archivo", "origen", "caja_xywh", "nitidez"])
        w.writerows(sorted(filas))
    with open(a.salida / "descartes.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["fuente", "clase", "grupo", "origen", "caja_xywh", "motivo", "valor"])
        w.writerows(descartes)

    # Comprobación: ningún grupo aparece en dos conjuntos
    conjuntos_de = defaultdict(set)
    for it in items:
        conjuntos_de[(it["fuente"], it["grupo"])].add(it["conjunto"])
    fugas = [g for g, s in conjuntos_de.items() if len(s) > 1]
    assert not fugas, f"Grupos repartidos en más de un conjunto: {fugas[:5]}"

    def tabla(clave):
        t = defaultdict(Counter)
        for i in items:
            t[i["conjunto"]][clave(i)] += 1
        return {s: dict(t[s]) for s in CONJUNTOS}

    final = {
        "parametros": {k: (str(v) if isinstance(v, Path) else v) for k, v in vars(a).items()},
        "descartes": dict(Counter(d[5] for d in descartes)),
        "pasos": {k: {f"{f}/{c}": n for (f, c), n in v.items()} for k, v in resumen.items()},
        "por_conjunto_y_clase": tabla(lambda i: i["clase"]),
        "por_conjunto_y_fuente": tabla(lambda i: f"{i['fuente']}/{i['clase']}"),
        "grupos_por_conjunto": {s: len({(i["fuente"], i["grupo"]) for i in items if i["conjunto"] == s}) for s in CONJUNTOS},
        "total": len(items),
    }
    (a.salida / "resumen.json").write_text(json.dumps(final, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({k: final[k] for k in ("descartes", "por_conjunto_y_clase", "grupos_por_conjunto", "total")},
                     indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
