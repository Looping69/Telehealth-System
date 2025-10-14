/**
 * Unauthorized access page
 * Displayed when users try to access routes they don't have permission for
 */

import React from 'react';
import { Container, Title, Text, Button, Stack, Paper, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function UnauthorizedPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" shadow="md" radius="md">
        <Stack align="center" gap="xl">
          <Shield size={64} color="#ef4444" />
          
          <Stack align="center" gap="md">
            <Title order={1} ta="center" c="red">
              Access Denied
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              You don't have permission to access this page.
            </Text>
            {user && (
              <Text ta="center" size="sm" c="dimmed">
                Your current role: <strong>{user.role}</strong>
              </Text>
            )}
          </Stack>

          <Group>
            <Button
              leftSection={<ArrowLeft size={16} />}
              variant="outline"
              onClick={handleGoBack}
            >
              Go Back
            </Button>
            <Button
              leftSection={<Home size={16} />}
              color="#2563eb"
              onClick={handleGoHome}
            >
              Go to Dashboard
            </Button>
          </Group>

          <Text ta="center" size="xs" c="dimmed">
            If you believe this is an error, please contact your system administrator.
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}