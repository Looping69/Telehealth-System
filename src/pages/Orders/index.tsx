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
import { showNotification } from '@mantine/notifications';
import { useOrders } from '../../hooks/useMockData';
import { Order } from '../../types';

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
 * Edit Order Modal
 */
interface EditOrderModalProps {
  order: Order | null;
  opened: boolean;
  onClose: () => void;
  onSave: (orderData: Order) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: '',
    patientName: '',
    description: '',
    priority: 'normal',
    dueDate: '',
    notes: '',
  });

  // Pre-populate form when order changes
  React.useEffect(() => {
    if (order) {
      setFormData({
        type: order.type,
        patientName: order.patientName,
        description: order.description,
        priority: order.priority,
        dueDate: order.dueDate ? (typeof order.dueDate === 'string' ? order.dueDate : order.dueDate.toISOString().split('T')[0]) : '',
        notes: order.notes || '',
      });
    }
  }, [order]);

  const handleSubmit = () => {
    if (!order) return;

    // Validate required fields
    if (!formData.type || !formData.patientName || !formData.description) {
      showNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    // Update order
    const updatedOrder: Order = {
      ...order,
      type: formData.type as 'lab' | 'prescription' | 'referral' | 'imaging',
      patientName: formData.patientName,
      title: formData.description,
      description: formData.description,
      priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
      dueDate: formData.dueDate || undefined,
      notes: formData.notes || undefined,
    };

    onSave(updatedOrder);
    
    showNotification({
      title: 'Success',
      message: 'Order updated successfully',
      color: 'green',
    });

    onClose();
  };

  if (!order) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Order"
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
            Update Order
          </Button>
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
  onSave: (orderData: any) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: '',
    patientName: '',
    description: '',
    priority: 'normal',
    dueDate: '',
    notes: '',
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.type || !formData.patientName || !formData.description) {
      showNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    // Create new order
    const newOrder: Order = {
      id: Date.now().toString(),
      patientId: Date.now().toString(),
      patientName: formData.patientName,
      providerId: '1',
      provider: 'Dr. Sarah Wilson',
      type: formData.type as 'lab' | 'prescription' | 'referral' | 'imaging',
      title: formData.description,
      description: formData.description,
      status: 'pending',
      priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
      createdAt: new Date(),
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || undefined,
      notes: formData.notes || undefined,
    };

    onSave(newOrder);
    
    showNotification({
      title: 'Success',
      message: 'Order created successfully',
      color: 'green',
    });

    // Reset form and close modal
    setFormData({
      type: '',
      patientName: '',
      description: '',
      priority: 'normal',
      dueDate: '',
      notes: '',
    });
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Convert to stateful data for real-time updates
  const { data: fetchedOrders, isLoading, error } = useOrders();
  
  const [orders, setOrders] = useState<Order[]>([]);

  // Update local state when fetched data changes
  React.useEffect(() => {
    if (fetchedOrders) {
      setOrders(fetchedOrders);
    }
  }, [fetchedOrders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    openDetails();
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    openEdit();
  };

  const handleSaveNewOrder = (newOrder: Order) => {
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const handleSaveEditedOrder = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
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

  const applyFilters = (orders: Order[]) => {
    let filtered = orders;

    // Apply tab filter first
    filtered = filterOrdersByTab(filtered, activeTab || 'all');

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  };

  const filteredOrders = orders ? applyFilters(orders) : [];

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

  const renderOrdersContent = (orders: Order[]) => {
    if (isLoading) {
      return (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      );
    }

    if (viewMode === 'cards') {
      return (
        <Grid>
          {orders.map((order) => (
            <Grid.Col key={order.id} span={{ base: 12, sm: 6, lg: 4 }}>
              <OrderCard
                order={order}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
              />
            </Grid.Col>
          ))}
        </Grid>
      );
    }

    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order ID</Table.Th>
              <Table.Th>Patient</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Order Date</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <Group gap="sm">
                    <ActionIcon variant="light" color="blue" size="sm">
                      {getTypeIcon(order.type)}
                    </ActionIcon>
                    <div>
                      <Text fw={500} size="sm">
                        #{order.id}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {order.description}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text fw={500} size="sm">
                    {order.patientName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={
                      order.type === 'prescription' ? 'blue' :
                      order.type === 'lab' ? 'green' :
                      order.type === 'imaging' ? 'purple' :
                      'gray'
                    }
                    size="sm"
                  >
                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={getStatusColor(order.status)}
                    size="sm"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={getPriorityColor(order.priority)}
                    size="sm"
                  >
                    {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {order.orderDate}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {order.dueDate || 'Not specified'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="orange"
                      size="sm"
                      onClick={() => handleEditOrder(order)}
                    >
                      <Edit size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    );
  };

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
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button.Group>
                <Button
                  variant={viewMode === 'cards' ? 'filled' : 'light'}
                  onClick={() => setViewMode('cards')}
                  size="sm"
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'filled' : 'light'}
                  onClick={() => setViewMode('table')}
                  size="sm"
                >
                  Table
                </Button>
              </Button.Group>
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
            {renderOrdersContent(filteredOrders)}
          </Tabs.Panel>

          <Tabs.Panel value="pending" pt="md">
            {renderOrdersContent(filteredOrders)}
          </Tabs.Panel>

          <Tabs.Panel value="approved" pt="md">
            {renderOrdersContent(filteredOrders)}
          </Tabs.Panel>

          <Tabs.Panel value="urgent" pt="md">
            {renderOrdersContent(filteredOrders)}
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
        onSave={handleSaveNewOrder}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        order={editingOrder}
        opened={editOpened}
        onClose={closeEdit}
        onSave={handleSaveEditedOrder}
      />
    </Container>
  );
};