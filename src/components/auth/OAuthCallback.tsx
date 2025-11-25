/**
 * OAuth Callback Component
 * Purpose: Handles the OAuth callback from Medplum and completes authentication
 * Inputs: Authorization code and state from URL parameters
 * Outputs: Authenticated user session or error handling
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  Loader,
  Center,
  Alert,
  Stack,
  Button,
  ThemeIcon
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { useOAuthAuthStore } from '../../store/oauthAuthStore';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    handleOAuthCallback, 
    isLoading, 
    error, 
    isAuthenticated,
    clearError 
  } = useOAuthAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors from authorization server
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        console.error('Missing required OAuth parameters');
        return;
      }

      try {
        await handleOAuthCallback(code, state);
      } catch (err) {
        console.error('OAuth callback processing failed:', err);
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect to dashboard after successful authentication
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
        navigate('/login');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError, navigate]);

  const handleRetry = () => {
    clearError();
    navigate('/login');
  };

  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth authorization errors
  if (errorParam) {
    return (
      <Container size="sm" h="100vh">
        <Center style={{ height: '100%' }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Center>
                <ThemeIcon color="red" size="xl" radius="xl">
                  <IconX size="2rem" />
                </ThemeIcon>
              </Center>
              
              <Title order={2} ta="center">
                Authentication Failed
              </Title>
              
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                color="red" 
                title="Authorization Error"
              >
                <Text>{errorDescription || errorParam}</Text>
              </Alert>
              
              <Text c="dimmed" ta="center" size="sm">
                Please try logging in again or contact support if the issue persists.
              </Text>
              
              <Button onClick={handleRetry} fullWidth>
                Return to Login
              </Button>
            </Stack>
          </Paper>
        </Center>
      </Container>
    );
  }

  // Handle missing parameters
  if (!searchParams.get('code') || !searchParams.get('state')) {
    return (
      <Container size="sm" h="100vh">
        <Center style={{ height: '100%' }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Center>
                <ThemeIcon color="red" size="xl" radius="xl">
                  <IconX size="2rem" />
                </ThemeIcon>
              </Center>
              
              <Title order={2} ta="center">
                Invalid Callback
              </Title>
              
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                color="red" 
                title="Missing Parameters"
              >
                <Text>The authentication callback is missing required parameters.</Text>
              </Alert>
              
              <Text c="dimmed" ta="center" size="sm">
                Please try logging in again.
              </Text>
              
              <Button onClick={handleRetry} fullWidth>
                Return to Login
              </Button>
            </Stack>
          </Paper>
        </Center>
      </Container>
    );
  }

  // Handle processing errors
  if (error) {
    return (
      <Container size="sm" h="100vh">
        <Center style={{ height: '100%' }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Center>
                <ThemeIcon color="red" size="xl" radius="xl">
                  <IconX size="2rem" />
                </ThemeIcon>
              </Center>
              
              <Title order={2} ta="center">
                Authentication Failed
              </Title>
              
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                color="red" 
                title="Processing Error"
              >
                <Text>{error}</Text>
              </Alert>
              
              <Text c="dimmed" ta="center" size="sm">
                Redirecting to login page...
              </Text>
              
              <Button onClick={handleRetry} fullWidth variant="outline">
                Return to Login Now
              </Button>
            </Stack>
          </Paper>
        </Center>
      </Container>
    );
  }

  // Handle successful authentication
  if (isAuthenticated) {
    return (
      <Container size="sm" h="100vh">
        <Center style={{ height: '100%' }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Center>
                <ThemeIcon color="green" size="xl" radius="xl">
                  <IconCheck size="2rem" />
                </ThemeIcon>
              </Center>
              
              <Title order={2} ta="center">
                Authentication Successful
              </Title>
              
              <Text ta="center" size="lg">
                Welcome! Redirecting to your dashboard...
              </Text>
              
              <Center>
                <Loader size="sm" />
              </Center>
            </Stack>
          </Paper>
        </Center>
      </Container>
    );
  }

  // Default loading state
  return (
    <Container size="sm" h="100vh">
      <Center style={{ height: '100%' }}>
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Center>
              <ThemeIcon color="blue" size="xl" radius="xl">
                <IconCheck size="2rem" />
              </ThemeIcon>
            </Center>
            
            <Title order={2} ta="center">
              Completing Authentication
            </Title>
            
            <Text ta="center" size="lg">
              Processing your login...
            </Text>
            
            <Center>
              <Loader size="lg" />
            </Center>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
};

export default OAuthCallback;