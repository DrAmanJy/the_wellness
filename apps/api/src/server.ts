import { env } from '@wellness/config';
import { pool } from '@wellness/db';

import { app } from './app';
import { logger } from './lib/logger';

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    logger.info('Connected to PostgreSQL');

    const server = app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${String(env.PORT)}`);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      server.close((err) => {
        void (async () => {
          if (err) {
            logger.error({ err }, 'Error closing HTTP server');
          } else {
            logger.info('HTTP server closed.');
          }

          try {
            await pool.end();
            logger.info('PostgreSQL connection pool closed.');
            process.exit(0);
          } catch (dbErr) {
            logger.error({ err: dbErr }, 'Error closing PostgreSQL connection pool');
            process.exit(1);
          }
        })();
      });

      // Force shutdown if it takes too long (10s)
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => {
      shutdown('SIGTERM');
    });
    process.on('SIGINT', () => {
      shutdown('SIGINT');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

void startServer();
