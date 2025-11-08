/**
 * Forms Page Component
 * Purpose: Main page for managing and taking forms in the telehealth system
 * Inputs: Route parameters, user permissions
 * Outputs: Form management interface and form taking experience
 */

import React, { useState, useCallback } from 'react';
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
  ThemeIcon,
  Tooltip,
  Alert,
  Table,
  TextInput,
  Loader,
  Menu,
  Divider,
  Checkbox,
  Paper,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
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
  Search,
  Filter,
  Copy,
  Download,
  Upload,
  MoreVertical,
  Settings,
} from 'lucide-react';

import { MultiStepForm } from '../../components/forms/MultiStepForm';
import { FormBuilder } from '../../components/forms/FormBuilder';
import { formTemplates, createFormFromTemplate } from '../../data/formTemplates';
import { FormData, FormSubmission, FormAnswers, FormTemplate } from '../../types/forms';
import { useAuthStore } from '../../store/authStore';

/**
 * FormsPage Component
 * Main interface for form management and completion
 */
export default function FormsPage() {
  const { user } = useAuthStore();
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [previewModalOpened, { open: openPreviewModal, close: closePreviewModal }] = useDisclosure(false);
  const [formBuilderOpened, setFormBuilderOpened] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Convert mock data to stateful for real form management
  const [existingForms, setExistingForms] = useState<FormData[]>([
    { ...createFormFromTemplate('patient-intake')!, status: 'active' },
    { ...createFormFromTemplate('symptom-assessment')!, status: 'active' },
    { ...createFormFromTemplate('medical-history')!, status: 'active' },
    { ...createFormFromTemplate('follow-up')!, status: 'inactive' },
  ]);

  const [submissions, setSubmissions] = useState<FormSubmission[]>([
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

  // Filter forms based on search and filters
  const filteredForms = existingForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (form.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || form.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(existingForms.map(form => form.category)));

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

      // Update submissions
      setSubmissions(prev => [submission, ...prev]);

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
  const handleCreateForm = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newForm = createFormFromTemplate(selectedTemplate);
      if (newForm) {
        const formWithStatus = { ...newForm, status: 'active' as const };
        setExistingForms(prev => [formWithStatus, ...prev]);
        
        notifications.show({
          title: 'Form Created',
          message: 'New form has been created successfully.',
          color: 'green',
          icon: <CheckCircle size={16} />,
        });
        closeCreateModal();
        setSelectedTemplate('');
      }
    } catch (error) {
      notifications.show({
        title: 'Creation Failed',
        message: 'There was an error creating the form. Please try again.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
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
   * Handles form preview
   */
  const handlePreviewForm = (form: FormData) => {
    setSelectedForm(form);
    openPreviewModal();
  };

  /**
   * Handles form editing
   */
  const handleEditForm = (form: FormData) => {
    // For now, open form builder with the form data
    setSelectedForm(form);
    setFormBuilderOpened(true);
    
    notifications.show({
      title: 'Edit Mode',
      message: 'Form builder opened for editing. Changes will be saved automatically.',
      color: 'blue',
    });
  };

  /**
   * Handles form deletion with confirmation
   */
  const handleDeleteForm = (form: FormData) => {
    modals.openConfirmModal({
      title: 'Delete Form',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{form.title}"? This action cannot be undone.
          All associated submissions will also be removed.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsLoading(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setExistingForms(prev => prev.filter(f => f.id !== form.id));
          setSubmissions(prev => prev.filter(s => s.formId !== form.id));
          
          notifications.show({
            title: 'Form Deleted',
            message: 'The form has been successfully deleted.',
            color: 'green',
            icon: <CheckCircle size={16} />,
          });
        } catch (error) {
          notifications.show({
            title: 'Deletion Failed',
            message: 'There was an error deleting the form. Please try again.',
            color: 'red',
            icon: <AlertCircle size={16} />,
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  /**
   * Handles form duplication
   */
  const handleDuplicateForm = async (form: FormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duplicatedForm: FormData = {
        ...form,
        id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${form.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };
      
      setExistingForms(prev => [duplicatedForm, ...prev]);
      
      notifications.show({
        title: 'Form Duplicated',
        message: 'The form has been successfully duplicated.',
        color: 'green',
        icon: <CheckCircle size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Duplication Failed',
        message: 'There was an error duplicating the form. Please try again.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form status toggle
   */
  const handleToggleStatus = async (form: FormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newStatus = form.status === 'active' ? 'inactive' : 'active';
      setExistingForms(prev => 
        prev.map(f => f.id === form.id ? { ...f, status: newStatus } : f)
      );
      
      notifications.show({
        title: 'Status Updated',
        message: `Form is now ${newStatus}.`,
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Update Failed',
        message: 'There was an error updating the form status.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form export
   */
  const handleExportForm = (form: FormData) => {
    try {
      const dataStr = JSON.stringify(form, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      notifications.show({
        title: 'Form Exported',
        message: 'The form has been exported successfully.',
        color: 'green',
        icon: <Download size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Export Failed',
        message: 'There was an error exporting the form.',
        color: 'red',
        icon: <AlertCircle size={16} />,
      });
    }
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

  /**
   * Gets status color for forms
   */
  const getFormStatusColor = (status: string) => {
    return status === 'active' ? 'green' : 'gray';
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
              loading={isLoading}
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
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Available Forms
                </Text>
                <ThemeIcon variant="light" color="blue" radius="md" size="lg">
                  <FileText size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {existingForms.length}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Completed
                </Text>
                <ThemeIcon variant="light" color="green" radius="md" size="lg">
                  <CheckCircle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="green">
                {submissions.filter(s => s.status === 'submitted').length}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  In Progress
                </Text>
                <ThemeIcon variant="light" color="orange" radius="md" size="lg">
                  <Clock size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {submissions.filter(s => s.status === 'draft').length}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Templates
                </Text>
                <ThemeIcon variant="light" color="violet" radius="md" size="lg">
                  <Users size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="violet">
                {formTemplates.length}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Search and Filters */}
        <Card padding="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Search & Filter</Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {filteredForms.length} of {existingForms.length} forms
              </Text>
            </Group>
          </Group>
          <Group>
            <TextInput
              placeholder="Search forms..."
              leftSection={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              value={filterCategory}
              onChange={(value) => setFilterCategory(value || 'all')}
              leftSection={<Filter size={16} />}
            />
            <Select
              placeholder="Status"
              data={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value || 'all')}
              leftSection={<Settings size={16} />}
            />
          </Group>
        </Card>

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
          
          {filteredForms.length === 0 ? (
            <Alert icon={<AlertCircle size={16} />}>
              No forms found matching your search criteria.
            </Alert>
          ) : viewMode === 'cards' ? (
          <Grid>
            {filteredForms.map((form) => (
              <Grid.Col key={form.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card padding="lg" shadow="sm" h="100%">
                  <Stack gap="md" h="100%">
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Badge color="blue" variant="light">
                          {form.category.replace('_', ' ')}
                        </Badge>
                        <Group gap="xs">
                          <Badge color={getFormStatusColor(form.status || 'inactive')} size="sm">
                            {form.status || 'inactive'}
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
                        disabled={form.status === 'inactive'}
                      >
                        Start Form
                      </Button>
                      <Group gap="xs">
                        <Tooltip label="Preview">
                          <ActionIcon 
                            variant="subtle" 
                            size="sm"
                            onClick={() => handlePreviewForm(form)}
                          >
                            <Eye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon 
                            variant="subtle" 
                            size="sm"
                            onClick={() => handleEditForm(form)}
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
                              onClick={() => handleDuplicateForm(form)}
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Settings size={14} />}
                              onClick={() => handleToggleStatus(form)}
                            >
                              {form.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Download size={14} />}
                              onClick={() => handleExportForm(form)}
                            >
                              Export
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<Trash2 size={14} />}
                              color="red"
                              onClick={() => handleDeleteForm(form)}
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
                  <Table.Th>Est. Time</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredForms.map((form) => (
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
                      <Badge color={getFormStatusColor(form.status || 'inactive')}>
                        {form.status || 'inactive'}
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
                          disabled={form.status === 'inactive'}
                        >
                          Start
                        </Button>
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          onClick={() => handlePreviewForm(form)}
                        >
                          <Eye size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          onClick={() => handleEditForm(form)}
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
                              onClick={() => handleDuplicateForm(form)}
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Settings size={14} />}
                              onClick={() => handleToggleStatus(form)}
                            >
                              {form.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Download size={14} />}
                              onClick={() => handleExportForm(form)}
                            >
                              Export
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<Trash2 size={14} />}
                              color="red"
                              onClick={() => handleDeleteForm(form)}
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

      {/* Form Preview Modal */}
      <Modal
        opened={previewModalOpened}
        onClose={closePreviewModal}
        size="lg"
        title={`Preview: ${selectedForm?.title}`}
        centered
      >
        {selectedForm && (
          <ScrollArea h={400}>
            <Stack gap="md">
              <div>
                <Text size="sm" c="dimmed" mb="xs">Description</Text>
                <Text>{selectedForm.description}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">Category</Text>
                <Badge color="blue" variant="light">
                  {selectedForm.category.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">Questions ({selectedForm.questions.length})</Text>
                <Stack gap="sm">
                  {selectedForm.questions.map((question, index) => (
                    <Paper key={question.id} p="md" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>Question {index + 1}</Text>
                        <Badge size="sm" variant="light">
                          {question.type}
                        </Badge>
                      </Group>
                      <Text size="sm">{question.text}</Text>
                      {question.placeholder && (
                        <Text size="xs" c="dimmed" mt="xs">
                          Placeholder: {question.placeholder}
                        </Text>
                      )}
                      {question.required && (
                        <Badge size="xs" color="red" mt="xs">
                          Required
                        </Badge>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </div>
            </Stack>
          </ScrollArea>
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
              loading={isLoading}
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