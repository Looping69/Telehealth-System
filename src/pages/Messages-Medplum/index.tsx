/**
 * Messages-Medplum Page Component
 * Manages communication using FHIR data
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Button,
  TextInput,
  Select,
  ActionIcon,
  Modal,
  Center,
  Loader,
  Alert,
  Avatar,
  Textarea,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Reply,
  MessageCircle,
  User,
  Calendar,
  Filter,
  Database,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useCommunications, useCreateCommunication } from '../../hooks/useQuery';
import { CreateMessageModal } from '../../components/CreateMessageModal';
import { Communication } from '@medplum/fhirtypes';

/**
 * FHIR Communication Card Component
 */
interface FHIRCommunicationCardProps {
  communication: Communication;
  onView: (communication: Communication) => void;
  onReply: (communication: Communication) => void;
}

const FHIRCommunicationCard: React.FC<FHIRCommunicationCardProps> = ({ communication, onView, onReply }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'blue';
      case 'on-hold':
        return 'yellow';
      case 'stopped':
        return 'red';
      case 'unknown':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getSenderName = () => {
    return communication.sender?.display || 'Unknown Sender';
  };

  const getRecipientName = () => {
    return communication.recipient?.[0]?.display || 'Unknown Recipient';
  };

  const getSubject = () => {
    return communication.payload?.[0]?.contentString || 'No subject';
  };

  const getSentDate = () => {
    return communication.sent ? new Date(communication.sent).toLocaleDateString() : 'Unknown date';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Communication
            </Badge>
          </Group>
          <Badge color={getStatusColor(communication.status)}>
            {communication.status}
          </Badge>
        </Group>

        <Group>
          <Avatar size="md" color="blue">
            <MessageCircle size={20} />
          </Avatar>
          <Stack gap={4}>
            <Text fw={500} lineClamp={1}>{getSubject()}</Text>
            <Text size="sm" c="dimmed">
              From: {getSenderName()}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">To: {getRecipientName()}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Sent: {getSentDate()}</Text>
          </Group>
          {communication.category?.[0]?.text && (
            <Group gap="xs">
              <MessageCircle size={14} />
              <Text size="sm">Category: {communication.category[0].text}</Text>
            </Group>
          )}
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            Priority: {communication.priority || 'Normal'}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(communication)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="green"
              onClick={() => onReply(communication)}
            >
              <Reply size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Main Messages-Medplum Page Component
 */
const MessagesMedplumPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [replyOpened, { open: openReply, close: closeReply }] = useDisclosure(false);

  // Use the new hooks for data fetching
  const { 
    data: communications = [], 
    isLoading: loading, 
    error: queryError 
  } = useCommunications({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    _sort: '-sent',
    _count: '50',
  });

  const createCommunication = useCreateCommunication();

  // Convert query error to string for display
  const error = queryError ? 'Failed to fetch messages. Please check your connection.' : null;

  // Filter communications (filtering is now handled by the hook, but we keep this for additional client-side filtering if needed)
  const filteredCommunications = communications;

  const handleViewCommunication = (communication: Communication) => {
    setSelectedCommunication(communication);
    openDetails();
  };

  const handleReplyCommunication = (communication: Communication) => {
    setSelectedCommunication(communication);
    setReplyMessage('');
    openReply();
  };

  const handleSendReply = async () => {
    if (!selectedCommunication || !replyMessage.trim()) return;

    try {
      // Use the createCommunication hook to send reply
      await createCommunication.mutateAsync({
        recipientId: selectedCommunication.sender?.reference?.split('/')[1] || '',
        recipientName: selectedCommunication.sender?.display || 'Unknown',
        recipientType: selectedCommunication.sender?.reference?.startsWith('Patient/') ? 'Patient' : 'Practitioner',
        message: replyMessage.trim(),
        category: 'notification',
        priority: 'routine',
        senderName: 'Healthcare Provider',
        senderId: 'practitioner-1',
      });

      closeReply();
      setReplyMessage('');
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR communications...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Messages</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage patient communications and messages</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCompose}>
            Compose Message
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search messages..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'on-hold', label: 'On Hold' },
                  { value: 'stopped', label: 'Stopped' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredCommunications.length} messages
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Messages Grid */}
        {filteredCommunications.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <MessageCircle size={48} color="gray" />
              <Text size="lg" c="dimmed">No messages found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or compose a new message'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredCommunications.map((communication) => (
              <Grid.Col key={communication.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRCommunicationCard
                  communication={communication}
                  onView={handleViewCommunication}
                  onReply={handleReplyCommunication}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Message Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Communication #${selectedCommunication?.id}`}
          size="lg"
        >
          {selectedCommunication && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Communication ID: {selectedCommunication.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>From</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCommunication.sender?.display || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>To</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCommunication.recipient?.[0]?.display || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedCommunication.status === 'completed' ? 'green' : 'blue'}>
                      {selectedCommunication.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Sent</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCommunication.sent ? new Date(selectedCommunication.sent).toLocaleString() : 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Message</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCommunication.payload?.[0]?.contentString || 'No content'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Compose Message Modal */}
        <CreateMessageModal
          opened={composeOpened}
          onClose={closeCompose}
        />

        {/* Reply Modal */}
        <Modal
          opened={replyOpened}
          onClose={closeReply}
          title="Reply to Message"
          size="lg"
        >
          {selectedCommunication && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Replying to FHIR Communication from {selectedCommunication.sender?.display}
              </Alert>
              <Textarea
                label="Your Reply"
                placeholder="Type your reply message..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.currentTarget.value)}
                minRows={4}
                required
              />
              <Group justify="flex-end">
                <Button variant="outline" onClick={closeReply}>
                  Cancel
                </Button>
                <Button 
                  leftSection={<Send size={16} />}
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  loading={createCommunication.isPending}
                >
                  Send Reply
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default MessagesMedplumPage;