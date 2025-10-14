/**
 * Multi-step form component that displays one question at a time
 * Purpose: Provides a smooth, animated form experience for healthcare data collection
 * Inputs: Form configuration, initial data, callbacks
 * Outputs: Form responses and completion status
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Progress,
  Stack,
  Alert,
  Box,
  Transition,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { FormQuestion } from './FormQuestion';
import { Question, FormAnswer, FormData } from '../../types/forms';

interface MultiStepFormProps {
  questions: Question[];
  title: string;
  description?: string;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

/**
 * MultiStepForm Component
 * Renders a form with one question per screen, smooth transitions, and progress tracking
 */
export function MultiStepForm({
  questions,
  title,
  description,
  onSubmit,
  onCancel,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  /**
   * Validates the current question's answer
   * Returns: true if valid, false otherwise
   */
  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return false;

    const answer = answers[currentQuestion.id];
    const newErrors = { ...errors };

    // Remove existing error for this question
    delete newErrors[currentQuestion.id];

    // Check if required question has an answer
    if (currentQuestion.required && (!answer || !answer.value)) {
      newErrors[currentQuestion.id] = 'This question is required';
      setErrors(newErrors);
      return false;
    }

    // Validate based on question type
    if (answer && answer.value) {
      switch (currentQuestion.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(answer.value as string)) {
            newErrors[currentQuestion.id] = 'Please enter a valid email address';
          }
          break;
        case 'number':
          const numValue = Number(answer.value);
          if (isNaN(numValue)) {
            newErrors[currentQuestion.id] = 'Please enter a valid number';
          } else if (currentQuestion.validation?.min !== undefined && numValue < currentQuestion.validation.min) {
            newErrors[currentQuestion.id] = `Value must be at least ${currentQuestion.validation.min}`;
          } else if (currentQuestion.validation?.max !== undefined && numValue > currentQuestion.validation.max) {
            newErrors[currentQuestion.id] = `Value must be at most ${currentQuestion.validation.max}`;
          }
          break;
        case 'text':
        case 'textarea':
          const textValue = answer.value as string;
          if (currentQuestion.validation?.minLength && textValue.length < currentQuestion.validation.minLength) {
            newErrors[currentQuestion.id] = `Must be at least ${currentQuestion.validation.minLength} characters`;
          } else if (currentQuestion.validation?.maxLength && textValue.length > currentQuestion.validation.maxLength) {
            newErrors[currentQuestion.id] = `Must be at most ${currentQuestion.validation.maxLength} characters`;
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles answer change for current question
   */
  const handleAnswerChange = (questionId: string, answer: FormAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));

    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  /**
   * Navigates to the next question with animation
   */
  const handleNext = useCallback(() => {
    if (!validateCurrentQuestion()) return;

    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form
      setIsSubmitting(true);
      const formData: FormData = {
        id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description: description || '',
        category: 'general',
        questions,
        answers,
        submittedAt: new Date(),
        status: 'completed'
      };
      onSubmit(formData);
    }
  }, [currentStep, answers, questions, title, description, onSubmit, isLastStep]);

  /**
   * Navigates to the previous question with animation
   */
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  /**
   * Handles keyboard navigation
   */
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft' && event.ctrlKey) {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'ArrowRight' && event.ctrlKey) {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNext, handlePrevious]);

  if (!currentQuestion) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No questions found in this form.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        {/* Form Header */}
        <Box>
          <Group justify="space-between" mb="md">
            <Text size="sm" c="dimmed">
              Question {currentStep + 1} of {questions.length}
            </Text>
            <Button variant="subtle" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </Group>
          
          {/* Progress Bar */}
          <Progress 
            value={progress} 
            size="sm" 
            radius="xl"
            color="blue"
          />
          
          {/* Form Title */}
          <Title order={2} mt="md">
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed" mt="xs">
              {description}
            </Text>
          )}
        </Box>

        {/* Question Container */}
        <Paper 
          p="xl" 
          radius="md" 
          shadow="sm" 
          style={{ minHeight: '300px' }}
          role="main"
          aria-live="polite"
          aria-label={`Question ${currentStep + 1} of ${questions.length}`}
        >
          <Transition
            mounted={true}
            transition="slide-up"
            duration={200}
            timingFunction="ease-out"
          >
            {(styles) => (
              <div style={styles}>
                <FormQuestion
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  error={errors[currentQuestion.id]}
                  onChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                  autoFocus
                />
              </div>
            )}
          </Transition>
        </Paper>

        {/* Navigation Controls */}
        <Group justify="space-between" role="navigation" aria-label="Form navigation">
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={16} />}
            onClick={handlePrevious}
            disabled={isFirstStep || isSubmitting}
            aria-label="Go to previous question"
          >
            Previous
          </Button>

          <Group gap="xs" role="progressbar" aria-label="Form progress">
            {/* Question indicators */}
            {questions.map((_, index) => (
              <Box
                key={index}
                w={8}
                h={8}
                bg={
                  index < currentStep
                    ? 'green'
                    : index === currentStep
                    ? 'blue'
                    : 'gray.3'
                }
                style={{ borderRadius: '50%' }}
                aria-label={`Question ${index + 1} ${
                  index < currentStep 
                    ? 'completed' 
                    : index === currentStep 
                    ? 'current' 
                    : 'upcoming'
                }`}
              />
            ))}
          </Group>

          <Button
            rightSection={
              isLastStep ? <IconCheck size={16} /> : <IconChevronRight size={16} />
            }
            onClick={handleNext}
            loading={isSubmitting}
            aria-label={isLastStep ? 'Submit form' : 'Go to next question'}
          >
            {isLastStep ? 'Submit' : 'Next'}
          </Button>
        </Group>

        {/* Keyboard shortcuts hint */}
        <Text size="xs" c="dimmed" ta="center">
          Press Enter to continue • Ctrl + ← → to navigate
        </Text>
      </Stack>
    </Container>
  );
}