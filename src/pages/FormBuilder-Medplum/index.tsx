/**
 * FormBuilder-Medplum Page Component
 * Manages form building using FHIR data
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
  Tabs,
  Table,
  ScrollArea,
  Paper,
  Divider,
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
  Zap,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';

/**
 * FHIR Form Builder Card Component
 */
interface FHIRFormBuilderCardProps {
  questionnaire: Questionnaire;
  onView: (questionnaire: Questionnaire) => void;
  onEdit: (questionnaire: Questionnaire) => void;
  onPreview: (questionnaire: Questionnaire) => void;
  onDelete: (questionnaire: Questionnaire) => void;
}

const FHIRFormBuilderCard: React.FC<FHIRFormBuilderCardProps> = ({ 
  questionnaire, 
  onView, 
  onEdit, 
  onPreview, 
  onDelete 
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

  const getFormName = () => {
    return questionnaire.title || questionnaire.name || 'Unnamed Form';
  };

  const getQuestionCount = () => {
    const countItems = (items: any[]): number => {
      return items.reduce((count, item) => {
        if (item.item) {
          return count + countItems(item.item);
        }
        return count + 1;
      }, 0);
    };
    
    return questionnaire.item ? countItems(questionnaire.item) : 0;
  };

  const getFormDescription = () => {
    return questionnaire.description || 'No description available';
  };

  const getLastModified = () => {
    if (questionnaire.date) {
      return new Date(questionnaire.date).toLocaleDateString();
    }
    return 'Unknown';
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
            backgroundColor: '#FF6B6B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={20} color="white" />
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
            <Text size="sm">Modified: {getLastModified()}</Text>
          </Group>
          <Group gap="xs">
            <Users size={14} />
            <Text size="sm">Subject: {questionnaire.subjectType?.[0] || 'Patient'}</Text>
          </Group>
        </Stack>

        <Divider />

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            ID: {questionnaire.id}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="green"
              onClick={() => onPreview(questionnaire)}
              title="Preview Form"
            >
              <Play size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(questionnaire)}
              title="View Details"
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(questionnaire)}
              title="Edit Form"
            >
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => onDelete(questionnaire)}
              title="Delete Form"
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Main FormBuilder-Medplum Page Component
 */
const FormBuilderMedplumPage: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('my-forms');

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);

  // Fetch FHIR questionnaires and responses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch questionnaires
        const questionnaireResponse = await medplumClient.search('Questionnaire', {
          _sort: '-date',
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

        // Fetch questionnaire responses for analytics
        const responseResponse = await medplumClient.search('QuestionnaireResponse', {
          _sort: '-authored',
          _count: '100'
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
        setError('Failed to fetch form builder data from FHIR server. Please check your connection.');
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

      return matchesSearch;
    });
  }, [questionnaires, searchTerm]);

  // Get analytics data
  const getFormAnalytics = (questionnaireId: string) => {
    const formResponses = responses.filter(r => r.questionnaire === questionnaireId);
    return {
      totalResponses: formResponses.length,
      completedResponses: formResponses.filter(r => r.status === 'completed').length,
      averageTime: 0, // Would calculate from response data
    };
  };

  const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openDetails();
  };

  const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openEdit();
  };

  const handlePreviewQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openPreview();
  };

  const handleDeleteQuestionnaire = (questionnaire: Questionnaire) => {
    // Implementation for deleting questionnaire
    console.log('Delete questionnaire:', questionnaire.id);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR form builder...</Text>
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
            <Title order={1}>Form Builder</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Create and manage FHIR questionnaires</Text>
            </Group>
          </Stack>
          <Group>
            <Button variant="light" leftSection={<Upload size={16} />}>
              Import Form
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreate}>
              Create New Form
            </Button>
          </Group>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="my-forms" leftSection={<FileText size={16} />}>
              My Forms ({filteredQuestionnaires.length})
            </Tabs.Tab>
            <Tabs.Tab value="analytics" leftSection={<Zap size={16} />}>
              Analytics
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="my-forms">
            <Stack gap="md" mt="md">
              {/* Search */}
              <Card withBorder padding="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      placeholder="Search forms..."
                      leftSection={<Search size={16} />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Text size="sm" c="dimmed">
                      {filteredQuestionnaires.length} forms
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Forms Grid */}
              {filteredQuestionnaires.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <Zap size={48} color="gray" />
                    <Text size="lg" c="dimmed">No forms found</Text>
                    <Text size="sm" c="dimmed">
                      {error ? 'Check your FHIR server connection' : 'Create your first form to get started'}
                    </Text>
                    <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                      Create New Form
                    </Button>
                  </Stack>
                </Center>
              ) : (
                <Grid>
                  {filteredQuestionnaires.map((questionnaire) => (
                    <Grid.Col key={questionnaire.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <FHIRFormBuilderCard
                        questionnaire={questionnaire}
                        onView={handleViewQuestionnaire}
                        onEdit={handleEditQuestionnaire}
                        onPreview={handlePreviewQuestionnaire}
                        onDelete={handleDeleteQuestionnaire}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="analytics">
            <Stack gap="md" mt="md">
              <Paper p="md" withBorder>
                <Title order={3} mb="md">Form Analytics</Title>
                <ScrollArea>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Form Name</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Total Responses</Table.Th>
                        <Table.Th>Completed</Table.Th>
                        <Table.Th>Completion Rate</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {questionnaires.map((questionnaire) => {
                        const analytics = getFormAnalytics(questionnaire.id!);
                        const completionRate = analytics.totalResponses > 0 
                          ? Math.round((analytics.completedResponses / analytics.totalResponses) * 100)
                          : 0;
                        
                        return (
                          <Table.Tr key={questionnaire.id}>
                            <Table.Td>{questionnaire.title || questionnaire.name}</Table.Td>
                            <Table.Td>
                              <Badge color={questionnaire.status === 'active' ? 'green' : 'yellow'}>
                                {questionnaire.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{analytics.totalResponses}</Table.Td>
                            <Table.Td>{analytics.completedResponses}</Table.Td>
                            <Table.Td>{completionRate}%</Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Form Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Questionnaire #${selectedQuestionnaire?.id}`}
          size="lg"
        >
          {selectedQuestionnaire && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Questionnaire ID: {selectedQuestionnaire.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Title</Text>
                    <Text size="sm" c="dimmed">
                      {selectedQuestionnaire.title || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedQuestionnaire.status === 'active' ? 'green' : 'yellow'}>
                      {selectedQuestionnaire.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Description</Text>
                    <Text size="sm" c="dimmed">
                      {selectedQuestionnaire.description || 'No description available'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Create, Edit, and Preview Modals */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Form"
          size="xl"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR form builder requires specific implementation for creating Questionnaire resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Form"
          size="xl"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR form editing requires specific implementation for the selected Questionnaire resource.
          </Alert>
        </Modal>

        <Modal
          opened={previewOpened}
          onClose={closePreview}
          title="Preview FHIR Form"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR form preview requires specific implementation for rendering Questionnaire items.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default FormBuilderMedplumPage;