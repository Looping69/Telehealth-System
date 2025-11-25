import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
dotenv.config();
const getEnvVar = (envVar, defaultValue) => {
    const value = process.env[envVar] || defaultValue;
    if (!value) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
    return value;
};
export const config = {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '3000'), 10),
    apiVersion: getEnvVar('API_VERSION', 'v1'),
    jwt: {
        secret: getEnvVar('JWT_SECRET'),
        refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
        expiresIn: getEnvVar('JWT_EXPIRES_IN', '1h'),
        refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d')
    },
    medplum: {
        baseUrl: getEnvVar('MEDPLUM_BASE_URL', 'https://api.medplum.com'),
        clientId: process.env['MEDPLUM_CLIENT_ID'] || '',
        clientSecret: process.env['MEDPLUM_CLIENT_SECRET'] || '',
        token: process.env['MEDPLUM_TOKEN'] || '',
        useMock: getEnvVar('MEDPLUM_USE_MOCK', 'false') === 'true'
    },
    email: {
        host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(getEnvVar('SMTP_PORT', '587'), 10),
        user: process.env['SMTP_USER'] || '',
        password: process.env['SMTP_PASS'] || '',
        from: getEnvVar('FROM_EMAIL', 'noreply@telehealth.com')
    },
    upload: {
        dir: getEnvVar('UPLOAD_DIR', 'uploads'),
        maxSize: parseInt(getEnvVar('MAX_FILE_SIZE', '10485760'), 10),
        allowedTypes: getEnvVar('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,pdf,doc,docx').split(',')
    },
    stripe: {
        secretKey: process.env['STRIPE_SECRET_KEY'] || '',
        webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || ''
    },
    security: {
        bcryptRounds: parseInt(getEnvVar('BCRYPT_ROUNDS', '12'), 10),
        rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
        rateLimitMaxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10)
    },
    logging: {
        level: getEnvVar('LOG_LEVEL', 'info'),
        file: getEnvVar('LOG_FILE', 'logs/app.log')
    },
    cors: {
        origin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
        credentials: getEnvVar('CORS_CREDENTIALS', 'true') === 'true'
    }
};
export const validateConfig = () => {
    const requiredConfigs = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];
    const missingConfigs = requiredConfigs.filter(configKey => !process.env[configKey]);
    if (missingConfigs.length > 0) {
        logger.error(`Missing required configuration: ${missingConfigs.join(', ')}`);
        process.exit(1);
    }
    logger.info('Configuration validated successfully');
};
//# sourceMappingURL=index.js.map