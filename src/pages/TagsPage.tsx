/**
 * Tags Page Component
 * Manages tags and labels for organizing patients, appointments, and resources
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
  ColorPicker,
  ColorSwatch,
  Textarea,
  Center,
  Loader,
  Table,
  Checkbox,
  Divider,
  Tooltip,
  NumberInput,
} from '@mantine/core';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  Hash,
  Palette,
  Filter,
  Eye,
  Users,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';

/**
 * Tag interface
 */
interface TagItem {
  id: string;
  name: string;
  description: string;
  color: string;
  category: 'patient' | 'appointment' | 'resource' | 'billing' | 'general';
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  lastUsed: string;
}

/**
 * Mock data for tags
 */
const mockTags: TagItem[] = [
  {
    id: 'TAG-001',
    name: 'High Priority',
    description: 'Urgent cases requiring immediate attention',
    color: '#ff4757',
    category: 'patient',
    isActive: true,
    usageCount: 45,
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
  },
  {
    id: 'TAG-002',
    name: 'Follow-up Required',
    description: 'Patients requiring follow-up appointments',
    color: '#ffa502',
    category: 'patient',
    isActive: true,
    usageCount: 128,
    createdBy: 'Dr. Michael Chen',
    createdAt: '2024-01-10',
    lastUsed: '2024-01-20',
  },
  {
    id: 'TAG-003',
    name: 'Telehealth',
    description: 'Virtual appointments and consultations',
    color: '#2ed573',
    category: 'appointment',
    isActive: true,
    usageCount: 89,
    createdBy: 'Practice Manager',
    createdAt: '2024-01-05',
    lastUsed: '2024-01-20',
  },
  {
    id: 'TAG-004',
    name: 'Insurance Pending',
    description: 'Cases with pending insurance verification',
    color: '#5352ed',
    category: 'billing',
    isActive: true,
    usageCount: 23,
    createdBy: 'Billing Specialist',
    createdAt: '2024-01-12',
    lastUsed: '2024-01-19',
  },
  {
    id: 'TAG-005',
    name: 'Chronic Care',
    description: 'Patients with chronic conditions requiring ongoing care',
    color: '#ff6b81',
    category: 'patient',
    isActive: true,
    usageCount: 67,
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-08',
    lastUsed: '2024-01-20',
  },
  {
    id: 'TAG-006',
    name: 'Educational Material',
    description: 'Patient education resources and materials',
    color: '#70a1ff',
    category: 'resource',
    isActive: true,
    usageCount: 34,
    createdBy: 'Content Manager',
    createdAt: '2024-01-14',
    lastUsed: '2024-01-18',
  },
  {
    id: 'TAG-007',
    name: 'Cancelled',
    description: 'Cancelled appointments and sessions',
    color: '#747d8c',
    category: 'appointment',
    isActive: false,
    usageCount: 12,
    createdBy: 'Receptionist',
    createdAt: '2024-01-06',
    lastUsed: '2024-01-15',
  },
  {
    id: 'TAG-008',
    name: 'VIP Patient',
    description: 'High-value patients requiring special attention',
    color: '#ffd700',
    category: 'patient',
    isActive: true,
    usageCount: 8,
    createdBy: 'Practice Manager',
    createdAt: '2024-01-11',
    lastUsed: '2024-01-19',
  },
];

/**
 * Tag Card Component
 */
interface TagCardProps {
  tag: TagItem;
  onEdit: (tag: TagItem) => void;
  onDelete: (tag: TagItem) => void;
  onToggleStatus: (tag: TagItem) => void;
}

const TagCard: React.FC<TagCardProps> = ({ tag, onEdit, onDelete, onToggleStatus }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient':
        return <Users size={16} />;
      case 'appointment':
        return <Calendar size={16} />;
      case 'resource':
        return <FileText size={16} />;
      case 'billing':
        return <Hash size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'patient':
        return 'blue';
      case 'appointment':
        return 'green';
      case 'resource':
        return 'orange';
      case 'billing':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <ColorSwatch color={tag.color} size={24} />
            <Stack gap={4}>
              <Group gap="xs" align="center">
                <Text fw={500} size="lg">
                  {tag.name}
                </Text>
                <Badge
                  size="sm"
                  color={getCategoryColor(tag.category)}
                  leftSection={getCategoryIcon(tag.category)}
                >
                  {tag.category}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={2}>
                {tag.description}
              </Text>
            </Stack>
          </Group>
          <Badge color={tag.isActive ? 'green' : 'red'} size="sm">
            {tag.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Group>

        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Usage: <strong>{tag.usageCount}</strong> times
            </Text>
            <Text size="xs" c="dimmed">
              Last used: {tag.lastUsed}
            </Text>
          </Stack>
          <Group gap="xs">
            <Tooltip label={tag.isActive ? 'Deactivate' : 'Activate'}>
              <ActionIcon
                variant="light"
                color={tag.isActive ? 'red' : 'green'}
                onClick={() => onToggleStatus(tag)}
              >
                <Settings size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onEdit(tag)}
              >
                <Edit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onDelete(tag)}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Tag Form Modal
 */
interface TagFormModalProps {
  tag: TagItem | null;
  opened: boolean;
  onClose: () => void;
  onSave: (tag: Partial<TagItem>) => void;
}

const TagFormModal: React.FC<TagFormModalProps> = ({ tag, opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2563eb',
    category: 'general' as TagItem['category'],
    isActive: true,
  });

  React.useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        description: tag.description,
        color: tag.color,
        category: tag.category,
        isActive: tag.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#2563eb',
        category: 'general',
        isActive: true,
      });
    }
  }, [tag]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const predefinedColors = [
    '#ff4757', '#ffa502', '#2ed573', '#5352ed', '#ff6b81',
    '#70a1ff', '#747d8c', '#ffd700', '#2563eb', '#059669',
    '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#be123c',
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={tag ? 'Edit Tag' : 'Create New Tag'}
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Tag Name"
          placeholder="Enter tag name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter tag description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          minRows={3}
        />

        <Select
          label="Category"
          data={[
            { value: 'patient', label: 'Patient' },
            { value: 'appointment', label: 'Appointment' },
            { value: 'resource', label: 'Resource' },
            { value: 'billing', label: 'Billing' },
            { value: 'general', label: 'General' },
          ]}
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value as TagItem['category'] })}
          required
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Color
          </Text>
          <Group gap="xs" mb="md">
            {predefinedColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                size={32}
                style={{ cursor: 'pointer' }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </Group>
          <ColorPicker
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            format="hex"
            swatches={predefinedColors}
          />
        </div>

        <Checkbox
          label="Active"
          checked={formData.isActive}
          onChange={(event) => setFormData({ ...formData, isActive: event.currentTarget.checked })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {tag ? 'Update Tag' : 'Create Tag'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Tag Usage Modal
 */
interface TagUsageModalProps {
  tag: TagItem | null;
  opened: boolean;
  onClose: () => void;
}

const TagUsageModal: React.FC<TagUsageModalProps> = ({ tag, opened, onClose }) => {
  if (!tag) return null;

  // Mock usage data
  const usageData = [
    { type: 'Patient', name: 'John Doe', date: '2024-01-20', id: 'PAT-001' },
    { type: 'Appointment', name: 'Follow-up Visit', date: '2024-01-19', id: 'APT-123' },
    { type: 'Patient', name: 'Jane Smith', date: '2024-01-18', id: 'PAT-002' },
    { type: 'Resource', name: 'Diabetes Care Guide', date: '2024-01-17', id: 'RES-045' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Tag Usage: ${tag.name}`}
      size="lg"
    >
      <Stack gap="md">
        <Group>
          <ColorSwatch color={tag.color} size={24} />
          <div>
            <Text fw={500}>{tag.name}</Text>
            <Text size="sm" c="dimmed">
              Used {tag.usageCount} times
            </Text>
          </div>
        </Group>

        <Divider />

        <div>
          <Text fw={500} mb="md">
            Recent Usage
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {usageData.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Badge size="sm" variant="light">
                      {item.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {item.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>{item.date}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

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
 * Main Tags Page Component
 */
export const TagsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [usageOpened, { open: openUsage, close: closeUsage }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Using mock data for now
  const tags = mockTags;
  const isLoading = false;

  const handleEditTag = (tag: TagItem) => {
    setSelectedTag(tag);
    openForm();
  };

  const handleCreateTag = () => {
    setSelectedTag(null);
    openForm();
  };

  const handleDeleteTag = (tag: TagItem) => {
    // TODO: Implement tag deletion
    console.log('Delete tag:', tag);
  };

  const handleToggleStatus = (tag: TagItem) => {
    // TODO: Implement status toggle
    console.log('Toggle status:', tag);
  };

  const handleSaveTag = (tagData: Partial<TagItem>) => {
    // TODO: Implement tag save
    console.log('Save tag:', tagData);
  };

  const handleViewUsage = (tag: TagItem) => {
    setSelectedTag(tag);
    openUsage();
  };

  const filteredTags = tags
    .filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(tag => !categoryFilter || tag.category === categoryFilter)
    .filter(tag => {
      if (statusFilter === 'active') return tag.isActive;
      if (statusFilter === 'inactive') return !tag.isActive;
      return true;
    });

  // Calculate summary statistics
  const activeTags = tags.filter(t => t.isActive).length;
  const totalUsage = tags.reduce((sum, t) => sum + t.usageCount, 0);
  const categories = [...new Set(tags.map(t => t.category))].length;
  const avgUsage = Math.round(totalUsage / tags.length);

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Tags &amp; Labels</Title>
            <Text c="dimmed">Organize and categorize your healthcare data</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={handleCreateTag}>
            Create Tag
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Tags
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Tag size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activeTags}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Usage
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <Hash size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {totalUsage.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Categories
                </Text>
                <ActionIcon variant="light" color="orange" size="lg">
                  <Palette size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="orange">
                {categories}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Avg Usage
                </Text>
                <ActionIcon variant="light" color="indigo" size="lg">
                  <Eye size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="indigo">
                {avgUsage}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search tags..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by category"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'patient', label: 'Patient' },
                  { value: 'appointment', label: 'Appointment' },
                  { value: 'resource', label: 'Resource' },
                  { value: 'billing', label: 'Billing' },
                  { value: 'general', label: 'General' },
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Settings size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
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

        {/* Tags Display */}
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredTags.map((tag) => (
              <Grid.Col key={tag.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <TagCard
                  tag={tag}
                  onEdit={handleEditTag}
                  onDelete={handleDeleteTag}
                  onToggleStatus={handleToggleStatus}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tag</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Usage</Table.Th>
                  <Table.Th>Created By</Table.Th>
                  <Table.Th>Last Used</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTags.map((tag) => (
                  <Table.Tr key={tag.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <ColorSwatch color={tag.color} size={20} />
                        <div>
                          <Text fw={500}>{tag.name}</Text>
                          <Text size="sm" c="dimmed" lineClamp={1}>
                            {tag.description}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        color={tag.category === 'patient' ? 'blue' : 
                               tag.category === 'appointment' ? 'green' :
                               tag.category === 'resource' ? 'orange' :
                               tag.category === 'billing' ? 'purple' : 'gray'}
                      >
                        {tag.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={tag.isActive ? 'green' : 'red'} size="sm">
                        {tag.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{tag.usageCount}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{tag.createdBy}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{tag.lastUsed}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label={tag.isActive ? 'Deactivate' : 'Activate'}>
                          <ActionIcon
                            variant="light"
                            color={tag.isActive ? 'red' : 'green'}
                            onClick={() => handleToggleStatus(tag)}
                            size="sm"
                          >
                            <Settings size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleEditTag(tag)}
                            size="sm"
                          >
                            <Edit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteTag(tag)}
                            size="sm"
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredTags.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Tag size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No tags found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || categoryFilter || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first tag'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={handleCreateTag}>
                Create Tag
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Tag Form Modal */}
      <TagFormModal
        tag={selectedTag}
        opened={formOpened}
        onClose={closeForm}
        onSave={handleSaveTag}
      />

      {/* Tag Usage Modal */}
      <TagUsageModal
        tag={selectedTag}
        opened={usageOpened}
        onClose={closeUsage}
      />
    </Container>
  );
};