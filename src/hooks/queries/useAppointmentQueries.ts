import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFHIRService } from '../../services/backendFHIRService';
import { Appointment } from '../../types';
import { Appointment as FHIRAppointment } from '@medplum/fhirtypes';

/**
 * Fetch appointments with optional filters
 */
export function useAppointments(date?: Date) {
    return useQuery({
        queryKey: ['appointments', date?.toISOString()],
        queryFn: async () => {
            try {
                console.log('Fetching appointments from backend FHIR service...');

                // Build search parameters
                const searchParams: any = {
                    _sort: '-date',
                    _count: '50'
                };

                if (date) {
                    const dateStr = date.toISOString().split('T')[0];
                    searchParams.date = [`ge${dateStr}`, `lt${dateStr}T23:59:59`];
                }

                const response = await backendFHIRService.searchAppointments(searchParams);
                const appointmentsData = Array.isArray(response?.data) ? response.data : [];

                const result: Appointment[] = appointmentsData.map((apt: any) => ({
                    id: apt.id,
                    patientId: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Patient/'))?.actor?.reference?.split('/')[1] || '',
                    patientName: apt.participant?.find((p: any) => p.actor?.display)?.actor?.display || 'Unknown Patient',
                    providerId: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'))?.actor?.reference?.split('/')[1] || '',
                    providerName: apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'))?.actor?.display || 'Unknown Provider',
                    date: new Date(apt.start || Date.now()),
                    duration: apt.minutesDuration || 30,
                    type: apt.appointmentType?.text || 'consultation',
                    status: apt.status || 'scheduled',
                    notes: apt.comment || '',
                    createdAt: new Date(apt.meta?.lastUpdated || Date.now()),
                    updatedAt: new Date(apt.meta?.lastUpdated || Date.now()),
                    sessionType: apt.serviceType?.[0]?.text || 'video',
                    meetingLink: apt.telecom?.find((t: any) => t.system === 'url')?.value || '',
                    symptoms: apt.reasonCode?.map((r: any) => r.text) || [],
                    diagnosis: apt.diagnosis?.[0]?.condition?.display || null,
                    prescription: null,
                    followUpRequired: apt.supportingInformation?.length > 0 || false,
                })).filter(apt => apt.patientId && apt.providerId); // Filter out appointments without valid patient or provider IDs

                console.log(`Successfully fetched ${result.length} appointments from backend FHIR service`);
                return result;
            } catch (error) {
                console.log('Failed to fetch appointments from backend FHIR service, using mock data:', error);

                // Comprehensive mock data - fallback only
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
                ];

                if (date) {
                    return mockAppointments.filter(appointment =>
                        appointment.date.toDateString() === date.toDateString()
                    );
                }

                return mockAppointments;
            }
        },
    });
}

/**
 * Mutation hook for creating an appointment
 */
export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointmentData: Partial<Appointment>) => {
            try {
                console.log('Creating appointment in backend FHIR service...');

                const fhirAppointment: FHIRAppointment = {
                    resourceType: 'Appointment',
                    status: 'booked',
                    start: appointmentData.date?.toISOString(),
                    end: new Date(appointmentData.date!.getTime() + (appointmentData.duration || 30) * 60000).toISOString(),
                    participant: [
                        {
                            actor: { reference: `Patient/${appointmentData.patientId}` },
                            status: 'accepted',
                        },
                        {
                            actor: { reference: `Practitioner/${appointmentData.providerId}` },
                            status: 'accepted',
                        },
                    ],
                    comment: appointmentData.notes,
                    description: appointmentData.type,
                };

                const createdAppointment = await backendFHIRService.createAppointment(fhirAppointment);

                const result: Appointment = {
                    id: createdAppointment.id,
                    patientId: appointmentData.patientId || '',
                    patientName: appointmentData.patientName || 'Unknown',
                    providerId: appointmentData.providerId || '',
                    providerName: appointmentData.providerName || 'Unknown',
                    date: new Date(createdAppointment.start || Date.now()),
                    duration: appointmentData.duration || 30,
                    type: appointmentData.type || 'consultation',
                    status: 'scheduled',
                    notes: appointmentData.notes || '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    sessionType: 'video',
                    meetingLink: '',
                    symptoms: [],
                    diagnosis: null,
                    prescription: null,
                    followUpRequired: false,
                };

                console.log('Successfully created appointment in backend FHIR service');
                return result;
            } catch (error) {
                console.error('Failed to create appointment:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
        },
    });
}
