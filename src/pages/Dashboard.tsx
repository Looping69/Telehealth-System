/**
 * Dashboard page component
 * Main overview page with metrics, analytics, and notifications
 * Based on Telehealth Dashboard PRD specifications
 */

import React from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Progress,
  SimpleGrid,
  ThemeIcon,
  ActionIcon,
  Notification,
  ScrollArea,
  Divider,
  Button,
  Avatar,
  Box
} from '@mantine/core';
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  ArrowRight,
  Video,
  FileText,
  MessageSquare
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <ThemeIcon color="blue" variant="light" size="lg">
          {icon}
        </ThemeIcon>
      </Group>
      
      <Text size="xl" fw={700} mb="xs">
        {value}
      </Text>
      
      <Text size="xs" c={getChangeColor()}>
        {change}
      </Text>
    </Card>
  );
}

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  avatar?: string;
}

function NotificationItem({ title, message, time, type, avatar }: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertCircle size={16} />;
      case 'success': return <CheckCircle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'warning': return 'orange';
      case 'success': return 'green';
      default: return 'blue';
    }
  };

  return (
    <Box mb="sm">
      <Group gap="sm" align="flex-start">
        {avatar ? (
          <Avatar src={avatar} size="sm" radius="xl" />
        ) : (
          <ThemeIcon color={getColor()} variant="light" size="sm">
            {getIcon()}
          </ThemeIcon>
        )}
        <Box style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mb={4}>
            {message}
          </Text>
          <Text size="xs" c="dimmed">
            {time}
          </Text>
        </Box>
      </Group>
    </Box>
  );
}

export function Dashboard() {
  const metrics = [
    {
      title: 'Total Patients',
      value: '1,247',
      change: '+12% from last month',
      changeType: 'positive' as const,
      icon: <Users size={20} />
    },
    {
      title: 'Today\'s Sessions',
      value: '23',
      change: '+5 from yesterday',
      changeType: 'positive' as const,
      icon: <Video size={20} />
    },
    {
      title: 'Monthly Revenue',
      value: '$45,230',
      change: '+8% from last month',
      changeType: 'positive' as const,
      icon: <DollarSign size={20} />
    },
    {
      title: 'Active Tasks',
      value: '18',
      change: '-3 from yesterday',
      changeType: 'negative' as const,
      icon: <Activity size={20} />
    }
  ];

  const recentNotifications = [
    {
      title: 'New Patient Registration',
      message: 'Sarah Johnson has completed registration',
      time: '5 minutes ago',
      type: 'info' as const
    },
    {
      title: 'Appointment Reminder',
      message: 'Dr. Smith has 3 appointments in the next hour',
      time: '15 minutes ago',
      type: 'warning' as const
    },
    {
      title: 'Payment Received',
      message: 'Invoice #INV-2024-001 has been paid',
      time: '1 hour ago',
      type: 'success' as const
    },
    {
      title: 'System Update',
      message: 'Scheduled maintenance completed successfully',
      time: '2 hours ago',
      type: 'success' as const
    }
  ];

  const upcomingAppointments = [
    {
      patient: 'John Doe',
      time: '10:00 AM',
      type: 'Consultation',
      provider: 'Dr. Smith'
    },
    {
      patient: 'Jane Smith',
      time: '11:30 AM',
      type: 'Follow-up',
      provider: 'Dr. Johnson'
    },
    {
      patient: 'Mike Wilson',
      time: '2:00 PM',
      type: 'Initial Visit',
      provider: 'Dr. Brown'
    }
  ];

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} mb={4}>
              Dashboard Overview
            </Title>
            <Text c="dimmed">
              Welcome back! Here's what's happening with your practice today.
            </Text>
          </div>
          <Button leftSection={<TrendingUp size={16} />} variant="light">
            View Reports
          </Button>
        </Group>

        {/* Metrics Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </SimpleGrid>

        {/* Main Content Grid */}
        <Grid>
          {/* Analytics Section */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Patient Activity Chart */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="lg">
                  <Title order={4}>Patient Activity</Title>
                  <Badge variant="light" color="blue">
                    Last 7 days
                  </Badge>
                </Group>
                
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text size="sm">New Registrations</Text>
                    <Text size="sm" fw={500}>24</Text>
                  </Group>
                  <Progress value={75} color="blue" size="sm" />
                  
                  <Group justify="space-between">
                    <Text size="sm">Completed Sessions</Text>
                    <Text size="sm" fw={500}>156</Text>
                  </Group>
                  <Progress value={85} color="green" size="sm" />
                  
                  <Group justify="space-between">
                    <Text size="sm">Pending Orders</Text>
                    <Text size="sm" fw={500}>12</Text>
                  </Group>
                  <Progress value={30} color="orange" size="sm" />
                </Stack>
              </Card>

              {/* Upcoming Appointments */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="lg">
                  <Title order={4}>Today's Appointments</Title>
                  <ActionIcon variant="light" color="blue">
                    <Calendar size={16} />
                  </ActionIcon>
                </Group>
                
                <Stack gap="md">
                  {upcomingAppointments.map((appointment, index) => (
                    <Group key={index} justify="space-between" p="sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <div>
                        <Text size="sm" fw={500}>{appointment.patient}</Text>
                        <Text size="xs" c="dimmed">{appointment.type} with {appointment.provider}</Text>
                      </div>
                      <Group gap="xs">
                        <Badge variant="outline" size="sm">{appointment.time}</Badge>
                        <ActionIcon size="sm" variant="light">
                          <ArrowRight size={12} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                </Stack>
                
                <Divider my="md" />
                <Button variant="light" fullWidth leftSection={<Calendar size={16} />}>
                  View All Appointments
                </Button>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Notifications & Quick Actions */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Notifications Center */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="lg">
                  <Title order={4}>Recent Activity</Title>
                  <Badge variant="light" color="red">
                    4 new
                  </Badge>
                </Group>
                
                <ScrollArea h={300}>
                  <Stack gap="xs">
                    {recentNotifications.map((notification, index) => (
                      <NotificationItem key={index} {...notification} />
                    ))}
                  </Stack>
                </ScrollArea>
                
                <Divider my="md" />
                <Button variant="light" fullWidth leftSection={<Bell size={16} />}>
                  View All Notifications
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="lg">Quick Actions</Title>
                
                <Stack gap="sm">
                  <Button 
                    variant="light" 
                    fullWidth 
                    leftSection={<Users size={16} />}
                    justify="flex-start"
                  >
                    Add New Patient
                  </Button>
                  
                  <Button 
                    variant="light" 
                    fullWidth 
                    leftSection={<Calendar size={16} />}
                    justify="flex-start"
                  >
                    Schedule Session
                  </Button>
                  
                  <Button 
                    variant="light" 
                    fullWidth 
                    leftSection={<FileText size={16} />}
                    justify="flex-start"
                  >
                    Create Order
                  </Button>
                  
                  <Button 
                    variant="light" 
                    fullWidth 
                    leftSection={<MessageSquare size={16} />}
                    justify="flex-start"
                  >
                    Send Message
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}