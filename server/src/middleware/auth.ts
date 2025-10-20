/**
 * Authentication middleware for Medplum integration
 * Handles Medplum token verification and user context
 */

import { Request, Response, NextFunction } from 'express';
import { createAuthError, createForbiddenError } from './error.js';
import { logger } from '../utils/logger.js';
// import { config } from '../config/index.js';

// Extend Request interface to include Medplum user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        resourceType: string;
        resourceId: string;
      };
    }
  }
}

/**
 * Medplum authentication middleware
 * Verifies Medplum access token and attaches user context to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAuthError('Bearer token is required');
    }

    const token = authHeader.substring(7);
    
    // For now, we'll implement a basic token validation
    // In a full implementation, you would validate against Medplum's token endpoint
    if (!token || token.length < 10) {
      throw createAuthError('Invalid access token');
    }

    // Mock user context - in production, this would come from Medplum token validation
    req.user = {
      id: 'medplum-user-id',
      email: 'user@example.com',
      role: 'patient',
      resourceType: 'Patient',
      resourceId: 'patient-resource-id'
    };

    logger.info(`Medplum user authenticated: ${req.user.email} (${req.user.role})`);
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(createAuthError(error.message));
    } else {
      next(createAuthError('Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      await authenticate(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    // For optional auth, we don't fail on auth errors
    next();
  }
};

/**
 * Role-based authorization middleware
 * Requires specific roles to access the endpoint
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, __res: Response, next: NextFunction): void => {
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

/**
 * Resource ownership authorization
 * Ensures user can only access their own resources
 */
export const authorizeOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createAuthError('Authentication required'));
      return;
    }

    const resourceUserId = req.params[userIdParam];
    
    if (req.user.role === 'admin') {
      // Admins can access any resource
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

/**
 * Patient-specific authorization
 */
export const authorizePatient = (req: Request, _res: Response, next: NextFunction): void => {
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

/**
 * Provider-specific authorization
 */
export const authorizeProvider = (req: Request, _res: Response, next: NextFunction): void => {
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

/**
 * Admin-only authorization
 */
export const authorizeAdmin = authorize('admin');