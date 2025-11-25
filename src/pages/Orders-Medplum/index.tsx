/**
 * Orders-Medplum Page Component
 * Manages medical orders, prescriptions, and lab requests using FHIR data
 */

import React, { useState, useMemo } from 'react';
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
  Table,
  Avatar,
  Divider,
  Center,
  Loader,
  Textarea,
  Alert,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  Pill,
  TestTube,
  Stethoscope,
  Filter,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Database,
  Package,
  CheckCircle,
  LayoutGrid,
  Rows,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { ServiceRequest, MedicationRequest } from '@medplum/fhirtypes';
import { useOrders } from '../../hooks/useQuery';
import CreateOrderModal from '../../components/CreateOrderModal';
import SummaryMetricCard from '../../components/SummaryMetricCard';

type FHIROrder = ServiceRequest | MedicationRequest;

/**
 * Formats the `authoredOn` date for a given FHIR order.
 * Inputs: `order` - a `ServiceRequest` or `MedicationRequest`.
 * Output: A localized date string or 'Unknown' if missing.
 */
const formatAuthoredOn = (order: FHIROrder): string => {
  const authored = order.resourceType === 'MedicationRequest'
    ? (order as MedicationRequest).authoredOn
    : (order as ServiceRequest).authoredOn;

  return authored ? new Date(authored as string).toLocaleDateString() : 'Unknown';
};

/**
 * FHIR Order Card Component
 */
interface FHIROrderCardProps {
  order: FHIROrder;
  onView: (order: FHIROrder) => void;
  onEdit: (order: FHIROrder) => void;
}

const FHIROrderCard: React.FC<FHIROrderCardProps> = ({ order, onView, onEdit }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'yellow';
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      case 'on-hold':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'MedicationRequest':
        return <Pill size={16} />;
      case 'ServiceRequest':
        return <TestTube size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'asap':
        return 'orange';
      case 'routine':
        return 'blue';
      case 'stat':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getOrderDescription = () => {
    if (order.resourceType === 'MedicationRequest') {
      const medRequest = order as MedicationRequest;
      return medRequest.medicationCodeableConcept?.text || 
             medRequest.medicationReference?.display || 
             'Medication Request';
    } else {
      const serviceRequest = order as ServiceRequest;
      return serviceRequest.code?.text || 
             serviceRequest.code?.coding?.[0]?.display || 
             'Service Request';
    }
  };

  const getPatientName = () => {
    return order.subject?.display || 'Unknown Patient';
  };

  const getOrderDate = () => {
    if (order.resourceType === 'MedicationRequest') {
      const medRequest = order as MedicationRequest;
      return medRequest.authoredOn ? new Date(medRequest.authoredOn).toLocaleDateString() : 'Unknown';
    } else {
      const serviceRequest = order as ServiceRequest;
      return serviceRequest.authoredOn ? new Date(serviceRequest.authoredOn).toLocaleDateString() : 'Unknown';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR {order.resourceType}
            </Badge>
          </Group>
          <Badge color={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </Group>

        <Group justify="space-between" align="flex-start">
          <Group>
            <ActionIcon variant="light" color="blue" size="lg">
              {getTypeIcon(order.resourceType)}
            </ActionIcon>
            <Stack gap={4}>
              <Text fw={500}>{getOrderDescription()}</Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Order #{order.id}
                </Text>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  {order.resourceType}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">{getPatientName()}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Ordered: {getOrderDate()}</Text>
          </Group>
          {order.resourceType === 'ServiceRequest' && (order as ServiceRequest).occurrenceDateTime && (
            <Group gap="xs">
              <Clock size={14} />
              <Text size="sm">
                Due: {new Date((order as ServiceRequest).occurrenceDateTime!).toLocaleDateString()}
              </Text>
            </Group>
          )}
        </Stack>

        <Group justify="space-between" align="center">
          <Badge size="sm" color={getPriorityColor(order.priority)}>
            {order.priority || 'routine'} priority
          </Badge>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(order)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(order)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {(order.resourceType === 'ServiceRequest' && (order as ServiceRequest).note?.[0]?.text) && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            <strong>Notes:</strong> {(order as ServiceRequest).note![0].text}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

/**
 * FHIR Order Details Modal
 */
interface FHIROrderDetailsModalProps {
  order: FHIROrder | null;
  opened: boolean;
  onClose: () => void;
}

const FHIROrderDetailsModal: React.FC<FHIROrderDetailsModalProps> = ({
  order,
  opened,
  onClose,
}) => {
  if (!order) return null;

  const getOrderDescription = () => {
    if (order.resourceType === 'MedicationRequest') {
      const medRequest = order as MedicationRequest;
      return medRequest.medicationCodeableConcept?.text || 
             medRequest.medicationReference?.display || 
             'Medication Request';
    } else {
      const serviceRequest = order as ServiceRequest;
      return serviceRequest.code?.text || 
             serviceRequest.code?.coding?.[0]?.display || 
             'Service Request';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`FHIR Order #${order.id}`}
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Live FHIR Data - {order.resourceType} ID: {order.id}
        </Alert>

        <Group>
          <ActionIcon variant="light" color="blue" size="xl">
            {order.resourceType === 'MedicationRequest' ? <Pill size={24} /> : <TestTube size={24} />}
          </ActionIcon>
          <Stack gap={4}>
            <Title order={3}>{getOrderDescription()}</Title>
            <Badge color={order.status === 'active' ? 'green' : 'yellow'}>
              {order.status}
            </Badge>
          </Stack>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Patient</Text>
              <Text size="sm" c="dimmed">
                {order.subject?.display || 'Unknown Patient'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Priority</Text>
              <Badge size="sm" color={order.priority === 'urgent' ? 'red' : 'blue'}>
                {order.priority || 'routine'}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Authored On</Text>
              <Text size="sm" c="dimmed">
                {order.resourceType === 'MedicationRequest' 
                  ? ((order as MedicationRequest).authoredOn ? new Date((order as MedicationRequest).authoredOn!).toLocaleString() : 'Not set')
                  : ((order as ServiceRequest).authoredOn ? new Date((order as ServiceRequest).authoredOn!).toLocaleString() : 'Not set')
                }
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Requester</Text>
              <Text size="sm" c="dimmed">
                {order.requester?.display || 'Unknown'}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        {order.resourceType === 'MedicationRequest' && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Medication Details</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    <strong>Medication:</strong> {(order as MedicationRequest).medicationCodeableConcept?.text || 'Not specified'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    <strong>Intent:</strong> {(order as MedicationRequest).intent || 'Not specified'}
                  </Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </>
        )}

        {order.resourceType === 'ServiceRequest' && (order as ServiceRequest).code && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Service Details</Text>
              <Text size="sm" c="dimmed">
                <strong>Code:</strong> {(order as ServiceRequest).code!.coding?.[0]?.code || 'Not specified'}
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Display:</strong> {(order as ServiceRequest).code!.coding?.[0]?.display || 'Not specified'}
              </Text>
            </Stack>
          </>
        )}

        {order.resourceType === 'ServiceRequest' && (order as ServiceRequest).note?.[0]?.text && (
          <>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" fw={500}>Notes</Text>
              <Text size="sm">{(order as ServiceRequest).note![0].text}</Text>
            </Stack>
          </>
        )}
      </Stack>
    </Modal>
  );
};

/**
 * Main Orders-Medplum Page Component
 */
const OrdersMedplumPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<FHIROrder | null>(null);
  // Controls list/cards rendering of orders
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Use the standardized useOrders hook
  const { data: orders = [], isLoading: loading, error } = useOrders({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  });

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const getOrderDescription = () => {
        if (order.resourceType === 'MedicationRequest') {
          const medRequest = order as MedicationRequest;
          return medRequest.medicationCodeableConcept?.text || 
                 medRequest.medicationReference?.display || '';
        } else {
          const serviceRequest = order as ServiceRequest;
          return serviceRequest.code?.text || 
                 serviceRequest.code?.coding?.[0]?.display || '';
        }
      };

      const matchesSearch = !searchTerm || 
        getOrderDescription().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.subject?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesType = typeFilter === 'all' || order.resourceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const handleViewOrder = (order: FHIROrder) => {
    setSelectedOrder(order);
    openDetails();
  };

  const handleEditOrder = (order: FHIROrder) => {
    setSelectedOrder(order);
    openEdit();
  };

  /**
   * Clears all filter controls on the Orders page.
   * Inputs: none
   * Outputs: none; updates local state for `searchTerm`, `statusFilter`, and `typeFilter`.
   */
  const handleClearFilters = (): void => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR orders...</Text>
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
            <Title order={1}>Orders</Title>
            <Text c="dimmed">Manage medical orders, prescriptions, and lab requests</Text>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            New Order
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            Failed to fetch orders: {error.message || 'Please check your connection.'}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <SummaryMetricCard
              label="Total Orders"
              value={filteredOrders.length}
              color="blue"
              icon={<Package size={20} />}
              helperText="All matching orders"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <SummaryMetricCard
              label="Active Orders"
              value={filteredOrders.filter(o => o.status === 'active').length}
              color="green"
              icon={<AlertCircle size={20} />}
              helperText="Currently active"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <SummaryMetricCard
              label="Completed Orders"
              value={filteredOrders.filter(o => o.status === 'completed').length}
              color="teal"
              icon={<CheckCircle size={20} />}
              helperText="Finished orders"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <SummaryMetricCard
              label="Pending Orders"
              value={filteredOrders.filter(o => o.status === 'draft' || o.status === 'on-hold').length}
              color="orange"
              icon={<Clock size={20} />}
              helperText="Draft or on hold"
            />
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <Group align="center" gap="sm" wrap="wrap">
              <TextInput
                placeholder="Search orders..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                w={{ base: '100%', sm: 280 }}
              />
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'on-hold', label: 'On Hold' },
                ]}
                clearable
                w={{ base: '100%', sm: 220 }}
              />
              <Select
                placeholder="Filter by type"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value || 'all')}
                data={[
                  { value: 'all', label: 'All Types' },
                  { value: 'ServiceRequest', label: 'Service Request' },
                  { value: 'MedicationRequest', label: 'Medication Request' },
                ]}
                clearable
                w={{ base: '100%', sm: 200 }}
              />
            </Group>
            <Group align="center" gap="sm">
              <Group gap="xs">
                <ActionIcon
                  variant={viewMode === 'cards' ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => setViewMode('cards')}
                  aria-label="Cards view"
                >
                  <LayoutGrid size={18} />
                </ActionIcon>
                <ActionIcon
                  variant={viewMode === 'table' ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                >
                  <Rows size={18} />
                </ActionIcon>
              </Group>
              <Button variant="light" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Group>
          </Group>
        </Card>

        {/* Orders Display */}
        {filteredOrders.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <FileText size={48} color="gray" />
              <Text size="lg" c="dimmed">No orders found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your filters or create a new order'}
              </Text>
            </Stack>
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredOrders.map((order) => (
              <Grid.Col key={order.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIROrderCard
                  order={order}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredOrders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        {order.resourceType === 'MedicationRequest'
                          ? (order as MedicationRequest).medicationCodeableConcept?.text || 'Medication Request'
                          : (order as ServiceRequest).code?.text || 'Service Request'}
                      </Text>
                      <Text size="xs" c="dimmed">#{order.id}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{order.subject?.display || 'Unknown Patient'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">
                      {order.resourceType === 'MedicationRequest' ? 'Medication' : 'Service'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={
                      order.status === 'active' ? 'green' :
                      order.status === 'completed' ? 'blue' :
                      order.status === 'draft' ? 'yellow' :
                      order.status === 'cancelled' ? 'red' :
                      order.status === 'on-hold' ? 'orange' : 'gray'
                    }>
                      {order.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={
                      order.priority === 'urgent' || order.priority === 'stat' ? 'red' :
                      order.priority === 'asap' ? 'orange' :
                      order.priority === 'routine' ? 'blue' : 'blue'
                    }>
                      {order.priority || 'routine'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatAuthoredOn(order)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye size={14} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="orange" size="sm" onClick={() => handleEditOrder(order)}>
                        <Edit size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {/* Modals */}
        <FHIROrderDetailsModal
          order={selectedOrder}
          opened={detailsOpened}
          onClose={closeDetails}
        />

        {/* Create Order Modal */}
        <CreateOrderModal
          opened={createOpened}
          onClose={closeCreate}
          onOrderCreated={() => {
            // Orders will be automatically refreshed due to query invalidation
          }}
        />

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Order"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR order editing requires specific implementation for the selected resource type.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default OrdersMedplumPage;