/**
 * Forms-Medplum Page Component
 * Manages forms using FHIR data with comprehensive UI from Forms page
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
  ActionIcon,
  Modal,
  Center,
  Loader,
  Alert,
  Select,
  Table,
  ScrollArea,
  Menu,
  Tooltip,
  Paper,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  Clock,
  Users,
  Play,
  Database,
  AlertCircle,
  CheckCircle,
  Filter,
  Settings,
  MoreVertical,
  Copy,
  Download,
  Trash2,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { MultiStepForm } from '../../components/forms/MultiStepForm';
import { FormBuilder } from '../../components/forms/FormBuilder';
import { medplumClient } from '../../config/medplum';
import { Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';

/**
 * FHIR Form Card Component
 */
interface FHIRFormCardProps {
  questionnaire: Questionnaire;
  onView: (questionnaire: Questionnaire) => void;
  onEdit: (questionnaire: Questionnaire) => void;
  onTake: (questionnaire: Questionnaire) => void;
}

const FHIRFormCard: React.FC<FHIRFormCardProps> = ({ questionnaire, onView, onEdit, onTake }) => {
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

  const getFormName = () => {
    return questionnaire.title || questionnaire.name || 'Unnamed Form';
  };

  const getQuestionCount = () => {
    return questionnaire.item?.length || 0;
  };

  const getFormDescription = () => {
    return questionnaire.description || 'No description available';
  };

  const getFormVersion = () => {
    return questionnaire.version || 'N/A';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Questionnaire
            </Badge>
          </Group>
          <Badge color={getStatusColor(questionnaire.status)}>
            {questionnaire.status}
          </Badge>
        </Group>

        <Group>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '8px', 
            backgroundColor: '#45B7D1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} color="white" />
          </div>
          <Stack gap={4}>
            <Text fw={500}>{getFormName()}</Text>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {getFormDescription()}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <FileText size={14} />
            <Text size="sm">Questions: {getQuestionCount()}</Text>
          </Group>
          <Group gap="xs">
            <Clock size={14} />
            <Text size="sm">Version: {getFormVersion()}</Text>
          </Group>
          <Group gap="xs">
            <Users size={14} />
            <Text size="sm">Subject Type: {questionnaire.subjectType?.[0] || 'Patient'}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            ID: {questionnaire.id}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="green"
              onClick={() => onTake(questionnaire)}
              disabled={questionnaire.status !== 'active'}
            >
              <Play size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(questionnaire)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(questionnaire)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Main Forms-Medplum Page Component
 */
const FormsMedplumPage: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formBuilderOpened, setFormBuilderOpened] = useState(false);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [takeOpened, { open: openTake, close: closeTake }] = useDisclosure(false);
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);

  // Fetch FHIR questionnaires and responses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch questionnaires
        const questionnaireResponse = await medplumClient.search('Questionnaire', {
          _sort: 'title',
          _count: '50'
        });

        if (questionnaireResponse.entry) {
          const questionnaireData = questionnaireResponse.entry
            .filter(entry => entry.resource?.resourceType === 'Questionnaire')
            .map(entry => entry.resource as Questionnaire);
          
          setQuestionnaires(questionnaireData);
        } else {
          setQuestionnaires([]);
        }

        // Fetch questionnaire responses
        const responseResponse = await medplumClient.search('QuestionnaireResponse', {
          _sort: '-authored',
          _count: '50'
        });

        if (responseResponse.entry) {
          const responseData = responseResponse.entry
            .filter(entry => entry.resource?.resourceType === 'QuestionnaireResponse')
            .map(entry => entry.resource as QuestionnaireResponse);
          
          setResponses(responseData);
        } else {
          setResponses([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR data:', err);
        setError('Failed to fetch forms from FHIR server. Please check your connection.');
        setQuestionnaires([]);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter questionnaires
  const filteredQuestionnaires = useMemo(() => {
    return questionnaires.filter(questionnaire => {
      const matchesSearch = !searchTerm || 
        questionnaire.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        questionnaire.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        questionnaire.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        questionnaire.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || questionnaire.status === statusFilter;
      
      // For category filtering, we'll use the questionnaire's purpose or code
      const category = questionnaire.code?.[0]?.display || questionnaire.purpose || 'general';
      const matchesCategory = categoryFilter === 'all' || category.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [questionnaires, searchTerm, statusFilter, categoryFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    questionnaires.forEach(q => {
      const category = q.code?.[0]?.display || q.purpose || 'general';
      categorySet.add(category);
    });
    return Array.from(categorySet);
  }, [questionnaires]);

  const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openDetails();
  };

  const handlePreviewQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openPreview();
  };

  const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setFormBuilderOpened(true);
    
    notifications.show({
      title: 'Edit Mode',
      message: 'Form builder opened for editing. Changes will be saved automatically.',
      color: 'blue',
    });
  };

  const handleTakeQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openTake();
  };

  /**
   * Handles questionnaire duplication
   */
  const handleDuplicateQuestionnaire = async (questionnaire: Questionnaire) => {
    setLoading(true);
    try {
      // Create a duplicate questionnaire
      const duplicatedQuestionnaire: Questionnaire = {
        ...questionnaire,
        id: undefined, // Let FHIR server assign new ID
        title: `${questionnaire.title || questionnaire.name} (Copy)`,
        status: 'draft',
        date: new Date().toISOString(),
      };
      
      const result = await medplumClient.createResource(duplicatedQuestionnaire);
      
      // Refresh questionnaires list
      const questionnaireResponse = await medplumClient.search('Questionnaire', {
        _sort: 'title',
        _count: '50'
      });

      if (questionnaireResponse.entry) {
        const questionnaireData = questionnaireResponse.entry
          .filter(entry => entry.resource?.resourceType === 'Questionnaire')
          .map(entry => entry.resource as Questionnaire);
        
        setQuestionnaires(questionnaireData);
      }
      
      notifications.show({
        title: 'Questionnaire Duplicated',
        message: 'The questionnaire has been successfully duplicated.',
        color: 'green',
        icon: <CheckCircle size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Duplication Failed',
        message: 'There was an error duplicating the questionnaire. Please try again.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles questionnaire deletion with confirmation
   */
  const handleDeleteQuestionnaire = (questionnaire: Questionnaire) => {
    modals.openConfirmModal({
      title: 'Delete Questionnaire',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{questionnaire.title || questionnaire.name}"? This action cannot be undone.
          All associated responses will also be affected.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);
        try {
          if (questionnaire.id) {
            await medplumClient.deleteResource('Questionnaire', questionnaire.id);
            
            // Refresh questionnaires list
            const questionnaireResponse = await medplumClient.search('Questionnaire', {
              _sort: 'title',
              _count: '50'
            });

            if (questionnaireResponse.entry) {
              const questionnaireData = questionnaireResponse.entry
                .filter(entry => entry.resource?.resourceType === 'Questionnaire')
                .map(entry => entry.resource as Questionnaire);
              
              setQuestionnaires(questionnaireData);
            }
            
            notifications.show({
              title: 'Questionnaire Deleted',
              message: 'The questionnaire has been successfully deleted.',
              color: 'green',
              icon: <CheckCircle size={16} />,
            });
          }
        } catch (error) {
          notifications.show({
            title: 'Deletion Failed',
            message: 'There was an error deleting the questionnaire. Please try again.',
            color: 'red',
            icon: <AlertCircle size={16} />,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /**
   * Handles questionnaire export
   */
  const handleExportQuestionnaire = (questionnaire: Questionnaire) => {
    try {
      const dataStr = JSON.stringify(questionnaire, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${(questionnaire.title || questionnaire.name || 'questionnaire').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      notifications.show({
        title: 'Questionnaire Exported',
        message: 'The questionnaire has been exported successfully.',
        color: 'green',
        icon: <Download size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Export Failed',
        message: 'There was an error exporting the questionnaire.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    }
  };

  /**
   * Gets status color for questionnaire responses
   */
  const getStatusColor = (status: QuestionnaireResponse['status']) => {
    switch (status) {
      case 'in-progress': return 'orange';
      case 'completed': return 'green';
      case 'amended': return 'blue';
      case 'entered-in-error': return 'red';
      case 'stopped': return 'gray';
      default: return 'gray';
    }
  };

  /**
   * Gets status color for questionnaires
   */
  const getQuestionnaireStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'retired': return 'red';
      case 'draft': return 'yellow';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR questionnaires...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between">
          <div>
            <Title order={1}>Forms</Title>
            <Group gap="xs" mt="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">
                Manage and complete healthcare forms using FHIR Questionnaires
              </Text>
            </Group>
          </div>
          <Group>
            <Button
              leftSection={<Plus size={16} />}
              onClick={openCreate}
              loading={loading}
            >
              Create Form
            </Button>
            <Button
              leftSection={<Edit size={16} />}
              variant="outline"
              onClick={() => setFormBuilderOpened(true)}
            >
              Form Builder
            </Button>
          </Group>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Card padding="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Search & Filter</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {filteredQuestionnaires.length} of {questionnaires.length} forms
              </Text>
            </Group>
          </Group>
          <Group>
            <TextInput
              placeholder="Search forms..."
              leftSection={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Category"
              data={[
                { value: 'all', label: 'All Categories' },
                ...categories.map(cat => ({ 
                  value: cat, 
                  label: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                }))
              ]}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value || 'all')}
              leftSection={<Filter size={16} />}
            />
            <Select
              placeholder="Status"
              data={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'retired', label: 'Retired' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || 'all')}
              leftSection={<Settings size={16} />}
            />
          </Group>
        </Card>

        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Available Forms
                  </Text>
                  <Text fw={700} size="xl">
                    {questionnaires.length}
                  </Text>
                </div>
                <FileText size={24} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Active Forms
                  </Text>
                  <Text fw={700} size="xl">
                    {questionnaires.filter(q => q.status === 'active').length}
                  </Text>
                </div>
                <CheckCircle size={24} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Responses
                  </Text>
                  <Text fw={700} size="xl">
                    {responses.length}
                  </Text>
                </div>
                <Clock size={24} color="var(--mantine-color-orange-6)" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Draft Forms
                  </Text>
                  <Text fw={700} size="xl">
                    {questionnaires.filter(q => q.status === 'draft').length}
                  </Text>
                </div>
                <Users size={24} color="var(--mantine-color-violet-6)" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Available Forms */}
        <div>
          <Group justify="space-between" mb="md">
            <Title order={2}>Available Forms</Title>
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
          </Group>
          
          {filteredQuestionnaires.length === 0 ? (
            <Alert icon={<AlertCircle size={16} />}>
              No forms found matching your search criteria.
            </Alert>
          ) : viewMode === 'cards' ? (
          <Grid>
            {filteredQuestionnaires.map((questionnaire) => (
              <Grid.Col key={questionnaire.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" shadow="sm" h="100%">
                  <Stack gap="md" h="100%">
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Badge color="blue" variant="light">
                          {questionnaire.code?.[0]?.display || questionnaire.purpose || 'general'}
                        </Badge>
                        <Group gap="xs">
                          <Badge color={getQuestionnaireStatusColor(questionnaire.status)} size="sm">
                            {questionnaire.status || 'unknown'}
                          </Badge>
                          <Group gap={4}>
                            <Clock size={12} />
                            <Text size="xs" c="dimmed">
                              v{questionnaire.version || '1.0'}
                            </Text>
                          </Group>
                        </Group>
                      </Group>
                      <Title order={4} mb="xs">{questionnaire.title || questionnaire.name || 'Unnamed Form'}</Title>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {questionnaire.description || 'No description available'}
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        {questionnaire.item?.length || 0} questions
                      </Text>
                    </div>

                    <Group justify="space-between" mt="auto">
                      <Button
                        variant="filled"
                        leftSection={<Play size={16} />}
                        onClick={() => handleTakeQuestionnaire(questionnaire)}
                        size="sm"
                        disabled={questionnaire.status !== 'active'}
                      >
                        Start Form
                      </Button>
                      <Group gap="xs">
                        <Tooltip label="Preview">
                          <ActionIcon 
                            variant="subtle" 
                            size="sm"
                            onClick={() => handlePreviewQuestionnaire(questionnaire)}
                          >
                            <Eye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon 
                            variant="subtle" 
                            size="sm"
                            onClick={() => handleEditQuestionnaire(questionnaire)}
                          >
                            <Edit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                              <MoreVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              leftSection={<Copy size={14} />}
                              onClick={() => handleDuplicateQuestionnaire(questionnaire)}
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Download size={14} />}
                              onClick={() => handleExportQuestionnaire(questionnaire)}
                            >
                              Export
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<Trash2 size={14} />}
                              color="red"
                              onClick={() => handleDeleteQuestionnaire(questionnaire)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
          ) : (
          <Card>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Form Title</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Questions</Table.Th>
                  <Table.Th>Version</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredQuestionnaires.map((questionnaire) => (
                  <Table.Tr key={questionnaire.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{questionnaire.title || questionnaire.name || 'Unnamed Form'}</Text>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {questionnaire.description || 'No description'}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {questionnaire.code?.[0]?.display || questionnaire.purpose || 'general'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getQuestionnaireStatusColor(questionnaire.status)}>
                        {questionnaire.status || 'unknown'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{questionnaire.item?.length || 0}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Clock size={12} />
                        <Text size="sm">
                          {questionnaire.version || '1.0'}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          variant="filled"
                          leftSection={<Play size={16} />}
                          onClick={() => handleTakeQuestionnaire(questionnaire)}
                          size="xs"
                          disabled={questionnaire.status !== 'active'}
                        >
                          Start
                        </Button>
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          onClick={() => handlePreviewQuestionnaire(questionnaire)}
                        >
                          <Eye size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          onClick={() => handleEditQuestionnaire(questionnaire)}
                        >
                          <Edit size={16} />
                        </ActionIcon>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                              <MoreVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              leftSection={<Copy size={14} />}
                              onClick={() => handleDuplicateQuestionnaire(questionnaire)}
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Download size={14} />}
                              onClick={() => handleExportQuestionnaire(questionnaire)}
                            >
                              Export
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<Trash2 size={14} />}
                              color="red"
                              onClick={() => handleDeleteQuestionnaire(questionnaire)}
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
        </div>

        {/* Recent Responses */}
        <div>
          <Title order={2} mb="md">Recent Responses</Title>
          {responses.length > 0 ? (
            <Stack gap="sm">
              {responses.slice(0, 5).map((response) => {
                const questionnaire = questionnaires.find(q => q.id === response.questionnaire);
                return (
                  <Card key={response.id} padding="md">
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>{questionnaire?.title || questionnaire?.name || 'Unknown Form'}</Text>
                        <Text size="sm" c="dimmed">
                          Submitted on {response.authored ? new Date(response.authored).toLocaleDateString() : 'Unknown date'}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(response.status)}>
                        {response.status}
                      </Badge>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Alert icon={<AlertCircle size={16} />}>
              No form responses yet. Complete a form to see your responses here.
            </Alert>
          )}
        </div>

        {/* Form Taking Modal */}
        <Modal
          opened={takeOpened}
          onClose={closeTake}
          size="lg"
          title={null}
          padding={0}
          centered
          closeOnClickOutside={false}
          closeOnEscape={false}
        >
          {selectedQuestionnaire && (
            <MultiStepForm
              form={{
                id: selectedQuestionnaire.id,
                title: selectedQuestionnaire.title || selectedQuestionnaire.name || 'FHIR Questionnaire',
                description: selectedQuestionnaire.description || 'Complete this FHIR questionnaire',
                category: selectedQuestionnaire.code?.[0]?.display || selectedQuestionnaire.purpose || 'general',
                estimatedTime: '5-10 minutes',
                questions: selectedQuestionnaire.item?.map((item, index) => ({
                  id: item.linkId || `q${index}`,
                  type: item.type === 'string' ? 'text' : 
                        item.type === 'boolean' ? 'radio' :
                        item.type === 'choice' ? 'select' :
                        item.type === 'integer' ? 'number' : 'text',
                  question: item.text || `Question ${index + 1}`,
                  required: item.required || false,
                  options: item.answerOption?.map(option => ({
                    value: option.valueCoding?.code || option.valueString || '',
                    label: option.valueCoding?.display || option.valueString || ''
                  })) || []
                })) || []
              }}
              onSubmit={async (formData) => {
                try {
                  // Create FHIR QuestionnaireResponse
                  const response: Partial<QuestionnaireResponse> = {
                    resourceType: 'QuestionnaireResponse',
                    status: 'completed',
                    questionnaire: `Questionnaire/${selectedQuestionnaire.id}`,
                    item: Object.entries(formData).map(([linkId, answer]) => ({
                      linkId,
                      answer: [{
                        valueString: String(answer)
                      }]
                    }))
                  };

                  await medplumClient.createResource(response as QuestionnaireResponse);
                  
                  notifications.show({
                    title: 'Success',
                    message: 'Questionnaire response submitted successfully',
                    color: 'green',
                    icon: <CheckCircle size={16} />
                  });
                  
                  closeTake();
                  // Refresh responses
                  const updatedResponses = await medplumClient.searchResources('QuestionnaireResponse');
                  setResponses(updatedResponses);
                } catch (error) {
                  console.error('Error submitting questionnaire response:', error);
                  notifications.show({
                    title: 'Error',
                    message: 'Failed to submit questionnaire response',
                    color: 'red',
                    icon: <AlertCircle size={16} />
                  });
                }
              }}
              onClose={closeTake}
            />
          )}
        </Modal>

        {/* Form Preview Modal */}
        <Modal
          opened={previewOpened}
          onClose={closePreview}
          size="lg"
          title={`Preview: ${selectedQuestionnaire?.title || selectedQuestionnaire?.name}`}
          centered
        >
          {selectedQuestionnaire && (
            <ScrollArea h={400}>
              <Stack gap="md">
                <Alert icon={<Database size={16} />} color="green" variant="light">
                  Live FHIR Data - Questionnaire ID: {selectedQuestionnaire.id}
                </Alert>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Description</Text>
                  <Text>{selectedQuestionnaire.description || 'No description available'}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Category</Text>
                  <Badge color="blue" variant="light">
                    {selectedQuestionnaire.code?.[0]?.display || selectedQuestionnaire.purpose || 'general'}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Status & Version</Text>
                  <Group gap="xs">
                    <Badge color={getQuestionnaireStatusColor(selectedQuestionnaire.status)}>
                      {selectedQuestionnaire.status || 'unknown'}
                    </Badge>
                    <Badge variant="outline">
                      v{selectedQuestionnaire.version || '1.0'}
                    </Badge>
                  </Group>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Questions ({selectedQuestionnaire.item?.length || 0})</Text>
                  <Stack gap="sm">
                    {selectedQuestionnaire.item?.slice(0, 10).map((item, index) => (
                      <Paper key={item.linkId || index} p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                          <Text fw={500}>Question {index + 1}</Text>
                          <Badge size="sm" variant="light">
                            {item.type}
                          </Badge>
                        </Group>
                        <Text size="sm">{item.text}</Text>
                        {item.linkId && (
                          <Text size="xs" c="dimmed" mt="xs">
                            Link ID: {item.linkId}
                          </Text>
                        )}
                        {item.required && (
                          <Badge size="xs" color="red" mt="xs">
                            Required
                          </Badge>
                        )}
                      </Paper>
                    )) || (
                      <Text size="sm" c="dimmed">No questions available</Text>
                    )}
                  </Stack>
                </div>
              </Stack>
            </ScrollArea>
          )}
        </Modal>

        {/* Create Form Modal */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Questionnaire"
          centered
        >
          <Stack gap="md">
            <Alert icon={<Database size={16} />} color="blue" variant="light">
              Create new FHIR Questionnaire resource
            </Alert>
            <Text size="sm" c="dimmed">
              This would integrate with the Form Builder to create new FHIR Questionnaire resources.
              The builder would generate proper FHIR-compliant questionnaire structures.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeCreate}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  closeCreate();
                  setFormBuilderOpened(true);
                }}
                loading={loading}
              >
                Open Form Builder
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Form Builder Modal */}
        <Modal
          opened={formBuilderOpened}
          onClose={() => setFormBuilderOpened(false)}
          title="FHIR Form Builder"
          size="xl"
          fullScreen
        >
          <Alert icon={<Database size={16} />} color="green" variant="light" mb="md">
            Building FHIR Questionnaire - Changes will be saved to Medplum server
          </Alert>
          <FormBuilder 
            initialForm={selectedQuestionnaire ? {
              id: selectedQuestionnaire.id,
              title: selectedQuestionnaire.title || selectedQuestionnaire.name || '',
              description: selectedQuestionnaire.description || '',
              category: selectedQuestionnaire.code?.[0]?.display || selectedQuestionnaire.purpose || 'general',
              questions: selectedQuestionnaire.item?.map((item, index) => ({
                id: item.linkId || `q${index}`,
                type: item.type === 'string' ? 'text' : 
                      item.type === 'boolean' ? 'radio' :
                      item.type === 'choice' ? 'select' :
                      item.type === 'integer' ? 'number' : 'text',
                question: item.text || '',
                required: item.required || false,
                options: item.answerOption?.map(option => ({
                  value: option.valueCoding?.code || option.valueString || '',
                  label: option.valueCoding?.display || option.valueString || ''
                })) || []
              })) || []
            } : undefined}
            onSave={async (formData) => {
              try {
                const questionnaire: Partial<Questionnaire> = {
                  resourceType: 'Questionnaire',
                  status: 'active',
                  title: formData.title,
                  description: formData.description,
                  purpose: formData.category,
                  item: formData.questions.map((q, index) => ({
                    linkId: q.id || `q${index}`,
                    text: q.question,
                    type: q.type === 'text' ? 'string' :
                          q.type === 'radio' ? 'boolean' :
                          q.type === 'select' ? 'choice' :
                          q.type === 'number' ? 'integer' : 'string',
                    required: q.required,
                    answerOption: q.options?.map(opt => ({
                      valueCoding: {
                        code: opt.value,
                        display: opt.label
                      }
                    }))
                  }))
                };

                if (selectedQuestionnaire?.id) {
                  // Update existing questionnaire
                  await medplumClient.updateResource({
                    ...questionnaire,
                    id: selectedQuestionnaire.id
                  } as Questionnaire);
                  notifications.show({
                    title: 'Success',
                    message: 'Questionnaire updated successfully',
                    color: 'green',
                    icon: <CheckCircle size={16} />
                  });
                } else {
                  // Create new questionnaire
                  await medplumClient.createResource(questionnaire as Questionnaire);
                  notifications.show({
                    title: 'Success',
                    message: 'Questionnaire created successfully',
                    color: 'green',
                    icon: <CheckCircle size={16} />
                  });
                }

                setFormBuilderOpened(false);
                // Refresh questionnaires
                const updatedQuestionnaires = await medplumClient.searchResources('Questionnaire');
                setQuestionnaires(updatedQuestionnaires);
              } catch (error) {
                console.error('Error saving questionnaire:', error);
                notifications.show({
                  title: 'Error',
                  message: 'Failed to save questionnaire',
                  color: 'red',
                  icon: <AlertCircle size={16} />
                });
              }
            }}
          />
        </Modal>
      </Stack>
    </Container>
  );
};

export default FormsMedplumPage;