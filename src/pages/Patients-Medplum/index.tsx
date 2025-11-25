/**
 * Patients Page Component - Medplum Integration
 * Manages patient directory with search, filtering, and patient profiles using real FHIR data
 */

import { useState } from 'react';
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
  Table,
  Avatar,
  ActionIcon,
  Modal,
  Pagination,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Filter,
  AlertCircle,
  Users,
  CalendarDays,
  ClipboardList,
  UserCheck,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { usePatients, useAppointments } from '../../hooks/useQuery';
import { CreatePatientModal } from '../../components/CreatePatientModal';
import { EditPatientModal } from '../../components/EditPatientModal';

/**
 * Mock patient data for development when FHIR server is not available
 */
const getMockPatients = (params?: {
  search?: string;
  status?: string | null;
  page?: number;
  limit?: number;
}) => {
  const mockPatients = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-06-15',
      gender: 'male',
      phone: '+1-555-0123',
      email: 'john.doe@email.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
      },
      status: 'active',
      lastVisit: '2024-01-20T10:30:00Z',
      emergencyContact: 'Jane Doe - +1-555-0124',
      insurance: 'Blue Cross Blue Shield',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-03-22',
      gender: 'female',
      phone: '+1-555-0456',
      email: 'jane.smith@email.com',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
      },
      status: 'active',
      lastVisit: '2024-01-18T14:15:00Z',
      emergencyContact: 'Bob Smith - +1-555-0457',
      insurance: 'Aetna',
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      dateOfBirth: '1978-11-08',
      gender: 'male',
      phone: '+1-555-0789',
      email: 'michael.johnson@email.com',
      address: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
      },
      status: 'inactive',
      lastVisit: '2023-12-15T09:45:00Z',
      emergencyContact: 'Sarah Johnson - +1-555-0790',
      insurance: 'Cigna',
    },
  ];

  // Apply search filter
  let filteredPatients = mockPatients;
  if (params?.search) {
    const searchTerm = params.search.toLowerCase();
    filteredPatients = mockPatients.filter(patient =>
      patient.firstName.toLowerCase().includes(searchTerm) ||
      patient.lastName.toLowerCase().includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (params?.status) {
    filteredPatients = filteredPatients.filter(patient => patient.status === params.status);
  }

  // Apply pagination
  const limit = params?.limit || 12;
  const page = params?.page || 1;
  const startIndex = (page - 1) * limit;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + limit);

  return {
    data: paginatedPatients,
    total: filteredPatients.length,
  };
};



/**
 * Patient Card Component
 * Purpose: Render a single patient card with key info and actions.
 * Inputs: patient (FHIR-mapped patient object), onView(patient), onEdit(patient).
 * Outputs: Renders UI and triggers callbacks on action icon clicks.
 */
interface PatientCardProps {
  patient: any;
  onView: (patient: any) => void;
  onEdit: (patient: any) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onView, onEdit }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="lg" radius="xl" color="blue">
              {getInitials(patient.firstName || '', patient.lastName || '')}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="lg">
                {patient.firstName || ''} {patient.lastName || ''}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Age: {calculateAge(patient.dateOfBirth)}
                </Text>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  {patient.gender}
                </Text>
              </Group>
            </Stack>
          </Group>
          <Badge color={patient.status === 'active' ? 'green' : 'gray'}>
            {patient.status}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{patient.phone || 'No phone'}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{patient.email || 'No email'}</Text>
          </Group>
          <Group gap="xs">
            <MapPin size={14} />
            <Text size="sm">
              {typeof patient.address === 'object' && patient.address.city
                ? `${patient.address.city}, ${patient.address.state}`
                : 'No address'
              }
            </Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Last updated: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}</Text>
          </Group>
        </Stack>

        <Group justify="flex-end" gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => onView(patient)}
          >
            <Eye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            onClick={() => onEdit(patient)}
          >
            <Edit size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Patient Details Modal Component
 * Purpose: Show detailed patient info in a modal dialog.
 * Inputs: patient (selected patient or null), opened (boolean), onClose (function).
 * Outputs: Renders modal with details and product/subscription mock sections.
 */
interface PatientDetailsModalProps {
  patient: any | null;
  opened: boolean;
  onClose: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  opened,
  onClose,
}) => {
  if (!patient) return null;

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${patient.firstName || ''} ${patient.lastName || ''}`}
      size="lg"
    >
      <Stack gap="md">
        <Group>
          <Avatar size="xl" radius="xl" color="blue">
            {(patient.firstName || '').charAt(0)}{(patient.lastName || '').charAt(0)}
          </Avatar>
          <Stack gap={4}>
            <Title order={3}>
              {patient.firstName || ''} {patient.lastName || ''}
            </Title>
            <Group gap="xs">
              <Badge color={patient.status === 'active' ? 'green' : 'gray'}>
                {patient.status}
              </Badge>
              <Text size="sm" c="dimmed">
                ID: {patient.id}
              </Text>
            </Group>
          </Stack>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Personal Information</Text>
              <Text size="sm">
                <strong>Age:</strong> {calculateAge(patient.dateOfBirth)}
              </Text>
              <Text size="sm">
                <strong>Gender:</strong> {patient.gender}
              </Text>
              <Text size="sm">
                <strong>Date of Birth:</strong> {patient.dateOfBirth || 'Not provided'}
              </Text>
              <Text size="sm">
                <strong>FHIR ID:</strong> {patient.id}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Contact Information</Text>
              <Text size="sm">
                <strong>Phone:</strong> {patient.phone || 'Not provided'}
              </Text>
              <Text size="sm">
                <strong>Email:</strong> {patient.email || 'Not provided'}
              </Text>
              <Text size="sm">
                <strong>Address:</strong><br />
                {typeof patient.address === 'object' && patient.address.street ? (
                  <>
                    {patient.address.street}<br />
                    {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                  </>
                ) : (
                  'Not provided'
                )}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Stack gap="xs">
          <Text fw={500}>Products & Subscriptions</Text>
          {/* Mock subscription data for demonstration */}
          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Semaglutide (Ozempic) - Weekly</Text>
                <Badge color="green" size="sm">Active</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                <strong>Started:</strong> {new Date('2024-01-15').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Next Billing:</strong> {new Date('2024-02-15').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Monthly Cost:</strong> $299/month
              </Text>
            </Stack>
          </Card>

          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Monthly Consultation Plan</Text>
                <Badge color="blue" size="sm">Active</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                <strong>Started:</strong> {new Date('2024-01-10').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Next Billing:</strong> {new Date('2024-02-10').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Monthly Cost:</strong> $149/month
              </Text>
            </Stack>
          </Card>

          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Health Monitoring Package</Text>
                <Badge color="orange" size="sm">Paused</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                <strong>Started:</strong> {new Date('2023-12-01').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Paused Since:</strong> {new Date('2024-01-20').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Monthly Cost:</strong> $79/month
              </Text>
            </Stack>
          </Card>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit FHIR Patient</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * PatientsMedplumPage Component
 * Purpose: Provide a FHIR-backed patient directory UI that mirrors the mock Patients page layout
 *          including summary metric cards, single-row filters with clear button, cards/table views,
 *          modals for view/edit/create, pagination, and improved empty state.
 * Inputs: None (reads FHIR data via hooks and maintains local UI state).
 * Outputs: Renders patient management UI with search/filter/toggle and modals.
 */
const PatientsMedplumPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [editPatient, setEditPatient] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  const { data: patients, isLoading, error } = usePatients({
    search: searchQuery,
    status: statusFilter || undefined,
    page: currentPage,
    limit: 12,
  });

  // Additional data for summary metrics
  const { data: appointmentsData } = useAppointments();

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    openDetails();
  };

  const handleEditPatient = (patient: any) => {
    setEditPatient(patient);
    openEditModal();
  };

  const handleCreatePatient = () => {
    openCreateModal();
  };

  const filteredPatients = patients || [];
  const totalPages = Math.ceil((patients?.length || 0) / 12);

  // Summary metrics (mirroring mock Patients page card style)
  const allPatients = filteredPatients;
  const activePatients = allPatients.filter((p) => p.status === 'active').length;
  const now = new Date();
  const newPatientsThisMonth = allPatients.filter((p) => {
    const created = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt || Date.now());
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const visitsCompleted = (appointmentsData || []).filter((a: any) => a.status === 'completed').length;
  const visitsScheduled = (appointmentsData || []).filter((a: any) => a.status === 'scheduled').length;
  const totalVisits = visitsCompleted + visitsScheduled;
  const activeProviderIds = new Set((appointmentsData || []).map((a: any) => a.providerId));
  const activeProviders = activeProviderIds.size;

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <Container size="xl" py="md">
        <Alert icon={<AlertCircle size={16} />} title="FHIR Server Error" color="red">
          Error loading patients from Medplum FHIR server: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Patients</Title>
            <Text c="dimmed">Manage patient records and information</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={handleCreatePatient}>
            Add New Patient
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group align="center" gap="md">
                <ActionIcon size={40} radius="xl" variant="light" color="blue">
                  <Users size={20} />
                </ActionIcon>
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">Active Patients</Text>
                  <Title order={3}>{activePatients}</Title>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group align="center" gap="md">
                <ActionIcon size={40} radius="xl" variant="light" color="green">
                  <CalendarDays size={20} />
                </ActionIcon>
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">New Patients This Month</Text>
                  <Title order={3}>{newPatientsThisMonth}</Title>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group align="center" gap="md">
                <ActionIcon size={40} radius="xl" variant="light" color="violet">
                  <ClipboardList size={20} />
                </ActionIcon>
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">Total Visits</Text>
                  <Title order={3}>{totalVisits}</Title>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group align="center" gap="md">
                <ActionIcon size={40} radius="xl" variant="light" color="cyan">
                  <UserCheck size={20} />
                </ActionIcon>
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">Active Providers</Text>
                  <Title order={3}>{activeProviders}</Title>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters - Single Row (mirroring mock Patients layout) */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
              <TextInput
                placeholder="Search patients..."
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
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 12, md: 3 }}>
              <Group justify="flex-end">
                <Button variant="light" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Button.Group>
                  <Button
                    variant={viewMode === 'cards' ? 'filled' : 'light'}
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'filled' : 'light'}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                </Button.Group>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading patients...</Text>
            </Stack>
          </Center>
        )}

        {/* Patients Display */}
        {!isLoading && (
          <>
            {viewMode === 'cards' ? (
              <Grid>
                {filteredPatients.map((patient) => (
                  <Grid.Col key={patient.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <PatientCard
                      patient={patient}
                      onView={handleViewPatient}
                      onEdit={handleEditPatient}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Age</Table.Th>
                      <Table.Th>Phone</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Updated</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredPatients.map((patient) => (
                      <Table.Tr key={patient.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="sm" radius="xl" color="blue">
                              {(patient.firstName || '').charAt(0)}{(patient.lastName || '').charAt(0)}
                            </Avatar>
                            <Text size="sm" fw={500}>
                              {patient.firstName || ''} {patient.lastName || ''}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'Unknown'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.phone || 'Not provided'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.email || 'Not provided'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={patient.status === 'active' ? 'green' : 'gray'} size="sm">
                            {patient.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleViewPatient(patient)}
                            >
                              <Eye size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="orange"
                              size="sm"
                              onClick={() => handleEditPatient(patient)}
                            >
                              <Edit size={14} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                />
              </Group>
            )}

            {/* Empty State */}
            {filteredPatients.length === 0 && !isLoading && (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <User size={48} color="gray" />
                  <Text size="lg" c="dimmed">
                    No patients found
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {searchQuery || statusFilter
                      ? 'Try adjusting your search criteria'
                      : 'Get started by adding your first patient'}
                  </Text>
                  <Button leftSection={<Plus size={16} />} onClick={handleCreatePatient}>
                    Add New Patient
                  </Button>
                </Stack>
              </Center>
            )}
          </>
        )}
      </Stack>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        patient={selectedPatient}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Patient Modal */}
      <CreatePatientModal
        opened={createModalOpened}
        onClose={closeCreateModal}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        opened={editModalOpened}
        onClose={closeEditModal}
        patient={editPatient}
      />
    </Container>
  );
};

export default PatientsMedplumPage;