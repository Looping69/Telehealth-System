/**
 * Settings page component
 * System configuration and user preferences
 * Based on Telehealth Dashboard PRD specifications
 */

import React, { useState } from 'react';
import {
  Container,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Button,
  TextInput,
  Select,
  Switch,
  Tabs,
  Divider,
  Grid,
  PasswordInput,
  Textarea,
  NumberInput,
  ColorInput,
  FileInput,
  Avatar,
  Badge,
  ActionIcon
} from '@mantine/core';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Phone,
  Globe,
  Save,
  Upload,
  Key,
  Clock
} from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    appointments: true,
    orders: true,
    messages: false
  });

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    title: 'Healthcare Provider',
    department: 'Internal Medicine',
    bio: 'Experienced healthcare provider specializing in internal medicine.'
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    theme: 'light',
    primaryColor: '#2563eb',
    sessionTimeout: 30
  });

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} mb={4}>
              Settings
            </Title>
            <Text c="dimmed">
              Manage your account, preferences, and system configuration
            </Text>
          </div>
          <Button leftSection={<Save size={16} />}>
            Save Changes
          </Button>
        </Group>

        {/* Settings Tabs */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="profile" leftSection={<User size={16} />}>
                Profile
              </Tabs.Tab>
              <Tabs.Tab value="notifications" leftSection={<Bell size={16} />}>
                Notifications
              </Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<Shield size={16} />}>
                Security
              </Tabs.Tab>
              <Tabs.Tab value="appearance" leftSection={<Palette size={16} />}>
                Appearance
              </Tabs.Tab>
              <Tabs.Tab value="system" leftSection={<Database size={16} />}>
                System
              </Tabs.Tab>
            </Tabs.List>

            {/* Profile Settings */}
            <Tabs.Panel value="profile" pt="lg">
              <Stack gap="lg">
                <Title order={4}>Profile Information</Title>
                
                <Group align="flex-start">
                  <Avatar size="xl" radius="md">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </Avatar>
                  <Stack gap="xs">
                    <Button variant="light" leftSection={<Upload size={16} />}>
                      Upload Photo
                    </Button>
                    <Text size="xs" c="dimmed">
                      JPG, PNG or GIF. Max size 2MB.
                    </Text>
                  </Stack>
                </Group>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="First Name"
                      value={profile.firstName}
                      onChange={(event) => setProfile({...profile, firstName: event.currentTarget.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Last Name"
                      value={profile.lastName}
                      onChange={(event) => setProfile({...profile, lastName: event.currentTarget.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Email"
                      leftSection={<Mail size={16} />}
                      value={profile.email}
                      onChange={(event) => setProfile({...profile, email: event.currentTarget.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Phone"
                      leftSection={<Phone size={16} />}
                      value={profile.phone}
                      onChange={(event) => setProfile({...profile, phone: event.currentTarget.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Title"
                      value={profile.title}
                      onChange={(event) => setProfile({...profile, title: event.currentTarget.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Department"
                      value={profile.department}
                      onChange={(value) => setProfile({...profile, department: value || ''})}
                      data={[
                        'Internal Medicine',
                        'Cardiology',
                        'Dermatology',
                        'Pediatrics',
                        'Psychiatry',
                        'Radiology'
                      ]}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio}
                      onChange={(event) => setProfile({...profile, bio: event.currentTarget.value})}
                      minRows={3}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Tabs.Panel>

            {/* Notification Settings */}
            <Tabs.Panel value="notifications" pt="lg">
              <Stack gap="lg">
                <Title order={4}>Notification Preferences</Title>
                
                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Communication Channels</Text>
                    <Switch
                      label="Email notifications"
                      description="Receive notifications via email"
                      checked={notifications.email}
                      onChange={(event) => setNotifications({...notifications, email: event.currentTarget.checked})}
                    />
                    <Switch
                      label="SMS notifications"
                      description="Receive notifications via text message"
                      checked={notifications.sms}
                      onChange={(event) => setNotifications({...notifications, sms: event.currentTarget.checked})}
                    />
                    <Switch
                      label="Push notifications"
                      description="Receive browser push notifications"
                      checked={notifications.push}
                      onChange={(event) => setNotifications({...notifications, push: event.currentTarget.checked})}
                    />
                  </Stack>
                </Card>

                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Event Types</Text>
                    <Switch
                      label="Appointment reminders"
                      description="Get notified about upcoming appointments"
                      checked={notifications.appointments}
                      onChange={(event) => setNotifications({...notifications, appointments: event.currentTarget.checked})}
                    />
                    <Switch
                      label="Order updates"
                      description="Receive updates on medical orders"
                      checked={notifications.orders}
                      onChange={(event) => setNotifications({...notifications, orders: event.currentTarget.checked})}
                    />
                    <Switch
                      label="New messages"
                      description="Get notified about new messages"
                      checked={notifications.messages}
                      onChange={(event) => setNotifications({...notifications, messages: event.currentTarget.checked})}
                    />
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>

            {/* Security Settings */}
            <Tabs.Panel value="security" pt="lg">
              <Stack gap="lg">
                <Title order={4}>Security &amp; Privacy</Title>
                
                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Password</Text>
                    <PasswordInput
                      label="Current Password"
                      placeholder="Enter current password"
                    />
                    <PasswordInput
                      label="New Password"
                      placeholder="Enter new password"
                    />
                    <PasswordInput
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                    />
                    <Button variant="light" leftSection={<Key size={16} />}>
                      Update Password
                    </Button>
                  </Stack>
                </Card>

                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Two-Factor Authentication</Text>
                    <Group justify="space-between">
                      <div>
                        <Text size="sm">Enable 2FA</Text>
                        <Text size="xs" c="dimmed">
                          Add an extra layer of security to your account
                        </Text>
                      </div>
                      <Badge color="red" variant="light">Disabled</Badge>
                    </Group>
                    <Button variant="light">
                      Enable Two-Factor Authentication
                    </Button>
                  </Stack>
                </Card>

                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Session Management</Text>
                    <NumberInput
                      label="Session Timeout (minutes)"
                      description="Automatically log out after period of inactivity"
                      value={systemSettings.sessionTimeout}
                      onChange={(value) => setSystemSettings({...systemSettings, sessionTimeout: value || 30})}
                      min={5}
                      max={120}
                      leftSection={<Clock size={16} />}
                    />
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>

            {/* Appearance Settings */}
            <Tabs.Panel value="appearance" pt="lg">
              <Stack gap="lg">
                <Title order={4}>Appearance &amp; Display</Title>
                
                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Theme</Text>
                    <Select
                      label="Color Theme"
                      value={systemSettings.theme}
                      onChange={(value) => setSystemSettings({...systemSettings, theme: value || 'light'})}
                      data={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto (System)' }
                      ]}
                    />
                    <ColorInput
                      label="Primary Color"
                      description="Choose your preferred accent color"
                      value={systemSettings.primaryColor}
                      onChange={(value) => setSystemSettings({...systemSettings, primaryColor: value})}
                    />
                  </Stack>
                </Card>

                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Localization</Text>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                          label="Language"
                          leftSection={<Globe size={16} />}
                          value={systemSettings.language}
                          onChange={(value) => setSystemSettings({...systemSettings, language: value || 'en'})}
                          data={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Spanish' },
                            { value: 'fr', label: 'French' },
                            { value: 'de', label: 'German' }
                          ]}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                          label="Timezone"
                          value={systemSettings.timezone}
                          onChange={(value) => setSystemSettings({...systemSettings, timezone: value || 'America/New_York'})}
                          data={[
                            { value: 'America/New_York', label: 'Eastern Time' },
                            { value: 'America/Chicago', label: 'Central Time' },
                            { value: 'America/Denver', label: 'Mountain Time' },
                            { value: 'America/Los_Angeles', label: 'Pacific Time' }
                          ]}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                          label="Date Format"
                          value={systemSettings.dateFormat}
                          onChange={(value) => setSystemSettings({...systemSettings, dateFormat: value || 'MM/DD/YYYY'})}
                          data={[
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                          ]}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                          label="Time Format"
                          value={systemSettings.timeFormat}
                          onChange={(value) => setSystemSettings({...systemSettings, timeFormat: value || '12h'})}
                          data={[
                            { value: '12h', label: '12 Hour (AM/PM)' },
                            { value: '24h', label: '24 Hour' }
                          ]}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>

            {/* System Settings */}
            <Tabs.Panel value="system" pt="lg">
              <Stack gap="lg">
                <Title order={4}>System Configuration</Title>
                
                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>Data Management</Text>
                    <Group justify="space-between">
                      <div>
                        <Text size="sm">Export Data</Text>
                        <Text size="xs" c="dimmed">
                          Download your data in JSON format
                        </Text>
                      </div>
                      <Button variant="light">
                        Export
                      </Button>
                    </Group>
                    <Divider />
                    <Group justify="space-between">
                      <div>
                        <Text size="sm">Clear Cache</Text>
                        <Text size="xs" c="dimmed">
                          Clear application cache and temporary files
                        </Text>
                      </div>
                      <Button variant="light" color="orange">
                        Clear Cache
                      </Button>
                    </Group>
                  </Stack>
                </Card>

                <Card withBorder p="md">
                  <Stack gap="md">
                    <Text fw={500}>System Information</Text>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" fw={500}>Version</Text>
                        <Text size="sm" c="dimmed">v2.1.0</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" fw={500}>Last Updated</Text>
                        <Text size="sm" c="dimmed">January 15, 2024</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" fw={500}>Database</Text>
                        <Text size="sm" c="dimmed">PostgreSQL 14.2</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" fw={500}>Server Status</Text>
                        <Badge color="green" variant="light">Online</Badge>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}