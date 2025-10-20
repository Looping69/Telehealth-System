/**
 * Insurance Page Component
 * Manages insurance providers, plans, and coverage verification
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
  ActionIcon,
  Modal,
  Tabs,
  Avatar,
  Textarea,
  NumberInput,
  Center,
  Loader,
  Table,
  Checkbox,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Shield,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Insurance } from '../../types';

/**
 * Mock data for insurance providers and plans
 */
const mockInsuranceProviders = [
  {
    id: 'INS-001',
    name: 'Blue Cross Blue Shield',
    type: 'health',
    status: 'active',
    phone: '1-800-555-0123',
    email: 'provider@bcbs.com',
    address: '123 Insurance Ave, Chicago, IL 60601',
    website: 'https://www.bcbs.com',
    plans: [
      {
        id: 'PLAN-001',
        name: 'Premium Health Plan',
        type: 'PPO',
        deductible: 1000,
        copay: 25,
        coinsurance: 20,
        outOfPocketMax: 5000,
      },
      {
        id: 'PLAN-002',
        name: 'Basic Health Plan',
        type: 'HMO',
        deductible: 2000,
        copay: 35,
        coinsurance: 30,
        outOfPocketMax: 7500,
      },
    ],
  },
  {
    id: 'INS-002',
    name: 'Aetna',
    type: 'health',
    status: 'active',
    phone: '1-800-555-0456',
    email: 'provider@aetna.com',
    address: '456 Healthcare Blvd, Hartford, CT 06103',
    website: 'https://www.aetna.com',
    plans: [
      {
        id: 'PLAN-003',
        name: 'Aetna Better Health',
        type: 'PPO',
        deductible: 1500,
        copay: 30,
        coinsurance: 25,
        outOfPocketMax: 6000,
      },
    ],
  },
  {
    id: 'INS-003',
    name: 'UnitedHealthcare',
    type: 'health',
    status: 'active',
    phone: '1-800-555-0789',
    email: 'provider@uhc.com',
    address: '789 Medical Center Dr, Minneapolis, MN 55416',
    website: 'https://www.uhc.com',
    plans: [
      {
        id: 'PLAN-004',
        name: 'UnitedHealth Choice',
        type: 'EPO',
        deductible: 800,
        copay: 20,
        coinsurance: 15,
        outOfPocketMax: 4500,
      },
    ],
  },
];

interface ExtendedInsurance extends Insurance {
  id: string;
  patientId: string;
  patientName: string;
  planName: string;
  subscriberId: string;
  subscriberName: string;
  relationship: string;
  effectiveDate: Date;
  status: 'active' | 'inactive';
  copay: number;
  deductible: number;
  coinsurance: number;
  outOfPocketMax: number;
  lastVerified: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  notes?: string;
}

const mockPatientInsurance: ExtendedInsurance[] = [
  {
    id: 'PI-001',
    patientId: 'PAT-001',
    patientName: 'Sarah Johnson',
    provider: 'Blue Cross Blue Shield',
    planName: 'Premium Health Plan',
    policyNumber: 'BCBS123456789',
    groupNumber: 'GRP001',
    subscriberId: 'SUB123456',
    subscriberName: 'Sarah Johnson',
    relationship: 'self',
    effectiveDate: new Date('2024-01-01'),
    expirationDate: new Date('2024-12-31'),
    status: 'active',
    copay: 25,
    deductible: 1000,
    coinsurance: 20,
    outOfPocketMax: 5000,
    lastVerified: new Date('2024-01-10'),
    verificationStatus: 'verified',
  },
  {
    id: 'PI-002',
    patientId: 'PAT-002',
    patientName: 'Michael Chen',
    provider: 'Aetna',
    planName: 'Aetna Better Health',
    policyNumber: 'AET987654321',
    groupNumber: 'GRP002',
    subscriberId: 'SUB987654',
    subscriberName: 'Michael Chen',
    relationship: 'self',
    effectiveDate: new Date('2024-01-01'),
    expirationDate: new Date('2024-12-31'),
    status: 'active',
    copay: 30,
    deductible: 1500,
    coinsurance: 25,
    outOfPocketMax: 6000,
    lastVerified: new Date('2024-01-08'),
    verificationStatus: 'pending',
  },
];

/**
 * Insurance Provider Card Component
 */
interface ProviderCardProps {
  provider: any;
  onView: (provider: any) => void;
  onEdit: (provider: any) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onView, onEdit }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="lg" radius="md" color="blue">
              <Building size={24} />
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="lg">
                {provider.name}
              </Text>
              <Text size="sm" c="dimmed">
                {provider.id} • {provider.type}
              </Text>
            </Stack>
          </Group>
          <Badge color={provider.status === 'active' ? 'green' : 'red'}>
            {provider.status}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{provider.phone}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{provider.email}</Text>
          </Group>
          <Group gap="xs">
            <MapPin size={14} />
            <Text size="sm" lineClamp={2}>
              {provider.address}
            </Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {provider.plans.length} plan{provider.plans.length !== 1 ? 's' : ''}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(provider)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(provider)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Provider Details Modal Component
 * Displays comprehensive provider information including contact details and available plans
 */
interface ProviderDetailsModalProps {
  provider: any;
  opened: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ 
  provider, 
  opened, 
  onClose, 
  onEdit 
}) => {
  if (!provider) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Provider Details - ${provider.name}`}
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Provider Information</Text>
              <Text size="sm">
                <strong>Name:</strong> {provider.name}
              </Text>
              <Text size="sm">
                <strong>Provider ID:</strong> {provider.id}
              </Text>
              <Text size="sm">
                <strong>Type:</strong> {provider.type}
              </Text>
              <Badge color={provider.status === 'active' ? 'green' : 'red'}>
                {provider.status}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Contact Information</Text>
              <Group gap="xs">
                <Phone size={16} />
                <Text size="sm">{provider.phone}</Text>
              </Group>
              <Group gap="xs">
                <Mail size={16} />
                <Text size="sm">{provider.email}</Text>
              </Group>
              <Group gap="xs">
                <MapPin size={16} />
                <Text size="sm">{provider.address}</Text>
              </Group>
              {provider.website && (
                <Group gap="xs">
                  <Building size={16} />
                  <Text size="sm" component="a" href={provider.website} target="_blank">
                    {provider.website}
                  </Text>
                </Group>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        {provider.plans && provider.plans.length > 0 && (
          <div>
            <Text fw={500} mb="sm">Available Plans</Text>
            <Stack gap="sm">
              {provider.plans.map((plan: any) => (
                <Card key={plan.id} withBorder padding="sm">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{plan.name}</Text>
                    <Badge variant="light">{plan.type}</Badge>
                  </Group>
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm">Deductible: ${plan.deductible}</Text>
                      <Text size="sm">Copay: ${plan.copay}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm">Coinsurance: {plan.coinsurance}%</Text>
                      <Text size="sm">Out-of-Pocket Max: ${plan.outOfPocketMax}</Text>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button leftSection={<Edit size={16} />} onClick={onEdit}>
            Edit Provider
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Edit Provider Modal Component
 * Allows editing of existing provider information with pre-populated data
 */
interface EditProviderModalProps {
  provider: any;
  opened: boolean;
  onClose: () => void;
  onSubmit: (providerData: any) => void;
}

const EditProviderModal: React.FC<EditProviderModalProps> = ({ 
  provider, 
  opened, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    status: '',
    phone: '',
    email: '',
    address: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when provider changes
  React.useEffect(() => {
    if (provider) {
      setFormData({
        id: provider.id || '',
        name: provider.name || '',
        type: provider.type || '',
        status: provider.status || '',
        phone: provider.phone || '',
        email: provider.email || '',
        address: provider.address || '',
        website: provider.website || '',
      });
    }
  }, [provider]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Provider type is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      onClose();
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        type: '',
        status: '',
        phone: '',
        email: '',
        address: '',
        website: '',
      });
      setErrors({});
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to update provider. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Edit Provider"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Provider Name"
                placeholder="Enter provider name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Provider Type"
                placeholder="Select type"
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value || '' })}
                data={[
                  { value: 'health', label: 'Health Insurance' },
                  { value: 'dental', label: 'Dental Insurance' },
                  { value: 'vision', label: 'Vision Insurance' },
                  { value: 'life', label: 'Life Insurance' },
                ]}
                error={errors.type}
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Status"
                placeholder="Select status"
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value || '' })}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
                error={errors.status}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                required
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />

          <Textarea
            label="Address"
            placeholder="Enter provider address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            required
            minRows={2}
          />

          <TextInput
            label="Website (Optional)"
            placeholder="Enter website URL"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Update Provider
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

/**
 * Add Provider Modal Component
 * Allows adding new insurance providers with comprehensive form validation
 */
interface AddProviderModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (providerData: any) => void;
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ 
  opened, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'active',
    phone: '',
    email: '',
    address: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Provider type is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        status: 'active',
        phone: '',
        email: '',
        address: '',
        website: '',
      });
      setErrors({});
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to add provider. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: '',
      status: 'active',
      phone: '',
      email: '',
      address: '',
      website: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add New Provider"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Provider Name"
                placeholder="Enter provider name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Provider Type"
                placeholder="Select type"
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value || '' })}
                data={[
                  { value: 'health', label: 'Health Insurance' },
                  { value: 'dental', label: 'Dental Insurance' },
                  { value: 'vision', label: 'Vision Insurance' },
                  { value: 'life', label: 'Life Insurance' },
                ]}
                error={errors.type}
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Status"
                placeholder="Select status"
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value || 'active' })}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
                error={errors.status}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                required
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />

          <Textarea
            label="Address"
            placeholder="Enter provider address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            required
            minRows={2}
          />

          <TextInput
            label="Website (Optional)"
            placeholder="Enter website URL"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Add Provider
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

/**
 * Patient Insurance Card Component
 */
interface PatientInsuranceCardProps {
  insurance: ExtendedInsurance;
  onView: (insurance: ExtendedInsurance) => void;
  onVerify: (insurance: ExtendedInsurance) => void;
}

const PatientInsuranceCard: React.FC<PatientInsuranceCardProps> = ({
  insurance,
  onView,
  onVerify,
}) => {
  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'failed':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={500}>{insurance.patientName}</Text>
            <Text size="sm" c="dimmed">
              {insurance.provider} • {insurance.planName}
            </Text>
          </Stack>
          <Group>
            <Badge color={insurance.status === 'active' ? 'green' : 'red'}>
              {insurance.status}
            </Badge>
            <Badge
              color={getVerificationColor(insurance.verificationStatus)}
              leftSection={getVerificationIcon(insurance.verificationStatus)}
            >
              {insurance.verificationStatus}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Policy Number:</Text>
            <Text size="sm" fw={500}>
              {insurance.policyNumber}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Copay:</Text>
            <Text size="sm" fw={500}>
              ${insurance.copay}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Deductible:</Text>
            <Text size="sm" fw={500}>
              ${insurance.deductible}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Last Verified:</Text>
            <Text size="sm" fw={500}>
              {insurance.lastVerified.toLocaleDateString()}
            </Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Expires: {insurance.expirationDate?.toLocaleDateString()}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(insurance)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="green"
              onClick={() => onVerify(insurance)}
            >
              <Shield size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Insurance Details Modal
 */
interface InsuranceDetailsModalProps {
  insurance: ExtendedInsurance | null;
  opened: boolean;
  onClose: () => void;
}

const InsuranceDetailsModal: React.FC<InsuranceDetailsModalProps> = ({
  insurance,
  opened,
  onClose,
}) => {
  if (!insurance) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Insurance Details - ${insurance.patientName}`}
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Patient Information</Text>
              <Text size="sm">
                <strong>Name:</strong> {insurance.patientName}
              </Text>
              <Text size="sm">
                <strong>Patient ID:</strong> {insurance.patientId}
              </Text>
              <Text size="sm">
                <strong>Relationship:</strong> {insurance.relationship}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Insurance Provider</Text>
              <Text size="sm">
                <strong>Provider:</strong> {insurance.provider}
              </Text>
              <Text size="sm">
                <strong>Plan:</strong> {insurance.planName}
              </Text>
              <Text size="sm">
                <strong>Status:</strong>{' '}
                <Badge size="sm" color={insurance.status === 'active' ? 'green' : 'red'}>
                  {insurance.status}
                </Badge>
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Policy Details</Text>
              <Text size="sm">
                <strong>Policy Number:</strong> {insurance.policyNumber}
              </Text>
              <Text size="sm">
                <strong>Group Number:</strong> {insurance.groupNumber}
              </Text>
              <Text size="sm">
                <strong>Subscriber ID:</strong> {insurance.subscriberId}
              </Text>
              <Text size="sm">
                <strong>Subscriber Name:</strong> {insurance.subscriberName}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Coverage Details</Text>
              <Text size="sm">
                <strong>Copay:</strong> ${insurance.copay}
              </Text>
              <Text size="sm">
                <strong>Deductible:</strong> ${insurance.deductible}
              </Text>
              <Text size="sm">
                <strong>Coinsurance:</strong> {insurance.coinsurance}%
              </Text>
              <Text size="sm">
                <strong>Out-of-Pocket Max:</strong> ${insurance.outOfPocketMax}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Coverage Period</Text>
              <Text size="sm">
                <strong>Effective Date:</strong> {insurance.effectiveDate.toLocaleDateString()}
              </Text>
              <Text size="sm">
                <strong>Expiration Date:</strong> {insurance.expirationDate?.toLocaleDateString()}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Verification Status</Text>
              <Text size="sm">
                <strong>Status:</strong>{' '}
                <Badge size="sm" color={insurance.verificationStatus === 'verified' ? 'green' : 'yellow'}>
                  {insurance.verificationStatus}
                </Badge>
              </Text>
              <Text size="sm">
                <strong>Last Verified:</strong> {insurance.lastVerified.toLocaleDateString()}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button leftSection={<Shield size={16} />}>
            Verify Coverage
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Insurance Page Component
 */
export const InsurancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('patient_insurance');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<ExtendedInsurance | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // State management for data
  const [patientInsurance, setPatientInsurance] = useState<ExtendedInsurance[]>(mockPatientInsurance);
  const [providers, setProviders] = useState(mockInsuranceProviders);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [addInsuranceOpened, { open: openAddInsurance, close: closeAddInsurance }] = useDisclosure(false);
  const [addProviderOpened, { open: openAddProvider, close: closeAddProvider }] = useDisclosure(false);
  const [providerDetailsOpened, { open: openProviderDetails, close: closeProviderDetails }] = useDisclosure(false);
  const [editProviderOpened, { open: openEditProvider, close: closeEditProvider }] = useDisclosure(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const handleViewInsurance = (insurance: ExtendedInsurance) => {
    setSelectedInsurance(insurance);
    openDetails();
  };

  const handleVerifyInsurance = (insurance: ExtendedInsurance) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPatientInsurance(prev => 
        prev.map(ins => 
          ins.id === insurance.id 
            ? { 
                ...ins, 
                verificationStatus: 'verified', 
                lastVerified: new Date() 
              }
            : ins
        )
      );
      
      showNotification({
        title: 'Insurance Verified',
        message: `Insurance for ${insurance.patientName} has been successfully verified.`,
        color: 'green',
      });
      
      setIsLoading(false);
    }, 1500);
  };

  const handleViewProvider = (provider: any) => {
    setSelectedProvider(provider);
    openProviderDetails();
  };

  const handleEditProvider = (provider: any) => {
    setSelectedProvider(provider);
    openEditProvider();
  };

  const handleAddInsurance = () => {
    openAddInsurance();
  };

  const handleAddProvider = () => {
    openAddProvider();
  };

  const handleAddInsuranceSubmit = (insuranceData: any) => {
    const newInsurance: ExtendedInsurance = {
      id: `PI-${Date.now()}`,
      patientId: 'P001',
      patientName: 'John Doe',
      planName: insuranceData.planName || 'Unknown Plan',
      provider: insuranceData.provider || 'Unknown Provider',
      policyNumber: insuranceData.policyNumber || '',
      groupNumber: insuranceData.groupNumber || '',
      effectiveDate: insuranceData.effectiveDate || new Date(),
      expirationDate: insuranceData.expirationDate || new Date(),
      copay: insuranceData.copay || 0,
      deductible: insuranceData.deductible || 0,
      coinsurance: insuranceData.coinsurance || 20,
      outOfPocketMax: insuranceData.outOfPocketMax || 0,
      status: insuranceData.status || 'active',
      subscriberId: insuranceData.subscriberId || '',
      subscriberName: insuranceData.subscriberName || '',
      relationship: insuranceData.relationship || 'self',
      lastVerified: new Date(),
      verificationStatus: 'pending',
      notes: insuranceData.notes || '',
    };
    setPatientInsurance(prev => [...prev, newInsurance]);
  };

  const handleEditProviderSubmit = (providerData: any) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === providerData.id ? { ...provider, ...providerData } : provider
      )
    );
    showNotification({
      title: 'Provider Updated',
      message: `${providerData.name} has been successfully updated.`,
      color: 'green',
    });
  };

  const handleAddProviderSubmit = (providerData: any) => {
    const newProvider = {
      ...providerData,
      id: `INS-${Date.now()}`,
    };
    setProviders(prev => [...prev, newProvider]);
    showNotification({
      title: 'Provider Added',
      message: `${providerData.name} has been successfully added.`,
      color: 'green',
    });
  };

  const filteredPatientInsurance = patientInsurance
    .filter(insurance =>
      insurance.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insurance.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insurance.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(insurance => !statusFilter || insurance.status === statusFilter);

  const filteredProviders = providers
    .filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(provider => !statusFilter || provider.status === statusFilter);

  // Calculate summary statistics
  const activeInsurance = patientInsurance.filter(ins => ins.status === 'active').length;
  const pendingVerification = patientInsurance.filter(ins => ins.verificationStatus === 'pending').length;
  const verifiedInsurance = patientInsurance.filter(ins => ins.verificationStatus === 'verified').length;
  const activeProviders = providers.filter(prov => prov.status === 'active').length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Insurance Management</Title>
            <Text c="dimmed">Manage insurance providers, plans, and coverage verification</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={activeTab === 'patient_insurance' ? handleAddInsurance : handleAddProvider}>
            Add {activeTab === 'patient_insurance' ? 'Insurance' : 'Provider'}
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Insurance
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Shield size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activeInsurance}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Pending Verification
                </Text>
                <ActionIcon variant="light" color="yellow" size="lg">
                  <Clock size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="yellow">
                {pendingVerification}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Verified Coverage
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <CheckCircle size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {verifiedInsurance}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Providers
                </Text>
                <ActionIcon variant="light" color="indigo" size="lg">
                  <Building size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="indigo">
                {activeProviders}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search insurance..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'expired', label: 'Expired' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button.Group>
                <Button
                  variant={viewMode === 'cards' ? 'filled' : 'light'}
                  onClick={() => setViewMode('cards')}
                  size="sm"
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'filled' : 'light'}
                  onClick={() => setViewMode('table')}
                  size="sm"
                >
                  Table
                </Button>
              </Button.Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="patient_insurance" leftSection={<Shield size={16} />}>
              Patient Insurance
            </Tabs.Tab>
            <Tabs.Tab value="providers" leftSection={<Building size={16} />}>
              Insurance Providers
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="patient_insurance" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {filteredPatientInsurance.map((insurance) => (
                  <Grid.Col key={insurance.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <PatientInsuranceCard
                      insurance={insurance}
                      onView={handleViewInsurance}
                      onVerify={handleVerifyInsurance}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Provider & Plan</Table.Th>
                      <Table.Th>Policy Number</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Verification</Table.Th>
                      <Table.Th>Copay</Table.Th>
                      <Table.Th>Deductible</Table.Th>
                      <Table.Th>Expires</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredPatientInsurance.map((insurance) => (
                      <PatientInsuranceTableRow
                        key={insurance.id}
                        insurance={insurance}
                        onView={handleViewInsurance}
                        onVerify={handleVerifyInsurance}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="providers" pt="md">
            {viewMode === 'cards' ? (
              <Grid>
                {filteredProviders.map((provider) => (
                  <Grid.Col key={provider.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <ProviderCard
                      provider={provider}
                      onView={handleViewProvider}
                      onEdit={handleEditProvider}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Provider</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Phone</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Address</Table.Th>
                      <Table.Th>Plans</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredProviders.map((provider) => (
                      <ProviderTableRow
                        key={provider.id}
                        provider={provider}
                        onView={handleViewProvider}
                        onEdit={handleEditProvider}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Empty State */}
        {!isLoading && 
         ((activeTab === 'patient_insurance' && filteredPatientInsurance.length === 0) ||
          (activeTab === 'providers' && filteredProviders.length === 0)) && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Shield size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No {activeTab === 'patient_insurance' ? 'patient insurance' : 'providers'} found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search criteria'
                  : `Get started by adding ${activeTab === 'patient_insurance' ? 'patient insurance' : 'insurance providers'}`}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={activeTab === 'patient_insurance' ? handleAddInsurance : handleAddProvider}>
                 Add {activeTab === 'patient_insurance' ? 'Insurance' : 'Provider'}
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

       {/* Insurance Details Modal */}
       <InsuranceDetailsModal
         insurance={selectedInsurance}
         opened={detailsOpened}
         onClose={closeDetails}
       />

       {/* Add Insurance Modal */}
        <AddInsuranceModal
          opened={addInsuranceOpened}
          onClose={closeAddInsurance}
          onSubmit={handleAddInsuranceSubmit}
        />

        {/* Provider Details Modal */}
        <ProviderDetailsModal
          provider={selectedProvider}
          opened={providerDetailsOpened}
          onClose={closeProviderDetails}
          onEdit={() => {
            closeProviderDetails();
            openEditProvider();
          }}
        />

        {/* Edit Provider Modal */}
        <EditProviderModal
          provider={selectedProvider}
          opened={editProviderOpened}
          onClose={closeEditProvider}
          onSubmit={handleEditProviderSubmit}
        />

        {/* Add Provider Modal */}
        <AddProviderModal
          opened={addProviderOpened}
          onClose={closeAddProvider}
          onSubmit={handleAddProviderSubmit}
        />
      </Container>
    );
  };

/**
 * Patient Insurance Table Row Component
 */
interface PatientInsuranceTableRowProps {
  insurance: ExtendedInsurance;
  onView: (insurance: ExtendedInsurance) => void;
  onVerify: (insurance: ExtendedInsurance) => void;
}

const PatientInsuranceTableRow: React.FC<PatientInsuranceTableRowProps> = ({
  insurance,
  onView,
  onVerify,
}) => {
  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={2}>
          <Text fw={500} size="sm">
            {insurance.patientName}
          </Text>
          <Text size="xs" c="dimmed">
            {insurance.patientId}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm">{insurance.provider}</Text>
          <Text size="xs" c="dimmed">{insurance.planName}</Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{insurance.policyNumber}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={insurance.status === 'active' ? 'green' : 'red'} size="sm">
          {insurance.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getVerificationColor(insurance.verificationStatus)} size="sm">
          {insurance.verificationStatus}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">${insurance.copay}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">${insurance.deductible}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{insurance.expirationDate?.toLocaleDateString()}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(insurance)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="green"
            size="sm"
            onClick={() => onVerify(insurance)}
          >
            <Shield size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Provider Table Row Component
 */
interface ProviderTableRowProps {
  provider: any;
  onView: (provider: any) => void;
  onEdit: (provider: any) => void;
}

const ProviderTableRow: React.FC<ProviderTableRowProps> = ({ provider, onView, onEdit }) => {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" radius="md" color="blue">
            <Building size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text fw={500} size="sm">
              {provider.name}
            </Text>
            <Text size="xs" c="dimmed">
              {provider.id}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{provider.type}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={provider.status === 'active' ? 'green' : 'red'} size="sm">
          {provider.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{provider.phone}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{provider.email}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2}>
          {provider.address}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{provider.plans.length} plans</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(provider)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => onEdit(provider)}
          >
            <Edit size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Add Insurance Modal Component
 */
interface AddInsuranceModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (insuranceData: any) => void;
}

const AddInsuranceModal: React.FC<AddInsuranceModalProps> = ({ opened, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    provider: '',
    planName: '',
    policyNumber: '',
    groupNumber: '',
    subscriberId: '',
    subscriberName: '',
    relationship: 'self',
    effectiveDate: '',
    expirationDate: '',
    copay: 0,
    deductible: 0,
    coinsurance: 0,
    outOfPocketMax: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.patientId.trim()) newErrors.patientId = 'Patient ID is required';
    if (!formData.provider.trim()) newErrors.provider = 'Insurance provider is required';
    if (!formData.planName.trim()) newErrors.planName = 'Plan name is required';
    if (!formData.policyNumber.trim()) newErrors.policyNumber = 'Policy number is required';
    if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!formData.expirationDate) newErrors.expirationDate = 'Expiration date is required';
    if (formData.copay < 0) newErrors.copay = 'Copay must be positive';
    if (formData.deductible < 0) newErrors.deductible = 'Deductible must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const newInsurance = {
        ...formData,
      };

      onSubmit(newInsurance);
      
      showNotification({
        title: 'Insurance Added',
        message: `Insurance for ${formData.patientName} has been successfully added.`,
        color: 'green',
      });

      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        provider: '',
        planName: '',
        policyNumber: '',
        groupNumber: '',
        subscriberId: '',
        subscriberName: '',
        relationship: 'self',
        effectiveDate: '',
        expirationDate: '',
        copay: 0,
        deductible: 0,
        coinsurance: 0,
        outOfPocketMax: 0,
      });
      
      onClose();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to add insurance. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Patient Insurance"
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Patient Name"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              error={errors.patientName}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Patient ID"
              placeholder="Enter patient ID"
              value={formData.patientId}
              onChange={(e) => handleInputChange('patientId', e.target.value)}
              error={errors.patientId}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Insurance Provider"
              placeholder="Select provider"
              data={[
                'Blue Cross Blue Shield',
                'Aetna',
                'UnitedHealthcare',
                'Cigna',
                'Humana',
                'Kaiser Permanente',
                'Other'
              ]}
              value={formData.provider}
              onChange={(value) => handleInputChange('provider', value)}
              error={errors.provider}
              required
              searchable
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Plan Name"
              placeholder="Enter plan name"
              value={formData.planName}
              onChange={(e) => handleInputChange('planName', e.target.value)}
              error={errors.planName}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Policy Number"
              placeholder="Enter policy number"
              value={formData.policyNumber}
              onChange={(e) => handleInputChange('policyNumber', e.target.value)}
              error={errors.policyNumber}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Group Number"
              placeholder="Enter group number"
              value={formData.groupNumber}
              onChange={(e) => handleInputChange('groupNumber', e.target.value)}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Subscriber ID"
              placeholder="Enter subscriber ID"
              value={formData.subscriberId}
              onChange={(e) => handleInputChange('subscriberId', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Subscriber Name"
              placeholder="Enter subscriber name"
              value={formData.subscriberName}
              onChange={(e) => handleInputChange('subscriberName', e.target.value)}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Relationship"
              data={[
                { value: 'self', label: 'Self' },
                { value: 'spouse', label: 'Spouse' },
                { value: 'child', label: 'Child' },
                { value: 'parent', label: 'Parent' },
                { value: 'other', label: 'Other' },
              ]}
              value={formData.relationship}
              onChange={(value) => handleInputChange('relationship', value)}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Effective Date"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
              error={errors.effectiveDate}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Expiration Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              error={errors.expirationDate}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Copay ($)"
              placeholder="Enter copay amount"
              value={formData.copay}
              onChange={(value) => handleInputChange('copay', value || 0)}
              error={errors.copay}
              min={0}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Deductible ($)"
              placeholder="Enter deductible amount"
              value={formData.deductible}
              onChange={(value) => handleInputChange('deductible', value || 0)}
              error={errors.deductible}
              min={0}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Coinsurance (%)"
              placeholder="Enter coinsurance percentage"
              value={formData.coinsurance}
              onChange={(value) => handleInputChange('coinsurance', value || 0)}
              min={0}
              max={100}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Out-of-Pocket Max ($)"
              placeholder="Enter out-of-pocket maximum"
              value={formData.outOfPocketMax}
              onChange={(value) => handleInputChange('outOfPocketMax', value || 0)}
              min={0}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Add Insurance
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};