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
  Tabs,
  Avatar,
  Divider,
  Center,
  Loader,
  Table,
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
  const getStatusColor = (status?: string) => {
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

  const getTypeIcon = (serviceType?: string) => {
    if (serviceType?.toLowerCase().includes('video')) {
      return <Video size={16} />;
    }
    if (serviceType?.toLowerCase().includes('phone')) {
      return <Phone size={16} />;
    }
    return <User size={16} />;
  };

  const getPatientName = () => {
    return appointment.patientName || 'Unknown Patient';
  };

  const getProviderName = () => {
    return appointment.providerName || 'Unknown Provider';
  };

  const getAppointmentDate = () => {
    return appointment.date || new Date();
  };

  const getDuration = () => {
    return appointment.duration || 30;
  };

  const isUpcoming = () => {
    const now = new Date();
    const appointmentDate = getAppointmentDate();
    return appointmentDate > now && appointment.status === 'scheduled';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Appointment
            </Badge>
          </Group>
          <Badge color={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </Group>

        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="md" radius="xl" color="blue">
              {getPatientName().split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500}>{getPatientName()}</Text>
              <Group gap="xs">
                <Clock size={14} />
                <Text size="sm" c="dimmed">
                  {getAppointmentDate().toLocaleDateString()} at {getAppointmentDate().toLocaleTimeString()}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Group>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {getTypeIcon(appointment.sessionType)}
            <Text size="sm" c="dimmed">
              {appointment.sessionType || 'General'} • {getDuration()} min
            </Text>
          </Group>
          <Text size="sm" fw={500}>
            {getProviderName()}
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
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Appointment ID: {appointment.id}
        </Alert>

        <Group>
          <Avatar size="xl" radius="xl" color="blue">
            {appointment.patientName?.split(' ').map(n => n[0]).join('') || 'P'}
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
              <Text size="sm" fw={500}>Date & Time</Text>
              <Text size="sm" c="dimmed">
                {appointment.date ? appointment.date.toLocaleString() : 'Not set'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Duration</Text>
              <Text size="sm" c="dimmed">
                {appointment.duration || 30} minutes
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Session Type</Text>
              <Text size="sm" c="dimmed">
                {appointment.sessionType || 'General'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Provider</Text>
              <Text size="sm" c="dimmed">
                {appointment.providerName || 'Unknown Provider'}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        {appointment.notes && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Notes</Text>
              <Text size="sm">{appointment.notes}</Text>
            </Stack>
          </>
        )}

        {appointment.symptoms && appointment.symptoms.length > 0 && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Symptoms</Text>
              <Group gap="xs">
                {appointment.symptoms.map((symptom, index) => (
                  <Badge key={index} size="sm" variant="light">
                    {symptom}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Sessions-Medplum Page Component
 */
const SessionsMedplumPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Use the appointments hook with proper error handling and fallback
  const { data: appointments = [], isLoading: loading, error } = useAppointments(selectedDate || undefined);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch = !searchTerm || 
        appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      
      const matchesDate = !selectedDate || 
        (appointment.date && 
         appointment.date.toDateString() === selectedDate.toDateString());
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, selectedDate]);

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openDetails();
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openEdit();
  };

  const handleJoinSession = (appointment: Appointment) => {
    // Implement video session joining logic
    console.log('Joining session for appointment:', appointment.id);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR appointments...</Text>
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
            <Title order={1}>Sessions</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage appointments and telehealth sessions</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            New Appointment
          </Button>
        </Group>

        {/* Error Alert - Only show if there's an actual error, not when using fallback data */}
        {error && !appointments.length && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            Failed to connect to FHIR server. Using offline data.
          </Alert>
        )}

        {/* Filters */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Search appointments..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Button
                variant="light"
                leftSection={<CalendarIcon size={16} />}
                onClick={() => setSelectedDate(selectedDate ? null : new Date())}
              >
                {selectedDate ? selectedDate.toLocaleDateString() : 'Filter by date'}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredAppointments.length} appointments
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <CalendarIcon size={48} color="gray" />
              <Text size="lg" c="dimmed">No appointments found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or create a new appointment'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredAppointments.map((appointment) => (
              <Grid.Col key={appointment.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRAppointmentCard
                  appointment={appointment}
                  onView={handleViewAppointment}
                  onEdit={handleEditAppointment}
                  onJoin={handleJoinSession}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Modals */}
        <FHIRAppointmentDetailsModal
          appointment={selectedAppointment}
          opened={detailsOpened}
          onClose={closeDetails}
        />

        <CreateAppointmentModal
          opened={createOpened}
          onClose={closeCreate}
        />

        <EditAppointmentModal
          appointment={selectedAppointment}
          opened={editOpened}
          onClose={closeEdit}
        />
      </Stack>
    </Container>
  );
};

export default SessionsMedplumPage;