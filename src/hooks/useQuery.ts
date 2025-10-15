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
export function usePatients(searchQuery?: string | { search?: string; status?: string; page?: number; limit?: number }) {
  // Handle both string and object parameters for backward compatibility
  const queryString = typeof searchQuery === 'string' ? searchQuery : searchQuery?.search;
  const statusFilter = typeof searchQuery === 'object' ? searchQuery?.status : undefined;
  
  return useQuery({
    queryKey: ['patients', queryString, statusFilter],
    queryFn: async () => {
      // Always use mock data for now since Medplum server is not available
      console.log('Using mock patient data (Medplum server not available)');
      
      // Comprehensive mock data - always returned
      const mockPatients: Patient[] = [
          {
            id: '1',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phone: '+1-555-0123',
            dateOfBirth: '1985-06-15',
            gender: 'male',
            status: 'active',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-20'),
            address: '123 Main St, New York, NY 10001',
            emergencyContact: 'Jane Doe - +1-555-0124',
            insurance: 'Blue Cross Blue Shield',
            medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
            allergies: ['Penicillin', 'Shellfish'],
            lastVisit: new Date('2024-01-18'),
            nextAppointment: new Date('2024-02-15'),
          },
          {
            id: '2',
            name: 'Jane Smith',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@email.com',
            phone: '+1-555-0456',
            dateOfBirth: '1990-03-22',
            gender: 'female',
            status: 'active',
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-18'),
            address: '456 Oak Ave, Los Angeles, CA 90210',
            emergencyContact: 'Robert Smith - +1-555-0457',
            insurance: 'Aetna',
            medicalHistory: ['Asthma', 'Seasonal Allergies'],
            allergies: ['Pollen', 'Dust mites'],
            lastVisit: new Date('2024-01-16'),
            nextAppointment: new Date('2024-02-10'),
          },
          {
            id: '3',
            name: 'Michael Johnson',
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael.johnson@email.com',
            phone: '+1-555-0789',
            dateOfBirth: '1978-11-08',
            gender: 'male',
            status: 'active',
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-15'),
            address: '789 Pine St, Chicago, IL 60601',
            emergencyContact: 'Lisa Johnson - +1-555-0790',
            insurance: 'United Healthcare',
            medicalHistory: ['High Cholesterol', 'Arthritis'],
            allergies: ['Latex'],
            lastVisit: new Date('2024-01-12'),
            nextAppointment: new Date('2024-02-20'),
          },
          {
            id: '4',
            name: 'Sarah Wilson',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@email.com',
            phone: '+1-555-0321',
            dateOfBirth: '1992-07-14',
            gender: 'female',
            status: 'active',
            createdAt: new Date('2024-01-12'),
            updatedAt: new Date('2024-01-22'),
            address: '321 Elm Dr, Miami, FL 33101',
            emergencyContact: 'David Wilson - +1-555-0322',
            insurance: 'Cigna',
            medicalHistory: ['Migraine', 'Anxiety'],
            allergies: ['Sulfa drugs'],
            lastVisit: new Date('2024-01-20'),
            nextAppointment: new Date('2024-02-05'),
          },
          {
            id: '5',
            name: 'Robert Brown',
            firstName: 'Robert',
            lastName: 'Brown',
            email: 'robert.brown@email.com',
            phone: '+1-555-0654',
            dateOfBirth: '1965-09-30',
            gender: 'male',
            status: 'active',
            createdAt: new Date('2024-01-08'),
            updatedAt: new Date('2024-01-25'),
            address: '654 Maple Ln, Seattle, WA 98101',
            emergencyContact: 'Mary Brown - +1-555-0655',
            insurance: 'Kaiser Permanente',
            medicalHistory: ['Heart Disease', 'Diabetes', 'High Blood Pressure'],
            allergies: ['Aspirin', 'Iodine'],
            lastVisit: new Date('2024-01-23'),
            nextAppointment: new Date('2024-02-08'),
          },
          {
            id: '6',
            name: 'Emily Davis',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@email.com',
            phone: '+1-555-0987',
            dateOfBirth: '1988-12-03',
            gender: 'female',
            status: 'active',
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-19'),
            address: '987 Cedar St, Boston, MA 02101',
            emergencyContact: 'James Davis - +1-555-0988',
            insurance: 'Harvard Pilgrim',
            medicalHistory: ['Thyroid Disorder', 'Depression'],
            allergies: ['Codeine'],
            lastVisit: new Date('2024-01-17'),
            nextAppointment: new Date('2024-02-12'),
          },
          {
            id: '7',
            name: 'Christopher Lee',
            firstName: 'Christopher',
            lastName: 'Lee',
            email: 'chris.lee@email.com',
            phone: '+1-555-0147',
            dateOfBirth: '1995-04-18',
            gender: 'male',
            status: 'active',
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-26'),
            address: '147 Birch Ave, Denver, CO 80201',
            emergencyContact: 'Susan Lee - +1-555-0148',
            insurance: 'Anthem',
            medicalHistory: ['Sports Injury', 'Concussion History'],
            allergies: ['None known'],
            lastVisit: new Date('2024-01-24'),
            nextAppointment: new Date('2024-02-18'),
          },
          {
            id: '8',
            name: 'Amanda Garcia',
            firstName: 'Amanda',
            lastName: 'Garcia',
            email: 'amanda.garcia@email.com',
            phone: '+1-555-0258',
            dateOfBirth: '1983-08-25',
            gender: 'female',
            status: 'inactive',
            createdAt: new Date('2023-12-15'),
            updatedAt: new Date('2024-01-10'),
            address: '258 Willow Rd, Phoenix, AZ 85001',
            emergencyContact: 'Carlos Garcia - +1-555-0259',
            insurance: 'Blue Cross Blue Shield',
            medicalHistory: ['Fibromyalgia', 'Chronic Fatigue'],
            allergies: ['Morphine', 'Contrast dye'],
            lastVisit: new Date('2024-01-08'),
            nextAppointment: null,
          },
        ];
        
        let filteredPatients = mockPatients;
        
        // Apply search filter
        if (queryString && queryString.trim()) {
          const searchTerm = queryString.toLowerCase().trim();
          filteredPatients = filteredPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.firstName.toLowerCase().includes(searchTerm) ||
            patient.lastName.toLowerCase().includes(searchTerm) ||
            patient.email?.toLowerCase().includes(searchTerm) ||
            patient.phone?.toLowerCase().includes(searchTerm) ||
            patient.id.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
          filteredPatients = filteredPatients.filter(patient => 
            patient.status === statusFilter
          );
        }
        
        // Return data in the expected format with pagination info
        return {
          data: filteredPatients,
          total: filteredPatients.length,
          page: 1,
          limit: 12
        };
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
      // Always use mock data for now since Medplum server is not available
      console.log('Using mock appointment data (Medplum server not available)');
        
        // Comprehensive mock data - always returned
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
      // Always use mock data for now since Medplum server is not available
      console.log('Using mock orders data (Medplum server not available)');
        
      // Comprehensive mock data - always returned
      const mockOrders: Order[] = [
        {
          id: '1',
          patientId: '1',
          patientName: 'John Doe',
          providerId: '1',
          provider: 'Dr. Sarah Wilson',
          type: 'lab',
          title: 'Blood Work Panel',
          description: 'Complete blood count and metabolic panel',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date('2024-01-20'),
          orderDate: '2024-01-20',
          dueDate: '2024-01-25',
          notes: 'Patient should fast for 12 hours before blood draw',
        },
        {
          id: '2',
          patientId: '2',
          patientName: 'Jane Smith',
          providerId: '1',
          provider: 'Dr. Sarah Wilson',
          type: 'prescription',
          title: 'Medication Refill',
          description: 'Lisinopril 10mg daily',
          status: 'completed',
          priority: 'low',
          createdAt: new Date('2024-01-18'),
          orderDate: '2024-01-18',
          dueDate: '2024-01-22',
          notes: 'Patient has been on this medication for 6 months with good tolerance',
        },
        {
          id: '3',
          patientId: '3',
          patientName: 'Michael Johnson',
          providerId: '2',
          provider: 'Dr. Michael Chen',
          type: 'imaging',
          title: 'Chest X-Ray',
          description: 'Chest X-ray to rule out pneumonia',
          status: 'approved',
          priority: 'high',
          createdAt: new Date('2024-01-21'),
          orderDate: '2024-01-21',
          dueDate: '2024-01-23',
          notes: 'Patient has persistent cough and fever',
        },
        {
          id: '4',
          patientId: '1',
          patientName: 'John Doe',
          providerId: '1',
          provider: 'Dr. Sarah Wilson',
          type: 'prescription',
          title: 'Antibiotic Course',
          description: 'Amoxicillin 500mg three times daily for 7 days',
          status: 'pending',
          priority: 'urgent',
          createdAt: new Date('2024-01-22'),
          orderDate: '2024-01-22',
          dueDate: '2024-01-22',
          notes: 'For treatment of bacterial infection',
        },
      ];
      
      let filteredOrders = mockOrders;
      
      if (params?.status) {
        filteredOrders = filteredOrders.filter(order => order.status === params.status);
      }
      
      if (params?.search) {
        filteredOrders = filteredOrders.filter(order => 
          order.title.toLowerCase().includes(params.search!.toLowerCase()) ||
          order.patientName.toLowerCase().includes(params.search!.toLowerCase()) ||
          order.provider.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      
      return filteredOrders;
    },
  });
}

/**
 * Fetch dashboard metrics
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Always use mock data for now since Medplum server is not available
      console.log('Using mock dashboard metrics (Medplum server not available)');
        
        // Comprehensive mock data - always returned
        return {
          totalPatients: 1247,
          todayAppointments: 12,
          pendingOrders: 8,
          monthlyRevenue: 45600,
          patientGrowth: 12.5,
          appointmentTrends: [
            { label: 'Mon', value: 8 },
            { label: 'Tue', value: 12 },
            { label: 'Wed', value: 6 },
            { label: 'Thu', value: 15 },
            { label: 'Fri', value: 10 },
          ],
          revenueData: [
            { label: 'Jan', value: 42000 },
            { label: 'Feb', value: 38000 },
            { label: 'Mar', value: 45600 },
          ],
        };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
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
        
        const medplumAppointment = {
          resourceType: 'Appointment',
          status: appointmentData.status,
          start: appointmentData.date.toISOString(),
          end: new Date(appointmentData.date.getTime() + appointmentData.duration * 60000).toISOString(),
          minutesDuration: appointmentData.duration,
          participant: [
            {
              actor: {
                reference: `Patient/${appointmentData.patientId}`,
              },
              status: 'accepted',
            },
            {
              actor: {
                reference: `Practitioner/${appointmentData.providerId}`,
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
        };
        
        console.log('Successfully created appointment in Medplum');
        return result;
      } catch (error) {
        console.log('Failed to create appointment in Medplum, using mock creation:', error);
        
        // Fallback to mock creation
        const newAppointment: Appointment = {
          ...appointmentData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        return newAppointment;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}