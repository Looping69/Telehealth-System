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
  ThemeIcon,
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
  Mail,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { Message } from '../../types';

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
    type: 'text',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'delivered',
    priority: 'medium',
    isRead: false,
    attachments: [],
    messageType: 'clinical',
    createdAt: new Date('2024-01-15T10:30:00Z'),
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
    type: 'text',
    timestamp: '2024-01-15T14:20:00Z',
    status: 'delivered',
    priority: 'medium',
    isRead: true,
    attachments: [],
    messageType: 'clinical',
    createdAt: new Date('2024-01-15T14:20:00Z'),
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
    type: 'text',
    timestamp: '2024-01-15T16:00:00Z',
    status: 'delivered',
    priority: 'medium',
    isRead: false,
    attachments: [],
    messageType: 'administrative',
    createdAt: new Date('2024-01-15T16:00:00Z'),
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
    type: 'text',
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
    createdAt: new Date('2024-01-15T11:45:00Z'),
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
              {message.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="sm">
                {message.senderName}
              </Text>
              <Text size="xs" c="dimmed">
                {message.senderRole?.replace('_', ' ') || 'Unknown'}
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <Badge color={getPriorityColor(message.priority || 'medium')} size="sm">
              {message.priority || 'medium'}
            </Badge>
            <Badge color={getStatusColor(message.status || 'delivered')} size="sm">
              {message.status || 'delivered'}
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
            {formatDate(message.timestamp || '')}
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
            {message.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
          </Avatar>
          <Stack gap={2}>
            <Text fw={500} size="sm">
              {message.senderName || 'Unknown'}
            </Text>
            <Text size="xs" c="dimmed">
              {message.senderRole?.replace('_', ' ') || 'Unknown'}
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
        <Badge color={getPriorityColor(message.priority || 'medium')} size="sm">
          {message.priority || 'medium'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(message.status || 'delivered')} size="sm">
          {message.status || 'delivered'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatDate(message.timestamp || '')}
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
 * Compose Message Modal Component
 * Handles creating new messages and replies
 */
interface ComposeMessageModalProps {
  opened: boolean;
  onClose: () => void;
  onMessageSent: (message: Message) => void;
  replyTo?: Message | null;
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ 
  opened, 
  onClose, 
  onMessageSent, 
  replyTo 
}) => {
  const [formData, setFormData] = useState({
    recipientId: replyTo?.senderId || '',
    recipientName: replyTo?.senderName || '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    messageType: 'clinical' as 'clinical' | 'administrative' | 'general',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  // Mock recipient options
  const recipientOptions = [
    { value: 'PAT-001', label: 'Sarah Johnson (Patient)' },
    { value: 'PAT-002', label: 'Michael Chen (Patient)' },
    { value: 'PAT-003', label: 'Emma Davis (Patient)' },
    { value: 'DR-002', label: 'Dr. Johnson (Provider)' },
    { value: 'STAFF-001', label: 'Jane Doe (Staff)' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipientId) {
      newErrors.recipientId = 'Recipient is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Message content is required';
    }
    if (formData.content.length > 2000) {
      newErrors.content = 'Message content must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedRecipient = recipientOptions.find(r => r.value === formData.recipientId);
    
    const newMessage: Message = {
      id: `MSG-${Date.now()}`,
      conversationId: replyTo?.conversationId || `CONV-${Date.now()}`,
      senderId: 'DR-001', // Current user
      senderName: 'Dr. Smith', // Current user name
      senderRole: 'healthcare_provider',
      recipientId: formData.recipientId,
      recipientName: selectedRecipient?.label.split(' (')[0] || formData.recipientName,
      recipientRole: selectedRecipient?.label.includes('Patient') ? 'patient' : 
                    selectedRecipient?.label.includes('Provider') ? 'healthcare_provider' : 'staff',
      subject: formData.subject,
      content: formData.content,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      priority: formData.priority,
      isRead: false,
      attachments: attachments.map((file, index) => ({
        id: `ATT-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      messageType: formData.messageType === 'general' ? 'clinical' : formData.messageType,
      createdAt: new Date(),
    };

    onMessageSent(newMessage);
    
    // Reset form
    setFormData({
      recipientId: '',
      recipientName: '',
      subject: '',
      content: '',
      priority: 'medium',
      messageType: 'clinical',
    });
    setAttachments([]);
    setErrors({});
    onClose();

    // Show success notification (you can implement this with a notification system)
    console.log('Message sent successfully!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file: File) => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      console.warn('Some files were too large and were not added');
    }
    
    setAttachments((prev: File[]) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={replyTo ? `Reply to: ${replyTo.subject}` : "Compose Message"}
      size="lg"
    >
      <Stack gap="md">
        {replyTo && (
          <Card withBorder p="sm" bg="gray.0">
            <Text size="sm" c="dimmed" mb="xs">Replying to:</Text>
            <Text size="sm" fw={500}>{replyTo.senderName}</Text>
            <Text size="xs" c="dimmed" truncate>{replyTo.content}</Text>
          </Card>
        )}

        <Select
          label="Recipient"
          placeholder="Select recipient"
          data={recipientOptions}
          value={formData.recipientId}
          onChange={(value) => setFormData(prev => ({ ...prev, recipientId: value || '' }))}
          error={errors.recipientId}
          required
          disabled={!!replyTo}
        />

        <TextInput
          label="Subject"
          placeholder="Enter message subject"
          value={formData.subject}
          onChange={(event) => setFormData(prev => ({ ...prev, subject: event.currentTarget.value }))}
          error={errors.subject}
          required
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Priority"
              data={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={formData.priority}
              onChange={(value) => setFormData(prev => ({ ...prev, priority: value as any || 'medium' }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Message Type"
              data={[
                { value: 'clinical', label: 'Clinical' },
                { value: 'administrative', label: 'Administrative' },
                { value: 'general', label: 'General' },
              ]}
              value={formData.messageType}
              onChange={(value) => setFormData(prev => ({ ...prev, messageType: value as any || 'clinical' }))}
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label="Message"
          placeholder="Enter your message"
          value={formData.content}
          onChange={(event) => setFormData(prev => ({ ...prev, content: event.currentTarget.value }))}
          error={errors.content}
          minRows={4}
          maxRows={8}
          required
        />

        <div>
          <Text size="sm" fw={500} mb="xs">Attachments</Text>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />
          <Button
            variant="light"
            leftSection={<Paperclip size={16} />}
            onClick={() => document.getElementById('file-upload')?.click()}
            size="sm"
          >
            Add Attachments
          </Button>
          
          {attachments.length > 0 && (
            <Stack gap="xs" mt="sm">
              {attachments.map((file, index) => (
                <Group key={index} justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                  <div>
                    <Text size="sm" fw={500}>{file.name}</Text>
                    <Text size="xs" c="dimmed">{formatFileSize(file.size)}</Text>
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => removeAttachment(index)}
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          )}
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button leftSection={<Send size={16} />} onClick={handleSubmit}>
            Send Message
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * View Message Modal Component
 * Displays full message details
 */
interface ViewMessageModalProps {
  opened: boolean;
  onClose: () => void;
  message: Message | null;
  onReply: (message: Message) => void;
}

const ViewMessageModal: React.FC<ViewMessageModalProps> = ({ 
  opened, 
  onClose, 
  message, 
  onReply 
}) => {
  if (!message) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'sent': return 'blue';
      case 'read': return 'gray';
      default: return 'gray';
    }
  };

  const handleReply = () => {
    onReply(message);
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
        {/* Message Header */}
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={600} size="lg">{message.subject}</Text>
              <Group gap="xs" mt="xs">
                <Badge color={getPriorityColor(message.priority || 'medium')} size="sm">
                  {(message.priority || 'medium').toUpperCase()}
                </Badge>
                <Badge color={getStatusColor(message.status || 'delivered')} size="sm">
                  {(message.status || 'delivered').toUpperCase()}
                </Badge>
                <Badge variant="light" size="sm">
                  {(message.messageType || 'clinical').toUpperCase()}
                </Badge>
              </Group>
            </div>
            <Group>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={handleReply}
                size="lg"
              >
                <Reply size={18} />
              </ActionIcon>
            </Group>
          </Group>

          <Divider mb="md" />

          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed" mb="xs">From:</Text>
              <Group gap="sm">
                <Avatar size="sm" name={message.senderName} color="blue" />
                <div>
                  <Text size="sm" fw={500}>{message.senderName}</Text>
                  <Text size="xs" c="dimmed">{message.senderRole?.replace('_', ' ') || 'Unknown'}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed" mb="xs">To:</Text>
              <Group gap="sm">
                <Avatar size="sm" name={message.recipientName} color="green" />
                <div>
                  <Text size="sm" fw={500}>{message.recipientName}</Text>
                  <Text size="xs" c="dimmed">{message.recipientRole?.replace('_', ' ') || 'Unknown'}</Text>
                </div>
              </Group>
            </Grid.Col>
          </Grid>

          <Text size="sm" c="dimmed" mt="md">
            Sent: {formatDate(message.timestamp || '')}
          </Text>
        </Card>

        {/* Message Content */}
        <Card withBorder p="md">
          <Text size="sm" c="dimmed" mb="sm">Message:</Text>
          <ScrollArea.Autosize mah={300}>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Text>
          </ScrollArea.Autosize>
        </Card>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <Card withBorder p="md">
            <Text size="sm" c="dimmed" mb="sm">Attachments:</Text>
            <Stack gap="xs">
              {message.attachments.map((attachment) => (
                <Group key={attachment.id} justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                  <Group gap="sm">
                    <Paperclip size={16} />
                    <div>
                      <Text size="sm" fw={500}>{attachment.name}</Text>
                      <Text size="xs" c="dimmed">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </Text>
                    </div>
                  </Group>
                  <Button variant="light" size="xs">
                    Download
                  </Button>
                </Group>
              ))}
            </Stack>
          </Card>
        )}

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
 * MessagesPage
 * Renders secure messaging UI. Reorders layout so summary cards are on top and filters beneath.
 *
 * Inputs: None (uses local mock data and component state)
 * Outputs: Messaging UI with conversations/cards/table views and modals
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

  // Convert mock data to stateful data for real-time updates
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [conversations, setConversations] = useState(mockConversations);
  const isLoading = false;

  const currentUser = 'DR-001'; // Mock current user

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationMessages = messages.filter(msg => 
    msg.conversationId === selectedConversation
  ).sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime());

  /**
   * Handle sending a new message
   * @param message - The message to send
   */
  const handleMessageSent = (message: Message) => {
    // Add the new message to the messages state
    setMessages(prev => [...prev, message]);
    
    // Update or create conversation
    const existingConvIndex = conversations.findIndex(conv => conv.id === message.conversationId);
    
    if (existingConvIndex >= 0) {
      // Update existing conversation
      const updatedConversations = [...conversations];
      updatedConversations[existingConvIndex] = {
        ...updatedConversations[existingConvIndex],
        lastMessage: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        lastMessageTime: message.timestamp || new Date().toISOString(),
        unreadCount: updatedConversations[existingConvIndex].unreadCount + 1,
      };
      setConversations(updatedConversations);
    } else {
      // Create new conversation
      const newConversation = {
        id: message.conversationId || `conv-${Date.now()}`,
        participants: [message.senderName || 'Unknown', message.recipientName || 'Unknown'],
        lastMessage: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        lastMessageTime: message.timestamp || new Date().toISOString(),
        unreadCount: 1,
        subject: message.subject || 'No Subject',
        messageType: message.messageType || 'clinical',
      };
      setConversations(prev => [newConversation, ...prev]);
    }
    
    console.log('Message sent successfully!');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // This is for the conversation view - create a simple message
    const message: Message = {
      id: `MSG-${Date.now()}`,
      conversationId: selectedConversation || `CONV-${Date.now()}`,
      senderId: currentUser,
      senderName: 'Dr. Smith',
      senderRole: 'healthcare_provider',
      recipientId: 'PAT-001', // This would be determined by the conversation
      recipientName: 'Patient', // This would be determined by the conversation
      recipientRole: 'patient',
      subject: 'Quick Message',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      priority: 'medium',
      isRead: false,
      attachments: [],
      messageType: 'clinical',
      createdAt: new Date(),
    };
    
    handleMessageSent(message);
    setNewMessage('');
  };

  const handleViewMessage = (message: Message) => {
    // Mark message as read when viewed
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, isRead: true } : msg
    ));
    
    setSelectedMessage(message);
    openViewDetails();
  };

  const handleReplyMessage = (message: Message) => {
    setSelectedMessage(message);
    openCompose();
  };

  const handleComposeClose = () => {
    setSelectedMessage(null);
    closeCompose();
  };

  const handleViewClose = () => {
    setSelectedMessage(null);
    closeViewDetails();
  };

  // Filter messages based on search and filters
  const filteredMessages = messages.filter((message) => {
    const matchesSearch = 
      message.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || message.status === statusFilter;
    const matchesPriority = !priorityFilter || message.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate summary statistics
  const unreadMessages = messages.filter(msg => !msg.isRead && msg.recipientId === currentUser).length;
  const totalConversations = conversations.length;
  const urgentMessages = messages.filter(msg => msg.priority === 'urgent' && !msg.isRead).length;

  /**
   * handleClearFilters
   * Resets search, status, and priority filters.
   *
   * Inputs: None
   * Outputs: None (updates filter-related state)
   */
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setPriorityFilter(null);
  };

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

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Unread Messages
                </Text>
                <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                  <Mail size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {unreadMessages}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Requires attention
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Conversations
                </Text>
                <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                  <MessageCircle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {totalConversations}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Active discussions
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Urgent Messages
                </Text>
                <ThemeIcon variant="light" color="red" size="lg" radius="md">
                  <AlertTriangle size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="red">
                {urgentMessages}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                High priority
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Response Rate
                </Text>
                <ThemeIcon variant="light" color="green" size="lg" radius="md">
                  <TrendingUp size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c="green">
                94%
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                This month
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

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
              <Group justify="flex-end" gap="sm" wrap="wrap">
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
                <Button variant="light" onClick={handleClearFilters}>Clear Filters</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Conditional Rendering based on view mode */}
        {viewMode === 'conversations' ? (
          // Conversation interface (summary cards are already above)
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

        {/* Compose Message Modal */}
        <ComposeMessageModal
          opened={composeOpened}
          onClose={handleComposeClose}
          onMessageSent={handleMessageSent}
          replyTo={selectedMessage}
        />

        {/* View Message Modal */}
        <ViewMessageModal
          opened={viewDetailsOpened}
          onClose={handleViewClose}
          message={selectedMessage}
          onReply={handleReplyMessage}
        />
      </Stack>
    </Container>
  );
};

export default MessagesPage;