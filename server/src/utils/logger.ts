/**
 * Logging utility using Winston
 * Provides structured logging with different levels and formats
 */

import winston from 'winston';
import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);

/**
 * Custom log format for development
 * Includes timestamp, level, and message with colors
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

/**
 * Custom log format for production
 * JSON format for better parsing and analysis
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Creates Winston logger instance with appropriate configuration
 * @param logLevel Log level (default: 'info')
 * @param logFile Log file path (optional)
 * @returns Configured Winston logger
 */
const createLogger = (logLevel = 'info', logFile?: string): winston.Logger => {
  const isProduction = process.env['NODE_ENV'] === 'production';
  
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: isProduction ? productionFormat : developmentFormat
    })
  ];

  // Add file transport if log file is specified
  if (logFile) {
    const logDir = path.dirname(path.resolve(logFile));
    
    transports.push(
      new winston.transports.File({
        filename: path.resolve(logFile),
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );

    // Add error-specific log file
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }

  return winston.createLogger({
    level: logLevel,
    format: isProduction ? productionFormat : developmentFormat,
    transports,
    exitOnError: false
  });
};

// Create logger instance
export const logger = createLogger(
  process.env['LOG_LEVEL'] || 'info',
  process.env['LOG_FILE']
);

/**
 * Express middleware for request logging
 * Logs HTTP requests with method, URL, status code, and response time
 */
export const requestLogger = (req: any, res: any, next: any): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    logger.info('HTTP Request', {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

/**
 * Error logging helper
 * Logs errors with stack trace and additional context
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

/**
 * Audit logging helper
 * Logs user actions for compliance and security
 */
export const logAudit = (
  userId: string,
  action: string,
  resource: string,
  details?: Record<string, any>
): void => {
  logger.info('Audit Log', {
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    ...details
  });
};