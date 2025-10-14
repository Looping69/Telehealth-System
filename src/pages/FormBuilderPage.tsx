/**
 * Form Builder Page Component
 * Purpose: Main page for creating and managing forms with Medplum integration
 * Features: Top-class form building with one-by-one question flow
 * Inputs: Route parameters, user permissions
 * Outputs: Form builder interface and form management
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Grid,
  Modal,
  ActionIcon,
  Tooltip,
  Alert,
  Table,
  Loader,
  Paper,
  Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { 
  Plus, 
  FileText, 
  Clock, 
  Users, 
  Play, 
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Zap,
  Download,
  Upload,
} from 'lucide-react';
import { Questionnaire } from '@medplum/fhirtypes';
import { FormBuilder } from '../components/forms/FormBuilder';
import { MultiStepForm } from '../components/forms/MultiStepForm';
import { useAuthStore } from '../store/authStore';

/**
 * FormBuilderPage Component
 * Main interface for form creation and management
 */
export default function FormBuilderPage() {
  const { user } = useAuthStore();
  const [builderOpened, { open: openBuilder, close: closeBuilder }] = useDisclosure(false);
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
  
  // State management
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeTab, setActiveTab] = useState<string | null>('my-forms');

  /**
    * Loads questionnaires from mock data
    */
   const loadQuestionnaires = async () => {
      // Mock data for offline mode
      setQuestionnaires([
        {
          resourceType: 'Questionnaire',
          id: 'patient-intake-form',
          status: 'active',
          title: 'Patient Intake Form',
          description: 'Comprehensive patient intake questionnaire',
          date: '2024-01-15T10:00:00Z',
          item: [
            {
              linkId: 'personal-info',
              type: 'group',
              text: 'Personal Information',
              item: [
                {
                  linkId: 'full-name',
                  type: 'string',
                  text: 'What is your full name?',
                  required: true,
                },
                {
                  linkId: 'email',
                  type: 'string',
                  text: 'What is your email address?',
                  required: true,
                },
                {
                  linkId: 'phone',
                  type: 'string',
                  text: 'What is your phone number?',
                  required: false,
                },
              ],
            },
          ],
        },
        {
          resourceType: 'Questionnaire',
          id: 'symptom-assessment',
          status: 'active',
          title: 'Symptom Assessment',
          description: 'Quick symptom evaluation form',
          date: '2024-01-14T15:30:00Z',
          item: [
            {
              linkId: 'symptoms',
              type: 'choice',
              text: 'What symptoms are you experiencing?',
              required: true,
              answerOption: [
                { valueString: 'Headache' },
                { valueString: 'Fever' },
                { valueString: 'Cough' },
                { valueString: 'Fatigue' },
              ],
            },
          ],
        },
      ]);
       setLoading(false);
  };

  /**
   * Handles saving a new or updated questionnaire
   */
  const handleSaveQuestionnaire = async (questionnaire: Questionnaire) => {
     try {
       // Simulate save with mock data
       const savedQuestionnaire: Questionnaire = {
         ...questionnaire,
         id: questionnaire.id || `questionnaire-${Date.now()}`,
         date: new Date().toISOString(),
       };

      // Update local state
      setQuestionnaires(prev => {
        const existing = prev.find(q => q.id === savedQuestionnaire.id);
        if (existing) {
          return prev.map(q => q.id === savedQuestionnaire.id ? savedQuestionnaire : q);
        } else {
          return [savedQuestionnaire, ...prev];
        }
      });

      notifications.show({
        title: 'Form Saved',
        message: 'Your form has been saved successfully',
        color: 'green',
        icon: <CheckCircle size={16} />,
      });

      closeBuilder();
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
      notifications.show({
        title: 'Save Failed',
        message: 'Failed to save the form. Please try again.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    }
  };

  /**
   * Handles deleting a questionnaire
   */
  const handleDeleteQuestionnaire = async (id: string) => {
     try {
       // Simulate delete with mock data
       setQuestionnaires(prev => prev.filter(q => q.id !== id));
      
      notifications.show({
        title: 'Form Deleted',
        message: 'The form has been deleted successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete questionnaire:', error);
      notifications.show({
        title: 'Delete Failed',
        message: 'Failed to delete the form. Please try again.',
        color: 'red',
      });
    }
  };

  /**
   * Handles form preview
   */
  const handlePreviewForm = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openPreview();
  };

  /**
   * Converts FHIR Questionnaire to our Question format for preview
   */
  const convertQuestionnaireToQuestions = (questionnaire: Questionnaire) => {
    if (!questionnaire.item) return [];
    
    const convertItem = (item: any): any => ({
      id: item.linkId,
      type: mapFhirTypeToQuestionType(item.type),
      text: item.text || '',
      description: item.definition,
      required: item.required || false,
      options: item.answerOption?.map((opt: any) => opt.valueString || '') || [],
      validation: item.maxLength ? { maxLength: item.maxLength } : undefined,
    });

    return questionnaire.item.map(convertItem);
  };

  function mapFhirTypeToQuestionType(fhirType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'text',
      'text': 'textarea',
      'integer': 'number',
      'decimal': 'number',
      'date': 'date',
      'choice': 'select',
      'boolean': 'boolean',
    };
    return typeMap[fhirType] || 'text';
  }

  // Load questionnaires on component mount
   useEffect(() => {
     loadQuestionnaires();
   }, []);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center">
          <Loader size="lg" />
          <Text>Loading forms...</Text>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Form Builder</Title>
            <Text size="sm" c="dimmed">
              Create powerful forms with one-by-one question flow using Medplum FHIR
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<Plus size={16} />}
              onClick={openBuilder}
              size="md"
            >
              Create New Form
            </Button>
          </Group>
        </Group>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="my-forms" leftSection={<FileText size={16} />}>
              My Forms ({questionnaires.length})
            </Tabs.Tab>
            <Tabs.Tab value="templates" leftSection={<Zap size={16} />}>
              Templates
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="my-forms" pt="md">
            {questionnaires.length === 0 ? (
              <Paper p="xl" ta="center">
                <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <Title order={3} c="dimmed" mb="sm">
                  No forms yet
                </Title>
                <Text c="dimmed" mb="lg">
                  Create your first form to get started with data collection
                </Text>
                <Button leftSection={<Plus size={16} />} onClick={openBuilder}>
                  Create Your First Form
                </Button>
              </Paper>
            ) : (
              <Grid>
                {questionnaires.map((questionnaire) => (
                  <Grid.Col key={questionnaire.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                      <Group justify="space-between" mb="xs">
                        <Badge
                          color={questionnaire.status === 'active' ? 'green' : 'gray'}
                          variant="light"
                        >
                          {questionnaire.status}
                        </Badge>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => handlePreviewForm(questionnaire)}
                          >
                            <Eye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            onClick={() => {
                              setSelectedQuestionnaire(questionnaire);
                              openBuilder();
                            }}
                          >
                            <Edit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => questionnaire.id && handleDeleteQuestionnaire(questionnaire.id)}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Title order={4} mb="xs">
                        {questionnaire.title}
                      </Title>

                      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                        {questionnaire.description || 'No description provided'}
                      </Text>

                      <Group justify="space-between" mt="auto">
                        <Group gap="xs">
                          <Clock size={14} />
                          <Text size="xs" c="dimmed">
                            {questionnaire.date ? new Date(questionnaire.date).toLocaleDateString() : 'Unknown'}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {questionnaire.item?.length || 0} questions
                        </Text>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="templates" pt="md">
            <Alert icon={<Zap size={16} />} color="blue">
              <Text fw={500} mb="xs">Form Templates Coming Soon</Text>
              <Text size="sm">
                Pre-built form templates for common healthcare scenarios will be available here.
                For now, you can create custom forms using the form builder.
              </Text>
            </Alert>
          </Tabs.Panel>
        </Tabs>

        {/* Form Builder Modal */}
        <Modal
          opened={builderOpened}
          onClose={closeBuilder}
          size="100%"
          title={null}
          padding={0}
          centered={false}
          fullScreen
        >
          <FormBuilder
            onSave={handleSaveQuestionnaire}
            onCancel={closeBuilder}
            initialQuestionnaire={selectedQuestionnaire || undefined}
          />
        </Modal>

        {/* Form Preview Modal */}
        <Modal
          opened={previewOpened}
          onClose={closePreview}
          size="lg"
          title="Form Preview"
          centered
        >
          {selectedQuestionnaire && (
            <MultiStepForm
              questions={convertQuestionnaireToQuestions(selectedQuestionnaire)}
              title={selectedQuestionnaire.title || 'Form Preview'}
              description={selectedQuestionnaire.description}
              onSubmit={(data) => {
                notifications.show({
                  title: 'Preview Submission',
                  message: 'This is just a preview. Form data was not saved.',
                  color: 'blue',
                });
                closePreview();
              }}
              onCancel={closePreview}
            />
          )}
        </Modal>
      </Stack>
    </Container>
  );
}