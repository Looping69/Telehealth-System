/**
 * Error handling middleware
 * Centralized error handling for the application
 */

import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * Custom error class for application errors
 * Extends Error with additional properties for better error handling
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Global error handler
 * Handles all errors in the application
 */
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let err = { ...error };
  err.message = error.message;

  // Log error
  logError(error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Resource not found';
    err = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((val: any) => val.message).join(', ');
    err = new AppError(message, 400);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    err = new AppError(message, 401);
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    err = new AppError(message, 401);
  }

  // PostgreSQL errors
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

  // Send error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse: any = {
    success: false,
    error: message
  };

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  // Include error code if available
  if (err.code) {
    errorResponse.code = err.code;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Validation error helper
 * Creates standardized validation error responses
 */
export const createValidationError = (errors: Record<string, string>): AppError => {
  const message = Object.entries(errors)
    .map(([field, error]) => `${field}: ${error}`)
    .join(', ');
  
  const error = new AppError(`Validation failed: ${message}`, 400);
  (error as any).errors = errors;
  return error;
};

/**
 * Authorization error helper
 * Creates standardized authorization error responses
 */
export const createAuthError = (message: string = 'Not authorized'): AppError => {
  return new AppError(message, 401);
};

/**
 * Forbidden error helper
 * Creates standardized forbidden error responses
 */
export const createForbiddenError = (message: string = 'Access forbidden'): AppError => {
  return new AppError(message, 403);
};

/**
 * Not found error helper
 * Creates standardized not found error responses
 */
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404);
};