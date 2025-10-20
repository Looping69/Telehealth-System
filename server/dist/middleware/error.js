import { logError } from '../utils/logger.js';
import { config } from '../config/index.js';
export class AppError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
export const notFoundHandler = (req, _res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
export const globalErrorHandler = (error, req, res, _next) => {
    let err = { ...error };
    err.message = error.message;
    logError(error, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
    });
    if (error.name === 'CastError') {
        const message = 'Resource not found';
        err = new AppError(message, 404);
    }
    if (error.code === 11000) {
        const message = 'Duplicate field value entered';
        err = new AppError(message, 400);
    }
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((val) => val.message).join(', ');
        err = new AppError(message, 400);
    }
    if (error.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again';
        err = new AppError(message, 401);
    }
    if (error.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again';
        err = new AppError(message, 401);
    }
    if (error.code === '23505') {
        const message = 'Duplicate field value entered';
        err = new AppError(message, 400);
    }
    if (error.code === '23503') {
        const message = 'Referenced resource not found';
        err = new AppError(message, 400);
    }
    if (error.code === '23502') {
        const message = 'Required field is missing';
        err = new AppError(message, 400);
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errorResponse = {
        success: false,
        error: message
    };
    if (config.nodeEnv === 'development') {
        errorResponse.stack = error.stack;
    }
    if (err.code) {
        errorResponse.code = err.code;
    }
    res.status(statusCode).json(errorResponse);
};
export const createValidationError = (errors) => {
    const message = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join(', ');
    const error = new AppError(`Validation failed: ${message}`, 400);
    error.errors = errors;
    return error;
};
export const createAuthError = (message = 'Not authorized') => {
    return new AppError(message, 401);
};
export const createForbiddenError = (message = 'Access forbidden') => {
    return new AppError(message, 403);
};
export const createNotFoundError = (resource = 'Resource') => {
    return new AppError(`${resource} not found`, 404);
};
//# sourceMappingURL=error.js.map