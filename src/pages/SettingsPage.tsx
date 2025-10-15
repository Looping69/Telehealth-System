/**
 * Settings Page Component
 * Manages system settings, user preferences, and configuration
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

/**
 * Settings interfaces
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

/**
 * Mock data for settings
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
  medplumUrl: 'http://localhost:8103',
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
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
                Manage your personal information and preferences
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
              type="email"
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
              data={[
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              ]}
              value={userSettings.timezone}
              onChange={(value) =>
                setUserSettings({ ...userSettings, timezone: value || '' })
              }
              disabled={!isEditing}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Language"
              data={[
                { value: 'English', label: 'English' },
                { value: 'Spanish', label: 'Spanish' },
                { value: 'French', label: 'French' },
                { value: 'German', label: 'German' },
              ]}
              value={userSettings.language}
              onChange={(value) =>
                setUserSettings({ ...userSettings, language: value || '' })
              }
              disabled={!isEditing}
            />
          </Grid.Col>
        </Grid>

        {isEditing && (
          <Group justify="flex-end" gap="xs">
            <Button variant="light" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={isLoading}>Save Changes</Button>
          </Group>
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
        message: 'Your security settings have been successfully saved',
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
          <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
            Save Changes
          </Button>
        </Group>

        <Divider />

        <Stack gap="lg">
          <div>
            <Text fw={500} mb="md">Authentication</Text>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={500}>Change Password</Text>
                  <Text size="sm" c="dimmed">
                    Update your account password
                  </Text>
                </div>
                <Button variant="light" leftSection={<Lock size={16} />} onClick={openChangePassword}>
                  Change Password
                </Button>
              </Group>
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
            <Stack gap="md">
              <NumberInput
                label="Session Timeout"
                description="Automatically log out after this many minutes of inactivity"
                value={securitySettings.sessionTimeout}
                onChange={(value) =>
                  setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: Number(value) || 60,
                  })
                }
                min={15}
                max={480}
                step={15}
                suffix=" minutes"
              />
              <NumberInput
                label="Password Expiry"
                description="Require password change after this many days"
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
              <NumberInput
                label="Login Attempts"
                description="Lock account after this many failed login attempts"
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
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Audit &amp; Logging</Text>
            <Switch
              label="Audit Logging"
              description="Log all user actions for security and compliance"
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
            placeholder="Enter your current password"
            value={passwordData.currentPassword}
            onChange={(event) =>
              setPasswordData({ ...passwordData, currentPassword: event.currentTarget.value })
            }
            error={passwordErrors.currentPassword}
            required
          />
          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            value={passwordData.newPassword}
            onChange={(event) =>
              setPasswordData({ ...passwordData, newPassword: event.currentTarget.value })
            }
            error={passwordErrors.newPassword}
            required
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={passwordData.confirmPassword}
            onChange={(event) =>
              setPasswordData({ ...passwordData, confirmPassword: event.currentTarget.value })
            }
            error={passwordErrors.confirmPassword}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeChangePassword} disabled={isPasswordLoading}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} loading={isPasswordLoading}>Update Password</Button>
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!systemSettings.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!systemSettings.primaryColor) {
      newErrors.primaryColor = 'Primary color is required';
    }

    if (!systemSettings.secondaryColor) {
      newErrors.secondaryColor = 'Secondary color is required';
    }

    if (systemSettings.appointmentDuration < 15 || systemSettings.appointmentDuration > 240) {
      newErrors.appointmentDuration = 'Appointment duration must be between 15 and 240 minutes';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'System Settings Updated',
        message: 'Your system configuration has been successfully saved',
        color: 'green',
      });
      
      setErrors({});
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
              Configure system-wide settings and preferences
            </Text>
          </div>
          <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
            Save Changes
          </Button>
        </Group>

        <Divider />

        <Stack gap="lg">
          <div>
            <Text fw={500} mb="md">Organization</Text>
            <Stack gap="md">
              <TextInput
                label="Organization Name"
                value={systemSettings.organizationName}
                onChange={(event) =>
                  setSystemSettings({
                    ...systemSettings,
                    organizationName: event.currentTarget.value,
                  })
                }
                error={errors.organizationName}
              />
              <FileInput
                label="Organization Logo"
                placeholder="Upload logo"
                accept="image/*"
              />
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Appearance</Text>
            <Grid>
              <Grid.Col span={6}>
                <ColorInput
                  label="Primary Color"
                  value={systemSettings.primaryColor}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, primaryColor: value })
                  }
                  error={errors.primaryColor}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <ColorInput
                  label="Secondary Color"
                  value={systemSettings.secondaryColor}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, secondaryColor: value })
                  }
                  error={errors.secondaryColor}
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Regional Settings</Text>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Timezone"
                  data={[
                    { value: 'America/New_York', label: 'Eastern Time (ET)' },
                    { value: 'America/Chicago', label: 'Central Time (CT)' },
                    { value: 'America/Denver', label: 'Mountain Time (MT)' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  ]}
                  value={systemSettings.timezone}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, timezone: value || '' })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Currency"
                  data={[
                    { value: 'USD', label: 'US Dollar (USD)' },
                    { value: 'EUR', label: 'Euro (EUR)' },
                    { value: 'GBP', label: 'British Pound (GBP)' },
                    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
                  ]}
                  value={systemSettings.currency}
                  onChange={(value) =>
                    setSystemSettings({ ...systemSettings, currency: value || '' })
                  }
                />
              </Grid.Col>
            </Grid>
          </div>

          <div>
            <Text fw={500} mb="md">Appointment Settings</Text>
            <NumberInput
              label="Default Appointment Duration"
              description="Default duration for new appointments"
              value={systemSettings.appointmentDuration}
              onChange={(value) =>
                setSystemSettings({
                  ...systemSettings,
                  appointmentDuration: Number(value) || 30,
                })
              }
              min={15}
              max={240}
              step={15}
              suffix=" minutes"
              error={errors.appointmentDuration}
            />
          </div>
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * Integration Settings Component
 * Manages external service integrations
 */
const IntegrationSettingsComponent: React.FC = () => {
  const [integrationSettings, setIntegrationSettings] = useState(mockIntegrationSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testingConnections, setTestingConnections] = useState<Record<string, boolean>>({});

  /**
   * Validates integration settings form
   * @returns Object containing validation errors
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!integrationSettings.medplumUrl.trim()) {
      newErrors.medplumUrl = 'Medplum URL is required';
    } else if (!integrationSettings.medplumUrl.match(/^https?:\/\/.+/)) {
      newErrors.medplumUrl = 'Please enter a valid URL';
    }

    if (!integrationSettings.medplumClientId.trim()) {
      newErrors.medplumClientId = 'Client ID is required';
    }

    if (!integrationSettings.emailProvider) {
      newErrors.emailProvider = 'Email provider is required';
    }

    if (!integrationSettings.emailApiKey.trim() || integrationSettings.emailApiKey === '••••••••••••••••') {
      newErrors.emailApiKey = 'Email API key is required';
    }

    if (!integrationSettings.smsProvider) {
      newErrors.smsProvider = 'SMS provider is required';
    }

    if (!integrationSettings.smsApiKey.trim() || integrationSettings.smsApiKey === '••••••••••••••••') {
      newErrors.smsApiKey = 'SMS API key is required';
    }

    if (!integrationSettings.paymentProvider) {
      newErrors.paymentProvider = 'Payment provider is required';
    }

    if (!integrationSettings.paymentApiKey.trim() || integrationSettings.paymentApiKey === '••••••••••••••••') {
      newErrors.paymentApiKey = 'Payment API key is required';
    }

    return newErrors;
  };

  /**
   * Handles saving integration settings
   */
  const handleSave = async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors below',
        color: 'red',
        icon: <X size={16} />,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notifications.show({
        title: 'Success',
        message: 'Integration settings saved successfully',
        color: 'green',
        icon: <Check size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save integration settings',
        color: 'red',
        icon: <X size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles testing connections to external services
   * @param service - The service to test connection for
   */
  const handleTestConnection = async (service: string) => {
    setTestingConnections(prev => ({ ...prev, [service]: true }));

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        notifications.show({
          title: 'Connection Successful',
          message: `Successfully connected to ${service} service`,
          color: 'green',
          icon: <Check size={16} />,
        });
      } else {
        notifications.show({
          title: 'Connection Failed',
          message: `Failed to connect to ${service} service. Please check your configuration.`,
          color: 'red',
          icon: <X size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Connection Error',
        message: `Error testing ${service} connection`,
        color: 'red',
        icon: <X size={16} />,
      });
    } finally {
      setTestingConnections(prev => ({ ...prev, [service]: false }));
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={4}>Integration Settings</Title>
            <Text size="sm" c="dimmed">
              Configure external service integrations
            </Text>
          </div>
          <Button leftSection={<Save size={16} />} onClick={handleSave} loading={isLoading}>
            Save Changes
          </Button>
        </Group>

        <Divider />

        <Stack gap="lg">
          <div>
            <Text fw={500} mb="md">FHIR Server (Medplum)</Text>
            <Alert icon={<Info size={16} />} color="blue" mb="md">
              Configure your Medplum FHIR server connection for patient data management
            </Alert>
            <Stack gap="md">
              <TextInput
                label="Medplum Server URL"
                value={integrationSettings.medplumUrl}
                onChange={(event) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    medplumUrl: event.currentTarget.value,
                  })
                }
                error={errors.medplumUrl}
              />
              <TextInput
                label="Client ID"
                value={integrationSettings.medplumClientId}
                onChange={(event) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    medplumClientId: event.currentTarget.value,
                  })
                }
                error={errors.medplumClientId}
              />
              <Group>
                <Button
                  variant="light"
                  leftSection={<RefreshCw size={16} />}
                  onClick={() => handleTestConnection('medplum')}
                  loading={testingConnections.medplum}
                >
                  Test Connection
                </Button>
              </Group>
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Email Service</Text>
            <Stack gap="md">
              <Select
                label="Email Provider"
                data={[
                  { value: 'SendGrid', label: 'SendGrid' },
                  { value: 'Mailgun', label: 'Mailgun' },
                  { value: 'AWS SES', label: 'AWS SES' },
                  { value: 'SMTP', label: 'Custom SMTP' },
                ]}
                value={integrationSettings.emailProvider}
                onChange={(value) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    emailProvider: value || '',
                  })
                }
                error={errors.emailProvider}
              />
              <PasswordInput
                label="API Key"
                value={integrationSettings.emailApiKey}
                onChange={(event) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    emailApiKey: event.currentTarget.value,
                  })
                }
                error={errors.emailApiKey}
              />
              <Group>
                <Button
                  variant="light"
                  leftSection={<Mail size={16} />}
                  onClick={() => handleTestConnection('email')}
                  loading={testingConnections.email}
                >
                  Send Test Email
                </Button>
              </Group>
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">SMS Service</Text>
            <Stack gap="md">
              <Select
                label="SMS Provider"
                data={[
                  { value: 'Twilio', label: 'Twilio' },
                  { value: 'AWS SNS', label: 'AWS SNS' },
                  { value: 'MessageBird', label: 'MessageBird' },
                ]}
                value={integrationSettings.smsProvider}
                onChange={(value) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    smsProvider: value || '',
                  })
                }
                error={errors.smsProvider}
              />
              <PasswordInput
                label="API Key"
                value={integrationSettings.smsApiKey}
                onChange={(event) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    smsApiKey: event.currentTarget.value,
                  })
                }
                error={errors.smsApiKey}
              />
              <Group>
                <Button
                  variant="light"
                  leftSection={<Phone size={16} />}
                  onClick={() => handleTestConnection('sms')}
                  loading={testingConnections.sms}
                >
                  Send Test SMS
                </Button>
              </Group>
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="md">Payment Processing</Text>
            <Stack gap="md">
              <Select
                label="Payment Provider"
                data={[
                  { value: 'Stripe', label: 'Stripe' },
                  { value: 'PayPal', label: 'PayPal' },
                  { value: 'Square', label: 'Square' },
                ]}
                value={integrationSettings.paymentProvider}
                onChange={(value) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    paymentProvider: value || '',
                  })
                }
                error={errors.paymentProvider}
              />
              <PasswordInput
                label="API Key"
                value={integrationSettings.paymentApiKey}
                onChange={(event) =>
                  setIntegrationSettings({
                    ...integrationSettings,
                    paymentApiKey: event.currentTarget.value,
                  })
                }
                error={errors.paymentApiKey}
              />
              <Group>
                <Button
                  variant="light"
                  leftSection={<Key size={16} />}
                  onClick={() => handleTestConnection('payment')}
                  loading={testingConnections.payment}
                >
                  Test Connection
                </Button>
              </Group>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * Main Settings Page Component
 */
export const SettingsPage: React.FC = () => {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed">Manage your account, system, and integration settings</Text>
        </div>

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