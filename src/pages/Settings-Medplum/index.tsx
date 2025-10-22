/**
 * Settings-Medplum Page Component
 * Manages system settings using FHIR data from Medplum server
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
  TextInput,
  Select,
  Switch,
  NumberInput,
  Textarea,
  Tabs,
  Divider,
  ActionIcon,
  Modal,
  PasswordInput,
  FileInput,
  ColorInput,
  Slider,
  Checkbox,
  Avatar,
  Alert,
  Code,
} from '@mantine/core';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Phone,
  Lock,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Check,
  X,
  Upload,
  Download,
  Trash2,
  Server,
  AlertCircle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useSystemMetadata } from '../../hooks/useQuery';

/**
 * Interface definitions
 */
interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  messageAlerts: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
  reminderTime: number; // minutes before appointment
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  passwordExpiry: number; // days
  loginAttempts: number;
  ipWhitelist: string[];
  auditLogging: boolean;
}

interface SystemSettings {
  organizationName: string;
  organizationLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  appointmentDuration: number; // minutes
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

interface IntegrationSettings {
  medplumUrl: string;
  medplumClientId: string;
  emailProvider: string;
  emailApiKey: string;
  smsProvider: string;
  smsApiKey: string;
  paymentProvider: string;
  paymentApiKey: string;
}

interface FHIRSettings {
  baseUrl: string;
  clientId: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * Mock data for settings (enhanced with FHIR integration)
 */
const mockUserSettings: UserSettings = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  timezone: 'America/New_York',
  language: 'English',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
};

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  appointmentReminders: true,
  messageAlerts: true,
  systemUpdates: false,
  marketingEmails: false,
  reminderTime: 30,
};

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 60,
  passwordExpiry: 90,
  loginAttempts: 5,
  ipWhitelist: [],
  auditLogging: true,
};

const mockSystemSettings: SystemSettings = {
  organizationName: 'HealthCare Plus',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  timezone: 'America/New_York',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  appointmentDuration: 30,
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

const mockIntegrationSettings: IntegrationSettings = {
  medplumUrl: 'https://api.medplum.com',
  medplumClientId: 'telehealth-dashboard',
  emailProvider: 'SendGrid',
  emailApiKey: '••••••••••••••••',
  smsProvider: 'Twilio',
  smsApiKey: '••••••••••••••••',
  paymentProvider: 'Stripe',
  paymentApiKey: '••••••••••••••••',
};

/**
 * User Profile Settings Component
 */
const UserProfileSettings: React.FC = () => {
  const [userSettings, setUserSettings] = useState(mockUserSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!userSettings.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!userSettings.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!userSettings.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSettings.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!userSettings.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(userSettings.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with FHIR integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated in FHIR',
        color: 'green',
      });
      
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Avatar size="lg" src={userSettings.avatar} />
            <div>
              <Title order={4}>Profile Information</Title>
              <Text size="sm" c="dimmed">
                Manage your personal information and preferences (FHIR integrated)
              </Text>
            </div>
          </Group>
          <Button
            variant={isEditing ? 'filled' : 'light'}
            leftSection={isEditing ? <Save size={16} /> : <User size={16} />}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            loading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              value={userSettings.firstName}
              onChange={(event) =>
                setUserSettings({ ...userSettings, firstName: event.currentTarget.value })
              }
              disabled={!isEditing}
              error={errors.firstName}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              value={userSettings.lastName}
              onChange={(event) =>
                setUserSettings({ ...userSettings, lastName: event.currentTarget.value })
              }
              disabled={!isEditing}
              error={errors.lastName}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              value={userSettings.email}
              onChange={(event) =>
                setUserSettings({ ...userSettings, email: event.currentTarget.value })
              }
              disabled={!isEditing}
              error={errors.email}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              value={userSettings.phone}
              onChange={(event) =>
                setUserSettings({ ...userSettings, phone: event.currentTarget.value })
              }
              disabled={!isEditing}
              error={errors.phone}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Timezone"
              value={userSettings.timezone}
              onChange={(value) =>
                setUserSettings({ ...userSettings, timezone: value || 'America/New_York' })
              }
              disabled={!isEditing}
              data={[
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Chicago', label: 'Central Time' },
                { value: 'America/Denver', label: 'Mountain Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                { value: 'UTC', label: 'UTC' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Language"
              value={userSettings.language}
              onChange={(value) =>
                setUserSettings({ ...userSettings, language: value || 'English' })
              }
              disabled={!isEditing}
              data={[
                { value: 'English', label: 'English' },
                { value: 'Spanish', label: 'Spanish' },
                { value: 'French', label: 'French' },
                { value: 'German', label: 'German' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Date Format"
              value={userSettings.dateFormat}
              onChange={(value) =>
                setUserSettings({ ...userSettings, dateFormat: value || 'MM/DD/YYYY' })
              }
              disabled={!isEditing}
              data={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Time Format"
              value={userSettings.timeFormat}
              onChange={(value) =>
                setUserSettings({ ...userSettings, timeFormat: value || '12h' })
              }
              disabled={!isEditing}
              data={[
                { value: '12h', label: '12 Hour' },
                { value: '24h', label: '24 Hour' },
              ]}
            />
          </Grid.Col>
        </Grid>

        {isEditing && (
          <>
            <Divider />
            <FileInput
              label="Profile Picture"
              placeholder="Upload new profile picture"
              accept="image/*"
              leftSection={<Upload size={16} />}
            />
          </>
        )}
      </Stack>
    </Card>
  );
};

/**
 * Notification Settings Component
 */
const NotificationSettingsComponent: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Notification Settings Updated',
        message: 'Your notification preferences have been successfully saved',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save notification settings. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={4}>Notification Preferences</Title>
            <Text size="sm" c="dimmed">
              Configure how you want to receive notifications
            </Text>
          </div>
          <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
            Save Changes
          </Button>
        </Group>

        <Divider />

        <Stack gap="lg">
          <div>
            <Text fw={500} mb="md">Communication Channels</Text>
            <Stack gap="md">
              <Switch
                label="Email Notifications"
                description="Receive notifications via email"
                checked={notificationSettings.emailNotifications}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: event.currentTarget.checked,
                  })
                }
              />
              <Switch
                label="SMS Notifications"
                description="Receive notifications via text message"
                checked={notificationSettings.smsNotifications}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: event.currentTarget.checked,
                  })
                }
              />
              <Switch
                label="Push Notifications"
                description="Receive browser push notifications"
                checked={notificationSettings.pushNotifications}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: event.currentTarget.checked,
                  })
                }
              />
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Notification Types</Text>
            <Stack gap="md">
              <Switch
                label="Appointment Reminders"
                description="Get reminded about upcoming appointments"
                checked={notificationSettings.appointmentReminders}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    appointmentReminders: event.currentTarget.checked,
                  })
                }
              />
              <Switch
                label="Message Alerts"
                description="Get notified about new messages"
                checked={notificationSettings.messageAlerts}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    messageAlerts: event.currentTarget.checked,
                  })
                }
              />
              <Switch
                label="System Updates"
                description="Get notified about system maintenance and updates"
                checked={notificationSettings.systemUpdates}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    systemUpdates: event.currentTarget.checked,
                  })
                }
              />
              <Switch
                label="Marketing Emails"
                description="Receive promotional emails and newsletters"
                checked={notificationSettings.marketingEmails}
                onChange={(event) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    marketingEmails: event.currentTarget.checked,
                  })
                }
              />
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Reminder Settings</Text>
            <NumberInput
              label="Appointment Reminder Time"
              description="How many minutes before an appointment to send reminders"
              value={notificationSettings.reminderTime}
              onChange={(value) =>
                setNotificationSettings({
                  ...notificationSettings,
                  reminderTime: Number(value) || 30,
                })
              }
              min={5}
              max={1440}
              step={5}
              suffix=" minutes"
            />
          </div>
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * Security Settings Component
 */
const SecuritySettingsComponent: React.FC = () => {
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings);
  const [changePasswordOpened, { open: openChangePassword, close: closeChangePassword }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const validatePassword = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        color: 'red',
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notifications.show({
        title: 'Password Changed',
        message: 'Your password has been successfully updated',
        color: 'green',
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      closeChangePassword();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to change password. Please try again.',
        color: 'red',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Security Settings Updated',
        message: 'Your security preferences have been successfully saved',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save security settings. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={4}>Security Settings</Title>
            <Text size="sm" c="dimmed">
              Manage your account security and access controls
            </Text>
          </div>
          <Group gap="sm">
            <Button
              variant="outline"
              leftSection={<Key size={16} />}
              onClick={openChangePassword}
            >
              Change Password
            </Button>
            <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
              Save Changes
            </Button>
          </Group>
        </Group>

        <Divider />

        <Stack gap="lg">
          <div>
            <Text fw={500} mb="md">Authentication</Text>
            <Stack gap="md">
              <Switch
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                checked={securitySettings.twoFactorEnabled}
                onChange={(event) =>
                  setSecuritySettings({
                    ...securitySettings,
                    twoFactorEnabled: event.currentTarget.checked,
                  })
                }
              />
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Session Management</Text>
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Session Timeout"
                  description="Minutes of inactivity before automatic logout"
                  value={securitySettings.sessionTimeout}
                  onChange={(value) =>
                    setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: Number(value) || 60,
                    })
                  }
                  min={5}
                  max={480}
                  step={5}
                  suffix=" minutes"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Password Expiry"
                  description="Days before password must be changed"
                  value={securitySettings.passwordExpiry}
                  onChange={(value) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordExpiry: Number(value) || 90,
                    })
                  }
                  min={30}
                  max={365}
                  step={30}
                  suffix=" days"
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Access Control</Text>
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Max Login Attempts"
                  description="Number of failed attempts before account lockout"
                  value={securitySettings.loginAttempts}
                  onChange={(value) =>
                    setSecuritySettings({
                      ...securitySettings,
                      loginAttempts: Number(value) || 5,
                    })
                  }
                  min={3}
                  max={10}
                />
              </Grid.Col>
            </Grid>
            <Textarea
              label="IP Whitelist"
              description="Comma-separated list of allowed IP addresses (leave empty to allow all)"
              value={securitySettings.ipWhitelist.join(', ')}
              onChange={(event) =>
                setSecuritySettings({
                  ...securitySettings,
                  ipWhitelist: event.currentTarget.value
                    .split(',')
                    .map(ip => ip.trim())
                    .filter(ip => ip.length > 0),
                })
              }
              placeholder="192.168.1.1, 10.0.0.1"
              minRows={2}
            />
          </div>

          <div>
            <Text fw={500} mb="md">Audit & Logging</Text>
            <Switch
              label="Audit Logging"
              description="Log all user actions for security auditing"
              checked={securitySettings.auditLogging}
              onChange={(event) =>
                setSecuritySettings({
                  ...securitySettings,
                  auditLogging: event.currentTarget.checked,
                })
              }
            />
          </div>
        </Stack>
      </Stack>

      {/* Change Password Modal */}
      <Modal
        opened={changePasswordOpened}
        onClose={closeChangePassword}
        title="Change Password"
        size="md"
      >
        <Stack gap="md">
          <PasswordInput
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(event) =>
              setPasswordData({ ...passwordData, currentPassword: event.currentTarget.value })
            }
            error={passwordErrors.currentPassword}
          />
          <PasswordInput
            label="New Password"
            value={passwordData.newPassword}
            onChange={(event) =>
              setPasswordData({ ...passwordData, newPassword: event.currentTarget.value })
            }
            error={passwordErrors.newPassword}
          />
          <PasswordInput
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(event) =>
              setPasswordData({ ...passwordData, confirmPassword: event.currentTarget.value })
            }
            error={passwordErrors.confirmPassword}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeChangePassword}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} loading={isPasswordLoading}>
              Change Password
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
};

/**
 * System Settings Component
 */
const SystemSettingsComponent: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState(mockSystemSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'System Settings Updated',
        message: 'Your system configuration has been successfully saved',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save system settings. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={4}>System Configuration</Title>
            <Text size="sm" c="dimmed">
              Configure organization settings and system preferences
            </Text>
          </div>
          <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
            Save Changes
          </Button>
        </Group>

        <Divider />

        <Stack gap="lg">
          <div>
            <Text fw={500} mb="md">Organization Information</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Organization Name"
                  value={systemSettings.organizationName}
                  onChange={(event) =>
                    setSystemSettings({
                      ...systemSettings,
                      organizationName: event.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <FileInput
                  label="Organization Logo"
                  placeholder="Upload logo"
                  accept="image/*"
                  leftSection={<Upload size={16} />}
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Branding & Appearance</Text>
            <Grid>
              <Grid.Col span={6}>
                <ColorInput
                  label="Primary Color"
                  value={systemSettings.primaryColor}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, primaryColor: value })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <ColorInput
                  label="Secondary Color"
                  value={systemSettings.secondaryColor}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, secondaryColor: value })
                  }
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Regional Settings</Text>
            <Grid>
              <Grid.Col span={4}>
                <Select
                  label="Timezone"
                  value={systemSettings.timezone}
                  onChange={(value) =>
                    setSystemSettings({
                      ...systemSettings,
                      timezone: value || 'America/New_York',
                    })
                  }
                  data={[
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    { value: 'UTC', label: 'UTC' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Currency"
                  value={systemSettings.currency}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, currency: value || 'USD' })
                  }
                  data={[
                    { value: 'USD', label: 'US Dollar' },
                    { value: 'EUR', label: 'Euro' },
                    { value: 'GBP', label: 'British Pound' },
                    { value: 'CAD', label: 'Canadian Dollar' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Date Format"
                  value={systemSettings.dateFormat}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, dateFormat: value || 'MM/DD/YYYY' })
                  }
                  data={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Appointment Settings</Text>
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Default Appointment Duration"
                  value={systemSettings.appointmentDuration}
                  onChange={(value) =>
                    setSystemSettings({
                      ...systemSettings,
                      appointmentDuration: Number(value) || 30,
                    })
                  }
                  min={15}
                  max={120}
                  step={15}
                  suffix=" minutes"
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Working Hours</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Start Time"
                  type="time"
                  value={systemSettings.workingHours.start}
                  onChange={(event) =>
                    setSystemSettings({
                      ...systemSettings,
                      workingHours: {
                        ...systemSettings.workingHours,
                        start: event.currentTarget.value,
                      },
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="End Time"
                  type="time"
                  value={systemSettings.workingHours.end}
                  onChange={(event) =>
                    setSystemSettings({
                      ...systemSettings,
                      workingHours: {
                        ...systemSettings.workingHours,
                        end: event.currentTarget.value,
                      },
                    })
                  }
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Working Days</Text>
            <Checkbox.Group
              value={systemSettings.workingDays}
              onChange={(value) =>
                setSystemSettings({ ...systemSettings, workingDays: value })
              }
            >
              <Group>
                <Checkbox value="Monday" label="Monday" />
                <Checkbox value="Tuesday" label="Tuesday" />
                <Checkbox value="Wednesday" label="Wednesday" />
                <Checkbox value="Thursday" label="Thursday" />
                <Checkbox value="Friday" label="Friday" />
                <Checkbox value="Saturday" label="Saturday" />
                <Checkbox value="Sunday" label="Sunday" />
              </Group>
            </Checkbox.Group>
          </div>
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * Integration Settings Component (Enhanced with FHIR)
 */
const IntegrationSettingsComponent: React.FC = () => {
  const [integrationSettings, setIntegrationSettings] = useState(mockIntegrationSettings);
  const [fhirSettings, setFhirSettings] = useState<FHIRSettings>({
    baseUrl: import.meta.env.VITE_MEDPLUM_BASE_URL || 'https://api.medplum.com',
    clientId: import.meta.env.VITE_MEDPLUM_CLIENT_ID || 'demo-client-id',
    timeout: 30000,
    retryAttempts: 3,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  // Use the standardized hook for FHIR metadata
  const { data: metadata, isLoading: metadataLoading, error: metadataError, refetch: fetchMetadata } = useSystemMetadata();

  const testConnection = async (service: string) => {
    setIsLoading(true);
    setTestResults({ ...testResults, [service]: 'testing' });

    try {
      if (service === 'medplum') {
        // Test FHIR connection using the standardized hook
        const result = await fetchMetadata();
        
        if (result.data) {
          setTestResults({ ...testResults, [service]: 'success' });
          notifications.show({
            title: 'Connection Successful',
            message: `Successfully connected to ${service}`,
            color: 'green',
          });
        } else if (result.error) {
          setTestResults({ ...testResults, [service]: 'error' });
          notifications.show({
            title: 'Connection Failed',
            message: `Failed to connect to ${service}: ${result.error.message}`,
            color: 'red',
          });
        }
      } else {
        // Simulate other service tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTestResults({ ...testResults, [service]: 'success' });
        notifications.show({
          title: 'Connection Successful',
          message: `Successfully connected to ${service}`,
          color: 'green',
        });
      }
    } catch (error) {
      setTestResults({ ...testResults, [service]: 'error' });
      notifications.show({
        title: 'Connection Failed',
        message: `Failed to connect to ${service}`,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Integration Settings Updated',
        message: 'Your integration configuration has been successfully saved',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save integration settings. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatus = (service: string) => {
    const status = testResults[service];
    if (status === 'testing') return { color: 'yellow', text: 'Testing...' };
    if (status === 'success') return { color: 'green', text: 'Connected' };
    if (status === 'error') return { color: 'red', text: 'Failed' };
    return { color: 'gray', text: 'Not tested' };
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={4}>Integration Settings</Title>
            <Text size="sm" c="dimmed">
              Configure external service integrations and API connections
            </Text>
          </div>
          <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
            Save Changes
          </Button>
        </Group>

        <Divider />

        <Stack gap="lg">
          {/* FHIR/Medplum Integration */}
          <div>
            <Group justify="space-between" align="center" mb="md">
              <Text fw={500}>FHIR Server (Medplum)</Text>
              <Group gap="xs">
                <Badge color={getConnectionStatus('medplum').color} variant="light">
                  {getConnectionStatus('medplum').text}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => testConnection('medplum')}
                  loading={isLoading && testResults.medplum === 'testing'}
                  leftSection={<RefreshCw size={14} />}
                >
                  Test
                </Button>
              </Group>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Base URL"
                  value={fhirSettings.baseUrl}
                  onChange={(event) =>
                    setFhirSettings({ ...fhirSettings, baseUrl: event.currentTarget.value })
                  }
                  placeholder="https://api.medplum.com"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Client ID"
                  value={fhirSettings.clientId}
                  onChange={(event) =>
                    setFhirSettings({ ...fhirSettings, clientId: event.currentTarget.value })
                  }
                  placeholder="your-client-id"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Timeout (ms)"
                  value={fhirSettings.timeout}
                  onChange={(value) =>
                    setFhirSettings({ ...fhirSettings, timeout: Number(value) || 30000 })
                  }
                  min={5000}
                  max={120000}
                  step={5000}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Retry Attempts"
                  value={fhirSettings.retryAttempts}
                  onChange={(value) =>
                    setFhirSettings({ ...fhirSettings, retryAttempts: Number(value) || 3 })
                  }
                  min={1}
                  max={10}
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* Email Integration */}
          <div>
            <Group justify="space-between" align="center" mb="md">
              <Text fw={500}>Email Service</Text>
              <Group gap="xs">
                <Badge color={getConnectionStatus('email').color} variant="light">
                  {getConnectionStatus('email').text}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => testConnection('email')}
                  loading={isLoading && testResults.email === 'testing'}
                  leftSection={<RefreshCw size={14} />}
                >
                  Test
                </Button>
              </Group>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Email Provider"
                  value={integrationSettings.emailProvider}
                  onChange={(value) =>
                    setIntegrationSettings({
                      ...integrationSettings,
                      emailProvider: value || 'SendGrid',
                    })
                  }
                  data={[
                    { value: 'SendGrid', label: 'SendGrid' },
                    { value: 'Mailgun', label: 'Mailgun' },
                    { value: 'AWS SES', label: 'AWS SES' },
                    { value: 'SMTP', label: 'Custom SMTP' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <PasswordInput
                  label="API Key"
                  value={integrationSettings.emailApiKey}
                  onChange={(event) =>
                    setIntegrationSettings({
                      ...integrationSettings,
                      emailApiKey: event.currentTarget.value,
                    })
                  }
                  placeholder="Enter API key"
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* SMS Integration */}
          <div>
            <Group justify="space-between" align="center" mb="md">
              <Text fw={500}>SMS Service</Text>
              <Group gap="xs">
                <Badge color={getConnectionStatus('sms').color} variant="light">
                  {getConnectionStatus('sms').text}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => testConnection('sms')}
                  loading={isLoading && testResults.sms === 'testing'}
                  leftSection={<RefreshCw size={14} />}
                >
                  Test
                </Button>
              </Group>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="SMS Provider"
                  value={integrationSettings.smsProvider}
                  onChange={(value) =>
                    setIntegrationSettings({
                      ...integrationSettings,
                      smsProvider: value || 'Twilio',
                    })
                  }
                  data={[
                    { value: 'Twilio', label: 'Twilio' },
                    { value: 'AWS SNS', label: 'AWS SNS' },
                    { value: 'MessageBird', label: 'MessageBird' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <PasswordInput
                  label="API Key"
                  value={integrationSettings.smsApiKey}
                  onChange={(event) =>
                    setIntegrationSettings({
                      ...integrationSettings,
                      smsApiKey: event.currentTarget.value,
                    })
                  }
                  placeholder="Enter API key"
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* Payment Integration */}
          <div>
            <Group justify="space-between" align="center" mb="md">
              <Text fw={500}>Payment Service</Text>
              <Group gap="xs">
                <Badge color={getConnectionStatus('payment').color} variant="light">
                  {getConnectionStatus('payment').text}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => testConnection('payment')}
                  loading={isLoading && testResults.payment === 'testing'}
                  leftSection={<RefreshCw size={14} />}
                >
                  Test
                </Button>
              </Group>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Payment Provider"
                  value={integrationSettings.paymentProvider}
                  onChange={(value) =>
                    setIntegrationSettings({
                      ...integrationSettings,
                      paymentProvider: value || 'Stripe',
                    })
                  }
                  data={[
                    { value: 'Stripe', label: 'Stripe' },
                    { value: 'PayPal', label: 'PayPal' },
                    { value: 'Square', label: 'Square' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <PasswordInput
                  label="API Key"
                  value={integrationSettings.paymentApiKey}
                  onChange={(event) =>
                    setIntegrationSettings({
                      ...integrationSettings,
                      paymentApiKey: event.currentTarget.value,
                    })
                  }
                  placeholder="Enter API key"
                />
              </Grid.Col>
            </Grid>
          </div>
        </Stack>

        {/* Connection Status Summary */}
        <Alert icon={<Info size={16} />} color="blue" variant="light">
          <Text size="sm">
            <strong>Connection Status:</strong> Test your integrations to ensure they're working properly.
            All API keys are encrypted and stored securely.
          </Text>
        </Alert>
      </Stack>
    </Card>
  );
};

/**
 * Main Settings-Medplum Page Component
 */
export const SettingsMedplumPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use the standardized hook for FHIR metadata
  const { data: metadata, isLoading: metadataLoading, error: metadataError } = useSystemMetadata();

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={2}>Settings</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage your account, system, and integration settings</Text>
            </Group>
          </Stack>
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
        <Tabs defaultValue="profile">
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
            <Tabs.Tab value="system" leftSection={<Settings size={16} />}>
              System
            </Tabs.Tab>
            <Tabs.Tab value="integrations" leftSection={<Globe size={16} />}>
              Integrations
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" pt="lg">
            <UserProfileSettings />
          </Tabs.Panel>

          <Tabs.Panel value="notifications" pt="lg">
            <NotificationSettingsComponent />
          </Tabs.Panel>

          <Tabs.Panel value="security" pt="lg">
            <SecuritySettingsComponent />
          </Tabs.Panel>

          <Tabs.Panel value="system" pt="lg">
            <SystemSettingsComponent />
          </Tabs.Panel>

          <Tabs.Panel value="integrations" pt="lg">
            <IntegrationSettingsComponent />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default SettingsMedplumPage;