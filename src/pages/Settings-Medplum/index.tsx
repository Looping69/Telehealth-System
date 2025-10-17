/**
 * Settings-Medplum Page Component
 * Manages system settings using FHIR data
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Button,
  Switch,
  TextInput,
  Select,
  Alert,
  Tabs,
  Divider,
} from '@mantine/core';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  AlertCircle,
  Save,
  Server,
} from 'lucide-react';
import { useSystemMetadata } from '../../hooks/useQuery';

/**
 * Main Settings-Medplum Page Component
 */
const SettingsMedplumPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use the standardized hook for FHIR metadata
  const { data: metadata, isLoading: metadataLoading, error: metadataError, refetch: fetchMetadata } = useSystemMetadata();

  // FHIR Server Settings
  const [fhirSettings, setFhirSettings] = useState({
    baseUrl: process.env.VITE_MEDPLUM_BASE_URL || 'http://localhost:8103',
    clientId: process.env.VITE_MEDPLUM_CLIENT_ID || 'demo-client-id',
    timeout: 30000,
    retryAttempts: 3,
  });

  // User Preferences
  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    autoRefresh: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    requireMFA: false,
    auditLogging: true,
    dataEncryption: true,
  });

  const testFhirConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Testing FHIR connection...');
      // Use the standardized hook to fetch metadata
      const result = await fetchMetadata();
      
      if (result.data) {
        setSuccess('FHIR server connection successful!');
      } else if (result.error) {
        setError(`Failed to connect to FHIR server: ${result.error.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('FHIR connection test failed:', err);
      setError('Failed to connect to FHIR server. Please check your settings.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, you would save these settings to a backend
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Settings</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Configure system settings and preferences</Text>
            </Group>
          </Stack>
          <Button 
            leftSection={<Save size={16} />} 
            onClick={saveSettings}
            loading={loading}
          >
            Save Settings
          </Button>
        </Group>

        {/* Alerts */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {success && (
          <Alert icon={<Database size={16} />} color="green" variant="light">
            {success}
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="fhir" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="fhir" leftSection={<Server size={16} />}>
              FHIR Server
            </Tabs.Tab>
            <Tabs.Tab value="user" leftSection={<User size={16} />}>
              User Preferences
            </Tabs.Tab>
            <Tabs.Tab value="notifications" leftSection={<Bell size={16} />}>
              Notifications
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<Shield size={16} />}>
              Security
            </Tabs.Tab>
          </Tabs.List>

          {/* FHIR Server Settings */}
          <Tabs.Panel value="fhir" pt="md">
            <Card withBorder padding="lg">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>FHIR Server Configuration</Text>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={testFhirConnection}
                    loading={loading || metadataLoading}
                  >
                    Test Connection
                  </Button>
                </Group>
                
                <Divider />

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Base URL"
                      placeholder="http://localhost:8103"
                      value={fhirSettings.baseUrl}
                      onChange={(e) => setFhirSettings(prev => ({
                        ...prev,
                        baseUrl: e.currentTarget.value
                      }))}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Client ID"
                      placeholder="demo-client-id"
                      value={fhirSettings.clientId}
                      onChange={(e) => setFhirSettings(prev => ({
                        ...prev,
                        clientId: e.currentTarget.value
                      }))}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Timeout (ms)"
                      type="number"
                      value={fhirSettings.timeout}
                      onChange={(e) => setFhirSettings(prev => ({
                        ...prev,
                        timeout: parseInt(e.currentTarget.value) || 30000
                      }))}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Retry Attempts"
                      type="number"
                      value={fhirSettings.retryAttempts}
                      onChange={(e) => setFhirSettings(prev => ({
                        ...prev,
                        retryAttempts: parseInt(e.currentTarget.value) || 3
                      }))}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* User Preferences */}
          <Tabs.Panel value="user" pt="md">
            <Card withBorder padding="lg">
              <Stack gap="md">
                <Text fw={500}>User Preferences</Text>
                <Divider />

                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Language"
                      value={userPreferences.language}
                      onChange={(value) => setUserPreferences(prev => ({
                        ...prev,
                        language: value || 'en'
                      }))}
                      data={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                      ]}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Timezone"
                      value={userPreferences.timezone}
                      onChange={(value) => setUserPreferences(prev => ({
                        ...prev,
                        timezone: value || 'UTC'
                      }))}
                      data={[
                        { value: 'UTC', label: 'UTC' },
                        { value: 'America/New_York', label: 'Eastern Time' },
                        { value: 'America/Chicago', label: 'Central Time' },
                        { value: 'America/Denver', label: 'Mountain Time' },
                        { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      ]}
                    />
                  </Grid.Col>
                </Grid>

                <Stack gap="sm">
                  <Switch
                    label="Dark Mode"
                    checked={userPreferences.darkMode}
                    onChange={(event) => setUserPreferences(prev => ({
                      ...prev,
                      darkMode: event.currentTarget.checked
                    }))}
                  />
                  <Switch
                    label="Auto Refresh Data"
                    checked={userPreferences.autoRefresh}
                    onChange={(event) => setUserPreferences(prev => ({
                      ...prev,
                      autoRefresh: event.currentTarget.checked
                    }))}
                  />
                </Stack>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Notifications */}
          <Tabs.Panel value="notifications" pt="md">
            <Card withBorder padding="lg">
              <Stack gap="md">
                <Text fw={500}>Notification Settings</Text>
                <Divider />

                <Stack gap="sm">
                  <Switch
                    label="Enable Notifications"
                    description="Receive system notifications and alerts"
                    checked={userPreferences.notifications}
                    onChange={(event) => setUserPreferences(prev => ({
                      ...prev,
                      notifications: event.currentTarget.checked
                    }))}
                  />
                </Stack>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Security */}
          <Tabs.Panel value="security" pt="md">
            <Card withBorder padding="lg">
              <Stack gap="md">
                <Text fw={500}>Security Settings</Text>
                <Divider />

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Session Timeout (minutes)"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        sessionTimeout: parseInt(e.currentTarget.value) || 30
                      }))}
                    />
                  </Grid.Col>
                </Grid>

                <Stack gap="sm">
                  <Switch
                    label="Require Multi-Factor Authentication"
                    description="Add an extra layer of security to user accounts"
                    checked={securitySettings.requireMFA}
                    onChange={(event) => setSecuritySettings(prev => ({
                      ...prev,
                      requireMFA: event.currentTarget.checked
                    }))}
                  />
                  <Switch
                    label="Audit Logging"
                    description="Log all user actions for security auditing"
                    checked={securitySettings.auditLogging}
                    onChange={(event) => setSecuritySettings(prev => ({
                      ...prev,
                      auditLogging: event.currentTarget.checked
                    }))}
                  />
                  <Switch
                    label="Data Encryption"
                    description="Encrypt sensitive data at rest and in transit"
                    checked={securitySettings.dataEncryption}
                    onChange={(event) => setSecuritySettings(prev => ({
                      ...prev,
                      dataEncryption: event.currentTarget.checked
                    }))}
                  />
                </Stack>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default SettingsMedplumPage;