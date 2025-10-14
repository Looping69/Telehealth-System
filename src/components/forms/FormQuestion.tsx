/**
 * Individual form question component
 * Purpose: Renders different types of form questions with appropriate input controls
 * Inputs: Question configuration, current answer, error state, change handler
 * Outputs: User input through onChange callback
 */

import React from 'react';
import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Radio,
  Checkbox,
  Switch,
  Stack,
  Text,
  Group,
  Rating,
  Alert,
  Button,
  Box,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { Question, FormAnswer } from '../../types/forms';

interface FormQuestionProps {
  question: Question;
  answer?: FormAnswer;
  error?: string;
  onChange: (answer: FormAnswer) => void;
  autoFocus?: boolean;
}

/**
 * FormQuestion Component
 * Renders appropriate input control based on question type
 */
export function FormQuestion({
  question,
  answer,
  error,
  onChange,
  autoFocus = false,
}: FormQuestionProps) {

  /**
   * Handles value changes for different input types
   */
  const handleChange = (value: any) => {
    const newAnswer: FormAnswer = {
      questionId: question.id,
      value,
      timestamp: new Date().toISOString(),
    };
    onChange(newAnswer);
  };

  /**
   * Renders the appropriate input control based on question type
   */
  const renderInput = () => {
    const commonProps = {
      error,
      size: 'lg' as const,
      radius: 'md' as const,
    };

    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <TextInput
            {...commonProps}
            type={question.type === 'email' ? 'email' : 'text'}
            placeholder={question.placeholder}
            value={(answer?.value as string) || ''}
            onChange={(event) => handleChange(event.currentTarget.value)}
            maxLength={question.validation?.maxLength}
            data-autofocus={autoFocus}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={question.placeholder}
            value={(answer?.value as string) || ''}
            onChange={(event) => handleChange(event.currentTarget.value)}
            minRows={4}
            maxRows={8}
            autosize
            maxLength={question.validation?.maxLength}
          />
        );

      case 'number':
        return (
          <NumberInput
            {...commonProps}
            placeholder={question.placeholder}
            value={answer?.value as number}
            onChange={handleChange}
            min={question.validation?.min}
            max={question.validation?.max}
            step={question.validation?.step || 1}
          />
        );

      case 'date':
        return (
          <DateInput
            {...commonProps}
            placeholder={question.placeholder}
            value={answer?.value ? new Date(answer.value as string) : null}
            onChange={(date) => handleChange(date?.toISOString())}
            clearable
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            placeholder={question.placeholder}
            data={question.options || []}
            value={(answer?.value as string) || null}
            onChange={handleChange}
            searchable={question.options && question.options.length > 5}
            clearable
          />
        );

      case 'radio':
        return (
          <Radio.Group
            value={(answer?.value as string) || ''}
            onChange={handleChange}
            error={error}
          >
            <Stack gap="sm">
              {question.options?.map((option) => (
                <Radio
                  key={typeof option === 'string' ? option : option.value}
                  value={typeof option === 'string' ? option : option.value}
                  label={typeof option === 'string' ? option : option.label}
                  size="md"
                />
              ))}
            </Stack>
          </Radio.Group>
        );

      case 'checkbox':
        const selectedValues = (answer?.value as string[]) || [];
        return (
          <Checkbox.Group
            value={selectedValues}
            onChange={handleChange}
            error={error}
          >
            <Stack gap="sm">
              {question.options?.map((option) => (
                <Checkbox
                  key={typeof option === 'string' ? option : option.value}
                  value={typeof option === 'string' ? option : option.value}
                  label={typeof option === 'string' ? option : option.label}
                  size="md"
                />
              ))}
            </Stack>
          </Checkbox.Group>
        );

      case 'boolean':
        return (
          <Group gap="md">
            <Button
              variant={answer?.value === true ? 'filled' : 'outline'}
              color="green"
              size="lg"
              onClick={() => handleChange(true)}
              style={{ flex: 1 }}
            >
              Yes
            </Button>
            <Button
              variant={answer?.value === false ? 'filled' : 'outline'}
              color="red"
              size="lg"
              onClick={() => handleChange(false)}
              style={{ flex: 1 }}
            >
              No
            </Button>
          </Group>
        );

      case 'scale':
        const scaleMin = question.validation?.min || 1;
        const scaleMax = question.validation?.max || 10;
        const scaleValue = answer?.value as number;

        return (
          <Box>
            <Group justify="space-between" mb="sm">
              <Text size="sm" c="dimmed">
                {question.scaleLabels?.min || scaleMin}
              </Text>
              <Text size="sm" c="dimmed">
                {question.scaleLabels?.max || scaleMax}
              </Text>
            </Group>
            <Group gap="xs" justify="center">
              {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => {
                const value = scaleMin + i;
                return (
                  <Button
                    key={value}
                    variant={scaleValue === value ? 'filled' : 'outline'}
                    size="lg"
                    w={50}
                    h={50}
                    onClick={() => handleChange(value)}
                    style={{ borderRadius: '50%' }}
                  >
                    {value}
                  </Button>
                );
              })}
            </Group>
          </Box>
        );

      default:
        return (
          <Text c="red">
            Unsupported question type: {question.type}
          </Text>
        );
    }
  };

  return (
    <Stack gap="lg">
      {/* Question Text */}
      <Box>
        <Text size="xl" fw={500} mb="xs">
          {question.text}
          {question.required && (
            <Text component="span" c="red" ml={4}>
              *
            </Text>
          )}
        </Text>
        {question.description && (
          <Text size="sm" c="dimmed">
            {question.description}
          </Text>
        )}
      </Box>

      {/* Input Control */}
      <Box>
        {renderInput()}
        {question.helpText && !error && (
          <Text size="xs" c="dimmed" mt="xs">
            {question.helpText}
          </Text>
        )}
      </Box>
    </Stack>
  );
}