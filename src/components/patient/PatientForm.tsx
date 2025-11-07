import React from 'react';
import { 
  Stack, 
  TextInput, 
  NumberInput, 
  Textarea, 
  Select, 
  Group, 
  Text,
  Paper,
  Title
} from '@mantine/core';
// import { DateInput, TimeInput } from '@mantine/dates';
import { PatientButton } from './PatientButton';

/**
 * PatientForm Component
 * 
 * Purpose: Mobile-optimized form wrapper for patient portal
 * Features:
 * - Touch-friendly form controls
 * - Consistent spacing and styling
 * - Accessible form labels and validation
 * - Mobile keyboard optimization
 * 
 * Inputs:
 * - title: Form title
 * - children: Form fields and content
 * - onSubmit: Form submission handler
 * - onCancel: Cancel handler
 * - submitText: Submit button text
 * - isLoading: Loading state
 * 
 * Outputs: Renders a styled form container
 */

interface PatientFormProps {
  title?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showActions?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
  title,
  children,
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  showActions = true
}) => {
  return (
    <Paper withBorder p="md" radius="md">
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          {title && (
            <Title order={3} size="h4" mb="xs">
              {title}
            </Title>
          )}
          
          <Stack gap="sm">
            {children}
          </Stack>
          
          {showActions && (
            <Group justify="flex-end" gap="sm" mt="lg">
              {onCancel && (
                <PatientButton
                  patientVariant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelText}
                </PatientButton>
              )}
              <PatientButton
                type="submit"
                patientVariant="primary"
                loading={isLoading}
              >
                {submitText}
              </PatientButton>
            </Group>
          )}
        </Stack>
      </form>
    </Paper>
  );
};

/**
 * PatientFormField Component
 * 
 * Purpose: Standardized form field wrapper with mobile optimization
 */
interface PatientFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

export const PatientFormField: React.FC<PatientFormFieldProps> = ({
  label,
  required,
  error,
  description,
  children
}) => {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
        {required && <Text component="span" c="red" ml={4}>*</Text>}
      </Text>
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}
      {children}
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
};

/**
 * Pre-configured form inputs optimized for mobile
 */
export const PatientTextInput: React.FC<React.ComponentProps<typeof TextInput>> = (props) => (
  <TextInput
    size="md"
    style={{ minHeight: '44px' }}
    {...props}
  />
);

export const PatientNumberInput: React.FC<React.ComponentProps<typeof NumberInput>> = (props) => (
  <NumberInput
    size="md"
    style={{ minHeight: '44px' }}
    {...props}
  />
);

export const PatientTextarea: React.FC<React.ComponentProps<typeof Textarea>> = (props) => (
  <Textarea
    size="md"
    minRows={3}
    autosize
    {...props}
  />
);

export const PatientSelect: React.FC<React.ComponentProps<typeof Select>> = (props) => (
  <Select
    size="md"
    style={{ minHeight: '44px' }}
    {...props}
  />
);

// Date and Time inputs commented out due to missing @mantine/dates dependency
// export const PatientDateInput: React.FC<any> = (props) => (
//   <DateInput
//     size="md"
//     style={{ minHeight: '44px' }}
//     {...props}
//   />
// );

// export const PatientTimeInput: React.FC<any> = (props) => (
//   <TimeInput
//     size="md"
//     style={{ minHeight: '44px' }}
//     {...props}
//   />
// );

export default PatientForm;