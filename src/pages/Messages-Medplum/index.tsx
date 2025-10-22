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
  Tabs,
  ScrollArea,
  Divider,
  UnstyledButton,
  Indicator,
  Table,
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
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Forward,
  Clock,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useCommunications, useCreateCommunication } from '../../hooks/useQuery';
import { CreateMessageModal } from '../../components/CreateMessageModal';
import { Communication } from '@medplum/fhirtypes';

/**
 * Helper function to format date
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Helper function to get priority color
 */
const getPriorityColor = (priority: string | undefined): string => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'high':
      return 'red';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'blue';
  }
};

/**
 * Helper function to get status color
 */
const getStatusColor = (status: string | undefined): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'green';
    case 'in-progress':
      return 'blue';
    case 'on-hold':
      return 'yellow';
    case 'stopped':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * FHIR Communication Card Component
 */
interface FHIRCommunicationCardProps {
  communication: any;
  onView: (communication: any) => void;
  onReply: (communication: any) => void;
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
 * FHIR Communication Table Row Component
 */
interface FHIRCommunicationTableRowProps {
  communication: any;
  onView: (communication: any) => void;
  onReply: (communication: any) => void;
}

const FHIRCommunicationTableRow: React.FC<FHIRCommunicationTableRowProps> = ({ communication, onView, onReply }) => {
  const getSenderName = () => {
    return communication.sender?.display || 'Unknown Sender';
  };

  const getRecipientName = () => {
    return communication.recipient?.[0]?.display || 'Unknown Recipient';
  };

  const getSubject = () => {
    return communication.payload?.[0]?.contentString || 
           communication.reasonCode?.[0]?.text || 
           'No Subject';
  };

  const getSentDate = () => {
    return formatDate(communication.sent);
  };

  const getContent = () => {
    const content = communication.payload?.[0]?.contentString || 'No content';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" color="blue">
            <MessageCircle size={16} />
          </Avatar>
          <Text fw={500}>{getSenderName()}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text lineClamp={1}>{getSubject()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>{getContent()}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getPriorityColor(communication.priority)} variant="light">
          {communication.priority || 'Normal'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(communication.status)} variant="light">
          {communication.status || 'Unknown'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getSentDate()}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(communication)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="green"
            size="sm"
            onClick={() => onReply(communication)}
          >
            <Reply size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Compose FHIR Communication Modal Component
 */
interface ComposeFHIRCommunicationModalProps {
  opened: boolean;
  onClose: () => void;
  onMessageSent: (communication: any) => void;
  replyTo?: any | null;
}

const ComposeFHIRCommunicationModal: React.FC<ComposeFHIRCommunicationModalProps> = ({ 
  opened, 
  onClose, 
  onMessageSent, 
  replyTo 
}) => {
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('routine');
  const [category, setCategory] = useState('notification');

  const createCommunication = useCreateCommunication();

  useEffect(() => {
    if (replyTo) {
      setRecipientId(replyTo.sender?.reference?.split('/')[1] || '');
      setRecipientName(replyTo.sender?.display || '');
      setSubject(`Re: ${replyTo.payload?.[0]?.contentString || replyTo.reasonCode?.[0]?.text || 'Message'}`);
      setPriority(replyTo.priority || 'routine');
    } else {
      setRecipientId('');
      setRecipientName('');
      setSubject('');
      setPriority('routine');
    }
    setMessage('');
  }, [replyTo, opened]);

  const handleSubmit = async () => {
    if (!recipientId || !message.trim()) return;

    try {
      const newCommunication = await createCommunication.mutateAsync({
        recipientId,
        recipientName,
        recipientType: 'Patient',
        message: message.trim(),
        category,
        priority: priority as 'routine' | 'urgent' | 'asap' | 'stat',
        senderName: 'Healthcare Provider',
        senderId: 'practitioner-1',
      });

      onMessageSent(newCommunication);
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={replyTo ? 'Reply to Message' : 'Compose New Message'}
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Recipient ID"
              placeholder="Enter recipient ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.currentTarget.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Recipient Name"
              placeholder="Enter recipient name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.currentTarget.value)}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Subject"
          placeholder="Enter message subject"
          value={subject}
          onChange={(e) => setSubject(e.currentTarget.value)}
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Priority"
              value={priority}
              onChange={(value) => setPriority(value || 'routine')}
              data={[
                { value: 'routine', label: 'Routine' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'asap', label: 'ASAP' },
                { value: 'stat', label: 'STAT' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Category"
              value={category}
              onChange={(value) => setCategory(value || 'notification')}
              data={[
                { value: 'notification', label: 'Notification' },
                { value: 'reminder', label: 'Reminder' },
                { value: 'alert', label: 'Alert' },
                { value: 'instruction', label: 'Instruction' },
              ]}
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label="Message"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          minRows={4}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            leftSection={<Send size={16} />} 
            onClick={handleSubmit}
            loading={createCommunication.isPending}
          >
            Send Message
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * View FHIR Communication Modal Component
 */
interface ViewFHIRCommunicationModalProps {
  opened: boolean;
  onClose: () => void;
  communication: any | null;
  onReply: (communication: any) => void;
}

const ViewFHIRCommunicationModal: React.FC<ViewFHIRCommunicationModalProps> = ({ 
  opened, 
  onClose, 
  communication, 
  onReply 
}) => {
  if (!communication) return null;

  const getSenderName = () => {
    return communication.sender?.display || 'Unknown Sender';
  };

  const getRecipientName = () => {
    return communication.recipient?.[0]?.display || 'Unknown Recipient';
  };

  const getSubject = () => {
    return communication.payload?.[0]?.contentString || 
           communication.reasonCode?.[0]?.text || 
           'No Subject';
  };

  const getSentDate = () => {
    return formatDate(communication.sent);
  };

  const getContent = () => {
    return communication.payload?.[0]?.contentString || 'No content available';
  };

  const handleReply = () => {
    onReply(communication);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Message Details"
      size="lg"
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Badge color={getPriorityColor(communication.priority)} variant="light">
            {communication.priority || 'Normal'} Priority
          </Badge>
          <Badge color={getStatusColor(communication.status)} variant="light">
            {communication.status || 'Unknown'}
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

        <Divider />

        <ScrollArea mah={300}>
          <Text>{getContent()}</Text>
        </ScrollArea>

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button leftSection={<Reply size={16} />} onClick={handleReply}>
            Reply
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Messages-Medplum Page Component
 */
const MessagesMedplumPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [viewDetailsOpened, { open: openViewDetails, close: closeViewDetails }] = useDisclosure(false);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  
  // New state for card/table view
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'conversations'>('conversations');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Use the new hooks for data fetching
  const { 
    data: communications = [], 
    isLoading: loading, 
    error: queryError 
  } = useCommunications({
    search: searchQuery,
    status: statusFilter || undefined,
    _sort: '-sent',
    _count: '50',
  });

  const createCommunication = useCreateCommunication();

  // Convert query error to string for display
  const error = queryError ? 'Failed to fetch messages. Please check your connection.' : null;

  const currentUser = 'practitioner-1'; // Mock current user

  // Filter communications based on search and filters
  const filteredCommunications = communications.filter((communication) => {
    if (!communication) return false;
    
    const matchesSearch = 
      communication.sender?.display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      communication.payload?.[0]?.contentString?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (communication as any).reasonCode?.[0]?.text?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || communication.status === statusFilter;
    const matchesPriority = !priorityFilter || communication.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  /**
   * Handle sending a new message
   * @param communication - The communication to send
   */
  const handleMessageSent = (communication: any) => {
    console.log('Message sent successfully!');
    // The query will automatically refetch and update the list
  };

  const handleViewCommunication = (communication: Communication) => {
    setSelectedCommunication(communication);
    openViewDetails();
  };

  const handleReplyCommunication = (communication: Communication) => {
    setSelectedCommunication(communication);
    openCompose();
  };

  const handleComposeClose = () => {
    setSelectedCommunication(null);
    closeCompose();
  };

  const handleViewClose = () => {
    setSelectedCommunication(null);
    closeViewDetails();
  };

  // Calculate summary statistics
  const unreadMessages = communications.filter(comm => 
    comm && comm.status !== 'completed' && 
    comm.recipient?.[0]?.reference?.includes(currentUser)
  ).length;
  
  const totalConversations = communications.length;
  const urgentMessages = communications.filter(comm => 
    comm && comm.priority === 'urgent' && comm.status !== 'completed'
  ).length;

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
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Messages</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Secure messaging and communication</Text>
            </Group>
          </div>
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

        {/* Filters and Search */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search messages..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'completed', label: 'Completed' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'on-hold', label: 'On Hold' },
                  { value: 'stopped', label: 'Stopped' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <Select
                placeholder="Filter by priority"
                data={[
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'asap', label: 'ASAP' },
                  { value: 'routine', label: 'Routine' },
                  { value: 'stat', label: 'STAT' },
                ]}
                value={priorityFilter}
                onChange={setPriorityFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Group justify="flex-end">
                <Button.Group>
                  <Button
                    variant={viewMode === 'conversations' ? 'filled' : 'light'}
                    onClick={() => setViewMode('conversations')}
                  >
                    Conversations
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'filled' : 'light'}
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'filled' : 'light'}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                </Button.Group>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Conditional Rendering based on view mode */}
        {viewMode === 'conversations' ? (
          // Original conversation interface with summary cards
          <>
            {/* Summary Cards */}
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      Unread Messages
                    </Text>
                    <ActionIcon variant="light" color="blue" size="lg">
                      <MessageCircle size={20} />
                    </ActionIcon>
                  </Group>
                  <Text fw={700} size="xl" c="blue">
                    {unreadMessages}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      Total Messages
                    </Text>
                    <ActionIcon variant="light" color="green" size="lg">
                      <MessageCircle size={20} />
                    </ActionIcon>
                  </Group>
                  <Text fw={700} size="xl" c="green">
                    {totalConversations}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      Urgent Messages
                    </Text>
                    <ActionIcon variant="light" color="red" size="lg">
                      <MessageCircle size={20} />
                    </ActionIcon>
                  </Group>
                  <Text fw={700} size="xl" c="red">
                    {urgentMessages}
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      Response Rate
                    </Text>
                    <ActionIcon variant="light" color="indigo" size="lg">
                      <CheckCircle2 size={20} />
                    </ActionIcon>
                  </Group>
                  <Text fw={700} size="xl" c="indigo">
                    95%
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Main Messages Interface */}
            <Card shadow="sm" padding={0} radius="md" withBorder style={{ height: '600px' }}>
              <Center style={{ height: '100%' }}>
                <Stack align="center" gap="md">
                  <MessageCircle size={48} color="gray" />
                  <Text size="lg" c="dimmed">
                    FHIR Communication interface will be displayed here
                  </Text>
                  <Text size="sm" c="dimmed">
                    {filteredCommunications.length} communications available
                  </Text>
                </Stack>
              </Center>
            </Card>
          </>
        ) : viewMode === 'cards' ? (
          // Card View
          <Grid>
            {filteredCommunications.map((communication) => (
              communication && (
                <Grid.Col key={communication.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <FHIRCommunicationCard
                    communication={communication}
                    onView={handleViewCommunication}
                    onReply={handleReplyCommunication}
                  />
                </Grid.Col>
              )
            ))}
          </Grid>
        ) : (
          // Table View
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sender</Table.Th>
                  <Table.Th>Subject</Table.Th>
                  <Table.Th>Content</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCommunications.map((communication) => (
                  communication && (
                    <FHIRCommunicationTableRow
                      key={communication.id}
                      communication={communication}
                      onView={handleViewCommunication}
                      onReply={handleReplyCommunication}
                    />
                  )
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Compose Message Modal */}
        <ComposeFHIRCommunicationModal
          opened={composeOpened}
          onClose={handleComposeClose}
          onMessageSent={handleMessageSent}
          replyTo={selectedCommunication}
        />

        {/* View Message Modal */}
        <ViewFHIRCommunicationModal
          opened={viewDetailsOpened}
          onClose={handleViewClose}
          communication={selectedCommunication}
          onReply={handleReplyCommunication}
        />
      </Stack>
    </Container>
  );
};

export default MessagesMedplumPage;