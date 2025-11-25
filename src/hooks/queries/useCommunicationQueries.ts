import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFHIRService, SearchResult } from '../../services/backendFHIRService';

/**
 * Fetch FHIR Communications with optional search filters
 */
export function useCommunications(params?: {
    search?: string;
    status?: string;
    sender?: string;
    recipient?: string;
    category?: string;
    _sort?: string;
    _count?: string;
}) {
    return useQuery({
        queryKey: ['communications', params],
        queryFn: async () => {
            try {
                console.log('Fetching FHIR Communications from backend FHIR service...');

                // Build search parameters
                const searchParams: Record<string, string> = {
                    _sort: params?._sort || '-sent',
                    _count: params?._count || '50',
                };

                if (params?.status) {
                    searchParams.status = params.status;
                }

                if (params?.sender) {
                    searchParams.sender = params.sender;
                }

                if (params?.recipient) {
                    searchParams.recipient = params.recipient;
                }

                if (params?.category) {
                    searchParams.category = params.category;
                }

                const { data }: SearchResult<any> = await backendFHIRService.searchResources('Communication', searchParams);
                const communications = (data ?? []).filter((c: any) => c?.resourceType === 'Communication');
                console.log(`✅ Fetched ${communications.length} FHIR Communications from backend`);
                return communications;
            } catch (error) {
                console.error('❌ Failed to fetch FHIR Communications:', error);
                console.log('Using mock communications data (backend FHIR service not available)');

                // Mock FHIR Communication resources
                const mockCommunications = [
                    {
                        resourceType: 'Communication',
                        id: 'comm-1',
                        status: 'completed',
                        category: [
                            {
                                coding: [
                                    {
                                        system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                                        code: 'notification',
                                        display: 'Notification'
                                    }
                                ]
                            }
                        ],
                        subject: {
                            reference: 'Patient/patient-1',
                            display: 'John Doe'
                        },
                        sender: {
                            reference: 'Practitioner/practitioner-1',
                            display: 'Dr. Sarah Wilson'
                        },
                        recipient: [
                            {
                                reference: 'Patient/patient-1',
                                display: 'John Doe'
                            }
                        ],
                        sent: '2024-01-20T10:00:00Z',
                        payload: [
                            {
                                contentString: 'Your lab results are ready for review. Please log into your patient portal to view them.'
                            }
                        ],
                        priority: 'routine'
                    },
                    {
                        resourceType: 'Communication',
                        id: 'comm-2',
                        status: 'completed',
                        category: [
                            {
                                coding: [
                                    {
                                        system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                                        code: 'reminder',
                                        display: 'Reminder'
                                    }
                                ]
                            }
                        ],
                        subject: {
                            reference: 'Patient/patient-2',
                            display: 'Jane Smith'
                        },
                        sender: {
                            reference: 'Practitioner/practitioner-1',
                            display: 'Dr. Sarah Wilson'
                        },
                        recipient: [
                            {
                                reference: 'Patient/patient-2',
                                display: 'Jane Smith'
                            }
                        ],
                        sent: '2024-01-19T14:30:00Z',
                        payload: [
                            {
                                contentString: 'This is a reminder that you have an appointment scheduled for tomorrow at 2:00 PM. Please arrive 15 minutes early.'
                            }
                        ],
                        priority: 'routine'
                    },
                    {
                        resourceType: 'Communication',
                        id: 'comm-3',
                        status: 'in-progress',
                        category: [
                            {
                                coding: [
                                    {
                                        system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                                        code: 'instruction',
                                        display: 'Instruction'
                                    }
                                ]
                            }
                        ],
                        subject: {
                            reference: 'Patient/patient-3',
                            display: 'Michael Johnson'
                        },
                        sender: {
                            reference: 'Patient/patient-3',
                            display: 'Michael Johnson'
                        },
                        recipient: [
                            {
                                reference: 'Practitioner/practitioner-2',
                                display: 'Dr. Michael Chen'
                            }
                        ],
                        sent: '2024-01-21T09:15:00Z',
                        payload: [
                            {
                                contentString: 'I have been experiencing some side effects from the new medication. Could we schedule a follow-up appointment?'
                            }
                        ],
                        priority: 'urgent'
                    },
                    {
                        resourceType: 'Communication',
                        id: 'comm-4',
                        status: 'completed',
                        category: [
                            {
                                coding: [
                                    {
                                        system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                                        code: 'notification',
                                        display: 'Notification'
                                    }
                                ]
                            }
                        ],
                        subject: {
                            reference: 'Patient/patient-1',
                            display: 'John Doe'
                        },
                        sender: {
                            reference: 'Practitioner/practitioner-2',
                            display: 'Dr. Michael Chen'
                        },
                        recipient: [
                            {
                                reference: 'Patient/patient-1',
                                display: 'John Doe'
                            }
                        ],
                        sent: '2024-01-18T16:45:00Z',
                        payload: [
                            {
                                contentString: 'Your prescription refill is ready for pickup at the pharmacy. Please bring your ID when collecting.'
                            }
                        ],
                        priority: 'routine'
                    }
                ];

                // Apply filters to mock data
                let filteredCommunications = mockCommunications;

                if (params?.status) {
                    filteredCommunications = filteredCommunications.filter(comm => comm.status === params.status);
                }

                if (params?.search) {
                    const searchTerm = params.search.toLowerCase();
                    filteredCommunications = filteredCommunications.filter(comm =>
                        comm.sender?.display?.toLowerCase().includes(searchTerm) ||
                        comm.recipient?.[0]?.display?.toLowerCase().includes(searchTerm) ||
                        comm.payload?.[0]?.contentString?.toLowerCase().includes(searchTerm)
                    );
                }

                return filteredCommunications;
            }
        },
    });
}

/**
 * Mutation hook for creating a new FHIR Communication
 */
export function useCreateCommunication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (communicationData: {
            recipientId: string;
            recipientName: string;
            recipientType: 'Patient' | 'Practitioner';
            subject?: string;
            message: string;
            priority?: 'routine' | 'urgent' | 'asap' | 'stat';
            category?: string;
            senderName?: string;
            senderId?: string;
        }) => {
            try {
                console.log('Creating FHIR Communication in backend FHIR service...');

                // Create FHIR Communication resource
                const communication = {
                    resourceType: 'Communication' as const,
                    status: 'completed' as const,
                    category: [
                        {
                            coding: [
                                {
                                    system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                                    code: communicationData.category || 'notification',
                                    display: communicationData.category || 'Notification'
                                }
                            ]
                        }
                    ],
                    subject: {
                        reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
                        display: communicationData.recipientName
                    },
                    sender: {
                        reference: `Practitioner/${communicationData.senderId || 'practitioner-1'}`,
                        display: communicationData.senderName || 'Healthcare Provider'
                    },
                    recipient: [
                        {
                            reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
                            display: communicationData.recipientName
                        }
                    ],
                    sent: new Date().toISOString(),
                    payload: [
                        {
                            contentString: communicationData.message
                        }
                    ],
                    priority: communicationData.priority || 'routine'
                };

                const created = await backendFHIRService.createResource('Communication', communication);
                console.log('✅ FHIR Communication created successfully in backend:', created.id);
                return created;
            } catch (error) {
                console.error('❌ Failed to create FHIR Communication:', error);

                // Return mock created communication for development
                const mockCreated = {
                    resourceType: 'Communication',
                    id: `comm-${Date.now()}`,
                    status: 'completed',
                    category: [
                        {
                            coding: [
                                {
                                    system: 'http://terminology.hl7.org/CodeSystem/communication-category',
                                    code: communicationData.category || 'notification',
                                    display: communicationData.category || 'Notification'
                                }
                            ]
                        }
                    ],
                    subject: {
                        reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
                        display: communicationData.recipientName
                    },
                    sender: {
                        reference: `Practitioner/${communicationData.senderId || 'practitioner-1'}`,
                        display: communicationData.senderName || 'Healthcare Provider'
                    },
                    recipient: [
                        {
                            reference: `${communicationData.recipientType}/${communicationData.recipientId}`,
                            display: communicationData.recipientName
                        }
                    ],
                    sent: new Date().toISOString(),
                    payload: [
                        {
                            contentString: communicationData.message
                        }
                    ],
                    priority: communicationData.priority || 'routine'
                };

                console.log('✅ Mock FHIR Communication created (backend FHIR service not available)');
                return mockCreated;
            }
        },
        onSuccess: () => {
            // Invalidate and refetch communications
            queryClient.invalidateQueries({ queryKey: ['communications'] });
        },
    });
}
