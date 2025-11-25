/**
 * OAuth Authentication Store
 * Purpose: Manages OAuth 2.0 authentication flow with Medplum
 * Inputs: OAuth configuration from environment variables
 * Outputs: Authentication state, tokens, and user profile
 */

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
  initializeFromStorage: () => void;
  clearError: () => void;
}

// Helper function to generate random state for CSRF protection
const generateState = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Helper function to validate token expiry
const isTokenExpired = (expiry: number): boolean => {
  return Date.now() >= expiry - 60000; // Refresh 1 minute before expiry
};

export const useOAuthAuthStore = create<OAuthAuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,

  /**
   * Clear authentication error
   * Purpose: Reset error state
   * Inputs: none
   * Outputs: Clears error from state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Initialize authentication state from localStorage
   * Purpose: Restore user session on app startup
   * Inputs: none
   * Outputs: Populates store with stored authentication state
   */
  initializeFromStorage: () => {
    try {
      const storedUser = localStorage.getItem('telehealth_user');
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedTokenExpiry = localStorage.getItem('token_expiry');

      if (storedUser && storedAccessToken && storedTokenExpiry) {
        const tokenExpiry = parseInt(storedTokenExpiry, 10);

        // Check if token is still valid
        if (!isTokenExpired(tokenExpiry)) {
          const user = JSON.parse(storedUser);
          set({
            user,
            isAuthenticated: true,
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            tokenExpiry,
            error: null
          });
          console.log('Restored user session:', user.name);
        } else {
          // Token expired, clear storage
          localStorage.removeItem('telehealth_user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
        }
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
      // Clear potentially corrupted storage
      localStorage.removeItem('telehealth_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
    }
  },

  /**
   * Initiate OAuth flow with Medplum
   * Purpose: Redirect user to Medplum authorization endpoint
   * Inputs: none
   * Outputs: Redirects browser to OAuth authorization URL
   */
  initiateOAuth: async () => {
    try {
      set({ isLoading: true, error: null });

      // Generate state for CSRF protection
      const state = generateState();
      sessionStorage.setItem('oauth_state', state);

      // Build authorization URL
      const clientId = import.meta.env.VITE_MEDPLUM_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_MEDPLUM_REDIRECT_URI || 'http://localhost:5173/auth/callback';
      const scope = 'openid profile email';
      const baseUrl = import.meta.env.VITE_MEDPLUM_BASE_URL || 'https://api.medplum.com';

      if (!clientId) {
        throw new Error('Medplum client ID not configured');
      }

      const authUrl = new URL('/oauth2/authorize', baseUrl);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('state', state);

      console.log('Initiating OAuth flow with URL:', authUrl.toString());

      // Redirect to authorization endpoint
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth flow',
        isLoading: false
      });
    }
  },

  /**
   * Handle OAuth callback and exchange code for tokens
   * Purpose: Process authorization code from Medplum callback
   * Inputs: authorization code and state from callback URL
   * Outputs: Stores tokens and user profile, sets authenticated state
   */
  handleOAuthCallback: async (code: string, state: string) => {
    set({ isLoading: true, error: null });

    try {
      // Validate state for CSRF protection
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }
      sessionStorage.removeItem('oauth_state');

      // Exchange code for tokens via backend
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const { accessToken, refreshToken, expiresIn, user, mockMode } = data.data;
        const tokenExpiry = Date.now() + (expiresIn * 1000);

        // Validate required data
        if (!accessToken) {
          throw new Error('Invalid response from authentication server');
        }

        // Store tokens securely
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('token_expiry', tokenExpiry.toString());

        // Handle user data - use provided user or create from token
        let userData = user;
        if (!userData && accessToken) {
          // Fallback: decode JWT to get basic user info
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            userData = {
              id: payload.userId || 'unknown',
              email: payload.email || 'user@telehealth.com',
              name: 'OAuth User',
              role: 'provider',
              resourceType: 'Practitioner'
            };
          } catch {
            userData = {
              id: 'oauth-user',
              email: 'user@telehealth.com',
              name: 'OAuth User',
              role: 'provider',
              resourceType: 'Practitioner'
            };
          }
        }

        if (userData) {
          localStorage.setItem('telehealth_user', JSON.stringify(userData));
        }

        set({
          user: userData,
          isAuthenticated: true,
          accessToken,
          refreshToken,
          tokenExpiry,
          isLoading: false,
          error: null
        });

        console.log(`OAuth authentication successful for user: ${userData?.name || 'Unknown'}${mockMode ? ' (mock mode)' : ''}`);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('OAuth callback processing failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false
      });
      throw error; // Re-throw for component handling
    }
  },

  /**
   * Refresh access token
   * Purpose: Get new access token using refresh token
   * Inputs: none (uses stored refresh token)
   * Outputs: Updates access token and expiry
   */
  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const { accessToken, expiresIn, mockMode } = data.data;
        const tokenExpiry = Date.now() + (expiresIn * 1000);

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('token_expiry', tokenExpiry.toString());

        set({ accessToken, tokenExpiry });

        console.log(`Token refreshed successfully${mockMode ? ' (mock mode)' : ''}`);
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
    }
  },

  /**
   * Check if current token is expired and refresh if needed
   * Purpose: Proactive token management
   * Inputs: none
   * Outputs: boolean indicating if token was refreshed
   */
  checkTokenExpiry: () => {
    const { tokenExpiry, refreshAccessToken } = get();
    if (!tokenExpiry) return false;

    if (isTokenExpired(tokenExpiry)) {
      refreshAccessToken();
      return true;
    }
    return false;
  },

  /**
   * Log out user and clear all authentication data
   * Purpose: Clean termination of authentication session
   * Inputs: none
   * Outputs: Clears all authentication state and storage
   */
  logout: () => {
    console.log('Logging out user...');

    // Notify backend of logout
    const { accessToken } = get();
    if (accessToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error('Logout notification failed:', error);
      });
    }

    // Clear tokens from storage
    localStorage.removeItem('telehealth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem('oauth_state');

    // Clear state
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      error: null,
      isLoading: false
    });

    console.log('User logged out successfully');
  }
}));

// Set up automatic token refresh
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Check token expiry every 30 seconds
  refreshInterval = setInterval(() => {
    const { checkTokenExpiry } = useOAuthAuthStore.getState();
    checkTokenExpiry();
  }, 30000);

  console.log('Started automatic token refresh');
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Stopped automatic token refresh');
  }
};

// Initialize on module load
export const initializeOAuthAuth = () => {
  const store = useOAuthAuthStore.getState();
  store.initializeFromStorage();
  startTokenRefresh();

  console.log('OAuth authentication initialized');
};