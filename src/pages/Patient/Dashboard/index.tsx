/**
 * PatientDashboard - Main dashboard for GLP-1 patients
 * 
 * Features:
 * - Patient overview with health metrics
 * - Quick actions for common tasks
 * - Progress visualization
 * 
 * FHIR Integration:
 * - Patient resource for profile data
 * - Observation resources for health metrics
 * - MedicationRequest for current medications
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
  Button,
  Progress,
  Badge,
  Avatar,
  ActionIcon,
  SimpleGrid,
} from '@mantine/core';
import {
  IconScale,
  IconPill,
  IconMessage,
  IconCalendar,
  IconTrendingUp,
  IconHeart,
  IconActivity,
  IconPlus,
} from '@tabler/icons-react';

// Mock data for demonstration - will be replaced with FHIR data
const mockPatientData = {
  name: 'Sarah Johnson',
  currentWeight: 165,
  goalWeight: 140,
  startWeight: 185,
  lastMedication: '2024-01-15',
  nextAppointment: '2024-01-22',
  weeklyProgress: -2.5,
  adherenceRate: 95,
};

const PatientDashboard: React.FC = () => {
  const weightLossProgress = ((mockPatientData.startWeight - mockPatientData.currentWeight) / 
    (mockPatientData.startWeight - mockPatientData.goalWeight)) * 100;

  const quickActions = [
    {
      icon: <IconScale size={24} />,
      label: 'Log Weight',
      color: 'blue',
      onClick: () => console.log('Navigate to weight logging'),
    },
    {
      icon: <IconPill size={24} />,
      label: 'Log Injection',
      color: 'green',
      onClick: () => console.log('Navigate to medication logging'),
    },
    {
      icon: <IconMessage size={24} />,
      label: 'Message Provider',
      color: 'violet',
      onClick: () => console.log('Navigate to messaging'),
    },
    {
      icon: <IconCalendar size={24} />,
      label: 'Book Appointment',
      color: 'orange',
      onClick: () => console.log('Navigate to appointment booking'),
    },
  ];

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Welcome Header */}
        <Card withBorder radius="lg" p="xl">
          <Group justify="space-between">
            <Group>
              <Avatar size="lg" color="blue" radius="xl">
                {mockPatientData.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <div>
                <Title order={2}>Welcome back, {mockPatientData.name.split(' ')[0]}!</Title>
                <Text c="dimmed" size="sm">
                  Your GLP-1 treatment journey continues
                </Text>
              </div>
            </Group>
            <Badge size="lg" variant="light" color="green">
              Active Treatment
            </Badge>
          </Group>
        </Card>

        {/* Quick Actions */}
        <Card withBorder radius="lg" p="xl">
          <Title order={3} mb="md">Quick Actions</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="light"
                color={action.color}
                size="lg"
                h={80}
                onClick={action.onClick}
                leftSection={action.icon}
                styles={{
                  root: {
                    flexDirection: 'column',
                    gap: 8,
                  },
                  section: {
                    marginRight: 0,
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </SimpleGrid>
        </Card>

        {/* Health Metrics */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="lg" p="xl" h="100%">
              <Group justify="space-between" mb="md">
                <Title order={4}>Weight Progress</Title>
                <IconTrendingUp size={20} color="green" />
              </Group>
              
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Current Weight</Text>
                  <Text fw={600} size="lg">{mockPatientData.currentWeight} lbs</Text>
                </Group>
                
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Goal Weight</Text>
                  <Text fw={600}>{mockPatientData.goalWeight} lbs</Text>
                </Group>
                
                <Progress
                  value={weightLossProgress}
                  color="green"
                  size="lg"
                  radius="xl"
                />
                
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Progress</Text>
                  <Text fw={600} c="green">
                    {Math.round(weightLossProgress)}% to goal
                  </Text>
                </Group>
                
                <Badge variant="light" color="green" size="lg">
                  {mockPatientData.weeklyProgress} lbs this week
                </Badge>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="lg" p="xl" h="100%">
              <Group justify="space-between" mb="md">
                <Title order={4}>Treatment Status</Title>
                <IconHeart size={20} color="red" />
              </Group>
              
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Medication Adherence</Text>
                  <Text fw={600} c="green">{mockPatientData.adherenceRate}%</Text>
                </Group>
                
                <Progress
                  value={mockPatientData.adherenceRate}
                  color="green"
                  size="lg"
                  radius="xl"
                />
                
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Last Injection</Text>
                  <Text fw={600}>{mockPatientData.lastMedication}</Text>
                </Group>
                
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Next Appointment</Text>
                  <Text fw={600} c="blue">{mockPatientData.nextAppointment}</Text>
                </Group>
                
                <Badge variant="light" color="blue" size="lg">
                  Excellent adherence!
                </Badge>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Recent Activity */}
        <Card withBorder radius="lg" p="xl">
          <Group justify="space-between" mb="md">
            <Title order={4}>Recent Activity</Title>
            <ActionIcon variant="light" color="blue">
              <IconActivity size={16} />
            </ActionIcon>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" p="sm" style={{ borderRadius: 8, backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Group>
                <IconScale size={16} color="blue" />
                <Text size="sm">Weight logged: 165 lbs</Text>
              </Group>
              <Text size="xs" c="dimmed">Today, 8:30 AM</Text>
            </Group>
            
            <Group justify="space-between" p="sm" style={{ borderRadius: 8, backgroundColor: 'var(--mantine-color-green-0)' }}>
              <Group>
                <IconPill size={16} color="green" />
                <Text size="sm">GLP-1 injection completed</Text>
              </Group>
              <Text size="xs" c="dimmed">Yesterday, 7:00 PM</Text>
            </Group>
            
            <Group justify="space-between" p="sm" style={{ borderRadius: 8, backgroundColor: 'var(--mantine-color-violet-0)' }}>
              <Group>
                <IconMessage size={16} color="violet" />
                <Text size="sm">Message from Dr. Smith</Text>
              </Group>
              <Text size="xs" c="dimmed">2 days ago</Text>
            </Group>
          </Stack>
        </Card>

        {/* Floating Action Button for Quick Weight Entry */}
        <ActionIcon
          size={60}
          radius="xl"
          color="blue"
          variant="filled"
          style={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          onClick={() => console.log('Quick weight entry')}
        >
          <IconPlus size={24} />
        </ActionIcon>
      </Stack>
    </Container>
  );
};

export default PatientDashboard;