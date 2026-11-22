import { Router } from 'express';
import { asyncHandler } from '../lib/http.js';
import { currentClimate } from '../lib/clima.js';

// Clima de la finca y riesgo de antracnosis (público: son datos meteorológicos de la zona, no de los usuarios).
const router = Router();

// GET /api/clima — últimos 7 días, pronóstico de 7 días y nivel de riesgo
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await currentClimate());
  }),
);

export default router;
