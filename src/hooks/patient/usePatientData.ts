import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFHIRService } from '@/services/backendFHIRService';
import { Patient, Observation, MedicationRequest, Communication, Appointment } from '@medplum/fhirtypes';
import { useAuthStore } from '@/store/authStore';

/**
 * Patient Data Hooks
 * 
 * Purpose: FHIR integration hooks for patient-specific data operations
 * Features:
 * - Patient profile management
 * - Observation data (vitals, weight, symptoms)
 * - Medication tracking and requests
 * - Communication with providers
 * - Appointment management
 * 
 * Inputs: Patient ID from auth context
 * Outputs: Query results and mutation functions for patient data
 */

// Patient Profile Hook
/**
 * usePatientProfile
 * Purpose: Fetch the authenticated patient's profile via backend FHIR gateway.
 * Inputs: Patient ID from auth store (derived from logged-in user).
 * Outputs: FHIR Patient resource or null when not found.
 */
export const usePatientProfile = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-profile', user?.id],
    queryFn: async (): Promise<Patient | null> => {
      if (!user?.id) return null;
      
      try {
        // Search patient via backend FHIR gateway
        const result = await backendFHIRService.searchResources('Patient', {
          identifier: user.id,
          _count: 1
        });
        const patients = result?.data ?? [];
        return patients.length > 0 ? (patients[0] as Patient) : null;
      } catch (error) {
        console.error('Error fetching patient profile:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Patient Observations Hook (Weight, Vitals, etc.)
/**
 * usePatientObservations
 * Purpose: Retrieve patient observations (optionally filtered by category).
 * Inputs: Optional `category` string; uses patient ID from auth store.
 * Outputs: Array of FHIR Observation resources.
 */
export const usePatientObservations = (category?: string) => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-observations', user?.id, category],
    queryFn: async (): Promise<Observation[]> => {
      if (!user?.id) return [];
      
      try {
        const searchParams: any = {
          subject: `Patient/${user.id}`,
          _sort: '-date',
          _count: 50
        };
        
        if (category) {
          searchParams.category = category;
        }
        // Fetch observations through backend FHIR gateway
        const result = await backendFHIRService.searchResources('Observation', searchParams);
        return (result?.data as Observation[]) ?? [];
      } catch (error) {
        console.error('Error fetching patient observations:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Weight Tracking Hook
/**
 * useWeightTracking
 * Purpose: Retrieve recent body weight observations for the patient.
 * Inputs: None; uses patient ID from auth store.
 * Outputs: Array of FHIR Observation resources (weight entries).
 */
export const useWeightTracking = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['weight-tracking', user?.id],
    queryFn: async (): Promise<Observation[]> => {
      if (!user?.id) return [];
      
      try {
        const result = await backendFHIRService.searchResources('Observation', {
          subject: `Patient/${user.id}`,
          code: '29463-7', // LOINC code for body weight
          _sort: '-date',
          _count: 30
        });
        return (result?.data as Observation[]) ?? [];
      } catch (error) {
        console.error('Error fetching weight data:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
};

// Medication Requests Hook
/**
 * usePatientMedications
 * Purpose: Retrieve recent medication requests for the patient.
 * Inputs: None; uses patient ID from auth store.
 * Outputs: Array of FHIR MedicationRequest resources.
 */
export const usePatientMedications = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-medications', user?.id],
    queryFn: async (): Promise<MedicationRequest[]> => {
      if (!user?.id) return [];
      
      try {
        // Use generic resource search for MedicationRequest via backend
        const result = await backendFHIRService.searchResources('MedicationRequest', {
          subject: `Patient/${user.id}`,
          _sort: '-authored-on',
          _count: 20
        });
        return (result?.data as MedicationRequest[]) ?? [];
      } catch (error) {
        console.error('Error fetching patient medications:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Patient Communications Hook
/**
 * usePatientCommunications
 * Purpose: Retrieve recent communications for the patient.
 * Inputs: None; uses patient ID from auth store.
 * Outputs: Array of FHIR Communication resources.
 */
export const usePatientCommunications = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-communications', user?.id],
    queryFn: async (): Promise<Communication[]> => {
      if (!user?.id) return [];
      
      try {
        const result = await backendFHIRService.searchResources('Communication', {
          subject: `Patient/${user.id}`,
          _sort: '-sent',
          _count: 50
        });
        return (result?.data as Communication[]) ?? [];
      } catch (error) {
        console.error('Error fetching patient communications:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute for real-time messaging
  });
};

// Patient Appointments Hook
/**
 * usePatientAppointments
 * Purpose: Retrieve upcoming appointments for the patient.
 * Inputs: None; uses patient ID from auth store.
 * Outputs: Array of FHIR Appointment resources.
 */
export const usePatientAppointments = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-appointments', user?.id],
    queryFn: async (): Promise<Appointment[]> => {
      if (!user?.id) return [];
      
      try {
        const result = await backendFHIRService.searchResources('Appointment', {
          actor: `Patient/${user.id}`,
          _sort: 'date',
          _count: 20
        });
        return (result?.data as Appointment[]) ?? [];
      } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create Observation Mutation
/**
 * useCreateObservation
 * Purpose: Create a new Observation for the patient via backend FHIR.
 * Inputs: Partial Observation payload (e.g., code, value, effectiveDateTime).
 * Outputs: Created FHIR Observation resource.
 */
export const useCreateObservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (observationData: Partial<Observation>): Promise<Observation> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const observation: Observation = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Body weight'
            }
          ]
        },
        subject: {
          reference: `Patient/${user.id}`
        },
        effectiveDateTime: new Date().toISOString(),
        ...observationData
      };
      
      // Create observation via backend FHIR gateway
      const created = await backendFHIRService.createResource('Observation', observation);
      return created as Observation;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['patient-observations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weight-tracking', user?.id] });
    },
    onError: (error) => {
      console.error('Error creating observation:', error);
    }
  });
};

// Create Communication Mutation
/**
 * useCreateCommunication
 * Purpose: Create a new Communication for the patient via backend FHIR.
 * Inputs: Partial Communication payload (e.g., payload content, sent time).
 * Outputs: Created FHIR Communication resource.
 */
export const useCreateCommunication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (communicationData: Partial<Communication>): Promise<Communication> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const communication: Communication = {
        resourceType: 'Communication',
        status: 'completed',
        subject: {
          reference: `Patient/${user.id}`
        },
        sent: new Date().toISOString(),
        ...communicationData
      };
      
      // Create communication via backend FHIR gateway
      const created = await backendFHIRService.createResource('Communication', communication);
      return created as Communication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-communications', user?.id] });
    },
    onError: (error) => {
      console.error('Error creating communication:', error);
    }
  });
};

// Update Patient Profile Mutation
/**
 * useUpdatePatientProfile
 * Purpose: Update the authenticated patient's profile via backend FHIR.
 * Inputs: Partial Patient payload with fields to update.
 * Outputs: Updated FHIR Patient resource.
 */
export const useUpdatePatientProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (patientData: Partial<Patient>): Promise<Patient> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First get the current patient resource via backend
      const search = await backendFHIRService.searchResources('Patient', {
        identifier: user.id,
        _count: 1
      });
      const currentPatient = (search?.data ?? [])[0] as Patient | undefined;
      
      if (!currentPatient) {
        throw new Error('Patient profile not found');
      }
      
      const updatedPatient: Patient = {
        ...currentPatient,
        ...patientData
      };
      
      // Update patient via backend FHIR gateway
      const updated = await backendFHIRService.updateResource('Patient', currentPatient.id as string, updatedPatient);
      return updated as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating patient profile:', error);
    }
  });
};

// Create Appointment Request Mutation
/**
 * useCreateAppointmentRequest
 * Purpose: Create a proposed Appointment for the patient via backend FHIR.
 * Inputs: Partial Appointment payload (e.g., description, start time).
 * Outputs: Created FHIR Appointment resource.
 */
export const useCreateAppointmentRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const appointment: Appointment = {
        resourceType: 'Appointment',
        status: 'proposed',
        participant: [
          {
            actor: {
              reference: `Patient/${user.id}`
            },
            status: 'accepted'
          }
        ],
        ...appointmentData
      };
      
      // Create appointment via backend FHIR gateway
      const created = await backendFHIRService.createResource('Appointment', appointment);
      return created as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments', user?.id] });
    },
    onError: (error) => {
      console.error('Error creating appointment request:', error);
    }
  });
};

// Utility function to format FHIR date
export const formatFhirDate = (date: string | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

// Utility function to get observation value
export const getObservationValue = (observation: Observation): string => {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit || ''}`;
  }
  if (observation.valueString) {
    return observation.valueString;
  }
  if (observation.valueCodeableConcept) {
    return observation.valueCodeableConcept.text || 'N/A';
  }
  return 'N/A';
};