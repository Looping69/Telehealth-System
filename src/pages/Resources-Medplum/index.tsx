/**
 * Resources-Medplum Page Component
 * Manages healthcare resources using FHIR data
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
}

const FHIRDocumentCard: React.FC<FHIRDocumentCardProps> = ({ document, onView, onEdit }) => {
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

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Document
            </Badge>
          </Group>
          <Badge color={getStatusColor(document.status)}>
            {document.status}
          </Badge>
        </Group>

        <Group>
          <Avatar size="md" color="blue">
            <FileText size={20} />
          </Avatar>
          <Stack gap={4}>
            <Text fw={500} lineClamp={1}>{getDocumentTitle()}</Text>
            <Text size="sm" c="dimmed">
              {document.type?.text || 'Document'}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Patient: {getPatientName()}</Text>
          </Group>
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Author: {getAuthor()}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Created: {getCreatedDate()}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            ID: {document.id}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(document)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(document)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
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
  const [selectedDocument, setSelectedDocument] = useState<DocumentReference | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

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

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  const handleViewDocument = (document: DocumentReference) => {
    setSelectedDocument(document);
    openDetails();
  };

  const handleEditDocument = (document: DocumentReference) => {
    setSelectedDocument(document);
    openEdit();
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Resources</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage healthcare documents and resources</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Resource
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
                placeholder="Search resources..."
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
                  { value: 'current', label: 'Current' },
                  { value: 'superseded', label: 'Superseded' },
                  { value: 'entered-in-error', label: 'Entered in Error' },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Text size="sm" c="dimmed">
                {filteredDocuments.length} resources
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Resources Grid */}
        {filteredDocuments.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <FileText size={48} color="gray" />
              <Text size="lg" c="dimmed">No resources found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or add new resources'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredDocuments.map((document) => (
              <Grid.Col key={document.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRDocumentCard
                  document={document}
                  onView={handleViewDocument}
                  onEdit={handleEditDocument}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Document Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Document #${selectedDocument?.id}`}
          size="lg"
        >
          {selectedDocument && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Document ID: {selectedDocument.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Title</Text>
                    <Text size="sm" c="dimmed">
                      {selectedDocument.description || 'Untitled'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedDocument.status === 'current' ? 'green' : 'yellow'}>
                      {selectedDocument.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Type</Text>
                    <Text size="sm" c="dimmed">
                      {selectedDocument.type?.text || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Date</Text>
                    <Text size="sm" c="dimmed">
                      {selectedDocument.date ? new Date(selectedDocument.date).toLocaleString() : 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Content</Text>
                    {selectedDocument.content?.map((content, index) => (
                      <Text key={index} size="sm" c="dimmed">
                        {content.attachment?.contentType || 'Unknown type'} - {content.attachment?.title || 'Untitled'}
                      </Text>
                    )) || <Text size="sm" c="dimmed">No content available</Text>}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Create and Edit Modals */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Document"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR document creation requires specific implementation for DocumentReference resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Document"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR document editing requires specific implementation for the selected DocumentReference resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default ResourcesMedplumPage;