/**
 * Insurance-Medplum Page Component
 * Manages insurance coverage using FHIR data
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
} from '@mantine/core';
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Coverage } from '@medplum/fhirtypes';
import { useCoverage } from '../../hooks/useQuery';

/**
 * Patient Insurance Card Component
 */
interface PatientInsuranceCardProps {
  coverage: any;
  onView: (coverage: any) => void;
  onVerify: (coverage: any) => void;
}

const PatientInsuranceCard: React.FC<PatientInsuranceCardProps> = ({ coverage, onView, onVerify }) => {
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
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Expires: {getExpirationDate()}
          </Text>
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
        </Group>
      </Stack>
    </Card>
  );
};

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
            {provider.plans?.length || 0} plan{(provider.plans?.length || 0) !== 1 ? 's' : ''}
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
 * Main Insurance-Medplum Page Component
 */
const InsuranceMedplumPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<Coverage | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Use the standardized useCoverage hook
  const { data: coverages = [], isLoading: loading, error } = useCoverage({
    search: searchTerm,
    status: statusFilter,
  });

  // The useCoverage hook already handles filtering, so we can use the data directly
  const filteredCoverages = coverages;

  const handleViewCoverage = (coverage: Coverage) => {
    setSelectedCoverage(coverage);
    openDetails();
  };

  const handleEditCoverage = (coverage: Coverage) => {
    setSelectedCoverage(coverage);
    openEdit();
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

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Insurance</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage insurance coverage and benefits</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            New Coverage
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error.message || 'Failed to fetch insurance coverage from FHIR server. Please check your connection.'}
          </Alert>
        )}

        {/* Filters */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search coverage..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'entered-in-error', label: 'Entered in Error' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredCoverages.length} coverages
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Coverage Grid */}
        {filteredCoverages.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Shield size={48} color="gray" />
              <Text size="lg" c="dimmed">No insurance coverage found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or add new coverage'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredCoverages.map((coverage) => (
              <Grid.Col key={coverage.id} span={{ base: 12, md: 6, lg: 4 }}>
                <PatientInsuranceCard
                  coverage={coverage}
                  onView={handleViewCoverage}
                  onVerify={handleEditCoverage}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Coverage Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Coverage #${selectedCoverage?.id}`}
          size="lg"
        >
          {selectedCoverage && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Coverage ID: {selectedCoverage.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Beneficiary</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCoverage.beneficiary?.display || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Payor</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCoverage.payor?.[0]?.display || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedCoverage.status === 'active' ? 'green' : 'yellow'}>
                      {selectedCoverage.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Type</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCoverage.type?.text || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Create and Edit Modals */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Coverage"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR coverage creation requires specific implementation for Coverage resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Coverage"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR coverage editing requires specific implementation for the selected Coverage resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default InsuranceMedplumPage;