import { Router } from 'express';
import { pool } from '@wellness/db';

const router = Router();

// Lightweight health check (no DB dependency)
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
    },
  });
});

// Heavyweight health check (checks DB and other dependencies)
router.get('/ready', async (req, res) => {
  try {
    // Check PostgreSQL
    await pool.query('SELECT 1');

    res.json({
      success: true,
      data: {
        status: 'ready',
        dependencies: {
          database: 'ok',
          // Add others like razorpay here later
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Health check failed',
      },
    });
  }
});

export default router;
