/**
 * Tags-Medplum Page Component
 * Manages tags using FHIR CodeSystem data with comprehensive UI features
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
  Alert,
  SegmentedControl,
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
  Database,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { medplumClient } from '../../config/medplum';
import { CodeSystem } from '@medplum/fhirtypes';

/**
 * FHIR Tag Card Component (Enhanced)
 */
interface FHIRTagCardProps {
  codeSystem: CodeSystem;
  onEdit: (codeSystem: CodeSystem) => void;
  onDelete: (codeSystem: CodeSystem) => void;
  onToggleStatus: (codeSystem: CodeSystem) => void;
  onDuplicate: (codeSystem: CodeSystem) => void;
  onViewUsage: (codeSystem: CodeSystem) => void;
}

const FHIRTagCard: React.FC<FHIRTagCardProps> = ({ 
  codeSystem, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onDuplicate, 
  onViewUsage 
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'retired':
        return 'red';
      case 'draft':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTagName = () => {
    return codeSystem.name || codeSystem.title || 'Unnamed Tag System';
  };

  const getConceptCount = () => {
    return codeSystem.concept?.length || 0;
  };

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getCategoryFromUrl = (url?: string) => {
    if (!url) return 'general';
    if (url.includes('patient')) return 'patient';
    if (url.includes('appointment')) return 'appointment';
    if (url.includes('resource')) return 'resource';
    if (url.includes('billing')) return 'billing';
    return 'general';
  };

  const category = getCategoryFromUrl(codeSystem.url);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ColorSwatch color={getRandomColor()} size={24} />
            <div>
              <Text fw={500} size="sm">
                {getTagName()}
              </Text>
              <Badge
                size="xs"
                color={category === 'patient' ? 'blue' : 
                       category === 'appointment' ? 'green' :
                       category === 'resource' ? 'orange' :
                       category === 'billing' ? 'purple' : 'gray'}
              >
                {category}
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
              <Menu.Item leftSection={<Edit style={{ width: rem(14), height: rem(14) }} />} onClick={() => onEdit(codeSystem)}>
                Edit Tag
              </Menu.Item>
              <Menu.Item leftSection={<Copy style={{ width: rem(14), height: rem(14) }} />} onClick={() => onDuplicate(codeSystem)}>
                Duplicate
              </Menu.Item>
              <Menu.Item leftSection={<Eye style={{ width: rem(14), height: rem(14) }} />} onClick={() => onViewUsage(codeSystem)}>
                View Usage
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<Settings style={{ width: rem(14), height: rem(14) }} />} 
                onClick={() => onToggleStatus(codeSystem)}
                color={codeSystem.status === 'active' ? 'red' : 'green'}
              >
                {codeSystem.status === 'active' ? 'Retire' : 'Activate'}
              </Menu.Item>
              <Menu.Item 
                leftSection={<Trash2 style={{ width: rem(14), height: rem(14) }} />} 
                onClick={() => onDelete(codeSystem)}
                color="red"
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Description */}
        <Text size="sm" c="dimmed" lineClamp={2}>
          {codeSystem.description || 'No description available'}
        </Text>

        {/* Status and Usage */}
        <Group justify="space-between" align="center">
          <Badge color={getStatusColor(codeSystem.status)} size="sm">
            {codeSystem.status || 'Unknown'}
          </Badge>
          <Text size="xs" c="dimmed">
            {getConceptCount()} concepts
          </Text>
        </Group>

        {/* Footer */}
        <Group justify="space-between" align="center" mt="xs">
          <Text size="xs" c="dimmed">
            Version: {codeSystem.version || 'N/A'}
          </Text>
          <Badge size="xs" color="green" variant="light">
            <Database size={10} style={{ marginRight: 4 }} />
            FHIR
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * FHIR Tag Form Modal Component
 */
interface FHIRTagFormModalProps {
  codeSystem: CodeSystem | null;
  opened: boolean;
  onClose: () => void;
  onSave: (codeSystemData: Partial<CodeSystem>) => void;
  isLoading: boolean;
}

const FHIRTagFormModal: React.FC<FHIRTagFormModalProps> = ({ codeSystem, opened, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    url: '',
    version: '',
    status: 'active' as 'active' | 'draft' | 'retired',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (codeSystem) {
      setFormData({
        name: codeSystem.name || '',
        title: codeSystem.title || '',
        description: codeSystem.description || '',
        url: codeSystem.url || '',
        version: codeSystem.version || '',
        status: (codeSystem.status as 'active' | 'draft' | 'retired') || 'active',
      });
    } else {
      setFormData({
        name: '',
        title: '',
        description: '',
        url: '',
        version: '1.0.0',
        status: 'active',
      });
    }
    setErrors({});
  }, [codeSystem, opened]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={codeSystem ? 'Edit FHIR CodeSystem' : 'Create New FHIR CodeSystem'}
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Enter system name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          error={errors.name}
          required
        />

        <TextInput
          label="Title"
          placeholder="Enter display title"
          value={formData.title}
          onChange={(event) => setFormData({ ...formData, title: event.currentTarget.value })}
          error={errors.title}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          error={errors.description}
          minRows={3}
          required
        />

        <TextInput
          label="URL"
          placeholder="Enter system URL"
          value={formData.url}
          onChange={(event) => setFormData({ ...formData, url: event.currentTarget.value })}
          error={errors.url}
          required
        />

        <TextInput
          label="Version"
          placeholder="Enter version"
          value={formData.version}
          onChange={(event) => setFormData({ ...formData, version: event.currentTarget.value })}
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'draft' | 'retired' })}
          data={[
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'retired', label: 'Retired' },
          ]}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {codeSystem ? 'Update CodeSystem' : 'Create CodeSystem'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * FHIR Tag Usage Modal Component
 */
interface FHIRTagUsageModalProps {
  codeSystem: CodeSystem | null;
  opened: boolean;
  onClose: () => void;
}

const FHIRTagUsageModal: React.FC<FHIRTagUsageModalProps> = ({ codeSystem, opened, onClose }) => {
  if (!codeSystem) return null;

  const getTagName = () => {
    return codeSystem.name || codeSystem.title || 'Unnamed Tag System';
  };

  const getConceptCount = () => {
    return codeSystem.concept?.length || 0;
  };

  // Mock usage data based on FHIR CodeSystem
  const usageData = [
    { type: 'Patients', count: Math.floor(getConceptCount() * 0.6), icon: Users },
    { type: 'Appointments', count: Math.floor(getConceptCount() * 0.3), icon: Calendar },
    { type: 'Resources', count: Math.floor(getConceptCount() * 0.1), icon: FileText },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={`Usage Details: ${getTagName()}`} size="md">
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          FHIR CodeSystem ID: {codeSystem.id}
        </Alert>

        <Group gap="sm" mb="md">
          <div>
            <Text fw={500}>{getTagName()}</Text>
            <Text size="sm" c="dimmed">{codeSystem.description || 'No description'}</Text>
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
          <Text size="sm" c="dimmed">Total Concepts</Text>
          <Text fw={500}>{getConceptCount()}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Status</Text>
          <Badge color={codeSystem.status === 'active' ? 'green' : 'yellow'}>
            {codeSystem.status || 'Unknown'}
          </Badge>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Version</Text>
          <Text size="sm">{codeSystem.version || 'N/A'}</Text>
        </Group>

        <Button fullWidth onClick={onClose} mt="md">
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

/**
 * Main Tags-Medplum Page Component
 */
const TagsMedplumPage: React.FC = () => {
  // State management
  const [codeSystems, setCodeSystems] = useState<CodeSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  
  // Modal states
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [usageModalOpened, setUsageModalOpened] = useState(false);
  const [selectedCodeSystem, setSelectedCodeSystem] = useState<CodeSystem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch CodeSystems from Medplum
  useEffect(() => {
    const fetchCodeSystems = async () => {
      try {
        setLoading(true);
        const bundle = await medplumClient.searchResources('CodeSystem');
        setCodeSystems(bundle);
        setError(null);
      } catch (err) {
        console.error('Error fetching CodeSystems:', err);
        setError('Failed to fetch CodeSystems');
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch FHIR CodeSystems',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCodeSystems();
  }, []);

  // Helper functions
  const getCategoryFromUrl = (url?: string) => {
    if (!url) return 'general';
    if (url.includes('patient')) return 'patient';
    if (url.includes('appointment')) return 'appointment';
    if (url.includes('resource')) return 'resource';
    if (url.includes('billing')) return 'billing';
    return 'general';
  };

  const getTagName = (codeSystem: CodeSystem) => {
    return codeSystem.name || codeSystem.title || 'Unnamed Tag System';
  };

  // Filter code systems based on search term, category, and status
  const filteredCodeSystems = useMemo(() => {
    return codeSystems.filter(codeSystem => {
      const matchesSearch = searchTerm === '' || 
        (codeSystem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         codeSystem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         codeSystem.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
        getCategoryFromUrl(codeSystem.url) === categoryFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        codeSystem.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [codeSystems, searchTerm, categoryFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const activeCount = codeSystems.filter(cs => cs.status === 'active').length;
    const totalConcepts = codeSystems.reduce((sum, cs) => sum + (cs.concept?.length || 0), 0);
    const categories = [...new Set(codeSystems.map(cs => getCategoryFromUrl(cs.url)))].length;
    const avgConcepts = codeSystems.length > 0 ? Math.round(totalConcepts / codeSystems.length) : 0;

    return {
      active: activeCount,
      total: codeSystems.length,
      concepts: totalConcepts,
      categories,
      average: avgConcepts,
    };
  }, [codeSystems]);

  // Event handlers
  const handleEdit = (codeSystem: CodeSystem) => {
    setSelectedCodeSystem(codeSystem);
    setIsCreating(false);
    setFormModalOpened(true);
  };

  const handleCreate = () => {
    setSelectedCodeSystem(null);
    setIsCreating(true);
    setFormModalOpened(true);
  };

  const handleDelete = (codeSystem: CodeSystem) => {
    modals.openConfirmModal({
      title: 'Delete CodeSystem',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{getTagName(codeSystem)}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
         try {
           if (codeSystem.id) {
             await medplumClient.deleteResource('CodeSystem', codeSystem.id);
             setCodeSystems(prev => prev.filter(cs => cs.id !== codeSystem.id));
             notifications.show({
               title: 'Success',
               message: 'CodeSystem deleted successfully',
               color: 'green',
             });
           }
         } catch (err) {
           console.error('Error deleting CodeSystem:', err);
           notifications.show({
             title: 'Error',
             message: 'Failed to delete CodeSystem',
             color: 'red',
           });
         }
       },
    });
  };

  const handleToggleStatus = async (codeSystem: CodeSystem) => {
    try {
      const newStatus: 'active' | 'retired' = codeSystem.status === 'active' ? 'retired' : 'active';
      const updatedCodeSystem = { ...codeSystem, status: newStatus };
      
      if (codeSystem.id) {
         await medplumClient.updateResource(updatedCodeSystem);
         setCodeSystems(prev => prev.map(cs => 
           cs.id === codeSystem.id ? updatedCodeSystem as CodeSystem : cs
         ));
         notifications.show({
           title: 'Success',
           message: `CodeSystem ${newStatus === 'active' ? 'activated' : 'retired'} successfully`,
           color: 'green',
         });
       }
    } catch (err) {
      console.error('Error updating CodeSystem status:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to update CodeSystem status',
        color: 'red',
      });
    }
  };

  const handleDuplicate = (codeSystem: CodeSystem) => {
    const duplicatedCodeSystem = {
      ...codeSystem,
      id: undefined,
      name: `${codeSystem.name || 'Copy'} - Copy`,
      title: `${codeSystem.title || 'Copy'} - Copy`,
      url: `${codeSystem.url || 'http://example.com'}-copy`,
      version: '1.0.0',
      status: 'draft' as const,
    };
    setSelectedCodeSystem(duplicatedCodeSystem);
    setIsCreating(true);
    setFormModalOpened(true);
  };

  const handleViewUsage = (codeSystem: CodeSystem) => {
    setSelectedCodeSystem(codeSystem);
    setUsageModalOpened(true);
  };

  const handleSave = async (codeSystemData: Partial<CodeSystem>) => {
    try {
      setSaveLoading(true);
      
      if (isCreating) {
         const newCodeSystem = await medplumClient.createResource({
           resourceType: 'CodeSystem',
           ...codeSystemData,
         } as CodeSystem);
         setCodeSystems(prev => [...prev, newCodeSystem]);
         notifications.show({
           title: 'Success',
           message: 'CodeSystem created successfully',
           color: 'green',
         });
       } else if (selectedCodeSystem?.id) {
         const updatedCodeSystem = await medplumClient.updateResource({
           ...selectedCodeSystem,
           ...codeSystemData,
         });
         setCodeSystems(prev => prev.map(cs => 
           cs.id === selectedCodeSystem.id ? updatedCodeSystem : cs
         ));
         notifications.show({
           title: 'Success',
           message: 'CodeSystem updated successfully',
           color: 'green',
         });
       }
      
      setFormModalOpened(false);
      setSelectedCodeSystem(null);
    } catch (err) {
      console.error('Error saving CodeSystem:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to save CodeSystem',
        color: 'red',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTags.size === 0) return;

    modals.openConfirmModal({
      title: 'Delete Selected CodeSystems',
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedTags.size} selected CodeSystem(s)? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
           const deletePromises = Array.from(selectedTags).map(id => 
             medplumClient.deleteResource('CodeSystem', id)
           );
           await Promise.all(deletePromises);
           
           setCodeSystems(prev => prev.filter(cs => !selectedTags.has(cs.id!)));
           setSelectedTags(new Set());
           
           notifications.show({
             title: 'Success',
             message: `${selectedTags.size} CodeSystem(s) deleted successfully`,
             color: 'green',
           });
         } catch (err) {
           console.error('Error deleting CodeSystems:', err);
           notifications.show({
             title: 'Error',
             message: 'Failed to delete some CodeSystems',
             color: 'red',
           });
         }
      },
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Title', 'Description', 'Status', 'URL', 'Version', 'Concepts'].join(','),
      ...filteredCodeSystems.map(cs => [
        getTagName(cs),
        cs.title || '',
        cs.description || '',
        cs.status || '',
        cs.url || '',
        cs.version || '',
        cs.concept?.length || 0
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fhir-codesystems.csv';
    a.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Success',
      message: 'CodeSystems exported successfully',
      color: 'green',
    });
  };

  const handleSelectTag = (tagId: string, selected: boolean) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(tagId);
      } else {
        newSet.delete(tagId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTags(new Set(filteredCodeSystems.map(cs => cs.id!).filter(Boolean)));
    } else {
      setSelectedTags(new Set());
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR code systems...</Text>
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
            <Title order={1}>Tags</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage code systems and tags</Text>
            </Group>
          </Stack>
          <Group>
            {selectedTags.size > 0 && (
              <Button
                variant="light"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={handleBulkDelete}
              >
                Delete ({selectedTags.size})
              </Button>
            )}
            <Button
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={handleCreate}>
              Create Tag System
            </Button>
          </Group>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}



        {/* Summary Cards */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    Active CodeSystems
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.active}
                  </Text>
                </div>
                <ActionIcon variant="light" color="green" size="xl" radius="md">
                  <Check size={24} />
                </ActionIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    Total Concepts
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.concepts}
                  </Text>
                </div>
                <ActionIcon variant="light" color="blue" size="xl" radius="md">
                  <Hash size={24} />
                </ActionIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    Categories
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.categories}
                  </Text>
                </div>
                <ActionIcon variant="light" color="orange" size="xl" radius="md">
                  <Palette size={24} />
                </ActionIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    Avg Concepts
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.average}
                  </Text>
                </div>
                <ActionIcon variant="light" color="purple" size="xl" radius="md">
                  <Database size={24} />
                </ActionIcon>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters and Search */}
        <Card padding="lg" radius="md" withBorder mb="xl">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text fw={500}>Filters & Search</Text>
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as 'cards' | 'table')}
                data={[
                  { label: 'Cards', value: 'cards' },
                  { label: 'Table', value: 'table' },
                ]}
              />
            </Group>

            <Group grow>
              <TextInput
                placeholder="Search CodeSystems..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                leftSection={<Search size={16} />}
              />
              <Select
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'patient', label: 'Patient' },
                  { value: 'appointment', label: 'Appointment' },
                  { value: 'resource', label: 'Resource' },
                  { value: 'billing', label: 'Billing' },
                  { value: 'general', label: 'General' },
                ]}
              />
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'retired', label: 'Retired' },
                ]}
              />
            </Group>
          </Stack>
        </Card>

        {/* Content */}
        {viewMode === 'cards' ? (
          <Grid>
            {filteredCodeSystems.map((codeSystem) => (
              <Grid.Col key={codeSystem.id} span={{ base: 12, sm: 6, md: 4 }}>
                <FHIRTagCard
                  codeSystem={codeSystem}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onDuplicate={handleDuplicate}
                  onViewUsage={handleViewUsage}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card padding="lg" radius="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={selectedTags.size === filteredCodeSystems.length && filteredCodeSystems.length > 0}
                      indeterminate={selectedTags.size > 0 && selectedTags.size < filteredCodeSystems.length}
                      onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                    />
                  </Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Concepts</Table.Th>
                  <Table.Th>Version</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCodeSystems.map((codeSystem) => (
                  <Table.Tr key={codeSystem.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedTags.has(codeSystem.id!)}
                        onChange={(event) => handleSelectTag(codeSystem.id!, event.currentTarget.checked)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text fw={500} size="sm">
                          {getTagName(codeSystem)}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {codeSystem.description}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" color={
                        getCategoryFromUrl(codeSystem.url) === 'patient' ? 'blue' :
                        getCategoryFromUrl(codeSystem.url) === 'appointment' ? 'green' :
                        getCategoryFromUrl(codeSystem.url) === 'resource' ? 'orange' :
                        getCategoryFromUrl(codeSystem.url) === 'billing' ? 'purple' : 'gray'
                      }>
                        {getCategoryFromUrl(codeSystem.url)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={
                        codeSystem.status === 'active' ? 'green' :
                        codeSystem.status === 'retired' ? 'red' : 'yellow'
                      }>
                        {codeSystem.status || 'Unknown'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{codeSystem.concept?.length || 0}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{codeSystem.version || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="light"
                            size="sm"
                            onClick={() => handleEdit(codeSystem)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="View Usage">
                          <ActionIcon
                            variant="light"
                            size="sm"
                            onClick={() => handleViewUsage(codeSystem)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="light" size="sm">
                              <MoreVertical size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<Copy style={{ width: rem(14), height: rem(14) }} />} onClick={() => handleDuplicate(codeSystem)}>
                              Duplicate
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Settings style={{ width: rem(14), height: rem(14) }} />} 
                              onClick={() => handleToggleStatus(codeSystem)}
                              color={codeSystem.status === 'active' ? 'red' : 'green'}
                            >
                              {codeSystem.status === 'active' ? 'Retire' : 'Activate'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<Trash2 style={{ width: rem(14), height: rem(14) }} />} 
                              onClick={() => handleDelete(codeSystem)}
                              color="red"
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {filteredCodeSystems.length === 0 && (
          <Center h={300}>
            <Stack align="center" gap="md">
              <Database size={48} color="gray" />
              <div style={{ textAlign: 'center' }}>
                <Text fw={500} size="lg">No CodeSystems Found</Text>
                <Text c="dimmed" size="sm">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first FHIR CodeSystem to get started'}
                </Text>
              </div>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Button leftSection={<Plus size={16} />} onClick={handleCreate}>
                  Create CodeSystem
                </Button>
              )}
            </Stack>
          </Center>
        )}

        {/* Modals */}
        <FHIRTagFormModal
          codeSystem={selectedCodeSystem}
          opened={formModalOpened}
          onClose={() => {
            setFormModalOpened(false);
            setSelectedCodeSystem(null);
          }}
          onSave={handleSave}
          isLoading={saveLoading}
        />

        <FHIRTagUsageModal
          codeSystem={selectedCodeSystem}
          opened={usageModalOpened}
          onClose={() => {
            setUsageModalOpened(false);
            setSelectedCodeSystem(null);
          }}
        />
      </Stack>
    </Container>
  );
};

export default TagsMedplumPage;