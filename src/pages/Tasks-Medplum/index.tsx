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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { Task } from '@medplum/fhirtypes';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('Task', {
          _sort: '-authored-on',
          _count: '50',
          _include: 'Task:patient,Task:owner'
        });

        if (response.entry) {
          const taskData = response.entry
            .filter(entry => entry.resource?.resourceType === 'Task')
            .map(entry => entry.resource as Task);
          
          setTasks(taskData);
        } else {
          setTasks([]);
        }
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

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.for?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.owner?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    openDetails();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    openEdit();
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      const updatedTask = { ...task, status: 'completed' as const };
      await medplumClient.updateResource(updatedTask);
      
      // Refresh tasks
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Tasks</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage clinical tasks and workflows</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            New Task
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
                placeholder="Search tasks..."
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
                  { value: 'draft', label: 'Draft' },
                  { value: 'requested', label: 'Requested' },
                  { value: 'received', label: 'Received' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by priority"
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'routine', label: 'Routine' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'asap', label: 'ASAP' },
                  { value: 'stat', label: 'STAT' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredTasks.length} tasks
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <CheckCircle size={48} color="gray" />
              <Text size="lg" c="dimmed">No tasks found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or create a new task'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredTasks.map((task) => (
              <Grid.Col key={task.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRTaskCard
                  task={task}
                  onView={handleViewTask}
                  onEdit={handleEditTask}
                  onComplete={handleCompleteTask}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Modals */}
        <FHIRTaskDetailsModal
          task={selectedTask}
          opened={detailsOpened}
          onClose={closeDetails}
        />

        {/* Note: Create and Edit modals would need FHIR-specific implementations */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Task"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR task creation requires specific implementation for Task resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Task"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR task editing requires specific implementation for the selected Task resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default TasksMedplumPage;