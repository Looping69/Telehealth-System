/**
 * Custom hooks for Medplum FHIR operations
 * Provides mock data for development and testing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Patient, 
  Appointment, 
  Task, 
  DiagnosticReport, 
  Observation,
  Practitioner,
  Organization,
  Encounter,
  Medication,
  MedicationRequest,
  AllergyIntolerance,
  Condition,
  Procedure,
  DocumentReference,
  Bundle,
  Resource
} from '@medplum/fhirtypes';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '../store/authStore';







/**
 * Dashboard metrics hook
 */
export function useDashboardMetrics() {
  // Remove medplum dependency since we're using mock data
  
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Return mock data instead of making FHIR calls
      return {
        totalPatients: 1247,
        todayAppointments: 23,
        pendingOrders: 8,
        activeTasks: 15,
        monthlyRevenue: 45600,
        patientGrowth: 12.5,
        appointmentTrends: [
          { label: 'Mon', value: 8 },
          { label: 'Tue', value: 12 },
          { label: 'Wed', value: 15 },
          { label: 'Thu', value: 9 },
          { label: 'Fri', value: 18 },
          { label: 'Sat', value: 6 },
          { label: 'Sun', value: 4 }
        ],
        recentActivities: [
          {
            id: '1',
            type: 'appointment',
            description: 'New appointment scheduled with John Doe',
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            priority: 'medium'
          },
          {
            id: '2',
            type: 'lab-result',
            description: 'Lab results available for Jane Smith',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            priority: 'high'
          },
          {
            id: '3',
            type: 'task',
            description: 'Follow-up task completed',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            priority: 'low'
          }
        ]
      };
    }
  });
}


/**
 * Tasks hook - returns mock task data for development
 */
export function useTasks(params?: { _sort?: string; _count?: string }) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      // Return mock task data
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          resourceType: 'Task',
          status: 'in-progress',
          intent: 'order',
          priority: 'routine',
          description: 'Follow up with patient John Doe regarding lab results',
          authoredOn: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          lastModified: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          meta: {
            lastUpdated: new Date(Date.now() - 1800000).toISOString()
          },
          for: {
            reference: 'Patient/patient-1',
            display: 'John Doe'
          }
        },
        {
          id: 'task-2',
          resourceType: 'Task',
          status: 'completed',
          intent: 'order',
          priority: 'urgent',
          description: 'Review medication list for Jane Smith',
          authoredOn: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          lastModified: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          meta: {
            lastUpdated: new Date(Date.now() - 3600000).toISOString()
          },
          for: {
            reference: 'Patient/patient-2',
            display: 'Jane Smith'
          }
        },
        {
          id: 'task-3',
          resourceType: 'Task',
          status: 'requested',
          intent: 'order',
          priority: 'routine',
          description: 'Schedule follow-up appointment for Robert Johnson',
          authoredOn: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          lastModified: new Date(Date.now() - 10800000).toISOString(),
          meta: {
            lastUpdated: new Date(Date.now() - 10800000).toISOString()
          },
          for: {
            reference: 'Patient/patient-3',
            display: 'Robert Johnson'
          }
        },
        {
          id: 'task-4',
          resourceType: 'Task',
          status: 'in-progress',
          intent: 'order',
          priority: 'high',
          description: 'Process insurance authorization for Mary Wilson',
          authoredOn: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
          lastModified: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          meta: {
            lastUpdated: new Date(Date.now() - 7200000).toISOString()
          },
          for: {
            reference: 'Patient/patient-4',
            display: 'Mary Wilson'
          }
        },
        {
          id: 'task-5',
          resourceType: 'Task',
          status: 'completed',
          intent: 'order',
          priority: 'routine',
          description: 'Update patient contact information for David Brown',
          authoredOn: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
          lastModified: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
          meta: {
            lastUpdated: new Date(Date.now() - 14400000).toISOString()
          },
          for: {
            reference: 'Patient/patient-5',
            display: 'David Brown'
          }
        }
      ];

      // Apply sorting if specified
      if (params?._sort === '-_lastUpdated') {
        mockTasks.sort((a, b) => {
          const aTime = new Date(a.meta?.lastUpdated || a.lastModified || '').getTime();
          const bTime = new Date(b.meta?.lastUpdated || b.lastModified || '').getTime();
          return bTime - aTime; // Descending order
        });
      }

      // Apply count limit if specified
      const count = params?._count ? parseInt(params._count) : mockTasks.length;
      return mockTasks.slice(0, count);
    }
  });
}