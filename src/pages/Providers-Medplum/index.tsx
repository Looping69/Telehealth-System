/**
 * Providers-Medplum Page Component
 * Manages healthcare providers using FHIR data
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
  Avatar,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Filter,
  Database,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { Practitioner } from '@medplum/fhirtypes';

/**
 * FHIR Practitioner Card Component
 */
interface FHIRPractitionerCardProps {
  practitioner: Practitioner;
  onView: (practitioner: Practitioner) => void;
  onEdit: (practitioner: Practitioner) => void;
}

const FHIRPractitionerCard: React.FC<FHIRPractitionerCardProps> = ({ practitioner, onView, onEdit }) => {
  const getStatusColor = (active?: boolean) => {
    return active ? 'green' : 'red';
  };

  const getPractitionerName = () => {
    const name = practitioner.name?.[0];
    if (name) {
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim() || 'Unknown Provider';
    }
    return 'Unknown Provider';
  };

  const getSpecialty = () => {
    return practitioner.qualification?.[0]?.code?.text || 'General Practice';
  };

  const getPhone = () => {
    const phone = practitioner.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'No phone';
  };

  const getEmail = () => {
    const email = practitioner.telecom?.find(t => t.system === 'email');
    return email?.value || 'No email';
  };

  const getAddress = () => {
    const address = practitioner.address?.[0];
    if (address) {
      const parts = [
        address.line?.join(', '),
        address.city,
        address.state,
        address.postalCode
      ].filter(Boolean);
      return parts.join(', ') || 'No address';
    }
    return 'No address';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Practitioner
            </Badge>
          </Group>
          <Badge color={getStatusColor(practitioner.active)}>
            {practitioner.active ? 'Active' : 'Inactive'}
          </Badge>
        </Group>

        <Group>
          <Avatar size="md" color="blue">
            <Stethoscope size={20} />
          </Avatar>
          <Stack gap={4}>
            <Text fw={500}>{getPractitionerName()}</Text>
            <Text size="sm" c="dimmed">
              {getSpecialty()}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{getPhone()}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{getEmail()}</Text>
          </Group>
          <Group gap="xs">
            <MapPin size={14} />
            <Text size="sm" lineClamp={1}>{getAddress()}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            ID: {practitioner.id}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(practitioner)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(practitioner)}
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
 * Main Providers-Medplum Page Component
 */
const ProvidersMedplumPage: React.FC = () => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR practitioners
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('Practitioner', {
          _sort: 'name',
          _count: '50'
        });

        if (response.entry) {
          const practitionerData = response.entry
            .filter(entry => entry.resource?.resourceType === 'Practitioner')
            .map(entry => entry.resource as Practitioner);
          
          setPractitioners(practitionerData);
        } else {
          setPractitioners([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR practitioners:', err);
        setError('Failed to fetch providers from FHIR server. Please check your connection.');
        setPractitioners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioners();
  }, []);

  // Filter practitioners
  const filteredPractitioners = useMemo(() => {
    return practitioners.filter(practitioner => {
      const name = practitioner.name?.[0];
      const fullName = name ? `${name.given?.join(' ')} ${name.family}`.toLowerCase() : '';
      const specialty = practitioner.qualification?.[0]?.code?.text?.toLowerCase() || '';
      
      const matchesSearch = !searchTerm || 
        fullName.includes(searchTerm.toLowerCase()) ||
        specialty.includes(searchTerm.toLowerCase()) ||
        practitioner.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && practitioner.active) ||
        (statusFilter === 'inactive' && !practitioner.active);

      return matchesSearch && matchesStatus;
    });
  }, [practitioners, searchTerm, statusFilter]);

  const handleViewPractitioner = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    openDetails();
  };

  const handleEditPractitioner = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    openEdit();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR practitioners...</Text>
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
            <Title order={1}>Providers</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage healthcare providers and practitioners</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Provider
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
                placeholder="Search providers..."
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
                  { value: 'all', label: 'All Providers' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredPractitioners.length} providers
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Providers Grid */}
        {filteredPractitioners.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <UserCheck size={48} color="gray" />
              <Text size="lg" c="dimmed">No providers found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or add new providers'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredPractitioners.map((practitioner) => (
              <Grid.Col key={practitioner.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRPractitionerCard
                  practitioner={practitioner}
                  onView={handleViewPractitioner}
                  onEdit={handleEditPractitioner}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Practitioner Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Practitioner #${selectedPractitioner?.id}`}
          size="lg"
        >
          {selectedPractitioner && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Practitioner ID: {selectedPractitioner.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Name</Text>
                    <Text size="sm" c="dimmed">
                      {selectedPractitioner.name?.[0] ? 
                        `${selectedPractitioner.name[0].given?.join(' ')} ${selectedPractitioner.name[0].family}` : 
                        'Unknown'
                      }
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedPractitioner.active ? 'green' : 'red'}>
                      {selectedPractitioner.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Gender</Text>
                    <Text size="sm" c="dimmed">
                      {selectedPractitioner.gender || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Birth Date</Text>
                    <Text size="sm" c="dimmed">
                      {selectedPractitioner.birthDate ? 
                        new Date(selectedPractitioner.birthDate).toLocaleDateString() : 
                        'Not specified'
                      }
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Qualifications</Text>
                    {selectedPractitioner.qualification?.map((qual, index) => (
                      <Text key={index} size="sm" c="dimmed">
                        {qual.code?.text || 'Not specified'}
                      </Text>
                    )) || <Text size="sm" c="dimmed">No qualifications listed</Text>}
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
          title="Create New FHIR Practitioner"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR practitioner creation requires specific implementation for Practitioner resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Practitioner"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR practitioner editing requires specific implementation for the selected Practitioner resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default ProvidersMedplumPage;