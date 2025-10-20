/**
 * JWT utility functions for Medplum integration
 * Handles token validation and user context extraction
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export interface MedplumUser {
  id: string;
  email: string;
  role: 'patient' | 'provider' | 'admin';
  resourceType: string;
  resourceId: string;
}

/**
 * Validates Medplum access token
 * In a full implementation, this would validate against Medplum's token endpoint
 * @param token Medplum access token
 * @returns User context from token
 */
export const validateMedplumToken = async (token: string): Promise<MedplumUser> => {
  try {
    // For now, implement basic validation
    // In production, you would call Medplum's token validation endpoint
    if (!token || token.length < 10) {
      throw new Error('Invalid token format');
    }

    // Mock user context - replace with actual Medplum API call
    const mockUser: MedplumUser = {
      id: 'medplum-user-' + Date.now(),
      email: 'user@example.com',
      role: 'patient',
      resourceType: 'Patient',
      resourceId: 'patient-resource-id'
    };

    logger.info('Medplum token validated successfully');
    return mockUser;
  } catch (error) {
    logger.error('Medplum token validation failed:', error);
    throw new Error('Token validation failed');
  }
};

/**
 * Extracts token from Authorization header
 * @param authHeader Authorization header value
 * @returns Extracted token or null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Generates a simple JWT for internal use (not for Medplum auth)
 * This can be used for session management or internal service communication
 * @param payload Token payload
 * @returns Signed JWT token
 */
export const generateInternalToken = (payload: any): string => {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'telehealth-microservices'
    } as jwt.SignOptions);
  } catch (error) {
    logger.error('Error generating internal token:', error);
    throw new Error('Failed to generate internal token');
  }
};

/**
 * Verifies internal JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload
 */
export const verifyInternalToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'telehealth-microservices'
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      logger.error('Token verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};