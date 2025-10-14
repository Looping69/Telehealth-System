/**
 * Orders page component
 * Medical orders and prescription management
 * Based on Telehealth Dashboard PRD specifications
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
  Table,
  Avatar,
  ActionIcon,
  Menu,
  Pagination,
  Modal,
  Tabs
} from '@mantine/core';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Pill,
  TestTube,
  Stethoscope,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Send,
  Clock
} from 'lucide-react';

interface Order {
  id: string;
  patientName: string;
  providerName: string;
  orderType: 'prescription' | 'lab' | 'imaging' | 'referral';
  description: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock order data
  const orders: Order[] = [
    {
      id: 'ORD-001',
      patientName: 'John Doe',
      providerName: 'Dr. Smith',
      orderType: 'prescription',
      description: 'Lisinopril 10mg - Take once daily for blood pressure',
      status: 'pending',
      createdDate: '2024-01-15',
      dueDate: '2024-01-16',
      priority: 'medium'
    },
    {
      id: 'ORD-002',
      patientName: 'Jane Smith',
      providerName: 'Dr. Johnson',
      orderType: 'lab',
      description: 'Complete Blood Count (CBC) and Basic Metabolic Panel',
      status: 'approved',
      createdDate: '2024-01-14',
      dueDate: '2024-01-17',
      priority: 'high'
    },
    {
      id: 'ORD-003',
      patientName: 'Mike Wilson',
      providerName: 'Dr. Brown',
      orderType: 'imaging',
      description: 'Chest X-Ray - Follow up for pneumonia',
      status: 'completed',
      createdDate: '2024-01-12',
      dueDate: '2024-01-15',
      priority: 'urgent'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill size={16} />;
      case 'lab': return <TestTube size={16} />;
      case 'imaging': return <Stethoscope size={16} />;
      case 'referral': return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesType = !typeFilter || order.orderType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} mb={4}>
              Medical Orders
            </Title>
            <Text c="dimmed">
              Manage prescriptions, lab orders, imaging requests, and referrals
            </Text>
          </div>
          <Button leftSection={<Plus size={16} />}>
            Create New Order
          </Button>
        </Group>

        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Pending Orders
                  </Text>
                  <Text size="xl" fw={700}>
                    12
                  </Text>
                </div>
                <Clock size={24} color="#f59e0b" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Prescriptions
                  </Text>
                  <Text size="xl" fw={700}>
                    45
                  </Text>
                </div>
                <Pill size={24} color="#2563eb" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Lab Orders
                  </Text>
                  <Text size="xl" fw={700}>
                    23
                  </Text>
                </div>
                <TestTube size={24} color="#16a34a" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Urgent Orders
                  </Text>
                  <Text size="xl" fw={700}>
                    3
                  </Text>
                </div>
                <FileText size={24} color="#dc2626" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Search and Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Search orders by patient, ID, or description..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by type"
                data={[
                  { value: 'prescription', label: 'Prescription' },
                  { value: 'lab', label: 'Lab Order' },
                  { value: 'imaging', label: 'Imaging' },
                  { value: 'referral', label: 'Referral' }
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Group justify="flex-end">
                <Text size="sm" c="dimmed">
                  {filteredOrders.length} orders
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Orders Table */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order ID</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Provider</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Due Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredOrders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {order.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl">
                        {order.patientName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Text size="sm">{order.patientName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{order.providerName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {getOrderTypeIcon(order.orderType)}
                      <Text size="sm" tt="capitalize">{order.orderType}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={2}>
                      {order.description}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getPriorityColor(order.priority)} variant="light">
                      {order.priority}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(order.status)} variant="light">
                      {order.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{order.dueDate}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye size={16} />
                      </ActionIcon>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray">
                            <MoreHorizontal size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<Edit size={14} />}>
                            Edit Order
                          </Menu.Item>
                          <Menu.Item leftSection={<Printer size={14} />}>
                            Print Order
                          </Menu.Item>
                          <Menu.Item leftSection={<Send size={14} />}>
                            Send to Pharmacy
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<FileText size={14} />} color="red">
                            Cancel Order
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {/* Pagination */}
          <Group justify="center" mt="lg">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={Math.ceil(filteredOrders.length / 10)}
            />
          </Group>
        </Card>

        {/* Order Details Modal */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Order Details"
          size="lg"
        >
          {selectedOrder && (
            <Tabs defaultValue="details">
              <Tabs.List>
                <Tabs.Tab value="details" leftSection={<FileText size={16} />}>
                  Details
                </Tabs.Tab>
                <Tabs.Tab value="history" leftSection={<Clock size={16} />}>
                  History
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="details" pt="lg">
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Order ID</Text>
                      <Text size="sm" c="dimmed">{selectedOrder.id}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Type</Text>
                      <Group gap="xs">
                        {getOrderTypeIcon(selectedOrder.orderType)}
                        <Text size="sm" tt="capitalize">{selectedOrder.orderType}</Text>
                      </Group>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Patient</Text>
                      <Text size="sm" c="dimmed">{selectedOrder.patientName}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Provider</Text>
                      <Text size="sm" c="dimmed">{selectedOrder.providerName}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Created Date</Text>
                      <Text size="sm" c="dimmed">{selectedOrder.createdDate}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Due Date</Text>
                      <Text size="sm" c="dimmed">{selectedOrder.dueDate}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Priority</Text>
                      <Badge color={getPriorityColor(selectedOrder.priority)} variant="light">
                        {selectedOrder.priority}
                      </Badge>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Status</Text>
                      <Badge color={getStatusColor(selectedOrder.status)} variant="light">
                        {selectedOrder.status}
                      </Badge>
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Text size="sm" fw={500}>Description</Text>
                      <Text size="sm" c="dimmed">{selectedOrder.description}</Text>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="history" pt="lg">
                <Text c="dimmed">Order history and status changes will be displayed here.</Text>
              </Tabs.Panel>
            </Tabs>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}