export interface SearchParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
}
export interface SearchResult<T> {
    resources: T[];
    total: number;
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare class MedplumService {
    private client;
    private useMock;
    constructor();
    setAuthToken(token: string): void;
    searchPatients(params: SearchParams): Promise<{
        patients: any[];
        total: number;
        pagination: SearchResult<any>['pagination'];
    }>;
    private mockPatients;
    private mockAppointments;
    getPatient(id: string): Promise<any>;
    createPatient(patientData: any): Promise<any>;
    updatePatient(id: string, patientData: any): Promise<any>;
    deletePatient(id: string): Promise<void>;
    searchPractitioners(params: SearchParams & {
        specialty?: string;
    }): Promise<{
        practitioners: any[];
        total: number;
        pagination: SearchResult<any>['pagination'];
    }>;
    getPractitioner(id: string): Promise<any>;
    searchAppointments(params: SearchParams & {
        patientId?: string;
        practitionerId?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        appointments: any[];
        total: number;
        pagination: SearchResult<any>['pagination'];
    }>;
    createAppointment(appointmentData: any): Promise<any>;
    updateAppointment(id: string, appointmentData: any): Promise<any>;
    searchObservations(params: SearchParams & {
        patientId?: string;
        category?: string;
        code?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        observations: any[];
        total: number;
        pagination: SearchResult<any>['pagination'];
    }>;
    createObservation(observationData: any): Promise<any>;
    searchMedications(params: SearchParams & {
        patientId?: string;
        status?: string;
    }): Promise<{
        medications: any[];
        total: number;
        pagination: SearchResult<any>['pagination'];
    }>;
    createMedication(medicationData: any): Promise<any>;
    searchResources(resourceType: string, params: SearchParams): Promise<SearchResult<any>>;
    getResource(resourceType: string, id: string): Promise<any>;
    createResource(resourceType: string, resourceData: any): Promise<any>;
    updateResource(resourceType: string, id: string, resourceData: any): Promise<any>;
    deleteResource(resourceType: string, id: string): Promise<void>;
    private buildSearchParams;
    private buildPagination;
}
//# sourceMappingURL=medplumService.d.ts.map