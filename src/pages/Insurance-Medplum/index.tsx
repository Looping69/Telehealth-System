/**
 * Insurance-Medplum Page Component
 * Manages insurance coverage using FHIR data
 */

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { Coverage } from '@medplum/fhirtypes';

/**
 * FHIR Coverage Card Component
 */
interface FHIRCoverageCardProps {
  coverage: Coverage;
  onView: (coverage: Coverage) => void;
  onEdit: (coverage: Coverage) => void;
}

const FHIRCoverageCard: React.FC<FHIRCoverageCardProps> = ({ coverage, onView, onEdit }) => {
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

  const getPatientName = () => {
    return coverage.beneficiary?.display || 'Unknown Patient';
  };

  const getPayorName = () => {
    return coverage.payor?.[0]?.display || 'Unknown Payor';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Coverage
            </Badge>
          </Group>
          <Badge color={getStatusColor(coverage.status)}>
            {coverage.status}
          </Badge>
        </Group>

        <Group>
          <ActionIcon variant="light" color="blue" size="lg">
            <Shield size={20} />
          </ActionIcon>
          <Stack gap={4}>
            <Text fw={500}>{getPayorName()}</Text>
            <Text size="sm" c="dimmed">
              Coverage #{coverage.id}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Beneficiary: {getPatientName()}</Text>
          </Group>
          {coverage.period?.start && (
            <Group gap="xs">
              <Calendar size={14} />
              <Text size="sm">Start: {new Date(coverage.period.start).toLocaleDateString()}</Text>
            </Group>
          )}
          {coverage.period?.end && (
            <Group gap="xs">
              <Calendar size={14} />
              <Text size="sm">End: {new Date(coverage.period.end).toLocaleDateString()}</Text>
            </Group>
          )}
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            Type: {coverage.type?.text || 'Not specified'}
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
              color="orange"
              onClick={() => onEdit(coverage)}
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
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<Coverage | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR coverages
  useEffect(() => {
    const fetchCoverages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('Coverage', {
          _sort: '-period',
          _count: '50',
          _include: 'Coverage:beneficiary,Coverage:payor'
        });

        if (response.entry) {
          const coverageData = response.entry
            .filter(entry => entry.resource?.resourceType === 'Coverage')
            .map(entry => entry.resource as Coverage);
          
          setCoverages(coverageData);
        } else {
          setCoverages([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR coverages:', err);
        setError('Failed to fetch insurance coverage from FHIR server. Please check your connection.');
        setCoverages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverages();
  }, []);

  // Filter coverages
  const filteredCoverages = useMemo(() => {
    return coverages.filter(coverage => {
      const matchesSearch = !searchTerm || 
        coverage.beneficiary?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coverage.payor?.[0]?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coverage.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || coverage.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [coverages, searchTerm, statusFilter]);

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
            {error}
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
                <FHIRCoverageCard
                  coverage={coverage}
                  onView={handleViewCoverage}
                  onEdit={handleEditCoverage}
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