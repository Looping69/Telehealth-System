/**
 * Tasks Page Component
 * Manages tasks, assignments, and workflow management
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
  Checkbox,
  Center,
  Loader,
  Table,
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
  Flag,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { Task } from '../types';

/**
 * Mock data for tasks
 */
const mockTasks: Task[] = [
  {
    id: 'TASK-001',
    title: 'Review lab results for Sarah Johnson',
    description: 'Blood work results need physician review and patient notification',
    status: 'pending',
    priority: 'high',
    assignedTo: 'Dr. Smith',
    dueDate: '2024-01-15',
    createdDate: '2024-01-10',
    patientId: 'PAT-001',
    patientName: 'Sarah Johnson',
    category: 'clinical',
  },
  {
    id: 'TASK-002',
    title: 'Insurance verification for Michael Chen',
    description: 'Verify insurance coverage for upcoming procedure',
    status: 'in_progress',
    priority: 'normal',
    assignedTo: 'Jane Doe',
    dueDate: '2024-01-18',
    createdDate: '2024-01-12',
    patientId: 'PAT-002',
    patientName: 'Michael Chen',
    category: 'administrative',
  },
  {
    id: 'TASK-003',
    title: 'Follow-up call for Emma Davis',
    description: 'Post-treatment follow-up call to check patient status',
    status: 'completed',
    priority: 'normal',
    assignedTo: 'Dr. Johnson',
    dueDate: '2024-01-12',
    createdDate: '2024-01-08',
    completedDate: '2024-01-12',
    patientId: 'PAT-003',
    patientName: 'Emma Davis',
    category: 'clinical',
  },
];

/**
 * Task Card Component
 */
interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onView, onEdit, onComplete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'normal':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4} style={{ flex: 1 }}>
            <Text fw={500} lineClamp={2}>
              {task.title}
            </Text>
            <Text size="sm" c="dimmed">
              {task.id} • {task.category}
            </Text>
          </Stack>
          <Badge 
            color={getStatusColor(task.status)} 
            leftSection={getStatusIcon(task.status)}
          >
            {task.status}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={3}>
          {task.description}
        </Text>

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Assigned to: {task.assignedTo}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Due: {task.dueDate}</Text>
            {isOverdue() && (
              <Badge color="red" size="xs">
                Overdue
              </Badge>
            )}
          </Group>
          {task.patientName && (
            <Group gap="xs">
              <Avatar size="xs" radius="xl" color="blue">
                {task.patientName.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Text size="sm">{task.patientName}</Text>
            </Group>
          )}
        </Stack>

        <Group justify="space-between" align="center">
          <Badge size="sm" color={getPriorityColor(task.priority)} leftSection={<Flag size={12} />}>
            {task.priority}
          </Badge>
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
 * Task Details Modal
 */
interface TaskDetailsModalProps {
  task: Task | null;
  opened: boolean;
  onClose: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  opened,
  onClose,
}) => {
  if (!task) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Task ${task.id}`}
      size="lg"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={3}>{task.title}</Title>
            <Text c="dimmed">{task.category} task</Text>
          </Stack>
          <Group>
            <Badge color={task.status === 'completed' ? 'green' : 'yellow'}>
              {task.status}
            </Badge>
            <Badge color={task.priority === 'urgent' ? 'red' : 'blue'}>
              {task.priority} priority
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Text fw={500}>Description</Text>
          <Text size="sm">{task.description}</Text>
        </Stack>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Assignment</Text>
              <Text size="sm">
                <strong>Assigned to:</strong> {task.assignedTo}
              </Text>
              <Text size="sm">
                <strong>Created:</strong> {task.createdDate}
              </Text>
              <Text size="sm">
                <strong>Due Date:</strong> {task.dueDate}
              </Text>
              {task.completedDate && (
                <Text size="sm">
                  <strong>Completed:</strong> {task.completedDate}
                </Text>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Patient Information</Text>
              {task.patientName ? (
                <>
                  <Text size="sm">
                    <strong>Patient:</strong> {task.patientName}
                  </Text>
                  <Text size="sm">
                    <strong>Patient ID:</strong> {task.patientId}
                  </Text>
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  No patient associated
                </Text>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Task</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Create Task Modal
 */
interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ opened, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    assignedTo: '',
    dueDate: '',
    category: 'clinical',
    patientName: '',
  });

  const handleSubmit = () => {
    // TODO: Implement task creation
    console.log('Create task:', formData);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Task"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Task Title"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(event) => setFormData({ ...formData, title: event.currentTarget.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter task description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          required
          minRows={3}
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Priority"
              data={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value || 'normal' })}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Category"
              data={[
                { value: 'clinical', label: 'Clinical' },
                { value: 'administrative', label: 'Administrative' },
                { value: 'billing', label: 'Billing' },
                { value: 'follow_up', label: 'Follow-up' },
              ]}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value || 'clinical' })}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Assigned To"
              placeholder="Enter assignee name"
              value={formData.assignedTo}
              onChange={(event) => setFormData({ ...formData, assignedTo: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(event) => setFormData({ ...formData, dueDate: event.currentTarget.value })}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Patient Name (Optional)"
          placeholder="Enter patient name if applicable"
          value={formData.patientName}
          onChange={(event) => setFormData({ ...formData, patientName: event.currentTarget.value })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Tasks Page Component
 */
export const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  
  // New state for card/table view
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Using mock data for now
  const tasks = mockTasks;
  const isLoading = false;

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    openDetails();
  };

  const handleEditTask = (task: Task) => {
    // TODO: Implement edit functionality
    console.log('Edit task:', task);
  };

  const handleCompleteTask = (task: Task) => {
    // TODO: Implement complete functionality
    console.log('Complete task:', task);
  };

  const filterTasksByTab = (tasks: Task[], tab: string) => {
    switch (tab) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending');
      case 'in_progress':
        return tasks.filter(task => task.status === 'in_progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'overdue':
        return tasks.filter(task => 
          new Date(task.dueDate) < new Date() && task.status !== 'completed'
        );
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasksByTab(tasks, activeTab || 'all')
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(task => !statusFilter || task.status === statusFilter);

  // Calculate summary statistics
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && task.status !== 'completed'
  ).length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Tasks Management</Title>
            <Text c="dimmed">Manage tasks, assignments, and workflow</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Task
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Pending Tasks
                </Text>
                <ActionIcon variant="light" color="yellow" size="lg">
                  <Clock size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="yellow">
                {pendingTasks}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  In Progress
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <User size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {inProgressTasks}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Completed
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <CheckCircle size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {completedTasks}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Overdue
                </Text>
                <ActionIcon variant="light" color="red" size="lg">
                  <AlertTriangle size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="red">
                {overdueTasks}
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
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'overdue', label: 'Overdue' },
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
            <Tabs.Tab value="overdue" leftSection={<AlertTriangle size={16} />}>
              Overdue
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {filteredTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <TaskCard
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
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Assigned To</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <TaskTableRow
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
                    <TaskCard
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
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Assigned To</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <TaskTableRow
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
                    <TaskCard
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
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Assigned To</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <TaskTableRow
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
                    <TaskCard
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
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Assigned To</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTasks.map((task) => (
                      <TaskTableRow
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
        {!isLoading && filteredTasks.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <CheckCircle size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No tasks found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first task'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                Create Task
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        opened={createOpened}
        onClose={closeCreate}
      />
    </Container>
  );
};

/**
 * Task Table Row Component for table view
 */
interface TaskTableRowProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete?: (task: Task) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({ task, onView, onEdit, onComplete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'blue';
    }
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  return (
    <Table.Tr style={{ backgroundColor: isOverdue() ? 'var(--mantine-color-red-0)' : undefined }}>
      <Table.Td>
        <Stack gap={4}>
          <Text fw={500} size="sm" lineClamp={1}>
            {task.title}
          </Text>
          <Text size="xs" c="dimmed">
            {task.id}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {task.description}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(task.status)} size="sm">
          {task.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getPriorityColor(task.priority)} size="sm">
          {task.priority}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {task.assignedTo}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm">
            {task.dueDate}
          </Text>
          {isOverdue() && (
            <Badge color="red" size="xs">
              Overdue
            </Badge>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        {task.patientName && (
          <Group gap="xs">
            <Avatar size="xs" radius="xl" color="blue">
              {task.patientName.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Text size="sm">{task.patientName}</Text>
          </Group>
        )}
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
          {task.status !== 'completed' && onComplete && (
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