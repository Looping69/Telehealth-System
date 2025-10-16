/**
 * Audit-Medplum Page Component
 * Manages audit logs using FHIR data
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
  Table,
  ScrollArea,
  Center,
  Loader,
  Pagination,
  Alert,
  Tabs,
  DatePickerInput,
  Avatar,
  Code,
} from '@mantine/core';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Shield,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  AlertCircle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { AuditEvent } from '@medplum/fhirtypes';

/**
 * FHIR Audit Event Card Component
 */
interface FHIRAuditEventCardProps {
  auditEvent: AuditEvent;
  onView: (auditEvent: AuditEvent) => void;
}

const FHIRAuditEventCard: React.FC<FHIRAuditEventCardProps> = ({ auditEvent, onView }) => {
  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case '0':
        return 'green'; // Success
      case '4':
        return 'red'; // Minor failure
      case '8':
        return 'red'; // Serious failure
      case '12':
        return 'red'; // Major failure
      default:
        return 'gray';
    }
  };

  const getOutcomeText = (outcome?: string) => {
    switch (outcome) {
      case '0':
        return 'Success';
      case '4':
        return 'Minor Failure';
      case '8':
        return 'Serious Failure';
      case '12':
        return 'Major Failure';
      default:
        return 'Unknown';
    }
  };

  const getActionText = () => {
    return auditEvent.type?.display || 
           auditEvent.type?.code || 
           'Unknown Action';
  };

  const getAgentName = () => {
    const agent = auditEvent.agent?.[0];
    return agent?.who?.display || 
           agent?.name || 
           'Unknown User';
  };

  const getSourceName = () => {
    return auditEvent.source?.observer?.display || 
           auditEvent.source?.site || 
           'Unknown Source';
  };

  const getEventTime = () => {
    if (auditEvent.recorded) {
      return new Date(auditEvent.recorded).toLocaleString();
    }
    return 'Unknown Time';
  };

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR AuditEvent
            </Badge>
          </Group>
          <Badge color={getOutcomeColor(auditEvent.outcome)}>
            {getOutcomeText(auditEvent.outcome)}
          </Badge>
        </Group>

        <Group>
          <Avatar size="sm" color="blue">
            <Activity size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text fw={500} size="sm">{getActionText()}</Text>
            <Text size="xs" c="dimmed">{getAgentName()}</Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Clock size={12} />
            <Text size="xs">{getEventTime()}</Text>
          </Group>
          <Group gap="xs">
            <Shield size={12} />
            <Text size="xs">Source: {getSourceName()}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="xs" fw={500}>
            ID: {auditEvent.id}
          </Text>
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(auditEvent)}
          >
            <Eye size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Main Audit-Medplum Page Component
 */
const AuditMedplumPage: React.FC = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [selectedAuditEvent, setSelectedAuditEvent] = useState<AuditEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('events');

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  const itemsPerPage = 20;

  // Fetch FHIR audit events
  useEffect(() => {
    const fetchAuditEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('AuditEvent', {
          _sort: '-recorded',
          _count: '100'
        });

        if (response.entry) {
          const auditEventData = response.entry
            .filter(entry => entry.resource?.resourceType === 'AuditEvent')
            .map(entry => entry.resource as AuditEvent);
          
          setAuditEvents(auditEventData);
        } else {
          setAuditEvents([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR audit events:', err);
        setError('Failed to fetch audit events from FHIR server. Please check your connection.');
        setAuditEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditEvents();
  }, []);

  // Filter audit events
  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter(auditEvent => {
      const matchesSearch = !searchTerm || 
        auditEvent.type?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditEvent.type?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditEvent.agent?.[0]?.who?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditEvent.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOutcome = outcomeFilter === 'all' || auditEvent.outcome === outcomeFilter;

      return matchesSearch && matchesOutcome;
    });
  }, [auditEvents, searchTerm, outcomeFilter]);

  // Paginate results
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAuditEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAuditEvents, currentPage]);

  const totalPages = Math.ceil(filteredAuditEvents.length / itemsPerPage);

  // Get summary statistics
  const getSummaryStats = () => {
    const total = auditEvents.length;
    const successful = auditEvents.filter(e => e.outcome === '0').length;
    const failed = auditEvents.filter(e => ['4', '8', '12'].includes(e.outcome || '')).length;
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    };
  };

  const handleViewAuditEvent = (auditEvent: AuditEvent) => {
    setSelectedAuditEvent(auditEvent);
    openDetails();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR audit events...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  const stats = getSummaryStats();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Audit Logs</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">System audit events and compliance tracking</Text>
            </Group>
          </Stack>
          <Group>
            <Button variant="light" leftSection={<Download size={16} />}>
              Export Logs
            </Button>
          </Group>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#45B7D1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={20} color="white" />
                </div>
                <Stack gap={2}>
                  <Text size="lg" fw={700}>{stats.total}</Text>
                  <Text size="sm" c="dimmed">Total Events</Text>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#51CF66',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={20} color="white" />
                </div>
                <Stack gap={2}>
                  <Text size="lg" fw={700}>{stats.successful}</Text>
                  <Text size="sm" c="dimmed">Successful</Text>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#FF6B6B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <XCircle size={20} color="white" />
                </div>
                <Stack gap={2}>
                  <Text size="lg" fw={700}>{stats.failed}</Text>
                  <Text size="sm" c="dimmed">Failed</Text>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#96CEB4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield size={20} color="white" />
                </div>
                <Stack gap={2}>
                  <Text size="lg" fw={700}>{stats.successRate}%</Text>
                  <Text size="sm" c="dimmed">Success Rate</Text>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="events" leftSection={<Activity size={16} />}>
              Audit Events ({filteredAuditEvents.length})
            </Tabs.Tab>
            <Tabs.Tab value="table" leftSection={<Database size={16} />}>
              Table View
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="events">
            <Stack gap="md" mt="md">
              {/* Search and Filters */}
              <Card withBorder padding="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      placeholder="Search audit events..."
                      leftSection={<Search size={16} />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Select
                      placeholder="Filter by outcome"
                      leftSection={<Filter size={16} />}
                      data={[
                        { value: 'all', label: 'All Outcomes' },
                        { value: '0', label: 'Success' },
                        { value: '4', label: 'Minor Failure' },
                        { value: '8', label: 'Serious Failure' },
                        { value: '12', label: 'Major Failure' },
                      ]}
                      value={outcomeFilter}
                      onChange={(value) => setOutcomeFilter(value || 'all')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Text size="sm" c="dimmed">
                      {filteredAuditEvents.length} events
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Audit Events Grid */}
              {paginatedEvents.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <Activity size={48} color="gray" />
                    <Text size="lg" c="dimmed">No audit events found</Text>
                    <Text size="sm" c="dimmed">
                      {error ? 'Check your FHIR server connection' : 'Try adjusting your search filters'}
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <>
                  <Grid>
                    {paginatedEvents.map((auditEvent) => (
                      <Grid.Col key={auditEvent.id} span={{ base: 12, md: 6, lg: 4 }}>
                        <FHIRAuditEventCard
                          auditEvent={auditEvent}
                          onView={handleViewAuditEvent}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Center>
                      <Pagination
                        value={currentPage}
                        onChange={setCurrentPage}
                        total={totalPages}
                        size="sm"
                      />
                    </Center>
                  )}
                </>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="table">
            <Card withBorder mt="md">
              <ScrollArea>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Time</Table.Th>
                      <Table.Th>Action</Table.Th>
                      <Table.Th>Agent</Table.Th>
                      <Table.Th>Source</Table.Th>
                      <Table.Th>Outcome</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedEvents.map((auditEvent) => (
                      <Table.Tr key={auditEvent.id}>
                        <Table.Td>
                          <Text size="sm">
                            {auditEvent.recorded ? 
                              new Date(auditEvent.recorded).toLocaleString() : 
                              'Unknown'
                            }
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {auditEvent.type?.display || auditEvent.type?.code || 'Unknown'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {auditEvent.agent?.[0]?.who?.display || 
                             auditEvent.agent?.[0]?.name || 
                             'Unknown'
                            }
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {auditEvent.source?.observer?.display || 
                             auditEvent.source?.site || 
                             'Unknown'
                            }
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={auditEvent.outcome === '0' ? 'green' : 'red'}
                            size="sm"
                          >
                            {auditEvent.outcome === '0' ? 'Success' : 'Failure'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAuditEvent(auditEvent)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Tabs.Panel>
        </Tabs>

        {/* Audit Event Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR AuditEvent #${selectedAuditEvent?.id}`}
          size="lg"
        >
          {selectedAuditEvent && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - AuditEvent ID: {selectedAuditEvent.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Action</Text>
                    <Text size="sm" c="dimmed">
                      {selectedAuditEvent.type?.display || selectedAuditEvent.type?.code || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Outcome</Text>
                    <Badge color={selectedAuditEvent.outcome === '0' ? 'green' : 'red'}>
                      {selectedAuditEvent.outcome === '0' ? 'Success' : 'Failure'}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Recorded</Text>
                    <Text size="sm" c="dimmed">
                      {selectedAuditEvent.recorded ? 
                        new Date(selectedAuditEvent.recorded).toLocaleString() : 
                        'Unknown'
                      }
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Agent</Text>
                    <Text size="sm" c="dimmed">
                      {selectedAuditEvent.agent?.[0]?.who?.display || 
                       selectedAuditEvent.agent?.[0]?.name || 
                       'Unknown'
                      }
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Source</Text>
                    <Text size="sm" c="dimmed">
                      {selectedAuditEvent.source?.observer?.display || 
                       selectedAuditEvent.source?.site || 
                       'Unknown'
                      }
                    </Text>
                  </Stack>
                </Grid.Col>
                {selectedAuditEvent.entity && selectedAuditEvent.entity.length > 0 && (
                  <Grid.Col span={12}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>Entities</Text>
                      <Code block>
                        {JSON.stringify(selectedAuditEvent.entity, null, 2)}
                      </Code>
                    </Stack>
                  </Grid.Col>
                )}
              </Grid>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default AuditMedplumPage;