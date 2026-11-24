// Notificaciones dentro del sitio (sin correo ni servicios externos). Se muestran en la campana de la barra superior.
import { query } from '../db/pool.js';

const CLASS_NAMES = { sano: 'sano', antracnosis: 'antracnosis', otro_dano: 'otro daño' };
const log = (msg, extra = {}) => console.log(JSON.stringify({ level: 'info', msg, ...extra }));

/** ¿El caso necesita a un especialista? Algún modelo dijo «revisar» o los modelos no coinciden. */
export const needsReview = (results) => {
  const classes = results.filter((r) => r.available).map((r) => r.class);
  return classes.includes('revisar') || new Set(classes).size > 1;
};

/**
 * Captura dudosa: avisa a los especialistas (si no hay ninguno, a los administradores) y al autor.
 * Nunca hace fallar el diagnóstico: un error aquí solo se registra.
 */
export async function notifyReviewCase(capturaId, autor, results) {
  if (!needsReview(results)) return 0;
  try {
    const disagree = new Set(results.filter((r) => r.available).map((r) => r.class)).size > 1;
    const motivo = disagree ? 'los modelos no coinciden' : 'el modelo no está seguro';
    const { rowCount } = await query(
      `INSERT INTO notificaciones (usuario_id, tipo, captura_id, mensaje)
       SELECT u.id, 'caso_revisar', $1, $2
         FROM users u
        WHERE u.id <> $3
          AND (u.perfil = 'especialista'
               OR (u.role = 'admin' AND NOT EXISTS (SELECT 1 FROM users e WHERE e.perfil = 'especialista')))`,
      [capturaId, `Nuevo caso para validar: la captura N.º ${capturaId} de ${autor.name} quedó en «revisar» (${motivo}).`, autor.id],
    );
    await query(
      `INSERT INTO notificaciones (usuario_id, tipo, captura_id, mensaje) VALUES ($1, 'caso_en_revision', $2, $3)`,
      [autor.id, capturaId, `Tu captura N.º ${capturaId} quedó en «revisar»: un especialista la revisará y te avisaremos aquí.`],
    );
    log('notificacion_caso_revisar', { captura: capturaId, especialistas: rowCount });
    return rowCount;
  } catch (err) {
    log('notificacion_error', { error: err.message });
    return 0;
  }
}

/** Validación registrada: avisa al autor de la captura y da por atendidos los avisos de los especialistas. */
export async function notifyValidated(capturaId, validador, perfil, clase) {
  try {
    const { rows } = await query('SELECT autor_id FROM capturas WHERE id = $1', [capturaId]);
    const autorId = rows[0]?.autor_id;
    if (autorId && autorId !== validador.id) {
      const quien = perfil === 'admin' ? 'El administrador' : 'El especialista';
      await query(
        `INSERT INTO notificaciones (usuario_id, tipo, captura_id, mensaje) VALUES ($1, 'validacion', $2, $3)`,
        [autorId, capturaId, `${quien} ${validador.name} validó tu captura N.º ${capturaId}: ${CLASS_NAMES[clase] ?? clase}.`],
      );
    }
    await query("UPDATE notificaciones SET leida = TRUE WHERE captura_id = $1 AND tipo = 'caso_revisar' AND NOT leida", [capturaId]);
  } catch (err) {
    log('notificacion_error', { error: err.message });
  }
}
