/**
 * Medplum client configuration
 * Initializes and exports the Medplum client for FHIR operations
 */

import { MedplumClient } from '@medplum/core';

export const medplumConfig = {
  baseUrl: import.meta.env.VITE_MEDPLUM_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8103',
  clientId: import.meta.env.VITE_MEDPLUM_CLIENT_ID || 'medplum-client',
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
    // First, check if the Medplum server is accessible
    try {
      await fetch(`${medplumConfig.baseUrl}/fhir/R4/metadata`, {
        method: 'GET',
        headers: {
          'Accept': 'application/fhir+json',
        },
      });
    } catch (serverError) {
      console.warn('Medplum server is not accessible at', medplumConfig.baseUrl);
      console.warn('Please start your Medplum server using: docker-compose -f docker-compose.full-stack.yml up -d');
      return false;
    }

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
    
    // For development, we'll skip authentication and use the server directly
    // This is because the Medplum server is running in first-boot mode
    // and doesn't have proper OAuth clients configured yet
    console.log('Using Medplum server without authentication (development mode)');
    
    // Test if we can access FHIR endpoints without authentication
    try {
      const response = await fetch(`${medplumConfig.baseUrl}/fhir/R4/Patient?_summary=count`, {
        method: 'GET',
        headers: {
          'Accept': 'application/fhir+json',
        },
      });
      
      if (response.ok) {
        console.log('Medplum server accessible without authentication');
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