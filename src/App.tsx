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

// Import page components (we'll create these next)
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { SessionsPage } from './pages/SessionsPage';
import { OrdersPage } from './pages/OrdersPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { TasksPage } from './pages/TasksPage';
import { InsurancePage } from './pages/InsurancePage';
import MessagesPage from './pages/MessagesPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { PharmaciesPage } from './pages/PharmaciesPage';
import { TagsPage } from './pages/TagsPage';
import { DiscountsPage } from './pages/DiscountsPage';
import { ProductsPage } from './pages/ProductsPage';
import FormsPage from './pages/FormsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditPage } from './pages/AuditPage';

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
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Patient Care */}
              <Route path="patients" element={<PatientsPage />} />
              <Route path="sessions" element={<SessionsPage />} />

              {/* Orders & Billing */}
              <Route path="orders" element={<OrdersPage />} />
              <Route path="invoices" element={<InvoicesPage />} />

              {/* Management */}
              <Route path="tasks" element={<TasksPage />} />
              <Route path="insurance" element={<InsurancePage />} />
              <Route path="messages" element={<MessagesPage />} />

              {/* Admin */}
              <Route path="providers" element={<ProvidersPage />} />
              <Route path="pharmacies" element={<PharmaciesPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="discounts" element={<DiscountsPage />} />

              {/* Products & Content */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="resources" element={<ResourcesPage />} />

              {/* System */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="forms" element={<FormsPage />} />

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
    </Router>
  );
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <AppContent />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;