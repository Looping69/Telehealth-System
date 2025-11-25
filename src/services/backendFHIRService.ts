/**
 * Backend FHIR API Service
 * Handles all FHIR operations through backend API endpoints
 * Replaces direct Medplum client calls with secure backend integration
 */

import axios, { AxiosInstance } from 'axios';

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface SearchResult<T> {
  success: boolean;
  data: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class BackendFHIRService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/fhir', // Backend API base URL
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and errors
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Patient Operations
   */

  async searchPatients(params: SearchParams = {}): Promise<SearchResult<any>> {
    try {
      const response = await this.api.get('/patients', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  async getPatient(id: string): Promise<any> {
    try {
      const response = await this.api.get(`/patients/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  }

  async createPatient(patientData: any): Promise<any> {
    try {
      const response = await this.api.post('/patients', patientData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patientData: any): Promise<any> {
    try {
      const response = await this.api.put(`/patients/${id}`, patientData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await this.api.delete(`/patients/${id}`);
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Practitioner Operations
   */

  async searchPractitioners(params: SearchParams & { specialty?: string } = {}): Promise<SearchResult<any>> {
    try {
      const response = await this.api.get('/practitioners', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching practitioners:', error);
      throw error;
    }
  }

  async getPractitioner(id: string): Promise<any> {
    try {
      const response = await this.api.get(`/practitioners/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching practitioner ${id}:`, error);
      throw error;
    }
  }

  /**
   * Appointment Operations
   */

  async searchAppointments(params: SearchParams & { 
    patientId?: string;
    practitionerId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<SearchResult<any>> {
    try {
      const response = await this.api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching appointments:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: any): Promise<any> {
    try {
      const response = await this.api.post('/appointments', appointmentData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, appointmentData: any): Promise<any> {
    try {
      const response = await this.api.put(`/appointments/${id}`, appointmentData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Observation Operations
   */

  async searchObservations(params: SearchParams & { 
    patientId?: string;
    category?: string;
    code?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<SearchResult<any>> {
    try {
      const response = await this.api.get('/observations', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching observations:', error);
      throw error;
    }
  }

  async createObservation(observationData: any): Promise<any> {
    try {
      const response = await this.api.post('/observations', observationData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating observation:', error);
      throw error;
    }
  }

  /**
   * Medication Operations
   */

  async searchMedications(params: SearchParams & { 
    patientId?: string;
    status?: string;
  } = {}): Promise<SearchResult<any>> {
    try {
      const response = await this.api.get('/medications', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching medications:', error);
      throw error;
    }
  }

  async createMedication(medicationData: any): Promise<any> {
    try {
      const response = await this.api.post('/medications', medicationData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  }

  /**
   * Generic Resource Operations
   */

  async searchResources(resourceType: string, params: SearchParams = {}): Promise<SearchResult<any>> {
    try {
      const response = await this.api.get(`/${resourceType}`, { params });
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      console.error(`Error searching ${resourceType}:`, error);
      throw error;
    }
  }

  async getResource(resourceType: string, id: string): Promise<any> {
    try {
      const response = await this.api.get(`/${resourceType}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${resourceType} ${id}:`, error);
      throw error;
    }
  }

  async createResource(resourceType: string, resourceData: any): Promise<any> {
    try {
      const response = await this.api.post(`/${resourceType}`, resourceData);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating ${resourceType}:`, error);
      throw error;
    }
  }

  async updateResource(resourceType: string, id: string, resourceData: any): Promise<any> {
    try {
      const response = await this.api.put(`/${resourceType}/${id}`, resourceData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating ${resourceType} ${id}:`, error);
      throw error;
    }
  }

  async deleteResource(resourceType: string, id: string): Promise<void> {
    try {
      await this.api.delete(`/${resourceType}/${id}`);
    } catch (error) {
      console.error(`Error deleting ${resourceType} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch FHIR CapabilityStatement / metadata from backend gateway
   * Purpose: Used by hooks to understand server capabilities.
   * Inputs: none
   * Outputs: CapabilityStatement-like JSON
   */
  async getMetadata(): Promise<any> {
    try {
      const response = await this.api.get('/metadata');
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error fetching FHIR metadata:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const backendFHIRService = new BackendFHIRService();
export default backendFHIRService;