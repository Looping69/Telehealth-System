import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/error.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
const router = Router();
router.get('/login', asyncHandler(async (_req, res) => {
    try {
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
    }
    catch (error) {
        logger.error('OAuth initiation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate OAuth flow'
        });
    }
}));
router.post('/callback', [
    body('code')
        .notEmpty()
        .withMessage('Authorization code is required'),
    body('state')
        .notEmpty()
        .withMessage('State parameter is required')
], asyncHandler(async (req, res) => {
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
        void code;
        void state;
        logger.info('Processing OAuth callback');
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
    }
    catch (error) {
        logger.error('OAuth callback processing failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}));
router.post('/refresh', [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
], asyncHandler(async (req, res) => {
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
        void refreshToken;
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
    }
    catch (error) {
        logger.error('Token refresh failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
}));
router.post('/logout', optionalAuth, asyncHandler(async (_req, res) => {
    try {
        logger.info('User logged out');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger.error('Logout failed:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
}));
router.get('/me', authenticate, asyncHandler(async (req, res) => {
    try {
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
    }
    catch (error) {
        logger.error('Failed to get user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user profile'
        });
    }
}));
router.get('/validate', authenticate, asyncHandler(async (req, res) => {
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
    }
    catch (error) {
        logger.error('Token validation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Token validation failed'
        });
    }
}));
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
export default router;
//# sourceMappingURL=auth.js.map