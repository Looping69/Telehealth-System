/**
 * Medplum client configuration
 * Initializes and exports the Medplum client for FHIR operations
 */

import { MedplumClient } from '@medplum/core';

export const medplumConfig = {
  // Use localhost for MedplumClient constructor, but proxy will handle the actual requests
  baseUrl: import.meta.env.DEV ? 'http://localhost:5173' : (import.meta.env.VITE_MEDPLUM_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8103'),
  clientId: import.meta.env.VITE_MEDPLUM_CLIENT_ID || 'medplum-client',
  clientSecret: import.meta.env.VITE_MEDPLUM_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_MEDPLUM_REDIRECT_URI || 'http://localhost:5173',
  scope: 'openid profile email',
};

export const createMedplumClient = (): MedplumClient => {
  const client = new MedplumClient(medplumConfig);
  return client;
};

// Default client instance
export const medplumClient = createMedplumClient();

/**
 * Initialize authentication for the Medplum client
 * This should be called when the app starts or when user logs in
 */
export const initializeMedplumAuth = async (): Promise<boolean> => {
  try {
    // Check if we have stored credentials
    const storedToken = localStorage.getItem('medplum_access_token');
    
    if (storedToken) {
      medplumClient.setAccessToken(storedToken);
      
      // Verify the token is still valid by making a test request
      try {
        await medplumClient.get('metadata');
        console.log('Medplum authentication successful with stored token');
        return true;
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('medplum_access_token');
        console.warn('Stored Medplum token is invalid, removed from storage');
      }
    }
    
    // Try OAuth2 client credentials flow for authentication
    try {
      console.log('Attempting OAuth2 client credentials authentication...');
      
      const tokenResponse = await fetch('/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: medplumConfig.clientId,
          client_secret: medplumConfig.clientSecret || '',
          scope: medplumConfig.scope,
        }),
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        if (accessToken) {
          medplumClient.setAccessToken(accessToken);
          localStorage.setItem('medplum_access_token', accessToken);
          console.log('Medplum OAuth2 authentication successful');
          return true;
        }
      } else {
        const errorText = await tokenResponse.text();
        console.warn('OAuth2 authentication failed:', tokenResponse.status, errorText);
      }
    } catch (oauthError) {
      console.warn('OAuth2 authentication error:', oauthError);
    }
    
    // Fallback: Test if we can access FHIR endpoints without authentication (development mode)
    console.log('Trying development mode without authentication...');
    try {
      const response = await fetch(`/fhir/R4/Patient?_summary=count`, {
        method: 'GET',
        headers: {
          'Accept': 'application/fhir+json',
        },
      });
      
      if (response.ok) {
        console.log('Medplum server accessible without authentication (development mode)');
        return true;
      } else {
        console.warn('Medplum server requires authentication');
      }
    } catch (error) {
      console.error('Error testing FHIR endpoint:', error);
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing Medplum authentication:', error);
    return false;
  }
};

/**
 * Enhanced error handler for FHIR API calls
 */
export const handleFhirError = (error: any): string => {
  if (error?.response?.status === 401) {
    return 'Unauthorized: Please check your Medplum server credentials';
  }
  
  if (error?.response?.status === 403) {
    return 'Forbidden: Insufficient permissions for this operation';
  }
  
  if (error?.response?.status === 404) {
    return 'Not Found: The requested resource was not found';
  }
  
  if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
    return 'Connection refused: Medplum server is not running or not accessible';
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network error: Unable to connect to Medplum server';
  }
  
  return error?.message || 'An unknown error occurred while connecting to the FHIR server';
};