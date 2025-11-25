/**
 * Sessions Page Component
 * Manages appointments and telehealth sessions
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
  Tabs,
  Avatar,
  Divider,
  Center,
  Loader,
  Table,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import {
  Search,
  Plus,
  Video,
  Phone,
  Clock,
  User,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Edit,
  LayoutGrid,
  Rows,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
// Use Medplum-backed appointments hook
import { useAppointments } from '../../hooks/useQuery';
import { Appointment } from '../../types';
import CreateAppointmentModal from '../../components/CreateAppointmentModal';
import EditAppointmentModal from '../../components/EditAppointmentModal';

/**
 * Appointment Card Component
 */
interface AppointmentCardProps {
  appointment: Appointment;
  onView: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onJoin?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onView,
  onEdit,
  onJoin,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'in_progress':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'phone':
        return <Phone size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const isUpcoming = () => {
    const now = new Date();
    return appointment.date > now && appointment.status !== 'cancelled';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="md" radius="xl" color="blue">
              {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500}>{appointment.patientName || 'Unknown Patient'}</Text>
              <Group gap="xs">
                <Clock size={14} />
                <Text size="sm" c="dimmed">
                  {appointment.date.toLocaleDateString()} at {appointment.date.toLocaleTimeString()}
                </Text>
              </Group>
            </Stack>
          </Group>
          <Badge color={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </Group>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {getTypeIcon(appointment.type)}
            <Text size="sm" c="dimmed">
              {appointment.type} • {appointment.duration} min
            </Text>
          </Group>
          <Text size="sm" fw={500}>
            {appointment.providerName || 'Unknown Provider'}
          </Text>
        </Group>

        {appointment.notes && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {appointment.notes}
          </Text>
        )}

        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(appointment)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(appointment)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
          {isUpcoming() && onJoin && (
            <Button
              size="xs"
              leftSection={<Video size={14} />}
              onClick={() => onJoin(appointment)}
            >
              Join Session
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Appointment Details Modal
 * Purpose: Show comprehensive appointment details in a modal for review.
 * Inputs: `appointment` (Appointment | null), `opened` (boolean), `onClose` (fn)
 * Outputs: Mantine Modal with details and close/edit actions.
 */
interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  opened: boolean;
  onClose: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  opened,
  onClose,
}) => {
  if (!appointment) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Appointment Details"
      size="lg"
    >
      <Stack gap="md">
        <Group>
          <Avatar size="xl" radius="xl" color="blue">
            {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
          </Avatar>
          <Stack gap={4}>
            <Title order={3}>{appointment.patientName || 'Unknown Patient'}</Title>
            <Badge color={appointment.status === 'scheduled' ? 'green' : 'yellow'}>
              {appointment.status}
            </Badge>
          </Stack>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Appointment Information</Text>
              <Text size="sm">
                <strong>Date:</strong> {appointment.date.toLocaleDateString()}
              </Text>
              <Text size="sm">
                <strong>Time:</strong> {appointment.date.toLocaleTimeString()}
              </Text>
              <Text size="sm">
                <strong>Duration:</strong> {appointment.duration || 30} minutes
              </Text>
              <Text size="sm">
                <strong>Type:</strong> {appointment.type}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Provider Information</Text>
              <Text size="sm">
                <strong>Provider:</strong> {appointment.providerName || 'Unknown Provider'}
              </Text>
              <Text size="sm">
                <strong>Type:</strong> {appointment.type}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        {appointment.notes && (
          <Stack gap="xs">
            <Text fw={500}>Notes</Text>
            <Text size="sm">{appointment.notes}</Text>
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Appointment</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Sessions Page Component
 */
/**
 * SessionsPage
 * Renders telehealth sessions management UI with summary metrics, filters, tabs, and views.
 *
 * Inputs: None (data loaded via `useAppointments` hook)
 * Outputs: JSX UI for managing appointments (cards/table views, modals)
 */
/**
 * SessionsPage
 * Purpose: Render telehealth sessions management UI with summary metrics, filters, tabs, and views.
 * Inputs: None (data loaded via `useAppointments`)
 * Outputs: Page UI and modals for create/edit/view.
 */
export const SessionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  /**
   * useAppointments hook (Medplum-backed)
   * Purpose: Fetch appointments from Medplum FHIR server.
   * Inputs: None
   * Outputs: `appointments` (Appointment[]), `isLoading`, `error`
   */
  const { data: appointments, isLoading, error } = useAppointments();

  /**
   * handleViewAppointment
   * Purpose: Open details modal with selected appointment.
   * Inputs: `appointment` (Appointment)
   * Outputs: None
   */
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openDetails();
  };

  /**
   * handleEditAppointment
   * Purpose: Open edit modal with selected appointment.
   * Inputs: `appointment` (Appointment)
   * Outputs: None
   */
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openEditModal();
  };

  /**
   * handleJoinSession
   * Purpose: Placeholder to join video/phone session.
   * Inputs: `appointment` (Appointment)
   * Outputs: None
   */
  const handleJoinSession = (appointment: Appointment) => {
    // TODO: Implement video session joining
    console.log('Join session:', appointment);
  };

  /**
   * handleClearFilters
   * Resets search and status filters; keeps current tab and view mode.
   *
   * Inputs: None
   * Outputs: None (updates filter-related state)
   */
  /**
   * handleClearFilters
   * Purpose: Reset search and status filters.
   * Inputs: None
   * Outputs: None
   */
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
  };

  // Filter appointments based on search query and status filter
  /**
   * filteredAppointments
   * Purpose: Derive list of appointments filtered by search query and status.
   * Inputs: `appointments`, `searchQuery`, `statusFilter`
   * Outputs: Filtered Appointment[] used by tabs and views
   */
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    let filtered = [...appointments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(query) ||
        apt.providerName?.toLowerCase().includes(query) ||
        apt.type?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    return filtered;
  }, [appointments, searchQuery, statusFilter]);

  /**
   * filterAppointmentsByTab
   * Purpose: Slice appointments by logical tab group (upcoming/today/past/cancelled).
   * Inputs: `appointments` (Appointment[]), `tab` (string)
   * Outputs: Appointment[] for the specified tab
   */
  const filterAppointmentsByTab = (appointments: Appointment[], tab: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (tab) {
      case 'upcoming':
        return appointments.filter(apt =>
          apt?.date && apt.date > now && apt.status !== 'cancelled'
        );
      case 'today':
        return appointments.filter(apt => {
          const aptDateString = apt?.date ? apt.date.toISOString().split('T')[0] : null;
          return apt?.date && aptDateString === today;
        });
      case 'past':
        return appointments.filter(apt =>
          apt?.date && (apt.date < now || apt.status === 'completed')
        );
      case 'cancelled':
        return appointments.filter(apt => apt?.status === 'cancelled');
      default:
        return appointments;
    }
  };

  const upcomingAppointments = filteredAppointments ? filterAppointmentsByTab(filteredAppointments, 'upcoming') : [];
  const todayAppointments = filteredAppointments ? filterAppointmentsByTab(filteredAppointments, 'today') : [];
  const pastAppointments = filteredAppointments ? filterAppointmentsByTab(filteredAppointments, 'past') : [];
  const cancelledAppointments = filteredAppointments ? filterAppointmentsByTab(filteredAppointments, 'cancelled') : [];
  const completedAppointments = filteredAppointments ? filteredAppointments.filter(apt => apt.status === 'completed') : [];

  if (error) {
    return (
      <Container size="xl" py="md">
        <Alert title="Unable to load appointments" color="red" variant="light">
          {error?.message || 'Failed to fetch appointments. Please check your connection and try again.'}
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
            <Title order={2}>Sessions & Appointments</Title>
            <Text c="dimmed">Manage patient appointments and telehealth sessions</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
            Schedule Appointment
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Upcoming Appointments
                </Text>
                <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                  <Clock size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {upcomingAppointments.length}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Scheduled sessions
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Today's Appointments
                </Text>
                <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                  <CalendarIcon size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="teal">
                {todayAppointments.length}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Sessions today
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Completed Sessions
                </Text>
                <ThemeIcon variant="light" color="green" size="lg" radius="md">
                  <CheckCircle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="green">
                {completedAppointments.length}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Finished sessions
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Cancelled Appointments
                </Text>
                <ThemeIcon variant="light" color="red" size="lg" radius="md">
                  <XCircle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="red">
                {cancelledAppointments.length}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Cancelled sessions
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Enhanced Filters and Search */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <Group align="center" gap="sm" wrap="wrap">
              <TextInput
                placeholder="Search appointments..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                w={{ base: '100%', sm: 280 }}
              />
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                w={{ base: '100%', sm: 220 }}
              />
            </Group>
            <Group align="center" gap="sm">
              <Group gap="xs">
                <ActionIcon
                  variant={viewMode === 'cards' ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => setViewMode('cards')}
                  aria-label="Cards view"
                >
                  <LayoutGrid size={18} />
                </ActionIcon>
                <ActionIcon
                  variant={viewMode === 'table' ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                >
                  <Rows size={18} />
                </ActionIcon>
              </Group>
              <Button variant="light" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Group>
          </Group>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="upcoming" leftSection={<Clock size={16} />}>
              Upcoming
            </Tabs.Tab>
            <Tabs.Tab value="today" leftSection={<CalendarIcon size={16} />}>
              Today
            </Tabs.Tab>
            <Tabs.Tab value="past" leftSection={<User size={16} />}>
              Past
            </Tabs.Tab>
            <Tabs.Tab value="cancelled">
              Cancelled
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="upcoming" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {upcomingAppointments.map((appointment) => (
                  <Grid.Col key={appointment.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <AppointmentCard
                      appointment={appointment}
                      onView={handleViewAppointment}
                      onEdit={handleEditAppointment}
                      onJoin={handleJoinSession}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {upcomingAppointments.map((appointment) => (
                    <Table.Tr key={appointment.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="blue">
                            {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {appointment.patientName || 'Unknown Patient'}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{appointment.date.toLocaleDateString()}</Text>
                          <Text size="xs" c="dimmed">{appointment.date.toLocaleTimeString()}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {appointment.sessionType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          <Text size="sm">{appointment.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.duration || 30} min</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.providerName || 'Unknown Provider'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={appointment.status === 'scheduled' ? 'blue' : appointment.status === 'in_progress' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'green'}>
                          {appointment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="orange"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                          {appointment.date > new Date() && appointment.status !== 'cancelled' && (
                            <Button
                              size="xs"
                              leftSection={<Video size={12} />}
                              onClick={() => handleJoinSession(appointment)}
                            >
                              Join
                            </Button>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="today" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {todayAppointments.map((appointment) => (
                  <Grid.Col key={appointment.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <AppointmentCard
                      appointment={appointment}
                      onView={handleViewAppointment}
                      onEdit={handleEditAppointment}
                      onJoin={handleJoinSession}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {todayAppointments.map((appointment) => (
                    <Table.Tr key={appointment.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="blue">
                            {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {appointment.patientName || 'Unknown Patient'}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{appointment.date.toLocaleDateString()}</Text>
                          <Text size="xs" c="dimmed">{appointment.date.toLocaleTimeString()}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {appointment.sessionType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          <Text size="sm">{appointment.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.duration || 30} min</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.providerName || 'Unknown Provider'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={appointment.status === 'scheduled' ? 'green' : appointment.status === 'in_progress' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
                          {appointment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="orange"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                          {appointment.date > new Date() && appointment.status !== 'cancelled' && (
                            <Button
                              size="xs"
                              leftSection={<Video size={12} />}
                              onClick={() => handleJoinSession(appointment)}
                            >
                              Join
                            </Button>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="past" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {pastAppointments.map((appointment) => (
                  <Grid.Col key={appointment.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <AppointmentCard
                      appointment={appointment}
                      onView={handleViewAppointment}
                      onEdit={handleEditAppointment}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pastAppointments.map((appointment) => (
                    <Table.Tr key={appointment.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="blue">
                            {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {appointment.patientName || 'Unknown Patient'}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{appointment.date.toLocaleDateString()}</Text>
                          <Text size="xs" c="dimmed">{appointment.date.toLocaleTimeString()}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {appointment.sessionType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          <Text size="sm">{appointment.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.duration || 30} min</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.providerName || 'Unknown Provider'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={appointment.status === 'scheduled' ? 'green' : appointment.status === 'in_progress' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
                          {appointment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="orange"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="past" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {cancelledAppointments.map((appointment) => (
                  <Grid.Col key={appointment.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <AppointmentCard
                      appointment={appointment}
                      onView={handleViewAppointment}
                      onEdit={handleEditAppointment}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cancelledAppointments.map((appointment) => (
                    <Table.Tr key={appointment.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="blue">
                            {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {appointment.patientName || 'Unknown Patient'}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{appointment.date.toLocaleDateString()}</Text>
                          <Text size="xs" c="dimmed">{appointment.date.toLocaleTimeString()}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {appointment.sessionType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          <Text size="sm">{appointment.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.duration || 30} min</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.providerName || 'Unknown Provider'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={appointment.status === 'scheduled' ? 'blue' : appointment.status === 'in_progress' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'green'}>
                          {appointment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="orange"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="cancelled" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {cancelledAppointments.map((appointment) => (
                  <Grid.Col key={appointment.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <AppointmentCard
                      appointment={appointment}
                      onView={handleViewAppointment}
                      onEdit={handleEditAppointment}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cancelledAppointments.map((appointment) => (
                    <Table.Tr key={appointment.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="blue">
                            {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'P'}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {appointment.patientName || 'Unknown Patient'}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{appointment.date.toLocaleDateString()}</Text>
                          <Text size="xs" c="dimmed">{appointment.date.toLocaleTimeString()}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {appointment.sessionType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          <Text size="sm">{appointment.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.duration || 30} min</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{appointment.providerName || 'Unknown Provider'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={appointment.status === 'scheduled' ? 'green' : appointment.status === 'in_progress' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
                          {appointment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="orange"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Empty State */}
        {!isLoading && (
          (activeTab === 'upcoming' && upcomingAppointments.length === 0) ||
          (activeTab === 'today' && todayAppointments.length === 0) ||
          (activeTab === 'past' && pastAppointments.length === 0) ||
          (activeTab === 'cancelled' && cancelledAppointments.length === 0)
        ) && (
            <Center py="xl">
              <Stack align="center" gap="md">
                <CalendarIcon size={48} color="gray" />
                <Text size="lg" c="dimmed">
                  No appointments found
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  {searchQuery || statusFilter
                    ? 'Try adjusting your search criteria'
                    : 'Get started by scheduling your first appointment'}
                </Text>
                <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                  Schedule Appointment
                </Button>
              </Stack>
            </Center>
          )}
      </Stack>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        opened={createModalOpened}
        onClose={closeCreateModal}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        opened={editModalOpened}
        onClose={closeEditModal}
        appointment={selectedAppointment}
      />
    </Container>
  );
};

export default SessionsPage;