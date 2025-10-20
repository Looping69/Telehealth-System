/**
 * Server entry point
 * Initializes database, starts Express server, and handles graceful shutdown
 */

import { createApp } from './app.js';
import { config, validateConfig } from './config/index.js';
// Database imports removed - using Medplum hosted service
import { logger } from './utils/logger.js';

/**
 * Starts the server
 * Validates configuration, tests database connection, and starts listening
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated successfully');

    // Database initialization removed - using Medplum hosted service
    logger.info('Using Medplum hosted database service');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // No database connections to close - using Medplum hosted service
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();