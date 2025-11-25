import { useQuery } from '@tanstack/react-query';
import { backendFHIRService } from '../../services/backendFHIRService';

export function useSystemMetadata() {
    return useQuery({
        queryKey: ['systemMetadata'],
        queryFn: async () => {
            try {
                console.log('Fetching FHIR system metadata from backend...');
                const metadata = await backendFHIRService.getMetadata();
                console.log('Successfully fetched FHIR metadata:', metadata);
                return metadata;
            } catch (err) {
                console.error('Error fetching FHIR metadata:', err);
                console.log('Using mock metadata (FHIR server not available)');
                return {
                    resourceType: 'CapabilityStatement',
                    status: 'active',
                    date: new Date().toISOString(),
                    publisher: 'Mock FHIR Server',
                    kind: 'instance',
                    software: {
                        name: 'Mock Medplum Server',
                        version: '1.0.0'
                    },
                    implementation: {
                        description: 'Mock FHIR R4 Server for Development',
                        url: 'https://api.medplum.com'
                    },
                    fhirVersion: '4.0.1',
                    format: ['application/fhir+json', 'application/fhir+xml'],
                    rest: [{
                        mode: 'server',
                        resource: [
                            { type: 'Patient' },
                            { type: 'Appointment' },
                            { type: 'ServiceRequest' },
                            { type: 'Invoice' },
                            { type: 'Task' },
                            { type: 'AuditEvent' },
                            { type: 'Coverage' }
                        ]
                    }]
                };
            }
        },
        enabled: false, // Don't auto-fetch, only when manually triggered
    });
}
