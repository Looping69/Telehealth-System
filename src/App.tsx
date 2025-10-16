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

// Import page components (Mock Data versions)
import { DashboardPage } from './pages/Dashboard';
import { PatientsPage } from './pages/Patients';
import { SessionsPage } from './pages/Sessions';
import { OrdersPage } from './pages/Orders';
import { InvoicesPage } from './pages/Invoices';
import { TasksPage } from './pages/Tasks';
import { InsurancePage } from './pages/Insurance';
import MessagesPage from './pages/Messages';
import { ProvidersPage } from './pages/Providers';
import { PharmaciesPage } from './pages/Pharmacies';
import { TagsPage } from './pages/Tags';
import { DiscountsPage } from './pages/Discounts';
import { ProductsPage } from './pages/Products';
import FormsPage from './pages/Forms';
import { ResourcesPage } from './pages/Resources';
import { SettingsPage } from './pages/Settings';
import { AuditPage } from './pages/Audit';

// Import Medplum page components (FHIR versions)
import DashboardMedplumPage from './pages/Dashboard-Medplum';
import PatientsMedplumPage from './pages/Patients-Medplum';
import SessionsMedplumPage from './pages/Sessions-Medplum';
import OrdersMedplumPage from './pages/Orders-Medplum';
import InvoicesMedplumPage from './pages/Invoices-Medplum';
import TasksMedplumPage from './pages/Tasks-Medplum';
import InsuranceMedplumPage from './pages/Insurance-Medplum';
import MessagesMedplumPage from './pages/Messages-Medplum';
import ProvidersMedplumPage from './pages/Providers-Medplum';
import PharmaciesMedplumPage from './pages/Pharmacies-Medplum';
import TagsMedplumPage from './pages/Tags-Medplum';
import DiscountsMedplumPage from './pages/Discounts-Medplum';
import ProductsMedplumPage from './pages/Products-Medplum';
import FormsMedplumPage from './pages/Forms-Medplum';
import ResourcesMedplumPage from './pages/Resources-Medplum';
import SettingsMedplumPage from './pages/Settings-Medplum';
import AuditMedplumPage from './pages/Audit-Medplum';
import FormBuilderMedplumPage from './pages/FormBuilder-Medplum';

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

  // Helper function to get the appropriate component based on mode
  const getPageComponent = (mockComponent: React.ComponentType, fhirComponent: React.ComponentType) => {
    return mode === 'fhir' ? React.createElement(fhirComponent) : React.createElement(mockComponent);
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