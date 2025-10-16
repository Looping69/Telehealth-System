/**
 * Pharmacies-Medplum Page Component
 * Manages pharmacy organizations using FHIR data
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
  Building,
  Phone,
  Mail,
  MapPin,
  Filter,
  Database,
  AlertCircle,
  Pill,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { Organization } from '@medplum/fhirtypes';

/**
 * FHIR Pharmacy Card Component
 */
interface FHIRPharmacyCardProps {
  pharmacy: Organization;
  onView: (pharmacy: Organization) => void;
  onEdit: (pharmacy: Organization) => void;
}

const FHIRPharmacyCard: React.FC<FHIRPharmacyCardProps> = ({ pharmacy, onView, onEdit }) => {
  const getStatusColor = (active?: boolean) => {
    return active ? 'green' : 'red';
  };

  const getPharmacyName = () => {
    return pharmacy.name || 'Unknown Pharmacy';
  };

  const getPhone = () => {
    const phone = pharmacy.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'No phone';
  };

  const getEmail = () => {
    const email = pharmacy.telecom?.find(t => t.system === 'email');
    return email?.value || 'No email';
  };

  const getAddress = () => {
    const address = pharmacy.address?.[0];
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

  const getType = () => {
    return pharmacy.type?.[0]?.text || 'Pharmacy';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Organization
            </Badge>
          </Group>
          <Badge color={getStatusColor(pharmacy.active)}>
            {pharmacy.active ? 'Active' : 'Inactive'}
          </Badge>
        </Group>

        <Group>
          <Avatar size="md" color="blue">
            <Pill size={20} />
          </Avatar>
          <Stack gap={4}>
            <Text fw={500}>{getPharmacyName()}</Text>
            <Text size="sm" c="dimmed">
              {getType()}
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
            ID: {pharmacy.id}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(pharmacy)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(pharmacy)}
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
 * Main Pharmacies-Medplum Page Component
 */
const PharmaciesMedplumPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Organization | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR pharmacy organizations
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('Organization', {
          type: 'prov',
          _sort: 'name',
          _count: '50'
        });

        if (response.entry) {
          const pharmacyData = response.entry
            .filter(entry => entry.resource?.resourceType === 'Organization')
            .map(entry => entry.resource as Organization);
          
          setPharmacies(pharmacyData);
        } else {
          setPharmacies([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR pharmacies:', err);
        setError('Failed to fetch pharmacies from FHIR server. Please check your connection.');
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter(pharmacy => {
      const matchesSearch = !searchTerm || 
        pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.type?.[0]?.text?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && pharmacy.active) ||
        (statusFilter === 'inactive' && !pharmacy.active);

      return matchesSearch && matchesStatus;
    });
  }, [pharmacies, searchTerm, statusFilter]);

  const handleViewPharmacy = (pharmacy: Organization) => {
    setSelectedPharmacy(pharmacy);
    openDetails();
  };

  const handleEditPharmacy = (pharmacy: Organization) => {
    setSelectedPharmacy(pharmacy);
    openEdit();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR pharmacies...</Text>
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
            <Title order={1}>Pharmacies</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage pharmacy organizations and locations</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Pharmacy
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
                placeholder="Search pharmacies..."
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
                  { value: 'all', label: 'All Pharmacies' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredPharmacies.length} pharmacies
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Pharmacies Grid */}
        {filteredPharmacies.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Building size={48} color="gray" />
              <Text size="lg" c="dimmed">No pharmacies found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or add new pharmacies'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredPharmacies.map((pharmacy) => (
              <Grid.Col key={pharmacy.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRPharmacyCard
                  pharmacy={pharmacy}
                  onView={handleViewPharmacy}
                  onEdit={handleEditPharmacy}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Pharmacy Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Organization #${selectedPharmacy?.id}`}
          size="lg"
        >
          {selectedPharmacy && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Organization ID: {selectedPharmacy.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Name</Text>
                    <Text size="sm" c="dimmed">
                      {selectedPharmacy.name || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedPharmacy.active ? 'green' : 'red'}>
                      {selectedPharmacy.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Type</Text>
                    <Text size="sm" c="dimmed">
                      {selectedPharmacy.type?.[0]?.text || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Identifier</Text>
                    <Text size="sm" c="dimmed">
                      {selectedPharmacy.identifier?.[0]?.value || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Contact Information</Text>
                    {selectedPharmacy.telecom?.map((contact, index) => (
                      <Text key={index} size="sm" c="dimmed">
                        {contact.system}: {contact.value}
                      </Text>
                    )) || <Text size="sm" c="dimmed">No contact information</Text>}
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
          title="Create New FHIR Pharmacy"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR pharmacy creation requires specific implementation for Organization resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Pharmacy"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR pharmacy editing requires specific implementation for the selected Organization resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default PharmaciesMedplumPage;