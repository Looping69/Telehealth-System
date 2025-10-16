/**
 * Dashboard Page Component - Medplum Integration
 * Main dashboard with key metrics, recent activity, and upcoming appointments using real FHIR data
 */

import React from 'react';
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
  ActionIcon,
  Progress,
  Center,
  Loader,
  Alert,
  SimpleGrid,
  ScrollArea,
  Divider,
} from '@mantine/core';
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Activity,
  Bell,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { medplumClient } from '../../config/medplum';
import { formatHumanName, getReferenceDisplay, convertAppointmentFromFHIR, convertTaskFromFHIR } from '../../utils/fhir';
import { useAuthStore } from '../../store/authStore';

/**
 * Metric Card Component
 * Displays individual dashboard metrics with icons and trends
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <ActionIcon variant="light" color={color} size="lg">
          {icon}
        </ActionIcon>
      </Group>
      <Text fw={700} size="xl" mb="xs">
        {value}
      </Text>
      {change && (
        <Text size="xs" c={getChangeColor()}>
          {change}
        </Text>
      )}
    </Card>
  );
};

/**
 * Custom hook for dashboard metrics using real FHIR data
 */
const useDashboardMetricsMedplum = () => {
  return useQuery({
    queryKey: ['dashboard-metrics-medplum'],
    queryFn: async () => {
      try {
        const baseUrl = 'http://localhost:8103/fhir/R4';
        
        // Get total patients count using direct fetch
        const patientsResponse = await fetch(`${baseUrl}/Patient?_summary=count`, {
          headers: { 'Accept': 'application/fhir+json' }
        });
        const patientsBundle = await patientsResponse.json();
        const totalPatients = patientsBundle.total || 0;

        // Get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const appointmentsResponse = await fetch(`${baseUrl}/Appointment?date=${today}&_summary=count`, {
          headers: { 'Accept': 'application/fhir+json' }
        });
        const appointmentsBundle = await appointmentsResponse.json();
        const todayAppointments = appointmentsBundle.total || 0;

        // Get active tasks
        const tasksResponse = await fetch(`${baseUrl}/Task?status=in-progress,requested,accepted&_summary=count`, {
          headers: { 'Accept': 'application/fhir+json' }
        });
        const tasksBundle = await tasksResponse.json();
        const activeTasks = tasksBundle.total || 0;

        // Get pending orders
        const ordersResponse = await fetch(`${baseUrl}/ServiceRequest?status=active,on-hold&_summary=count`, {
          headers: { 'Accept': 'application/fhir+json' }
        });
        const ordersBundle = await ordersResponse.json();
        const pendingOrders = ordersBundle.total || 0;

        return {
          totalPatients,
          todayAppointments,
          activeTasks,
          pendingOrders,
        };
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Custom hook for recent tasks using real FHIR data
 */
const useTasksMedplum = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['tasks-medplum', params],
    queryFn: async () => {
      try {
        const baseUrl = 'http://localhost:8103/fhir/R4';
        const queryParams = new URLSearchParams({
          _sort: '-_lastUpdated',
          _count: '5',
          ...params,
        });
        
        const response = await fetch(`${baseUrl}/Task?${queryParams}`, {
          headers: { 'Accept': 'application/fhir+json' }
        });
        const bundle = await response.json();
        return bundle.entry?.map(entry => entry.resource) || [];
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Custom hook for appointments using real FHIR data
 */
const useAppointmentsMedplum = () => {
  return useQuery({
    queryKey: ['appointments-medplum'],
    queryFn: async () => {
      try {
        const baseUrl = 'http://localhost:8103/fhir/R4';
        const today = new Date().toISOString().split('T')[0];
        const queryParams = new URLSearchParams({
          date: today,
          _sort: 'date',
          _count: '10',
          _include: 'Appointment:patient',
        });
        
        const response = await fetch(`${baseUrl}/Appointment?${queryParams}`, {
          headers: { 'Accept': 'application/fhir+json' }
        });
        const bundle = await response.json();
        return bundle.entry?.map(entry => entry.resource).filter(resource => resource.resourceType === 'Appointment') || [];
      } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Recent Activity Component
 * Shows recent patient activities and appointments using real FHIR data
 */
const RecentActivity: React.FC = () => {
  const { data: tasks, isLoading: tasksLoading, error } = useTasksMedplum({
    _sort: '-_lastUpdated',
    _count: '5',
  });

  if (tasksLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
        <Title order={4} mb="md">Recent Activity</Title>
        <Center h={300}>
          <Loader size="md" />
        </Center>
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
        <Title order={4} mb="md">Recent Activity</Title>
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          Failed to load recent activities from FHIR server.
        </Alert>
      </Card>
    );
  }

  const activities = tasks?.map((task, index) => {
    const convertedTask = convertTaskFromFHIR(task);
    return {
      id: task.id || index,
      type: 'task',
      message: convertedTask.description || task.description || 'Task updated',
      time: task.meta?.lastUpdated ? new Date(task.meta.lastUpdated).toLocaleString() : 'Unknown time',
      status: convertedTask.status === 'completed' ? 'success' : 
              convertedTask.status === 'in-progress' ? 'info' : 
              convertedTask.priority === 'urgent' ? 'warning' : 'info',
    };
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Recent Activity</Title>
        <Button variant="subtle" size="xs" rightSection={<ArrowRight size={14} />}>
          View All
        </Button>
      </Group>
      <ScrollArea h={300}>
        <Stack gap="sm">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id}>
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text size="sm">{activity.message}</Text>
                    <Text size="xs" c="dimmed">
                      {activity.time}
                    </Text>
                  </Stack>
                  <Badge size="xs" color={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </Group>
                <Divider my="sm" />
              </div>
            ))
          ) : (
            <Text c="dimmed" ta="center">No recent activity</Text>
          )}
        </Stack>
      </ScrollArea>
    </Card>
  );
};

/**
 * Upcoming Appointments Component
 * Displays today's upcoming appointments using real FHIR data
 */
const UpcomingAppointments: React.FC = () => {
  const { data: appointments, isLoading: appointmentsLoading, error } = useAppointmentsMedplum();

  if (appointmentsLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
        <Title order={4} mb="md">Today's Appointments</Title>
        <Center h={300}>
          <Loader size="md" />
        </Center>
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
        <Title order={4} mb="md">Today's Appointments</Title>
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          Failed to load appointments from FHIR server.
        </Alert>
      </Card>
    );
  }

  const todayAppointments = appointments?.slice(0, 4) || [];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Today's Appointments</Title>
        <Button variant="subtle" size="xs" rightSection={<ArrowRight size={14} />}>
          View Schedule
        </Button>
      </Group>
      <ScrollArea h={300}>
        <Stack gap="sm">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => {
              const converted = convertAppointmentFromFHIR(appointment);
              return (
                <Card key={appointment.id} padding="sm" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">
                        {getReferenceDisplay(appointment.participant?.find(p => 
                          p.actor?.reference?.startsWith('Patient/')
                        )?.actor) || 'Unknown Patient'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {converted.startTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {converted.type}
                      </Text>
                    </div>
                    <Badge 
                      color={appointment.status === 'booked' ? 'blue' : 'gray'} 
                      size="sm"
                    >
                      {appointment.status}
                    </Badge>
                  </Group>
                </Card>
              );
            })
          ) : (
            <Center h={200}>
              <Stack align="center" gap="xs">
                <Calendar size={32} color="gray" />
                <Text c="dimmed" size="sm">No appointments today</Text>
              </Stack>
            </Center>
          )}
        </Stack>
      </ScrollArea>
    </Card>
  );
};

/**
 * Main Dashboard Page Component - Medplum Integration
 */
const DashboardMedplumPage: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetricsMedplum();

  if (metricsLoading) {
    return (
      <Container size="xl" py="md">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading dashboard from FHIR server...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (metricsError) {
    return (
      <Container size="xl" py="md">
        <Alert icon={<AlertCircle size={16} />} title="FHIR Server Error" color="red">
          Failed to load dashboard metrics from the Medplum FHIR server. Please check your connection and server status.
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
            <Title order={2}>Dashboard - Medplum Integration</Title>
            <Text c="dimmed">Real-time data from your FHIR server</Text>
          </div>
          <Group>
            <Badge color="green" variant="light">
              Live FHIR Data
            </Badge>
            <ActionIcon variant="light" size="lg">
              <Bell size={20} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Key Metrics */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <MetricCard
            title="Total Patients"
            value={metrics?.totalPatients || 0}
            change="Real-time FHIR data"
            changeType="positive"
            icon={<Users size={20} />}
            color="blue"
          />
          <MetricCard
            title="Today's Appointments"
            value={metrics?.todayAppointments || 0}
            change="Live updates"
            changeType="neutral"
            icon={<Calendar size={20} />}
            color="green"
          />
          <MetricCard
            title="Active Tasks"
            value={metrics?.activeTasks || 0}
            change="FHIR integrated"
            changeType="neutral"
            icon={<Activity size={20} />}
            color="orange"
          />
          <MetricCard
            title="Pending Orders"
            value={metrics?.pendingOrders || 0}
            change="Real-time updates"
            changeType="neutral"
            icon={<FileText size={20} />}
            color="teal"
          />
        </SimpleGrid>

        {/* Charts and Activity */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
              <Title order={4} mb="md">
                Patient Visits Trend - FHIR Data
              </Title>
              <div
                style={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <Stack align="center" gap="sm">
                  <TrendingUp size={48} color="#2563eb" />
                  <Text c="dimmed">Chart visualization with real FHIR data</Text>
                  <Text size="sm" c="dimmed">Analytics from Medplum server</Text>
                </Stack>
              </div>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <RecentActivity />
          </Grid.Col>
        </Grid>

        {/* Bottom Section */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <UpcomingAppointments />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
              <Title order={4} mb="md">
                Quick Actions - FHIR Operations
              </Title>
              <Stack gap="md">
                <Button
                  variant="light"
                  leftSection={<Users size={16} />}
                  fullWidth
                  justify="flex-start"
                >
                  Create FHIR Patient
                </Button>
                <Button
                  variant="light"
                  leftSection={<Calendar size={16} />}
                  fullWidth
                  justify="flex-start"
                >
                  Schedule FHIR Appointment
                </Button>
                <Button
                  variant="light"
                  leftSection={<FileText size={16} />}
                  fullWidth
                  justify="flex-start"
                >
                  Create Service Request
                </Button>
                <Button
                  variant="light"
                  leftSection={<Activity size={16} />}
                  fullWidth
                  justify="flex-start"
                >
                  View FHIR Tasks
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default DashboardMedplumPage;