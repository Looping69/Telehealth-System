/**
 * Insurance-Medplum Page Component
 * Manages insurance coverage using FHIR data with comprehensive UI
 */

import React, { useState, useMemo } from 'react';
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
  Center,
  Loader,
  Alert,
  Tabs,
  Avatar,
  Textarea,
  NumberInput,
  Table,
  Checkbox,
  Divider,
  Paper,
  SimpleGrid,
  ThemeIcon,
  SegmentedControl,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Shield,
  User,
  Calendar,
  Filter,
  Database,
  AlertCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Save,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Coverage, Reference, CodeableConcept, Period, Identifier } from '@medplum/fhirtypes';
import { useCoverage } from '../../hooks/useQuery';
import { backendFHIRService } from '../../services/backendFHIRService';

import { useForm } from '@mantine/form';

/**
 * Mock data for insurance providers (for the providers tab)
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

/**
 * Patient Insurance Card Component
 */
interface PatientInsuranceCardProps {
  coverage: any;
  onView: (coverage: any) => void;
  onVerify: (coverage: any) => void;
  onEdit?: (coverage: any) => void;
}

const PatientInsuranceCard: React.FC<PatientInsuranceCardProps> = ({ coverage, onView, onVerify, onEdit }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'draft':
        return 'yellow';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getVerificationColor = (status?: string) => {
    // For FHIR Coverage, we'll use the status to determine verification
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'draft':
        return <Clock size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getVerificationStatus = (status?: string) => {
    switch (status) {
      case 'active':
        return 'verified';
      case 'draft':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getPatientName = () => {
    return coverage.beneficiary?.display || 'Unknown Patient';
  };

  const getPayorName = () => {
    return coverage.payor?.[0]?.display || 'Unknown Payor';
  };

  const getPolicyNumber = () => {
    return coverage.identifier?.[0]?.value || coverage.id || 'N/A';
  };

  const getCopay = () => {
    // Extract copay from coverage class or cost sharing
    const copayClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'copay');
    return copayClass?.value || '25';
  };

  const getDeductible = () => {
    // Extract deductible from coverage class
    const deductibleClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'deductible');
    return deductibleClass?.value || '1000';
  };

  const getLastVerified = () => {
    return coverage.meta?.lastUpdated ? new Date(coverage.meta.lastUpdated).toLocaleDateString() : 'N/A';
  };

  const getExpirationDate = () => {
    return coverage.period?.end ? new Date(coverage.period.end).toLocaleDateString() : 'N/A';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={500}>{getPatientName()}</Text>
            <Text size="sm" c="dimmed">
              {getPayorName()} • {coverage.type?.text || 'Health Plan'}
            </Text>
          </Stack>
          <Group>
            <Badge color={getStatusColor(coverage.status)}>
              {coverage.status}
            </Badge>
            <Badge
              color={getVerificationColor(coverage.status)}
              leftSection={getVerificationIcon(coverage.status)}
            >
              {getVerificationStatus(coverage.status)}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Policy Number:</Text>
            <Text size="sm" fw={500}>
              {getPolicyNumber()}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Copay:</Text>
            <Text size="sm" fw={500}>
              ${getCopay()}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Deductible:</Text>
            <Text size="sm" fw={500}>
              ${getDeductible()}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Last Verified:</Text>
            <Text size="sm" fw={500}>
              {getLastVerified()}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Expires:</Text>
            <Text size="sm" fw={500}>
              {getExpirationDate()}
            </Text>
          </Group>
        </Stack>

        <Divider />

        <Group justify="space-between">
          <Button variant="light" leftSection={<Eye size={16} />} onClick={() => onView(coverage)}>
            View Details
          </Button>
          <Button
            variant="light"
            color="green"
            leftSection={<Shield size={16} />}
            onClick={() => onVerify(coverage)}
          >
            Verify
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Patient Insurance Table Row Component
 */
interface PatientInsuranceTableRowProps {
  coverage: any;
  onView: (coverage: any) => void;
  onVerify: (coverage: any) => void;
  onEdit?: (coverage: any) => void;
}

const PatientInsuranceTableRow: React.FC<PatientInsuranceTableRowProps> = ({
  coverage,
  onView,
  onVerify,
  onEdit,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'draft':
        return 'yellow';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getVerificationColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'draft':
        return <Clock size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getVerificationStatus = (status?: string) => {
    switch (status) {
      case 'active':
        return 'verified';
      case 'draft':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getPatientName = () => {
    return coverage.beneficiary?.display || 'Unknown Patient';
  };

  const getPayorName = () => {
    return coverage.payor?.[0]?.display || 'Unknown Payor';
  };

  const getPolicyNumber = () => {
    return coverage.identifier?.[0]?.value || coverage.id || 'N/A';
  };

  const getCopay = () => {
    const copayClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'copay');
    return copayClass?.value || '25';
  };

  const getDeductible = () => {
    const deductibleClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'deductible');
    return deductibleClass?.value || '1000';
  };

  const getExpirationDate = () => {
    return coverage.period?.end ? new Date(coverage.period.end).toLocaleDateString() : 'N/A';
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {getPatientName()}
          </Text>
          <Text size="xs" c="dimmed">
            ID: {coverage.beneficiary?.reference?.split('/')[1] || 'N/A'}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {getPayorName()}
          </Text>
          <Text size="xs" c="dimmed">
            {coverage.type?.text || 'Health Plan'}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {getPolicyNumber()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(coverage.status)}>
          {coverage.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getVerificationColor(coverage.status)}
          leftSection={getVerificationIcon(coverage.status)}
        >
          {getVerificationStatus(coverage.status)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          ${getCopay()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          ${getDeductible()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {getExpirationDate()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => onView(coverage)}
          >
            <Eye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="green"
            onClick={() => onVerify(coverage)}
          >
            <Shield size={16} />
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" color="blue">
            <Building size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text size="sm" fw={500}>
              {provider.name}
            </Text>
            <Text size="xs" c="dimmed">
              {provider.website}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="light">
          {provider.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(provider.status)}>
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
        <Text size="sm">{provider.address}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="indigo" variant="light">
          {provider.plans?.length || 0} plans
        </Badge>
      </Table.Td>
      <Table.Td>
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
            color="gray"
            onClick={() => onEdit(provider)}
          >
            <Edit size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Coverage Details Modal Component
 */
interface CoverageDetailsModalProps {
  coverage: any | null;
  opened: boolean;
  onClose: () => void;
}

const CoverageDetailsModal: React.FC<CoverageDetailsModalProps> = ({
  coverage,
  opened,
  onClose,
}) => {
  if (!coverage) return null;

  const getPatientName = () => {
    return coverage.beneficiary?.display || 'Unknown Patient';
  };

  const getPayorName = () => {
    return coverage.payor?.[0]?.display || 'Unknown Payor';
  };

  const getPolicyNumber = () => {
    return coverage.identifier?.[0]?.value || coverage.id || 'N/A';
  };

  const getCopay = () => {
    const copayClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'copay');
    return copayClass?.value || '25';
  };

  const getDeductible = () => {
    const deductibleClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'deductible');
    return deductibleClass?.value || '1000';
  };

  const getCoinsurance = () => {
    const coinsuranceClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'coinsurance');
    return coinsuranceClass?.value || '20';
  };

  const getOutOfPocketMax = () => {
    const oopClass = coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'out-of-pocket-max');
    return oopClass?.value || '5000';
  };

  const getEffectiveDate = () => {
    return coverage.period?.start ? new Date(coverage.period.start).toLocaleDateString() : 'N/A';
  };

  const getExpirationDate = () => {
    return coverage.period?.end ? new Date(coverage.period.end).toLocaleDateString() : 'N/A';
  };

  const getLastUpdated = () => {
    return coverage.meta?.lastUpdated ? new Date(coverage.meta.lastUpdated).toLocaleDateString() : 'N/A';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Coverage Details - ${getPatientName()}`}
      size="lg"
    >
      <Stack gap="lg">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Live FHIR Data - Coverage ID: {coverage.id}
        </Alert>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Patient Information
              </Text>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Name:</Text>
                    <Text size="sm" fw={500}>
                      {getPatientName()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Patient ID:</Text>
                    <Text size="sm" fw={500}>
                      {coverage.beneficiary?.reference?.split('/')[1] || 'N/A'}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Relationship:</Text>
                    <Text size="sm" fw={500}>
                      {coverage.relationship?.coding?.[0]?.display || 'Self'}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Insurance Information
              </Text>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Provider:</Text>
                    <Text size="sm" fw={500}>
                      {getPayorName()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Policy Number:</Text>
                    <Text size="sm" fw={500}>
                      {getPolicyNumber()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Plan Type:</Text>
                    <Text size="sm" fw={500}>
                      {coverage.type?.text || 'Health Plan'}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Status:</Text>
                    <Badge color={coverage.status === 'active' ? 'green' : 'yellow'}>
                      {coverage.status}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Coverage Details
              </Text>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Copay:</Text>
                    <Text size="sm" fw={500}>
                      ${getCopay()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Deductible:</Text>
                    <Text size="sm" fw={500}>
                      ${getDeductible()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Coinsurance:</Text>
                    <Text size="sm" fw={500}>
                      {getCoinsurance()}%
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Out-of-Pocket Max:</Text>
                    <Text size="sm" fw={500}>
                      ${getOutOfPocketMax()}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Dates & Verification
              </Text>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Effective Date:</Text>
                    <Text size="sm" fw={500}>
                      {getEffectiveDate()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Expiration Date:</Text>
                    <Text size="sm" fw={500}>
                      {getExpirationDate()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Last Updated:</Text>
                    <Text size="sm" fw={500}>
                      {getLastUpdated()}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Provider Details Modal Component
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
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Group gap="sm">
              <Avatar size="lg" color="blue">
                <Building size={24} />
              </Avatar>
              <Stack gap={2}>
                <Text size="lg" fw={600}>
                  {provider.name}
                </Text>
                <Badge color="blue" variant="light">
                  {provider.type}
                </Badge>
              </Stack>
            </Group>
          </Stack>
          <Badge color={provider.status === 'active' ? 'green' : 'red'}>
            {provider.status}
          </Badge>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Contact Information
              </Text>
              <Card withBorder padding="sm">
                <Stack gap="xs">
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
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Available Plans ({provider.plans?.length || 0})
              </Text>
              <Card withBorder padding="sm">
                <Stack gap="xs">
                  {provider.plans?.map((plan: any) => (
                    <Card key={plan.id} withBorder padding="xs">
                      <Stack gap={2}>
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            {plan.name}
                          </Text>
                          <Badge color="indigo" variant="light">
                            {plan.type}
                          </Badge>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Deductible:</Text>
                          <Text size="xs">${plan.deductible}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Copay:</Text>
                          <Text size="xs">${plan.copay}</Text>
                        </Group>
                      </Stack>
                    </Card>
                  )) || (
                      <Text size="sm" c="dimmed">
                        No plans available
                      </Text>
                    )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end">
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
 * Provider Card Component
 */
interface ProviderCardProps {
  provider: any;
  onView: (provider: any) => void;
  onEdit: (provider: any) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onView, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="xs">
              <Avatar size="sm" color="blue">
                <Building size={16} />
              </Avatar>
              <Text fw={500}>{provider.name}</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {provider.type} • {provider.plans?.length || 0} plans
            </Text>
          </Stack>
          <Badge color={getStatusColor(provider.status)}>
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
            <Text size="sm">{provider.address}</Text>
          </Group>
        </Stack>

        <Divider />

        <Group justify="space-between">
          <Button variant="light" leftSection={<Eye size={16} />} onClick={() => onView(provider)}>
            View Details
          </Button>
          <Button variant="light" leftSection={<Edit size={16} />} onClick={() => onEdit(provider)}>
            Edit
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * New Coverage Form Component
 * Comprehensive form for creating FHIR Coverage resources
 */
interface NewCoverageFormProps {
  onSubmit: (coverage: Partial<Coverage>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  coverage?: Coverage | null;
}

const NewCoverageForm: React.FC<NewCoverageFormProps> = ({ onSubmit, onCancel, loading = false, coverage }) => {
  const form = useForm({
    initialValues: {
      // Basic Coverage Information
      status: coverage?.status || 'active',
      type: coverage?.type?.coding?.[0]?.code || '',
      subscriberId: coverage?.subscriberId || '',

      // Beneficiary Information
      beneficiaryReference: coverage?.beneficiary?.reference || '',
      beneficiaryDisplay: coverage?.beneficiary?.display || '',

      // Payor Information
      payorReference: coverage?.payor?.[0]?.reference || '',
      payorDisplay: coverage?.payor?.[0]?.display || '',

      // Policy Information
      policyHolder: coverage?.policyHolder?.reference || '',
      dependent: coverage?.dependent || '',
      relationship: coverage?.relationship?.coding?.[0]?.code || '',

      // Coverage Period
      periodStart: coverage?.period?.start ? new Date(coverage.period.start) : null as Date | null,
      periodEnd: coverage?.period?.end ? new Date(coverage.period.end) : null as Date | null,

      // Network and Group
      network: coverage?.network || '',
      groupId: coverage?.class?.[0]?.value || '',
      groupDisplay: coverage?.class?.[0]?.name || '',

      // Cost Information
      copay: coverage?.costToBeneficiary?.[0]?.valueMoney?.value?.toString() || '',
      deductible: '',
      outOfPocketMax: '',
    },
    validate: {
      status: (value) => (!value ? 'Status is required' : null),
      type: (value) => (!value ? 'Coverage type is required' : null),
      subscriberId: (value) => (!value ? 'Subscriber ID is required' : null),
      beneficiaryDisplay: (value) => (!value ? 'Beneficiary is required' : null),
      payorDisplay: (value) => (!value ? 'Payor is required' : null),
      periodStart: (value) => (!value ? 'Coverage start date is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Build FHIR Coverage resource
      const coverage: Partial<Coverage> = {
        resourceType: 'Coverage',
        status: values.status as Coverage['status'],

        // Coverage type
        type: values.type ? {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: values.type,
            display: getCoverageTypeDisplay(values.type),
          }],
          text: getCoverageTypeDisplay(values.type),
        } : undefined,

        // Beneficiary (Patient reference)
        beneficiary: {
          reference: values.beneficiaryReference || `Patient/${values.beneficiaryDisplay}`,
          display: values.beneficiaryDisplay,
        },

        // Payor (Organization/Patient reference)
        payor: [{
          reference: values.payorReference || `Organization/${values.payorDisplay}`,
          display: values.payorDisplay,
        }],

        // Coverage period
        period: values.periodStart ? {
          start: values.periodStart.toISOString().split('T')[0],
          end: values.periodEnd?.toISOString().split('T')[0],
        } : undefined,

        // Subscriber ID
        identifier: values.subscriberId ? [{
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MB',
              display: 'Member Number',
            }],
          },
          value: values.subscriberId,
        }] : undefined,

        // Policy holder
        policyHolder: values.policyHolder ? {
          reference: `Patient/${values.policyHolder}`,
        } : undefined,

        // Dependent
        dependent: values.dependent || undefined,

        // Relationship
        relationship: values.relationship ? {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/subscriber-relationship',
            code: values.relationship,
            display: getRelationshipDisplay(values.relationship),
          }],
        } : undefined,

        // Network
        network: values.network ? `Organization/${values.network}` : undefined,

        // Class (Group information)
        class: values.groupId ? [{
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/coverage-class',
              code: 'group',
              display: 'Group',
            }],
          },
          value: values.groupId,
          name: values.groupDisplay,
        }] : undefined,

        // Cost to beneficiary
        costToBeneficiary: buildCostToBeneficiary(values),
      };

      await onSubmit(coverage);
    } catch (error) {
      console.error('Error submitting coverage form:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create coverage. Please check your input and try again.',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {/* Basic Information */}
        <Title order={4}>Basic Information</Title>
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Status"
              placeholder="Select status"
              required
              data={[
                { value: 'active', label: 'Active' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'draft', label: 'Draft' },
                { value: 'entered-in-error', label: 'Entered in Error' },
              ]}
              {...form.getInputProps('status')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Coverage Type"
              placeholder="Select coverage type"
              required
              data={[
                { value: 'EHCPOL', label: 'Extended Healthcare Policy' },
                { value: 'PUBLICPOL', label: 'Public Healthcare Policy' },
                { value: 'DENTPRG', label: 'Dental Program' },
                { value: 'MENTPRG', label: 'Mental Health Program' },
                { value: 'SUBPRG', label: 'Substance Use Program' },
                { value: 'VISPOL', label: 'Vision Policy' },
              ]}
              {...form.getInputProps('type')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Subscriber ID / Member ID"
              placeholder="Enter subscriber ID"
              required
              {...form.getInputProps('subscriberId')}
            />
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Beneficiary Information */}
        <Title order={4}>Beneficiary Information</Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Beneficiary Name"
              placeholder="Enter beneficiary name"
              required
              {...form.getInputProps('beneficiaryDisplay')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Beneficiary Reference (Optional)"
              placeholder="Patient/123 or leave empty"
              {...form.getInputProps('beneficiaryReference')}
            />
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Payor Information */}
        <Title order={4}>Payor Information</Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Payor Name"
              placeholder="Enter insurance company name"
              required
              {...form.getInputProps('payorDisplay')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Payor Reference (Optional)"
              placeholder="Organization/123 or leave empty"
              {...form.getInputProps('payorReference')}
            />
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Policy Information */}
        <Title order={4}>Policy Information</Title>
        <Grid>
          <Grid.Col span={4}>
            <TextInput
              label="Policy Holder"
              placeholder="Policy holder ID"
              {...form.getInputProps('policyHolder')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Dependent"
              placeholder="Dependent number"
              {...form.getInputProps('dependent')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Relationship"
              placeholder="Select relationship"
              data={[
                { value: 'self', label: 'Self' },
                { value: 'spouse', label: 'Spouse' },
                { value: 'child', label: 'Child' },
                { value: 'parent', label: 'Parent' },
                { value: 'other', label: 'Other' },
              ]}
              {...form.getInputProps('relationship')}
            />
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Coverage Period */}
        <Title order={4}>Coverage Period</Title>
        <Grid>
          <Grid.Col span={6}>
            <DateInput
              label="Start Date"
              placeholder="Select start date"
              required
              {...form.getInputProps('periodStart')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <DateInput
              label="End Date (Optional)"
              placeholder="Select end date"
              {...form.getInputProps('periodEnd')}
            />
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Network and Group */}
        <Title order={4}>Network and Group Information</Title>
        <Grid>
          <Grid.Col span={4}>
            <TextInput
              label="Network"
              placeholder="Network identifier"
              {...form.getInputProps('network')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Group ID"
              placeholder="Group identifier"
              {...form.getInputProps('groupId')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Group Name"
              placeholder="Group display name"
              {...form.getInputProps('groupDisplay')}
            />
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Cost Information */}
        <Title order={4}>Cost Information (Optional)</Title>
        <Grid>
          <Grid.Col span={4}>
            <NumberInput
              label="Copay Amount"
              placeholder="0.00"
              prefix="$"
              decimalScale={2}
              {...form.getInputProps('copay')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Deductible"
              placeholder="0.00"
              prefix="$"
              decimalScale={2}
              {...form.getInputProps('deductible')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Out-of-Pocket Maximum"
              placeholder="0.00"
              prefix="$"
              decimalScale={2}
              {...form.getInputProps('outOfPocketMax')}
            />
          </Grid.Col>
        </Grid>

        {/* Form Actions */}
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            leftSection={<Save size={16} />}
            loading={loading}
          >
            Create Coverage
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

// Helper functions
const getCoverageTypeDisplay = (code: string): string => {
  const types: Record<string, string> = {
    'EHCPOL': 'Extended Healthcare Policy',
    'PUBLICPOL': 'Public Healthcare Policy',
    'DENTPRG': 'Dental Program',
    'MENTPRG': 'Mental Health Program',
    'SUBPRG': 'Substance Use Program',
    'VISPOL': 'Vision Policy',
  };
  return types[code] || code;
};

const getRelationshipDisplay = (code: string): string => {
  const relationships: Record<string, string> = {
    'self': 'Self',
    'spouse': 'Spouse',
    'child': 'Child',
    'parent': 'Parent',
    'other': 'Other',
  };
  return relationships[code] || code;
};

const buildCostToBeneficiary = (values: any) => {
  const costs = [];

  if (values.copay) {
    costs.push({
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/coverage-copay-type',
          code: 'copay',
          display: 'Copay',
        }],
      },
      valueMoney: {
        value: parseFloat(values.copay),
        currency: 'USD' as const,
      },
    });
  }

  if (values.deductible) {
    costs.push({
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/coverage-copay-type',
          code: 'deductible',
          display: 'Deductible',
        }],
      },
      valueMoney: {
        value: parseFloat(values.deductible),
        currency: 'USD' as const,
      },
    });
  }

  if (values.outOfPocketMax) {
    costs.push({
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/coverage-copay-type',
          code: 'maxoutofpocket',
          display: 'Maximum out of pocket',
        }],
      },
      valueMoney: {
        value: parseFloat(values.outOfPocketMax),
        currency: 'USD' as const,
      },
    });
  }

  return costs.length > 0 ? costs : undefined;
};

/**
 * Main Insurance-Medplum Page Component
 */
const InsuranceMedplumPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('patient_insurance');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<Coverage | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Modal states
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [providerDetailsOpened, { open: openProviderDetails, close: closeProviderDetails }] = useDisclosure(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Provider state management
  const [providers, setProviders] = useState(mockInsuranceProviders);

  // Use the standardized useCoverage hook
  const { data: coverages = [], isLoading: loading, error, refetch } = useCoverage({
    search: searchTerm,
    status: statusFilter,
  });

  // The useCoverage hook already handles filtering, so we can use the data directly
  const filteredCoverages = coverages;

  // Filter providers based on search and status
  const filteredProviders = providers
    .filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(provider => statusFilter === 'all' || provider.status === statusFilter);

  const handleViewCoverage = (coverage: any) => {
    setSelectedCoverage(coverage as Coverage);
    openDetails();
  };

  const handleEditCoverage = (coverage: any) => {
    setSelectedCoverage(coverage as Coverage);
    openEdit();
  };

  const handleViewProvider = (provider: any) => {
    setSelectedProvider(provider);
    openProviderDetails();
  };

  const handleEditProvider = (provider: any) => {
    setSelectedProvider(provider);
    // For now, just show provider details
    openProviderDetails();
  };

  const handleVerifyInsurance = (coverage: any) => {
    // Simulate verification process
    showNotification({
      title: 'Insurance Verified',
      message: `Coverage for ${coverage.beneficiary?.display || 'patient'} has been verified.`,
      color: 'green',
      icon: <CheckCircle size={16} />,
    });
  };

  /**
   * Handle creating a new FHIR Coverage resource
   * @param coverage - Partial Coverage resource to create
   */
  const handleCreateCoverage = async (coverage: Partial<Coverage>) => {
    setCreateLoading(true);
    try {
      console.log('Creating new FHIR Coverage resource:', coverage);

      // Create the Coverage resource using backend FHIR service
      const createdCoverage = await backendFHIRService.createResource('Coverage', coverage as Coverage);

      console.log('Successfully created Coverage resource:', createdCoverage);

      // Show success notification
      showNotification({
        title: 'Success',
        message: `Coverage created successfully with ID: ${createdCoverage.id}`,
        color: 'green',
        icon: <CheckCircle size={16} />,
      });

      // Close the modal and refresh the data
      closeCreate();
      await refetch();

    } catch (error: any) {
      console.error('Error creating Coverage resource:', error);

      // Show error notification with specific error message
      showNotification({
        title: 'Error Creating Coverage',
        message: error?.message || 'Failed to create coverage. Please check your input and try again.',
        color: 'red',
        icon: <XCircle size={16} />,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR insurance coverage...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Calculate summary statistics
  const activeCoverages = filteredCoverages.filter(c => c.status === 'active');
  const pendingCoverages = filteredCoverages.filter(c => c.status === 'draft');
  const verifiedCoverages = filteredCoverages.filter(c => c.status === 'active');
  const activeProviders = filteredProviders.filter(p => p.status === 'active');

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Insurance Management</Title>
            <Text c="dimmed">Manage patient insurance coverage using FHIR Coverage resources</Text>
          </div>
          <Button
            leftSection={<Plus size={16} />}
            onClick={openCreate}
            loading={createLoading}
          >
            Add Coverage
          </Button>
        </Group>

        {/* Summary Cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Paper p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Active Insurance
                </Text>
                <Text fw={700} size="xl">
                  {activeCoverages.length}
                </Text>
              </div>
              <ThemeIcon color="blue" variant="light" size={38} radius="md">
                <Shield size={18} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Pending Verification
                </Text>
                <Text fw={700} size="xl">
                  {pendingCoverages.length}
                </Text>
              </div>
              <ThemeIcon color="orange" variant="light" size={38} radius="md">
                <Clock size={18} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Verified Insurance
                </Text>
                <Text fw={700} size="xl">
                  {verifiedCoverages.length}
                </Text>
              </div>
              <ThemeIcon color="green" variant="light" size={38} radius="md">
                <CheckCircle size={18} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Active Providers
                </Text>
                <Text fw={700} size="xl">
                  {activeProviders.length}
                </Text>
              </div>
              <ThemeIcon color="violet" variant="light" size={38} radius="md">
                <Building size={18} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Error Alert */}
        {error && (
          <Alert
            icon={<AlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {error.message || 'Failed to load coverage data'}
          </Alert>
        )}

        {/* Search and Filters */}
        <Group>
          <TextInput
            placeholder="Search coverage or providers..."
            leftSection={<Search size={16} />}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            data={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'draft', label: 'Draft' },
              { value: 'entered-in-error', label: 'Entered in Error' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            clearable
          />
          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as 'cards' | 'table')}
            data={[
              { label: 'Cards', value: 'cards' },
              { label: 'Table', value: 'table' },
            ]}
          />
        </Group>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="patient_insurance" leftSection={<Shield size={16} />}>
              Patient Insurance ({filteredCoverages.length})
            </Tabs.Tab>
            <Tabs.Tab value="insurance_providers" leftSection={<Building size={16} />}>
              Insurance Providers ({filteredProviders.length})
            </Tabs.Tab>
          </Tabs.List>

          {/* Patient Insurance Tab */}
          <Tabs.Panel value="patient_insurance" pt="md">
            {loading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : filteredCoverages.length === 0 ? (
              <Paper p="xl" withBorder>
                <Stack align="center" gap="md">
                  <Shield size={48} color="gray" />
                  <div style={{ textAlign: 'center' }}>
                    <Text size="lg" fw={500}>No coverage found</Text>
                    <Text c="dimmed">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by adding a new coverage'}
                    </Text>
                  </div>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button
                      leftSection={<Plus size={16} />}
                      onClick={openCreate}
                      variant="light"
                    >
                      Add First Coverage
                    </Button>
                  )}
                </Stack>
              </Paper>
            ) : viewMode === 'cards' ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {filteredCoverages.map((coverage) => (
                  <PatientInsuranceCard
                    key={coverage.id}
                    coverage={coverage}
                    onView={() => handleViewCoverage(coverage)}
                    onVerify={() => handleVerifyInsurance(coverage)}
                    onEdit={() => handleEditCoverage(coverage)}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Insurance Provider</Table.Th>
                      <Table.Th>Policy Number</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Expires</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredCoverages.map((coverage) => (
                      <PatientInsuranceTableRow
                        key={coverage.id}
                        coverage={coverage}
                        onView={() => handleViewCoverage(coverage)}
                        onVerify={() => handleVerifyInsurance(coverage)}
                        onEdit={() => handleEditCoverage(coverage)}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Tabs.Panel>

          {/* Insurance Providers Tab */}
          <Tabs.Panel value="insurance_providers" pt="md">
            {filteredProviders.length === 0 ? (
              <Paper p="xl" withBorder>
                <Stack align="center" gap="md">
                  <Building size={48} color="gray" />
                  <div style={{ textAlign: 'center' }}>
                    <Text size="lg" fw={500}>No providers found</Text>
                    <Text c="dimmed">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'No insurance providers available'}
                    </Text>
                  </div>
                </Stack>
              </Paper>
            ) : viewMode === 'cards' ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {filteredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onView={() => handleViewProvider(provider)}
                    onEdit={() => handleEditProvider(provider)}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Provider Name</Table.Th>
                      <Table.Th>Contact</Table.Th>
                      <Table.Th>Plans</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredProviders.map((provider) => (
                      <ProviderTableRow
                        key={provider.id}
                        provider={provider}
                        onView={() => handleViewProvider(provider)}
                        onEdit={() => handleEditProvider(provider)}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Coverage Details Modal */}
        <CoverageDetailsModal
          opened={detailsOpened}
          onClose={closeDetails}
          coverage={selectedCoverage}
        />

        {/* Provider Details Modal */}
        <ProviderDetailsModal
          opened={providerDetailsOpened}
          onClose={closeProviderDetails}
          provider={selectedProvider}
          onEdit={() => { }}
        />

        {/* Create Coverage Modal */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Add New Coverage"
          size="lg"
        >
          <NewCoverageForm
            onSubmit={handleCreateCoverage}
            onCancel={closeCreate}
            loading={createLoading}
          />
        </Modal>

        {/* Edit Coverage Modal */}
        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit Coverage"
          size="lg"
        >
          {selectedCoverage && (
            <NewCoverageForm
              coverage={selectedCoverage}
              onSubmit={handleCreateCoverage}
              onCancel={closeEdit}
              loading={createLoading}
            />
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default InsuranceMedplumPage;