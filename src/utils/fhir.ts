/**
 * FHIR Utility Functions
 * Helper functions for working with FHIR resources and data transformations
 */

import { 
  Patient, 
  Appointment, 
  ServiceRequest, 
  Task as FHIRTask,
  Practitioner,
  Organization,
  Observation,
  MedicationRequest,
  Reference,
  HumanName,
  ContactPoint,
  Address,
  Identifier,
  CodeableConcept,
  Coding,
  Period,
  Quantity
} from '@medplum/fhirtypes';

/**
 * Format search parameters for FHIR API calls
 */
export function formatSearchParams(params: Record<string, any>): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        formatted[key] = value.toString();
      } else if (typeof value === 'number') {
        formatted[key] = value.toString();
      } else if (value instanceof Date) {
        formatted[key] = value.toISOString().split('T')[0];
      } else {
        formatted[key] = value.toString();
      }
    }
  });
  
  return formatted;
}

/**
 * Create a FHIR reference
 */
export function createReference(resourceType: string, id: string, display?: string): Reference {
  return {
    reference: `${resourceType}/${id}`,
    display,
  };
}

/**
 * Extract display name from a FHIR reference
 */
export function getReferenceDisplay(reference?: Reference): string {
  if (!reference) return 'Unknown';
  return reference.display || reference.reference || 'Unknown';
}

/**
 * Extract ID from a FHIR reference
 */
export function getReferenceId(reference?: Reference): string | undefined {
  if (!reference?.reference) return undefined;
  return reference.reference.split('/')[1];
}

/**
 * Format a human name for display
 */
export function formatHumanName(name?: HumanName[]): string {
  if (!name || name.length === 0) return 'Unknown';
  
  const primaryName = name.find(n => n.use === 'official') || name[0];
  
  if (primaryName.text) {
    return primaryName.text;
  }
  
  const parts: string[] = [];
  
  if (primaryName.prefix) {
    parts.push(...primaryName.prefix);
  }
  
  if (primaryName.given) {
    parts.push(...primaryName.given);
  }
  
  if (primaryName.family) {
    parts.push(primaryName.family);
  }
  
  if (primaryName.suffix) {
    parts.push(...primaryName.suffix);
  }
  
  return parts.join(' ') || 'Unknown';
}

/**
 * Format contact points (phone, email, etc.)
 */
export function formatContactPoint(telecom?: ContactPoint[], system?: 'phone' | 'email' | 'fax'): string | undefined {
  if (!telecom) return undefined;
  
  const contact = system 
    ? telecom.find(t => t.system === system)
    : telecom[0];
    
  return contact?.value;
}

/**
 * Format address for display
 */
export function formatAddress(address?: Address[]): string {
  if (!address || address.length === 0) return '';
  
  const primaryAddress = address.find(a => a.use === 'home') || address[0];
  
  if (primaryAddress.text) {
    return primaryAddress.text;
  }
  
  const parts: string[] = [];
  
  if (primaryAddress.line) {
    parts.push(...primaryAddress.line);
  }
  
  if (primaryAddress.city) {
    parts.push(primaryAddress.city);
  }
  
  if (primaryAddress.state) {
    parts.push(primaryAddress.state);
  }
  
  if (primaryAddress.postalCode) {
    parts.push(primaryAddress.postalCode);
  }
  
  if (primaryAddress.country) {
    parts.push(primaryAddress.country);
  }
  
  return parts.join(', ');
}

/**
 * Format identifier for display
 */
export function formatIdentifier(identifier?: Identifier[], system?: string): string | undefined {
  if (!identifier) return undefined;
  
  const id = system 
    ? identifier.find(i => i.system === system)
    : identifier[0];
    
  return id?.value;
}

/**
 * Format codeable concept for display
 */
export function formatCodeableConcept(concept?: CodeableConcept): string {
  if (!concept) return 'Unknown';
  
  if (concept.text) {
    return concept.text;
  }
  
  if (concept.coding && concept.coding.length > 0) {
    const coding = concept.coding[0];
    return coding.display || coding.code || 'Unknown';
  }
  
  return 'Unknown';
}

/**
 * Format period for display
 */
export function formatPeriod(period?: Period): string {
  if (!period) return '';
  
  const start = period.start ? new Date(period.start).toLocaleDateString() : '';
  const end = period.end ? new Date(period.end).toLocaleDateString() : '';
  
  if (start && end) {
    return `${start} - ${end}`;
  } else if (start) {
    return `From ${start}`;
  } else if (end) {
    return `Until ${end}`;
  }
  
  return '';
}

/**
 * Format quantity for display
 */
export function formatQuantity(quantity?: Quantity): string {
  if (!quantity) return '';
  
  const value = quantity.value?.toString() || '';
  const unit = quantity.unit || quantity.code || '';
  
  return `${value} ${unit}`.trim();
}

/**
 * Convert Patient FHIR resource to application format
 */
export function convertPatientFromFHIR(patient: Patient) {
  return {
    id: patient.id!,
    name: formatHumanName(patient.name),
    email: formatContactPoint(patient.telecom, 'email'),
    phone: formatContactPoint(patient.telecom, 'phone'),
    dateOfBirth: patient.birthDate,
    gender: patient.gender as 'male' | 'female' | 'other' | 'unknown',
    status: patient.active ? 'active' : 'inactive' as const,
    address: formatAddress(patient.address),
    identifier: formatIdentifier(patient.identifier),
    createdAt: patient.meta?.lastUpdated ? new Date(patient.meta.lastUpdated) : new Date(),
    updatedAt: patient.meta?.lastUpdated ? new Date(patient.meta.lastUpdated) : new Date(),
  };
}

/**
 * Convert application patient format to FHIR Patient resource
 */
export function convertPatientToFHIR(patient: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  status?: 'active' | 'inactive';
  address?: string;
}): Patient {
  const nameParts = patient.name.split(' ');
  const given = nameParts.slice(0, -1);
  const family = nameParts[nameParts.length - 1];
  
  const telecom: ContactPoint[] = [];
  
  if (patient.email) {
    telecom.push({
      system: 'email',
      value: patient.email,
      use: 'home',
    });
  }
  
  if (patient.phone) {
    telecom.push({
      system: 'phone',
      value: patient.phone,
      use: 'home',
    });
  }
  
  const fhirPatient: Patient = {
    resourceType: 'Patient',
    active: patient.status !== 'inactive',
    name: [{
      use: 'official',
      given: given.length > 0 ? given : undefined,
      family: family || undefined,
    }],
    telecom: telecom.length > 0 ? telecom : undefined,
    gender: patient.gender,
    birthDate: patient.dateOfBirth,
  };
  
  if (patient.id) {
    fhirPatient.id = patient.id;
  }
  
  if (patient.address) {
    fhirPatient.address = [{
      use: 'home',
      text: patient.address,
    }];
  }
  
  return fhirPatient;
}

/**
 * Convert Appointment FHIR resource to application format
 */
export function convertAppointmentFromFHIR(appointment: Appointment) {
  return {
    id: appointment.id!,
    patientId: getReferenceId(appointment.participant?.find((p: any) => p.actor?.reference?.startsWith('Patient/'))?.actor),
    providerId: getReferenceId(appointment.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'))?.actor),
    title: appointment.description || formatCodeableConcept(appointment.appointmentType) || 'Appointment',
    startTime: appointment.start ? new Date(appointment.start) : new Date(),
    endTime: appointment.end ? new Date(appointment.end) : new Date(),
    status: appointment.status as 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow',
    type: formatCodeableConcept(appointment.appointmentType) || 'consultation',
    description: appointment.comment,
  };
}

/**
 * Convert ServiceRequest FHIR resource to application format
 */
export function convertServiceRequestFromFHIR(serviceRequest: ServiceRequest) {
  return {
    id: serviceRequest.id!,
    patientId: getReferenceId(serviceRequest.subject),
    providerId: getReferenceId(serviceRequest.requester),
    type: formatCodeableConcept(serviceRequest.category?.[0]) || 'order',
    title: formatCodeableConcept(serviceRequest.code) || 'Service Request',
    description: serviceRequest.note?.[0]?.text || '',
    status: serviceRequest.status as 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown',
    priority: serviceRequest.priority as 'routine' | 'urgent' | 'asap' | 'stat',
    createdAt: serviceRequest.authoredOn ? new Date(serviceRequest.authoredOn) : new Date(),
  };
}

/**
 * Convert Task FHIR resource to application format
 */
export function convertTaskFromFHIR(task: FHIRTask) {
  return {
    id: task.id!,
    title: task.description || formatCodeableConcept(task.code) || 'Task',
    description: task.note?.[0]?.text || '',
    status: task.status as 'draft' | 'requested' | 'received' | 'accepted' | 'rejected' | 'ready' | 'cancelled' | 'in-progress' | 'on-hold' | 'failed' | 'completed' | 'entered-in-error',
    priority: task.priority as 'routine' | 'urgent' | 'asap' | 'stat',
    assignedTo: getReferenceId(task.owner),
    assignedBy: getReferenceId(task.requester),
    dueDate: task.executionPeriod?.end ? new Date(task.executionPeriod.end) : undefined,
    createdAt: task.authoredOn ? new Date(task.authoredOn) : new Date(),
    updatedAt: task.lastModified ? new Date(task.lastModified) : new Date(),
  };
}

/**
 * Convert Practitioner FHIR resource to application format
 */
export function convertPractitionerFromFHIR(practitioner: Practitioner) {
  return {
    id: practitioner.id!,
    name: formatHumanName(practitioner.name),
    email: formatContactPoint(practitioner.telecom, 'email'),
    phone: formatContactPoint(practitioner.telecom, 'phone'),
    specialty: practitioner.qualification?.[0]?.code ? formatCodeableConcept(practitioner.qualification[0].code) : undefined,
    active: practitioner.active !== false,
    address: formatAddress(practitioner.address),
    identifier: formatIdentifier(practitioner.identifier),
  };
}

/**
 * Get status color for different resource types
 */
export function getStatusColor(status: string, resourceType?: string): string {
  const statusColors: Record<string, string> = {
    // Common statuses
    active: 'green',
    inactive: 'gray',
    completed: 'green',
    cancelled: 'red',
    pending: 'yellow',
    draft: 'gray',
    
    // Appointment statuses
    proposed: 'blue',
    booked: 'green',
    arrived: 'cyan',
    fulfilled: 'green',
    noshow: 'red',
    
    // Task statuses
    requested: 'blue',
    received: 'blue',
    accepted: 'cyan',
    rejected: 'red',
    ready: 'yellow',
    'in-progress': 'cyan',
    'on-hold': 'yellow',
    failed: 'red',
    'entered-in-error': 'red',
    
    // Service Request statuses
    revoked: 'red',
    unknown: 'gray',
  };
  
  return statusColors[status] || 'gray';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    routine: 'gray',
    urgent: 'orange',
    asap: 'red',
    stat: 'red',
    low: 'gray',
    medium: 'yellow',
    high: 'orange',
  };
  
  return priorityColors[priority] || 'gray';
}

/**
 * Validate FHIR resource
 */
export function validateFHIRResource(resource: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!resource.resourceType) {
    errors.push('Resource type is required');
  }
  
  // Add more validation rules as needed
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a search bundle for multiple resource types
 */
export function createSearchBundle(searches: Array<{ resourceType: string; params: Record<string, any> }>) {
  return {
    resourceType: 'Bundle',
    type: 'batch',
    entry: searches.map((search, index) => ({
      request: {
        method: 'GET',
        url: `${search.resourceType}?${new URLSearchParams(formatSearchParams(search.params)).toString()}`,
      },
    })),
  };
}

/**
 * Parse search results from a bundle
 */
export function parseSearchBundle(bundle: any): Record<string, any[]> {
  const results: Record<string, any[]> = {};
  
  if (bundle.entry) {
    bundle.entry.forEach((entry: any, index: number) => {
      if (entry.resource?.resourceType) {
        const resourceType = entry.resource.resourceType;
        if (!results[resourceType]) {
          results[resourceType] = [];
        }
        results[resourceType].push(entry.resource);
      }
    });
  }
  
  return results;
}