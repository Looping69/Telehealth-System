/**
 * Create Appointment Modal Component
 * Provides a form to schedule new appointments
 */

import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  Text,
  Textarea,
  NumberInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Calendar, Clock, User, Video, Phone } from 'lucide-react';
import { useCreateAppointment } from '../hooks/useQuery';

/**
 * Props for CreateAppointmentModal component
 */
interface CreateAppointmentModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Form data interface for appointment creation
 */
interface AppointmentFormData {
  patientName: string;
  providerName: string;
  date: Date | null;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'mental-health' | 'chronic-care' | 'specialist' | 'sports-medicine' | 'pain-management';
  sessionType: 'video' | 'phone' | 'in-person';
  notes: string;
}

/**
 * CreateAppointmentModal component for scheduling new appointments
 * @param opened - Whether the modal is open
 * @param onClose - Function to close the modal
 */
export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  opened,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAppointmentMutation = useCreateAppointment();

  const form = useForm<AppointmentFormData>({
    initialValues: {
      patientName: '',
      providerName: '',
      date: null,
      duration: 30,
      type: 'consultation',
      sessionType: 'video',
      notes: '',
    },
    validate: {
      patientName: (value) => (!value ? 'Patient name is required' : null),
      providerName: (value) => (!value ? 'Provider name is required' : null),
      date: (value) => (!value ? 'Date and time are required' : null),
      duration: (value) => (value < 15 ? 'Duration must be at least 15 minutes' : null),
    },
  });

  /**
   * Handles form submission for creating a new appointment
   * @param values - Form values
   */
  const handleSubmit = async (values: AppointmentFormData) => {
    if (!values.date) return;

    setIsSubmitting(true);
    try {
      await createAppointmentMutation.mutateAsync({
        patientName: values.patientName,
        providerName: values.providerName,
        date: values.date,
        duration: values.duration,
        type: values.type,
        sessionType: values.sessionType,
        notes: values.notes,
        status: 'scheduled' as const,
        patientId: '', // Add required field
        providerId: '', // Add required field
      });

      notifications.show({
        title: 'Success',
        message: 'Appointment scheduled successfully',
        color: 'green',
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to schedule appointment. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles modal close with form reset
   */
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Schedule New Appointment"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Patient Name"
            placeholder="Enter patient name"
            leftSection={<User size={16} />}
            required
            {...form.getInputProps('patientName')}
          />

          <TextInput
            label="Provider Name"
            placeholder="Enter provider name"
            leftSection={<User size={16} />}
            required
            {...form.getInputProps('providerName')}
          />

          <DateTimePicker
            label="Date & Time"
            placeholder="Select date and time"
            leftSection={<Calendar size={16} />}
            required
            minDate={new Date()}
            {...form.getInputProps('date')}
          />

          <NumberInput
            label="Duration (minutes)"
            placeholder="30"
            leftSection={<Clock size={16} />}
            min={15}
            max={180}
            step={15}
            required
            {...form.getInputProps('duration')}
          />

          <Select
            label="Appointment Type"
            placeholder="Select appointment type"
            data={[
              { value: 'consultation', label: 'Consultation' },
              { value: 'follow-up', label: 'Follow-up' },
              { value: 'mental-health', label: 'Mental Health' },
              { value: 'emergency', label: 'Emergency' },
              { value: 'routine-checkup', label: 'Routine Checkup' },
            ]}
            required
            {...form.getInputProps('type')}
          />

          <Select
            label="Session Type"
            placeholder="Select session type"
            data={[
              { value: 'video', label: 'Video Call' },
              { value: 'phone', label: 'Phone Call' },
              { value: 'in-person', label: 'In-Person' },
            ]}
            required
            {...form.getInputProps('sessionType')}
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes or instructions..."
            rows={3}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Schedule Appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateAppointmentModal;