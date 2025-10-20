import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                resourceType: string;
                resourceId: string;
            };
        }
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: Request, __res: Response, next: NextFunction) => void;
export declare const authorizeOwnership: (userIdParam?: string) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorizePatient: (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorizeProvider: (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorizeAdmin: (req: Request, __res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map