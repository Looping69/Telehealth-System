import { useQuery } from '@tanstack/react-query';
import { backendFHIRService, SearchResult } from '../../services/backendFHIRService';

/**
 * Fetch dashboard metrics
 * 
 * Purpose: Retrieve real counts and totals from Medplum FHIR backend for the dashboard.
 * Inputs: None (uses authenticated `medplumClient`).
 * Outputs: Object with `totalAppointments`, `totalPatients`, `totalRevenue`, `pendingAppointments`.
 */
export function useDashboardMetrics() {
    return useQuery({
        queryKey: ['dashboardMetrics'],
        queryFn: async () => {
            console.log('Fetching dashboard metrics from backend FHIR service...');
            try {
                // Use Bundle results to get accurate counts
                const [appointmentsResult, patientsResult, scheduledResult]: [SearchResult<any>, SearchResult<any>, SearchResult<any>] = await Promise.all([
                    backendFHIRService.searchResources('Appointment', { _summary: 'count' }),
                    backendFHIRService.searchResources('Patient', { _summary: 'count' }),
                    backendFHIRService.searchResources('Appointment', { status: 'booked', _summary: 'count' }),
                ]);

                // Revenue requires fetching actual invoices and summing amounts
                const paidInvoicesResult: SearchResult<any> = await backendFHIRService.searchResources('Invoice', { status: 'balanced', _count: '200' });

                const totalRevenue = (paidInvoicesResult.data ?? []).reduce((sum: number, inv: any) => {
                    const gross = inv.totalGross?.value ?? 0;
                    const net = inv.totalNet?.value ?? 0;
                    // Prefer gross if present, otherwise net
                    return sum + (gross || net);
                }, 0);

                const metrics = {
                    totalAppointments: appointmentsResult?.total ?? 0,
                    totalPatients: patientsResult?.total ?? 0,
                    totalRevenue,
                    pendingAppointments: scheduledResult?.total ?? 0,
                };

                console.log('Successfully fetched dashboard metrics from backend FHIR service:', metrics);
                return metrics;
            } catch (err: any) {
                // Propagate error so UI shows an error
                const message = err?.message || 'Unknown error';
                console.error('Error fetching dashboard metrics from backend FHIR service:', message);
                throw new Error(`Dashboard metrics fetch failed: ${message}`);
            }
        },
    });
}
