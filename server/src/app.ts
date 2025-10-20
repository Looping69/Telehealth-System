/**
 * Express application setup
 * Configures middleware, routes, and error handling
 */

import express from 'express';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors.js';
import { securityHeaders, rateLimiter, sanitizeInput } from './middleware/security.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, globalErrorHandler } from './middleware/error.js';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';

/**
 * Creates and configures Express application
 * @returns Configured Express app instance
 */
export const createApp = (): express.Application => {
  const app = express();

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Security middleware
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(rateLimiter);
  app.use(sanitizeInput);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Request logging
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env['npm_package_version'] || '1.0.0'
    });
  });

  // API routes
  app.use('/api', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(globalErrorHandler);

  return app;
};