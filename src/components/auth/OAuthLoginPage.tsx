/**
 * OAuth Login Page
 * Purpose: Provides both traditional demo login and OAuth authentication with Medplum
 * Inputs: User authentication choice (demo vs OAuth)
 * Outputs: Authenticated user session with proper role-based routing
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Alert,
  Divider,
  Center,
  Loader,
  Tabs,
  Card,
  ThemeIcon,
  Box,
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconMedicalCross, 
  IconUser, 
  IconStethoscope,
  IconBrandOauth,
  IconShield,
  IconKey
} from '@tabler/icons-react';
import { useAuthStore } from '../../store/authStore';
import { useOAuthAuthStore } from '../../store/oauthAuthStore';

const OAuthLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'provider' | 'patient'>('provider');
  const [authMethod, setAuthMethod] = useState<'demo' | 'oauth'>('demo');
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use appropriate auth store based on method
  const { 
    login: demoLogin, 
    isLoading: demoLoading, 
    error: demoError, 
    isAuthenticated: demoAuthenticated,
    clearError: clearDemoError,
    initializeMedplum 
  } = useAuthStore();
  
  const { 
    initiateOAuth,
    isAuthenticated: oauthAuthenticated,
    error: oauthError,
    isLoading: oauthLoading 
  } = useOAuthAuthStore();

  const isLoading = demoLoading || oauthLoading || isProcessingOAuth;
  const isAuthenticated = demoAuthenticated || oauthAuthenticated;
  const error = demoError || oauthError;

  // Initialize authentication on component mount
  useEffect(() => {
    initializeMedplum();
  }, []);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (loginType === 'patient' ? '/patient/dashboard' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, loginType]);

  // Clear errors when inputs change
  useEffect(() => {
    return () => clearDemoError();
  }, [clearDemoError]);

  useEffect(() => {
    if (error) {
      clearDemoError();
    }
  }, [email, password, clearDemoError]);

  /**
   * Handle traditional demo login
   * Purpose: Authenticate with demo credentials for development/testing
   * Inputs: Email and password from form
   * Outputs: Authenticated user session
   */
  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await demoLogin(email.trim(), password.trim());
    } catch (err) {
      console.error('Demo login submission error:', err);
    }
  };

  /**
   * Handle OAuth login initiation
   * Purpose: Start OAuth flow with Medplum
   * Inputs: none
   * Outputs: Redirects to Medplum authorization page
   */
  const handleOAuthLogin = async () => {
    try {
      setIsProcessingOAuth(true);
      await initiateOAuth();
      // initiateOAuth will handle the redirect
    } catch (err) {
      console.error('OAuth login initiation error:', err);
      setIsProcessingOAuth(false);
    }
  };

  /**
   * Auto-fill demo credentials for testing
   * Purpose: Quick login for development environment
   * Inputs: User type selection
   * Outputs: Populated form fields
   */
  const fillDemoCredentials = (userType: 'admin' | 'doctor' | 'nurse' | 'superadmin' | 'patient') => {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'medplum_admin' },
      doctor: { email: 'doctor@example.com', password: 'doctor123' },
      nurse: { email: 'nurse@example.com', password: 'nurse123' },
      superadmin: { email: 'superadmin@example.com', password: 'superadmin123' },
      patient: { email: 'patient@example.com', password: 'patient123' }
    };
    
    const cred = credentials[userType];
    setEmail(cred.email);
    setPassword(cred.password);
    clearDemoError();
  };

  /**
   * Handle tab changes
   * Purpose: Reset form state when switching between provider/patient views
   * Inputs: New tab value
   * Outputs: Cleared form and updated UI
   */
  const handleTabChange = (value: string | null) => {
    if (value === 'provider' || value === 'patient') {
      setLoginType(value);
      setEmail('');
      setPassword('');
      clearDemoError();
    }
  };

  /**
   * Render OAuth authentication section
   * Purpose: Provide secure OAuth login option
   * Outputs: OAuth login button and information
   */
  const renderOAuthSection = () => (
    <Card withBorder radius="md" p="xl" bg="blue.0">
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon color="blue" size="lg" radius="md">
            <IconShield size="1.5rem" />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={600} size="lg">
              Secure OAuth Login
            </Text>
            <Text size="sm" c="dimmed">
              Authenticate with your Medplum account
            </Text>
          </Stack>
        </Group>

        <Button
          leftSection={<IconBrandOauth size="1.2rem" />}
          onClick={handleOAuthLogin}
          loading={isProcessingOAuth}
          disabled={isLoading}
          size="lg"
          radius="md"
          fullWidth
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan' }}
        >
          {isProcessingOAuth ? 'Redirecting to Medplum...' : 'Sign in with Medplum'}
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          You'll be redirected to Medplum to authenticate securely
        </Text>
      </Stack>
    </Card>
  );

  /**
   * Render demo authentication section
   * Purpose: Provide development/testing login option
   * Outputs: Traditional login form with demo users
   */
  const renderDemoSection = () => (
    <Card withBorder radius="md" p="xl" bg="gray.0">
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon color="gray" size="lg" radius="md">
            <IconKey size="1.5rem" />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={600} size="lg">
              Demo Login
            </Text>
            <Text size="sm" c="dimmed">
              Use demo credentials for testing
            </Text>
          </Stack>
        </Group>

        <form onSubmit={handleDemoLogin}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              radius="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              visible={showPassword}
              onVisibilityChange={setShowPassword}
              radius="md"
            />

            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Login Failed" color="red" radius="md">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !email.trim() || !password.trim()}
              loading={isLoading}
              leftSection={isLoading ? <Loader size="sm" /> : null}
              radius="md"
              size="md"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Divider label="Quick Demo Access" labelPosition="center" />

            <Group grow>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('admin')}
                disabled={isLoading}
                size="xs"
              >
                Admin
              </Button>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('doctor')}
                disabled={isLoading}
                size="xs"
              >
                Doctor
              </Button>
            </Group>

            <Group grow>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('nurse')}
                disabled={isLoading}
                size="xs"
              >
                Nurse
              </Button>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('superadmin')}
                disabled={isLoading}
                size="xs"
              >
                Super Admin
              </Button>
            </Group>

            <Text size="xs" c="dimmed" ta="center">
              Click any demo button to auto-fill credentials
            </Text>
          </Stack>
        </form>
      </Stack>
    </Card>
  );

  /**
   * Render authentication method selector
   * Purpose: Allow user to choose between OAuth and demo authentication
   * Outputs: Method selection buttons
   */
  const renderMethodSelector = () => (
    <Card withBorder radius="md" p="md">
      <Group grow gap="md">
        <Button
          variant={authMethod === 'oauth' ? 'filled' : 'subtle'}
          onClick={() => setAuthMethod('oauth')}
          leftSection={<IconShield size="1rem" />}
          size="md"
          radius="md"
        >
          OAuth Login
        </Button>
        <Button
          variant={authMethod === 'demo' ? 'filled' : 'subtle'}
          onClick={() => setAuthMethod('demo')}
          leftSection={<IconKey size="1rem" />}
          size="md"
          radius="md"
        >
          Demo Login
        </Button>
      </Group>
    </Card>
  );

  return (
    <Container size={600} my={40}>
      <Center>
        <Stack align="center" gap="md" mb="xl">
          <IconMedicalCross size={48} color="blue" />
          <Title order={2} ta="center">
            Telehealth System
          </Title>
          <Text c="dimmed" size="sm" ta="center" maw={400}>
            Secure healthcare management platform with Medplum integration
          </Text>
        </Stack>
      </Center>

      <Paper withBorder shadow="md" p={30} radius="md">
        <Tabs value={loginType} onChange={handleTabChange} variant="pills" radius="md">
          <Tabs.List grow>
            <Tabs.Tab value="provider" leftSection={<IconStethoscope size="1rem" />}>
              Healthcare Provider
            </Tabs.Tab>
            <Tabs.Tab value="patient" leftSection={<IconUser size="1rem" />}>
              Patient Portal
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="provider" pt="md">
            <Stack gap="lg">
              {renderMethodSelector()}
              {authMethod === 'oauth' ? renderOAuthSection() : renderDemoSection()}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="patient" pt="md">
            <Stack gap="md">
              <Card withBorder radius="md" p="xl" bg="blue.0">
                <Stack gap="md">
                  <Text size="lg" fw={600} ta="center" c="blue">
                    🏥 GLP-1 Patient Portal
                  </Text>
                  
                  <Text size="sm" c="dimmed" ta="center">
                    Mobile-optimized portal for GLP-1 treatment tracking and healthcare management
                  </Text>

                  <Button
                    leftSection={<IconUser size="1.2rem" />}
                    onClick={() => fillDemoCredentials('patient')}
                    loading={isLoading}
                    disabled={isLoading}
                    size="lg"
                    radius="md"
                    fullWidth
                    color="blue"
                  >
                    {isLoading ? 'Signing in...' : 'Access Patient Portal'}
                  </Button>

                  <Text size="xs" c="dimmed" ta="center">
                    Use demo credentials to explore patient features
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Text c="dimmed" size="xs" ta="center" mt="md">
        {authMethod === 'oauth' 
          ? 'Secured by Medplum OAuth 2.0'
          : 'Development environment - use demo credentials'
        }
      </Text>
    </Container>
  );
};

export default OAuthLoginPage;