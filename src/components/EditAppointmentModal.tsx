/**
 * Edit Appointment Modal Component
 * Provides a form to edit existing appointments
 */

import React, { useState, useEffect } from 'react';
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
import { Appointment } from '../types';

/**
 * Props for EditAppointmentModal component
 */
interface EditAppointmentModalProps {
  opened: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

/**
 * Form data interface for appointment editing
 */
interface AppointmentFormData {
  patientName: string;
  providerName: string;
  date: Date | null;
  duration: number;
  type: string;
  sessionType: string;
  notes: string;
  status: string;
}

/**
 * EditAppointmentModal component for editing existing appointments
 * @param opened - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param appointment - The appointment to edit
 */
export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  opened,
  onClose,
  appointment,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormData>({
    initialValues: {
      patientName: '',
      providerName: '',
      date: null,
      duration: 30,
      type: 'consultation',
      sessionType: 'video',
      notes: '',
      status: 'scheduled',
    },
    validate: {
      patientName: (value) => (!value ? 'Patient name is required' : null),
      providerName: (value) => (!value ? 'Provider name is required' : null),
      date: (value) => (!value ? 'Date and time are required' : null),
      duration: (value) => (value < 15 ? 'Duration must be at least 15 minutes' : null),
    },
  });

  /**
   * Populate form with appointment data when modal opens
   */
  useEffect(() => {
    if (appointment && opened) {
      form.setValues({
        patientName: appointment.patientName || '',
        providerName: appointment.providerName || '',
        date: appointment.date || null,
        duration: appointment.duration || 30,
        type: appointment.type || 'consultation',
        sessionType: appointment.sessionType || 'video',
        notes: appointment.notes || '',
        status: appointment.status || 'scheduled',
      });
    }
  }, [appointment, opened]);

  /**
   * Handles form submission for updating an appointment
   * @param values - Form values
   */
  const handleSubmit = async (values: AppointmentFormData) => {
    if (!values.date || !appointment) return;

    setIsSubmitting(true);
    try {
      // Simulate API call - in real implementation, this would call an update mutation
      await new Promise(resolve => setTimeout(resolve, 1000));

      notifications.show({
        title: 'Success',
        message: 'Appointment updated successfully',
        color: 'green',
      });

      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update appointment. Please try again.',
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

  if (!appointment) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Edit Appointment"
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

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            required
            {...form.getInputProps('status')}
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
              Update Appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditAppointmentModal;