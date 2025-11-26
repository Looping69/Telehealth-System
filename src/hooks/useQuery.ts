/**
 * React Query configuration and custom hooks
 * Provides data fetching and caching utilities for the application, using backend FHIR service
 * 
 * Refactored to export from individual query files for better maintainability.
 */

// Re-export queryClient
export { queryClient } from './queries/queryClient';

// Re-export Patient queries
export {
  usePatients,
  usePatient,
  useCreatePatient,
  useUpdatePatient
} from './queries/usePatientQueries';

// Re-export Appointment queries
export {
  useAppointments,
  useCreateAppointment
} from './queries/useAppointmentQueries';

// Re-export Order queries
export {
  useOrders,
  useCreateOrder
} from './queries/useOrderQueries';

// Re-export Product queries
export {
  useProducts,
  useCreateProduct
} from './queries/useProductQueries';

// Re-export Pharmacy queries
export {
  usePharmacies
} from './queries/usePharmacyQueries';

// Re-export Dashboard queries
export {
  useDashboardMetrics
} from './queries/useDashboardQueries';

// Re-export Audit queries
export {
  useAuditEvents
} from './queries/useAuditQueries';

// Re-export System queries
export {
  useSystemMetadata
} from './queries/useSystemQueries';

// Re-export Communication queries
export {
  useCommunications,
  useCreateCommunication
} from './queries/useCommunicationQueries';

// Re-export Invoice queries
export {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice
} from './queries/useInvoiceQueries';

// Temporary stub for insurance coverage queries to satisfy build
export function useCoverage() {
  return { data: [], isLoading: false, error: undefined };
}
