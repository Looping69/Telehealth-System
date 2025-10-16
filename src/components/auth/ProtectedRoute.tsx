/**
 * Protected route component
 * Handles authentication and role-based access control for routes
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader, Center, Stack, Text } from '@mantine/core';
import { useAuthStore } from '../../store/authStore';
import { canAccessRoute } from '../../utils/permissions';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            Loading...
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
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole || allowedRoles) {
    const hasAccess = canAccessRoute(user.role, location.pathname);
    
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: UserRole;
    allowedRoles?: UserRole[];
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}