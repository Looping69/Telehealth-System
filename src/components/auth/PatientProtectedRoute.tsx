/**
 * Patient-specific protected route component
 * Handles authentication and patient-specific access control
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader, Center, Stack, Text } from '@mantine/core';
import { useAuthStore } from '../../store/authStore';

interface PatientProtectedRouteProps {
  children: React.ReactNode;
}

export function PatientProtectedRoute({ children }: PatientProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            Loading patient portal...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location, userType: 'patient' }} 
        replace 
      />
    );
  }

  // Check if user has patient role or is a demo patient
  const isPatient = user.role === 'patient' || user.email === 'patient@example.com';
  
  if (!isPatient) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Patient is authenticated and has required permissions
  return <>{children}</>;
}