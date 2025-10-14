/**
 * Messages Page Component
 * Manages secure messaging between healthcare providers and patients
 */

import React, { useState } from 'react';
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
  Tabs,
  Avatar,
  Textarea,
  ScrollArea,
  Divider,
  Center,
  Loader,
  UnstyledButton,
  Indicator,
  Table,
} from '@mantine/core';
import {
  Search,
  Plus,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Filter,
  MessageCircle,
  Clock,
  CheckCircle2,
  Eye,
  Edit,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { Message } from '../types';

/**
 * Mock data for messages and conversations
 */
const mockMessages: Message[] = [
  {
    id: 'MSG-001',
    conversationId: 'CONV-001',
    senderId: 'DR-001',
    senderName: 'Dr. Smith',
    senderRole: 'healthcare_provider',
    recipientId: 'PAT-001',
    recipientName: 'Sarah Johnson',
    recipientRole: 'patient',
    subject: 'Lab Results Review',
    content: 'Hi Sarah, your recent blood work results are in. Overall, everything looks good. Your cholesterol levels have improved since your last visit. Please schedule a follow-up appointment in 3 months.',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'delivered',
    priority: 'normal',
    isRead: false,
    attachments: [],
    messageType: 'clinical',
  },
  {
    id: 'MSG-002',
    conversationId: 'CONV-001',
    senderId: 'PAT-001',
    senderName: 'Sarah Johnson',
    senderRole: 'patient',
    recipientId: 'DR-001',
    recipientName: 'Dr. Smith',
    recipientRole: 'healthcare_provider',
    subject: 'Re: Lab Results Review',
    content: 'Thank you for the update, Dr. Smith. I\'m glad to hear the results are good. Should I continue with my current medication regimen?',
    timestamp: '2024-01-15T14:20:00Z',
    status: 'delivered',
    priority: 'normal',
    isRead: true,
    attachments: [],
    messageType: 'clinical',
  },
  {
    id: 'MSG-003',
    conversationId: 'CONV-002',
    senderId: 'STAFF-001',
    senderName: 'Jane Doe',
    senderRole: 'receptionist',
    recipientId: 'PAT-002',
    recipientName: 'Michael Chen',
    recipientRole: 'patient',
    subject: 'Appointment Reminder',
    content: 'This is a reminder that you have an appointment scheduled for tomorrow, January 16th at 2:00 PM with Dr. Johnson. Please arrive 15 minutes early for check-in.',
    timestamp: '2024-01-15T16:00:00Z',
    status: 'delivered',
    priority: 'normal',
    isRead: false,
    attachments: [],
    messageType: 'administrative',
  },
  {
    id: 'MSG-004',
    conversationId: 'CONV-003',
    senderId: 'DR-002',
    senderName: 'Dr. Johnson',
    senderRole: 'healthcare_provider',
    recipientId: 'PAT-003',
    recipientName: 'Emma Davis',
    recipientRole: 'patient',
    subject: 'Prescription Refill Approved',
    content: 'Your prescription refill request has been approved. You can pick up your medication at the pharmacy. The prescription is valid for 30 days.',
    timestamp: '2024-01-15T11:45:00Z',
    status: 'delivered',
    priority: 'high',
    isRead: true,
    attachments: [
      {
        id: 'ATT-001',
        name: 'prescription.pdf',
        size: 245760,
        type: 'application/pdf',
      },
    ],
    messageType: 'clinical',
  },
];

const mockConversations = [
  {
    id: 'CONV-001',
    participants: ['Dr. Smith', 'Sarah Johnson'],
    lastMessage: 'Thank you for the update, Dr. Smith...',
    lastMessageTime: '2024-01-15T14:20:00Z',
    unreadCount: 1,
    subject: 'Lab Results Review',
    messageType: 'clinical',
  },
  {
    id: 'CONV-002',
    participants: ['Jane Doe', 'Michael Chen'],
    lastMessage: 'This is a reminder that you have an appointment...',
    lastMessageTime: '2024-01-15T16:00:00Z',
    unreadCount: 1,
    subject: 'Appointment Reminder',
    messageType: 'administrative',
  },
  {
    id: 'CONV-003',
    participants: ['Dr. Johnson', 'Emma Davis'],
    lastMessage: 'Your prescription refill request has been approved...',
    lastMessageTime: '2024-01-15T11:45:00Z',
    unreadCount: 0,
    subject: 'Prescription Refill Approved',
    messageType: 'clinical',
  },
];

/**
 * Message Card Component for card view
 */
interface MessageCardProps {
  message: Message;
  onView: (message: Message) => void;
  onReply: (message: Message) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onView, onReply }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'sent': return 'blue';
      case 'read': return 'teal';
      default: return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="md" radius="xl" color="blue">
              {message.senderName.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="sm">
                {message.senderName}
              </Text>
              <Text size="xs" c="dimmed">
                {message.senderRole.replace('_', ' ')}
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <Badge color={getPriorityColor(message.priority)} size="sm">
              {message.priority}
            </Badge>
            <Badge color={getStatusColor(message.status)} size="sm">
              {message.status}
            </Badge>
            {!message.isRead && (
              <Indicator color="blue" size={8} />
            )}
          </Group>
        </Group>

        <Stack gap="xs">
          <Text fw={500} size="sm" lineClamp={1}>
            {message.subject}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {message.content}
          </Text>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            <MessageCircle size={14} />
            <Text size="xs" c="dimmed">
              {message.messageType}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {formatDate(message.timestamp)}
          </Text>
        </Group>

        <Group justify="flex-end" gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(message)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="green"
            size="sm"
            onClick={() => onReply(message)}
          >
            <Reply size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Message Table Row Component for table view
 */
interface MessageTableRowProps {
  message: Message;
  onView: (message: Message) => void;
  onReply: (message: Message) => void;
}

const MessageTableRow: React.FC<MessageTableRowProps> = ({ message, onView, onReply }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'sent': return 'blue';
      case 'read': return 'teal';
      default: return 'gray';
    }
  };

  return (
    <Table.Tr style={{ backgroundColor: !message.isRead ? 'var(--mantine-color-blue-0)' : undefined }}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" radius="xl" color="blue">
            {message.senderName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Stack gap={2}>
            <Text fw={500} size="sm">
              {message.senderName}
            </Text>
            <Text size="xs" c="dimmed">
              {message.senderRole.replace('_', ' ')}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={500} size="sm" lineClamp={1}>
          {message.subject}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {message.content}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getPriorityColor(message.priority)} size="sm">
          {message.priority}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(message.status)} size="sm">
          {message.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatDate(message.timestamp)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(message)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="green"
            size="sm"
            onClick={() => onReply(message)}
          >
            <Reply size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Main Messages Page Component
 */
const MessagesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [viewDetailsOpened, { open: openViewDetails, close: closeViewDetails }] = useDisclosure(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // New state for card/table view
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'conversations'>('conversations');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Using mock data for now
  const conversations = mockConversations;
  const messages = mockMessages;
  const isLoading = false;

  const currentUser = 'DR-001'; // Mock current user

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationMessages = messages.filter(msg => 
    msg.conversationId === selectedConversation
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // TODO: Implement message sending
    console.log('Send message:', newMessage);
    setNewMessage('');
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    openViewDetails();
  };

  const handleReplyMessage = (message: Message) => {
    setSelectedMessage(message);
    openCompose();
  };

  // Filter messages based on search and filters
  const filteredMessages = mockMessages.filter((message) => {
    const matchesSearch = 
      message.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || message.status === statusFilter;
    const matchesPriority = !priorityFilter || message.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate summary statistics
  const unreadMessages = messages.filter(msg => !msg.isRead && msg.recipientId === currentUser).length;
  const totalConversations = conversations.length;
  const urgentMessages = messages.filter(msg => msg.priority === 'urgent' && !msg.isRead).length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Messages</Title>
            <Text c="dimmed">Secure messaging and communication</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCompose}>
            Compose Message
          </Button>
        </Group>

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
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'read', label: 'Read' },
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
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
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
          // Original conversation interface
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
                      Total Conversations
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
                    Conversation interface will be displayed here
                  </Text>
                </Stack>
              </Center>
            </Card>
          </>
        ) : viewMode === 'cards' ? (
          // Card View
          <Grid>
            {filteredMessages.map((message) => (
              <Grid.Col key={message.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <MessageCard
                  message={message}
                  onView={handleViewMessage}
                  onReply={handleReplyMessage}
                />
              </Grid.Col>
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
                {filteredMessages.map((message) => (
                  <MessageTableRow
                    key={message.id}
                    message={message}
                    onView={handleViewMessage}
                    onReply={handleReplyMessage}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Stack>
    </Container>
  );
};

export default MessagesPage;