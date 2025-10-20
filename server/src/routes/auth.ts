/**
 * Authentication routes for Medplum integration
 * Handles Medplum OAuth flow and token management
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/error.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * Initiate Medplum OAuth flow
 * GET /api/auth/login
 */
router.get('/login', asyncHandler(async (_req: Request, res: Response) => {
  try {
    // Construct Medplum OAuth URL
    const authUrl = new URL('/oauth2/authorize', config.medplum.baseUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', config.medplum.clientId);
    authUrl.searchParams.set('redirect_uri', 'http://localhost:5173/auth/callback');
    authUrl.searchParams.set('scope', 'openid profile');
    authUrl.searchParams.set('state', generateRandomState());

    logger.info('Initiating Medplum OAuth flow');

    res.json({
      success: true,
      message: 'OAuth flow initiated',
      data: {
        authUrl: authUrl.toString()
      }
    });
  } catch (error) {
    logger.error('OAuth initiation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate OAuth flow'
    });
  }
}));

/**
 * Handle OAuth callback and exchange code for token
 * POST /api/auth/callback
 */
router.post('/callback', [
  body('code')
    .notEmpty()
    .withMessage('Authorization code is required'),
  body('state')
    .notEmpty()
    .withMessage('State parameter is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { code, state } = req.body;

    // In a full implementation, you would:
    // 1. Validate the state parameter
    // 2. Exchange the code for an access token with Medplum
    // 3. Get user profile from Medplum
    // 4. Create or update user session
    
    // Suppress unused variable warnings
    void code;
    void state;

    logger.info('Processing OAuth callback');

    // Mock response - replace with actual Medplum token exchange
    const mockTokenResponse = {
      access_token: 'medplum-access-token-' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'medplum-refresh-token-' + Date.now(),
      scope: 'openid profile'
    };

    return res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        refreshToken: mockTokenResponse.refresh_token
      }
    });
  } catch (error) {
    logger.error('OAuth callback processing failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}));

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { refreshToken } = req.body;

    // In a full implementation, you would validate the refresh token with Medplum
    logger.info('Refreshing access token');
    
    // Suppress unused variable warning
    void refreshToken;

    // Mock response - replace with actual Medplum token refresh
    const mockTokenResponse = {
      access_token: 'medplum-access-token-refreshed-' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600
    };

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in
      }
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
}));

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', optionalAuth, asyncHandler(async (_req: Request, res: Response) => {
  try {
    // In a full implementation, you would:
    // 1. Revoke the token with Medplum
    // 2. Clear any server-side session data

    logger.info('User logged out');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
}));

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  try {
    // In a full implementation, you would fetch user data from Medplum
    const user = req.user;

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user?.id,
          email: user?.email,
          role: user?.role,
          resourceType: user?.resourceType,
          resourceId: user?.resourceId
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile'
    });
  }
}));

/**
 * Validate token
 * GET /api/auth/validate
 */
router.get('/validate', authenticate, asyncHandler(async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
        user: {
          id: req.user?.id,
          email: req.user?.email,
          role: req.user?.role
        }
      }
    });
  } catch (error) {
    logger.error('Token validation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed'
    });
  }
}));

/**
 * Generate random state for OAuth flow
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default router;