import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Group,
  Stack,
  Alert,
  LoadingOverlay,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconSend } from '@tabler/icons-react';
import { useCreateCommunication, usePatients } from '../hooks/useQuery';
import { notifications } from '@mantine/notifications';

interface CreateMessageModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Modal component for creating new FHIR Communication messages
 * Provides searchable patient selection, message composition, and priority settings
 */
export function CreateMessageModal({ opened, onClose }: CreateMessageModalProps) {
  // Form state
  const [recipientId, setRecipientId] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'asap' | 'stat'>('routine');
  const [category, setCategory] = useState<string>('notification');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hooks
  const { data: patients = [], isLoading: patientsLoading } = usePatients({
    search: searchQuery,
    _count: '20',
  });
  const createCommunication = useCreateCommunication();

  // Prepare patient options for Select component
  const patientOptions = patients.map((patient: any) => ({
    value: patient.id || '',
    label: patient.name?.[0]?.given?.[0] && patient.name?.[0]?.family
      ? `${patient.name[0].given[0]} ${patient.name[0].family}`
      : patient.name?.[0]?.text || 'Unknown Patient',
  })).filter(option => option.value); // Filter out patients without IDs

  /**
   * Handle form submission - creates new FHIR Communication
   */
  const handleSubmit = async () => {
    // Validation
    if (!recipientId) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a recipient',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    if (!message.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please enter a message',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    try {
      await createCommunication.mutateAsync({
        recipientId,
        recipientName,
        recipientType: 'Patient',
        subject: subject.trim() || undefined,
        message: message.trim(),
        priority,
        category,
        senderName: 'Healthcare Provider',
        senderId: 'practitioner-1',
      });

      notifications.show({
        title: 'Message Sent',
        message: `Message sent successfully to ${recipientName}`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  /**
   * Handle modal close - resets form state
   */
  const handleClose = () => {
    setRecipientId('');
    setRecipientName('');
    setSubject('');
    setMessage('');
    setPriority('routine');
    setCategory('notification');
    setSearchQuery('');
    onClose();
  };

  /**
   * Handle recipient selection from dropdown
   */
  const handleRecipientChange = (value: string | null) => {
    if (value) {
      setRecipientId(value);
      const selectedPatient = patients.find((p: any) => p.id === value);
      if (selectedPatient) {
        const name = selectedPatient.name?.[0]?.given?.[0] && selectedPatient.name?.[0]?.family
          ? `${selectedPatient.name[0].given[0]} ${selectedPatient.name[0].family}`
          : selectedPatient.name?.[0]?.text || 'Unknown Patient';
        setRecipientName(name);
      }
    } else {
      setRecipientId('');
      setRecipientName('');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Compose New Message"
      size="lg"
      centered
    >
      <LoadingOverlay visible={createCommunication.isPending} />
      
      <Stack gap="md">
        {/* Recipient Selection */}
        <Select
          label="Recipient"
          placeholder="Search and select a patient..."
          data={patientOptions}
          value={recipientId}
          onChange={handleRecipientChange}
          onSearchChange={setSearchQuery}
          searchable
          clearable
          required
          loading={patientsLoading}
          description="Type to search for patients by name"
        />

        {/* Message Category */}
        <Select
          label="Category"
          value={category}
          onChange={(value) => setCategory(value || 'notification')}
          data={[
            { value: 'notification', label: 'Notification' },
            { value: 'reminder', label: 'Reminder' },
            { value: 'instruction', label: 'Instruction' },
            { value: 'alert', label: 'Alert' },
            { value: 'education', label: 'Education' },
          ]}
          required
        />

        {/* Priority Selection */}
        <Select
          label="Priority"
          value={priority}
          onChange={(value) => setPriority(value as 'routine' | 'urgent' | 'asap' | 'stat' || 'routine')}
          data={[
            { value: 'routine', label: 'Routine' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'asap', label: 'ASAP' },
            { value: 'stat', label: 'STAT' },
          ]}
          required
        />

        {/* Subject (Optional) */}
        <TextInput
          label="Subject"
          placeholder="Enter message subject (optional)"
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
          maxLength={100}
        />

        {/* Message Content */}
        <Textarea
          label="Message"
          placeholder="Enter your message..."
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          minRows={4}
          maxRows={8}
          required
          maxLength={1000}
        />

        {/* Character Count */}
        <Text size="xs" c="dimmed" ta="right">
          {message.length}/1000 characters
        </Text>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createCommunication.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createCommunication.isPending}
            leftSection={<IconSend size={16} />}
          >
            Send Message
          </Button>
        </Group>

        {/* Error Display */}
        {createCommunication.error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            Failed to send message. Please check your connection and try again.
          </Alert>
        )}
      </Stack>
    </Modal>
  );
}