import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { asyncHandler, notFound, parseId } from '../lib/http.js';
import { buildZip } from '../lib/zip.js';
import { requireAdmin } from '../middleware/auth.js';
import { CAPTURES_DIR, callMl, MODELS } from './diagnosis.js';

// Modelo de diagnóstico (RF09, RNF08): versiones, métricas, versión activa y conjunto para reentrenar.
// Solo el administrador.
const router = Router();
router.use(requireAdmin);

// GET /api/admin/modelos — versiones, estado del servicio y resumen del conjunto de reentrenamiento
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [versions, dataset, health] = await Promise.all([
      query(
        `SELECT m.id, m.modelo, m.version, m.archivo, m.umbral_inferior, m.umbral_superior, m.auc, m.recall_antracnosis,
                m.precision_antracnosis, m.f1_antracnosis, m.num_imagenes, m.entrenado_en, m.notas, m.activo, m.created_at,
                (SELECT count(*)::int FROM diagnosticos d WHERE d.modelo_id = m.id) AS diagnosticos,
                (SELECT max(d.created_at) FROM diagnosticos d WHERE d.modelo_id = m.id) AS ultimo_uso
           FROM modelo_versiones m
          ORDER BY m.modelo, m.activo DESC, m.created_at DESC`,
      ),
      query(
        `SELECT count(*) FILTER (WHERE clase = 'sano')::int        AS sano,
                count(*) FILTER (WHERE clase = 'antracnosis')::int AS antracnosis,
                (SELECT count(*)::int FROM v_validacion_vigente WHERE clase_confirmada = 'otro_dano') AS otro_dano
           FROM v_dataset_reentrenamiento`,
      ),
      callMl('/health', {}, 2000),
    ]);
    const loaded = Object.fromEntries((health?.ok ? health.body.models : []).map((m) => [m.id, m]));
    res.json({
      servicio: {
        activo: Boolean(health?.ok),
        modelos: MODELS.map((m) => ({
          modelo: m.id,
          nombre: m.name,
          cargado: Boolean(loaded[m.id]?.available),
          version: loaded[m.id]?.version ?? null,
        })),
      },
      versiones: versions.rows,
      reentrenamiento: dataset.rows[0],
    });
  }),
);

// PATCH /api/admin/modelos/:id — marcar una versión como la activa de su arquitectura y/o editar sus notas
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'Versión');
    const data = z
      .object({ activo: z.literal(true).optional(), notas: z.string().trim().max(1000).optional() })
      .strict()
      .parse(req.body);
    const row = await withTransaction(async (client) => {
      const { rows } = await client.query('SELECT id, modelo FROM modelo_versiones WHERE id = $1 FOR UPDATE', [id]);
      if (!rows[0]) throw notFound('Versión');
      if (data.activo) {
        // Primero se desactiva la vigente (el índice único admite una sola activa por arquitectura).
        await client.query('UPDATE modelo_versiones SET activo = FALSE WHERE modelo = $1 AND activo AND id <> $2', [rows[0].modelo, id]);
        await client.query('UPDATE modelo_versiones SET activo = TRUE WHERE id = $1', [id]);
      }
      if (data.notas !== undefined) await client.query('UPDATE modelo_versiones SET notas = $2 WHERE id = $1', [id, data.notas]);
      const updated = await client.query('SELECT id, modelo, version, activo, notas FROM modelo_versiones WHERE id = $1', [id]);
      return updated.rows[0];
    });
    res.json({ version: row });
  }),
);

// GET /api/admin/modelos/reentrenamiento — ZIP con las fotos validadas (sano/ y antracnosis/) y su manifiesto,
// en la estructura que espera ml/entrenamiento/entrenar.py.
router.get(
  '/reentrenamiento',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT captura_id, imagen, clase, perfil_validador, validador_nombre, validada_en
         FROM v_dataset_reentrenamiento ORDER BY clase, captura_id`,
    );
    const files = [];
    const manifest = ['archivo;clase;captura;perfil_validador;validador;fecha_validacion_utc'];
    let missing = 0;
    for (const r of rows) {
      try {
        const data = await readFile(path.join(CAPTURES_DIR, r.imagen));
        const name = `${r.clase}/captura_${r.captura_id}${path.extname(r.imagen) || '.jpg'}`;
        files.push({ name, data });
        const who = /[;"\n]/.test(r.validador_nombre) ? `"${r.validador_nombre.replace(/"/g, '""')}"` : r.validador_nombre;
        manifest.push([name, r.clase, r.captura_id, r.perfil_validador, who, new Date(r.validada_en).toISOString()].join(';'));
      } catch {
        missing += 1; // la foto ya no está en el volumen
      }
    }
    files.push({ name: 'manifiesto.csv', data: Buffer.from(`﻿${manifest.join('\r\n')}\r\n`, 'utf8') });
    files.push({
      name: 'LEEME.txt',
      data: Buffer.from(
        [
          'Fotos validadas por un especialista o el administrador (clase vigente sano o antracnosis).',
          'Copia las carpetas sano/ y antracnosis/ dentro de una carpeta de datos y entrena con:',
          '  python entrenar.py --datos <carpeta> --modelo efficientnet_b0 --version v1',
          'Para sumarlas al conjunto público, agrégalas a datos/fruto/train/ (o usa una división propia).',
          `Fotos incluidas: ${rows.length - missing}${missing ? ` · no encontradas en el volumen: ${missing}` : ''}`,
        ].join('\r\n'),
        'utf8',
      ),
    });
    const name = `reentrenamiento-${new Date().toISOString().slice(0, 10)}.zip`;
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${name}"`);
    res.send(buildZip(files));
  }),
);

export default router;
