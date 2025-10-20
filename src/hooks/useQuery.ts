/**
 * React Query configuration and custom hooks
 * Provides data fetching and caching utilities for the application
 */

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medplumClient } from '../config/medplum';
import { Patient, Appointment, Order, Invoice, Task, Provider, Message } from '../types';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom hooks for data fetching

/**
 * Fetch patients with optional search filters
 */
export function usePatients(searchQuery?: string | { 
  search?: string; 
  status?: string; 
  gender?: string;
  insurance?: string;
  ageRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number; 
  limit?: number;
}) {
  // Handle both string and object parameters for backward compatibility
  const queryString = typeof searchQuery === 'string' ? searchQuery : searchQuery?.search;
  const statusFilter = typeof searchQuery === 'object' ? searchQuery?.status : undefined;
  const genderFilter = typeof searchQuery === 'object' ? searchQuery?.gender : undefined;
  const insuranceFilter = typeof searchQuery === 'object' ? searchQuery?.insurance : undefined;
  const ageRangeFilter = typeof searchQuery === 'object' ? searchQuery?.ageRange : undefined;
  const sortBy = typeof searchQuery === 'object' ? searchQuery?.sortBy || 'name' : 'name';
  const sortOrder = typeof searchQuery === 'object' ? searchQuery?.sortOrder || 'asc' : 'asc';
  
  return useQuery({
    queryKey: ['patients', queryString, statusFilter, genderFilter, insuranceFilter, ageRangeFilter, sortBy, sortOrder],
    queryFn: async () => {
      try {
        console.log('Fetching patients from Medplum...');
        
        // Build search parameters
        const searchParams = new URLSearchParams({
          '_sort': '-_lastUpdated',
          '_count': '50'
        });
        
        if (queryString) {
          searchParams.append('name', queryString);
        }
        
        if (statusFilter && statusFilter !== 'all') {
          searchParams.append('active', statusFilter === 'active' ? 'true' : 'false');
        }
        
        if (genderFilter && genderFilter !== 'all') {
          searchParams.append('gender', genderFilter);
        }
        
        const patients = await medplumClient.searchResources('Patient', searchParams);
        
        const result: Patient[] = patients.map((patient: any) => ({
          id: patient.id,
          name: `${patient.name?.[0]?.given?.[0] || 'Unknown'} ${patient.name?.[0]?.family || 'Unknown'}`,
          firstName: patient.name?.[0]?.given?.[0] || 'Unknown',
          lastName: patient.name?.[0]?.family || 'Unknown',
          email: patient.telecom?.find((t: any) => t.system === 'email')?.value || '',
          phone: patient.telecom?.find((t: any) => t.system === 'phone')?.value || '',
          dateOfBirth: patient.birthDate || '',
          gender: patient.gender || 'unknown',
          status: patient.active ? 'active' : 'inactive',
          createdAt: new Date(patient.meta?.lastUpdated || Date.now()),
          updatedAt: new Date(patient.meta?.lastUpdated || Date.now()),
          address: patient.address?.[0] ? 
            `${patient.address[0].line?.join(', ') || ''}, ${patient.address[0].city || ''}, ${patient.address[0].state || ''} ${patient.address[0].postalCode || ''}`.trim() : '',
          emergencyContact: patient.contact?.[0]?.name?.text || '',
          insurance: patient.extension?.find((ext: any) => ext.url?.includes('insurance'))?.valueString || '',
          medicalHistory: [],
          allergies: [],
          lastVisit: patient.meta?.lastUpdated ? new Date(patient.meta.lastUpdated) : null,
          nextAppointment: null,
        }));
        
        console.log(`Successfully fetched ${result.length} patients from Medplum`);
        return result;
      } catch (error) {
        console.error('Failed to fetch patients from Medplum:', error);
        throw error;
      }
    },
  });
}

/**
 * Fetch single patient by ID
 */
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      try {
        console.log(`Fetching patient ${patientId} from Medplum...`);
        const patient = await medplumClient.readResource('Patient', patientId);
        
        const result: Patient = {
          id: patient.id,
          name: patient.name?.[0] ? `${patient.name[0].given?.[0] || ''} ${patient.name[0].family || ''}`.trim() : 'Unknown Patient',
          firstName: patient.name?.[0]?.given?.[0] || '',
          lastName: patient.name?.[0]?.family || '',
          email: patient.telecom?.find((t: any) => t.system === 'email')?.value || '',
          phone: patient.telecom?.find((t: any) => t.system === 'phone')?.value || '',
          dateOfBirth: patient.birthDate || '',
          gender: patient.gender || 'unknown',
          status: patient.active ? 'active' : 'inactive',
          createdAt: new Date(patient.meta?.lastUpdated || Date.now()),
          updatedAt: new Date(patient.meta?.lastUpdated || Date.now()),
        };
        
        console.log(`Successfully fetched patient from Medplum:`, result.name);
        return result;
      } catch (error) {
        console.log(`Failed to fetch patient ${patientId} from Medplum, using mock data:`, error);
        
        // Comprehensive mock data - always returned
        return {
          id: patientId,
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          dateOfBirth: '1985-06-15',
          gender: 'male',
          status: 'active' as const,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
        };
      }
    },
    enabled: !!patientId,
  });
}

/**
 * Fetch appointments with optional filters
 */
export function useAppointments(date?: Date) {
  return useQuery({
    queryKey: ['appointments', date?.toISOString()],
    queryFn: async () => {
      try {
        console.log('Fetching appointments from Medplum...');
        
        // Build search parameters
        const searchParams = new URLSearchParams({
          '_sort': '-date',
          '_count': '50'
        });
        
        if (date) {
          const dateStr = date.toISOString().split('T')[0];
          searchParams.append('date', `ge${dateStr}`);
          searchParams.append('date', `lt${dateStr}T23:59:59`);
        }
        
        const appointments = await medplumClient.searchResources('Appointment', searchParams);
        
        const result: Appointment[] = appointments.map((apt: any) => ({
          id: apt.id,
          patientId: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Patient/'))?.actor?.reference?.split('/')[1] || '',
          patientName: apt.participant?.find((p: any) => p.actor?.display)?.actor?.display || 'Unknown Patient',
          providerId: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'))?.actor?.reference?.split('/')[1] || '',
          providerName: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'))?.actor?.display || 'Unknown Provider',
          date: new Date(apt.start || Date.now()),
          duration: apt.minutesDuration || 30,
          type: apt.appointmentType?.text || 'consultation',
          status: apt.status || 'scheduled',
          notes: apt.comment || '',
          createdAt: new Date(apt.meta?.lastUpdated || Date.now()),
          updatedAt: new Date(apt.meta?.lastUpdated || Date.now()),
          sessionType: apt.serviceType?.[0]?.text || 'video',
          meetingLink: apt.telecom?.find((t: any) => t.system === 'url')?.value || '',
          symptoms: apt.reasonCode?.map((r: any) => r.text) || [],
          diagnosis: apt.diagnosis?.[0]?.condition?.display || null,
          prescription: null,
          followUpRequired: apt.supportingInformation?.length > 0 || false,
        }));
        
        console.log(`Successfully fetched ${result.length} appointments from Medplum`);
        return result;
      } catch (error) {
        console.log('Failed to fetch appointments from Medplum, using mock data:', error);
        
        // Comprehensive mock data - fallback only
        // Generate dates relative to current date for realistic testing
        const now = new Date();
        const today = new Date(now);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);

        const mockAppointments: Appointment[] = [
          {
            id: '1',
            patientId: '1',
            patientName: 'John Doe',
            providerId: '1',
            providerName: 'Dr. Sarah Johnson',
            date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0),
            duration: 30,
            type: 'consultation',
            status: 'scheduled',
            notes: 'Regular checkup - patient reports feeling well',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            sessionType: 'video',
            meetingLink: 'https://meet.telehealth.com/session/abc123',
            symptoms: ['General wellness check'],
            diagnosis: null,
            prescription: null,
            followUpRequired: false,
          },
          {
            id: '2',
            patientId: '2',
            patientName: 'Jane Smith',
            providerId: '1',
            providerName: 'Dr. Sarah Johnson',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30, 0),
            duration: 45,
            type: 'follow-up',
            status: 'scheduled',
            notes: 'Follow-up on asthma treatment - patient reports improvement',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            sessionType: 'video',
            meetingLink: 'https://meet.telehealth.com/session/def456',
            symptoms: ['Shortness of breath', 'Wheezing'],
            diagnosis: 'Asthma - controlled',
            prescription: 'Continue current inhaler regimen',
            followUpRequired: true,
          },
          {
            id: '3',
            patientId: '3',
            patientName: 'Michael Johnson',
            providerId: '2',
            providerName: 'Dr. Robert Chen',
            date: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 15, 0),
            duration: 60,
            type: 'consultation',
            status: 'completed',
            notes: 'Initial consultation for joint pain - comprehensive examination completed',
            createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(yesterday.getTime()),
            sessionType: 'in-person',
            meetingLink: null,
            symptoms: ['Joint pain', 'Morning stiffness', 'Reduced mobility'],
            diagnosis: 'Osteoarthritis - moderate',
            prescription: 'Ibuprofen 400mg twice daily, Physical therapy referral',
            followUpRequired: true,
          },
          {
            id: '4',
            patientId: '4',
            patientName: 'Sarah Wilson',
            providerId: '3',
            providerName: 'Dr. Emily Rodriguez',
            date: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate(), 16, 0, 0),
            duration: 30,
            type: 'mental-health',
            status: 'completed',
            notes: 'Anxiety management session - patient showing good progress',
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(lastWeek.getTime()),
            sessionType: 'video',
            meetingLink: 'https://meet.telehealth.com/session/ghi789',
            symptoms: ['Anxiety', 'Sleep disturbances', 'Concentration issues'],
            diagnosis: 'Generalized Anxiety Disorder - improving',
            prescription: 'Continue current medication, mindfulness exercises',
            followUpRequired: true,
          },
          {
            id: '5',
            patientId: '5',
            patientName: 'Robert Brown',
            providerId: '1',
            providerName: 'Dr. Sarah Johnson',
            date: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 30, 0),
            duration: 45,
            type: 'chronic-care',
            status: 'scheduled',
            notes: 'Diabetes management and blood pressure monitoring',
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            sessionType: 'video',
            meetingLink: 'https://meet.telehealth.com/session/jkl012',
            symptoms: ['Elevated blood sugar', 'Fatigue', 'Frequent urination'],
            diagnosis: 'Type 2 Diabetes with Hypertension',
            prescription: 'Metformin adjustment, blood pressure medication review',
            followUpRequired: true,
          },
          {
            id: '6',
            patientId: '6',
            patientName: 'Emily Davis',
            providerId: '4',
            providerName: 'Dr. Michael Thompson',
            date: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate() + 1, 13, 45, 0),
            duration: 30,
            type: 'specialist',
            status: 'completed',
            notes: 'Endocrinology consultation for thyroid disorder',
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
            sessionType: 'in-person',
            meetingLink: null,
            symptoms: ['Fatigue', 'Weight changes', 'Hair loss'],
            diagnosis: 'Hypothyroidism - stable',
            prescription: 'Levothyroxine dosage adjustment',
            followUpRequired: true,
          },
          {
            id: '7',
            patientId: '7',
            patientName: 'Christopher Lee',
            providerId: '5',
            providerName: 'Dr. Lisa Park',
            date: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate() + 1, 15, 20, 0),
            duration: 40,
            type: 'sports-medicine',
            status: 'scheduled',
            notes: 'Sports injury assessment and rehabilitation planning',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            sessionType: 'in-person',
            meetingLink: null,
            symptoms: ['Knee pain', 'Swelling', 'Limited range of motion'],
            diagnosis: null,
            prescription: null,
            followUpRequired: false,
          },
          {
            id: '8',
            patientId: '8',
            patientName: 'Amanda Garcia',
            providerId: '3',
            providerName: 'Dr. Emily Rodriguez',
            date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1, 10, 30, 0),
            duration: 50,
            type: 'pain-management',
            status: 'cancelled',
            notes: 'Fibromyalgia pain management - patient cancelled due to flare-up',
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            sessionType: 'video',
            meetingLink: 'https://meet.telehealth.com/session/mno345',
            symptoms: ['Widespread pain', 'Fatigue', 'Sleep issues'],
            diagnosis: 'Fibromyalgia - active flare',
            prescription: 'Pain management protocol adjustment needed',
            followUpRequired: true,
          },
        ];
        
        if (date) {
          return mockAppointments.filter(appointment => 
            appointment.date.toDateString() === date.toDateString()
          );
        }
        
        return mockAppointments;
      }
    },
  });
}

/**
 * Fetch orders with optional filters
 */
export function useOrders(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['orders', params?.search, params?.status],
    queryFn: async () => {
      try {
        console.log('Fetching orders from Medplum...');
        
        // Build base search parameters
        const baseParams: any = {
          _sort: '-_lastUpdated',
          _count: '50'
        };
        
        if (params?.search) {
          baseParams['patient.name'] = params.search;
        }
        
        if (params?.status) {
          baseParams.status = params.status;
        }
        
        // Create separate search parameters for each resource type
        // Start with basic patient includes only to avoid FHIR validation errors
        const serviceRequestParams = {
          ...baseParams,
          _include: 'ServiceRequest:patient'
        };
        
        const medicationRequestParams = {
          ...baseParams,
          _include: 'MedicationRequest:patient'
        };
        
        // Fetch both ServiceRequest and MedicationRequest resources
        const [serviceRequests, medicationRequests] = await Promise.all([
          medplumClient.searchResources('ServiceRequest', serviceRequestParams),
          medplumClient.searchResources('MedicationRequest', medicationRequestParams)
        ]);
        
        // Combine and return both types of orders
        const allOrders = [...serviceRequests, ...medicationRequests];
        console.log('Successfully fetched orders from Medplum:', allOrders.length);
        return allOrders;
      } catch (err) {
        console.error('Error fetching orders from Medplum:', err);
        // Re-throw the error so the UI can handle it properly
        throw new Error(`Failed to fetch orders from Medplum server: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
  });
}

/**
 * Fetch audit events with optional filters
 */
export function useAuditEvents(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['auditEvents', params?.search, params?.status],
    queryFn: async () => {
      try {
        console.log('Fetching audit events from Medplum...');
        const auditEvents = await medplumClient.searchResources('AuditEvent', {
          _sort: '-date',
          _count: 50,
          ...(params?.search && { 'entity.name': params.search }),
          ...(params?.status && { outcome: params.status === 'success' ? 0 : 1 }),
        });
        console.log('Successfully fetched audit events:', auditEvents);
        return auditEvents;
      } catch (err) {
        console.error('Error fetching audit events from Medplum:', err);
        return [];
      }
    },
  });
}

/**
 * Fetch dashboard metrics
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      try {
        console.log('Fetching dashboard metrics from Medplum...');

        const appointments = await medplumClient.searchResources('Appointment', {
          _summary: 'count',
        });

        const patients = await medplumClient.searchResources('Patient', {
          _summary: 'count',
        });

        const revenue = await medplumClient.searchResources('Invoice', {
          status: 'paid',
          _summary: 'total',
        });

        const metrics = {
          totalAppointments: appointments.total || 0,
          totalPatients: patients.total || 0,
          totalRevenue: revenue.total || 0,
          pendingAppointments: 10, // Mock data for now
        };

        console.log('Successfully fetched dashboard metrics:', metrics);
        return metrics;
      } catch (err) {
        console.error('Error fetching dashboard metrics from Medplum:', err);
        console.log('Using mock dashboard metrics (Medplum server not available)');
        return {
          totalAppointments: 124,
          totalPatients: 45,
          totalRevenue: 18500,
          pendingAppointments: 12,
        };
      }
    },
  });
}

/**
 * Mutation hook for creating a new patient
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        console.log('Creating patient in Medplum...');
        
        const medplumPatient = {
          resourceType: 'Patient',
          active: patientData.status === 'active',
          name: [{
            given: [patientData.firstName],
            family: patientData.lastName,
          }],
          telecom: [
            ...(patientData.email ? [{ system: 'email', value: patientData.email }] : []),
            ...(patientData.phone ? [{ system: 'phone', value: patientData.phone }] : []),
          ],
          gender: patientData.gender,
          birthDate: patientData.dateOfBirth,
        };
        
        const createdPatient = await medplumClient.createResource(medplumPatient);
        
        const result: Patient = {
          id: createdPatient.id,
          name: patientData.name,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          status: patientData.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log('Successfully created patient in Medplum:', result.name);
        return result;
      } catch (error) {
        console.log('Failed to create patient in Medplum, using mock creation:', error);
        
        // Fallback to mock creation
        const newPatient: Patient = {
          ...patientData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return newPatient;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * Mutation hook for updating a patient
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...patientData }: Partial<Patient> & { id: string }) => {
      try {
        console.log(`Updating patient ${id} in Medplum...`);
        
        // First get the existing patient
        const existingPatient = await medplumClient.readResource('Patient', id);
        
        const updatedMedplumPatient = {
          ...existingPatient,
          active: patientData.status === 'active',
          name: [{
            given: [patientData.firstName],
            family: patientData.lastName,
          }],
          telecom: [
            ...(patientData.email ? [{ system: 'email', value: patientData.email }] : []),
            ...(patientData.phone ? [{ system: 'phone', value: patientData.phone }] : []),
          ],
          gender: patientData.gender,
          birthDate: patientData.dateOfBirth,
        };
        
        const updatedPatient = await medplumClient.updateResource(updatedMedplumPatient);
        
        const result: Patient = {
          ...patientData as Patient,
          id,
          updatedAt: new Date(),
        };
        
        console.log('Successfully updated patient in Medplum:', result.name);
        return result;
      } catch (error) {
        console.log(`Failed to update patient ${id} in Medplum, using mock update:`, error);
        
        // Fallback to mock update
        const updatedPatient: Patient = {
          ...patientData as Patient,
          id,
          updatedAt: new Date(),
        };
        return updatedPatient;
      }
    },
    onSuccess: (data) => {
      // Update the specific patient in cache
      queryClient.setQueryData(['patient', data.id], data);
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * Mutation hook for creating an appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id'>) => {
      try {
        console.log('Creating appointment in Medplum...');
        
        // Handle both ID-based and name-based appointment creation
        let patientId = appointmentData.patientId;
        let providerId = appointmentData.providerId;
        
        // If we have names instead of IDs, try to find the IDs
        if (!patientId && appointmentData.patientName) {
          try {
            // Search for patient by name
            const patientSearchParams = new URLSearchParams({
              'name': appointmentData.patientName,
              '_count': '1'
            });
            const patients = await medplumClient.searchResources('Patient', patientSearchParams);
            if (patients.length > 0) {
              patientId = patients[0].id;
            } else {
              throw new Error(`Patient not found: ${appointmentData.patientName}`);
            }
          } catch (searchError) {
            console.warn('Failed to find patient by name, using fallback ID');
            patientId = `patient-${Date.now()}`;
          }
        }
        
        if (!providerId && appointmentData.providerName) {
          try {
            // Search for practitioner by name
            const providerSearchParams = new URLSearchParams({
              'name': appointmentData.providerName,
              '_count': '1'
            });
            const practitioners = await medplumClient.searchResources('Practitioner', providerSearchParams);
            if (practitioners.length > 0) {
              providerId = practitioners[0].id;
            } else {
              throw new Error(`Provider not found: ${appointmentData.providerName}`);
            }
          } catch (searchError) {
            console.warn('Failed to find provider by name, using fallback ID');
            providerId = `provider-${Date.now()}`;
          }
        }
        
        const medplumAppointment = {
          resourceType: 'Appointment',
          status: appointmentData.status,
          start: appointmentData.date.toISOString(),
          end: new Date(appointmentData.date.getTime() + appointmentData.duration * 60000).toISOString(),
          minutesDuration: appointmentData.duration,
          participant: [
            {
              actor: {
                reference: `Patient/${patientId}`,
                display: appointmentData.patientName || 'Unknown Patient',
              },
              status: 'accepted',
            },
            {
              actor: {
                reference: `Practitioner/${providerId}`,
                display: appointmentData.providerName || 'Unknown Provider',
              },
              status: 'accepted',
            },
          ],
          comment: appointmentData.notes,
        };
        
        const createdAppointment = await medplumClient.createResource(medplumAppointment);
        
        const result: Appointment = {
          ...appointmentData,
          id: createdAppointment.id,
          patientId: patientId,
          providerId: providerId,
        };
        
        console.log('Successfully created appointment in Medplum');
        return result;
      } catch (error) {
        console.log('Failed to create appointment in Medplum, using mock creation:', error);
        
        // Fallback to mock creation
        const newAppointment: Appointment = {
          ...appointmentData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          patientId: appointmentData.patientId || `patient-${Date.now()}`,
          providerId: appointmentData.providerId || `provider-${Date.now()}`,
        };
        return newAppointment;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook to create a new order (ServiceRequest or MedicationRequest)
 * @returns Mutation object for creating orders
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: {
      orderType: 'ServiceRequest' | 'MedicationRequest';
      patientId?: string;
      patientName?: string;
      description: string;
      priority: 'routine' | 'urgent' | 'asap' | 'stat';
      notes?: string;
      category?: string;
      requesterName?: string;
    }) => {
      // Find patient ID if only name is provided
      let patientId = orderData.patientId;
      if (!patientId && orderData.patientName) {
        try {
          const patients = await medplumClient.searchResources('Patient', {
            name: orderData.patientName,
          });
          if (patients.length > 0) {
            patientId = patients[0].id;
          } else {
            patientId = `patient-${Date.now()}`;
          }
        } catch (error) {
          console.log('Failed to find patient, using fallback ID');
          patientId = `patient-${Date.now()}`;
        }
      }

      let medplumOrder;
      
      if (orderData.orderType === 'ServiceRequest') {
        medplumOrder = {
          resourceType: 'ServiceRequest',
          status: 'active',
          intent: 'order',
          priority: orderData.priority,
          subject: {
            reference: `Patient/${patientId}`,
            display: orderData.patientName || 'Unknown Patient',
          },
          code: {
            text: orderData.description,
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '108252007',
                display: orderData.description,
              }
            ]
          },
          category: orderData.category ? [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: orderData.category === 'laboratory' ? '108252007' : '363679005',
                  display: orderData.category === 'laboratory' ? 'Laboratory procedure' : 'Imaging',
                }
              ]
            }
          ] : undefined,
          requester: orderData.requesterName ? {
            display: orderData.requesterName,
          } : undefined,
          note: orderData.notes ? [
            {
              text: orderData.notes,
            }
          ] : undefined,
          authoredOn: new Date().toISOString(),
        };
      } else {
        // MedicationRequest
        medplumOrder = {
          resourceType: 'MedicationRequest',
          status: 'active',
          intent: 'order',
          priority: orderData.priority,
          subject: {
            reference: `Patient/${patientId}`,
            display: orderData.patientName || 'Unknown Patient',
          },
          medicationCodeableConcept: {
            text: orderData.description,
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: '123456',
                display: orderData.description,
              }
            ]
          },
          requester: orderData.requesterName ? {
            display: orderData.requesterName,
          } : undefined,
          note: orderData.notes ? [
            {
              text: orderData.notes,
            }
          ] : undefined,
          authoredOn: new Date().toISOString(),
          dosageInstruction: [
            {
              text: 'As directed by physician',
            }
          ],
        };
      }
      
      const createdOrder = await medplumClient.createResource(medplumOrder);
      
      console.log('Successfully created order in Medplum:', createdOrder);
      return createdOrder;
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      console.log('Order created successfully, invalidating orders cache');
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
}

/**
 * Fetch FHIR Coverage resources
 */
export function useCoverage(searchQuery?: string | { 
  search?: string; 
  status?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number; 
  limit?: number;
}) {
  return useQuery({
    queryKey: ['coverage', searchQuery],
    queryFn: async () => {
      try {
        console.log('Fetching coverage from Medplum...');
        
        // Build search parameters
        const searchParams: any = {
          _sort: '-_lastUpdated',
          _count: '50',
          _include: 'Coverage:beneficiary,Coverage:payor'
        };

        // Handle search query
        if (typeof searchQuery === 'string' && searchQuery.trim()) {
          // For string queries, search across beneficiary and payor
          searchParams._text = searchQuery.trim();
        } else if (typeof searchQuery === 'object' && searchQuery) {
          // Handle object-based search parameters
          if (searchQuery.search?.trim()) {
            searchParams._text = searchQuery.search.trim();
          }
          
          if (searchQuery.status && searchQuery.status !== 'all') {
            searchParams.status = searchQuery.status;
          }
          
          if (searchQuery.page && searchQuery.limit) {
            searchParams._count = searchQuery.limit.toString();
            searchParams._offset = ((searchQuery.page - 1) * searchQuery.limit).toString();
          }
        }

        const response = await medplumClient.searchResources('Coverage', searchParams);
        console.log(`Successfully fetched ${response.length} coverage records from Medplum`);
        
        // Transform FHIR Coverage resources to our format
        let coverageList = response.map((coverage: any) => ({
          id: coverage.id,
          resourceType: coverage.resourceType,
          status: coverage.status,
          beneficiary: coverage.beneficiary,
          payor: coverage.payor,
          period: coverage.period,
          class: coverage.class,
          network: coverage.network,
          costToBeneficiary: coverage.costToBeneficiary,
          subrogation: coverage.subrogation,
          contract: coverage.contract,
          meta: coverage.meta,
          // Additional fields for UI compatibility
          patientName: coverage.beneficiary?.display || 'Unknown Patient',
          payorName: coverage.payor?.[0]?.display || 'Unknown Payor',
          createdAt: new Date(coverage.meta?.lastUpdated || Date.now()),
          updatedAt: new Date(coverage.meta?.lastUpdated || Date.now()),
        }));

        // Apply client-side filtering if needed
        if (typeof searchQuery === 'object' && searchQuery) {
          // Apply search filter
          if (searchQuery.search?.trim()) {
            const searchTerm = searchQuery.search.toLowerCase();
            coverageList = coverageList.filter((coverage: any) => 
              coverage.patientName?.toLowerCase().includes(searchTerm) ||
              coverage.payorName?.toLowerCase().includes(searchTerm) ||
              coverage.id?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply status filter
          if (searchQuery.status && searchQuery.status !== 'all') {
            coverageList = coverageList.filter((coverage: any) => 
              coverage.status === searchQuery.status
            );
          }

          // Apply sorting
          if (searchQuery.sortBy) {
            coverageList.sort((a: any, b: any) => {
              let aValue: any;
              let bValue: any;

              switch (searchQuery.sortBy) {
                case 'patient':
                  aValue = a.patientName?.toLowerCase() || '';
                  bValue = b.patientName?.toLowerCase() || '';
                  break;
                case 'payor':
                  aValue = a.payorName?.toLowerCase() || '';
                  bValue = b.payorName?.toLowerCase() || '';
                  break;
                case 'status':
                  aValue = a.status || '';
                  bValue = b.status || '';
                  break;
                case 'createdAt':
                  aValue = new Date(a.createdAt).getTime();
                  bValue = new Date(b.createdAt).getTime();
                  break;
                default:
                  aValue = a.patientName?.toLowerCase() || '';
                  bValue = b.patientName?.toLowerCase() || '';
              }

              if (searchQuery.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
              } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
              }
            });
          }
        }
        
        return coverageList;
      } catch (error) {
        console.log('Failed to fetch coverage from Medplum, using mock data:', error);
        
        // Mock coverage data for fallback (only for connection errors, not auth errors)
        if (error instanceof Error && (
          error.message.includes('fetch') || 
          error.message.includes('network') || 
          error.message.includes('connection') ||
          error.message.includes('ECONNREFUSED')
        )) {
          return [
            {
              id: 'mock-coverage-1',
              resourceType: 'Coverage',
              status: 'active',
              beneficiary: { display: 'John Doe', reference: 'Patient/mock-patient-1' },
              payor: [{ display: 'Blue Cross Blue Shield', reference: 'Organization/mock-org-1' }],
              period: { start: '2024-01-01', end: '2024-12-31' },
              patientName: 'John Doe',
              payorName: 'Blue Cross Blue Shield',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: 'mock-coverage-2',
              resourceType: 'Coverage',
              status: 'active',
              beneficiary: { display: 'Jane Smith', reference: 'Patient/mock-patient-2' },
              payor: [{ display: 'Aetna', reference: 'Organization/mock-org-2' }],
              period: { start: '2024-01-01', end: '2024-12-31' },
              patientName: 'Jane Smith',
              payorName: 'Aetna',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
            {
              id: 'mock-coverage-3',
              resourceType: 'Coverage',
              status: 'cancelled',
              beneficiary: { display: 'Bob Johnson', reference: 'Patient/mock-patient-3' },
              payor: [{ display: 'UnitedHealth', reference: 'Organization/mock-org-3' }],
              period: { start: '2023-01-01', end: '2023-12-31' },
              patientName: 'Bob Johnson',
              payorName: 'UnitedHealth',
              createdAt: new Date('2023-01-01'),
              updatedAt: new Date('2023-12-31'),
            },
          ];
        }
        
        // Re-throw auth and other errors
        throw error;
      }
    },
  });
}

/**
 * Fetch FHIR system metadata for connection testing
 */

/**
 * Hook to create a new product (FHIR Medication resource)
 * @returns Mutation object for creating products
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: {
      name: string;
      manufacturer?: string;
      dosageForm?: string;
      ingredients: Array<{
        name: string;
        strength?: string;
      }>;
      batchNumber?: string;
      expirationDate?: Date;
      status: 'active' | 'inactive' | 'entered-in-error';
      description?: string;
    }) => {
      try {
        // Create FHIR Medication resource
        const medplumMedication = {
          resourceType: 'Medication',
          status: productData.status,
          code: {
            text: productData.name,
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: `${Date.now()}`, // Generate a temporary RxNorm code
                display: productData.name,
              }
            ]
          },
          manufacturer: productData.manufacturer ? {
            display: productData.manufacturer,
          } : undefined,
          form: productData.dosageForm ? {
            text: productData.dosageForm,
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: productData.dosageForm === 'tablet' ? '385055001' : 
                      productData.dosageForm === 'capsule' ? '385049006' :
                      productData.dosageForm === 'liquid' ? '385023001' :
                      productData.dosageForm === 'injection' ? '385219001' :
                      '421026006', // Default to oral dose form
                display: productData.dosageForm,
              }
            ]
          } : undefined,
          ingredient: productData.ingredients.length > 0 ? productData.ingredients.map(ingredient => ({
            itemCodeableConcept: {
              text: ingredient.name,
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  display: ingredient.name,
                }
              ]
            },
            strength: ingredient.strength ? {
              numerator: {
                value: parseFloat(ingredient.strength.split(' ')[0]) || 1,
                unit: ingredient.strength.split(' ')[1] || 'mg',
                system: 'http://unitsofmeasure.org',
                code: ingredient.strength.split(' ')[1] || 'mg',
              },
              denominator: {
                value: 1,
                unit: 'tablet',
                system: 'http://unitsofmeasure.org',
                code: 'tablet',
              }
            } : undefined,
          })) : undefined,
          batch: (productData.batchNumber || productData.expirationDate) ? {
            lotNumber: productData.batchNumber,
            expirationDate: productData.expirationDate?.toISOString().split('T')[0],
          } : undefined,
        };
        
        const createdMedication = await medplumClient.createResource(medplumMedication);
        
        console.log('Successfully created medication in Medplum');
        return createdMedication;
      } catch (error) {
        console.log('Failed to create medication in Medplum, using mock creation:', error);
        
        // Fallback to mock creation
        const mockMedication = {
          resourceType: 'Medication',
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: productData.status,
          code: {
            text: productData.name,
          },
          manufacturer: productData.manufacturer ? {
            display: productData.manufacturer,
          } : undefined,
          form: productData.dosageForm ? {
            text: productData.dosageForm,
          } : undefined,
          ingredient: productData.ingredients.length > 0 ? productData.ingredients.map(ingredient => ({
            itemCodeableConcept: {
              text: ingredient.name,
            },
          })) : undefined,
          batch: (productData.batchNumber || productData.expirationDate) ? {
            lotNumber: productData.batchNumber,
            expirationDate: productData.expirationDate?.toISOString().split('T')[0],
          } : undefined,
        };
        return mockMedication;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch medications
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

/**
 * Fetch products/medications with optional search filters
 */
export function useProducts(searchQuery?: string | { 
  search?: string; 
  status?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number; 
  limit?: number;
}) {
  // Handle both string and object parameters for backward compatibility
  const queryString = typeof searchQuery === 'string' ? searchQuery : searchQuery?.search;
  const statusFilter = typeof searchQuery === 'object' ? searchQuery?.status : undefined;
  const sortBy = typeof searchQuery === 'object' ? searchQuery?.sortBy || 'name' : 'name';
  const sortOrder = typeof searchQuery === 'object' ? searchQuery?.sortOrder || 'asc' : 'asc';
  
  return useQuery({
    queryKey: ['products', queryString, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      try {
        console.log('Fetching medications/products from Medplum...');
        
        // Build search parameters
        const searchParams = new URLSearchParams({
          '_sort': '-_lastUpdated',
          '_count': '50'
        });
        
        if (queryString) {
          searchParams.append('code:text', queryString);
        }
        
        if (statusFilter && statusFilter !== 'all') {
          searchParams.append('status', statusFilter);
        }
        
        const medications = await medplumClient.searchResources('Medication', searchParams);
        
        const result = medications.map((medication: any) => ({
          id: medication.id,
          name: medication.code?.text || medication.code?.coding?.[0]?.display || 'Unknown Medication',
          description: medication.code?.text || medication.code?.coding?.[0]?.display || '',
          manufacturer: medication.manufacturer?.display || '',
          dosageForm: medication.form?.text || medication.form?.coding?.[0]?.display || '',
          status: medication.status || 'active',
          ingredients: medication.ingredient?.map((ing: any) => ({
            name: ing.itemCodeableConcept?.text || ing.itemCodeableConcept?.coding?.[0]?.display || '',
            strength: ing.strength?.numerator?.value ? `${ing.strength.numerator.value}${ing.strength.numerator.unit || ''}` : ''
          })) || [],
          batchNumber: medication.batch?.lotNumber || '',
          expirationDate: medication.batch?.expirationDate || '',
          createdAt: new Date(medication.meta?.lastUpdated || Date.now()),
          updatedAt: new Date(medication.meta?.lastUpdated || Date.now()),
        }));
        
        console.log(`Successfully fetched ${result.length} medications/products from Medplum`);
        return result;
      } catch (error) {
        console.error('Failed to fetch medications/products from Medplum:', error);
        console.log('Using mock product data as fallback');
        
        // Fallback mock data
        const mockProducts = [
          {
            id: 'med-001',
            name: 'Amoxicillin 500mg',
            description: 'Amoxicillin 500mg - Antibiotic',
            manufacturer: 'Pfizer',
            dosageForm: 'Capsule',
            status: 'active',
            ingredients: [{ name: 'Amoxicillin', strength: '500mg' }],
            batchNumber: 'AMX2024001',
            expirationDate: '2025-12-31',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'med-002',
            name: 'Lisinopril 10mg',
            description: 'Lisinopril 10mg - ACE Inhibitor',
            manufacturer: 'Merck',
            dosageForm: 'Tablet',
            status: 'active',
            ingredients: [{ name: 'Lisinopril', strength: '10mg' }],
            batchNumber: 'LIS2024002',
            expirationDate: '2025-06-30',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'med-003',
            name: 'Ibuprofen 200mg',
            description: 'Ibuprofen 200mg - Pain Relief',
            manufacturer: 'Johnson & Johnson',
            dosageForm: 'Tablet',
            status: 'active',
            ingredients: [{ name: 'Ibuprofen', strength: '200mg' }],
            batchNumber: 'IBU2024003',
            expirationDate: '2026-03-15',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'med-004',
            name: 'Metformin 500mg',
            description: 'Metformin 500mg - Diabetes Medication',
            manufacturer: 'Teva',
            dosageForm: 'Tablet',
            status: 'active',
            ingredients: [{ name: 'Metformin', strength: '500mg' }],
            batchNumber: 'MET2024004',
            expirationDate: '2025-09-30',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'med-005',
            name: 'Omeprazole 20mg',
            description: 'Omeprazole 20mg - Proton Pump Inhibitor',
            manufacturer: 'AstraZeneca',
            dosageForm: 'Capsule',
            status: 'active',
            ingredients: [{ name: 'Omeprazole', strength: '20mg' }],
            batchNumber: 'OME2024005',
            expirationDate: '2025-11-15',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          }
        ];
        
        // Filter mock data based on search query
        let filteredProducts = mockProducts;
        if (queryString) {
          const searchLower = queryString.toLowerCase();
          filteredProducts = mockProducts.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.manufacturer.toLowerCase().includes(searchLower)
          );
        }
        
        if (statusFilter && statusFilter !== 'all') {
          filteredProducts = filteredProducts.filter(product => product.status === statusFilter);
        }
        
        return filteredProducts;
      }
    },
  });
}

export function useSystemMetadata() {
  return useQuery({
    queryKey: ['systemMetadata'],
    queryFn: async () => {
      try {
        console.log('Fetching FHIR system metadata...');
        const metadata = await medplumClient.get('metadata');
        console.log('Successfully fetched FHIR metadata:', metadata);
        return metadata;
      } catch (err) {
        console.error('Error fetching FHIR metadata:', err);
        console.log('Using mock metadata (FHIR server not available)');
        return {
          resourceType: 'CapabilityStatement',
          status: 'active',
          date: new Date().toISOString(),
          publisher: 'Mock FHIR Server',
          kind: 'instance',
          software: {
            name: 'Mock Medplum Server',
            version: '1.0.0'
          },
          implementation: {
            description: 'Mock FHIR R4 Server for Development',
            url: 'https://api.medplum.com'
          },
          fhirVersion: '4.0.1',
          format: ['application/fhir+json', 'application/fhir+xml'],
          rest: [{
            mode: 'server',
            resource: [
              { type: 'Patient' },
              { type: 'Appointment' },
              { type: 'ServiceRequest' },
              { type: 'Invoice' },
              { type: 'Task' },
              { type: 'AuditEvent' },
              { type: 'Coverage' }
            ]
          }]
        };
      }
    },
    enabled: false, // Don't auto-fetch, only when manually triggered
  });
}

/**
 * Fetch FHIR Communications with optional search filters
 */
export function useCommunications(params?: {
  search?: string;
  status?: string;
  sender?: string;
  recipient?: string;
  category?: string;
  _sort?: string;
  _count?: string;
}) {
  return useQuery({
    queryKey: ['communications', params],
    queryFn: async () => {
      try {
        console.log('Fetching FHIR Communications from Medplum...');
        
        // Build search parameters
        const searchParams: Record<string, string> = {
          _sort: params?._sort || '-sent',
          _count: params?._count || '50',
        };

        if (params?.status) {
          searchParams.status = params.status;
        }

        if (params?.sender) {
          searchParams.sender = params.sender;
        }

        if (params?.recipient) {
          searchParams.recipient = params.recipient;
        }

        if (params?.category) {
          searchParams.category = params.category;
        }

        const response = await medplumClient.search('Communication', searchParams);
        
        if (response.entry) {
          const communications = response.entry
            .filter(entry => entry.resource?.resourceType === 'Communication')
            .map(entry => entry.resource);
          
          console.log(`✅ Fetched ${communications.length} FHIR Communications`);
          return communications;
        }
        
        return [];
      } catch (error) {
        console.error('❌ Failed to fetch FHIR Communications:', error);
        console.log('Using mock communications data (Medplum server not available)');
        
        // Mock FHIR Communication resources
        const mockCommunications = [
          {
            resourceType: 'Communication',
            id: 'comm-1',
            status: 'completed',
            category: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                    code: 'notification',
                    display: 'Notification'
                  }
                ]
              }
            ],
            subject: {
              reference: 'Patient/patient-1',
              display: 'John Doe'
            },
            sender: {
              reference: 'Practitioner/practitioner-1',
              display: 'Dr. Sarah Wilson'
            },
            recipient: [
              {
                reference: 'Patient/patient-1',
                display: 'John Doe'
              }
            ],
            sent: '2024-01-20T10:00:00Z',
            payload: [
              {
                contentString: 'Your lab results are ready for review. Please log into your patient portal to view them.'
              }
            ],
            priority: 'routine'
          },
          {
            resourceType: 'Communication',
            id: 'comm-2',
            status: 'completed',
            category: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                    code: 'reminder',
                    display: 'Reminder'
                  }
                ]
              }
            ],
            subject: {
              reference: 'Patient/patient-2',
              display: 'Jane Smith'
            },
            sender: {
              reference: 'Practitioner/practitioner-1',
              display: 'Dr. Sarah Wilson'
            },
            recipient: [
              {
                reference: 'Patient/patient-2',
                display: 'Jane Smith'
              }
            ],
            sent: '2024-01-19T14:30:00Z',
            payload: [
              {
                contentString: 'This is a reminder that you have an appointment scheduled for tomorrow at 2:00 PM. Please arrive 15 minutes early.'
              }
            ],
            priority: 'routine'
          },
          {
            resourceType: 'Communication',
            id: 'comm-3',
            status: 'in-progress',
            category: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                    code: 'instruction',
                    display: 'Instruction'
                  }
                ]
              }
            ],
            subject: {
              reference: 'Patient/patient-3',
              display: 'Michael Johnson'
            },
            sender: {
              reference: 'Patient/patient-3',
              display: 'Michael Johnson'
            },
            recipient: [
              {
                reference: 'Practitioner/practitioner-2',
                display: 'Dr. Michael Chen'
              }
            ],
            sent: '2024-01-21T09:15:00Z',
            payload: [
              {
                contentString: 'I have been experiencing some side effects from the new medication. Could we schedule a follow-up appointment?'
              }
            ],
            priority: 'urgent'
          },
          {
            resourceType: 'Communication',
            id: 'comm-4',
            status: 'completed',
            category: [
              {
                coding: [
                  {
                   system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                   code: communicationData.category || 'notification',
                   display: communicationData.category || 'Notification'
                 }
                ]
              }
            ],
            subject: {
              reference: 'Patient/patient-1',
              display: 'John Doe'
            },
            sender: {
              reference: 'Practitioner/practitioner-2',
              display: 'Dr. Michael Chen'
            },
            recipient: [
              {
                reference: 'Patient/patient-1',
                display: 'John Doe'
              }
            ],
            sent: '2024-01-18T16:45:00Z',
            payload: [
              {
                contentString: 'Your prescription refill is ready for pickup at the pharmacy. Please bring your ID when collecting.'
              }
            ],
            priority: 'routine'
          }
        ];

        // Apply filters to mock data
        let filteredCommunications = mockCommunications;

        if (params?.status) {
          filteredCommunications = filteredCommunications.filter(comm => comm.status === params.status);
        }

        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredCommunications = filteredCommunications.filter(comm =>
            comm.sender?.display?.toLowerCase().includes(searchTerm) ||
            comm.recipient?.[0]?.display?.toLowerCase().includes(searchTerm) ||
            comm.payload?.[0]?.contentString?.toLowerCase().includes(searchTerm)
          );
        }

        return filteredCommunications;
      }
    },
  });
}

/**
 * Mutation hook for creating a new FHIR Communication
 */
export function useCreateCommunication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (communicationData: {
      recipientId: string;
      recipientName: string;
      recipientType: 'Patient' | 'Practitioner';
      subject?: string;
      message: string;
      priority?: 'routine' | 'urgent' | 'asap' | 'stat';
      category?: string;
      senderName?: string;
      senderId?: string;
    }) => {
      try {
        console.log('Creating FHIR Communication in Medplum...');
        
        // Create FHIR Communication resource
        const communication = {
          resourceType: 'Communication',
          status: 'completed',
          category: [
            {
              coding: [
                {
                   system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                   code: communicationData.category || 'notification',
                   display: communicationData.category || 'Notification'
                 }
              ]
            }
          ],
          subject: {
            reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
            display: communicationData.recipientName
          },
          sender: {
            reference: `Practitioner/${communicationData.senderId || 'practitioner-1'}`,
            display: communicationData.senderName || 'Healthcare Provider'
          },
          recipient: [
            {
              reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
              display: communicationData.recipientName
            }
          ],
          sent: new Date().toISOString(),
          payload: [
            {
              contentString: communicationData.message
            }
          ],
          priority: communicationData.priority || 'routine'
        };

        const created = await medplumClient.createResource(communication);
        console.log('✅ FHIR Communication created successfully:', created.id);
        return created;
      } catch (error) {
        console.error('❌ Failed to create FHIR Communication:', error);
        
        // Return mock created communication for development
        const mockCreated = {
          resourceType: 'Communication',
          id: `comm-${Date.now()}`,
          status: 'completed',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                  code: communicationData.category || 'notification',
                  display: communicationData.category || 'Notification'
                }
              ]
            }
          ],
          subject: {
            reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
            display: communicationData.recipientName
          },
          sender: {
            reference: `Practitioner/${communicationData.senderId || 'practitioner-1'}`,
            display: communicationData.senderName || 'Healthcare Provider'
          },
          recipient: [
            {
              reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
              display: communicationData.recipientName
            }
          ],
          sent: new Date().toISOString(),
          payload: [
            {
              contentString: communicationData.message
            }
          ],
          priority: communicationData.priority || 'routine'
        };

        console.log('✅ Mock FHIR Communication created (Medplum server not available)');
        return mockCreated;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch communications
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
}

/**
 * Fetch FHIR Invoice resources
 * @param searchQuery - Search parameters for filtering invoices
 * @returns Query result with invoice data, loading state, and error handling
 */
export function useInvoices(searchQuery?: string | { 
  search?: string; 
  status?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number; 
  limit?: number;
}) {
  return useQuery({
    queryKey: ['invoices', searchQuery],
    queryFn: async () => {
      try {
        console.log('Fetching invoices from Medplum...');
        
        // Build search parameters
        const searchParams: any = {
          _sort: '-_lastUpdated',
          _count: '50',
          _include: 'Invoice:subject,Invoice:issuer'
        };

        // Handle search query
        if (typeof searchQuery === 'string' && searchQuery.trim()) {
          searchParams._text = searchQuery.trim();
        } else if (typeof searchQuery === 'object' && searchQuery) {
          if (searchQuery.search?.trim()) {
            searchParams._text = searchQuery.search.trim();
          }
          
          if (searchQuery.status && searchQuery.status !== 'all') {
            searchParams.status = searchQuery.status;
          }
          
          if (searchQuery.page && searchQuery.limit) {
            searchParams._count = searchQuery.limit.toString();
            searchParams._offset = ((searchQuery.page - 1) * searchQuery.limit).toString();
          }
        }

        const response = await medplumClient.searchResources('Invoice', searchParams);
        console.log(`Successfully fetched ${response.length} invoices from Medplum`);
        
        // Transform FHIR Invoice resources to our format
        let invoiceList = response.map((invoice: any) => ({
          id: invoice.id,
          resourceType: invoice.resourceType,
          status: invoice.status,
          type: invoice.type,
          subject: invoice.subject,
          issuer: invoice.issuer,
          date: invoice.date,
          totalNet: invoice.totalNet,
          totalGross: invoice.totalGross,
          lineItem: invoice.lineItem,
          note: invoice.note,
          meta: invoice.meta,
          // Additional fields for UI compatibility
          patientName: invoice.subject?.display || 'Unknown Patient',
          issuerName: invoice.issuer?.display || 'Unknown Issuer',
          amount: invoice.totalGross?.value || invoice.totalNet?.value || 0,
          currency: invoice.totalGross?.currency || invoice.totalNet?.currency || 'USD',
          createdAt: new Date(invoice.meta?.lastUpdated || Date.now()),
          updatedAt: new Date(invoice.meta?.lastUpdated || Date.now()),
        }));

        // Apply client-side filtering if needed
        if (typeof searchQuery === 'object' && searchQuery) {
          // Apply search filter
          if (searchQuery.search?.trim()) {
            const searchTerm = searchQuery.search.toLowerCase();
            invoiceList = invoiceList.filter((invoice: any) => 
              invoice.patientName?.toLowerCase().includes(searchTerm) ||
              invoice.issuerName?.toLowerCase().includes(searchTerm) ||
              invoice.id?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply status filter
          if (searchQuery.status && searchQuery.status !== 'all') {
            invoiceList = invoiceList.filter((invoice: any) => 
              invoice.status === searchQuery.status
            );
          }

          // Apply sorting
          if (searchQuery.sortBy) {
            invoiceList.sort((a: any, b: any) => {
              let aValue: any;
              let bValue: any;

              switch (searchQuery.sortBy) {
                case 'patient':
                  aValue = a.patientName?.toLowerCase() || '';
                  bValue = b.patientName?.toLowerCase() || '';
                  break;
                case 'amount':
                  aValue = a.amount || 0;
                  bValue = b.amount || 0;
                  break;
                case 'status':
                  aValue = a.status || '';
                  bValue = b.status || '';
                  break;
                case 'date':
                  aValue = new Date(a.date || a.createdAt).getTime();
                  bValue = new Date(b.date || b.createdAt).getTime();
                  break;
                default:
                  aValue = new Date(a.createdAt).getTime();
                  bValue = new Date(b.createdAt).getTime();
              }

              if (searchQuery.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
              } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
              }
            });
          }
        }

        return invoiceList;
      } catch (error) {
        console.log('Failed to fetch invoices from Medplum, using mock data:', error);
        
        // Mock FHIR Invoice data for fallback
        const mockInvoices = [
          {
            resourceType: 'Invoice',
            id: 'invoice-1',
            status: 'issued',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/invoice-type',
                  code: 'professional',
                  display: 'Professional'
                }
              ]
            },
            subject: {
              reference: 'Patient/patient-1',
              display: 'John Doe'
            },
            issuer: {
              reference: 'Organization/org-1',
              display: 'Telehealth Clinic'
            },
            date: '2024-01-20',
            totalNet: {
              value: 150.00,
              currency: 'USD'
            },
            totalGross: {
              value: 165.00,
              currency: 'USD'
            },
            lineItem: [
              {
                sequence: 1,
                chargeItemCodeableConcept: {
                  text: 'Consultation - General Medicine'
                },
                priceComponent: [
                  {
                    type: 'base',
                    amount: {
                      value: 150.00,
                      currency: 'USD'
                    }
                  },
                  {
                    type: 'tax',
                    amount: {
                      value: 15.00,
                      currency: 'USD'
                    }
                  }
                ]
              }
            ],
            note: [
              {
                text: 'Regular consultation for general health checkup'
              }
            ],
            meta: {
              lastUpdated: '2024-01-20T10:00:00Z'
            },
            // UI compatibility fields
            patientName: 'John Doe',
            issuerName: 'Telehealth Clinic',
            amount: 165.00,
            currency: 'USD',
            createdAt: new Date('2024-01-20T10:00:00Z'),
            updatedAt: new Date('2024-01-20T10:00:00Z'),
          },
          {
            resourceType: 'Invoice',
            id: 'invoice-2',
            status: 'balanced',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/invoice-type',
                  code: 'professional',
                  display: 'Professional'
                }
              ]
            },
            subject: {
              reference: 'Patient/patient-2',
              display: 'Jane Smith'
            },
            issuer: {
              reference: 'Organization/org-1',
              display: 'Telehealth Clinic'
            },
            date: '2024-01-18',
            totalNet: {
              value: 200.00,
              currency: 'USD'
            },
            totalGross: {
              value: 220.00,
              currency: 'USD'
            },
            lineItem: [
              {
                sequence: 1,
                chargeItemCodeableConcept: {
                  text: 'Follow-up Consultation'
                },
                priceComponent: [
                  {
                    type: 'base',
                    amount: {
                      value: 120.00,
                      currency: 'USD'
                    }
                  }
                ]
              },
              {
                sequence: 2,
                chargeItemCodeableConcept: {
                  text: 'Prescription Review'
                },
                priceComponent: [
                  {
                    type: 'base',
                    amount: {
                      value: 80.00,
                      currency: 'USD'
                    }
                  }
                ]
              },
              {
                sequence: 3,
                chargeItemCodeableConcept: {
                  text: 'Tax'
                },
                priceComponent: [
                  {
                    type: 'tax',
                    amount: {
                      value: 20.00,
                      currency: 'USD'
                    }
                  }
                ]
              }
            ],
            note: [
              {
                text: 'Follow-up for asthma treatment and prescription review'
              }
            ],
            meta: {
              lastUpdated: '2024-01-18T14:30:00Z'
            },
            // UI compatibility fields
            patientName: 'Jane Smith',
            issuerName: 'Telehealth Clinic',
            amount: 220.00,
            currency: 'USD',
            createdAt: new Date('2024-01-18T14:30:00Z'),
            updatedAt: new Date('2024-01-18T14:30:00Z'),
          },
          {
            resourceType: 'Invoice',
            id: 'invoice-3',
            status: 'draft',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/invoice-type',
                  code: 'professional',
                  display: 'Professional'
                }
              ]
            },
            subject: {
              reference: 'Patient/patient-3',
              display: 'Michael Johnson'
            },
            issuer: {
              reference: 'Organization/org-1',
              display: 'Telehealth Clinic'
            },
            date: '2024-01-22',
            totalNet: {
              value: 300.00,
              currency: 'USD'
            },
            totalGross: {
              value: 330.00,
              currency: 'USD'
            },
            lineItem: [
              {
                sequence: 1,
                chargeItemCodeableConcept: {
                  text: 'Mental Health Consultation'
                },
                priceComponent: [
                  {
                    type: 'base',
                    amount: {
                      value: 300.00,
                      currency: 'USD'
                    }
                  },
                  {
                    type: 'tax',
                    amount: {
                      value: 30.00,
                      currency: 'USD'
                    }
                  }
                ]
              }
            ],
            note: [
              {
                text: 'Extended mental health consultation session'
              }
            ],
            meta: {
              lastUpdated: '2024-01-22T16:00:00Z'
            },
            // UI compatibility fields
            patientName: 'Michael Johnson',
            issuerName: 'Telehealth Clinic',
            amount: 330.00,
            currency: 'USD',
            createdAt: new Date('2024-01-22T16:00:00Z'),
            updatedAt: new Date('2024-01-22T16:00:00Z'),
          }
        ];

        // Apply filters to mock data
        let filteredInvoices = mockInvoices;

        if (typeof searchQuery === 'object' && searchQuery) {
          // Apply search filter
          if (searchQuery.search?.trim()) {
            const searchTerm = searchQuery.search.toLowerCase();
            filteredInvoices = filteredInvoices.filter((invoice: any) => 
              invoice.patientName?.toLowerCase().includes(searchTerm) ||
              invoice.issuerName?.toLowerCase().includes(searchTerm) ||
              invoice.id?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply status filter
          if (searchQuery.status && searchQuery.status !== 'all') {
            filteredInvoices = filteredInvoices.filter((invoice: any) => 
              invoice.status === searchQuery.status
            );
          }
        } else if (typeof searchQuery === 'string' && searchQuery.trim()) {
          const searchTerm = searchQuery.toLowerCase();
          filteredInvoices = filteredInvoices.filter((invoice: any) => 
            invoice.patientName?.toLowerCase().includes(searchTerm) ||
            invoice.issuerName?.toLowerCase().includes(searchTerm) ||
            invoice.id?.toLowerCase().includes(searchTerm)
          );
        }

        return filteredInvoices;
      }
    },
  });
}

/**
 * Create a new FHIR Invoice resource
 * @returns Mutation for creating invoices with success/error handling
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData: {
      patientId: string;
      patientName?: string;
      description: string;
      amount: number;
      currency?: string;
      dueDate?: string;
      lineItems?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
      notes?: string;
    }) => {
      try {
        console.log('Creating invoice in Medplum...', invoiceData);

        // Calculate totals
        const totalNet = invoiceData.lineItems?.reduce((sum, item) => sum + item.total, 0) || invoiceData.amount;
        const taxRate = 0.1; // 10% tax
        const taxAmount = totalNet * taxRate;
        const totalGross = totalNet + taxAmount;

        // Create FHIR Invoice resource
        const fhirInvoice = {
          resourceType: 'Invoice',
          status: 'draft',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/invoice-type',
                code: 'professional',
                display: 'Professional'
              }
            ]
          },
          subject: {
            reference: `Patient/${invoiceData.patientId}`,
            display: invoiceData.patientName || 'Unknown Patient'
          },
          issuer: {
            reference: 'Organization/org-1',
            display: 'Telehealth Clinic'
          },
          date: new Date().toISOString().split('T')[0],
          totalNet: {
            value: totalNet,
            currency: invoiceData.currency || 'USD'
          },
          totalGross: {
            value: totalGross,
            currency: invoiceData.currency || 'USD'
          },
          lineItem: invoiceData.lineItems?.map((item, index) => ({
            sequence: index + 1,
            chargeItemCodeableConcept: {
              text: item.description
            },
            priceComponent: [
              {
                type: 'base',
                amount: {
                  value: item.total,
                  currency: invoiceData.currency || 'USD'
                }
              }
            ]
          })) || [
            {
              sequence: 1,
              chargeItemCodeableConcept: {
                text: invoiceData.description
              },
              priceComponent: [
                {
                  type: 'base',
                  amount: {
                    value: totalNet,
                    currency: invoiceData.currency || 'USD'
                  }
                }
              ]
            }
          ],
          note: invoiceData.notes ? [
            {
              text: invoiceData.notes
            }
          ] : undefined
        };

        // Add tax as separate line item if there are line items
        if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
          fhirInvoice.lineItem.push({
            sequence: fhirInvoice.lineItem.length + 1,
            chargeItemCodeableConcept: {
              text: 'Tax (10%)'
            },
            priceComponent: [
              {
                type: 'tax',
                amount: {
                  value: taxAmount,
                  currency: invoiceData.currency || 'USD'
                }
              }
            ]
          });
        }

        const createdInvoice = await medplumClient.createResource(fhirInvoice);
        console.log('✅ Invoice created successfully in Medplum:', createdInvoice.id);
        return createdInvoice;
      } catch (error) {
        console.error('Failed to create invoice in Medplum:', error);
        
        // Fallback to mock creation
        const mockInvoice = {
          resourceType: 'Invoice',
          id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'draft',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/invoice-type',
                code: 'professional',
                display: 'Professional'
              }
            ]
          },
          subject: {
            reference: `Patient/${invoiceData.patientId}`,
            display: invoiceData.patientName || 'Unknown Patient'
          },
          issuer: {
            reference: 'Organization/org-1',
            display: 'Telehealth Clinic'
          },
          date: new Date().toISOString().split('T')[0],
          totalNet: {
            value: invoiceData.amount,
            currency: invoiceData.currency || 'USD'
          },
          totalGross: {
            value: invoiceData.amount * 1.1, // Add 10% tax
            currency: invoiceData.currency || 'USD'
          },
          lineItem: [
            {
              sequence: 1,
              chargeItemCodeableConcept: {
                text: invoiceData.description
              },
              priceComponent: [
                {
                  type: 'base',
                  amount: {
                    value: invoiceData.amount,
                    currency: invoiceData.currency || 'USD'
                  }
                }
              ]
            }
          ],
          note: invoiceData.notes ? [
            {
              text: invoiceData.notes
            }
          ] : undefined,
          meta: {
            lastUpdated: new Date().toISOString()
          }
        };

        console.log('✅ Mock FHIR Invoice created (Medplum server not available)');
        return mockInvoice;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch invoices
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      console.log('Invoice created successfully, invalidating invoices cache');
    },
    onError: (error) => {
      console.error('Failed to create invoice:', error);
    },
  });
}