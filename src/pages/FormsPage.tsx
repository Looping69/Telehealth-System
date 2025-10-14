/**
 * Forms Page Component
 * Purpose: Main page for managing and taking forms in the telehealth system
 * Inputs: Route parameters, user permissions
 * Outputs: Form management interface and form taking experience
 */

import React, { useState } from 'react';
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
  Select,
  ActionIcon,
  Tooltip,
  Alert,
  Table,
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
} from 'lucide-react';

import { MultiStepForm } from '../components/forms/MultiStepForm';
import { FormBuilder } from '../components/forms/FormBuilder';
import { formTemplates, createFormFromTemplate } from '../data/formTemplates';
import { FormData, FormSubmission, FormAnswers, FormTemplate } from '../types/forms';
import { useAuthStore } from '../store/authStore';

/**
 * FormsPage Component
 * Main interface for form management and completion
 */
export default function FormsPage() {
  const { user } = useAuthStore();
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [formBuilderOpened, setFormBuilderOpened] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Mock data for existing forms and submissions
  const [existingForms] = useState<FormData[]>([
    createFormFromTemplate('patient-intake')!,
    createFormFromTemplate('symptom-assessment')!,
    createFormFromTemplate('medical-history')!,
    createFormFromTemplate('follow-up')!,
  ]);

  const [submissions] = useState<FormSubmission[]>([
    {
      id: 'sub-1',
      formId: existingForms[0]?.id || '',
      patientId: 'patient-1',
      answers: {},
      status: 'submitted',
      startedAt: '2024-01-15T10:00:00Z',
      submittedAt: '2024-01-15T10:15:00Z',
      completionTime: 900,
    },
  ]);

  /**
   * Handles form submission
   */
  const handleFormSubmit = async (answers: FormAnswers) => {
    if (!selectedForm) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create submission record
      const submission: FormSubmission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        formId: selectedForm.id,
        patientId: user?.id || 'current-user',
        answers,
        status: 'submitted',
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        completionTime: 0, // Would calculate actual time
      };

      notifications.show({
        title: 'Form Submitted Successfully',
        message: 'Your form has been submitted and will be reviewed by your healthcare provider.',
        color: 'green',
        icon: <CheckCircle size={16} />,
      });

      closeFormModal();
      setSelectedForm(null);
    } catch (error) {
      notifications.show({
        title: 'Submission Failed',
        message: 'There was an error submitting your form. Please try again.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles creating a new form from template
   */
  const handleCreateForm = () => {
    if (!selectedTemplate) return;

    const newForm = createFormFromTemplate(selectedTemplate);
    if (newForm) {
      notifications.show({
        title: 'Form Created',
        message: 'New form has been created successfully.',
        color: 'green',
      });
      closeCreateModal();
      setSelectedTemplate('');
    }
  };

  /**
   * Starts taking a form
   */
  const startForm = (form: FormData) => {
    setSelectedForm(form);
    openFormModal();
  };

  /**
   * Gets status color for form submissions
   */
  const getStatusColor = (status: FormSubmission['status']) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'submitted': return 'blue';
      case 'reviewed': return 'green';
      case 'archived': return 'dark';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between">
          <div>
            <Title order={1}>Forms</Title>
            <Text c="dimmed" mt="xs">
              Manage and complete healthcare forms
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<Plus size={16} />}
              onClick={openCreateModal}
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
                    {existingForms.length}
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
                    Completed
                  </Text>
                  <Text fw={700} size="xl">
                    {submissions.filter(s => s.status === 'submitted').length}
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
                    In Progress
                  </Text>
                  <Text fw={700} size="xl">
                    {submissions.filter(s => s.status === 'draft').length}
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
                    Templates
                  </Text>
                  <Text fw={700} size="xl">
                    {formTemplates.length}
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
          
          {viewMode === 'cards' ? (
          <Grid>
            {existingForms.map((form) => (
              <Grid.Col key={form.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" shadow="sm" h="100%">
                  <Stack gap="md" h="100%">
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Badge color="blue" variant="light">
                          {form.category.replace('_', ' ')}
                        </Badge>
                        {form.estimatedTime && (
                          <Group gap={4}>
                            <Clock size={12} />
                            <Text size="xs" c="dimmed">
                              {form.estimatedTime} min
                            </Text>
                          </Group>
                        )}
                      </Group>
                      <Title order={4} mb="xs">{form.title}</Title>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {form.description}
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        {form.questions.length} questions
                      </Text>
                    </div>

                    <Group justify="space-between" mt="auto">
                      <Button
                        variant="filled"
                        leftSection={<Play size={16} />}
                        onClick={() => startForm(form)}
                        size="sm"
                      >
                        Start Form
                      </Button>
                      <Group gap="xs">
                        <Tooltip label="Preview">
                          <ActionIcon variant="subtle" size="sm">
                            <Eye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon variant="subtle" size="sm">
                            <Edit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon variant="subtle" color="red" size="sm">
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
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
                  <Table.Th>Questions</Table.Th>
                  <Table.Th>Est. Time</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {existingForms.map((form) => (
                  <Table.Tr key={form.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{form.title}</Text>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {form.description}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {form.category.replace('_', ' ')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{form.questions.length}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Clock size={12} />
                        <Text size="sm">
                          {form.estimatedTime || 'N/A'} min
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          variant="filled"
                          leftSection={<Play size={16} />}
                          onClick={() => startForm(form)}
                          size="xs"
                        >
                          Start
                        </Button>
                        <ActionIcon variant="subtle" size="sm">
                          <Eye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" size="sm">
                          <Edit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" size="sm">
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
          )}
        </div>

        {/* Recent Submissions */}
        <div>
          <Title order={2} mb="md">Recent Submissions</Title>
          {submissions.length > 0 ? (
            <Stack gap="sm">
              {submissions.map((submission) => {
                const form = existingForms.find(f => f.id === submission.formId);
                return (
                  <Card key={submission.id} padding="md">
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>{form?.title || 'Unknown Form'}</Text>
                        <Text size="sm" c="dimmed">
                          Submitted on {new Date(submission.submittedAt || submission.startedAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Alert icon={<AlertCircle size={16} />}>
              No form submissions yet. Complete a form to see your submissions here.
            </Alert>
          )}
        </div>
      </Stack>

      {/* Form Taking Modal */}
      <Modal
        opened={formModalOpened}
        onClose={closeFormModal}
        size="lg"
        title={null}
        padding={0}
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        {selectedForm && (
          <MultiStepForm
            formData={selectedForm}
            onSubmit={handleFormSubmit}
            onCancel={closeFormModal}
            loading={isSubmitting}
          />
        )}
      </Modal>

      {/* Create Form Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create New Form"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select a template to create a new form
          </Text>
          <Select
            label="Form Template"
            placeholder="Choose a template"
            data={formTemplates.map(template => ({
              value: template.id,
              label: template.name,
            }))}
            value={selectedTemplate}
            onChange={(value) => setSelectedTemplate(value || '')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateForm}
              disabled={!selectedTemplate}
            >
              Create Form
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Form Builder Modal */}
      <Modal
        opened={formBuilderOpened}
        onClose={() => setFormBuilderOpened(false)}
        title="Form Builder"
        size="xl"
        fullScreen
      >
        <FormBuilder />
      </Modal>
    </Container>
  );
}