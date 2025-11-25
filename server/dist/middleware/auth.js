import { createAuthError, createForbiddenError } from './error.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
export const authenticate = async (req, _res, next) => {
    try {
        if (config.medplum.useMock || !config.medplum.clientId || !config.medplum.clientSecret) {
            req.user = {
                id: 'mock-user-id',
                email: 'dev@example.com',
                role: 'patient',
                resourceType: 'Patient',
                resourceId: 'mock-pt-001'
            };
            logger.info('Dev-mode auth bypass enabled (mock FHIR).');
            next();
            return;
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createAuthError('Bearer token is required');
        }
        const token = authHeader.substring(7);
        if (!token || token.length < 10) {
            throw createAuthError('Invalid access token');
        }
        req.user = {
            id: 'medplum-user-id',
            email: 'user@example.com',
            role: 'patient',
            resourceType: 'Patient',
            resourceId: 'patient-resource-id'
        };
        logger.info(`Medplum user authenticated: ${req.user.email} (${req.user.role})`);
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            next(createAuthError(error.message));
        }
        else {
            next(createAuthError('Authentication failed'));
        }
    }
};
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            await authenticate(req, res, next);
        }
        else {
            next();
        }
    }
    catch (error) {
        next();
    }
};
export const authorize = (...roles) => {
    return (req, __res, next) => {
        if (!req.user) {
            next(createAuthError('Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(createForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`));
            return;
        }
        next();
    };
};
export const authorizeOwnership = (userIdParam = 'userId') => {
    return (req, _res, next) => {
        if (!req.user) {
            next(createAuthError('Authentication required'));
            return;
        }
        const resourceUserId = req.params[userIdParam];
        if (req.user.role === 'admin') {
            next();
            return;
        }
        if (req.user.id !== resourceUserId) {
            next(createForbiddenError('Access denied. You can only access your own resources.'));
            return;
        }
        next();
    };
};
export const authorizePatient = (req, _res, next) => {
    if (!req.user) {
        next(createAuthError('Authentication required'));
        return;
    }
    if (req.user.role !== 'patient' && req.user.role !== 'admin') {
        next(createForbiddenError('Access denied. Patient access required.'));
        return;
    }
    next();
};
export const authorizeProvider = (req, _res, next) => {
    if (!req.user) {
        next(createAuthError('Authentication required'));
        return;
    }
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        next(createForbiddenError('Access denied. Provider access required.'));
        return;
    }
    next();
};
export const authorizeAdmin = authorize('admin');
//# sourceMappingURL=auth.js.map