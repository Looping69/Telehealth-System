/**
 * Resources-Medplum Page Component
 * Manages healthcare resources using FHIR DocumentReference data
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
  Switch,
  Image,
  Divider,
  Tooltip,
  Tabs,
  FileInput,
  Anchor,
  Progress,
  Table,
  Checkbox,
  Menu,
  NumberInput,
  MultiSelect,
  Notification,
  Paper,
  SimpleGrid,
  ThemeIcon,
  SegmentedControl,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  Calendar,
  User,
  Filter,
  Database,
  AlertCircle,
  Activity,
  Download,
  Star,
  BookOpen,
  Video,
  Image as ImageIcon,
  File,
  Clock,
  TrendingUp,
  Users,
  Heart,
  Copy,
  Share,
  MoreVertical,
  Upload,
  X,
  Check,
  AlertTriangle,
  Trash2,
  BarChart3,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { DocumentReference } from '@medplum/fhirtypes';

/**
 * FHIR Document Card Component
 */
interface FHIRDocumentCardProps {
  document: DocumentReference;
  onView: (document: DocumentReference) => void;
  onEdit: (document: DocumentReference) => void;
  onDownload: (document: DocumentReference) => void;
  onDelete: (document: DocumentReference) => void;
  onDuplicate: (document: DocumentReference) => void;
  isSelected: boolean;
  onSelect: (documentId: string) => void;
}

const FHIRDocumentCard: React.FC<FHIRDocumentCardProps> = ({ 
  document, 
  onView, 
  onEdit, 
  onDownload, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  onSelect 
}) => {
  const getTypeIcon = (type?: string) => {
    const typeText = type?.toLowerCase() || '';
    if (typeText.includes('video')) return <Video size={16} />;
    if (typeText.includes('image')) return <ImageIcon size={16} />;
    if (typeText.includes('form')) return <File size={16} />;
    if (typeText.includes('guide')) return <BookOpen size={16} />;
    return <FileText size={16} />;
  };

  const getCategoryColor = (type?: string) => {
    const typeText = type?.toLowerCase() || '';
    if (typeText.includes('patient')) return 'blue';
    if (typeText.includes('provider') || typeText.includes('training')) return 'green';
    if (typeText.includes('policy') || typeText.includes('compliance')) return 'red';
    if (typeText.includes('form')) return 'orange';
    if (typeText.includes('marketing')) return 'purple';
    return 'gray';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'current':
        return 'green';
      case 'superseded':
        return 'yellow';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getDocumentTitle = () => {
    return document.description || document.type?.text || 'Untitled Document';
  };

  const getPatientName = () => {
    return document.subject?.display || 'Unknown Patient';
  };

  const getAuthor = () => {
    return document.author?.[0]?.display || 'Unknown Author';
  };

  const getCreatedDate = () => {
    return document.date ? new Date(document.date).toLocaleDateString() : 'Unknown date';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileSize = () => {
    const attachment = document.content?.[0]?.attachment;
    return attachment?.size ? formatFileSize(attachment.size) : 'Unknown size';
  };

  return (
    <Paper 
      withBorder 
      p="lg" 
      radius="lg" 
      shadow={isSelected ? "md" : "sm"}
      style={{ 
        border: isSelected ? '2px solid #228be6' : '1px solid #e9ecef',
        backgroundColor: isSelected ? '#f8f9ff' : '#ffffff',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <Stack gap="md">
        {/* Header with selection and actions */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Checkbox
              checked={isSelected}
              onChange={() => onSelect(document.id!)}
              size="md"
            />
            <ThemeIcon 
              variant="light" 
              color={getCategoryColor(document.type?.text)} 
              size="lg"
              radius="md"
            >
              {getTypeIcon(document.type?.text)}
            </ThemeIcon>
            <Stack gap={4}>
              <Badge 
                variant="light" 
                color="green" 
                size="sm"
                radius="md"
                leftSection={<Database size={12} />}
              >
                FHIR Document
              </Badge>
              {document.status === 'current' && (
                <Badge 
                  variant="filled" 
                  color="yellow" 
                  size="xs" 
                  leftSection={<Star size={10} />}
                  radius="md"
                >
                  Featured
                </Badge>
              )}
            </Stack>
          </Group>
          
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg">
                <MoreVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Eye size={14} />} onClick={() => onView(document)}>
                View Details
              </Menu.Item>
              <Menu.Item leftSection={<Edit size={14} />} onClick={() => onEdit(document)}>
                Edit
              </Menu.Item>
              <Menu.Item leftSection={<Download size={14} />} onClick={() => onDownload(document)}>
                Download
              </Menu.Item>
              <Menu.Item leftSection={<Copy size={14} />} onClick={() => onDuplicate(document)}>
                Duplicate
              </Menu.Item>
              <Menu.Item leftSection={<Share size={14} />}>
                Share
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<Trash2 size={14} />} 
                color="red"
                onClick={() => onDelete(document)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Document title and description */}
        <Stack gap="xs">
          <Title order={4} size="h5" fw={600} lineClamp={2} c="dark">
            {getDocumentTitle()}
          </Title>
          
          <Text size="sm" c="dimmed" lineClamp={2}>
            {document.type?.text || 'Document'} • Created by {getAuthor()}
          </Text>
        </Stack>

        {/* Document metadata */}
        <Stack gap="sm">
          <Group gap="lg" wrap="nowrap">
            <Group gap="xs" style={{ flex: 1 }}>
              <ThemeIcon variant="light" size="sm" color="blue">
                <User size={12} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" truncate fw={500}>
                {getPatientName()}
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon variant="light" size="sm" color="gray">
                <Calendar size={12} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" fw={500}>
                {getCreatedDate()}
              </Text>
            </Group>
          </Group>

          {/* Status and file info */}
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Badge 
                variant="dot" 
                size="md" 
                color={getStatusColor(document.status)}
                radius="md"
              >
                {(document.status || 'Unknown').charAt(0).toUpperCase() + (document.status || 'Unknown').slice(1)}
              </Badge>
              <Text size="sm" c="dimmed" fw={500}>
                {getFileSize()}
              </Text>
            </Group>
            
            {/* Quick action buttons */}
            <Group gap="xs">
              <Tooltip label="View Document" position="top">
                <ActionIcon 
                  variant="light" 
                  size="md" 
                  color="blue"
                  onClick={() => onView(document)}
                  radius="md"
                >
                  <Eye size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Edit Document" position="top">
                <ActionIcon 
                  variant="light" 
                  size="md" 
                  color="green"
                  onClick={() => onEdit(document)}
                  radius="md"
                >
                  <Edit size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Download File" position="top">
                <ActionIcon 
                  variant="light" 
                  size="md" 
                  color="indigo"
                  onClick={() => onDownload(document)}
                  radius="md"
                >
                  <Download size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
};

/**
 * FHIR Document Table Row Component
 */
interface FHIRDocumentTableRowProps {
  document: DocumentReference;
  onView: (document: DocumentReference) => void;
  onEdit: (document: DocumentReference) => void;
  onDownload: (document: DocumentReference) => void;
  onDelete: (document: DocumentReference) => void;
  onDuplicate: (document: DocumentReference) => void;
  isSelected: boolean;
  onSelect: (documentId: string) => void;
}

const FHIRDocumentTableRow: React.FC<FHIRDocumentTableRowProps> = ({ 
  document, 
  onView, 
  onEdit, 
  onDownload, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  onSelect 
}) => {
  const getTypeIcon = (type?: string) => {
    const typeText = type?.toLowerCase() || '';
    if (typeText.includes('video')) return <Video size={14} />;
    if (typeText.includes('image')) return <ImageIcon size={14} />;
    if (typeText.includes('form')) return <File size={14} />;
    if (typeText.includes('guide')) return <BookOpen size={14} />;
    return <FileText size={14} />;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'current':
        return 'green';
      case 'superseded':
        return 'yellow';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getDocumentTitle = () => {
    return document.description || document.type?.text || 'Untitled Document';
  };

  const getAuthor = () => {
    return document.author?.[0]?.display || 'Unknown Author';
  };

  const getCreatedDate = () => {
    return document.date ? new Date(document.date).toLocaleDateString() : 'Unknown date';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileSize = () => {
    const attachment = document.content?.[0]?.attachment;
    return attachment?.size ? formatFileSize(attachment.size) : 'Unknown size';
  };

  return (
    <Table.Tr 
      style={{ 
        backgroundColor: isSelected ? '#f8f9fa' : undefined,
        cursor: 'pointer'
      }}
      onClick={() => onView(document)}
    >
      <Table.Td onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(document.id!)}
        />
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          {getTypeIcon(document.type?.text)}
          <Stack gap={2}>
            <Text size="sm" fw={500} lineClamp={1}>
              {getDocumentTitle()}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {document.id}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{document.type?.text || 'Document'}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(document.status)} variant="light" size="sm">
          {document.status || 'Unknown'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getAuthor()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getCreatedDate()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getFileSize()}</Text>
      </Table.Td>
      <Table.Td onClick={(e) => e.stopPropagation()}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Eye size={14} />} onClick={() => onView(document)}>
              View Details
            </Menu.Item>
            <Menu.Item leftSection={<Edit size={14} />} onClick={() => onEdit(document)}>
              Edit
            </Menu.Item>
            <Menu.Item leftSection={<Download size={14} />} onClick={() => onDownload(document)}>
              Download
            </Menu.Item>
            <Menu.Item leftSection={<Copy size={14} />} onClick={() => onDuplicate(document)}>
              Duplicate
            </Menu.Item>
            <Menu.Item leftSection={<Share size={14} />}>
              Share
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              leftSection={<Trash2 size={14} />} 
              color="red"
              onClick={() => onDelete(document)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Document Details Modal Component
 */
interface DocumentDetailsModalProps {
  document: DocumentReference | null;
  opened: boolean;
  onClose: () => void;
}

const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({ document, opened, onClose }) => {
  if (!document) return null;

  const getDocumentTitle = () => {
    return document.description || document.type?.text || 'Untitled Document';
  };

  const getAuthor = () => {
    return document.author?.[0]?.display || 'Unknown Author';
  };

  const getPatientName = () => {
    return document.subject?.display || 'Unknown Patient';
  };

  const getCreatedDate = () => {
    return document.date ? new Date(document.date).toLocaleString() : 'Unknown date';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`FHIR Document Details`}
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Live FHIR Data - Document ID: {document.id}
        </Alert>
        
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<Eye size={14} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<FileText size={14} />}>
              Content
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<Database size={14} />}>
              Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Title</Text>
                    <Text size="sm" c="dimmed">
                      {getDocumentTitle()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={document.status === 'current' ? 'green' : 'yellow'}>
                      {document.status || 'Unknown'}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Type</Text>
                    <Text size="sm" c="dimmed">
                      {document.type?.text || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Date</Text>
                    <Text size="sm" c="dimmed">
                      {getCreatedDate()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Patient</Text>
                    <Text size="sm" c="dimmed">
                      {getPatientName()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Author</Text>
                    <Text size="sm" c="dimmed">
                      {getAuthor()}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <Stack gap="md">
              <Text size="sm" fw={500}>Content Attachments</Text>
              {document.content?.length ? (
                document.content.map((content, index) => (
                  <Card key={index} withBorder padding="md">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>
                          {content.attachment?.title || `Attachment ${index + 1}`}
                        </Text>
                        <Badge variant="light">
                          {content.attachment?.contentType || 'Unknown type'}
                        </Badge>
                      </Group>
                      {content.attachment?.size && (
                        <Text size="sm" c="dimmed">
                          Size: {formatFileSize(content.attachment.size)}
                        </Text>
                      )}
                      {content.attachment?.url && (
                        <Anchor href={content.attachment.url} target="_blank" size="sm">
                          View Attachment
                        </Anchor>
                      )}
                    </Stack>
                  </Card>
                ))
              ) : (
                <Text size="sm" c="dimmed">No content attachments available</Text>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="metadata" pt="md">
            <Stack gap="md">
              <Text size="sm" fw={500}>FHIR Metadata</Text>
              <Card withBorder padding="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Resource Type</Text>
                    <Badge variant="light">DocumentReference</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Resource ID</Text>
                    <Text size="sm" c="dimmed">{document.id}</Text>
                  </Group>
                  {document.meta?.lastUpdated && (
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Last Updated</Text>
                      <Text size="sm" c="dimmed">
                        {new Date(document.meta.lastUpdated).toLocaleString()}
                      </Text>
                    </Group>
                  )}
                  {document.meta?.versionId && (
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Version</Text>
                      <Text size="sm" c="dimmed">{document.meta.versionId}</Text>
                    </Group>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Modal>
  );
};

/**
 * Document Form Modal Component
 */
interface DocumentFormModalProps {
  document: DocumentReference | null;
  opened: boolean;
  onClose: () => void;
  onSave: (document: Partial<DocumentReference>) => void;
}

const DocumentFormModal: React.FC<DocumentFormModalProps> = ({ document, opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    type: '',
    status: 'current',
    contentType: '',
    title: '',
  });

  useEffect(() => {
    if (document) {
      setFormData({
        description: document.description || '',
        type: document.type?.text || '',
        status: document.status || 'current',
        contentType: document.content?.[0]?.attachment?.contentType || '',
        title: document.content?.[0]?.attachment?.title || '',
      });
    } else {
      setFormData({
        description: '',
        type: '',
        status: 'current',
        contentType: '',
        title: '',
      });
    }
  }, [document]);

  const handleSubmit = () => {
    const documentData: Partial<DocumentReference> = {
      description: formData.description,
      type: {
        text: formData.type,
      },
      status: formData.status as any,
      content: [{
        attachment: {
          contentType: formData.contentType,
          title: formData.title,
        }
      }],
      date: new Date().toISOString(),
    };

    onSave(documentData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={document ? 'Edit FHIR Document' : 'Create New FHIR Document'}
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="blue" variant="light">
          {document ? 'Editing existing FHIR DocumentReference' : 'Creating new FHIR DocumentReference'}
        </Alert>

        <TextInput
          label="Description"
          placeholder="Enter document description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
          required
        />

        <TextInput
          label="Type"
          placeholder="Enter document type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.currentTarget.value })}
          required
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value || 'current' })}
          data={[
            { value: 'current', label: 'Current' },
            { value: 'superseded', label: 'Superseded' },
            { value: 'entered-in-error', label: 'Entered in Error' },
          ]}
          required
        />

        <TextInput
          label="Content Type"
          placeholder="e.g., application/pdf, image/jpeg"
          value={formData.contentType}
          onChange={(e) => setFormData({ ...formData, contentType: e.currentTarget.value })}
        />

        <TextInput
          label="Content Title"
          placeholder="Enter content title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {document ? 'Update Document' : 'Create Document'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Resources-Medplum Page Component
 */
const ResourcesMedplumPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentReference | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  // Fetch FHIR documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('DocumentReference', {
          _sort: '-date',
          _count: '50',
          _include: 'DocumentReference:subject,DocumentReference:author'
        });

        if (response.entry) {
          const documentData = response.entry
            .filter(entry => entry.resource?.resourceType === 'DocumentReference')
            .map(entry => entry.resource as DocumentReference);
          
          setDocuments(documentData);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR documents:', err);
        setError('Failed to fetch resources from FHIR server. Please check your connection.');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      const matchesSearch = !searchTerm || 
        document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.type?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.subject?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
      const matchesType = !typeFilter || document.type?.text?.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, searchTerm, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalDocuments = documents.length;
    const currentDocuments = documents.filter(d => d.status === 'current').length;
    const publicDocuments = documents.filter(d => d.status === 'current').length; // Assuming current = public
    const avgRating = 4.7; // Mock rating for FHIR documents

    return {
      totalDocuments,
      currentDocuments,
      publicDocuments,
      avgRating,
    };
  }, [documents]);

  const handleViewDocument = (document: DocumentReference) => {
    setSelectedDocument(document);
    openDetails();
  };

  const handleEditDocument = (document: DocumentReference) => {
    setSelectedDocument(document);
    openEdit();
  };

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    openCreate();
  };

  const handleDownloadDocument = async (document: DocumentReference) => {
    setLoading(true);
    try {
      // Mock download functionality for FHIR documents
      const attachment = document.content?.[0]?.attachment;
      if (attachment?.url) {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.title || `document-${document.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setNotification({ type: 'success', message: 'Document downloaded successfully!' });
      } else {
        setNotification({ type: 'error', message: 'No downloadable content available for this document.' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to download document. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async (documentData: Partial<DocumentReference>) => {
    setLoading(true);
    try {
      if (selectedDocument) {
        // Update existing document via FHIR
        const updatedDocument = { ...selectedDocument, ...documentData };
        await medplumClient.updateResource(updatedDocument);
        
        setDocuments(prev => prev.map(d => 
          d.id === selectedDocument.id ? updatedDocument : d
        ));
        setNotification({ type: 'success', message: 'Document updated successfully!' });
      } else {
        // Create new document via FHIR
        const newDocument = await medplumClient.createResource({
          resourceType: 'DocumentReference',
          ...documentData,
        } as DocumentReference);
        
        setDocuments(prev => [...prev, newDocument]);
        setNotification({ type: 'success', message: 'Document created successfully!' });
      }
      closeCreate();
      closeEdit();
    } catch (error) {
      console.error('Error saving document:', error);
      setNotification({ type: 'error', message: 'Failed to save document. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    setLoading(true);
    try {
      await medplumClient.deleteResource('DocumentReference', documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      setNotification({ type: 'success', message: 'Document deleted successfully!' });
      closeDelete();
    } catch (error) {
      console.error('Error deleting document:', error);
      setNotification({ type: 'error', message: 'Failed to delete document. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateDocument = async (document: DocumentReference) => {
    setLoading(true);
    try {
      const duplicatedDocument = {
        ...document,
        id: undefined, // Let FHIR server assign new ID
        description: `${document.description} (Copy)`,
        date: new Date().toISOString(),
      };
      
      const newDocument = await medplumClient.createResource(duplicatedDocument);
      setDocuments(prev => [...prev, newDocument]);
      setNotification({ type: 'success', message: 'Document duplicated successfully!' });
    } catch (error) {
      console.error('Error duplicating document:', error);
      setNotification({ type: 'error', message: 'Failed to duplicate document. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(
        selectedDocuments.map(id => medplumClient.deleteResource('DocumentReference', id))
      );
      
      setDocuments(prev => prev.filter(d => !selectedDocuments.includes(d.id!)));
      setSelectedDocuments([]);
      setNotification({ type: 'success', message: `${selectedDocuments.length} documents deleted successfully!` });
    } catch (error) {
      console.error('Error bulk deleting documents:', error);
      setNotification({ type: 'error', message: 'Failed to delete documents. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedDocuments.length === 0) return;
    
    setLoading(true);
    try {
      const updatePromises = selectedDocuments.map(async (id) => {
        const document = documents.find(d => d.id === id);
        if (document) {
          const updatedDocument = { ...document, status: status as any };
          return medplumClient.updateResource(updatedDocument);
        }
      });
      
      await Promise.all(updatePromises);
      
      setDocuments(prev => prev.map(d => 
        selectedDocuments.includes(d.id!) 
          ? { ...d, status: status as any }
          : d
      ));
      setSelectedDocuments([]);
      setNotification({ 
        type: 'success', 
        message: `${selectedDocuments.length} documents updated to ${status} successfully!` 
      });
    } catch (error) {
      console.error('Error bulk updating documents:', error);
      setNotification({ type: 'error', message: 'Failed to update document status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Title', 'Type', 'Status', 'Author', 'Patient', 'Date', 'Content Type'],
      ...filteredDocuments.map(d => [
        d.id || '',
        d.description || d.type?.text || 'Untitled',
        d.type?.text || 'Document',
        d.status || 'Unknown',
        d.author?.[0]?.display || 'Unknown Author',
        d.subject?.display || 'Unknown Patient',
        d.date ? new Date(d.date).toLocaleDateString() : 'Unknown',
        d.content?.[0]?.attachment?.contentType || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fhir-documents-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(d => d.id!));
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR resources...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="xl" withBorder radius="lg" bg="gradient-to-r from-blue-50 to-indigo-50">
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Group align="center" gap="sm">
                <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'indigo' }}>
                  <FileText size={24} />
                </ThemeIcon>
                <div>
                  <Title order={1} size="h2" fw={600}>
                    FHIR Document Resources
                  </Title>
                  <Text c="dimmed" size="sm">
                    Manage healthcare documents and resources with live FHIR data
                  </Text>
                </div>
              </Group>
              <Group gap="xs" mt="xs">
                <Badge color="green" variant="light" size="md">
                  <Database size={12} style={{ marginRight: 4 }} />
                  Live FHIR Data
                </Badge>
                <Badge color="blue" variant="outline" size="md">
                  {filteredDocuments.length} Documents
                </Badge>
              </Group>
            </Stack>
            <Group>
              <Button
                variant="light"
                leftSection={<Upload size={16} />}
                onClick={handleExportCSV}
              >
                Export
              </Button>
              <Button 
                leftSection={<Plus size={16} />} 
                onClick={handleCreateDocument}
                gradient={{ from: 'blue', to: 'indigo' }}
                variant="gradient"
              >
                Add Document
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Statistics Dashboard */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
          <Paper 
            p="lg" 
            withBorder 
            radius="md" 
            shadow="sm"
            style={{ 
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} lh={1}>
                    Total Documents
                  </Text>
                  <Badge size="xs" variant="dot" color="blue">Live</Badge>
                </Group>
                <Text fw={700} size="xl" c="dark" style={{ fontSize: '2rem' }}>
                  {stats.totalDocuments}
                </Text>
                <Group gap="xs" align="center">
                  <TrendingUp size={12} color="var(--mantine-color-blue-6)" />
                  <Text size="xs" c="blue" fw={500}>
                    +12% from last month
                  </Text>
                </Group>
              </Stack>
              <ThemeIcon 
                size="xl" 
                radius="md" 
                variant="gradient" 
                gradient={{ from: 'blue', to: 'indigo' }}
              >
                <FileText size={24} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper 
            p="lg" 
            withBorder 
            radius="md" 
            shadow="sm"
            style={{ 
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} lh={1}>
                    Current Documents
                  </Text>
                  <Badge size="xs" variant="dot" color="green">Active</Badge>
                </Group>
                <Text fw={700} size="xl" c="dark" style={{ fontSize: '2rem' }}>
                  {stats.currentDocuments}
                </Text>
                <Group gap="xs" align="center">
                  <TrendingUp size={12} color="var(--mantine-color-green-6)" />
                  <Text size="xs" c="green" fw={500}>
                    +8% from last month
                  </Text>
                </Group>
              </Stack>
              <ThemeIcon 
                size="xl" 
                radius="md" 
                variant="gradient" 
                gradient={{ from: 'green', to: 'teal' }}
              >
                <Check size={24} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper 
            p="lg" 
            withBorder 
            radius="md" 
            shadow="sm"
            style={{ 
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} lh={1}>
                    Public Documents
                  </Text>
                  <Badge size="xs" variant="dot" color="orange">Shared</Badge>
                </Group>
                <Text fw={700} size="xl" c="dark" style={{ fontSize: '2rem' }}>
                  {stats.publicDocuments}
                </Text>
                <Group gap="xs" align="center">
                  <TrendingUp size={12} color="var(--mantine-color-orange-6)" />
                  <Text size="xs" c="orange" fw={500}>
                    +5% from last month
                  </Text>
                </Group>
              </Stack>
              <ThemeIcon 
                size="xl" 
                radius="md" 
                variant="gradient" 
                gradient={{ from: 'orange', to: 'red' }}
              >
                <Users size={24} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper 
            p="lg" 
            withBorder 
            radius="md" 
            shadow="sm"
            style={{ 
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700} lh={1}>
                    Avg Rating
                  </Text>
                  <Badge size="xs" variant="dot" color="yellow">Quality</Badge>
                </Group>
                <Text fw={700} size="xl" c="dark" style={{ fontSize: '2rem' }}>
                  {stats.avgRating}
                </Text>
                <Group gap="xs" align="center">
                  <Star size={12} color="var(--mantine-color-yellow-6)" fill="var(--mantine-color-yellow-6)" />
                  <Text size="xs" c="yellow" fw={500}>
                    ⭐ Excellent
                  </Text>
                </Group>
              </Stack>
              <ThemeIcon 
                size="xl" 
                radius="md" 
                variant="gradient" 
                gradient={{ from: 'yellow', to: 'orange' }}
              >
                <Star size={24} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Notification */}
        {notification && (
          <Alert
            variant="light"
            color={notification.type === 'success' ? 'green' : 'red'}
            title={notification.type === 'success' ? 'Success' : 'Error'}
            icon={notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            withCloseButton
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Alert>
        )}

        {/* Enhanced Filters and Controls */}
        <Paper p="lg" withBorder radius="md" shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Title order={3} size="h4" fw={500}>
                Search & Filter
              </Title>
              <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                data={[
                  { 
                    label: (
                      <Group gap="xs">
                        <BarChart3 size={14} />
                        <span>Cards</span>
                      </Group>
                    ), 
                    value: 'cards' 
                  },
                  { 
                    label: (
                      <Group gap="xs">
                        <FileText size={14} />
                        <span>Table</span>
                      </Group>
                    ), 
                    value: 'table' 
                  },
                ]}
                size="sm"
              />
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <TextInput
                  placeholder="Search documents by title, type, or patient..."
                  leftSection={<Search size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  size="md"
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Filter by status"
                  leftSection={<Filter size={16} />}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || 'all')}
                  data={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'current', label: 'Current' },
                    { value: 'superseded', label: 'Superseded' },
                    { value: 'entered-in-error', label: 'Entered in Error' },
                  ]}
                  size="md"
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  placeholder="Filter by document type..."
                  leftSection={<FileText size={16} />}
                  value={typeFilter || ''}
                  onChange={(e) => setTypeFilter(e.currentTarget.value || null)}
                  size="md"
                  radius="md"
                />
              </Grid.Col>
            </Grid>

            {(selectedDocuments.length > 0 || searchTerm || statusFilter !== 'all' || typeFilter) && (
              <Group justify="space-between" align="center">
                <Group>
                  {selectedDocuments.length > 0 && (
                    <Badge size="lg" variant="light" color="blue">
                      {selectedDocuments.length} selected
                    </Badge>
                  )}
                  {(searchTerm || statusFilter !== 'all' || typeFilter) && (
                    <Badge size="lg" variant="outline" color="gray">
                      {filteredDocuments.length} results
                    </Badge>
                  )}
                </Group>

                <Group>
                  {selectedDocuments.length > 0 && (
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <Button variant="light" size="sm" leftSection={<MoreVertical size={16} />}>
                          Bulk Actions ({selectedDocuments.length})
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<Check size={14} />}
                          onClick={() => handleBulkStatusChange('current')}
                        >
                        Mark as Current
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<Clock size={14} />}
                        onClick={() => handleBulkStatusChange('superseded')}
                      >
                        Mark as Superseded
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<Trash2 size={14} />}
                        color="red"
                        onClick={handleBulkDelete}
                      >
                        Delete Selected
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
                  <Button
                    variant="light"
                    size="sm"
                    leftSection={<Download size={16} />}
                    onClick={handleExportCSV}
                  >
                    Export CSV
                  </Button>
                </Group>
              </Group>
            )}
          </Stack>
        </Paper>

        {/* Documents Display */}
        {viewMode === 'cards' ? (
          filteredDocuments.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <FileText size={48} color="gray" />
                <Text size="lg" c="dimmed">No resources found</Text>
                <Text size="sm" c="dimmed">
                  {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or add new resources'}
                </Text>
                {!searchTerm && statusFilter === 'all' && !typeFilter && (
                  <Button
                    leftSection={<Plus size={16} />}
                    onClick={handleCreateDocument}
                  >
                    Create Document
                  </Button>
                )}
              </Stack>
            </Center>
          ) : (
            <SimpleGrid 
              cols={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4 }} 
              spacing="lg"
              verticalSpacing="lg"
            >
              {filteredDocuments.map((document) => (
                <FHIRDocumentCard
                  key={document.id}
                  document={document}
                  onView={handleViewDocument}
                  onEdit={handleEditDocument}
                  onDownload={handleDownloadDocument}
                  onDelete={(doc) => {
                    setSelectedDocument(doc);
                    openDelete();
                  }}
                  onDuplicate={handleDuplicateDocument}
                  isSelected={selectedDocuments.includes(document.id!)}
                  onSelect={handleSelectDocument}
                />
              ))}
            </SimpleGrid>
          )
        ) : (
          <Paper withBorder radius="md" p="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                      indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < filteredDocuments.length}
                      onChange={handleSelectAll}
                    />
                  </Table.Th>
                  <Table.Th>Document</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Size</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDocuments.map((document) => (
                  <FHIRDocumentTableRow
                    key={document.id}
                    document={document}
                    onView={handleViewDocument}
                    onEdit={handleEditDocument}
                    onDownload={handleDownloadDocument}
                    onDelete={(doc) => {
                      setSelectedDocument(doc);
                      openDelete();
                    }}
                    onDuplicate={handleDuplicateDocument}
                    isSelected={selectedDocuments.includes(document.id!)}
                    onSelect={handleSelectDocument}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Document Details Modal */}
        <DocumentDetailsModal
          document={selectedDocument}
          opened={detailsOpened}
          onClose={closeDetails}
        />

        {/* Create/Edit Document Modal */}
        <DocumentFormModal
          document={selectedDocument}
          opened={createOpened || editOpened}
          onClose={() => {
            closeCreate();
            closeEdit();
          }}
          onSave={handleSaveDocument}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          title="Delete Document"
          size="sm"
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to delete this document? This action cannot be undone.
            </Text>
            <Group justify="flex-end">
              <Button variant="light" onClick={closeDelete}>
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => selectedDocument && handleDeleteDocument(selectedDocument.id!)}
                loading={loading}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default ResourcesMedplumPage;