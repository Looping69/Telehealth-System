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
import { Insurance } from '../types';

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

const mockPatientInsurance: Insurance[] = [
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
    effectiveDate: '2024-01-01',
    expirationDate: '2024-12-31',
    status: 'active',
    copay: 25,
    deductible: 1000,
    coinsurance: 20,
    outOfPocketMax: 5000,
    lastVerified: '2024-01-10',
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
    effectiveDate: '2024-01-01',
    expirationDate: '2024-12-31',
    status: 'active',
    copay: 30,
    deductible: 1500,
    coinsurance: 25,
    outOfPocketMax: 6000,
    lastVerified: '2024-01-08',
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
 * Patient Insurance Card Component
 */
interface PatientInsuranceCardProps {
  insurance: Insurance;
  onView: (insurance: Insurance) => void;
  onVerify: (insurance: Insurance) => void;
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
              {insurance.lastVerified}
            </Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Expires: {insurance.expirationDate}
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
  insurance: Insurance | null;
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
                <strong>Effective Date:</strong> {insurance.effectiveDate}
              </Text>
              <Text size="sm">
                <strong>Expiration Date:</strong> {insurance.expirationDate}
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
                <strong>Last Verified:</strong> {insurance.lastVerified}
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
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Using mock data for now
  const providers = mockInsuranceProviders;
  const patientInsurance = mockPatientInsurance;
  const isLoading = false;

  const handleViewInsurance = (insurance: Insurance) => {
    setSelectedInsurance(insurance);
    openDetails();
  };

  const handleVerifyInsurance = (insurance: Insurance) => {
    // TODO: Implement insurance verification
    console.log('Verify insurance:', insurance);
  };

  const handleViewProvider = (provider: any) => {
    // TODO: Implement provider view
    console.log('View provider:', provider);
  };

  const handleEditProvider = (provider: any) => {
    // TODO: Implement provider edit
    console.log('Edit provider:', provider);
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
          <Button leftSection={<Plus size={16} />}>
            Add Insurance
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
              <Button leftSection={<Plus size={16} />}>
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
    </Container>
  );
};

/**
 * Patient Insurance Table Row Component
 */
interface PatientInsuranceTableRowProps {
  insurance: Insurance;
  onView: (insurance: Insurance) => void;
  onVerify: (insurance: Insurance) => void;
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
        <Text size="sm">{insurance.expirationDate}</Text>
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