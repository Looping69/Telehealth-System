/**
 * Sessions Page Component
 * Manages appointments and telehealth sessions
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
  Calendar,
  Avatar,
  Divider,
  Center,
  Loader,
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useAppointments } from '../hooks/useQuery';
import { Appointment } from '../types';

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
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'blue';
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
                <strong>Provider:</strong> {appointment.provider}
              </Text>
              <Text size="sm">
                <strong>Reason:</strong> {appointment.reason}
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
export const SessionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data: appointments, isLoading, error } = useAppointments();

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openDetails();
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // TODO: Implement edit functionality
    console.log('Edit appointment:', appointment);
  };

  const handleJoinSession = (appointment: Appointment) => {
    // TODO: Implement video session joining
    console.log('Join session:', appointment);
  };

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

  const upcomingAppointments = appointments ? filterAppointmentsByTab(appointments, 'upcoming') : [];
  const todayAppointments = appointments ? filterAppointmentsByTab(appointments, 'today') : [];
  const pastAppointments = appointments ? filterAppointmentsByTab(appointments, 'past') : [];
  const cancelledAppointments = appointments ? filterAppointmentsByTab(appointments, 'cancelled') : [];

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
          <Button leftSection={<Plus size={16} />}>
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
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'pending', label: 'Pending' },
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
                          {appointment.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
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
                        <Badge color={appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
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
                          {appointment.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
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
                        <Badge color={appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
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
                          {appointment.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
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
                        <Badge color={appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
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
                          {appointment.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
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
                        <Badge color={appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
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
                          {appointment.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
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
                        <Badge color={appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'yellow' : appointment.status === 'cancelled' ? 'red' : 'blue'}>
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
              <Button leftSection={<Plus size={16} />}>
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
    </Container>
  );
};

export default SessionsPage;