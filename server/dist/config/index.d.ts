export declare const config: {
    nodeEnv: string;
    port: number;
    apiVersion: string;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    medplum: {
        baseUrl: string;
        clientId: string;
        clientSecret: string;
        token: string;
        useMock: boolean;
    };
    email: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    upload: {
        dir: string;
        maxSize: number;
        allowedTypes: string[];
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    security: {
        bcryptRounds: number;
        rateLimitWindowMs: number;
        rateLimitMaxRequests: number;
    };
    logging: {
        level: string;
        file: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
};
export declare const validateConfig: () => void;
//# sourceMappingURL=index.d.ts.map