/**
 * Audit Page Component
 * Displays system audit logs, user activity tracking, and compliance reports
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
  Table,
  ScrollArea,
  Center,
  Loader,
  Pagination,
  Tooltip,
  Code,
  Tabs,
  MultiSelect,
  Alert,
  Progress,
  Avatar,
  Divider,
  SegmentedControl,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
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
  FileText,
  Database,
  Lock,
  Unlock,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

/**
 * Audit log interfaces
 */
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
  metadata?: Record<string, any>;
}

interface AuditSummary {
  totalLogs: number;
  successfulActions: number;
  failedActions: number;
  warningActions: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
}

/**
 * Mock data for audit logs
 */
const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUDIT-001',
    timestamp: '2024-01-20T10:30:00Z',
    userId: 'USER-001',
    userName: 'Dr. Sarah Johnson',
    userRole: 'Provider',
    action: 'LOGIN',
    resource: 'Authentication',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    details: 'User successfully logged in',
    metadata: { sessionId: 'sess_123456', loginMethod: 'password' },
  },
  {
    id: 'AUDIT-002',
    timestamp: '2024-01-20T10:32:15Z',
    userId: 'USER-001',
    userName: 'Dr. Sarah Johnson',
    userRole: 'Provider',
    action: 'VIEW_PATIENT',
    resource: 'Patient',
    resourceId: 'PAT-001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    details: 'Viewed patient record for John Smith',
    metadata: { patientId: 'PAT-001', patientName: 'John Smith' },
  },
  {
    id: 'AUDIT-003',
    timestamp: '2024-01-20T10:35:22Z',
    userId: 'USER-002',
    userName: 'Jane Doe',
    userRole: 'Receptionist',
    action: 'CREATE_APPOINTMENT',
    resource: 'Appointment',
    resourceId: 'APT-001',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    details: 'Created new appointment for patient',
    metadata: { appointmentId: 'APT-001', patientId: 'PAT-002' },
  },
  {
    id: 'AUDIT-004',
    timestamp: '2024-01-20T10:40:10Z',
    userId: 'USER-003',
    userName: 'Mike Wilson',
    userRole: 'Billing',
    action: 'LOGIN_FAILED',
    resource: 'Authentication',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'failure',
    details: 'Failed login attempt - invalid password',
    metadata: { attemptCount: 3, reason: 'invalid_password' },
  },
  {
    id: 'AUDIT-005',
    timestamp: '2024-01-20T10:45:33Z',
    userId: 'USER-001',
    userName: 'Dr. Sarah Johnson',
    userRole: 'Provider',
    action: 'UPDATE_PATIENT',
    resource: 'Patient',
    resourceId: 'PAT-001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebBot/537.36',
    status: 'success',
    details: 'Updated patient medical history',
    metadata: { patientId: 'PAT-001', fieldsUpdated: ['medical_history', 'allergies'] },
  },
  {
    id: 'AUDIT-006',
    timestamp: '2024-01-20T11:00:45Z',
    userId: 'USER-004',
    userName: 'Admin User',
    userRole: 'Admin',
    action: 'EXPORT_DATA',
    resource: 'System',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'warning',
    details: 'Exported patient data for compliance audit',
    metadata: { exportType: 'patient_data', recordCount: 150 },
  },
  {
    id: 'AUDIT-007',
    timestamp: '2024-01-20T11:15:20Z',
    userId: 'USER-002',
    userName: 'Jane Doe',
    userRole: 'Receptionist',
    action: 'DELETE_APPOINTMENT',
    resource: 'Appointment',
    resourceId: 'APT-002',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    details: 'Cancelled appointment due to patient request',
    metadata: { appointmentId: 'APT-002', reason: 'patient_request' },
  },
  {
    id: 'AUDIT-008',
    timestamp: '2024-01-20T11:30:12Z',
    userId: 'USER-005',
    userName: 'Dr. Michael Chen',
    userRole: 'Provider',
    action: 'PRESCRIBE_MEDICATION',
    resource: 'Prescription',
    resourceId: 'RX-001',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    details: 'Prescribed medication for patient',
    metadata: { prescriptionId: 'RX-001', medication: 'Amoxicillin', patientId: 'PAT-003' },
  },
];

const mockAuditSummary: AuditSummary = {
  totalLogs: 1247,
  successfulActions: 1156,
  failedActions: 67,
  warningActions: 24,
  uniqueUsers: 45,
  topActions: [
    { action: 'LOGIN', count: 234 },
    { action: 'VIEW_PATIENT', count: 189 },
    { action: 'CREATE_APPOINTMENT', count: 156 },
    { action: 'UPDATE_PATIENT', count: 123 },
    { action: 'LOGOUT', count: 98 },
  ],
  topUsers: [
    { userId: 'USER-001', userName: 'Dr. Sarah Johnson', count: 89 },
    { userId: 'USER-002', userName: 'Jane Doe', count: 67 },
    { userId: 'USER-005', userName: 'Dr. Michael Chen', count: 54 },
    { userId: 'USER-003', userName: 'Mike Wilson', count: 43 },
    { userId: 'USER-004', userName: 'Admin User', count: 32 },
  ],
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
    <Table.Tr>
      <Table.Td>
        <Text size="sm" fw={500}>
          {formatTimestamp(log.timestamp)}
        </Text>
      </Table.Td>
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
      <Table.Td>
        <Text size="sm">{log.resource}</Text>
        {log.resourceId && (
          <Text size="xs" c="dimmed">
            ID: {log.resourceId}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(log.status)}
          variant="light"
          leftSection={getStatusIcon(log.status)}
          size="sm"
        >
          {log.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2}>
          {log.details}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          {log.ipAddress}
        </Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label="View Details">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onViewDetails(log)}
          >
            <Eye size={14} />
          </ActionIcon>
        </Tooltip>
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
  if (!log) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Audit Log Details"
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Basic Information</Text>
              <Text size="sm">
                <strong>ID:</strong> {log.id}
              </Text>
              <Text size="sm">
                <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
              </Text>
              <Text size="sm">
                <strong>Action:</strong> <Code>{log.action}</Code>
              </Text>
              <Text size="sm">
                <strong>Resource:</strong> {log.resource}
              </Text>
              {log.resourceId && (
                <Text size="sm">
                  <strong>Resource ID:</strong> {log.resourceId}
                </Text>
              )}
              <Text size="sm">
                <strong>Status:</strong>{' '}
                <Badge color={log.status === 'success' ? 'green' : log.status === 'failure' ? 'red' : 'yellow'}>
                  {log.status}
                </Badge>
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>User Information</Text>
              <Text size="sm">
                <strong>User ID:</strong> {log.userId}
              </Text>
              <Text size="sm">
                <strong>Name:</strong> {log.userName}
              </Text>
              <Text size="sm">
                <strong>Role:</strong> {log.userRole}
              </Text>
              <Text size="sm">
                <strong>IP Address:</strong> {log.ipAddress}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider />

        <div>
          <Text fw={500} mb="xs">
            Details
          </Text>
          <Text size="sm">{log.details}</Text>
        </div>

        <div>
          <Text fw={500} mb="xs">
            User Agent
          </Text>
          <Code block>{log.userAgent}</Code>
        </div>

        {log.metadata && (
          <div>
            <Text fw={500} mb="xs">
              Metadata
            </Text>
            <Code block>{JSON.stringify(log.metadata, null, 2)}</Code>
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Audit Summary Component
 */
const AuditSummaryComponent: React.FC = () => {
  const summary = mockAuditSummary;

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Total Logs
            </Text>
            <ThemeIcon variant="light" color="blue" size="lg" radius="md">
              <FileText size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} c="blue">
            {summary.totalLogs.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            All system events
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Successful Actions
            </Text>
            <ThemeIcon variant="light" color="green" size="lg" radius="md">
              <CheckCircle size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} c="green">
            {summary.successfulActions.toLocaleString()}
          </Text>
          <Progress
            value={(summary.successfulActions / summary.totalLogs) * 100}
            color="green"
            size="xs"
            mt="xs"
          />
          <Text size="xs" c="dimmed" mt={4}>
            Successfully completed
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Failed Actions
            </Text>
            <ThemeIcon variant="light" color="red" size="lg" radius="md">
              <XCircle size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} c="red">
            {summary.failedActions.toLocaleString()}
          </Text>
          <Progress
            value={(summary.failedActions / summary.totalLogs) * 100}
            color="red"
            size="xs"
            mt="xs"
          />
          <Text size="xs" c="dimmed" mt={4}>
            Authorization failures
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Unique Users
            </Text>
            <ThemeIcon variant="light" color="purple" size="lg" radius="md">
              <User size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} c="purple">
            {summary.uniqueUsers}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Active system users
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

/**
 * Top Actions Component
 */
const TopActionsComponent: React.FC = () => {
  const { topActions } = mockAuditSummary;

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
const TopUsersComponent: React.FC = () => {
  const { topUsers } = mockAuditSummary;

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
export const AuditPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  const auditLogs = mockAuditLogs;

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
              <AuditSummaryComponent />

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
              <AuditSummaryComponent />
              <Grid>
                <Grid.Col span={6}>
                  <TopActionsComponent />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TopUsersComponent />
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