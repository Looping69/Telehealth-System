/\*\*

* Enhanced OAuth Authentication Routes for Medplum Integration

* Purpose: Implements full OAuth 2.0 flow with Medplum including token exchange and user profile retrieval

* Inputs: OAuth authorization code, refresh tokens

* Outputs: Access tokens, user profiles, and secure session management
  \*/

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/error.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import crypto from 'crypto';

const router = Router();

/\*\*

* Store for OAuth state validation

* Purpose: Prevents CSRF attacks by validating state parameter
  \*/
  const stateStore = new Map\<string, { timestamp: number }>();

/\*\*

* Clean up expired states every 5 minutes
  \*/
  setInterval(() => {
  const now = Date.now();
  for (const \[state, data] of stateStore.entries()) {
  if (now - data.timestamp > 10 \* 60 \* 1000) { // 10 minutes
  stateStore.delete(state);
  }
  }
  }, 5 \* 60 \* 1000);

/\*\*

* Initiate Medplum OAuth flow

* GET /api/auth/login

* Purpose: Generate OAuth authorization URL with proper state and PKCE

* Outputs: Authorization URL for frontend redirect
  \*/
  router.get('/login', asyncHandler(async (\_req: Request, res: Response) => {
  try {
  // Generate state for CSRF protection
  const state = generateRandomState();
  stateStore.set(state, { timestamp: Date.now() });

  // Construct Medplum OAuth URL with proper parameters
  const authUrl = new URL('/oauth2/authorize', config.medplum.baseUrl);
  authUrl.searchParams.set('response\_type', 'code');
  authUrl.searchParams.set('client\_id', config.medplum.clientId);
  authUrl.searchParams.set('redirect\_uri', config.medplum.redirectUri);
  authUrl.searchParams.set('scope', 'openid profile user/*.*');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('aud', config.medplum.baseUrl);

  logger.info('Initiating Medplum OAuth flow', { state });

  res.json({
  success: true,
  message: 'OAuth flow initiated',
  data: {
  authUrl: authUrl.toString(),
  state
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

/\*\*

* Handle OAuth callback and exchange code for token

* POST /api/auth/callback

* Purpose: Exchange authorization code for access token and retrieve user profile

* Inputs: Authorization code and state from OAuth callback

* Outputs: Access token, refresh token, and user profile data
  \*/
  router.post('/callback', \[
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

```
// Validate state parameter for CSRF protection
if (!stateStore.has(state)) {
  logger.warn('Invalid or expired state parameter', { state });
  return res.status(400).json({
    success: false,
    message: 'Invalid or expired state parameter'
  });
}
stateStore.delete(state);

logger.info('Processing OAuth callback', { state });

// Exchange authorization code for access token
const tokenResponse = await exchangeCodeForToken(code);

if (!tokenResponse.success) {
  return res.status(400).json({
   
```

