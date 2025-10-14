/**
 * Orders Page Component
 * Manages medical orders, prescriptions, and lab requests
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
  Table,
  Avatar,
  Divider,
  Center,
  Loader,
  Textarea,
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useOrders } from '../hooks/useQuery';
import { Order } from '../types';

/**
 * Order Card Component
 */
interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onView, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription':
        return <Pill size={16} />;
      case 'lab':
        return <TestTube size={16} />;
      case 'imaging':
        return <Stethoscope size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'normal':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'blue';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <ActionIcon variant="light" color="blue" size="lg">
              {getTypeIcon(order.type)}
            </ActionIcon>
            <Stack gap={4}>
              <Text fw={500}>{order.description}</Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Order #{order.id}
                </Text>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  {order.type}
                </Text>
              </Group>
            </Stack>
          </Group>
          <Badge color={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">{order.patientName}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Ordered: {order.orderDate}</Text>
          </Group>
          <Group gap="xs">
            <Clock size={14} />
            <Text size="sm">Due: {order.dueDate || 'Not specified'}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Badge size="sm" color={getPriorityColor(order.priority)}>
            {order.priority} priority
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

        {order.notes && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            <strong>Notes:</strong> {order.notes}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

/**
 * Order Details Modal
 */
interface OrderDetailsModalProps {
  order: Order | null;
  opened: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  opened,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Order #${order.id}`}
      size="lg"
    >
      <Stack gap="md">
        <Group>
          <ActionIcon variant="light" color="blue" size="xl">
            {order.type === 'prescription' ? <Pill size={24} /> : 
             order.type === 'lab' ? <TestTube size={24} /> : 
             order.type === 'imaging' ? <Stethoscope size={24} /> : 
             <FileText size={24} />}
          </ActionIcon>
          <Stack gap={4}>
            <Title order={3}>{order.description}</Title>
            <Group gap="xs">
              <Badge color={order.status === 'approved' ? 'green' : 'yellow'}>
                {order.status}
              </Badge>
              <Badge color={order.priority === 'urgent' ? 'red' : 'blue'}>
                {order.priority} priority
              </Badge>
            </Group>
          </Stack>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Order Information</Text>
              <Text size="sm">
                <strong>Type:</strong> {order.type}
              </Text>
              <Text size="sm">
                <strong>Order Date:</strong> {order.orderDate}
              </Text>
              <Text size="sm">
                <strong>Due Date:</strong> {order.dueDate || 'Not specified'}
              </Text>
              <Text size="sm">
                <strong>Priority:</strong> {order.priority}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Patient Information</Text>
              <Text size="sm">
                <strong>Patient:</strong> {order.patientName}
              </Text>
              <Text size="sm">
                <strong>Provider:</strong> {order.provider}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Stack gap="xs">
          <Text fw={500}>Description</Text>
          <Text size="sm">{order.description}</Text>
        </Stack>

        {order.notes && (
          <Stack gap="xs">
            <Text fw={500}>Notes</Text>
            <Text size="sm">{order.notes}</Text>
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Order</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Create Order Modal
 */
interface CreateOrderModalProps {
  opened: boolean;
  onClose: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ opened, onClose }) => {
  const [formData, setFormData] = useState({
    type: '',
    patientName: '',
    description: '',
    priority: 'normal',
    dueDate: '',
    notes: '',
  });

  const handleSubmit = () => {
    // TODO: Implement order creation
    console.log('Create order:', formData);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Order"
      size="lg"
    >
      <Stack gap="md">
        <Select
          label="Order Type"
          placeholder="Select order type"
          data={[
            { value: 'prescription', label: 'Prescription' },
            { value: 'lab', label: 'Lab Test' },
            { value: 'imaging', label: 'Imaging' },
            { value: 'referral', label: 'Referral' },
          ]}
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value || '' })}
          required
        />

        <TextInput
          label="Patient Name"
          placeholder="Enter patient name"
          value={formData.patientName}
          onChange={(event) => setFormData({ ...formData, patientName: event.currentTarget.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter order description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          required
          minRows={3}
        />

        <Select
          label="Priority"
          data={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value || 'normal' })}
        />

        <TextInput
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(event) => setFormData({ ...formData, dueDate: event.currentTarget.value })}
        />

        <Textarea
          label="Notes"
          placeholder="Additional notes (optional)"
          value={formData.notes}
          onChange={(event) => setFormData({ ...formData, notes: event.currentTarget.value })}
          minRows={2}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Order
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Orders Page Component
 */
export const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const { data: orders, isLoading, error } = useOrders({
    search: searchQuery,
    status: statusFilter,
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    openDetails();
  };

  const handleEditOrder = (order: Order) => {
    // TODO: Implement edit functionality
    console.log('Edit order:', order);
  };

  const filterOrdersByTab = (orders: Order[], tab: string) => {
    switch (tab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'approved':
        return orders.filter(order => order.status === 'approved');
      case 'completed':
        return orders.filter(order => order.status === 'completed');
      case 'urgent':
        return orders.filter(order => order.priority === 'urgent');
      default:
        return orders;
    }
  };

  const filteredOrders = orders ? filterOrdersByTab(orders, activeTab || 'all') : [];

  if (error) {
    return (
      <Container size="xl" py="md">
        <Text color="red">Error loading orders: {error.message}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Orders Management</Title>
            <Text c="dimmed">Manage medical orders, prescriptions, and lab requests</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Order
          </Button>
        </Group>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                placeholder="Search orders..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<FileText size={16} />}>
              All Orders
            </Tabs.Tab>
            <Tabs.Tab value="pending" leftSection={<Clock size={16} />}>
              Pending
            </Tabs.Tab>
            <Tabs.Tab value="approved" leftSection={<Eye size={16} />}>
              Approved
            </Tabs.Tab>
            <Tabs.Tab value="urgent" leftSection={<Calendar size={16} />}>
              Urgent
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : (
              <Grid>
                {filteredOrders.map((order) => (
                  <Grid.Col key={order.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <OrderCard
                      order={order}
                      onView={handleViewOrder}
                      onEdit={handleEditOrder}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="pending" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : (
              <Grid>
                {filteredOrders.map((order) => (
                  <Grid.Col key={order.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <OrderCard
                      order={order}
                      onView={handleViewOrder}
                      onEdit={handleEditOrder}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="approved" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : (
              <Grid>
                {filteredOrders.map((order) => (
                  <Grid.Col key={order.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <OrderCard
                      order={order}
                      onView={handleViewOrder}
                      onEdit={handleEditOrder}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="urgent" pt="md">
            {isLoading ? (
              <Center py="xl">
                <Loader size="lg" />
              </Center>
            ) : (
              <Grid>
                {filteredOrders.map((order) => (
                  <Grid.Col key={order.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <OrderCard
                      order={order}
                      onView={handleViewOrder}
                      onEdit={handleEditOrder}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <FileText size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No orders found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first order'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                Create Order
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        opened={createOpened}
        onClose={closeCreate}
      />
    </Container>
  );
};