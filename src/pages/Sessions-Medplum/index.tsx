/**
 * Sessions-Medplum Page Component
 * Manages appointments and telehealth sessions using FHIR data
 */

import React, { useState, useMemo, useEffect } from 'react';
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
import { medplumClient } from '../../config/medplum';
import { Appointment } from '@medplum/fhirtypes';
import CreateAppointmentModal from '../../components/CreateAppointmentModal';
import EditAppointmentModal from '../../components/EditAppointmentModal';

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
      case 'booked':
        return 'blue';
      case 'arrived':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'fulfilled':
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
    const participant = appointment.participant?.find(p => 
      p.actor?.reference?.startsWith('Patient/')
    );
    return participant?.actor?.display || 'Unknown Patient';
  };

  const getProviderName = () => {
    const participant = appointment.participant?.find(p => 
      p.actor?.reference?.startsWith('Practitioner/')
    );
    return participant?.actor?.display || 'Unknown Provider';
  };

  const getAppointmentDate = () => {
    if (appointment.start) {
      return new Date(appointment.start);
    }
    return new Date();
  };

  const getDuration = () => {
    if (appointment.start && appointment.end) {
      const start = new Date(appointment.start);
      const end = new Date(appointment.end);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }
    return 30; // Default 30 minutes
  };

  const isUpcoming = () => {
    const now = new Date();
    const appointmentDate = getAppointmentDate();
    return appointmentDate > now && appointment.status !== 'cancelled';
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
            {getTypeIcon(appointment.serviceType?.[0]?.text)}
            <Text size="sm" c="dimmed">
              {appointment.serviceType?.[0]?.text || 'General'} • {getDuration()} min
            </Text>
          </Group>
          <Text size="sm" fw={500}>
            {getProviderName()}
          </Text>
        </Group>

        {appointment.comment && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {appointment.comment}
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

  const getPatientName = () => {
    const participant = appointment.participant?.find(p => 
      p.actor?.reference?.startsWith('Patient/')
    );
    return participant?.actor?.display || 'Unknown Patient';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="FHIR Appointment Details"
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Live FHIR Data - Appointment ID: {appointment.id}
        </Alert>

        <Group>
          <Avatar size="xl" radius="xl" color="blue">
            {getPatientName().split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Stack gap={4}>
            <Title order={3}>{getPatientName()}</Title>
            <Badge color={appointment.status === 'booked' ? 'green' : 'yellow'}>
              {appointment.status}
            </Badge>
          </Stack>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Start Time</Text>
              <Text size="sm" c="dimmed">
                {appointment.start ? new Date(appointment.start).toLocaleString() : 'Not set'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>End Time</Text>
              <Text size="sm" c="dimmed">
                {appointment.end ? new Date(appointment.end).toLocaleString() : 'Not set'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Service Type</Text>
              <Text size="sm" c="dimmed">
                {appointment.serviceType?.[0]?.text || 'General'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Priority</Text>
              <Text size="sm" c="dimmed">
                {appointment.priority?.text || 'Normal'}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        {appointment.comment && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Notes</Text>
              <Text size="sm">{appointment.comment}</Text>
            </Stack>
          </>
        )}

        {appointment.participant && appointment.participant.length > 0 && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Participants</Text>
              {appointment.participant.map((participant, index) => (
                <Group key={index} justify="space-between">
                  <Text size="sm">{participant.actor?.display || 'Unknown'}</Text>
                  <Badge size="xs" variant="light">
                    {participant.type?.[0]?.text || 'Participant'}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Modal>
  );
};

/**
 * Main Sessions-Medplum Page Component
 */
const SessionsMedplumPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('Appointment', {
          _sort: '-date',
          _count: '50',
          _include: 'Appointment:patient,Appointment:practitioner'
        });

        if (response.entry) {
          const appointmentData = response.entry
            .filter(entry => entry.resource?.resourceType === 'Appointment')
            .map(entry => entry.resource as Appointment);
          
          setAppointments(appointmentData);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR appointments:', err);
        setError('Failed to fetch appointments from FHIR server. Please check your connection.');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = !searchTerm || 
        appointment.participant?.some(p => 
          p.actor?.display?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        appointment.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

      const matchesDate = !selectedDate || 
        (appointment.start && 
         new Date(appointment.start).toDateString() === selectedDate.toDateString());

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

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
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
                  { value: 'booked', label: 'Booked' },
                  { value: 'arrived', label: 'Arrived' },
                  { value: 'fulfilled', label: 'Fulfilled' },
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