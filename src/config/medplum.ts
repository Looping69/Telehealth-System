/**
 * Medplum client configuration
 * Initializes and exports the Medplum client for FHIR operations
 */

import { MedplumClient } from '@medplum/core';

export const medplumConfig = {
  // Use the actual Medplum API URL for proper authentication
  baseUrl: import.meta.env.VITE_MEDPLUM_BASE_URL?.replace(/\/$/, '') || 'https://api.medplum.com',
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
/**
 * initializeMedplumAuth
 * Purpose: Stubbed in dev to avoid direct Medplum calls that trigger CORS.
 * Inputs: none
 * Outputs: boolean indicating initialization (always false in stub)
 */
export const initializeMedplumAuth = async (): Promise<boolean> => {
  console.warn('initializeMedplumAuth is disabled in development; using backend FHIR gateway.');
  return false;
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