/**
 * Sessions-Medplum Page Component
 * Manages appointments and telehealth sessions using FHIR data
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
  Avatar,
  Divider,
  Center,
  Loader,
  Alert,
  Tabs,
  Table,
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
  AlertCircle,
  Database,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { Appointment as FHIRAppointment } from '@medplum/fhirtypes';
import { Appointment } from '../../types';
import CreateAppointmentModal from '../../components/CreateAppointmentModal';
import EditAppointmentModal from '../../components/EditAppointmentModal';
import { useAppointments } from '../../hooks/useQuery';

/**
 * FHIR Appointment Card Component
 */
interface FHIRAppointmentCardProps {
  appointment: Appointment;
  onView: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onJoin?: (appointment: Appointment) => void;
}

const FHIRAppointmentCard: React.FC<FHIRAppointmentCardProps> = ({
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
 * FHIR Appointment Details Modal
 */
interface FHIRAppointmentDetailsModalProps {
  appointment: Appointment | null;
  opened: boolean;
  onClose: () => void;
}

const FHIRAppointmentDetailsModal: React.FC<FHIRAppointmentDetailsModalProps> = ({
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
 * Main Sessions-Medplum Page Component
 */
const SessionsMedplumPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data: appointments, isLoading, error } = useAppointments();

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openDetails();
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openEditModal();
  };

  const handleJoinSession = (appointment: Appointment) => {
    // TODO: Implement video session joining
    console.log('Join session:', appointment);
  };

  // Filter appointments based on search query and status filter
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

  if (error) {
    return (
      <Container size="xl" py="md">
        <Text color="red">Error loading appointments: {error.message}</Text>
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

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                placeholder="Search appointments..."
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
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
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
            <Tabs.Tab value="upcoming" leftSection={<Clock size={16} />}>
              Upcoming ({upcomingAppointments.length})
            </Tabs.Tab>
            <Tabs.Tab value="today" leftSection={<CalendarIcon size={16} />}>
              Today ({todayAppointments.length})
            </Tabs.Tab>
            <Tabs.Tab value="past" leftSection={<User size={16} />}>
              Past ({pastAppointments.length})
            </Tabs.Tab>
            <Tabs.Tab value="cancelled">
              Cancelled ({cancelledAppointments.length})
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
                    <FHIRAppointmentCard
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
                    <FHIRAppointmentCard
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
                    <FHIRAppointmentCard
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

          <Tabs.Panel value="cancelled" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {cancelledAppointments.map((appointment) => (
                  <Grid.Col key={appointment.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRAppointmentCard
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
      <FHIRAppointmentDetailsModal
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

export default SessionsMedplumPage;