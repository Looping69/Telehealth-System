/**
 * Main App component
 * Sets up routing, authentication, and global providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import { queryClient } from './hooks/useQuery';
import LoginPage from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UnauthorizedPage } from './components/common/UnauthorizedPage';
import { AppLayout } from './components/layout/AppLayout';
import { ModeProvider, useMode } from './contexts/ModeContext';
import { initializeMedplumAuth } from './config/medplum';

// Lazy load page components for better performance
const DashboardPage = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const PatientsPage = React.lazy(() => import('./pages/Patients').then(m => ({ default: m.PatientsPage })));
const SessionsPage = React.lazy(() => import('./pages/Sessions').then(m => ({ default: m.SessionsPage })));
const OrdersPage = React.lazy(() => import('./pages/Orders').then(m => ({ default: m.OrdersPage })));
const InvoicesPage = React.lazy(() => import('./pages/Invoices').then(m => ({ default: m.InvoicesPage })));
const TasksPage = React.lazy(() => import('./pages/Tasks').then(m => ({ default: m.TasksPage })));
const InsurancePage = React.lazy(() => import('./pages/Insurance').then(m => ({ default: m.InsurancePage })));
const MessagesPage = React.lazy(() => import('./pages/Messages'));
const ProvidersPage = React.lazy(() => import('./pages/Providers').then(m => ({ default: m.ProvidersPage })));
const PharmaciesPage = React.lazy(() => import('./pages/Pharmacies').then(m => ({ default: m.PharmaciesPage })));
const TagsPage = React.lazy(() => import('./pages/Tags').then(m => ({ default: m.TagsPage })));
const DiscountsPage = React.lazy(() => import('./pages/Discounts').then(m => ({ default: m.DiscountsPage })));
const ProductsPage = React.lazy(() => import('./pages/Products').then(m => ({ default: m.ProductsPage })));
const FormsPage = React.lazy(() => import('./pages/Forms'));
const ResourcesPage = React.lazy(() => import('./pages/Resources').then(m => ({ default: m.ResourcesPage })));
const SettingsPage = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const AuditPage = React.lazy(() => import('./pages/Audit').then(m => ({ default: m.AuditPage })));

// Lazy load Medplum page components (FHIR versions)
const DashboardMedplumPage = React.lazy(() => import('./pages/Dashboard-Medplum'));
const PatientsMedplumPage = React.lazy(() => import('./pages/Patients-Medplum'));
const SessionsMedplumPage = React.lazy(() => import('./pages/Sessions-Medplum'));
const OrdersMedplumPage = React.lazy(() => import('./pages/Orders-Medplum'));
const InvoicesMedplumPage = React.lazy(() => import('./pages/Invoices-Medplum'));
const TasksMedplumPage = React.lazy(() => import('./pages/Tasks-Medplum'));
const InsuranceMedplumPage = React.lazy(() => import('./pages/Insurance-Medplum'));
const MessagesMedplumPage = React.lazy(() => import('./pages/Messages-Medplum'));
const ProvidersMedplumPage = React.lazy(() => import('./pages/Providers-Medplum'));
const PharmaciesMedplumPage = React.lazy(() => import('./pages/Pharmacies-Medplum'));
const TagsMedplumPage = React.lazy(() => import('./pages/Tags-Medplum'));
const DiscountsMedplumPage = React.lazy(() => import('./pages/Discounts-Medplum'));
const ProductsMedplumPage = React.lazy(() => import('./pages/Products-Medplum'));
const FormsMedplumPage = React.lazy(() => import('./pages/Forms-Medplum'));
const ResourcesMedplumPage = React.lazy(() => import('./pages/Resources-Medplum'));
const SettingsMedplumPage = React.lazy(() => import('./pages/Settings-Medplum'));
const AuditMedplumPage = React.lazy(() => import('./pages/Audit-Medplum'));
const FormBuilderMedplumPage = React.lazy(() => import('./pages/FormBuilder-Medplum'));

// Custom theme with medical blue color scheme
const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#eff6ff',
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
    ],
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
});

function AppContent() {
  const { mode } = useMode();

  // Helper function to get the appropriate component based on mode with Suspense
  const getPageComponent = (mockComponent: React.ComponentType, fhirComponent: React.ComponentType) => {
    const Component = mode === 'fhir' ? fhirComponent : mockComponent;
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component />
      </React.Suspense>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route index element={getPageComponent(DashboardPage, DashboardMedplumPage)} />
              <Route path="dashboard" element={getPageComponent(DashboardPage, DashboardMedplumPage)} />

              {/* Patient Care */}
              <Route path="patients" element={getPageComponent(PatientsPage, PatientsMedplumPage)} />
              <Route path="sessions" element={getPageComponent(SessionsPage, SessionsMedplumPage)} />

              {/* Orders & Billing */}
              <Route path="orders" element={getPageComponent(OrdersPage, OrdersMedplumPage)} />
              <Route path="invoices" element={getPageComponent(InvoicesPage, InvoicesMedplumPage)} />

              {/* Management */}
              <Route path="tasks" element={getPageComponent(TasksPage, TasksMedplumPage)} />
              <Route path="insurance" element={getPageComponent(InsurancePage, InsuranceMedplumPage)} />
              <Route path="messages" element={getPageComponent(MessagesPage, MessagesMedplumPage)} />

              {/* Admin */}
              <Route path="providers" element={getPageComponent(ProvidersPage, ProvidersMedplumPage)} />
              <Route path="pharmacies" element={getPageComponent(PharmaciesPage, PharmaciesMedplumPage)} />
              <Route path="tags" element={getPageComponent(TagsPage, TagsMedplumPage)} />
              <Route path="discounts" element={getPageComponent(DiscountsPage, DiscountsMedplumPage)} />

              {/* Products & Content */}
              <Route path="products" element={getPageComponent(ProductsPage, ProductsMedplumPage)} />
              <Route path="resources" element={getPageComponent(ResourcesPage, ResourcesMedplumPage)} />
              <Route path="forms" element={getPageComponent(FormsPage, FormsMedplumPage)} />
              <Route path="form-builder" element={getPageComponent(() => <div>Form Builder (Mock)</div>, FormBuilderMedplumPage)} />

              {/* System */}
              <Route path="settings" element={getPageComponent(SettingsPage, SettingsMedplumPage)} />
              <Route path="audit" element={getPageComponent(AuditPage, AuditMedplumPage)} />

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
    </Router>
  );
}

function App() {
  // Initialize Medplum authentication when app starts
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = await initializeMedplumAuth();
        if (isAuthenticated) {
          console.log('Medplum authentication initialized successfully');
        } else {
          console.warn('Medplum authentication failed - using mock data mode');
        }
      } catch (error) {
        console.error('Error initializing Medplum authentication:', error);
      }
    };
    
    initAuth();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ModeProvider>
          <Notifications position="top-right" />
          <AppContent />
        </ModeProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;