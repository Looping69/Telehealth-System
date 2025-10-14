/**
 * Pharmacies Page Component
 * Manages pharmacy partners, locations, and prescription fulfillment
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
  Switch,
  Divider,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building,
  Star,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Filter,
  Globe,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';

/**
 * Pharmacy interface
 */
interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  type: 'retail' | 'hospital' | 'mail_order' | 'specialty';
  licenseNumber: string;
  npiNumber: string;
  hours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  services: string[];
  rating: number;
  totalPrescriptions: number;
  averageFillTime: number; // in minutes
  acceptsInsurance: string[];
  deliveryAvailable: boolean;
  contactPerson: string;
  contractStartDate: string;
  contractEndDate: string;
}

/**
 * Mock data for pharmacies
 */
const mockPharmacies: Pharmacy[] = [
  {
    id: 'PHARM-001',
    name: 'MediCare Pharmacy',
    address: '123 Main Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    phone: '(312) 555-0123',
    email: 'info@medicare-pharmacy.com',
    website: 'https://www.medicare-pharmacy.com',
    status: 'active',
    type: 'retail',
    licenseNumber: 'IL-PHARM-001',
    npiNumber: '1234567890',
    hours: {
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '08:00', close: '20:00', isOpen: true },
      saturday: { open: '09:00', close: '18:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: true },
    },
    services: ['Prescription Filling', 'Vaccinations', 'Health Screenings', 'Medication Counseling'],
    rating: 4.5,
    totalPrescriptions: 1250,
    averageFillTime: 15,
    acceptsInsurance: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare'],
    deliveryAvailable: true,
    contactPerson: 'John Smith, PharmD',
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
  },
  {
    id: 'PHARM-002',
    name: 'HealthPlus Pharmacy',
    address: '456 Oak Avenue',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60602',
    phone: '(312) 555-0456',
    email: 'contact@healthplus-rx.com',
    website: 'https://www.healthplus-rx.com',
    status: 'active',
    type: 'retail',
    licenseNumber: 'IL-PHARM-002',
    npiNumber: '2345678901',
    hours: {
      monday: { open: '07:00', close: '22:00', isOpen: true },
      tuesday: { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday: { open: '07:00', close: '22:00', isOpen: true },
      friday: { open: '07:00', close: '22:00', isOpen: true },
      saturday: { open: '08:00', close: '20:00', isOpen: true },
      sunday: { open: '09:00', close: '18:00', isOpen: true },
    },
    services: ['Prescription Filling', 'Compounding', 'Medication Therapy Management', 'Delivery'],
    rating: 4.8,
    totalPrescriptions: 980,
    averageFillTime: 12,
    acceptsInsurance: ['Blue Cross Blue Shield', 'Cigna', 'Humana', 'Medicare', 'Medicaid'],
    deliveryAvailable: true,
    contactPerson: 'Sarah Johnson, PharmD',
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
  },
  {
    id: 'PHARM-003',
    name: 'Express Mail Pharmacy',
    address: '789 Business Park Drive',
    city: 'Schaumburg',
    state: 'IL',
    zipCode: '60173',
    phone: '(847) 555-0789',
    email: 'orders@express-mail-rx.com',
    website: 'https://www.express-mail-rx.com',
    status: 'active',
    type: 'mail_order',
    licenseNumber: 'IL-PHARM-003',
    npiNumber: '3456789012',
    hours: {
      monday: { open: '06:00', close: '18:00', isOpen: true },
      tuesday: { open: '06:00', close: '18:00', isOpen: true },
      wednesday: { open: '06:00', close: '18:00', isOpen: true },
      thursday: { open: '06:00', close: '18:00', isOpen: true },
      friday: { open: '06:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '14:00', isOpen: true },
      sunday: { open: '', close: '', isOpen: false },
    },
    services: ['Mail Order Prescriptions', '90-Day Supplies', 'Specialty Medications', 'Auto Refill'],
    rating: 4.3,
    totalPrescriptions: 2100,
    averageFillTime: 1440, // 24 hours for mail order
    acceptsInsurance: ['All Major Insurance Plans'],
    deliveryAvailable: true,
    contactPerson: 'Michael Chen, PharmD',
    contractStartDate: '2024-01-01',
    contractEndDate: '2025-12-31',
  },
];

/**
 * Pharmacy Card Component
 */
interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onView: (pharmacy: Pharmacy) => void;
  onEdit: (pharmacy: Pharmacy) => void;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onView, onEdit }) => {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retail':
        return 'blue';
      case 'hospital':
        return 'green';
      case 'mail_order':
        return 'orange';
      case 'specialty':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatFillTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      return `${Math.round(minutes / 60)} hrs`;
    } else {
      return `${Math.round(minutes / 1440)} days`;
    }
  };

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
                {pharmacy.name}
              </Text>
              <Text size="sm" c="dimmed">
                {pharmacy.id} • {pharmacy.type}
              </Text>
              <Group gap="xs">
                <Star size={14} fill="gold" color="gold" />
                <Text size="sm" fw={500}>
                  {pharmacy.rating}
                </Text>
                <Text size="sm" c="dimmed">
                  ({pharmacy.totalPrescriptions} prescriptions)
                </Text>
              </Group>
            </Stack>
          </Group>
          <Group>
            <Badge color={getStatusColor(pharmacy.status)}>
              {pharmacy.status}
            </Badge>
            <Badge color={getTypeColor(pharmacy.type)}>
              {pharmacy.type}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <MapPin size={14} />
            <Text size="sm" lineClamp={2}>
              {pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}
            </Text>
          </Group>
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{pharmacy.phone}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{pharmacy.email}</Text>
          </Group>
          <Group gap="xs">
            <Clock size={14} />
            <Text size="sm">Avg fill time: {formatFillTime(pharmacy.averageFillTime)}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {pharmacy.deliveryAvailable && (
              <Badge size="sm" color="green" leftSection={<Truck size={12} />}>
                Delivery
              </Badge>
            )}
            <Badge size="sm" variant="light">
              {pharmacy.services.length} services
            </Badge>
          </Group>
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
 * Pharmacy Details Modal
 */
interface PharmacyDetailsModalProps {
  pharmacy: Pharmacy | null;
  opened: boolean;
  onClose: () => void;
}

const PharmacyDetailsModal: React.FC<PharmacyDetailsModalProps> = ({
  pharmacy,
  opened,
  onClose,
}) => {
  if (!pharmacy) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={pharmacy.name}
      size="xl"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="xl" radius="md" color="blue">
              <Building size={32} />
            </Avatar>
            <Stack gap={4}>
              <Title order={3}>{pharmacy.name}</Title>
              <Text c="dimmed">{pharmacy.type} pharmacy</Text>
              <Group gap="xs">
                <Star size={16} fill="gold" color="gold" />
                <Text fw={500}>{pharmacy.rating}</Text>
                <Text c="dimmed">• {pharmacy.totalPrescriptions} prescriptions</Text>
              </Group>
            </Stack>
          </Group>
          <Group>
            <Badge size="lg" color={pharmacy.status === 'active' ? 'green' : 'red'}>
              {pharmacy.status}
            </Badge>
          </Group>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="hours">Hours & Services</Tabs.Tab>
            <Tabs.Tab value="insurance">Insurance</Tabs.Tab>
            <Tabs.Tab value="contract">Contract</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Contact Information</Text>
                    <Text size="sm">
                      <strong>Address:</strong><br />
                      {pharmacy.address}<br />
                      {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}
                    </Text>
                    <Text size="sm">
                      <strong>Phone:</strong> {pharmacy.phone}
                    </Text>
                    <Text size="sm">
                      <strong>Email:</strong> {pharmacy.email}
                    </Text>
                    {pharmacy.website && (
                      <Text size="sm">
                        <strong>Website:</strong>{' '}
                        <a href={pharmacy.website} target="_blank" rel="noopener noreferrer">
                          {pharmacy.website}
                        </a>
                      </Text>
                    )}
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Pharmacy Details</Text>
                    <Text size="sm">
                      <strong>License Number:</strong> {pharmacy.licenseNumber}
                    </Text>
                    <Text size="sm">
                      <strong>NPI Number:</strong> {pharmacy.npiNumber}
                    </Text>
                    <Text size="sm">
                      <strong>Contact Person:</strong> {pharmacy.contactPerson}
                    </Text>
                    <Text size="sm">
                      <strong>Average Fill Time:</strong>{' '}
                      {pharmacy.averageFillTime < 60
                        ? `${pharmacy.averageFillTime} minutes`
                        : `${Math.round(pharmacy.averageFillTime / 60)} hours`}
                    </Text>
                    <Group gap="xs" align="center">
                      <Text size="sm">
                        <strong>Delivery Available:</strong>
                      </Text>
                      {pharmacy.deliveryAvailable ? (
                        <CheckCircle size={16} color="green" />
                      ) : (
                        <XCircle size={16} color="red" />
                      )}
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="hours" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">Operating Hours</Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Day</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Hours</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.entries(pharmacy.hours).map(([day, hours]) => (
                      <Table.Tr key={day}>
                        <Table.Td style={{ textTransform: 'capitalize' }}>{day}</Table.Td>
                        <Table.Td>
                          <Badge color={hours.isOpen ? 'green' : 'red'} size="sm">
                            {hours.isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {hours.isOpen ? `${hours.open} - ${hours.close}` : '-'}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>

              <div>
                <Text fw={500} mb="xs">Services Offered</Text>
                <Grid>
                  {pharmacy.services.map((service, index) => (
                    <Grid.Col key={index} span={6}>
                      <Group gap="xs">
                        <Package size={14} />
                        <Text size="sm">{service}</Text>
                      </Group>
                    </Grid.Col>
                  ))}
                </Grid>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="insurance" pt="md">
            <Stack gap="md">
              <Text fw={500}>Accepted Insurance Plans</Text>
              <Grid>
                {pharmacy.acceptsInsurance.map((insurance, index) => (
                  <Grid.Col key={index} span={6}>
                    <Group gap="xs">
                      <CheckCircle size={14} color="green" />
                      <Text size="sm">{insurance}</Text>
                    </Group>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="contract" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Contract Information</Text>
                    <Text size="sm">
                      <strong>Start Date:</strong> {pharmacy.contractStartDate}
                    </Text>
                    <Text size="sm">
                      <strong>End Date:</strong> {pharmacy.contractEndDate}
                    </Text>
                    <Text size="sm">
                      <strong>Contact Person:</strong> {pharmacy.contactPerson}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Performance Metrics</Text>
                    <Text size="sm">
                      <strong>Total Prescriptions:</strong> {pharmacy.totalPrescriptions}
                    </Text>
                    <Text size="sm">
                      <strong>Customer Rating:</strong> {pharmacy.rating}/5.0
                    </Text>
                    <Text size="sm">
                      <strong>Average Fill Time:</strong>{' '}
                      {pharmacy.averageFillTime < 60
                        ? `${pharmacy.averageFillTime} minutes`
                        : `${Math.round(pharmacy.averageFillTime / 60)} hours`}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Pharmacy</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Create Pharmacy Modal
 */
interface CreatePharmacyModalProps {
  opened: boolean;
  onClose: () => void;
}

const CreatePharmacyModal: React.FC<CreatePharmacyModalProps> = ({ opened, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    type: 'retail',
    licenseNumber: '',
    npiNumber: '',
    contactPerson: '',
    deliveryAvailable: false,
  });

  const handleSubmit = () => {
    // TODO: Implement pharmacy creation
    console.log('Create pharmacy:', formData);
    onClose();
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
          required
        />

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.currentTarget.value })}
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
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="State"
              placeholder="State"
              value={formData.state}
              onChange={(event) => setFormData({ ...formData, state: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="ZIP Code"
              placeholder="ZIP"
              value={formData.zipCode}
              onChange={(event) => setFormData({ ...formData, zipCode: event.currentTarget.value })}
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
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.currentTarget.value })}
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
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="NPI Number"
              placeholder="Enter NPI number"
              value={formData.npiNumber}
              onChange={(event) => setFormData({ ...formData, npiNumber: event.currentTarget.value })}
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
 * Main Pharmacies Page Component
 */
export const PharmaciesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Using mock data for now
  const pharmacies = mockPharmacies;
  const isLoading = false;

  const handleViewPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    openDetails();
  };

  const handleEditPharmacy = (pharmacy: Pharmacy) => {
    // TODO: Implement edit functionality
    console.log('Edit pharmacy:', pharmacy);
  };

  const filteredPharmacies = pharmacies
    .filter(pharmacy =>
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(pharmacy => !statusFilter || pharmacy.status === statusFilter)
    .filter(pharmacy => !typeFilter || pharmacy.type === typeFilter);

  // Calculate summary statistics
  const activePharmacies = pharmacies.filter(p => p.status === 'active').length;
  const totalPrescriptions = pharmacies.reduce((sum, p) => sum + p.totalPrescriptions, 0);
  const avgRating = pharmacies.reduce((sum, p) => sum + p.rating, 0) / pharmacies.length;
  const deliveryPharmacies = pharmacies.filter(p => p.deliveryAvailable).length;

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
                  { value: 'pending', label: 'Pending' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
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
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredPharmacies.map((pharmacy) => (
              <Grid.Col key={pharmacy.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <PharmacyCard
                  pharmacy={pharmacy}
                  onView={handleViewPharmacy}
                  onEdit={handleEditPharmacy}
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
                  <PharmacyTableRow
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    onView={handleViewPharmacy}
                    onEdit={handleEditPharmacy}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredPharmacies.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Building size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No pharmacies found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || statusFilter || typeFilter
                  ? 'Try adjusting your search criteria'
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
      <PharmacyDetailsModal
        pharmacy={selectedPharmacy}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Pharmacy Modal */}
      <CreatePharmacyModal
        opened={createOpened}
        onClose={closeCreate}
      />
    </Container>
  );
};

/**
 * Pharmacy Table Row Component
 */
interface PharmacyTableRowProps {
  pharmacy: Pharmacy;
  onView: (pharmacy: Pharmacy) => void;
  onEdit: (pharmacy: Pharmacy) => void;
}

const PharmacyTableRow: React.FC<PharmacyTableRowProps> = ({ pharmacy, onView, onEdit }) => {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retail':
        return 'blue';
      case 'hospital':
        return 'green';
      case 'mail_order':
        return 'orange';
      case 'specialty':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatFillTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      return `${Math.round(minutes / 60)} hrs`;
    } else {
      return `${Math.round(minutes / 1440)} days`;
    }
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" radius="md" color="blue">
            <Building size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text fw={500} size="sm">
              {pharmacy.name}
            </Text>
            <Text size="xs" c="dimmed">
              {pharmacy.id}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={getTypeColor(pharmacy.type)} size="sm">
          {pharmacy.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {pharmacy.address}, {pharmacy.city}, {pharmacy.state}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{pharmacy.phone}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(pharmacy.status)} size="sm">
          {pharmacy.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Star size={12} fill="gold" color="gold" />
          <Text size="sm" fw={500}>
            {pharmacy.rating}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatFillTime(pharmacy.averageFillTime)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {pharmacy.deliveryAvailable && (
            <Badge size="xs" color="green" leftSection={<Truck size={10} />}>
              Delivery
            </Badge>
          )}
          <Badge size="xs" variant="light">
            {pharmacy.services.length} services
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(pharmacy)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => onEdit(pharmacy)}
          >
            <Edit size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};