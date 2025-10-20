import express from 'express';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors.js';
import { securityHeaders, rateLimiter, sanitizeInput } from './middleware/security.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, globalErrorHandler } from './middleware/error.js';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
export const createApp = () => {
    const app = express();
    app.set('trust proxy', 1);
    app.use(securityHeaders);
    app.use(corsMiddleware);
    app.use(rateLimiter);
    app.use(sanitizeInput);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(compression());
    app.use(requestLogger);
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: config.nodeEnv,
            version: process.env['npm_package_version'] || '1.0.0'
        });
    });
    app.use('/api', apiRoutes);
    app.use(notFoundHandler);
    app.use(globalErrorHandler);
    return app;
};
//# sourceMappingURL=app.js.map