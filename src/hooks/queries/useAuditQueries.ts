import { useQuery } from '@tanstack/react-query';
import { backendFHIRService } from '../../services/backendFHIRService';

/**
 * Fetch audit events with optional filters
 */
export function useAuditEvents(params?: { search?: string; status?: string }) {
    return useQuery({
        queryKey: ['auditEvents', params?.search, params?.status],
        queryFn: async () => {
            try {
                console.log('Fetching audit events from backend FHIR service...');
                const auditEvents = await backendFHIRService.searchResources('AuditEvent', {
                    _sort: '-date',
                    _count: '50',
                    ...(params?.search ? { 'entity.name': params.search } : {}),
                    ...(params?.status ? { outcome: params.status === 'success' ? '0' : '1' } : {}),
                });
                console.log('Successfully fetched audit events from backend FHIR service:', auditEvents?.total ?? 0);
                return auditEvents.data ?? [];
            } catch (err) {
                console.error('Error fetching audit events from backend FHIR service:', err);
                return [];
            }
        },
    });
}
