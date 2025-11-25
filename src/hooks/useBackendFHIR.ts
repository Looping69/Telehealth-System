/**
 * Backend FHIR API Hooks
 * Uses backend FHIR service instead of direct Medplum calls
 * Provides secure, server-side FHIR operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { backendFHIRService } from '../services/backendFHIRService';

/**
 * Patients hook - uses backend FHIR API
 */
export function usePatients(params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  sortBy?: string; 
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: async () => {
      const result = await backendFHIRService.searchPatients(params);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}

/**
 * Single patient hook
 */
export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const patient = await backendFHIRService.getPatient(id);
      return patient;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

/**
 * Create patient mutation
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientData: any) => {
      return await backendFHIRService.createPatient(patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      notifications.show({
        title: 'Success',
        message: 'Patient created successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to create patient: ${error.message}`,
        color: 'red'
      });
    }
  });
}

/**
 * Update patient mutation
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await backendFHIRService.updatePatient(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      notifications.show({
        title: 'Success',
        message: 'Patient updated successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to update patient: ${error.message}`,
        color: 'red'
      });
    }
  });
}

/**
 * Delete patient mutation
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await backendFHIRService.deletePatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      notifications.show({
        title: 'Success',
        message: 'Patient deleted successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to delete patient: ${error.message}`,
        color: 'red'
      });
    }
  });
}

/**
 * Practitioners hook
 */
export function usePractitioners(params?: { 
  page?: number; 
  limit?: number; 
  specialty?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['practitioners', params],
    queryFn: async () => {
      const result = await backendFHIRService.searchPractitioners(params);
      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

/**
 * Single practitioner hook
 */
export function usePractitioner(id: string) {
  return useQuery({
    queryKey: ['practitioner', id],
    queryFn: async () => {
      const practitioner = await backendFHIRService.getPractitioner(id);
      return practitioner;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

/**
 * Appointments hook
 */
export function useAppointments(params?: { 
  page?: number; 
  limit?: number; 
  patientId?: string;
  practitionerId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const result = await backendFHIRService.searchAppointments(params);
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  });
}

/**
 * Create appointment mutation
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentData: any) => {
      return await backendFHIRService.createAppointment(appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      notifications.show({
        title: 'Success',
        message: 'Appointment created successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to create appointment: ${error.message}`,
        color: 'red'
      });
    }
  });
}

/**
 * Update appointment mutation
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await backendFHIRService.updateAppointment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      notifications.show({
        title: 'Success',
        message: 'Appointment updated successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to update appointment: ${error.message}`,
        color: 'red'
      });
    }
  });
}

/**
 * Observations hook
 */
export function useObservations(params?: { 
  page?: number; 
  limit?: number; 
  patientId?: string;
  category?: string;
  code?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['observations', params],
    queryFn: async () => {
      const result = await backendFHIRService.searchObservations(params);
      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

/**
 * Create observation mutation
 */
export function useCreateObservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (observationData: any) => {
      return await backendFHIRService.createObservation(observationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      notifications.show({
        title: 'Success',
        message: 'Observation created successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to create observation: ${error.message}`,
        color: 'red'
      });
    }
  });
}

/**
 * Medications hook
 */
export function useMedications(params?: { 
  page?: number; 
  limit?: number; 
  patientId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['medications', params],
    queryFn: async () => {
      const result = await backendFHIRService.searchMedications(params);
      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

/**
 * Create medication mutation
 */
export function useCreateMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (medicationData: any) => {
      return await backendFHIRService.createMedication(medicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      notifications.show({
        title: 'Success',
        message: 'Medication created successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to create medication: ${error.message}`,
        color: 'red'
      });
    }
  });
}