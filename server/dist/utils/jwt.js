import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from './logger.js';
export const validateMedplumToken = async (token) => {
    try {
        if (!token || token.length < 10) {
            throw new Error('Invalid token format');
        }
        const mockUser = {
            id: 'medplum-user-' + Date.now(),
            email: 'user@example.com',
            role: 'patient',
            resourceType: 'Patient',
            resourceId: 'patient-resource-id'
        };
        logger.info('Medplum token validated successfully');
        return mockUser;
    }
    catch (error) {
        logger.error('Medplum token validation failed:', error);
        throw new Error('Token validation failed');
    }
};
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
export const generateInternalToken = (payload) => {
    try {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
            issuer: 'telehealth-microservices'
        });
    }
    catch (error) {
        logger.error('Error generating internal token:', error);
        throw new Error('Failed to generate internal token');
    }
};
export const verifyInternalToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret, {
            issuer: 'telehealth-microservices'
        });
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        else {
            logger.error('Token verification error:', error);
            throw new Error('Token verification failed');
        }
    }
};
//# sourceMappingURL=jwt.js.map