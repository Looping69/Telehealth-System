import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Code,
  Container,
  Grid,
  Group,
  Loader,
  Modal,
  Pagination,
  Progress,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  Search,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AuditEvent } from '@medplum/fhirtypes';
import { useAuditEvents } from '../../hooks/useQuery';

/**
 * Interfaces
 */
interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
  ipAddress: string;
}

interface AuditSummary {
  totalLogs: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
}

/**
 * Mock Data
 */
const mockAuditLogs: AuditLog[] = [];

const mockAuditSummary: AuditSummary = {
  totalLogs: 0,
  successfulActions: 0,
  failedActions: 0,
  uniqueUsers: 0,
  topActions: [],
  topUsers: [],
};

/**
 * Audit Log Row Component
 */
interface AuditLogRowProps {
  log: AuditLog;
  onViewDetails: (log: AuditLog) => void;
}

const AuditLogRow: React.FC<AuditLogRowProps> = ({ log, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Table.Tr>
      <Table.Td>{formatTimestamp(log.timestamp)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Avatar size="sm" />
          <div>
            <Text size="sm" fw={500}>
              {log.userName}
            </Text>
            <Text size="xs" c="dimmed">
              {log.userRole}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Code>{log.action}</Code>
      </Table.Td>
      <Table.Td>{log.resource}</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(log.status)} variant="light">
          {log.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>
          {log.details}
        </Text>
      </Table.Td>
      <Table.Td>{log.ipAddress}</Table.Td>
      <Table.Td>
        <Button
          variant="light"
          size="xs"
          leftSection={<Eye size={12} />}
          onClick={() => onViewDetails(log)}
        >
          View
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Audit Log Details Modal
 */
interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  opened: boolean;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({ log, opened, onClose }) => {
  if (!log) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Audit Log Details" size="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>{log.action}</Title>
          <Badge color={getStatusColor(log.status)} variant="light" size="lg">
            {log.status}
          </Badge>
        </Group>

        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">
                Timestamp
              </Text>
              <Text fw={500}>{formatTimestamp(log.timestamp)}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">
                IP Address
              </Text>
              <Text fw={500}>{log.ipAddress}</Text>
            </Grid.Col>
          </Grid>
        </Card>

        <Card withBorder padding="md">
          <Title order={5} mb="sm">
            User
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">
                Name
              </Text>
              <Text fw={500}>{log.userName}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">
                Role
              </Text>
              <Text fw={500}>{log.userRole}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text size="sm" c="dimmed">
                User ID
              </Text>
              <Code>{log.userId}</Code>
            </Grid.Col>
          </Grid>
        </Card>

        <Card withBorder padding="md">
          <Title order={5} mb="sm">
            Resource
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">
                Type
              </Text>
              <Text fw={500}>{log.resource}</Text>
            </Grid.Col>
            {log.resourceId && (
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Resource ID
                </Text>
                <Code>{log.resourceId}</Code>
              </Grid.Col>
            )}
          </Grid>
        </Card>

        <div>
          <Text size="sm" c="dimmed">
            Details
          </Text>
          <Box
            p="sm"
            style={{
              backgroundColor: 'var(--mantine-color-gray-0)',
              borderRadius: 'var(--mantine-radius-sm)',
            }}
          >
            <Text>{log.details}</Text>
          </Box>
        </div>

        <Button onClick={onClose} fullWidth mt="md">
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

/**
 * Audit Summary Component
 */
const AuditSummaryComponent: React.FC<{ auditLogs: AuditLog[] }> = ({ auditLogs }) => {
  const summary = {
    totalLogs: auditLogs.length,
    successfulActions: auditLogs.filter(log => log.status === 'success').length,
    failedActions: auditLogs.filter(log => log.status === 'failure').length,
    uniqueUsers: new Set(auditLogs.map(log => log.userId)).size,
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Total Logs
            </Text>
            <ActionIcon variant="light" color="blue" size="lg">
              <Activity size={20} />
            </ActionIcon>
          </Group>
          <Text fw={700} size="xl">
            {summary.totalLogs}
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Successful Actions
            </Text>
            <ActionIcon variant="light" color="green" size="lg">
              <CheckCircle size={20} />
            </ActionIcon>
          </Group>
          <Text fw={700} size="xl" c="green">
            {summary.successfulActions}
          </Text>
          <Progress
            value={(summary.successfulActions / summary.totalLogs) * 100}
            color="green"
            size="xs"
            mt="xs"
          />
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Failed Actions
            </Text>
            <ActionIcon variant="light" color="red" size="lg">
              <XCircle size={20} />
            </ActionIcon>
          </Group>
          <Text fw={700} size="xl" c="red">
            {summary.failedActions}
          </Text>
          <Progress
            value={(summary.failedActions / summary.totalLogs) * 100}
            color="red"
            size="xs"
            mt="xs"
          />
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Unique Users
            </Text>
            <ActionIcon variant="light" color="purple" size="lg">
              <User size={20} />
            </ActionIcon>
          </Group>
          <Text fw={700} size="xl" c="purple">
            {summary.uniqueUsers}
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

/**
 * Top Actions Component
 */
const TopActionsComponent: React.FC<{ auditLogs: AuditLog[] }> = ({ auditLogs }) => {
  const topActions = auditLogs
    .reduce((acc, log) => {
      const existing = acc.find(item => item.action === log.action);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ action: log.action, count: 1 });
      }
      return acc;
    }, [] as { action: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={4} mb="md">
        Top Actions
      </Title>
      <Stack gap="md">
        {topActions.map((action, index) => (
          <Group key={action.action} justify="space-between">
            <Group gap="xs">
              <Badge variant="light" size="sm">
                #{index + 1}
              </Badge>
              <Code>{action.action}</Code>
            </Group>
            <Text fw={500}>{action.count}</Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
};

/**
 * Top Users Component
 */
const TopUsersComponent: React.FC<{ auditLogs: AuditLog[] }> = ({ auditLogs }) => {
  const topUsers = auditLogs
    .reduce((acc, log) => {
      const existing = acc.find(item => item.userId === log.userId);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ userId: log.userId, userName: log.userName, count: 1 });
      }
      return acc;
    }, [] as { userId: string; userName: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={4} mb="md">
        Most Active Users
      </Title>
      <Stack gap="md">
        {topUsers.map((user, index) => (
          <Group key={user.userId} justify="space-between">
            <Group gap="xs">
              <Badge variant="light" size="sm">
                #{index + 1}
              </Badge>
              <Avatar size="sm" />
              <Text size="sm">{user.userName}</Text>
            </Group>
            <Text fw={500}>{user.count}</Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
};

/**
 * Main Audit Page Component
 */
export const AuditMedplumPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const { data: auditEvents, isLoading } = useAuditEvents();

  console.log('auditEvents', auditEvents);

  const auditLogs: AuditLog[] = (auditEvents || []).map((event: AuditEvent) => ({
    id: event.id || '',
    timestamp: event.recorded,
    userName: event.agent?.[0]?.name || 'Unknown',
    userRole: 'N/A',
    userId: event.agent?.[0]?.who?.reference || 'Unknown',
    action: event.action || 'Unknown',
    resource: event.entity?.[0]?.what?.reference || 'Unknown',
    resourceId: event.entity?.[0]?.what?.reference?.split('/')?.[1] || undefined,
    status: event.outcome === '0' ? 'success' : 'failure',
    details: event.outcomeDesc || 'No details',
    ipAddress: 'N/A',
  })) || [];

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    openDetails();
  };

  const handleExportLogs = () => {
    // TODO: Implement export functionality
    console.log('Export audit logs');
  };

  const filteredLogs = auditLogs
    .filter(log =>
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(log => !actionFilter || log.action === actionFilter)
    .filter(log => !statusFilter || log.status === statusFilter)
    .filter(log => !userFilter || log.userId === userFilter);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Get unique actions and users for filters
  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const userOptions = Array.from(new Set(auditLogs.map(log => log.userId)))
    .map(userId => {
      const user = auditLogs.find(log => log.userId === userId);
      return { value: userId, label: user ? user.userName : userId };
    });


  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Audit Logs</Title>
            <Text c="dimmed">Monitor system activity and user actions for compliance and security</Text>
          </div>
          <Button leftSection={<Download size={16} />} onClick={handleExportLogs}>
            Export Logs
          </Button>
        </Group>

        {/* Tabs */}
        <Tabs defaultValue="logs">
          <Tabs.List>
            <Tabs.Tab value="logs" leftSection={<Activity size={16} />}>
              Audit Logs
            </Tabs.Tab>
            <Tabs.Tab value="summary" leftSection={<FileText size={16} />}>
              Summary
            </Tabs.Tab>
            <Tabs.Tab value="compliance" leftSection={<Shield size={16} />}>
              Compliance
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="logs" pt="lg">
            <Stack gap="lg">
              {/* Summary Cards */}
              <AuditSummaryComponent auditLogs={auditLogs} />

              {/* Filters */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Grid align="end">
                  <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                    <TextInput
                      placeholder="Search logs..."
                      leftSection={<Search size={16} />}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                    <Select
                      placeholder="Filter by action"
                      leftSection={<Filter size={16} />}
                      data={uniqueActions.map(action => ({ value: action, label: action }))}
                      value={actionFilter}
                      onChange={setActionFilter}
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                    <Select
                      placeholder="Filter by status"
                      leftSection={<Activity size={16} />}
                      data={[
                        { value: 'success', label: 'Success' },
                        { value: 'failure', label: 'Failure' },
                        { value: 'warning', label: 'Warning' },
                      ]}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                    <Select
                      placeholder="Filter by user"
                      leftSection={<User size={16} />}
                      data={userOptions}
                      value={userFilter}
                      onChange={setUserFilter}
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                  <SegmentedControl
                    value={viewMode}
                    onChange={(value) => setViewMode(value as 'cards' | 'table')}
                    data={[
                      { label: 'Cards', value: 'cards' },
                      { label: 'Table', value: 'table' },
                    ]}
                    fullWidth
                  />
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Audit Logs Display */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                {isLoading ? (
                  <Center py="xl">
                    <Loader size="lg" />
                  </Center>
                ) : viewMode === 'cards' ? (
                  <Stack gap="md">
                    <Grid>
                      {paginatedLogs.map((log) => (
                        <Grid.Col key={log.id} span={{ base: 12, sm: 6, lg: 4 }}>
                          <AuditLogCard
                            log={log}
                            onViewDetails={handleViewDetails}
                          />
                        </Grid.Col>
                      ))}
                    </Grid>
                    {totalPages > 1 && (
                      <Group justify="center">
                        <Pagination
                          value={currentPage}
                          onChange={setCurrentPage}
                          total={totalPages}
                        />
                      </Group>
                    )}
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <ScrollArea>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Timestamp</Table.Th>
                            <Table.Th>User</Table.Th>
                            <Table.Th>Action</Table.Th>
                            <Table.Th>Resource</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Details</Table.Th>
                            <Table.Th>IP Address</Table.Th>
                            <Table.Th>Actions</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {paginatedLogs.map((log) => (
                            <AuditLogRow
                              key={log.id}
                              log={log}
                              onViewDetails={handleViewDetails}
                            />
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>

                    {totalPages > 1 && (
                      <Group justify="center">
                        <Pagination
                          value={currentPage}
                          onChange={setCurrentPage}
                          total={totalPages}
                        />
                      </Group>
                    )}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="summary" pt="lg">
            <Stack gap="lg">
              <AuditSummaryComponent auditLogs={auditLogs} />
              <Grid>
                <Grid.Col span={6}>
                  <TopActionsComponent auditLogs={auditLogs} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TopUsersComponent auditLogs={auditLogs} />
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="compliance" pt="lg">
            <Stack gap="lg">
              <Alert icon={<Info size={16} />} color="blue">
                Compliance reports help ensure your organization meets regulatory requirements for healthcare data management and user activity monitoring.
              </Alert>

              <Grid>
                <Grid.Col span={6}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      HIPAA Compliance
                    </Title>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text size="sm">Audit logging enabled</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Compliant
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm">User access tracking</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Compliant
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm">Data modification logs</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Compliant
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm">Failed access attempts</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Compliant
                        </Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Security Monitoring
                    </Title>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text size="sm">Login monitoring</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Active
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm">Failed login alerts</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Active
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm">Data export tracking</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Active
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm">Privilege escalation</Text>
                        <Badge color="green" leftSection={<CheckCircle size={14} />}>
                          Active
                        </Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" align="center" mb="md">
                  <Title order={4}>Generate Compliance Report</Title>
                  <Button leftSection={<FileText size={16} />}>
                    Generate Report
                  </Button>
                </Group>
                <Text size="sm" c="dimmed">
                  Generate detailed compliance reports for regulatory audits and internal reviews.
                  Reports include user activity summaries, security events, and data access logs.
                </Text>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Audit Log Details Modal */}
      <AuditLogDetailsModal
        log={selectedLog}
        opened={detailsOpened}
        onClose={closeDetails}
      />
    </Container>
  );
};

/**
 * Audit Log Card Component
 */
interface AuditLogCardProps {
  log: AuditLog;
  onViewDetails: (log: AuditLog) => void;
}

const AuditLogCard: React.FC<AuditLogCardProps> = ({ log, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={14} />;
      case 'failure':
        return <XCircle size={14} />;
      case 'warning':
        return <AlertTriangle size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" mb="xs">
              <Code>{log.action}</Code>
              <Badge
                color={getStatusColor(log.status)}
                variant="light"
                leftSection={getStatusIcon(log.status)}
                size="sm"
              >
                {log.status}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {formatTimestamp(log.timestamp)}
            </Text>
          </div>
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onViewDetails(log)}
          >
            <Eye size={14} />
          </ActionIcon>
        </Group>

        <Group gap="xs">
          <Avatar size="sm" />
          <div>
            <Text size="sm" fw={500}>
              {log.userName}
            </Text>
            <Text size="xs" c="dimmed">
              {log.userRole}
            </Text>
          </div>
        </Group>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Resource: {log.resource}
          </Text>
          {log.resourceId && (
            <Text size="xs" c="dimmed" mb="xs">
              ID: {log.resourceId}
            </Text>
          )}
          <Text size="sm" lineClamp={2}>
            {log.details}
          </Text>
        </div>

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            IP: {log.ipAddress}
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<Eye size={12} />}
            onClick={() => onViewDetails(log)}
          >
            View Details
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default AuditMedplumPage;