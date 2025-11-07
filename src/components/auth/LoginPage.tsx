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
} from '@mantine/core';
import { IconAlertCircle, IconMedicalCross, IconUser, IconStethoscope } from '@tabler/icons-react';
import { useAuthStore } from '../../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'provider' | 'patient'>('provider');
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
      const from = location.state?.from?.pathname || (loginType === 'patient' ? '/patient/dashboard' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, loginType]);

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
      // Redirect will be handled by the useEffect above
    } catch (err) {
      // Error handling is managed by the authStore
      console.error('Login submission error:', err);
    }
  };

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
    clearError();
  };

  const handleTabChange = (value: string | null) => {
    if (value === 'provider' || value === 'patient') {
      setLoginType(value);
      setEmail('');
      setPassword('');
      clearError();
    }
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
                  {isLoading ? 'Signing in...' : 'Sign in as Provider'}
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
          </Tabs.Panel>

          <Tabs.Panel value="patient" pt="md">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Text size="sm" c="blue" ta="center" mb="md">
                  🏥 GLP-1 Patient Portal Access
                </Text>

                <TextInput
                  label="Email address"
                  placeholder="Enter your patient email"
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
                  color="blue"
                >
                  {isLoading ? 'Signing in...' : 'Access Patient Portal'}
                </Button>

                <Divider label="Demo Patient" labelPosition="center" />

                <Button
                  variant="light"
                  onClick={() => fillDemoCredentials('patient')}
                  disabled={isLoading}
                  fullWidth
                  color="blue"
                >
                  Demo Patient Login
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  Mobile-optimized portal for GLP-1 treatment tracking
                </Text>
              </Stack>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Text c="dimmed" size="xs" ta="center" mt="md">
        Secure healthcare management platform
      </Text>
    </Container>
  );
};

export default LoginPage;