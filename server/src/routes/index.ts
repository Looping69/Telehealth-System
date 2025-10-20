/**
 * Main routes index for microservices architecture
 * Registers lightweight API routes that complement Medplum
 */

import { Router } from 'express';
import authRoutes from './auth.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Telehealth Microservices API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    architecture: 'Medplum + Microservices'
  });
});

// Register microservice routes
router.use('/auth', authRoutes);

// Placeholder for future microservices
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

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    suggestion: 'Check /api/services for available microservices'
  });
});

export default router;