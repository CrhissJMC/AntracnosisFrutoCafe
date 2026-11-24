"""Aumento de datos fuera de línea: crea variantes de cada foto de ENTRENAMIENTO (versión v1 de los modelos).

Cada foto de train genera --variantes copias alteradas (4 por defecto), una de cada tipo:
  1. espejo   : volteo horizontal + rotación leve (±15°) + brillo y contraste ±15 %
  2. rotada   : giro de 90°, 180° o 270° (el fruto no tiene una orientación fija) + volteo vertical al azar
  3. zoom     : acercamiento de 1,15 a 1,35 al centro + rotación leve (±20°)
  4. borrosa  : desenfoque gaussiano (radio 0,8 a 1,6) + brillo ±15 % (fotos movidas o desenfocadas)
Con más de 4 variantes se repiten los tipos con otros valores al azar.

Reglas para no hacer trampa en la evaluación:
  - Solo se aumentan las fotos de train. Val y test se copian tal cual: el modelo se mide con fotos reales.
  - Cada variante se llama <grupo>__<n>_aug<k>.jpg, así entrenar.py la asigna al mismo grupo que su original.
  - Las rotaciones recortan el centro para no dejar esquinas negras que el modelo podría aprender.

El resultado (unos 200 MB) no se versiona en Git: se regenera igual con la misma semilla.

Uso (en Docker, desde la raíz del repositorio):
    docker run --rm -u root -v "${PWD}\\ml\\entrenamiento:/ent:ro" -v "${PWD}\\datos\\fruto:/datos:ro" \\
        -v "${PWD}\\datos\\fruto_aumentado:/salida" antracnosis-entrenamiento python -I /ent/aumentar_datos.py --datos /datos --salida /salida
"""

import argparse
import csv
import json
import math
import random
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

EXTENSIONES = {".jpg", ".jpeg", ".png"}
TIPOS = ["espejo", "rotada", "zoom", "borrosa"]


def rotar_sin_bordes(img, grados):
    """Rota y recorta el cuadrado central que no tiene relleno negro."""
    w, h = img.size
    rot = img.rotate(grados, resample=Image.Resampling.BICUBIC, expand=True)
    a = math.radians(abs(grados) % 90)
    lado = int(min(w, h) / (math.cos(a) + math.sin(a)))
    cx, cy = rot.size[0] / 2, rot.size[1] / 2
    caja = (int(cx - lado / 2), int(cy - lado / 2), int(cx + lado / 2), int(cy + lado / 2))
    return rot.crop(caja).resize((w, h), Image.Resampling.BICUBIC)


def ajustar_luz(img, rnd, rango=0.15):
    img = ImageEnhance.Brightness(img).enhance(1 + rnd.uniform(-rango, rango))
    return ImageEnhance.Contrast(img).enhance(1 + rnd.uniform(-rango, rango))


def variante(img, tipo, rnd):
    if tipo == "espejo":
        out = rotar_sin_bordes(ImageOps.mirror(img), rnd.uniform(-15, 15))
        return ajustar_luz(out, rnd), "volteo horizontal, rotación leve, brillo y contraste"
    if tipo == "rotada":
        grados = rnd.choice([90, 180, 270])
        out = img.rotate(grados, expand=True)
        if rnd.random() < 0.5:
            out = ImageOps.flip(out)
        return out, f"giro de {grados}°"
    if tipo == "zoom":
        f = rnd.uniform(1.15, 1.35)
        w, h = img.size
        cw, ch = w / f, h / f
        out = img.crop(((w - cw) / 2, (h - ch) / 2, (w + cw) / 2, (h + ch) / 2)).resize((w, h), Image.Resampling.BICUBIC)
        return rotar_sin_bordes(out, rnd.uniform(-20, 20)), f"zoom ×{f:.2f}"
    radio = rnd.uniform(0.8, 1.6)
    out = img.filter(ImageFilter.GaussianBlur(radio))
    return ajustar_luz(out, rnd), f"desenfoque {radio:.1f}"


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--datos", type=Path, required=True, help="carpeta de preparar_datos.py (train/val/test)")
    p.add_argument("--salida", type=Path, required=True)
    p.add_argument("--variantes", type=int, default=4)
    p.add_argument("--semilla", type=int, default=42)
    a = p.parse_args()

    if a.salida.exists():
        for hijo in a.salida.iterdir():
            shutil.rmtree(hijo) if hijo.is_dir() else hijo.unlink()
    a.salida.mkdir(parents=True, exist_ok=True)

    # Val y test: copia exacta.
    for conjunto in ("val", "test"):
        shutil.copytree(a.datos / conjunto, a.salida / conjunto)

    rnd = random.Random(a.semilla)
    filas = []
    conteo = Counter()
    originales = sorted(r for r in (a.datos / "train").rglob("*") if r.suffix.lower() in EXTENSIONES)
    for ruta in originales:
        rel = ruta.relative_to(a.datos / "train")
        destino = a.salida / "train" / rel
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ruta, destino)
        clase = rel.parts[0]
        conteo[(clase, "original")] += 1
        img = Image.open(ruta).convert("RGB")
        for k in range(1, a.variantes + 1):
            tipo = TIPOS[(k - 1) % len(TIPOS)]
            out, detalle = variante(img, tipo, rnd)
            nombre = destino.with_name(f"{destino.stem}_aug{k}.jpg")
            out.save(nombre, quality=92)
            filas.append([str(nombre.relative_to(a.salida)), str(rel), clase, tipo, detalle])
            conteo[(clase, "variante")] += 1

    with open(a.salida / "aumento.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["variante", "original", "clase", "tipo", "detalle"])
        w.writerows(filas)
    resumen = {
        "variantes_por_foto": a.variantes,
        "semilla": a.semilla,
        "train": {c: {"originales": conteo[(c, "original")], "variantes": conteo[(c, "variante")],
                      "total": conteo[(c, "original")] + conteo[(c, "variante")]} for c in ("sano", "antracnosis")},
        "val_y_test": "copia exacta, sin aumento",
    }
    (a.salida / "resumen_aumento.json").write_text(json.dumps(resumen, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(resumen, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
