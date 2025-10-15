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
  Menu,
  rem,
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
  Copy,
  Download,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

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
 * Initial mock data for tags (converted to stateful)
 */
const initialTags: TagItem[] = [
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
  onDuplicate: (tag: TagItem) => void;
  onViewUsage: (tag: TagItem) => void;
}

const TagCard: React.FC<TagCardProps> = ({ 
  tag, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onDuplicate, 
  onViewUsage 
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ColorSwatch color={tag.color} size={24} />
            <div>
              <Text fw={500} size="sm">
                {tag.name}
              </Text>
              <Badge
                size="xs"
                color={tag.category === 'patient' ? 'blue' : 
                       tag.category === 'appointment' ? 'green' :
                       tag.category === 'resource' ? 'orange' :
                       tag.category === 'billing' ? 'purple' : 'gray'}
              >
                {tag.category}
              </Badge>
            </div>
          </Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" size="sm">
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Edit style={{ width: rem(14), height: rem(14) }} />} onClick={() => onEdit(tag)}>
                Edit Tag
              </Menu.Item>
              <Menu.Item leftSection={<Copy style={{ width: rem(14), height: rem(14) }} />} onClick={() => onDuplicate(tag)}>
                Duplicate
              </Menu.Item>
              <Menu.Item leftSection={<Eye style={{ width: rem(14), height: rem(14) }} />} onClick={() => onViewUsage(tag)}>
                View Usage
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<Settings style={{ width: rem(14), height: rem(14) }} />} 
                onClick={() => onToggleStatus(tag)}
                color={tag.isActive ? 'red' : 'green'}
              >
                {tag.isActive ? 'Deactivate' : 'Activate'}
              </Menu.Item>
              <Menu.Item 
                leftSection={<Trash2 style={{ width: rem(14), height: rem(14) }} />} 
                onClick={() => onDelete(tag)}
                color="red"
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Description */}
        <Text size="sm" c="dimmed" lineClamp={2}>
          {tag.description}
        </Text>

        {/* Status and Usage */}
        <Group justify="space-between" align="center">
          <Badge color={tag.isActive ? 'green' : 'red'} size="sm">
            {tag.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Text size="xs" c="dimmed">
            Used {tag.usageCount} times
          </Text>
        </Group>

        {/* Footer */}
        <Group justify="space-between" align="center" mt="xs">
          <Text size="xs" c="dimmed">
            By {tag.createdBy}
          </Text>
          <Text size="xs" c="dimmed">
            {tag.lastUsed}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Tag Form Modal Component
 */
interface TagFormModalProps {
  tag: TagItem | null;
  opened: boolean;
  onClose: () => void;
  onSave: (tag: Partial<TagItem>) => void;
  isLoading: boolean;
}

const TagFormModal: React.FC<TagFormModalProps> = ({ tag, opened, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2563eb',
    category: 'general' as TagItem['category'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        description: tag.description,
        color: tag.color,
        category: tag.category,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#2563eb',
        category: 'general',
      });
    }
    setErrors({});
  }, [tag, opened]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tag name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Tag name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const predefinedColors = [
    '#ff4757', '#ffa502', '#2ed573', '#5352ed', '#ff6b81',
    '#70a1ff', '#747d8c', '#ffd700', '#ff3838', '#ff9f43',
    '#10ac84', '#5f27cd', '#ee5a52', '#0abde3', '#222f3e',
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
          error={errors.name}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter tag description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          error={errors.description}
          minRows={3}
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value as TagItem['category'] })}
          data={[
            { value: 'patient', label: 'Patient' },
            { value: 'appointment', label: 'Appointment' },
            { value: 'resource', label: 'Resource' },
            { value: 'billing', label: 'Billing' },
            { value: 'general', label: 'General' },
          ]}
          required
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Color
          </Text>
          <Group gap="xs" mb="sm">
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
            size="sm"
          />
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {tag ? 'Update Tag' : 'Create Tag'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Tag Usage Modal Component
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
    { type: 'Patients', count: Math.floor(tag.usageCount * 0.6), icon: Users },
    { type: 'Appointments', count: Math.floor(tag.usageCount * 0.3), icon: Calendar },
    { type: 'Resources', count: Math.floor(tag.usageCount * 0.1), icon: FileText },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={`Usage Details: ${tag.name}`} size="md">
      <Stack gap="md">
        <Group gap="sm" mb="md">
          <ColorSwatch color={tag.color} size={24} />
          <div>
            <Text fw={500}>{tag.name}</Text>
            <Text size="sm" c="dimmed">{tag.description}</Text>
          </div>
        </Group>

        <Text size="sm" fw={500} mb="xs">Usage Breakdown</Text>
        
        {usageData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.type} padding="sm" withBorder>
              <Group justify="space-between">
                <Group gap="sm">
                  <ActionIcon variant="light" size="sm">
                    <Icon size={16} />
                  </ActionIcon>
                  <Text size="sm">{item.type}</Text>
                </Group>
                <Badge variant="light">{item.count}</Badge>
              </Group>
            </Card>
          );
        })}

        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Total Usage</Text>
          <Text fw={500}>{tag.usageCount}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Last Used</Text>
          <Text size="sm">{tag.lastUsed}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Created By</Text>
          <Text size="sm">{tag.createdBy}</Text>
        </Group>

        <Button fullWidth onClick={onClose} mt="md">
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

/**
 * Main Tags Page Component
 */
export const TagsPage: React.FC = () => {
  // State management
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [usageOpened, { open: openUsage, close: closeUsage }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  /**
   * Handle tag editing
   */
  const handleEditTag = (tag: TagItem) => {
    setSelectedTag(tag);
    openForm();
  };

  /**
   * Handle tag creation
   */
  const handleCreateTag = () => {
    setSelectedTag(null);
    openForm();
  };

  /**
   * Handle tag deletion with confirmation
   */
  const handleDeleteTag = (tag: TagItem) => {
    modals.openConfirmModal({
      title: 'Delete Tag',
      children: (
        <Stack gap="sm">
          <Group gap="sm">
            <ColorSwatch color={tag.color} size={20} />
            <Text>Are you sure you want to delete "{tag.name}"?</Text>
          </Group>
          <Text size="sm" c="dimmed">
            This action cannot be undone. The tag will be removed from all associated items.
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setIsLoading(true);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setTags(prev => prev.filter(t => t.id !== tag.id));
          
          notifications.show({
            title: 'Tag Deleted',
            message: `"${tag.name}" has been successfully deleted.`,
            color: 'green',
            icon: <Check size={16} />,
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete tag. Please try again.',
            color: 'red',
            icon: <X size={16} />,
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  /**
   * Handle tag status toggle
   */
  const handleToggleStatus = async (tag: TagItem) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTags(prev => prev.map(t => 
        t.id === tag.id 
          ? { ...t, isActive: !t.isActive, lastUsed: new Date().toISOString().split('T')[0] }
          : t
      ));
      
      notifications.show({
        title: 'Status Updated',
        message: `"${tag.name}" has been ${!tag.isActive ? 'activated' : 'deactivated'}.`,
        color: 'blue',
        icon: <Check size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update tag status. Please try again.',
        color: 'red',
        icon: <X size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle tag save (create/update)
   */
  const handleSaveTag = async (tagData: Partial<TagItem>) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedTag) {
        // Update existing tag
        setTags(prev => prev.map(t => 
          t.id === selectedTag.id 
            ? { 
                ...t, 
                ...tagData, 
                lastUsed: new Date().toISOString().split('T')[0] 
              }
            : t
        ));
        
        notifications.show({
          title: 'Tag Updated',
          message: `"${tagData.name}" has been successfully updated.`,
          color: 'green',
          icon: <Check size={16} />,
        });
      } else {
        // Create new tag
        const newTag: TagItem = {
          id: `TAG-${String(tags.length + 1).padStart(3, '0')}`,
          name: tagData.name!,
          description: tagData.description!,
          color: tagData.color!,
          category: tagData.category!,
          isActive: true,
          usageCount: 0,
          createdBy: 'Current User',
          createdAt: new Date().toISOString().split('T')[0],
          lastUsed: new Date().toISOString().split('T')[0],
        };
        
        setTags(prev => [...prev, newTag]);
        
        notifications.show({
          title: 'Tag Created',
          message: `"${tagData.name}" has been successfully created.`,
          color: 'green',
          icon: <Check size={16} />,
        });
      }
      
      closeForm();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save tag. Please try again.',
        color: 'red',
        icon: <X size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle tag duplication
   */
  const handleDuplicateTag = async (tag: TagItem) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duplicatedTag: TagItem = {
        ...tag,
        id: `TAG-${String(tags.length + 1).padStart(3, '0')}`,
        name: `${tag.name} (Copy)`,
        usageCount: 0,
        createdBy: 'Current User',
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: new Date().toISOString().split('T')[0],
      };
      
      setTags(prev => [...prev, duplicatedTag]);
      
      notifications.show({
        title: 'Tag Duplicated',
        message: `"${duplicatedTag.name}" has been created.`,
        color: 'green',
        icon: <Check size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate tag. Please try again.',
        color: 'red',
        icon: <X size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle view usage
   */
  const handleViewUsage = (tag: TagItem) => {
    setSelectedTag(tag);
    openUsage();
  };

  /**
   * Handle bulk delete
   */
  const handleBulkDelete = () => {
    if (selectedTags.length === 0) return;

    modals.openConfirmModal({
      title: 'Delete Multiple Tags',
      children: (
        <Stack gap="sm">
          <Text>Are you sure you want to delete {selectedTags.length} selected tags?</Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. The tags will be removed from all associated items.
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setIsLoading(true);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setTags(prev => prev.filter(t => !selectedTags.includes(t.id)));
          setSelectedTags([]);
          
          notifications.show({
            title: 'Tags Deleted',
            message: `${selectedTags.length} tags have been successfully deleted.`,
            color: 'green',
            icon: <Check size={16} />,
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete tags. Please try again.',
            color: 'red',
            icon: <X size={16} />,
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  /**
   * Handle export tags
   */
  const handleExportTags = () => {
    try {
      const exportData = filteredTags.map(tag => ({
        name: tag.name,
        description: tag.description,
        category: tag.category,
        color: tag.color,
        status: tag.isActive ? 'Active' : 'Inactive',
        usageCount: tag.usageCount,
        createdBy: tag.createdBy,
        createdAt: tag.createdAt,
        lastUsed: tag.lastUsed,
      }));

      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tags-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: 'Export Successful',
        message: 'Tags have been exported to CSV file.',
        color: 'green',
        icon: <Check size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Export Failed',
        message: 'Failed to export tags. Please try again.',
        color: 'red',
        icon: <X size={16} />,
      });
    }
  };

  // Filter tags based on search and filters
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
            <Title order={2}>Tags & Labels</Title>
            <Text c="dimmed">Organize and categorize your healthcare data</Text>
            {filteredTags.length !== tags.length && (
              <Text size="sm" c="dimmed">
                Showing {filteredTags.length} of {tags.length} tags
              </Text>
            )}
          </div>
          <Group gap="sm">
            {selectedTags.length > 0 && (
              <Button
                variant="light"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={handleBulkDelete}
                loading={isLoading}
              >
                Delete ({selectedTags.length})
              </Button>
            )}
            <Button
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportTags}
              disabled={filteredTags.length === 0}
            >
              Export
            </Button>
            <Button 
              leftSection={<Plus size={16} />} 
              onClick={handleCreateTag}
              loading={isLoading}
            >
              Create Tag
            </Button>
          </Group>
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
                  onDuplicate={handleDuplicateTag}
                  onViewUsage={handleViewUsage}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
                      indeterminate={selectedTags.length > 0 && selectedTags.length < filteredTags.length}
                      onChange={(event) => {
                        if (event.currentTarget.checked) {
                          setSelectedTags(filteredTags.map(t => t.id));
                        } else {
                          setSelectedTags([]);
                        }
                      }}
                    />
                  </Table.Th>
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
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setSelectedTags(prev => [...prev, tag.id]);
                          } else {
                            setSelectedTags(prev => prev.filter(id => id !== tag.id));
                          }
                        }}
                      />
                    </Table.Td>
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
                            loading={isLoading}
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
                            loading={isLoading}
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
        isLoading={isLoading}
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