import { createApp } from './app.js';
import { config, validateConfig } from './config/index.js';
import { logger } from './utils/logger.js';
const startServer = async () => {
    try {
        validateConfig();
        logger.info('Configuration validated successfully');
        logger.info('Using Medplum hosted database service');
        const app = createApp();
        const server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
            logger.info(`Health check available at http://localhost:${config.port}/health`);
        });
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}, starting graceful shutdown...`);
            server.close(async () => {
                logger.info('HTTP server closed');
                logger.info('Graceful shutdown completed');
                process.exit(0);
            });
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map