/**
 * Sessions page component
 * Telehealth session management with video calls and scheduling
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
  Tabs,
  Progress
} from '@mantine/core';
import {
  Search,
  Filter,
  Plus,
  Video,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  FileText,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';

interface Session {
  id: string;
  patientName: string;
  providerName: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'consultation' | 'follow-up' | 'therapy' | 'emergency';
  notes?: string;
}

export function Sessions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock session data
  const sessions: Session[] = [
    {
      id: '1',
      patientName: 'John Doe',
      providerName: 'Dr. Smith',
      scheduledTime: '2024-01-15 10:00',
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      notes: 'Initial consultation for back pain'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      providerName: 'Dr. Johnson',
      scheduledTime: '2024-01-15 11:30',
      duration: 45,
      status: 'in-progress',
      type: 'follow-up',
      notes: 'Follow-up for diabetes management'
    },
    {
      id: '3',
      patientName: 'Mike Wilson',
      providerName: 'Dr. Brown',
      scheduledTime: '2024-01-14 14:00',
      duration: 60,
      status: 'completed',
      type: 'therapy',
      notes: 'Physical therapy session'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'in-progress': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'blue';
      case 'follow-up': return 'green';
      case 'therapy': return 'purple';
      case 'emergency': return 'red';
      default: return 'blue';
    }
  };

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} mb={4}>
              Telehealth Sessions
            </Title>
            <Text c="dimmed">
              Manage video consultations, appointments, and patient sessions
            </Text>
          </div>
          <Button leftSection={<Plus size={16} />}>
            Schedule Session
          </Button>
        </Group>

        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Today's Sessions
                  </Text>
                  <Text size="xl" fw={700}>
                    8
                  </Text>
                </div>
                <Video size={24} color="#2563eb" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    In Progress
                  </Text>
                  <Text size="xl" fw={700}>
                    2
                  </Text>
                </div>
                <Play size={24} color="#16a34a" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Completed
                  </Text>
                  <Text size="xl" fw={700}>
                    156
                  </Text>
                </div>
                <FileText size={24} color="#6b7280" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Avg Duration
                  </Text>
                  <Text size="xl" fw={700}>
                    42m
                  </Text>
                </div>
                <Clock size={24} color="#f59e0b" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Search and Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="Search sessions by patient or provider..."
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
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Group justify="flex-end">
                <Text size="sm" c="dimmed">
                  {filteredSessions.length} sessions found
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Sessions Table */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Provider</Table.Th>
                <Table.Th>Scheduled Time</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredSessions.map((session) => (
                <Table.Tr key={session.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl">
                        {session.patientName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {session.patientName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Session #{session.id}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{session.providerName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm">{session.scheduledTime.split(' ')[0]}</Text>
                      <Text size="xs" c="dimmed">{session.scheduledTime.split(' ')[1]}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{session.duration} min</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getTypeColor(session.type)} variant="light">
                      {session.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(session.status)} variant="light">
                      {session.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {session.status === 'scheduled' && (
                        <ActionIcon variant="light" color="green">
                          <Video size={16} />
                        </ActionIcon>
                      )}
                      {session.status === 'in-progress' && (
                        <ActionIcon variant="light" color="blue">
                          <MessageSquare size={16} />
                        </ActionIcon>
                      )}
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray">
                            <MoreHorizontal size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<Video size={14} />}
                            onClick={() => handleViewSession(session)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item leftSection={<Calendar size={14} />}>
                            Reschedule
                          </Menu.Item>
                          <Menu.Item leftSection={<FileText size={14} />}>
                            Session Notes
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<Phone size={14} />} color="red">
                            Cancel Session
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
              total={Math.ceil(filteredSessions.length / 10)}
            />
          </Group>
        </Card>

        {/* Session Details Modal */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Session Details"
          size="lg"
        >
          {selectedSession && (
            <Tabs defaultValue="overview">
              <Tabs.List>
                <Tabs.Tab value="overview" leftSection={<Video size={16} />}>
                  Overview
                </Tabs.Tab>
                <Tabs.Tab value="notes" leftSection={<FileText size={16} />}>
                  Notes
                </Tabs.Tab>
                <Tabs.Tab value="recording" leftSection={<Play size={16} />}>
                  Recording
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="overview" pt="lg">
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Patient</Text>
                      <Text size="sm" c="dimmed">{selectedSession.patientName}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Provider</Text>
                      <Text size="sm" c="dimmed">{selectedSession.providerName}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Scheduled Time</Text>
                      <Text size="sm" c="dimmed">{selectedSession.scheduledTime}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Duration</Text>
                      <Text size="sm" c="dimmed">{selectedSession.duration} minutes</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Type</Text>
                      <Badge color={getTypeColor(selectedSession.type)} variant="light">
                        {selectedSession.type}
                      </Badge>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500}>Status</Text>
                      <Badge color={getStatusColor(selectedSession.status)} variant="light">
                        {selectedSession.status}
                      </Badge>
                    </Grid.Col>
                  </Grid>
                  
                  {selectedSession.status === 'in-progress' && (
                    <Card withBorder p="md">
                      <Group justify="space-between" mb="sm">
                        <Text size="sm" fw={500}>Session Progress</Text>
                        <Text size="xs" c="dimmed">15 min elapsed</Text>
                      </Group>
                      <Progress value={50} color="green" />
                    </Card>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="notes" pt="lg">
                <Stack gap="md">
                  <Text size="sm" fw={500}>Session Notes</Text>
                  <Text size="sm" c="dimmed">
                    {selectedSession.notes || 'No notes available for this session.'}
                  </Text>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="recording" pt="lg">
                <Text c="dimmed">Session recording and playback controls will be available here.</Text>
              </Tabs.Panel>
            </Tabs>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}