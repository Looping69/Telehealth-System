import { Router } from 'express';
import authRoutes from './auth.js';
import fhirRoutes from './fhir.js';
const router = Router();
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Telehealth Microservices API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        architecture: 'Medplum + Microservices'
    });
});
router.use('/auth', authRoutes);
router.use('/fhir', fhirRoutes);
router.get('/services', (_req, res) => {
    res.json({
        success: true,
        message: 'Available microservices',
        data: {
            services: [
                {
                    name: 'Authentication Service',
                    path: '/api/auth',
                    description: 'Handles Medplum OAuth integration'
                },
                {
                    name: 'Payment Service',
                    path: '/api/payments',
                    description: 'Stripe payment processing (coming soon)'
                },
                {
                    name: 'Notification Service',
                    path: '/api/notifications',
                    description: 'Email and SMS notifications (coming soon)'
                },
                {
                    name: 'File Upload Service',
                    path: '/api/uploads',
                    description: 'File upload and management (coming soon)'
                }
            ],
            medplum: {
                description: 'Healthcare data, FHIR resources, and core functionality handled by Medplum',
                baseUrl: 'https://api.medplum.com'
            }
        }
    });
});
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl,
        suggestion: 'Check /api/services for available microservices'
    });
});
export default router;
//# sourceMappingURL=index.js.map