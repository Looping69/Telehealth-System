/**
 * Tasks-Medplum Page Component
 * Manages clinical tasks and workflows using FHIR data
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
  Avatar,
  Center,
  Loader,
  Alert,
  Progress,
  Tabs,
  Textarea,
  Checkbox,
  Table,
  Paper,
  SimpleGrid,
  ThemeIcon,
  SegmentedControl,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Database,
  AlertCircle,
  Flag,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Settings,
  Trash,
  Save,
  X,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { Task } from '@medplum/fhirtypes';
import { backendFHIRService } from '../../services/backendFHIRService';

/**
 * FHIR Task Card Component
 */
interface FHIRTaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete?: (task: Task) => void;
}

const FHIRTaskCard: React.FC<FHIRTaskCardProps> = ({ task, onView, onEdit, onComplete }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'requested':
        return 'blue';
      case 'received':
        return 'cyan';
      case 'accepted':
        return 'yellow';
      case 'in-progress':
        return 'orange';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'asap':
        return 'orange';
      case 'routine':
        return 'blue';
      case 'stat':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
      case 'stat':
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getTaskDescription = () => {
    return task.description || 
           task.code?.text || 
           task.code?.coding?.[0]?.display || 
           'Task';
  };

  const getPatientName = () => {
    return task.for?.display || 'Unknown Patient';
  };

  const getOwnerName = () => {
    return task.owner?.display || 'Unassigned';
  };

  const getProgress = () => {
    if (task.status === 'completed') return 100;
    if (task.status === 'in-progress') return 60;
    if (task.status === 'accepted') return 30;
    if (task.status === 'received') return 20;
    if (task.status === 'requested') return 10;
    return 0;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Task
            </Badge>
          </Group>
          <Badge color={getStatusColor(task.status)}>
            {task.status}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Text fw={500} lineClamp={2}>
            {getTaskDescription()}
          </Text>
          <Text size="sm" c="dimmed">
            Task #{task.id}
          </Text>
        </Stack>

        <Progress value={getProgress()} color={getStatusColor(task.status)} size="sm" />

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Patient: {getPatientName()}</Text>
          </Group>
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Owner: {getOwnerName()}</Text>
          </Group>
          {task.authoredOn && (
            <Group gap="xs">
              <Calendar size={14} />
              <Text size="sm">Created: {new Date(task.authoredOn).toLocaleDateString()}</Text>
            </Group>
          )}
          {task.executionPeriod?.end && (
            <Group gap="xs">
              <Clock size={14} />
              <Text size="sm">Due: {new Date(task.executionPeriod.end).toLocaleDateString()}</Text>
            </Group>
          )}
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {getPriorityIcon(task.priority)}
            <Badge size="sm" color={getPriorityColor(task.priority)}>
              {task.priority || 'routine'} priority
            </Badge>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(task)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(task)}
            >
              <Edit size={16} />
            </ActionIcon>
            {task.status !== 'completed' && onComplete && (
              <ActionIcon
                variant="light"
                color="green"
                onClick={() => onComplete(task)}
              >
                <CheckCircle size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * FHIR Task Details Modal
 */
interface FHIRTaskDetailsModalProps {
  task: Task | null;
  opened: boolean;
  onClose: () => void;
}

const FHIRTaskDetailsModal: React.FC<FHIRTaskDetailsModalProps> = ({
  task,
  opened,
  onClose,
}) => {
  if (!task) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`FHIR Task #${task.id}`}
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Live FHIR Data - Task ID: {task.id}
        </Alert>

        <Group>
          <ActionIcon variant="light" color="blue" size="xl">
            <CheckCircle size={24} />
          </ActionIcon>
          <Stack gap={4}>
            <Title order={3}>{task.description || 'Task'}</Title>
            <Badge color={task.status === 'completed' ? 'green' : 'yellow'}>
              {task.status}
            </Badge>
          </Stack>
        </Group>

        <Progress 
          value={task.status === 'completed' ? 100 : task.status === 'in-progress' ? 60 : 30} 
          color={task.status === 'completed' ? 'green' : 'blue'} 
          size="md" 
        />

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Patient</Text>
              <Text size="sm" c="dimmed">
                {task.for?.display || 'Unknown Patient'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Owner</Text>
              <Text size="sm" c="dimmed">
                {task.owner?.display || 'Unassigned'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Priority</Text>
              <Badge size="sm" color={task.priority === 'urgent' ? 'red' : 'blue'}>
                {task.priority || 'routine'}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Intent</Text>
              <Text size="sm" c="dimmed">
                {task.intent || 'Not specified'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Authored On</Text>
              <Text size="sm" c="dimmed">
                {task.authoredOn ? new Date(task.authoredOn).toLocaleString() : 'Not set'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Last Modified</Text>
              <Text size="sm" c="dimmed">
                {task.lastModified ? new Date(task.lastModified).toLocaleString() : 'Not set'}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        {task.executionPeriod && (
          <>
            <Text size="sm" fw={500}>Execution Period</Text>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  <strong>Start:</strong> {task.executionPeriod.start ? new Date(task.executionPeriod.start).toLocaleString() : 'Not set'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  <strong>End:</strong> {task.executionPeriod.end ? new Date(task.executionPeriod.end).toLocaleString() : 'Not set'}
                </Text>
              </Grid.Col>
            </Grid>
          </>
        )}

        {task.note && task.note.length > 0 && (
          <>
            <Text size="sm" fw={500}>Notes</Text>
            {task.note.map((note, index) => (
              <Text key={index} size="sm" c="dimmed">
                {note.text}
              </Text>
            ))}
          </>
        )}
      </Stack>
    </Modal>
  );
};

/**
 * Main Tasks-Medplum Page Component
 */
const TasksMedplumPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await backendFHIRService.searchResources('Task', {
          _sort: '-authored-on',
          _count: '50',
          _include: 'Task:patient,Task:owner'
        });
        const taskData = (response.data ?? [])
          .filter((res: any) => res?.resourceType === 'Task') as Task[];
        setTasks(taskData);
      } catch (err) {
        console.error('Error fetching FHIR tasks:', err);
        setError('Failed to fetch tasks from FHIR server. Please check your connection.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks by tab
  const filterTasksByTab = (tasks: Task[], tab: string) => {
    switch (tab) {
      case 'pending':
        return tasks.filter(task => task.status === 'requested' || task.status === 'received');
      case 'in_progress':
        return tasks.filter(task => task.status === 'accepted' || task.status === 'in-progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'overdue':
        return tasks.filter(task => 
          task.executionPeriod?.end && 
          new Date(task.executionPeriod.end) < new Date() && 
          task.status !== 'completed'
        );
      default:
        return tasks;
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const tabFiltered = filterTasksByTab(tasks, activeTab || 'all');
    
    return tabFiltered.filter(task => {
      const matchesSearch = !searchQuery || 
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.for?.display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.owner?.display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, activeTab]);

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    openDetails();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    openEdit();
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };

  const handleCompleteTask = async (task: Task) => {
    if (task.status === 'completed') {
      notifications.show({
        title: 'Task Already Completed',
        message: 'This task is already marked as completed.',
        color: 'blue',
      });
      return;
    }

    try {
      const updatedTask = { ...task, status: 'completed' as const };
      // Update FHIR Task via backend service (resourceType, id, payload)
      await backendFHIRService.updateResource('Task', task.id as string, updatedTask);
      
      // Refresh tasks
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      
      notifications.show({
        title: 'Task Completed',
        message: `Task "${task.description || task.id}" has been marked as completed.`,
        color: 'green',
        icon: <CheckCircle size={16} />,
      });
    } catch (err) {
      console.error('Error completing task:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to complete task. Please try again.',
        color: 'red',
      });
    }
  };

  // Calculate summary statistics
  const pendingTasks = tasks.filter(task => task.status === 'requested' || task.status === 'received').length;
  const inProgressTasks = tasks.filter(task => task.status === 'accepted' || task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => 
    task.executionPeriod?.end && 
    new Date(task.executionPeriod.end) < new Date() && 
    task.status !== 'completed'
  ).length;

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR tasks...</Text>
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
            <Title order={2}>Tasks Management</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage clinical tasks and workflows</Text>
            </Group>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Task
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
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Pending Tasks
                </Text>
                <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                  <Clock size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="yellow">
                {pendingTasks}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Awaiting action
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  In Progress
                </Text>
                <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                  <User size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {inProgressTasks}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Currently active
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Completed
                </Text>
                <ThemeIcon variant="light" color="green" size="lg" radius="md">
                  <CheckCircle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="green">
                {completedTasks}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Finished tasks
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Overdue
                </Text>
                <ThemeIcon variant="light" color="red" size="lg" radius="md">
                  <AlertTriangle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="red">
                {overdueTasks}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Past deadline
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search tasks..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'requested', label: 'Requested' },
                  { value: 'received', label: 'Received' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Group justify="flex-end">
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

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<User size={16} />}>
              All Tasks
            </Tabs.Tab>
            <Tabs.Tab value="pending" leftSection={<Clock size={16} />}>
              Pending
            </Tabs.Tab>
            <Tabs.Tab value="in_progress" leftSection={<User size={16} />}>
              In Progress
            </Tabs.Tab>
            <Tabs.Tab value="completed" leftSection={<CheckCircle size={16} />}>
              Completed
            </Tabs.Tab>
            <Tabs.Tab value="overdue" leftSection={<AlertTriangle size={16} />}>
              Overdue
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all" pt="md">
            {viewMode === 'cards' ? (
              <Grid>
                {filteredTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRTaskCard
                      task={task}
                      onView={handleViewTask}
                      onEdit={handleEditTask}
                      onComplete={handleCompleteTask}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Task</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <FHIRTaskTableRow
                        key={task.id}
                        task={task}
                        onView={handleViewTask}
                        onEdit={handleEditTask}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="pending" pt="md">
            {viewMode === 'cards' ? (
              <Grid>
                {filteredTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRTaskCard
                      task={task}
                      onView={handleViewTask}
                      onEdit={handleEditTask}
                      onComplete={handleCompleteTask}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Task</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <FHIRTaskTableRow
                        key={task.id}
                        task={task}
                        onView={handleViewTask}
                        onEdit={handleEditTask}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="in_progress" pt="md">
            {viewMode === 'cards' ? (
              <Grid>
                {filteredTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRTaskCard
                      task={task}
                      onView={handleViewTask}
                      onEdit={handleEditTask}
                      onComplete={handleCompleteTask}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Task</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <FHIRTaskTableRow
                        key={task.id}
                        task={task}
                        onView={handleViewTask}
                        onEdit={handleEditTask}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="completed" pt="md">
            {viewMode === 'cards' ? (
              <Grid>
                {filteredTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRTaskCard
                      task={task}
                      onView={handleViewTask}
                      onEdit={handleEditTask}
                      onComplete={handleCompleteTask}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Task</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <FHIRTaskTableRow
                        key={task.id}
                        task={task}
                        onView={handleViewTask}
                        onEdit={handleEditTask}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="md">
            {viewMode === 'cards' ? (
              <Grid>
                {filteredTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRTaskCard
                      task={task}
                      onView={handleViewTask}
                      onEdit={handleEditTask}
                      onComplete={handleCompleteTask}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Task</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <FHIRTaskTableRow
                        key={task.id}
                        task={task}
                        onView={handleViewTask}
                        onEdit={handleEditTask}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Empty State */}
        {!loading && filteredTasks.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <CheckCircle size={48} color="gray" />
              <Text size="lg" c="dimmed">No tasks found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or create a new task'}
              </Text>
            </Stack>
          </Center>
        )}

        {/* Modals */}
        <FHIRTaskDetailsModal
          task={selectedTask}
          opened={detailsOpened}
          onClose={closeDetails}
        />

        {/* Create Task Modal */}
        <CreateFHIRTaskModal
          opened={createOpened}
          onClose={closeCreate}
          onTaskCreated={handleTaskCreated}
        />

        {/* Edit Task Modal */}
        <EditFHIRTaskModal
          task={selectedTask}
          opened={editOpened}
          onClose={closeEdit}
          onTaskUpdated={handleTaskUpdated}
        />
      </Stack>
    </Container>
  );
};

export default TasksMedplumPage;

// FHIR Task Table Row Component
interface FHIRTaskTableRowProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
}

const FHIRTaskTableRow: React.FC<FHIRTaskTableRowProps> = ({ task, onView, onEdit, onComplete }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'requested':
        return 'blue';
      case 'received':
        return 'cyan';
      case 'accepted':
        return 'yellow';
      case 'in-progress':
        return 'orange';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'asap':
        return 'orange';
      case 'routine':
        return 'blue';
      case 'stat':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getTaskDescription = () => {
    return task.description || 
           task.code?.text || 
           task.code?.coding?.[0]?.display || 
           'Task';
  };

  const getPatientName = () => {
    return task.for?.display || 'Unknown Patient';
  };

  const getOwnerName = () => {
    return task.owner?.display || 'Unassigned';
  };

  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  
  const patientName = getPatientName();
  const ownerName = getOwnerName();
  const dueDate = task.executionPeriod?.end ? new Date(task.executionPeriod.end).toLocaleDateString() : 'No due date';

  return (
    <Table.Tr>
      <Table.Td>
        <div>
          <Text fw={500} size="sm">
            {getTaskDescription()}
          </Text>
          <Text size="xs" c="dimmed">
            {task.id}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColor} variant="light" size="sm">
          {task.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={priorityColor} variant="light" size="sm">
          {task.priority || 'routine'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{patientName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{ownerName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{dueDate}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(task)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Edit size={14} />
          </ActionIcon>
          {task.status !== 'completed' && (
            <ActionIcon
              variant="light"
              color="green"
              size="sm"
              onClick={() => onComplete(task)}
            >
              <CheckCircle size={14} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

// Create FHIR Task Modal Component (Placeholder)
interface CreateFHIRTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

const CreateFHIRTaskModal: React.FC<CreateFHIRTaskModalProps> = ({ opened, onClose, onTaskCreated }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New FHIR Task"
      size="lg"
    >
      <Alert icon={<AlertCircle size={16} />} color="blue" variant="light" mb="md">
        FHIR task creation requires specific implementation for Task resources.
        This is a placeholder for the full implementation.
      </Alert>
      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Create Task
        </Button>
      </Group>
    </Modal>
  );
};

// Edit FHIR Task Modal Component (Placeholder)
interface EditFHIRTaskModalProps {
  task: Task | null;
  opened: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

const EditFHIRTaskModal: React.FC<EditFHIRTaskModalProps> = ({ task, opened, onClose, onTaskUpdated }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit FHIR Task"
      size="lg"
    >
      <Alert icon={<AlertCircle size={16} />} color="blue" variant="light" mb="md">
        FHIR task editing requires specific implementation for the selected Task resource.
        This is a placeholder for the full implementation.
      </Alert>
      {task && (
         <Text size="sm" c="dimmed" mb="md">
           Editing task: {task.description || task.code?.text || task.code?.coding?.[0]?.display || 'Task'}
         </Text>
       )}
      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Update Task
        </Button>
      </Group>
    </Modal>
  );
};