# Full OAuth Flow Implementation for Medplum Authentication

## Overview
This document outlines the complete implementation of OAuth 2.0 flow for authenticating with Medplum in the Telehealth System. The implementation includes frontend OAuth handling, backend token management, and session persistence.

## Current State Analysis

### Existing Authentication
- **Frontend**: Currently uses mock authentication with hardcoded demo users
- **Backend**: Has OAuth routes but returns mock tokens instead of real Medplum tokens
- **Configuration**: Medplum credentials are configured but not actively used

### Required OAuth Components
1. **OAuth Login Button** - Redirects to Medplum authorization endpoint
2. **Callback Handler** - Processes authorization code and exchanges for tokens
3. **Token Management** - Stores and refreshes access tokens
4. **Session Persistence** - Maintains authentication state across page reloads
5. **Error Handling** - Graceful handling of OAuth errors

## Implementation Steps

### 1. Update Frontend Authentication Store

Create a new authentication store that supports OAuth flow:

**File**: `src/store/oauthAuthStore.ts`

```typescript
import { create } from 'zustand';
import { User, AuthState } from '../types';

interface OAuthAuthStore extends AuthState {
  // OAuth-specific state
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  
  // Actions
  initiateOAuth: () => Promise<void>;
  handleOAuthCallback: (code: string, state: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  logout: () => void;
  checkTokenExpiry: () => boolean;
}

export const useOAuthAuthStore = create<OAuthAuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,

  initiateOAuth: async () => {
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        throw new Error('Failed to initiate OAuth flow');
      }
    } catch (error) {
      set({ error: 'Failed to connect to authentication service' });
    }
  },

  handleOAuthCallback: async (code: string, state: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { accessToken, refreshToken, expiresIn } = data.data;
        const tokenExpiry = Date.now() + (expiresIn * 1000);
        
        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('token_expiry', tokenExpiry.toString());
        
        // Get user profile
        const userResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const userData = await userResponse.json();
        
        if (userData.success) {
          set({
            user: userData.data.user,
            isAuthenticated: true,
            accessToken,
            refreshToken,
            tokenExpiry,
            isLoading: false,
            error: null
          });
        }
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false
      });
    }
  },

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { accessToken, expiresIn } = data.data;
        const tokenExpiry = Date.now() + (expiresIn * 1000);
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('token_expiry', tokenExpiry.toString());
        
        set({ accessToken, tokenExpiry });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
    }
  },

  logout: () => {
    // Clear tokens from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    
    // Clear state
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      error: null
    });
    
    // Notify backend
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
  },

  checkTokenExpiry: () => {
    const { tokenExpiry, refreshAccessToken } = get();
    if (!tokenExpiry) return false;
    
    const isExpired = Date.now() >= tokenExpiry - 60000; // Refresh 1 minute before expiry
    if (isExpired) {
      refreshAccessToken();
      return true;
    }
    return false;
  }
}));
```

### 2. Create OAuth Callback Component

**File**: `src/components/auth/OAuthCallback.tsx`

```typescript
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Loader, Center, Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useOAuthAuthStore } from '../../store/oauthAuthStore';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback, isLoading, error } = useOAuthAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('OAuth error:', error, errorDescription);
        navigate('/login', { 
          replace: true,
          state: { error: errorDescription || 'Authentication failed' }
        });
        return;
      }

      if (!code || !state) {
        navigate('/login', { 
          replace: true,
          state: { error: 'Invalid callback parameters' }
        });
        return;
      }

      try {
        await handleOAuthCallback(code, state);
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback processing failed:', err);
        navigate('/login', { 
          replace: true,
          state: { error: 'Failed to complete authentication' }
        });
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  if (error) {
    return (
      <Container size={420} my={40}>
        <Alert icon={<IconAlertCircle size="1rem" />} title="Authentication Failed" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Center>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Completing authentication...</Text>
        </Stack>
      </Center>
    </Container>
  );
};

export default OAuthCallback;
```

### 3. Update Login Page with OAuth Button

**File**: Update `src/components/auth/LoginPage.tsx`

Add OAuth login section:

```typescript
// Add to imports
import { IconBrandOauth } from '@tabler/icons-react';
import { useOAuthAuthStore } from '../../store/oauthAuthStore';

// Add OAuth login function
const handleOAuthLogin = async () => {
  try {
    await useOAuthAuthStore.getState().initiateOAuth();
  } catch (error) {
    console.error('OAuth login failed:', error);
  }
};

// Add OAuth login section in the form (before demo credentials)
<Button
  variant="outline"
  leftSection={<IconBrandOauth size="1rem" />}
  onClick={handleOAuthLogin}
  disabled={isLoading}
  fullWidth
>
  Sign in with Medplum
</Button>

<Divider label="OR" labelPosition="center" />
```

### 4. Update Backend OAuth Implementation

**File**: Update `server/src/routes/auth.ts`

Replace mock token generation with real Medplum API calls:

```typescript
import { MedplumClient } from '@medplum/core';

// Add Medplum client initialization
const medplumClient = new MedplumClient({
  baseUrl: config.medplum.baseUrl,
  clientId: config.medplum.clientId,
  clientSecret: config.medplum.clientSecret,
});

// Update callback handler
router.post('/callback', [
  body('code').notEmpty().withMessage('Authorization code is required'),
  body('state').notEmpty().withMessage('State parameter is required')
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

    // Exchange authorization code for access token
    const tokenResponse = await medplumClient.startJwtLogin(
      config.medplum.clientId,
      config.medplum.clientSecret,
      code,
      'http://localhost:5173/auth/callback'
    );

    if (!tokenResponse.access_token) {
      throw new Error('No access token received from Medplum');
    }

    // Get user profile from Medplum
    const profile = await medplumClient.get('auth/me', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`
      }
    });

    // Create or update user in database
    const user = await findOrCreateUser(profile);

    // Generate JWT token for our application
    const appToken = generateAppToken(user);

    return res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type,
        expiresIn: tokenResponse.expires_in,
        refreshToken: tokenResponse.refresh_token,
        appToken: appToken,
        user: sanitizeUser(user)
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
```

### 5. Add OAuth Route to App

**File**: Update `src/App.tsx`

Add OAuth callback route:

```typescript
// Add import
import OAuthCallback from './components/auth/OAuthCallback';

// Add route in public routes
<Route path="/auth/callback" element={<OAuthCallback />} />
```

### 6. Update Authentication Middleware

**File**: Update `server/src/middleware/auth.ts`

Add OAuth token validation:

```typescript
import { MedplumClient } from '@medplum/core';

// Add token validation function
const validateOAuthToken = async (token: string): Promise<any> => {
  try {
    const medplumClient = new MedplumClient({
      baseUrl: config.medplum.baseUrl
    });

    const response = await medplumClient.get('auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response;
  } catch (error) {
    throw new Error('Invalid OAuth token');
  }
};

// Update authenticate middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if it's an OAuth token
    if (token.startsWith('medplum-')) {
      const userProfile = await validateOAuthToken(token);
      req.user = userProfile;
    } else {
      // Handle app JWT tokens
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      req.user = decoded.user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 7. Add Token Refresh Logic

**File**: Create `src/utils/tokenRefresh.ts`

```typescript
import { useOAuthAuthStore } from '../store/oauthAuthStore';

let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  const { checkTokenExpiry } = useOAuthAuthStore.getState();
  
  // Check token expiry every 30 seconds
  refreshInterval = setInterval(() => {
    checkTokenExpiry();
  }, 30000);
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Check token on app initialization
export const initializeTokenCheck = () => {
  const { checkTokenExpiry } = useOAuthAuthStore.getState();
  checkTokenExpiry();
  startTokenRefresh();
};
```

### 8. Update Environment Configuration

**File**: Update frontend `.env` file

```bash
VITE_MEDPLUM_BASE_URL=https://api.medplum.com
VITE_MEDPLUM_CLIENT_ID=your-client-id
VITE_MEDPLUM_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Testing the OAuth Flow

### 1. Test OAuth Initiation
```bash
# Start backend
cd server && npm run dev

# Start frontend
cd .. && npm run dev

# Navigate to login page
# Click "Sign in with Medplum" button
# Should redirect to Medplum authorization page
```

### 2. Test OAuth Callback
```bash
# After authorization, Medplum redirects to /auth/callback?code=...
# Callback component should process the code
# Should redirect to dashboard on success
```

### 3. Test Token Refresh
```bash
# Let token approach expiry (or manually set short expiry)
# Should automatically refresh token
# User should remain logged in
```

### 4. Test Error Handling
```bash
# Test with invalid client credentials
# Test with expired authorization codes
# Test with network failures
```

## Security Considerations

1. **State Parameter Validation**: Implement CSRF protection using state parameter
2. **Token Storage**: Store tokens securely (httpOnly cookies recommended)
3. **Token Expiry**: Implement proper token refresh logic
4. **Scope Limitation**: Request minimal necessary scopes
5. **HTTPS**: Ensure all OAuth flows use HTTPS in production
6. **Client Secret**: Never expose client secret to frontend

## Error Handling

Common OAuth errors and their handling:

1. **access_denied**: User denied authorization - redirect to login with message
2. **invalid_client**: Client configuration error - check client ID/secret
3. **invalid_grant**: Expired or invalid authorization code - re-initiate flow
4. **unsupported_response_type**: Configuration error - check OAuth settings
5. **invalid_scope**: Requested scope not supported - adjust scope parameter

## Monitoring and Logging

Add comprehensive logging for:
- OAuth flow initiation
- Token exchange success/failure
- Token refresh operations
- User authentication events
- Error conditions with context

## Next Steps

1. Implement proper user session management
2. Add role-based access control integration
3. Implement logout functionality that revokes tokens
4. Add user profile synchronization
5. Implement proper error recovery mechanisms
6. Add comprehensive testing suite
7. Implement production-ready security measures