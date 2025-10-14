/**
 * Providers Page Component
 * Manages healthcare providers, their profiles, schedules, and availability
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
  Switch,
  Divider,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Building,
  Filter,
  UserCheck,
  Users,
  Stethoscope,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { Provider, ProviderAvailability } from '../types';

/**
 * Mock data for healthcare providers
 */
const mockProviders: Provider[] = [
  {
    id: 'PROV-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@clinic.com',
    phone: '(555) 123-4567',
    specialties: ['Internal Medicine', 'Cardiology'],
    licenseNumber: 'MD123456',
    npiNumber: '1234567890',
    status: 'active',
    department: 'Internal Medicine',
    title: 'Senior Physician',
    bio: 'Dr. Smith has over 15 years of experience in internal medicine and cardiology. He specializes in preventive care and chronic disease management.',
    education: ['MD - Harvard Medical School', 'Residency - Johns Hopkins'],
    certifications: ['Board Certified Internal Medicine', 'Board Certified Cardiology'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    totalPatients: 245,
    yearsExperience: 15,
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'thursday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'friday',
        startTime: '09:00',
        endTime: '15:00',
        isAvailable: true,
      },
    ],
  },
  {
    id: 'PROV-002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@clinic.com',
    phone: '(555) 234-5678',
    specialties: ['Pediatrics', 'Family Medicine'],
    licenseNumber: 'MD234567',
    npiNumber: '2345678901',
    status: 'active',
    department: 'Pediatrics',
    title: 'Pediatrician',
    bio: 'Dr. Johnson is a dedicated pediatrician with a passion for child healthcare and development. She has extensive experience in treating children from infancy through adolescence.',
    education: ['MD - Stanford Medical School', 'Residency - UCSF'],
    certifications: ['Board Certified Pediatrics', 'Board Certified Family Medicine'],
    languages: ['English', 'French'],
    rating: 4.9,
    totalPatients: 180,
    yearsExperience: 12,
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'thursday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'friday',
        startTime: '08:00',
        endTime: '14:00',
        isAvailable: true,
      },
    ],
  },
  {
    id: 'PROV-003',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@clinic.com',
    phone: '(555) 345-6789',
    specialties: ['Orthopedics', 'Sports Medicine'],
    licenseNumber: 'MD345678',
    npiNumber: '3456789012',
    status: 'active',
    department: 'Orthopedics',
    title: 'Orthopedic Surgeon',
    bio: 'Dr. Chen is an experienced orthopedic surgeon specializing in sports injuries and joint replacement. He has worked with professional athletes and weekend warriors alike.',
    education: ['MD - UCLA Medical School', 'Fellowship - Mayo Clinic'],
    certifications: ['Board Certified Orthopedic Surgery', 'Sports Medicine Certificate'],
    languages: ['English', 'Mandarin'],
    rating: 4.7,
    totalPatients: 320,
    yearsExperience: 18,
    availability: [
      {
        dayOfWeek: 'tuesday',
        startTime: '07:00',
        endTime: '18:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '07:00',
        endTime: '18:00',
        isAvailable: true,
      },
      {
        dayOfWeek: 'thursday',
        startTime: '07:00',
        endTime: '18:00',
        isAvailable: true,
      },
    ],
  },
];

/**
 * Provider Card Component
 */
interface ProviderCardProps {
  provider: Provider;
  onView: (provider: Provider) => void;
  onEdit: (provider: Provider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onView, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'on_leave':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="lg" radius="md" color="blue">
              <User size={24} />
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="lg">
                Dr. {provider.firstName} {provider.lastName}
              </Text>
              <Text size="sm" c="dimmed">
                {provider.title} • {provider.department}
              </Text>
              <Group gap="xs">
                <Star size={14} fill="gold" color="gold" />
                <Text size="sm" fw={500}>
                  {provider.rating}
                </Text>
                <Text size="sm" c="dimmed">
                  ({provider.totalPatients} patients)
                </Text>
              </Group>
            </Stack>
          </Group>
          <Badge color={getStatusColor(provider.status)}>
            {provider.status}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Stethoscope size={14} />
            <Text size="sm">
              {provider.specialties.join(', ')}
            </Text>
          </Group>
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{provider.phone}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{provider.email}</Text>
          </Group>
          <Group gap="xs">
            <Award size={14} />
            <Text size="sm">{provider.yearsExperience} years experience</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {provider.languages.slice(0, 2).map((lang) => (
              <Badge key={lang} size="sm" variant="light">
                {lang}
              </Badge>
            ))}
            {provider.languages.length > 2 && (
              <Badge size="sm" variant="light">
                +{provider.languages.length - 2}
              </Badge>
            )}
          </Group>
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
 * Provider Details Modal
 */
interface ProviderDetailsModalProps {
  provider: Provider | null;
  opened: boolean;
  onClose: () => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  provider,
  opened,
  onClose,
}) => {
  if (!provider) return null;

  const formatAvailability = (availability: ProviderAvailability[]) => {
    return availability
      .filter(slot => slot.isAvailable)
      .map(slot => `${slot.dayOfWeek}: ${slot.startTime} - ${slot.endTime}`)
      .join(', ');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Dr. ${provider.firstName} ${provider.lastName}`}
      size="xl"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="xl" radius="md" color="blue">
              <User size={32} />
            </Avatar>
            <Stack gap={4}>
              <Title order={3}>
                Dr. {provider.firstName} {provider.lastName}
              </Title>
              <Text c="dimmed">{provider.title}</Text>
              <Group gap="xs">
                <Star size={16} fill="gold" color="gold" />
                <Text fw={500}>{provider.rating}</Text>
                <Text c="dimmed">• {provider.totalPatients} patients</Text>
              </Group>
            </Stack>
          </Group>
          <Badge size="lg" color={provider.status === 'active' ? 'green' : 'red'}>
            {provider.status}
          </Badge>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="credentials">Credentials</Tabs.Tab>
            <Tabs.Tab value="availability">Availability</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">Biography</Text>
                <Text size="sm">{provider.bio}</Text>
              </div>

              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Contact Information</Text>
                    <Text size="sm">
                      <strong>Email:</strong> {provider.email}
                    </Text>
                    <Text size="sm">
                      <strong>Phone:</strong> {provider.phone}
                    </Text>
                    <Text size="sm">
                      <strong>Department:</strong> {provider.department}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Professional Details</Text>
                    <Text size="sm">
                      <strong>Specialties:</strong> {provider.specialties.join(', ')}
                    </Text>
                    <Text size="sm">
                      <strong>Experience:</strong> {provider.yearsExperience} years
                    </Text>
                    <Text size="sm">
                      <strong>Languages:</strong> {provider.languages.join(', ')}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="credentials" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">License Information</Text>
                <Text size="sm">
                  <strong>License Number:</strong> {provider.licenseNumber}
                </Text>
                <Text size="sm">
                  <strong>NPI Number:</strong> {provider.npiNumber}
                </Text>
              </div>

              <div>
                <Text fw={500} mb="xs">Education</Text>
                <Stack gap="xs">
                  {provider.education.map((edu, index) => (
                    <Text key={index} size="sm">• {edu}</Text>
                  ))}
                </Stack>
              </div>

              <div>
                <Text fw={500} mb="xs">Certifications</Text>
                <Stack gap="xs">
                  {provider.certifications.map((cert, index) => (
                    <Text key={index} size="sm">• {cert}</Text>
                  ))}
                </Stack>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="availability" pt="md">
            <Stack gap="md">
              <Text fw={500}>Weekly Schedule</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Day</Table.Th>
                    <Table.Th>Available</Table.Th>
                    <Table.Th>Start Time</Table.Th>
                    <Table.Th>End Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const availability = provider.availability.find(a => a.dayOfWeek === day);
                    return (
                      <Table.Tr key={day}>
                        <Table.Td style={{ textTransform: 'capitalize' }}>{day}</Table.Td>
                        <Table.Td>
                          <Badge color={availability?.isAvailable ? 'green' : 'red'} size="sm">
                            {availability?.isAvailable ? 'Available' : 'Not Available'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{availability?.startTime || '-'}</Table.Td>
                        <Table.Td>{availability?.endTime || '-'}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Provider</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Create Provider Modal
 */
interface CreateProviderModalProps {
  opened: boolean;
  onClose: () => void;
}

const CreateProviderModal: React.FC<CreateProviderModalProps> = ({ opened, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialties: [],
    licenseNumber: '',
    npiNumber: '',
    department: '',
    title: '',
    bio: '',
    languages: [],
  });

  const handleSubmit = () => {
    // TODO: Implement provider creation
    console.log('Create provider:', formData);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Provider"
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(event) => setFormData({ ...formData, firstName: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(event) => setFormData({ ...formData, lastName: event.currentTarget.value })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.currentTarget.value })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Department"
              placeholder="Select department"
              data={[
                { value: 'internal_medicine', label: 'Internal Medicine' },
                { value: 'pediatrics', label: 'Pediatrics' },
                { value: 'cardiology', label: 'Cardiology' },
                { value: 'orthopedics', label: 'Orthopedics' },
                { value: 'dermatology', label: 'Dermatology' },
                { value: 'neurology', label: 'Neurology' },
              ]}
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value || '' })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Title"
              placeholder="Enter job title"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.currentTarget.value })}
              required
            />
          </Grid.Col>
        </Grid>

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

        <Textarea
          label="Biography"
          placeholder="Enter provider biography"
          value={formData.bio}
          onChange={(event) => setFormData({ ...formData, bio: event.currentTarget.value })}
          minRows={3}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Provider
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Providers Page Component
 */
export const ProvidersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // Using mock data for now
  const providers = mockProviders;
  const isLoading = false;

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    openDetails();
  };

  const handleEditProvider = (provider: Provider) => {
    // TODO: Implement edit functionality
    console.log('Edit provider:', provider);
  };

  const filteredProviders = providers
    .filter(provider =>
      `${provider.firstName} ${provider.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(provider => !statusFilter || provider.status === statusFilter)
    .filter(provider => !departmentFilter || provider.department === departmentFilter);

  // Calculate summary statistics
  const activeProviders = providers.filter(p => p.status === 'active').length;
  const totalPatients = providers.reduce((sum, p) => sum + p.totalPatients, 0);
  const avgRating = providers.reduce((sum, p) => sum + p.rating, 0) / providers.length;
  const departments = [...new Set(providers.map(p => p.department))].length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Healthcare Providers</Title>
            <Text c="dimmed">Manage provider profiles, schedules, and credentials</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Provider
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Providers
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <UserCheck size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activeProviders}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Patients
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <Users size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {totalPatients}
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
                  Departments
                </Text>
                <ActionIcon variant="light" color="indigo" size="lg">
                  <Building size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="indigo">
                {departments}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search providers..."
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
                  { value: 'on_leave', label: 'On Leave' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by department"
                leftSection={<Building size={16} />}
                data={[
                  { value: 'Internal Medicine', label: 'Internal Medicine' },
                  { value: 'Pediatrics', label: 'Pediatrics' },
                  { value: 'Cardiology', label: 'Cardiology' },
                  { value: 'Orthopedics', label: 'Orthopedics' },
                ]}
                value={departmentFilter}
                onChange={setDepartmentFilter}
                clearable
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Providers Grid */}
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : (
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
        )}

        {/* Empty State */}
        {!isLoading && filteredProviders.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <User size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No providers found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || statusFilter || departmentFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first healthcare provider'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                Add Provider
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        provider={selectedProvider}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Provider Modal */}
      <CreateProviderModal
        opened={createOpened}
        onClose={closeCreate}
      />
    </Container>
  );
};