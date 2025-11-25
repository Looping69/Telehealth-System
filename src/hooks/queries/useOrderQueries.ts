import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFHIRService, SearchResult } from '../../services/backendFHIRService';
import { Order } from '../../types';
import { ServiceRequest, MedicationRequest } from '@medplum/fhirtypes';

/**
 * Fetch orders with optional filters
 */
export function useOrders(params?: { search?: string; status?: string }) {
    return useQuery({
        queryKey: ['orders', params?.search, params?.status],
        queryFn: async () => {
            try {
                console.log('Fetching orders from backend FHIR service...');

                // Build base search parameters
                const baseParams: Record<string, string> = {
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
                const serviceRequestParams: Record<string, string> = {
                    ...baseParams,
                    _include: 'ServiceRequest:patient'
                };

                const medicationRequestParams: Record<string, string> = {
                    ...baseParams,
                    _include: 'MedicationRequest:patient'
                };

                // Fetch both ServiceRequest and MedicationRequest resources
                const [serviceRequests, medicationRequests]: [SearchResult<any>, SearchResult<any>] = await Promise.all([
                    backendFHIRService.searchResources('ServiceRequest', serviceRequestParams),
                    backendFHIRService.searchResources('MedicationRequest', medicationRequestParams)
                ]);

                // Combine and return both types of orders
                const allOrders = [...(serviceRequests?.data ?? []), ...(medicationRequests?.data ?? [])];
                console.log('Successfully fetched orders from backend FHIR service:', allOrders.length);
                return allOrders;
            } catch (err) {
                console.error('Error fetching orders from backend FHIR service:', err);
                // Re-throw the error so the UI can handle it properly
                throw new Error(`Failed to fetch orders from backend FHIR service: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        },
    });
}

/**
 * Mutation hook for creating an order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderData: Partial<Order> & {
            pharmacyId?: string;
            pharmacyName?: string;
            medication?: string;
            instructions?: string;
            test?: string;
        }) => {
            try {
                console.log('Creating order in backend FHIR service...');

                let createdOrder;

                if (orderData.type === 'prescription') {
                    const medicationRequest: MedicationRequest = {
                        resourceType: 'MedicationRequest',
                        status: 'active',
                        intent: 'order',
                        subject: { reference: `Patient/${orderData.patientId}` },
                        requester: { reference: `Practitioner/${orderData.providerId}` },
                        medicationCodeableConcept: {
                            text: orderData.medication || 'Unknown Medication',
                        },
                        dosageInstruction: [{
                            text: orderData.instructions,
                        }],
                        dispenseRequest: orderData.pharmacyId ? {
                            performer: {
                                reference: `Organization/${orderData.pharmacyId}`,
                                display: orderData.pharmacyName
                            }
                        } : undefined
                    };
                    createdOrder = await backendFHIRService.createResource('MedicationRequest', medicationRequest);
                } else {
                    const serviceRequest: ServiceRequest = {
                        resourceType: 'ServiceRequest',
                        status: 'active',
                        intent: 'order',
                        subject: { reference: `Patient/${orderData.patientId}` },
                        requester: { reference: `Practitioner/${orderData.providerId}` },
                        code: {
                            text: orderData.test || 'Unknown Test',
                        },
                        note: orderData.notes ? [{ text: orderData.notes }] : undefined,
                    };
                    createdOrder = await backendFHIRService.createResource('ServiceRequest', serviceRequest);
                }

                console.log('Successfully created order in backend FHIR service');
                return createdOrder;
            } catch (error) {
                console.error('Failed to create order:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}
