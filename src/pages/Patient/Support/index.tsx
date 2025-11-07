import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Grid, 
  Badge,
  Tabs,
  Alert,
  Modal,
  ActionIcon,
  Timeline,
  Avatar,
  Divider,
  Notification
} from '@mantine/core';
import { 
  IconMessage, 
  IconCalendar, 
  IconTicket, 
  IconPhone, 
  IconMail,
  IconSend,
  IconPaperclip,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconUser,
  IconStethoscope,
  IconVideo,
  IconPlus
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { PatientCard, PatientButton, PatientTextInput, PatientTextarea, PatientSelect } from '../../../components/patient';

/**
 * PatientSupport Component
 * 
 * Purpose: Support and communication hub for GLP-1 patients
 * Features:
 * - Provider messaging system
 * - Support ticket creation and tracking
 * - Appointment request system
 * - Emergency contact information
 * - Live chat support
 * - Communication history
 * 
 * Inputs: None (uses patient context from auth store)
 * Outputs: Renders support interface with messaging and ticket systems
 */
const PatientSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('messages');
  const [newMessage, setNewMessage] = useState('');
  const [ticketModalOpened, { open: openTicketModal, close: closeTicketModal }] = useDisclosure(false);
  const [appointmentModalOpened, { open: openAppointmentModal, close: closeAppointmentModal }] = useDisclosure(false);

  // Mock data - will be replaced with FHIR Communication resources
  const messages = [
    {
      id: 1,
      sender: 'Dr. Sarah Johnson',
      senderType: 'provider',
      message: 'How are you feeling with the new dosage? Any side effects to report?',
      timestamp: '2024-01-15 10:30 AM',
      read: true,
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20doctor%20headshot%20medical%20uniform%20friendly%20smile%20healthcare%20professional&image_size=square'
    },
    {
      id: 2,
      sender: 'You',
      senderType: 'patient',
      message: 'Feeling much better! The nausea has decreased significantly. My weight is down 3 pounds this week.',
      timestamp: '2024-01-15 11:15 AM',
      read: true
    },
    {
      id: 3,
      sender: 'Dr. Sarah Johnson',
      senderType: 'provider',
      message: 'That\'s excellent progress! Keep up the good work with your diet and exercise routine. Let\'s schedule a follow-up in 2 weeks.',
      timestamp: '2024-01-15 11:45 AM',
      read: true,
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20doctor%20headshot%20medical%20uniform%20friendly%20smile%20healthcare%20professional&image_size=square'
    }
  ];

  const supportTickets = [
    {
      id: 'TK-001',
      subject: 'Medication delivery delay',
      status: 'resolved',
      priority: 'medium',
      created: '2024-01-10',
      lastUpdate: '2024-01-12',
      category: 'Pharmacy'
    },
    {
      id: 'TK-002',
      subject: 'Insurance coverage question',
      status: 'in-progress',
      priority: 'high',
      created: '2024-01-14',
      lastUpdate: '2024-01-15',
      category: 'Billing'
    }
  ];

  const appointments = [
    {
      id: 1,
      type: 'Follow-up Consultation',
      provider: 'Dr. Sarah Johnson',
      date: '2024-01-22',
      time: '2:00 PM',
      status: 'confirmed',
      mode: 'video'
    },
    {
      id: 2,
      type: 'Lab Review',
      provider: 'Nurse Practitioner Mike Chen',
      date: '2024-01-29',
      time: '10:30 AM',
      status: 'pending',
      mode: 'in-person'
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Implement message sending with FHIR Communication
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleCreateTicket = () => {
    // TODO: Implement ticket creation
    closeTicketModal();
  };

  const handleRequestAppointment = () => {
    // TODO: Implement appointment request
    closeAppointmentModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'green';
      case 'in-progress': return 'blue';
      case 'pending': return 'yellow';
      case 'confirmed': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Container size="lg" p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} mb="xs">Support &amp; Communication</Title>
            <Text c="dimmed" size="sm">Get help and stay connected with your care team</Text>
          </div>
          <Group gap="xs">
            <PatientButton 
              patientVariant="secondary"
              leftSection={<IconTicket size="1rem" />} 
              size="sm"
              onClick={openTicketModal}
            >
              New Ticket
            </PatientButton>
            <PatientButton 
              patientVariant="primary"
              leftSection={<IconCalendar size="1rem" />} 
              size="sm"
              onClick={openAppointmentModal}
            >
              Request Appointment
            </PatientButton>
          </Group>
        </Group>

        {/* Emergency Contact Alert */}
        <Alert color="red" icon={<IconAlertCircle size="1rem" />}>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Emergency Contact</Text>
              <Text size="sm">For urgent medical concerns, call 911 or go to your nearest emergency room.</Text>
            </div>
            <PatientButton 
              patientVariant="danger" 
              size="sm" 
              leftSection={<IconPhone size="1rem" />}
            >
              Call 911
            </PatientButton>
          </Group>
        </Alert>

        <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="messages" leftSection={<IconMessage size="1rem" />}>
              Messages
            </Tabs.Tab>
            <Tabs.Tab value="tickets" leftSection={<IconTicket size="1rem" />}>
              Support Tickets
            </Tabs.Tab>
            <Tabs.Tab value="appointments" leftSection={<IconCalendar size="1rem" />}>
              Appointments
            </Tabs.Tab>
          </Tabs.List>

          {/* Messages Tab */}
          <Tabs.Panel value="messages" pt="md">
            <PatientCard title="Provider Messages" variant="default">
              <Stack gap="md" mt="md">
                {/* Message Thread */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Timeline active={messages.length - 1} bulletSize={24} lineWidth={2}>
                    {messages.map((message, index) => (
                      <Timeline.Item
                        key={message.id}
                        bullet={
                          message.senderType === 'provider' ? (
                            <Avatar size="sm" src={message.avatar} />
                          ) : (
                            <IconUser size="1rem" />
                          )
                        }
                        title={
                          <Group justify="space-between">
                            <Text fw={500}>{message.sender}</Text>
                            <Text size="xs" c="dimmed">{message.timestamp}</Text>
                          </Group>
                        }
                      >
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {message.message}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>

                <Divider />

                {/* New Message Form */}
                <Stack gap="sm">
                  <PatientTextarea
                    placeholder="Type your message to your care team..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    minRows={3}
                  />
                  <Group justify="space-between">
                    <ActionIcon variant="light" size="lg">
                      <IconPaperclip size="1.2rem" />
                    </ActionIcon>
                    <PatientButton
                      patientVariant="primary"
                      leftSection={<IconSend size="1rem" />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send Message
                    </PatientButton>
                  </Group>
                </Stack>
              </Stack>
            </PatientCard>
          </Tabs.Panel>

          {/* Support Tickets Tab */}
          <Tabs.Panel value="tickets" pt="md">
            <Grid>
              {supportTickets.map((ticket) => (
                <Grid.Col key={ticket.id} span={{ base: 12, md: 6 }}>
                  <PatientCard
                    title={`${ticket.id}: ${ticket.subject}`}
                    description={`Category: ${ticket.category} • Last updated: ${ticket.lastUpdate}`}
                    badge={{ 
                      text: ticket.status.replace('-', ' ').toUpperCase(), 
                      color: getStatusColor(ticket.status),
                      variant: 'light' 
                    }}
                    variant="interactive"
                  >
                    <Group justify="space-between" mt="sm">
                      <Group gap="xs">
                        <IconClock size="0.8rem" />
                        <Text size="xs" c="dimmed">Created: {ticket.created}</Text>
                      </Group>
                      <Badge size="sm" color={ticket.priority === 'high' ? 'red' : ticket.priority === 'medium' ? 'yellow' : 'gray'}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </Group>
                  </PatientCard>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          {/* Appointments Tab */}
          <Tabs.Panel value="appointments" pt="md">
            <Grid>
              {appointments.map((appointment) => (
                <Grid.Col key={appointment.id} span={{ base: 12, md: 6 }}>
                  <PatientCard
                    title={appointment.type}
                    description={`${appointment.date} at ${appointment.time}`}
                    badge={{ 
                      text: appointment.status.toUpperCase(), 
                      color: getStatusColor(appointment.status),
                      variant: 'light' 
                    }}
                    variant="interactive"
                  >
                    <Stack gap="xs" mt="sm">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <IconStethoscope size="0.8rem" />
                          <Text size="xs" c="dimmed">{appointment.provider}</Text>
                        </Group>
                        <Group gap="xs">
                          {appointment.mode === 'video' ? (
                            <IconVideo size="0.8rem" />
                          ) : (
                            <IconUser size="0.8rem" />
                          )}
                          <Text size="xs" c="dimmed">{appointment.mode}</Text>
                        </Group>
                      </Group>
                      
                      {appointment.status === 'confirmed' && (
                        <PatientButton 
                          patientVariant="primary" 
                          fullWidth 
                          size="sm"
                          leftSection={appointment.mode === 'video' ? <IconVideo size="0.8rem" /> : <IconCalendar size="0.8rem" />}
                        >
                          {appointment.mode === 'video' ? 'Join Video Call' : 'View Details'}
                        </PatientButton>
                      )}
                    </Stack>
                  </PatientCard>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>
        </Tabs>

        {/* Create Ticket Modal */}
        <Modal opened={ticketModalOpened} onClose={closeTicketModal} title="Create Support Ticket" size="md">
          <Stack gap="md">
            <PatientTextInput
              label="Subject"
              placeholder="Brief description of your issue"
              required
            />
            
            <PatientSelect
              label="Category"
              placeholder="Select category"
              data={[
                { value: 'medication', label: 'Medication' },
                { value: 'billing', label: 'Billing' },
                { value: 'technical', label: 'Technical Support' },
                { value: 'appointment', label: 'Appointment' },
                { value: 'other', label: 'Other' }
              ]}
              required
            />
            
            <PatientSelect
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
              required
            />
            
            <PatientTextarea
              label="Description"
              placeholder="Please provide detailed information about your issue"
              minRows={4}
              required
            />
            
            <Group justify="flex-end" gap="sm">
              <PatientButton patientVariant="secondary" onClick={closeTicketModal}>
                Cancel
              </PatientButton>
              <PatientButton patientVariant="primary" onClick={handleCreateTicket}>
                Create Ticket
              </PatientButton>
            </Group>
          </Stack>
        </Modal>

        {/* Request Appointment Modal */}
        <Modal opened={appointmentModalOpened} onClose={closeAppointmentModal} title="Request Appointment" size="md">
          <Stack gap="md">
            <PatientSelect
              label="Appointment Type"
              placeholder="Select appointment type"
              data={[
                { value: 'follow-up', label: 'Follow-up Consultation' },
                { value: 'lab-review', label: 'Lab Review' },
                { value: 'medication-adjustment', label: 'Medication Adjustment' },
                { value: 'side-effects', label: 'Side Effects Discussion' },
                { value: 'other', label: 'Other' }
              ]}
              required
            />
            
            <PatientSelect
              label="Preferred Provider"
              placeholder="Select provider"
              data={[
                { value: 'dr-johnson', label: 'Dr. Sarah Johnson' },
                { value: 'np-chen', label: 'Nurse Practitioner Mike Chen' },
                { value: 'any', label: 'Any Available Provider' }
              ]}
              required
            />
            
            <PatientSelect
              label="Preferred Mode"
              placeholder="Select appointment mode"
              data={[
                { value: 'video', label: 'Video Call' },
                { value: 'in-person', label: 'In-Person' },
                { value: 'phone', label: 'Phone Call' }
              ]}
              required
            />
            
            <PatientTextarea
              label="Reason for Appointment"
              placeholder="Please describe the reason for your appointment request"
              minRows={3}
              required
            />
            
            <Group justify="flex-end" gap="sm">
              <PatientButton patientVariant="secondary" onClick={closeAppointmentModal}>
                Cancel
              </PatientButton>
              <PatientButton patientVariant="primary" onClick={handleRequestAppointment}>
                Request Appointment
              </PatientButton>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default PatientSupport;