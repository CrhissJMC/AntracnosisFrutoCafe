import pg from 'pg';
import { config } from '../config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // Un cliente inactivo perdió la conexión; el pool crea otro en la siguiente consulta.
  console.error(JSON.stringify({ level: 'error', msg: 'pg_pool_error', error: err.message }));
});

export function query(text, params) {
  return pool.query(text, params);
}

/** Ejecuta `fn(client)` dentro de una transacción. */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
