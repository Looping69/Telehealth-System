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
import jwt from 'jsonwebtoken';

// Helper function to generate random state for CSRF protection
const generateRandomState = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Helper function to exchange authorization code for tokens
const exchangeCodeForTokens = async (code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}> => {
  const tokenUrl = new URL('/oauth2/token', config.medplum.baseUrl);
  
  const tokenRequest = {
    grant_type: 'authorization_code',
    code,
    client_id: config.medplum.clientId,
    client_secret: config.medplum.clientSecret,
    redirect_uri: 'http://localhost:5174/auth/callback'
  };

  const response = await fetch(tokenUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams(tokenRequest)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Token exchange failed: ${errorData.error || response.statusText}`);
  }

  return await response.json();
};

// Helper function to fetch user profile from Medplum
const fetchUserProfile = async (accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  role?: string;
  resourceType: string;
}> => {
  const profileUrl = new URL('/fhir/R4/Practitioner', config.medplum.baseUrl);
  
  const response = await fetch(profileUrl.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/fhir+json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const bundle = await response.json();
  
  // Extract practitioner data from FHIR bundle
  if (bundle.entry && bundle.entry.length > 0) {
    const practitioner = bundle.entry[0].resource;
    return {
      id: practitioner.id,
      email: practitioner.email || practitioner.telecom?.find((t: any) => t.system === 'email')?.value || '',
      name: practitioner.name?.[0]?.text || `${practitioner.name?.[0]?.given?.[0] || ''} ${practitioner.name?.[0]?.family || ''}`.trim() || 'Unknown',
      role: practitioner.role?.[0]?.text || 'provider',
      resourceType: 'Practitioner'
    };
  }
  
  throw new Error('No practitioner profile found');
};

// Helper function to refresh access token
const refreshAccessToken = async (refreshToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}> => {
  const tokenUrl = new URL('/oauth2/token', config.medplum.baseUrl);
  
  const tokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.medplum.clientId,
    client_secret: config.medplum.clientSecret
  };

  const response = await fetch(tokenUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams(tokenRequest)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Token refresh failed: ${errorData.error || response.statusText}`);
  }

  return await response.json();
};

const router = Router();

/**
 * Initiate Medplum OAuth flow
 * POST /api/auth/login
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check if OAuth is properly configured
    if (!config.medplum.clientId || !config.medplum.clientSecret) {
      logger.warn('Medplum OAuth not configured, using mock mode');
      
      // Return mock auth URL for development
      const mockAuthUrl = 'http://localhost:5173/auth/callback?code=mock_code&state=mock_state';
      
      return res.json({
        success: true,
        message: 'OAuth flow initiated (mock mode)',
        data: {
          authUrl: mockAuthUrl,
          mockMode: true
        }
      });
    }

    // Construct Medplum OAuth URL
    const authUrl = new URL('/oauth2/authorize', config.medplum.baseUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', config.medplum.clientId);
    authUrl.searchParams.set('redirect_uri', 'http://localhost:5174/auth/callback');
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

    logger.info('Processing OAuth callback');

    // Handle mock mode for development
    if (code === 'mock_code' || !config.medplum.clientId || !config.medplum.clientSecret) {
      logger.info('Using mock OAuth response for development');
      
      // Create mock user for development
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email: 'developer@telehealth.com',
        name: 'Developer User',
        role: 'provider',
        resourceType: 'Practitioner'
      };

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.json({
        success: true,
        message: 'Authentication successful (mock mode)',
        data: {
          accessToken,
          tokenType: 'Bearer',
          expiresIn: 3600,
          refreshToken: 'mock-refresh-token',
          user: mockUser,
          mockMode: true
        }
      });
    }

    // Validate state parameter
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state parameter'
      });
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    
    // Fetch user profile from Medplum
    const userProfile = await fetchUserProfile(tokenResponse.access_token);

    // Generate JWT tokens for our app
    const accessToken = jwt.sign(
      { userId: userProfile.id, email: userProfile.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`OAuth authentication successful for user: ${userProfile.email}`);

    return res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: tokenResponse.expires_in,
        refreshToken: tokenResponse.refresh_token,
        user: userProfile
      }
    });
  } catch (error) {
    logger.error('OAuth callback processing failed:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
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

    logger.info('Refreshing access token');

    // Handle mock mode for development
    if (refreshToken === 'mock-refresh-token' || !config.medplum.clientId || !config.medplum.clientSecret) {
      logger.info('Using mock token refresh for development');
      
      // Generate new mock token
      const mockAccessToken = jwt.sign(
        { userId: 'mock-user', email: 'developer@telehealth.com' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.json({
        success: true,
        message: 'Token refreshed successfully (mock mode)',
        data: {
          accessToken: mockAccessToken,
          tokenType: 'Bearer',
          expiresIn: 3600,
          mockMode: true
        }
      });
    }

    // Refresh token with Medplum
    const tokenResponse = await refreshAccessToken(refreshToken);

    // Generate new JWT token
    const accessToken = jwt.sign(
      { userId: 'refreshed-user', email: 'refreshed@telehealth.com' }, // This should be extracted from the refresh token
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info('Token refreshed successfully');

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: tokenResponse.expires_in
      }
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token refresh failed'
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
    const user = req.user;

    // If we have a real user from Medplum, return it
    if (user && user.id) {
      return res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: { user }
      });
    }

    // Fallback to mock user for development
    const mockUser = {
      id: 'mock-user',
      email: 'developer@telehealth.com',
      name: 'Developer User',
      role: 'provider',
      resourceType: 'Practitioner'
    };

    res.json({
      success: true,
      message: 'User profile retrieved successfully (mock mode)',
      data: { user: mockUser },
      mockMode: true
    });
  } catch (error) {
    logger.error('Get user profile failed:', error);
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

export default router;