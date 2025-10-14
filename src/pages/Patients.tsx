/**
 * Patients page component
 * Patient management interface with search, filtering, and patient records
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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  FileText,
  User
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  insurance: string;
  provider: string;
}

export function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock patient data
  const patients: Patient[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      dateOfBirth: '1985-03-15',
      lastVisit: '2024-01-15',
      status: 'active',
      insurance: 'Blue Cross',
      provider: 'Dr. Smith'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '(555) 987-6543',
      dateOfBirth: '1990-07-22',
      lastVisit: '2024-01-10',
      status: 'active',
      insurance: 'Aetna',
      provider: 'Dr. Johnson'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '(555) 456-7890',
      dateOfBirth: '1978-11-08',
      lastVisit: '2023-12-20',
      status: 'inactive',
      insurance: 'Cigna',
      provider: 'Dr. Brown'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'orange';
      default: return 'blue';
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} mb={4}>
              Patient Management
            </Title>
            <Text c="dimmed">
              Manage patient records, appointments, and medical information
            </Text>
          </div>
          <Button leftSection={<Plus size={16} />}>
            Add New Patient
          </Button>
        </Group>

        {/* Search and Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search patients by name or email..."
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
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Group justify="flex-end">
                <Text size="sm" c="dimmed">
                  {filteredPatients.length} patients found
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Patients Table */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Date of Birth</Table.Th>
                <Table.Th>Last Visit</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Provider</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPatients.map((patient) => (
                <Table.Tr key={patient.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {patient.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          ID: {patient.id}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Mail size={12} />
                        <Text size="xs">{patient.email}</Text>
                      </Group>
                      <Group gap="xs">
                        <Phone size={12} />
                        <Text size="xs">{patient.phone}</Text>
                      </Group>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{patient.dateOfBirth}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{patient.lastVisit}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(patient.status)} variant="light">
                      {patient.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{patient.provider}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleViewPatient(patient)}
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
                            Edit Patient
                          </Menu.Item>
                          <Menu.Item leftSection={<Calendar size={14} />}>
                            Schedule Appointment
                          </Menu.Item>
                          <Menu.Item leftSection={<FileText size={14} />}>
                            View Records
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<Trash2 size={14} />} color="red">
                            Delete Patient
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
              total={Math.ceil(filteredPatients.length / 10)}
            />
          </Group>
        </Card>

        {/* Patient Details Modal */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Patient Details"
          size="lg"
        >
          {selectedPatient && (
            <Tabs defaultValue="overview">
              <Tabs.List>
                <Tabs.Tab value="overview" leftSection={<User size={16} />}>
                  Overview
                </Tabs.Tab>
                <Tabs.Tab value="appointments" leftSection={<Calendar size={16} />}>
                  Appointments
                </Tabs.Tab>
                <Tabs.Tab value="records" leftSection={<FileText size={16} />}>
                  Medical Records
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="overview" pt="lg">
                <Stack gap="md">
                  <Group>
                    <Avatar size="lg" radius="xl">
                      {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <div>
                      <Title order={4}>{selectedPatient.name}</Title>
                      <Text c="dimmed">Patient ID: {selectedPatient.id}</Text>
                    </div>
                  </Group>
                  
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Email</Text>
                      <Text size="sm" c="dimmed">{selectedPatient.email}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Phone</Text>
                      <Text size="sm" c="dimmed">{selectedPatient.phone}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Date of Birth</Text>
                      <Text size="sm" c="dimmed">{selectedPatient.dateOfBirth}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Insurance</Text>
                      <Text size="sm" c="dimmed">{selectedPatient.insurance}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Primary Provider</Text>
                      <Text size="sm" c="dimmed">{selectedPatient.provider}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Status</Text>
                      <Badge color={getStatusColor(selectedPatient.status)} variant="light">
                        {selectedPatient.status}
                      </Badge>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="appointments" pt="lg">
                <Text c="dimmed">Appointment history and upcoming appointments will be displayed here.</Text>
              </Tabs.Panel>

              <Tabs.Panel value="records" pt="lg">
                <Text c="dimmed">Medical records, test results, and treatment history will be displayed here.</Text>
              </Tabs.Panel>
            </Tabs>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}