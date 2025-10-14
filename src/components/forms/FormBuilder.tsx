/**
 * Form Builder Component
 * Purpose: Advanced form building system using Medplum FHIR Questionnaire resources
 * Inputs: Form configuration, question types, validation rules
 * Outputs: FHIR-compliant Questionnaire resource and form preview
 */

import React, { useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Select,
  TextInput,
  Textarea,
  Switch,
  NumberInput,
  ActionIcon,
  Modal,
  Tabs,
  Alert,
  Divider,
  Box,
  Tooltip,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  Download,
  Upload,
  Settings,
  ArrowUp,
  ArrowDown,
  Copy,
  HelpCircle,
} from 'lucide-react';
import { Questionnaire, QuestionnaireItem } from '@medplum/fhirtypes';
import { MultiStepForm } from './MultiStepForm';
import { FormQuestion } from './FormQuestion';
import { Question, FormAnswer } from '../../types/forms';

interface FormBuilderProps {
  onSave?: (questionnaire: Questionnaire) => void;
  onCancel?: () => void;
  initialQuestionnaire?: Questionnaire;
}

interface QuestionBuilder extends Question {
  tempId: string;
}

/**
 * FormBuilder Component
 * Advanced form building interface with FHIR Questionnaire support
 */
export function FormBuilder({ onSave, onCancel, initialQuestionnaire }: FormBuilderProps) {
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  
  // Form metadata
  const [formTitle, setFormTitle] = useState(initialQuestionnaire?.title || '');
  const [formDescription, setFormDescription] = useState(initialQuestionnaire?.description || '');
  const [formStatus, setFormStatus] = useState<'draft' | 'active' | 'retired'>(
    initialQuestionnaire?.status || 'draft'
  );
  
  // Questions management
  const [questions, setQuestions] = useState<QuestionBuilder[]>(() => {
    if (initialQuestionnaire?.item) {
      return initialQuestionnaire.item.map((item, index) => ({
        tempId: `q-${index}`,
        id: item.linkId,
        type: mapFhirTypeToQuestionType(item.type),
        text: item.text || '',
        description: item.definition,
        required: item.required || false,
        options: item.answerOption?.map(opt => opt.valueString || '') || [],
        validation: extractValidationFromItem(item),
      }));
    }
    return [];
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBuilder | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('builder');

  /**
   * Maps FHIR QuestionnaireItem type to our Question type
   */
  function mapFhirTypeToQuestionType(fhirType: string): Question['type'] {
    const typeMap: Record<string, Question['type']> = {
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

  /**
   * Extracts validation rules from FHIR QuestionnaireItem
   */
  function extractValidationFromItem(item: QuestionnaireItem) {
    const validation: Question['validation'] = {};
    
    // Extract from extensions or other FHIR properties
    if (item.maxLength) {
      validation.maxLength = item.maxLength;
    }
    
    return validation;
  }

  /**
   * Adds a new question to the form with smart defaults
   */
  const addQuestion = useCallback((type: Question['type'] = 'text') => {
    const questionTemplates: Record<Question['type'], Partial<QuestionBuilder>> = {
      'text': { placeholder: 'Enter your answer...' },
      'textarea': { placeholder: 'Please provide details...' },
      'email': { placeholder: 'your.email@example.com', validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' } },
      'number': { validation: { min: 0 } },
      'date': {},
      'select': { options: ['Option 1', 'Option 2', 'Option 3'] },
      'radio': { options: ['Yes', 'No'] },
      'checkbox': { options: ['Option A', 'Option B', 'Option C'] },
      'boolean': {},
      'scale': { 
        validation: { min: 1, max: 10 },
        scaleLabels: { min: 'Poor', max: 'Excellent' }
      },
    };

    const template = questionTemplates[type] || {};
    const newQuestion: QuestionBuilder = {
      tempId: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      id: `question-${questions.length + 1}`,
      type,
      text: `Question ${questions.length + 1}`,
      required: false,
      ...template,
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    setSelectedQuestion(newQuestion);
    
    // Auto-focus on the new question
    setTimeout(() => {
      const element = document.querySelector(`[data-question-id="${newQuestion.tempId}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [questions.length]);

  /**
   * Updates a question in the form
   */
  const updateQuestion = useCallback((tempId: string, updates: Partial<QuestionBuilder>) => {
    setQuestions(prev => prev.map(q => 
      q.tempId === tempId ? { ...q, ...updates } : q
    ));
    
    if (selectedQuestion?.tempId === tempId) {
      setSelectedQuestion(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedQuestion]);

  /**
   * Removes a question from the form
   */
  const removeQuestion = useCallback((tempId: string) => {
    setQuestions(prev => prev.filter(q => q.tempId !== tempId));
    if (selectedQuestion?.tempId === tempId) {
      setSelectedQuestion(null);
    }
  }, [selectedQuestion]);

  /**
   * Moves a question up or down in the order
   */
  const moveQuestion = useCallback((tempId: string, direction: 'up' | 'down') => {
    setQuestions(prev => {
      const index = prev.findIndex(q => q.tempId === tempId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newQuestions = [...prev];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      return newQuestions;
    });
  }, []);

  /**
   * Duplicates a question
   */
  const duplicateQuestion = useCallback((tempId: string) => {
    const question = questions.find(q => q.tempId === tempId);
    if (!question) return;
    
    const duplicated: QuestionBuilder = {
      ...question,
      tempId: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      id: `${question.id}-copy`,
      text: `${question.text} (Copy)`,
    };
    
    const index = questions.findIndex(q => q.tempId === tempId);
    setQuestions(prev => [
      ...prev.slice(0, index + 1),
      duplicated,
      ...prev.slice(index + 1),
    ]);
  }, [questions]);

  /**
   * Converts form data to FHIR Questionnaire resource
   */
  const buildQuestionnaire = useCallback((): Questionnaire => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: initialQuestionnaire?.id || `questionnaire-${Date.now()}`,
      status: formStatus,
      title: formTitle,
      description: formDescription,
      date: new Date().toISOString(),
      item: questions.map((question, index) => ({
        linkId: question.id,
        type: mapQuestionTypeToFhir(question.type),
        text: question.text,
        required: question.required,
        definition: question.description,
        answerOption: question.options?.map(option => ({
          valueString: typeof option === 'string' ? option : option.value,
        })),
        maxLength: question.validation?.maxLength,
      })),
    };
    
    return questionnaire;
  }, [formTitle, formDescription, formStatus, questions, initialQuestionnaire]);

  /**
   * Maps our Question type to FHIR QuestionnaireItem type
   */
  function mapQuestionTypeToFhir(type: Question['type']): string {
    const typeMap: Record<Question['type'], string> = {
      'text': 'string',
      'textarea': 'text',
      'email': 'string',
      'number': 'decimal',
      'date': 'date',
      'select': 'choice',
      'radio': 'choice',
      'checkbox': 'choice',
      'boolean': 'boolean',
      'scale': 'integer',
    };
    return typeMap[type] || 'string';
  }

  /**
   * Saves the questionnaire
   */
  const handleSave = useCallback(async () => {
    if (!formTitle.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Form title is required',
        color: 'red',
      });
      return;
    }

    if (questions.length === 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'At least one question is required',
        color: 'red',
      });
      return;
    }

    try {
      const questionnaire = buildQuestionnaire();
      
      // Save form in offline mode (Medplum server unavailable)
      onSave?.(questionnaire);
      notifications.show({
        title: 'Form Created',
        message: 'Your form has been created successfully (offline mode)',
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Save Failed',
        message: 'Failed to save the form. Please try again.',
        color: 'red',
      });
    }
  }, [formTitle, questions, buildQuestionnaire, onSave]);

  /**
   * Handles form preview
   */
  const handlePreview = useCallback(() => {
    if (questions.length === 0) {
      notifications.show({
        title: 'No Questions',
        message: 'Add some questions to preview the form',
        color: 'orange',
      });
      return;
    }
    openPreview();
  }, [questions.length, openPreview]);

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Form Builder</Title>
            <Text size="sm" c="dimmed">
              Create powerful forms with one-by-one question flow
            </Text>
          </div>
          <Group>
            <Button variant="subtle" onClick={openSettings} leftSection={<Settings size={16} />}>
              Settings
            </Button>
            <Button variant="outline" onClick={handlePreview} leftSection={<Eye size={16} />}>
              Preview
            </Button>
            <Button onClick={handleSave} leftSection={<Save size={16} />}>
              Save Form
            </Button>
            {onCancel && (
              <Button variant="subtle" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="builder">Form Builder</Tabs.Tab>
            <Tabs.Tab value="questions">Questions ({questions.length})</Tabs.Tab>
            <Tabs.Tab value="settings">Form Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="builder" pt="md">
            <Group align="flex-start" gap="lg">
              {/* Question List */}
              <Paper p="md" style={{ flex: 1, minWidth: 300 }}>
                <Group justify="space-between" mb="md">
                  <Title order={4}>Questions</Title>
                  <Select
                    placeholder="Add question"
                    data={[
                      { value: 'text', label: 'Text Input' },
                      { value: 'textarea', label: 'Long Text' },
                      { value: 'email', label: 'Email' },
                      { value: 'number', label: 'Number' },
                      { value: 'date', label: 'Date' },
                      { value: 'select', label: 'Dropdown' },
                      { value: 'radio', label: 'Multiple Choice' },
                      { value: 'checkbox', label: 'Checkboxes' },
                      { value: 'boolean', label: 'Yes/No' },
                      { value: 'scale', label: 'Rating Scale' },
                    ]}
                    onChange={(value) => value && addQuestion(value as Question['type'])}
                    searchable
                    clearable
                  />
                </Group>

                <ScrollArea h={400}>
                  <Stack gap="xs">
                    {questions.map((question, index) => (
                      <Card
                        key={question.tempId}
                        p="sm"
                        withBorder
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedQuestion?.tempId === question.tempId ? 'var(--mantine-color-blue-0)' : undefined,
                        }}
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <Group justify="space-between">
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {question.text || `Question ${index + 1}`}
                            </Text>
                            <Group gap="xs" mt={4}>
                              <Badge size="xs" variant="light">
                                {question.type}
                              </Badge>
                              {question.required && (
                                <Badge size="xs" color="red" variant="light">
                                  Required
                                </Badge>
                              )}
                            </Group>
                          </div>
                          <Group gap={4}>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(question.tempId, 'up');
                              }}
                              disabled={index === 0}
                            >
                              <ArrowUp size={12} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(question.tempId, 'down');
                              }}
                              disabled={index === questions.length - 1}
                            >
                              <ArrowDown size={12} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateQuestion(question.tempId);
                              }}
                            >
                              <Copy size={12} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(question.tempId);
                              }}
                            >
                              <Trash2 size={12} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                    
                    {questions.length === 0 && (
                      <Alert>
                        <Text size="sm">
                          No questions yet. Use the dropdown above to add your first question.
                        </Text>
                      </Alert>
                    )}
                  </Stack>
                </ScrollArea>
              </Paper>

              {/* Question Editor */}
              <Paper p="md" style={{ flex: 2, minWidth: 400 }}>
                {selectedQuestion ? (
                  <QuestionEditor
                    question={selectedQuestion}
                    onChange={(updates) => updateQuestion(selectedQuestion.tempId, updates)}
                  />
                ) : (
                  <Box ta="center" py="xl">
                    <HelpCircle size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                    <Text size="lg" c="dimmed">
                      Select a question to edit
                    </Text>
                    <Text size="sm" c="dimmed">
                      Click on a question from the list to start editing
                    </Text>
                  </Box>
                )}
              </Paper>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="questions" pt="md">
            <Paper p="md">
              <Title order={4} mb="md">All Questions</Title>
              {questions.length > 0 ? (
                <Stack gap="md">
                  {questions.map((question, index) => (
                    <Card key={question.tempId} p="md" withBorder>
                      <Group justify="space-between" mb="sm">
                        <Text fw={500}>Question {index + 1}</Text>
                        <Group gap="xs">
                          <Badge variant="light">{question.type}</Badge>
                          {question.required && <Badge color="red" variant="light">Required</Badge>}
                        </Group>
                      </Group>
                      <Text mb="sm">{question.text}</Text>
                      {question.description && (
                        <Text size="sm" c="dimmed" mb="sm">{question.description}</Text>
                      )}
                      {question.options && question.options.length > 0 && (
                        <div>
                          <Text size="sm" fw={500} mb="xs">Options:</Text>
                          <Text size="sm" c="dimmed">
                            {question.options.map(opt => typeof opt === 'string' ? opt : opt.label).join(', ')}
                          </Text>
                        </div>
                      )}
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Alert>
                  <Text>No questions added yet. Go to the Form Builder tab to add questions.</Text>
                </Alert>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Paper p="md">
              <Title order={4} mb="md">Form Settings</Title>
              <Stack gap="md">
                <TextInput
                  label="Form Title"
                  placeholder="Enter form title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
                <Textarea
                  label="Form Description"
                  placeholder="Enter form description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
                <Select
                  label="Form Status"
                  value={formStatus}
                  onChange={(value) => setFormStatus(value as 'draft' | 'active' | 'retired')}
                  data={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'active', label: 'Active' },
                    { value: 'retired', label: 'Retired' },
                  ]}
                />
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* Preview Modal */}
        <Modal
          opened={previewOpened}
          onClose={closePreview}
          size="lg"
          title="Form Preview"
        >
          <MultiStepForm
            questions={questions}
            onSubmit={(answers) => {
              console.log('Form submitted:', answers);
              closePreview();
            }}
            onCancel={closePreview}
          />
        </Modal>

        {/* Settings Modal */}
        <Modal
          opened={settingsOpened}
          onClose={closeSettings}
          size="md"
          title="Advanced Settings"
        >
          <Stack gap="md">
            <Alert>
              <Text size="sm">
                Advanced form settings and integrations will be available here.
              </Text>
            </Alert>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}

/**
 * Question Editor Component
 * Purpose: Provides editing interface for individual questions
 */
interface QuestionEditorProps {
  question: QuestionBuilder;
  onChange: (updates: Partial<QuestionBuilder>) => void;
}

function QuestionEditor({ question, onChange }: QuestionEditorProps) {
  return (
    <Stack gap="md">
      <Title order={4}>Edit Question</Title>
      
      <TextInput
        label="Question Text"
        placeholder="Enter your question"
        value={question.text}
        onChange={(e) => onChange({ text: e.target.value })}
        required
      />
      
      <Textarea
        label="Description (Optional)"
        placeholder="Additional context or instructions"
        value={question.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={2}
      />
      
      <Group>
        <Switch
          label="Required"
          checked={question.required}
          onChange={(e) => onChange({ required: e.currentTarget.checked })}
        />
      </Group>
      
      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
        <div>
          <Text size="sm" fw={500} mb="xs">Options</Text>
          <Stack gap="xs">
            {question.options?.map((option, index) => (
              <Group key={index}>
                <TextInput
                  placeholder={`Option ${index + 1}`}
                  value={typeof option === 'string' ? option : option.label}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = e.target.value;
                    onChange({ options: newOptions });
                  }}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => {
                    const newOptions = question.options?.filter((_, i) => i !== index);
                    onChange({ options: newOptions });
                  }}
                >
                  <Trash2 size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="subtle"
              size="sm"
              leftSection={<Plus size={16} />}
              onClick={() => {
                const newOptions = [...(question.options || []), ''];
                onChange({ options: newOptions });
              }}
            >
              Add Option
            </Button>
          </Stack>
        </div>
      )}
      
      {question.type === 'text' && (
        <TextInput
          label="Placeholder"
          placeholder="Enter placeholder text"
          value={question.placeholder || ''}
          onChange={(e) => onChange({ placeholder: e.target.value })}
        />
      )}
      
      {question.type === 'number' && (
        <Group>
          <NumberInput
            label="Minimum Value"
            placeholder="Min"
            value={question.validation?.min}
            onChange={(value) => onChange({ 
              validation: { ...question.validation, min: value || undefined }
            })}
          />
          <NumberInput
            label="Maximum Value"
            placeholder="Max"
            value={question.validation?.max}
            onChange={(value) => onChange({ 
              validation: { ...question.validation, max: value || undefined }
            })}
          />
        </Group>
      )}
      
      {question.type === 'scale' && (
        <Group>
          <NumberInput
            label="Scale Min"
            value={question.validation?.min || 1}
            onChange={(value) => onChange({ 
              validation: { ...question.validation, min: value || 1 }
            })}
          />
          <NumberInput
            label="Scale Max"
            value={question.validation?.max || 10}
            onChange={(value) => onChange({ 
              validation: { ...question.validation, max: value || 10 }
            })}
          />
        </Group>
      )}
    </Stack>
  );
}