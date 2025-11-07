import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medplum } from '@/lib/medplum';
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
export const usePatientProfile = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-profile', user?.id],
    queryFn: async (): Promise<Patient | null> => {
      if (!user?.id) return null;
      
      try {
        // Search for patient by user ID or email
        const searchResult = await medplum.searchResources('Patient', {
          identifier: user.id,
          _count: 1
        });
        
        return searchResult.length > 0 ? searchResult[0] : null;
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
        
        const observations = await medplum.searchResources('Observation', searchParams);
        return observations;
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
export const useWeightTracking = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['weight-tracking', user?.id],
    queryFn: async (): Promise<Observation[]> => {
      if (!user?.id) return [];
      
      try {
        const weightObservations = await medplum.searchResources('Observation', {
          subject: `Patient/${user.id}`,
          code: '29463-7', // LOINC code for body weight
          _sort: '-date',
          _count: 30
        });
        
        return weightObservations;
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
export const usePatientMedications = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-medications', user?.id],
    queryFn: async (): Promise<MedicationRequest[]> => {
      if (!user?.id) return [];
      
      try {
        const medications = await medplum.searchResources('MedicationRequest', {
          subject: `Patient/${user.id}`,
          _sort: '-authored-on',
          _count: 20
        });
        
        return medications;
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
export const usePatientCommunications = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-communications', user?.id],
    queryFn: async (): Promise<Communication[]> => {
      if (!user?.id) return [];
      
      try {
        const communications = await medplum.searchResources('Communication', {
          subject: `Patient/${user.id}`,
          _sort: '-sent',
          _count: 50
        });
        
        return communications;
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
export const usePatientAppointments = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['patient-appointments', user?.id],
    queryFn: async (): Promise<Appointment[]> => {
      if (!user?.id) return [];
      
      try {
        const appointments = await medplum.searchResources('Appointment', {
          actor: `Patient/${user.id}`,
          _sort: 'date',
          _count: 20
        });
        
        return appointments;
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
      
      return await medplum.createResource(observation);
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
      
      return await medplum.createResource(communication);
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
export const useUpdatePatientProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (patientData: Partial<Patient>): Promise<Patient> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First get the current patient resource
      const currentPatient = await medplum.searchOne('Patient', {
        identifier: user.id
      });
      
      if (!currentPatient) {
        throw new Error('Patient profile not found');
      }
      
      const updatedPatient: Patient = {
        ...currentPatient,
        ...patientData
      };
      
      return await medplum.updateResource(updatedPatient);
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
      
      return await medplum.createResource(appointment);
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