/**
 * Tags-Medplum Page Component
 * Manages tags using FHIR data
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
  ActionIcon,
  Modal,
  Center,
  Loader,
  Alert,
  ColorSwatch,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Tag,
  Hash,
  Filter,
  Database,
  AlertCircle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { CodeSystem } from '@medplum/fhirtypes';

/**
 * FHIR Tag Card Component
 */
interface FHIRTagCardProps {
  codeSystem: CodeSystem;
  onView: (codeSystem: CodeSystem) => void;
  onEdit: (codeSystem: CodeSystem) => void;
}

const FHIRTagCard: React.FC<FHIRTagCardProps> = ({ codeSystem, onView, onEdit }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'retired':
        return 'red';
      case 'draft':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTagName = () => {
    return codeSystem.name || codeSystem.title || 'Unnamed Tag System';
  };

  const getConceptCount = () => {
    return codeSystem.concept?.length || 0;
  };

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR CodeSystem
            </Badge>
          </Group>
          <Badge color={getStatusColor(codeSystem.status)}>
            {codeSystem.status}
          </Badge>
        </Group>

        <Group>
          <ColorSwatch color={getRandomColor()} size={40}>
            <Tag size={20} color="white" />
          </ColorSwatch>
          <Stack gap={4}>
            <Text fw={500}>{getTagName()}</Text>
            <Text size="sm" c="dimmed">
              {codeSystem.description || 'No description'}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Hash size={14} />
            <Text size="sm">Concepts: {getConceptCount()}</Text>
          </Group>
          <Group gap="xs">
            <Tag size={14} />
            <Text size="sm">URL: {codeSystem.url || 'Not specified'}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            Version: {codeSystem.version || 'N/A'}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(codeSystem)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(codeSystem)}
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
 * Main Tags-Medplum Page Component
 */
const TagsMedplumPage: React.FC = () => {
  const [codeSystems, setCodeSystems] = useState<CodeSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCodeSystem, setSelectedCodeSystem] = useState<CodeSystem | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR code systems (used as tags)
  useEffect(() => {
    const fetchCodeSystems = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('CodeSystem', {
          _sort: 'name',
          _count: '50'
        });

        if (response.entry) {
          const codeSystemData = response.entry
            .filter(entry => entry.resource?.resourceType === 'CodeSystem')
            .map(entry => entry.resource as CodeSystem);
          
          setCodeSystems(codeSystemData);
        } else {
          setCodeSystems([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR code systems:', err);
        setError('Failed to fetch tags from FHIR server. Please check your connection.');
        setCodeSystems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCodeSystems();
  }, []);

  // Filter code systems
  const filteredCodeSystems = useMemo(() => {
    return codeSystems.filter(codeSystem => {
      const matchesSearch = !searchTerm || 
        codeSystem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        codeSystem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        codeSystem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        codeSystem.id?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [codeSystems, searchTerm]);

  const handleViewCodeSystem = (codeSystem: CodeSystem) => {
    setSelectedCodeSystem(codeSystem);
    openDetails();
  };

  const handleEditCodeSystem = (codeSystem: CodeSystem) => {
    setSelectedCodeSystem(codeSystem);
    openEdit();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR code systems...</Text>
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
            <Title order={1}>Tags</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage code systems and tags</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Tag System
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Search */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                placeholder="Search tag systems..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text size="sm" c="dimmed">
                {filteredCodeSystems.length} tag systems
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Tags Grid */}
        {filteredCodeSystems.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Tag size={48} color="gray" />
              <Text size="lg" c="dimmed">No tag systems found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your search or create new tag systems'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredCodeSystems.map((codeSystem) => (
              <Grid.Col key={codeSystem.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRTagCard
                  codeSystem={codeSystem}
                  onView={handleViewCodeSystem}
                  onEdit={handleEditCodeSystem}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Tag Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR CodeSystem #${selectedCodeSystem?.id}`}
          size="lg"
        >
          {selectedCodeSystem && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - CodeSystem ID: {selectedCodeSystem.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Name</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCodeSystem.name || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedCodeSystem.status === 'active' ? 'green' : 'yellow'}>
                      {selectedCodeSystem.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Description</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCodeSystem.description || 'No description available'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Version</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCodeSystem.version || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Concepts</Text>
                    <Text size="sm" c="dimmed">
                      {selectedCodeSystem.concept?.length || 0} concepts
                    </Text>
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
          title="Create New FHIR CodeSystem"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR code system creation requires specific implementation for CodeSystem resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR CodeSystem"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR code system editing requires specific implementation for the selected CodeSystem resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default TagsMedplumPage;