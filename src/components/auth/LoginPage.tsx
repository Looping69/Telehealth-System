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
} from '@mantine/core';
import { IconAlertCircle, IconMedicalCross } from '@tabler/icons-react';
import { useAuthStore } from '../../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { login, isLoading, error, isAuthenticated, clearError, initializeMedplum } = useAuthStore();

  // Initialize Medplum client on component mount
  useEffect(() => {
    initializeMedplum();
  }, []); // Empty dependency array to run only once on mount

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when component unmounts or inputs change
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      // Error handling is managed by the authStore
      console.error('Login submission error:', err);
    }
  };

  const fillDemoCredentials = (userType: 'admin' | 'doctor' | 'nurse' | 'superadmin') => {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'medplum_admin' },
      doctor: { email: 'doctor@example.com', password: 'doctor123' },
      nurse: { email: 'nurse@example.com', password: 'nurse123' },
      superadmin: { email: 'superadmin@example.com', password: 'superadmin123' }
    };
    
    const cred = credentials[userType];
    setEmail(cred.email);
    setPassword(cred.password);
    clearError();
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Stack align="center" gap="md">
          <IconMedicalCross size={48} color="blue" />
          <Title order={2} ta="center">
            Sign in to Telehealth System
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Access your healthcare management platform
          </Text>
        </Stack>
      </Center>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
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
            />

            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Login Failed" color="red">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !email.trim() || !password.trim()}
              loading={isLoading}
              leftSection={isLoading ? <Loader size="sm" /> : null}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Divider label="Demo Credentials" labelPosition="center" />

            <Group grow>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('admin')}
                disabled={isLoading}
              >
                Admin
              </Button>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('doctor')}
                disabled={isLoading}
              >
                Doctor
              </Button>
            </Group>

            <Group grow>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('nurse')}
                disabled={isLoading}
              >
                Nurse
              </Button>
              <Button
                variant="light"
                onClick={() => fillDemoCredentials('superadmin')}
                disabled={isLoading}
              >
                Super Admin
              </Button>
            </Group>

            <Text size="xs" c="dimmed" ta="center">
              Click any demo button to auto-fill credentials, then sign in
            </Text>
          </Stack>
        </form>
      </Paper>

      <Text c="dimmed" size="xs" ta="center" mt="md">
        Secure healthcare management platform
      </Text>
    </Container>
  );
};

export default LoginPage;