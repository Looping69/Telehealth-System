import winston from 'winston';
export declare const logger: winston.Logger;
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const logError: (error: Error, context?: Record<string, any>) => void;
export declare const logAudit: (userId: string, action: string, resource: string, details?: Record<string, any>) => void;
//# sourceMappingURL=logger.d.ts.map