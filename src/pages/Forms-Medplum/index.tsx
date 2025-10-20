/**
 * Forms-Medplum Page Component
 * Manages forms using FHIR data
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
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
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [takeOpened, { open: openTake, close: closeTake }] = useDisclosure(false);

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

      return matchesSearch && matchesStatus;
    });
  }, [questionnaires, searchTerm, statusFilter]);

  const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openDetails();
  };

  const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openEdit();
  };

  const handleTakeQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openTake();
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
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Forms</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage questionnaires and form responses</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Form
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search forms..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'retired', label: 'Retired' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Text size="sm" c="dimmed">
                {filteredQuestionnaires.length} forms • {responses.length} responses
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Forms Grid */}
        {filteredQuestionnaires.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <FileText size={48} color="gray" />
              <Text size="lg" c="dimmed">No forms found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your search or create new forms'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredQuestionnaires.map((questionnaire) => (
              <Grid.Col key={questionnaire.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRFormCard
                  questionnaire={questionnaire}
                  onView={handleViewQuestionnaire}
                  onEdit={handleEditQuestionnaire}
                  onTake={handleTakeQuestionnaire}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

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
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Version</Text>
                    <Text size="sm" c="dimmed">
                      {selectedQuestionnaire.version || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Questions</Text>
                    <Text size="sm" c="dimmed">
                      {selectedQuestionnaire.item?.length || 0} items
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              {/* Questions Preview */}
              {selectedQuestionnaire.item && selectedQuestionnaire.item.length > 0 && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Questions Preview</Text>
                  <ScrollArea h={200}>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Link ID</Table.Th>
                          <Table.Th>Text</Table.Th>
                          <Table.Th>Type</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {selectedQuestionnaire.item.slice(0, 10).map((item, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>{item.linkId}</Table.Td>
                            <Table.Td>{item.text}</Table.Td>
                            <Table.Td>{item.type}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Stack>
              )}
            </Stack>
          )}
        </Modal>

        {/* Take Form Modal */}
        <Modal
          opened={takeOpened}
          onClose={closeTake}
          title="Take FHIR Questionnaire"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR questionnaire completion requires specific implementation for QuestionnaireResponse resources.
          </Alert>
        </Modal>

        {/* Create and Edit Modals */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Form"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR form creation requires specific implementation for Questionnaire resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Form"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR form editing requires specific implementation for the selected Questionnaire resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default FormsMedplumPage;