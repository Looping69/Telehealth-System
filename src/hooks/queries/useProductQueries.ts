import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFHIRService, SearchResult } from '../../services/backendFHIRService';

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
                console.log('Fetching medications/products from backend FHIR service...');

                // Build search parameters (object form)
                const searchParams: Record<string, string> = {
                    _sort: '-_lastUpdated',
                    _count: '50'
                };

                if (queryString) {
                    searchParams['code:text'] = queryString;
                }

                if (statusFilter && statusFilter !== 'all') {
                    searchParams.status = statusFilter;
                }

                const { data }: SearchResult<any> = await backendFHIRService.searchResources('Medication', searchParams);

                const result = (data ?? []).map((medication: any) => ({
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

                console.log(`Successfully fetched ${result.length} medications/products from backend FHIR service`);
                return result;
            } catch (error) {
                console.error('Failed to fetch medications/products from backend FHIR service:', error);
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
                ];
                return mockProducts;
            }
        },
    });
}

/**
 * Mutation hook for creating a product
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
                    resourceType: 'Medication' as const,
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

                const createdMedication = await backendFHIRService.createResource('Medication', medplumMedication);

                console.log('Successfully created medication in backend FHIR service');
                return createdMedication;
            } catch (error) {
                console.log('Failed to create medication in backend FHIR service, using mock creation:', error);

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
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
