export interface MedplumUser {
    id: string;
    email: string;
    role: 'patient' | 'provider' | 'admin';
    resourceType: string;
    resourceId: string;
}
export declare const validateMedplumToken: (token: string) => Promise<MedplumUser>;
export declare const extractTokenFromHeader: (authHeader?: string) => string | null;
export declare const generateInternalToken: (payload: any) => string;
export declare const verifyInternalToken: (token: string) => any;
//# sourceMappingURL=jwt.d.ts.map