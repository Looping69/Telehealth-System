/**
 * Medplum Service
 * Handles all FHIR operations and Medplum API interactions
 * Provides centralized service for healthcare data management
 */

import { MedplumClient } from '@medplum/core';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface SearchResult<T> {
  resources: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class MedplumService {
  private client: MedplumClient;
  private useMock: boolean;

  constructor() {
    this.useMock = config.medplum.useMock || (!config.medplum.clientId || !config.medplum.clientSecret);

    if (this.useMock) {
      logger.warn('Medplum dev-mode: using mock data for FHIR operations');
      // Create client with base URL only to satisfy types; calls will be short-circuited
      this.client = new MedplumClient({ baseUrl: config.medplum.baseUrl });
    } else {
      this.client = new MedplumClient({
        baseUrl: config.medplum.baseUrl,
        clientId: config.medplum.clientId,
        clientSecret: config.medplum.clientSecret
      });

      if (config.medplum.token) {
        this.client.setAccessToken(config.medplum.token);
      }
    }
  }

  /**
   * Set authentication token for the service
   */
  setAuthToken(token: string): void {
    this.client.setAccessToken(token);
    logger.info('Medplum service authentication token updated');
  }

  /**
   * Ensure the client is authenticated
   */
  private async ensureAuth(): Promise<void> {
    if (this.useMock) return;

    if (!this.client.getAccessToken()) {
      logger.info('Authenticating Medplum client...');
      try {
        await this.client.startClientLogin(config.medplum.clientId, config.medplum.clientSecret);
      } catch (error) {
        logger.error('Failed to authenticate Medplum client:', error);
        throw error;
      }
    }
  }



  /**
   * Patient Operations
   */

  async searchPatients(params: SearchParams): Promise<{
    patients: any[];
    total: number;
    pagination: SearchResult<any>['pagination'];
  }> {
    try {
      if (this.useMock) {
        const patients = this.mockPatients(params);
        const total = patients.length;
        return {
          patients,
          total,
          pagination: this.buildPagination(params, total)
        };
      } else {
        const searchParams = this.buildSearchParams(params);
        const bundle = await this.client.search('Patient', searchParams);
        const patients = bundle.entry?.map(entry => entry.resource) || [];
        const total = bundle.total || patients.length;
        return {
          patients,
          total,
          pagination: this.buildPagination(params, total)
        };
      }
    } catch (error) {
      logger.error('Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Dev-mode mock patients
   * Purpose: Return realistic mock FHIR Patient resources for development.
   * Inputs: `params` for pagination/search (name filter supported).
   * Outputs: Array of Patient resources.
   */
  private mockPatients(params: SearchParams): any[] {
    const all = [
      {
        resourceType: 'Patient',
        id: 'mock-pt-001',
        active: true,
        name: [{ given: ['Alice'], family: 'Anderson' }],
        gender: 'female',
        birthDate: '1985-06-15'
      },
      {
        resourceType: 'Patient',
        id: 'mock-pt-002',
        active: true,
        name: [{ given: ['Bob'], family: 'Baker' }],
        gender: 'male',
        birthDate: '1990-01-22'
      },
      {
        resourceType: 'Patient',
        id: 'mock-pt-003',
        active: true,
        name: [{ given: ['Cathy'], family: 'Carter' }],
        gender: 'female',
        birthDate: '1978-11-03'
      }
    ];

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const search = params.search?.toLowerCase();

    const filtered = search
      ? all.filter(p => {
        const names = p.name?.map(n => `${n.given?.join(' ')} ${n.family}`.toLowerCase()).join(' ');
        return names?.includes(search);
      })
      : all;

    const offset = (page - 1) * limit;
    return filtered.slice(offset, offset + limit);
  }

  /**
   * Dev-mode mock appointments
   * Purpose: Return realistic mock FHIR Appointment resources for development.
   * Inputs: `params` for pagination/date filters (status filter supported).
   * Outputs: Array of Appointment resources.
   */
  private mockAppointments(params: SearchParams & { status?: string; dateFrom?: string; dateTo?: string }): any[] {
    const all = [
      {
        resourceType: 'Appointment',
        id: 'mock-apt-001',
        status: 'booked',
        start: new Date().toISOString(),
        minutesDuration: 30,
        participant: [
          { actor: { reference: 'Patient/mock-pt-001', display: 'Alice Anderson' } },
          { actor: { reference: 'Practitioner/mock-pr-001', display: 'Dr. Smith' } }
        ],
        appointmentType: { text: 'consultation' },
        serviceType: [{ text: 'video' }]
      },
      {
        resourceType: 'Appointment',
        id: 'mock-apt-002',
        status: 'booked',
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        minutesDuration: 45,
        participant: [
          { actor: { reference: 'Patient/mock-pt-002', display: 'Bob Baker' } },
          { actor: { reference: 'Practitioner/mock-pr-002', display: 'Dr. Lee' } }
        ],
        appointmentType: { text: 'follow-up' },
        serviceType: [{ text: 'video' }]
      }
    ];

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const status = params.status;
    const filtered = status ? all.filter(a => a.status === status) : all;
    const offset = (page - 1) * limit;
    return filtered.slice(offset, offset + limit);
  }

  async getPatient(id: string): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.readResource('Patient', id);
    } catch (error) {
      logger.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  }

  async createPatient(patientData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.createResource({
        resourceType: 'Patient',
        ...patientData
      });
    } catch (error) {
      logger.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patientData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.updateResource({
        resourceType: 'Patient',
        id,
        ...patientData
      });
    } catch (error) {
      logger.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await this.ensureAuth();
      await this.client.deleteResource('Patient', id);
      logger.info(`Patient ${id} deleted successfully`);
    } catch (error) {
      logger.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Practitioner Operations
   */

  async searchPractitioners(params: SearchParams & { specialty?: string }): Promise<{
    practitioners: any[];
    total: number;
    pagination: SearchResult<any>['pagination'];
  }> {
    try {
      await this.ensureAuth();
      const searchParams = this.buildSearchParams(params);

      if (params.specialty) {
        searchParams['practitioner-role.specialty'] = params.specialty;
      }

      const bundle = await this.client.search('Practitioner', searchParams);

      const practitioners = bundle.entry?.map(entry => entry.resource) || [];
      const total = bundle.total || practitioners.length;

      return {
        practitioners,
        total,
        pagination: this.buildPagination(params, total)
      };
    } catch (error) {
      logger.error('Error searching practitioners:', error);
      throw error;
    }
  }

  async getPractitioner(id: string): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.readResource('Practitioner', id);
    } catch (error) {
      logger.error(`Error fetching practitioner ${id}:`, error);
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
  }): Promise<{
    appointments: any[];
    total: number;
    pagination: SearchResult<any>['pagination'];
  }> {
    try {
      await this.ensureAuth();
      if (this.useMock) {
        const appointments = this.mockAppointments(params);
        const total = appointments.length;
        return {
          appointments,
          total,
          pagination: this.buildPagination(params, total)
        };
      } else {
        const searchParams = this.buildSearchParams(params);
        if (params.patientId) searchParams.patient = params.patientId;
        if (params.practitionerId) searchParams.practitioner = params.practitionerId;
        if (params.status) searchParams.status = params.status;

        // Handle date ranges correctly by using an array for multiple date parameters
        const dateFilters: string[] = [];
        if (params.dateFrom) dateFilters.push(`ge${params.dateFrom}`);
        if (params.dateTo) dateFilters.push(`le${params.dateTo}`);

        if (dateFilters.length > 0) {
          searchParams.date = dateFilters.length === 1 ? dateFilters[0] : dateFilters;
        }

        const bundle = await this.client.search('Appointment', searchParams);
        const appointments = bundle.entry?.map(entry => entry.resource) || [];
        const total = bundle.total || appointments.length;
        return {
          appointments,
          total,
          pagination: this.buildPagination(params, total)
        };
      }
    } catch (error) {
      logger.error('Error searching appointments:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.createResource({
        resourceType: 'Appointment',
        ...appointmentData
      });
    } catch (error) {
      logger.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, appointmentData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.updateResource({
        resourceType: 'Appointment',
        id,
        ...appointmentData
      });
    } catch (error) {
      logger.error(`Error updating appointment ${id}:`, error);
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
  }): Promise<{
    observations: any[];
    total: number;
    pagination: SearchResult<any>['pagination'];
  }> {
    try {
      await this.ensureAuth();
      const searchParams = this.buildSearchParams(params);

      if (params.patientId) searchParams.patient = params.patientId;
      if (params.category) searchParams.category = params.category;
      if (params.code) searchParams.code = params.code;

      // Handle date ranges correctly
      const dateFilters: string[] = [];
      if (params.dateFrom) dateFilters.push(`ge${params.dateFrom}`);
      if (params.dateTo) dateFilters.push(`le${params.dateTo}`);

      if (dateFilters.length > 0) {
        searchParams.date = dateFilters.length === 1 ? dateFilters[0] : dateFilters;
      }

      const bundle = await this.client.search('Observation', searchParams);

      const observations = bundle.entry?.map(entry => entry.resource) || [];
      const total = bundle.total || observations.length;

      return {
        observations,
        total,
        pagination: this.buildPagination(params, total)
      };
    } catch (error) {
      logger.error('Error searching observations:', error);
      throw error;
    }
  }

  async createObservation(observationData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.createResource({
        resourceType: 'Observation',
        ...observationData
      });
    } catch (error) {
      logger.error('Error creating observation:', error);
      throw error;
    }
  }

  /**
   * Medication Operations
   */

  async searchMedications(params: SearchParams & {
    patientId?: string;
    status?: string;
  }): Promise<{
    medications: any[];
    total: number;
    pagination: SearchResult<any>['pagination'];
  }> {
    try {
      await this.ensureAuth();
      const searchParams = this.buildSearchParams(params);

      if (params.patientId) searchParams.patient = params.patientId;
      if (params.status) searchParams.status = params.status;

      const bundle = await this.client.search('MedicationRequest', searchParams);

      const medications = bundle.entry?.map(entry => entry.resource) || [];
      const total = bundle.total || medications.length;

      return {
        medications,
        total,
        pagination: this.buildPagination(params, total)
      };
    } catch (error) {
      logger.error('Error searching medications:', error);
      throw error;
    }
  }

  async createMedication(medicationData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.createResource({
        resourceType: 'MedicationRequest',
        ...medicationData
      });
    } catch (error) {
      logger.error('Error creating medication:', error);
      throw error;
    }
  }

  /**
   * Generic Resource Operations
   */

  async searchResources(resourceType: string, params: SearchParams): Promise<SearchResult<any>> {
    try {
      await this.ensureAuth();
      // Handle dev-mode mock responses
      if (this.useMock) {
        const summaryCount = params._summary === 'count';
        let resources: any[] = [];
        let total = 0;

        switch (resourceType) {
          case 'Patient':
            resources = this.mockPatients(params);
            total = resources.length;
            break;
          case 'Appointment':
            resources = this.mockAppointments(params);
            total = resources.length;
            break;
          case 'Invoice':
            resources = [];
            total = 0;
            break;
          case 'Task':
            resources = [];
            total = 0;
            break;
          default:
            resources = [];
            total = 0;
        }

        // If only count requested, return no resources and just total
        if (summaryCount) {
          resources = [];
        }

        return {
          resources,
          total,
          pagination: this.buildPagination(params, total)
        };
      }

      // Default: live Medplum client
      const searchParams = this.buildSearchParams(params);
      const bundle = await this.client.search(resourceType, searchParams);
      const resources = bundle.entry?.map(entry => entry.resource) || [];
      const total = bundle.total || resources.length;
      return {
        resources,
        total,
        pagination: this.buildPagination(params, total)
      };
    } catch (error) {
      logger.error(`Error searching ${resourceType}:`, error);
      throw error;
    }
  }

  async getResource(resourceType: string, id: string): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.readResource(resourceType, id);
    } catch (error) {
      logger.error(`Error fetching ${resourceType} ${id}:`, error);
      throw error;
    }
  }

  async createResource(resourceType: string, resourceData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.createResource({
        resourceType,
        ...resourceData
      });
    } catch (error) {
      logger.error(`Error creating ${resourceType}:`, error);
      throw error;
    }
  }

  async updateResource(resourceType: string, id: string, resourceData: any): Promise<any> {
    try {
      await this.ensureAuth();
      return await this.client.updateResource({
        resourceType,
        id,
        ...resourceData
      });
    } catch (error) {
      logger.error(`Error updating ${resourceType} ${id}:`, error);
      throw error;
    }
  }

  async deleteResource(resourceType: string, id: string): Promise<void> {
    try {
      await this.ensureAuth();
      await this.client.deleteResource(resourceType, id);
      logger.info(`${resourceType} ${id} deleted successfully`);
    } catch (error) {
      logger.error(`Error deleting ${resourceType} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Utility Methods
   */

  private buildSearchParams(params: SearchParams): Record<string, any> {
    const searchParams: Record<string, any> = {};

    if (params.search) {
      // Correct FHIR syntax for name contains search
      searchParams['name:contains'] = params.search;
    }

    if (params.sortBy) {
      searchParams._sort = params.sortBy;
      if (params.sortOrder === 'desc') {
        searchParams._sort = `-${params.sortBy}`;
      }
    }

    // Add pagination
    if (params.page && params.limit) {
      searchParams._offset = (params.page - 1) * params.limit;
      searchParams._count = params.limit;
    }

    return searchParams;
  }

  private buildPagination(params: SearchParams, total: number): SearchResult<any>['pagination'] {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
}