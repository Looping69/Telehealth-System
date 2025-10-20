import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
export declare const globalErrorHandler: (error: any, req: Request, res: Response, _next: NextFunction) => void;
export declare const createValidationError: (errors: Record<string, string>) => AppError;
export declare const createAuthError: (message?: string) => AppError;
export declare const createForbiddenError: (message?: string) => AppError;
export declare const createNotFoundError: (resource?: string) => AppError;
//# sourceMappingURL=error.d.ts.map