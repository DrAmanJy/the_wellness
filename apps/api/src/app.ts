import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import pinoHttp from 'pino-http';

import { auth } from '@wellness/auth';
import { env } from '@wellness/config';

import { logger } from './lib/logger';
import { requestId } from './lib/request-id';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { globalRateLimiter } from './middleware/rate-limit.middleware';
import healthRoutes from './routes/health.routes';

export const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(globalRateLimiter);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(hpp()); // HTTP Parameter Pollution protection

// Request ID & Logging
app.use(requestId);
app.use(
  pinoHttp({
    logger,
    customProps: (req, res) => ({
      requestId: req.id,
    }),
  }),
);

import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';

// Routes
app.use('/api/auth', toNodeHandler(auth.handler));
app.use('/health', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);
