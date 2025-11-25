/**
 * Custom hooks for Medplum FHIR operations
 * Provides data for development and testing, now integrating real Medplum data
 */

import { useQuery } from '@tanstack/react-query';
import {
  Task,
  MedicationRequest,
  ServiceRequest
} from '@medplum/fhirtypes';

/**
 * Dashboard metrics hook
 * Currently returns mock data
 */
export function useDashboardMetrics() {
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
          priority: 'urgent',
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

/**
 * Orders hook - returns order data from Medplum
 */
export function useOrders(params?: { _sort?: string; _count?: string }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { backendFHIRService } = await import('../services/backendFHIRService');

      // Build base params
      const baseParams = {
        _sort: '-_lastUpdated',
        ...params
      };

      // Fetch MedicationRequests with patient included
      const medRequestsResult = await backendFHIRService.searchResources('MedicationRequest', {
        ...baseParams,
        _include: 'MedicationRequest:patient'
      });

      // Fetch ServiceRequests with patient included
      const serviceRequestsResult = await backendFHIRService.searchResources('ServiceRequest', {
        ...baseParams,
        _include: 'ServiceRequest:patient'
      });

      const medRequests = medRequestsResult.data || [];
      const serviceRequests = serviceRequestsResult.data || [];

      const mapStatus = (status: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'approved' => {
        switch (status) {
          case 'active': return 'in_progress';
          case 'completed': return 'completed';
          case 'cancelled':
          case 'revoked':
          case 'stopped': return 'cancelled';
          case 'draft':
          case 'on-hold': return 'pending';
          default: return 'pending';
        }
      };

      const mapPriority = (priority: string): 'low' | 'medium' | 'high' | 'urgent' => {
        switch (priority) {
          case 'routine': return 'medium';
          case 'urgent': return 'urgent';
          case 'asap': return 'high';
          case 'stat': return 'urgent';
          default: return 'medium';
        }
      };

      // Normalize and combine
      const orders = [
        ...medRequests.map((req: MedicationRequest) => ({
          id: req.id || '',
          patientId: req.subject?.reference?.split('/')[1] || '',
          patientName: req.subject?.display || 'Unknown Patient',
          providerId: req.requester?.reference?.split('/')[1] || '',
          provider: req.requester?.display || 'Unknown Provider',
          type: 'prescription' as const,
          title: req.medicationCodeableConcept?.text || 'Medication Request',
          description: req.note?.[0]?.text || req.medicationCodeableConcept?.text || '',
          status: mapStatus(req.status || ''),
          priority: mapPriority(req.priority || ''),
          createdAt: new Date(req.meta?.lastUpdated || ''),
          orderDate: new Date(req.authoredOn || req.meta?.lastUpdated || '').toISOString().split('T')[0],
          dueDate: '', // Not always available in standard FHIR
          notes: req.note?.[0]?.text
        })),
        ...serviceRequests.map((req: ServiceRequest) => ({
          id: req.id || '',
          patientId: req.subject?.reference?.split('/')[1] || '',
          patientName: req.subject?.display || 'Unknown Patient',
          providerId: req.requester?.reference?.split('/')[1] || '',
          provider: req.requester?.display || 'Unknown Provider',
          type: 'lab' as const, // Defaulting to lab, could be imaging based on code
          title: req.code?.text || 'Service Request',
          description: req.code?.text || '',
          status: mapStatus(req.status || ''),
          priority: mapPriority(req.priority || ''),
          createdAt: new Date(req.meta?.lastUpdated || ''),
          orderDate: new Date(req.authoredOn || req.meta?.lastUpdated || '').toISOString().split('T')[0],
          dueDate: '',
          notes: req.note?.[0]?.text
        }))
      ];

      // Sort combined list
      return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  });
}