import { config } from './config.js';
import { pool } from './db/pool.js';
import { migrate } from './db/migrate.js';
import { createApp } from './app.js';

async function main() {
  await migrate();
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(JSON.stringify({ level: 'info', msg: 'api_listening', port: config.port }));
  });

  const shutdown = (signal) => {
    console.log(JSON.stringify({ level: 'info', msg: 'shutting_down', signal }));
    server.close(() => pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error(JSON.stringify({ level: 'error', msg: 'startup_failed', error: err.message }));
  process.exit(1);
});
