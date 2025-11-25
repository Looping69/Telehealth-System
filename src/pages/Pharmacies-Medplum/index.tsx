/**
 * Pharmacies-Medplum Page Component
 * Manages pharmacy organizations using FHIR data with comprehensive UI
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
  Tabs,
  Table,
  Textarea,
  NumberInput,
  Switch,
  Divider,
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
  Star,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  ShoppingCart,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { usePharmacies } from '../../hooks/useQuery';
import { Organization } from '@medplum/fhirtypes';
import CreateOrderModal from '../../components/CreateOrderModal';

const PharmaciesMedplumPage = () => {
  const { data: pharmaciesData, isLoading: loading, error: queryError } = usePharmacies();
  const [pharmacies, setPharmacies] = useState<Organization[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Modals state
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOrderOpened, { open: openCreateOrder, close: closeCreateOrder }] = useDisclosure(false);
  const [selectedPharmacyForOrder, setSelectedPharmacyForOrder] = useState<Organization | null>(null);

  useEffect(() => {
    if (pharmaciesData) {
      setPharmacies(pharmaciesData);
    }
  }, [pharmaciesData]);

  const error = queryError ? (queryError as Error).message : null;
  const activePharmacies = pharmacies.filter(p => p.active).length;
  const totalPrescriptions = 1250;
  const avgRating = 4.8;
  const deliveryPharmacies = Math.floor(pharmacies.length * 0.7);

  const handleCreateOrder = (pharmacy: Organization) => {
    setSelectedPharmacyForOrder(pharmacy);
    openCreateOrder();
  };

  const handleViewPharmacy = (pharmacy: Organization) => {
    setSelectedPharmacy(pharmacy);
    openDetails();
  };

  const handleEditPharmacy = (pharmacy: Organization) => {
    setSelectedPharmacy(pharmacy);
    openEdit();
  };

  const handleSavePharmacy = (organization: Organization) => {
    // Optimistic update
    setPharmacies(prev => [...prev, organization]);
    console.log('Created pharmacy:', organization);
  };

  const handleUpdatePharmacy = (updatedOrganization: Organization) => {
    // Optimistic update
    setPharmacies(prev => prev.map(p => p.id === updatedOrganization.id ? updatedOrganization : p));
    console.log('Updated pharmacy:', updatedOrganization);
  };

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter(pharmacy => {
      const matchesSearch = searchTerm === '' ||
        (pharmacy.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (pharmacy.address?.[0]?.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && pharmacy.active) ||
        (statusFilter === 'inactive' && !pharmacy.active);

      return matchesSearch && matchesStatus;
    });
  }, [pharmacies, searchTerm, statusFilter]);

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
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Pharmacy Partners</Title>
            <Text c="dimmed">Manage pharmacy partnerships and prescription fulfillment</Text>
          </div>
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

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Pharmacies
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Building size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activePharmacies}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Prescriptions
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <Package size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {totalPrescriptions.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Average Rating
                </Text>
                <ActionIcon variant="light" color="yellow" size="lg">
                  <Star size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="yellow">
                {avgRating.toFixed(1)}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Delivery Available
                </Text>
                <ActionIcon variant="light" color="indigo" size="lg">
                  <Truck size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="indigo">
                {deliveryPharmacies}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search pharmacies..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by type"
                leftSection={<Building size={16} />}
                data={[
                  { value: 'retail', label: 'Retail' },
                  { value: 'hospital', label: 'Hospital' },
                  { value: 'mail_order', label: 'Mail Order' },
                  { value: 'specialty', label: 'Specialty' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
              <Group justify="flex-end">
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
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Pharmacies Content */}
        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading FHIR pharmacies...</Text>
            </Stack>
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredPharmacies.map((pharmacy) => (
              <Grid.Col key={pharmacy.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <FHIRPharmacyCard
                  pharmacy={pharmacy}
                  onView={handleViewPharmacy}
                  onEdit={handleEditPharmacy}
                  onCreateOrder={handleCreateOrder}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pharmacy</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Address</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Fill Time</Table.Th>
                  <Table.Th>Services</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPharmacies.map((pharmacy) => (
                  <FHIRPharmacyTableRow
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    onView={handleViewPharmacy}
                    onEdit={handleEditPharmacy}
                    onCreateOrder={handleCreateOrder}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredPharmacies.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Building size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No pharmacies found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchTerm || statusFilter !== 'all' || typeFilter
                  ? 'Try adjusting your search criteria'
                  : error
                    ? 'Check your FHIR server connection'
                    : 'Get started by adding your first pharmacy partner'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                Add Pharmacy
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Pharmacy Details Modal */}
      <FHIRPharmacyDetailsModal
        pharmacy={selectedPharmacy}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create and Edit Modals */}
      <CreateFHIRPharmacyModal
        opened={createOpened}
        onClose={closeCreate}
        onSave={handleSavePharmacy}
      />

      <EditFHIRPharmacyModal
        opened={editOpened}
        onClose={closeEdit}
        onSave={handleUpdatePharmacy}
        organization={selectedPharmacy}
      />

      <CreateOrderModal
        opened={createOrderOpened}
        onClose={closeCreateOrder}
        preselectedPharmacy={selectedPharmacyForOrder ? { id: selectedPharmacyForOrder.id!, name: selectedPharmacyForOrder.name! } : undefined}
      />
    </Container>
  );
};

export default PharmaciesMedplumPage;

// --- Sub-components ---

interface FHIRPharmacyCardProps {
  pharmacy: Organization;
  onView: (pharmacy: Organization) => void;
  onEdit: (pharmacy: Organization) => void;
  onCreateOrder: (pharmacy: Organization) => void;
}

const FHIRPharmacyCard: React.FC<FHIRPharmacyCardProps> = ({ pharmacy, onView, onEdit, onCreateOrder }) => {
  const address = pharmacy.address?.[0];
  const phone = pharmacy.telecom?.find(t => t.system === 'phone')?.value;
  const type = pharmacy.extension?.find(e => e.url?.includes('pharmacy-type'))?.valueString || 'Retail';

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <Avatar color="blue" radius="xl">
            <Building size={20} />
          </Avatar>
          <div>
            <Text fw={500}>{pharmacy.name}</Text>
            <Badge size="sm" variant="light">{type}</Badge>
          </div>
        </Group>
        <Badge color={pharmacy.active ? 'green' : 'gray'}>
          {pharmacy.active ? 'Active' : 'Inactive'}
        </Badge>
      </Group>

      <Stack gap="xs" mt="md">
        <Group gap="xs">
          <MapPin size={16} color="gray" />
          <Text size="sm" c="dimmed" lineClamp={1}>
            {address ? `${address.line?.[0]}, ${address.city}, ${address.state}` : 'No address'}
          </Text>
        </Group>
        <Group gap="xs">
          <Phone size={16} color="gray" />
          <Text size="sm" c="dimmed">
            {phone || 'No phone'}
          </Text>
        </Group>
      </Stack>

      <Group mt="md" grow>
        <Button variant="light" size="xs" onClick={() => onView(pharmacy)}>View</Button>
        <Button variant="light" size="xs" onClick={() => onEdit(pharmacy)}>Edit</Button>
        <Button variant="filled" size="xs" leftSection={<ShoppingCart size={12} />} onClick={() => onCreateOrder(pharmacy)}>Order</Button>
      </Group>
    </Card>
  );
};

interface FHIRPharmacyTableRowProps {
  pharmacy: Organization;
  onView: (pharmacy: Organization) => void;
  onEdit: (pharmacy: Organization) => void;
  onCreateOrder: (pharmacy: Organization) => void;
}

const FHIRPharmacyTableRow: React.FC<FHIRPharmacyTableRowProps> = ({ pharmacy, onView, onEdit, onCreateOrder }) => {
  const address = pharmacy.address?.[0];
  const phone = pharmacy.telecom?.find(t => t.system === 'phone')?.value;
  const type = pharmacy.extension?.find(e => e.url?.includes('pharmacy-type'))?.valueString || 'Retail';

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="blue" radius="xl" size="sm">
            <Building size={16} />
          </Avatar>
          <Text size="sm" fw={500}>{pharmacy.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td><Badge size="sm" variant="outline">{type}</Badge></Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {address ? `${address.line?.[0]}, ${address.city}` : 'No address'}
        </Text>
      </Table.Td>
      <Table.Td><Text size="sm">{phone || '-'}</Text></Table.Td>
      <Table.Td>
        <Badge color={pharmacy.active ? 'green' : 'gray'} size="sm">
          {pharmacy.active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Star size={14} fill="gold" color="gold" />
          <Text size="sm">4.8</Text>
        </Group>
      </Table.Td>
      <Table.Td><Text size="sm">24h</Text></Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Truck size={14} />
          <Pill size={14} />
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="blue" onClick={() => onView(pharmacy)}>
            <Eye size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="orange" onClick={() => onEdit(pharmacy)}>
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="green" onClick={() => onCreateOrder(pharmacy)}>
            <ShoppingCart size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

interface FHIRPharmacyDetailsModalProps {
  pharmacy: Organization | null;
  opened: boolean;
  onClose: () => void;
}

const FHIRPharmacyDetailsModal: React.FC<FHIRPharmacyDetailsModalProps> = ({ pharmacy, opened, onClose }) => {
  if (!pharmacy) return null;

  const address = pharmacy.address?.[0];
  const phone = pharmacy.telecom?.find(t => t.system === 'phone')?.value;
  const email = pharmacy.telecom?.find(t => t.system === 'email')?.value;
  const website = pharmacy.telecom?.find(t => t.system === 'url')?.value;

  return (
    <Modal opened={opened} onClose={onClose} title={pharmacy.name} size="lg">
      <Stack>
        <Group>
          <Badge size="lg" color={pharmacy.active ? 'green' : 'gray'}>{pharmacy.active ? 'Active' : 'Inactive'}</Badge>
        </Group>
        <Divider />
        <Grid>
          <Grid.Col span={6}>
            <Text fw={500}>Contact Information</Text>
            <Stack gap="xs" mt="xs">
              <Group gap="xs"><MapPin size={16} /><Text size="sm">{address ? `${address.line?.[0]}, ${address.city}, ${address.state} ${address.postalCode}` : 'N/A'}</Text></Group>
              <Group gap="xs"><Phone size={16} /><Text size="sm">{phone || 'N/A'}</Text></Group>
              <Group gap="xs"><Mail size={16} /><Text size="sm">{email || 'N/A'}</Text></Group>
              <Group gap="xs"><Globe size={16} /><Text size="sm">{website || 'N/A'}</Text></Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Modal>
  );
};

/**
 * Create FHIR Pharmacy Modal Component
 * Purpose: Modal for creating new FHIR Organization resources as pharmacies
 * Inputs: opened (boolean), onClose (function), onSave (function)
 * Outputs: Creates new FHIR Organization with pharmacy data
 */
interface CreateFHIRPharmacyModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (organization: Organization) => void;
}

const CreateFHIRPharmacyModal: React.FC<CreateFHIRPharmacyModalProps> = ({
  opened,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    licenseNumber: '',
    npiNumber: '',
    contactPerson: '',
    type: 'retail',
    deliveryAvailable: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates form data before submission
   * Returns: boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pharmacy name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.npiNumber.trim()) newErrors.npiNumber = 'NPI number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission and creates FHIR Organization
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        color: 'red',
      });
      return;
    }

    try {
      // Create FHIR Organization resource
      const newOrganization: Organization = {
        resourceType: 'Organization',
        id: `pharmacy-${Date.now()}`,
        active: true,
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/organization-type',
                code: 'prov',
                display: 'Healthcare Provider',
              },
            ],
          },
        ],
        name: formData.name,
        telecom: [
          {
            system: 'phone',
            value: formData.phone,
            use: 'work',
          },
          {
            system: 'email',
            value: formData.email,
            use: 'work',
          },
          ...(formData.website ? [{
            system: 'url' as const,
            value: formData.website,
            use: 'work' as const,
          }] : []),
        ],
        address: [
          {
            use: 'work',
            type: 'physical',
            line: [formData.address],
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            country: 'US',
          },
        ],
        // Store additional pharmacy-specific data in extensions
        extension: [
          {
            url: 'http://example.com/fhir/StructureDefinition/pharmacy-type',
            valueString: formData.type,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/license-number',
            valueString: formData.licenseNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/npi-number',
            valueString: formData.npiNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/contact-person',
            valueString: formData.contactPerson,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/delivery-available',
            valueBoolean: formData.deliveryAvailable,
          },
        ],
      };

      onSave(newOrganization);

      notifications.show({
        title: 'Success',
        message: 'Pharmacy created successfully',
        color: 'green',
      });

      // Reset form
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        licenseNumber: '',
        npiNumber: '',
        contactPerson: '',
        type: 'retail',
        deliveryAvailable: false,
      });
      setErrors({});
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create pharmacy',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Pharmacy"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Pharmacy Name"
          placeholder="Enter pharmacy name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          error={errors.name}
          required
        />

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.currentTarget.value })}
              error={errors.address}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Type"
              data={[
                { value: 'retail', label: 'Retail Pharmacy' },
                { value: 'hospital', label: 'Hospital Pharmacy' },
                { value: 'mail_order', label: 'Mail Order' },
                { value: 'specialty', label: 'Specialty Pharmacy' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value || 'retail' })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="City"
              placeholder="Enter city"
              value={formData.city}
              onChange={(event) => setFormData({ ...formData, city: event.currentTarget.value })}
              error={errors.city}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="State"
              placeholder="State"
              value={formData.state}
              onChange={(event) => setFormData({ ...formData, state: event.currentTarget.value })}
              error={errors.state}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="ZIP Code"
              placeholder="ZIP"
              value={formData.zipCode}
              onChange={(event) => setFormData({ ...formData, zipCode: event.currentTarget.value })}
              error={errors.zipCode}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.currentTarget.value })}
              error={errors.phone}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.currentTarget.value })}
              error={errors.email}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Website (Optional)"
          placeholder="Enter website URL"
          value={formData.website}
          onChange={(event) => setFormData({ ...formData, website: event.currentTarget.value })}
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="License Number"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={(event) => setFormData({ ...formData, licenseNumber: event.currentTarget.value })}
              error={errors.licenseNumber}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="NPI Number"
              placeholder="Enter NPI number"
              value={formData.npiNumber}
              onChange={(event) => setFormData({ ...formData, npiNumber: event.currentTarget.value })}
              error={errors.npiNumber}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Contact Person"
              placeholder="Enter primary contact person"
              value={formData.contactPerson}
              onChange={(event) => setFormData({ ...formData, contactPerson: event.currentTarget.value })}
              error={errors.contactPerson}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Delivery Available</Text>
              <Switch
                checked={formData.deliveryAvailable}
                onChange={(event) => setFormData({ ...formData, deliveryAvailable: event.currentTarget.checked })}
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Pharmacy
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Edit FHIR Pharmacy Modal Component
 * Purpose: Modal for editing existing FHIR Organization resources
 * Inputs: opened (boolean), onClose (function), onSave (function), organization (Organization)
 * Outputs: Updates FHIR Organization with modified pharmacy data
 */
interface EditFHIRPharmacyModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (organization: Organization) => void;
  organization: Organization | null;
}

const EditFHIRPharmacyModal: React.FC<EditFHIRPharmacyModalProps> = ({
  opened,
  onClose,
  onSave,
  organization,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    licenseNumber: '',
    npiNumber: '',
    contactPerson: '',
    type: 'retail',
    deliveryAvailable: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Populates form data when organization changes
   */
  useEffect(() => {
    if (organization) {
      const phone = organization.telecom?.find(t => t.system === 'phone')?.value || '';
      const email = organization.telecom?.find(t => t.system === 'email')?.value || '';
      const website = organization.telecom?.find(t => t.system === 'url')?.value || '';
      const address = organization.address?.[0];

      // Extract pharmacy-specific data from extensions
      const getExtensionValue = (url: string) => {
        const extension = organization.extension?.find(ext => ext.url === url);
        return extension?.valueString || extension?.valueBoolean || '';
      };

      setFormData({
        name: organization.name || '',
        address: address?.line?.[0] || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.postalCode || '',
        phone,
        email,
        website,
        licenseNumber: getExtensionValue('http://example.com/fhir/StructureDefinition/license-number') as string,
        npiNumber: getExtensionValue('http://example.com/fhir/StructureDefinition/npi-number') as string,
        contactPerson: getExtensionValue('http://example.com/fhir/StructureDefinition/contact-person') as string,
        type: getExtensionValue('http://example.com/fhir/StructureDefinition/pharmacy-type') as string || 'retail',
        deliveryAvailable: getExtensionValue('http://example.com/fhir/StructureDefinition/delivery-available') as boolean || false,
      });
    }
  }, [organization]);

  /**
   * Validates form data before submission
   * Returns: boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pharmacy name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.npiNumber.trim()) newErrors.npiNumber = 'NPI number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission and updates FHIR Organization
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        color: 'red',
      });
      return;
    }

    if (!organization) return;

    try {
      // Update FHIR Organization resource
      const updatedOrganization: Organization = {
        ...organization,
        name: formData.name,
        telecom: [
          {
            system: 'phone',
            value: formData.phone,
            use: 'work',
          },
          {
            system: 'email',
            value: formData.email,
            use: 'work',
          },
          ...(formData.website ? [{
            system: 'url' as const,
            value: formData.website,
            use: 'work' as const,
          }] : []),
        ],
        address: [
          {
            use: 'work',
            type: 'physical',
            line: [formData.address],
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            country: 'US',
          },
        ],
        // Update pharmacy-specific data in extensions
        extension: [
          {
            url: 'http://example.com/fhir/StructureDefinition/pharmacy-type',
            valueString: formData.type,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/license-number',
            valueString: formData.licenseNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/npi-number',
            valueString: formData.npiNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/contact-person',
            valueString: formData.contactPerson,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/delivery-available',
            valueBoolean: formData.deliveryAvailable,
          },
        ],
      };

      onSave(updatedOrganization);

      notifications.show({
        title: 'Success',
        message: 'Pharmacy updated successfully',
        color: 'green',
      });

      setErrors({});
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update pharmacy',
        color: 'red',
      });
    }
  };

  if (!organization) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Pharmacy"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Pharmacy Name"
          placeholder="Enter pharmacy name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          error={errors.name}
          required
        />

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.currentTarget.value })}
              error={errors.address}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Type"
              data={[
                { value: 'retail', label: 'Retail Pharmacy' },
                { value: 'hospital', label: 'Hospital Pharmacy' },
                { value: 'mail_order', label: 'Mail Order' },
                { value: 'specialty', label: 'Specialty Pharmacy' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value || 'retail' })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="City"
              placeholder="Enter city"
              value={formData.city}
              onChange={(event) => setFormData({ ...formData, city: event.currentTarget.value })}
              error={errors.city}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="State"
              placeholder="State"
              value={formData.state}
              onChange={(event) => setFormData({ ...formData, state: event.currentTarget.value })}
              error={errors.state}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="ZIP Code"
              placeholder="ZIP"
              value={formData.zipCode}
              onChange={(event) => setFormData({ ...formData, zipCode: event.currentTarget.value })}
              error={errors.zipCode}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.currentTarget.value })}
              error={errors.phone}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.currentTarget.value })}
              error={errors.email}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Website (Optional)"
          placeholder="Enter website URL"
          value={formData.website}
          onChange={(event) => setFormData({ ...formData, website: event.currentTarget.value })}
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="License Number"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={(event) => setFormData({ ...formData, licenseNumber: event.currentTarget.value })}
              error={errors.licenseNumber}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="NPI Number"
              placeholder="Enter NPI number"
              value={formData.npiNumber}
              onChange={(event) => setFormData({ ...formData, npiNumber: event.currentTarget.value })}
              error={errors.npiNumber}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Contact Person"
              placeholder="Enter primary contact person"
              value={formData.contactPerson}
              onChange={(event) => setFormData({ ...formData, contactPerson: event.currentTarget.value })}
              error={errors.contactPerson}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Delivery Available</Text>
              <Switch
                checked={formData.deliveryAvailable}
                onChange={(event) => setFormData({ ...formData, deliveryAvailable: event.currentTarget.checked })}
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update Pharmacy
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};