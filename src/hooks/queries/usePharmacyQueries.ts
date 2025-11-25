import { useQuery } from '@tanstack/react-query';
import { backendFHIRService } from '../../services/backendFHIRService';
import { Organization } from '@medplum/fhirtypes';

export const usePharmacies = (search?: string) => {
    return useQuery<Organization[], Error>({
        queryKey: ['pharmacies', search],
        queryFn: async () => {
            const searchParams: any = {
                type: 'prov', // Provider organizations often include pharmacies
                _sort: 'name',
                _count: '50'
            };

            if (search) {
                searchParams['name:contains'] = search;
            }

            const response = await backendFHIRService.searchResources('Organization', searchParams);
            return (response.data || []) as Organization[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
