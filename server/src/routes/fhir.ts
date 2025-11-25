/**
 * FHIR API Routes
 * Comprehensive healthcare data operations through backend FHIR endpoints
 * Handles all CRUD operations for FHIR resources with proper validation and error handling
 */

import { Router } from 'express';
import { MedplumService } from '../services/medplumService.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();
const medplumService = new MedplumService();

/**
 * Patient FHIR Resource Operations
 */

// Get all patients with pagination and filtering
router.get('/patients', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const result = await medplumService.searchPatients({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    res.json({
      success: true,
      data: result.patients,
      pagination: result.pagination,
      total: result.total
    });
  } catch (error) {
    logger.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get patient by ID
router.get('/patients/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await medplumService.getPatient(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    logger.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new patient
router.post('/patients', authenticate, async (req, res) => {
  try {
    const patientData = req.body;
    const newPatient = await medplumService.createPatient(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: newPatient
    });
  } catch (error) {
    logger.error('Error creating patient:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update patient
router.put('/patients/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const patientData = req.body;
    
    const updatedPatient = await medplumService.updatePatient(id, patientData);

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    logger.error('Error updating patient:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete patient
router.delete('/patients/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await medplumService.deletePatient(id);

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting patient:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to delete patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Practitioner FHIR Resource Operations
 */

// Get all practitioners
router.get('/practitioners', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, specialty, search } = req.query;
    
    const result = await medplumService.searchPractitioners({
      page: Number(page),
      limit: Number(limit),
      specialty: specialty as string,
      search: search as string
    });

    res.json({
      success: true,
      data: result.practitioners,
      pagination: result.pagination,
      total: result.total
    });
  } catch (error) {
    logger.error('Error fetching practitioners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practitioners',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get practitioner by ID
router.get('/practitioners/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const practitioner = await medplumService.getPractitioner(id);

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    res.json({
      success: true,
      data: practitioner
    });
  } catch (error) {
    logger.error('Error fetching practitioner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practitioner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Appointment FHIR Resource Operations
 */

// Get appointments with filtering
router.get('/appointments', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      practitionerId, 
      status,
      dateFrom,
      dateTo 
    } = req.query;
    
    const result = await medplumService.searchAppointments({
      page: Number(page),
      limit: Number(limit),
      patientId: patientId as string,
      practitionerId: practitionerId as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });

    res.json({
      success: true,
      data: result.appointments,
      pagination: result.pagination,
      total: result.total
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create appointment
router.post('/appointments', authenticate, async (req, res) => {
  try {
    const appointmentData = req.body;
    const newAppointment = await medplumService.createAppointment(appointmentData);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update appointment
router.put('/appointments/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentData = req.body;
    
    const updatedAppointment = await medplumService.updateAppointment(id, appointmentData);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    logger.error('Error updating appointment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Observation FHIR Resource Operations
 */

// Get observations
router.get('/observations', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      category,
      code,
      dateFrom,
      dateTo 
    } = req.query;
    
    const result = await medplumService.searchObservations({
      page: Number(page),
      limit: Number(limit),
      patientId: patientId as string,
      category: category as string,
      code: code as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });

    res.json({
      success: true,
      data: result.observations,
      pagination: result.pagination,
      total: result.total
    });
  } catch (error) {
    logger.error('Error fetching observations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch observations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create observation
router.post('/observations', authenticate, async (req, res) => {
  try {
    const observationData = req.body;
    const newObservation = await medplumService.createObservation(observationData);

    res.status(201).json({
      success: true,
      message: 'Observation created successfully',
      data: newObservation
    });
  } catch (error) {
    logger.error('Error creating observation:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create observation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Medication FHIR Resource Operations
 */

// Get medications
router.get('/medications', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      patientId, 
      status 
    } = req.query;
    
    const result = await medplumService.searchMedications({
      page: Number(page),
      limit: Number(limit),
      patientId: patientId as string,
      status: status as string
    });

    res.json({
      success: true,
      data: result.medications,
      pagination: result.pagination,
      total: result.total
    });
  } catch (error) {
    logger.error('Error fetching medications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create medication
router.post('/medications', authenticate, async (req, res) => {
  try {
    const medicationData = req.body;
    const newMedication = await medplumService.createMedication(medicationData);

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: newMedication
    });
  } catch (error) {
    logger.error('Error creating medication:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create medication',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generic FHIR Resource Operations
 */

// Generic search for any FHIR resource type
router.get('/:resourceType', authenticate, async (req, res) => {
  try {
    const { resourceType } = req.params;
    const queryParams = req.query;
    
    const result = await medplumService.searchResources(resourceType, queryParams);

    res.json({
      success: true,
      data: result.resources,
      pagination: result.pagination,
      total: result.total
    });
  } catch (error) {
    logger.error(`Error searching ${req.params.resourceType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to search ${req.params.resourceType}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific FHIR resource by ID
router.get('/:resourceType/:id', authenticate, async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    const resource = await medplumService.getResource(resourceType, id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: `${resourceType} not found`
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    logger.error(`Error fetching ${req.params.resourceType}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.resourceType}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create FHIR resource
router.post('/:resourceType', authenticate, async (req, res) => {
  try {
    const { resourceType } = req.params;
    const resourceData = req.body;
    
    const newResource = await medplumService.createResource(resourceType, resourceData);

    res.status(201).json({
      success: true,
      message: `${resourceType} created successfully`,
      data: newResource
    });
  } catch (error) {
    logger.error(`Error creating ${req.params.resourceType}:`, error);
    res.status(400).json({
      success: false,
      message: `Failed to create ${req.params.resourceType}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update FHIR resource
router.put('/:resourceType/:id', authenticate, async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    const resourceData = req.body;
    
    const updatedResource = await medplumService.updateResource(resourceType, id, resourceData);

    res.json({
      success: true,
      message: `${resourceType} updated successfully`,
      data: updatedResource
    });
  } catch (error) {
    logger.error(`Error updating ${req.params.resourceType}:`, error);
    res.status(400).json({
      success: false,
      message: `Failed to update ${req.params.resourceType}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete FHIR resource
router.delete('/:resourceType/:id', authenticate, async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    await medplumService.deleteResource(resourceType, id);

    res.json({
      success: true,
      message: `${resourceType} deleted successfully`
    });
  } catch (error) {
    logger.error(`Error deleting ${req.params.resourceType}:`, error);
    res.status(400).json({
      success: false,
      message: `Failed to delete ${req.params.resourceType}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;