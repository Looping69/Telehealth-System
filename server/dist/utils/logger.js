import winston from 'winston';
import path from 'path';
const developmentFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    return log;
}));
const productionFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
const createLogger = (logLevel = 'info', logFile) => {
    const isProduction = process.env['NODE_ENV'] === 'production';
    const transports = [
        new winston.transports.Console({
            format: isProduction ? productionFormat : developmentFormat
        })
    ];
    if (logFile) {
        const logDir = path.dirname(path.resolve(logFile));
        transports.push(new winston.transports.File({
            filename: path.resolve(logFile),
            format: productionFormat,
            maxsize: 5242880,
            maxFiles: 5
        }));
        transports.push(new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: productionFormat,
            maxsize: 5242880,
            maxFiles: 5
        }));
    }
    return winston.createLogger({
        level: logLevel,
        format: isProduction ? productionFormat : developmentFormat,
        transports,
        exitOnError: false
    });
};
export const logger = createLogger(process.env['LOG_LEVEL'] || 'info', process.env['LOG_FILE']);
export const requestLogger = (req, res, next) => {
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
export const logError = (error, context) => {
    logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        ...context
    });
};
export const logAudit = (userId, action, resource, details) => {
    logger.info('Audit Log', {
        userId,
        action,
        resource,
        timestamp: new Date().toISOString(),
        ...details
    });
};
//# sourceMappingURL=logger.js.map