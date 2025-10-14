/**
 * Medplum client configuration
 * Initializes and exports the Medplum client for FHIR operations
 */

import { MedplumClient } from '@medplum/core';

export const medplumConfig = {
  baseUrl: import.meta.env.VITE_MEDPLUM_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8103',
  clientId: import.meta.env.VITE_MEDPLUM_CLIENT_ID || 'demo-client-id',
  scope: 'openid profile email',
};

export const createMedplumClient = (): MedplumClient => {
  return new MedplumClient(medplumConfig);
};

// Default client instance
export const medplumClient = createMedplumClient();