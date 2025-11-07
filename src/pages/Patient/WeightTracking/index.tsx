/**
 * WeightTracking - Weight logging and visualization for GLP-1 patients
 * 
 * Features:
 * - Weight entry form with validation
 * - Historical weight chart
 * - Progress analytics
 * 
 * FHIR Integration:
 * - Creates Observation resources for weight measurements
 * - Links to Patient resource
 * - Supports trending and analytics
 */

import React, { useState } from 'react';
import {
  Container,
  Card,
  Title,
  Stack,
  Group,
  Button,
  NumberInput,
  Text,
  Badge,
  Grid,
  ActionIcon,
  Modal,
  Textarea,
  Select,
  Alert,
} from '@mantine/core';
import {
  IconScale,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconPlus,
  IconInfoCircle,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';

// Mock weight data - will be replaced with FHIR Observation resources
const mockWeightHistory = [
  { date: '2024-01-15', weight: 165, note: 'Feeling great!' },
  { date: '2024-01-08', weight: 167.5, note: '' },
  { date: '2024-01-01', weight: 170, note: 'New year, new goals' },
  { date: '2023-12-25', weight: 172, note: 'Holiday weight' },
  { date: '2023-12-18', weight: 169, note: '' },
];

const WeightTracking: React.FC = () => {
  const [newWeight, setNewWeight] = useState<number | string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [note, setNote] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<string | null>('morning');
  const [modalOpened, setModalOpened] = useState(false);

  const handleSubmit = () => {
    if (!newWeight || !selectedDate) return;
    
    // TODO: Create FHIR Observation resource
    console.log('Creating weight observation:', {
      weight: newWeight,
      date: selectedDate,
      note,
      timeOfDay,
    });
    
    // Reset form
    setNewWeight('');
    setNote('');
    setModalOpened(false);
  };

  const latestWeight = mockWeightHistory[0];
  const previousWeight = mockWeightHistory[1];
  const weightChange = latestWeight.weight - previousWeight.weight;
  const totalWeightLoss = 185 - latestWeight.weight; // Starting weight - current

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>Weight Tracking</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Log Weight
          </Button>
        </Group>

        {/* Current Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="lg" p="lg" ta="center">
              <IconScale size={32} color="blue" style={{ margin: '0 auto 8px' }} />
              <Text size="xl" fw={700}>{latestWeight.weight} lbs</Text>
              <Text size="sm" c="dimmed">Current Weight</Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="lg" p="lg" ta="center">
              {weightChange < 0 ? (
                <IconTrendingDown size={32} color="green" style={{ margin: '0 auto 8px' }} />
              ) : (
                <IconTrendingUp size={32} color="red" style={{ margin: '0 auto 8px' }} />
              )}
              <Text size="xl" fw={700} c={weightChange < 0 ? 'green' : 'red'}>
                {weightChange > 0 ? '+' : ''}{weightChange} lbs
              </Text>
              <Text size="sm" c="dimmed">This Week</Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="lg" p="lg" ta="center">
              <IconTrendingDown size={32} color="green" style={{ margin: '0 auto 8px' }} />
              <Text size="xl" fw={700} c="green">-{totalWeightLoss} lbs</Text>
              <Text size="sm" c="dimmed">Total Loss</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Progress Alert */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Great Progress!"
          color="green"
          variant="light"
        >
          You've lost {totalWeightLoss} pounds since starting your GLP-1 treatment. 
          Keep up the excellent work!
        </Alert>

        {/* Weight History */}
        <Card withBorder radius="lg" p="xl">
          <Title order={4} mb="md">Recent Entries</Title>
          <Stack gap="md">
            {mockWeightHistory.map((entry, index) => (
              <Group key={index} justify="space-between" p="md" style={{ 
                borderRadius: 8, 
                backgroundColor: index === 0 ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-gray-0)' 
              }}>
                <Group>
                  <IconCalendar size={16} />
                  <div>
                    <Text fw={500}>{entry.weight} lbs</Text>
                    <Text size="sm" c="dimmed">{entry.date}</Text>
                  </div>
                </Group>
                <div style={{ textAlign: 'right' }}>
                  {index > 0 && (
                    <Badge
                      color={entry.weight < mockWeightHistory[index - 1].weight ? 'green' : 'red'}
                      variant="light"
                      size="sm"
                    >
                      {entry.weight < mockWeightHistory[index - 1].weight ? '-' : '+'}
                      {Math.abs(entry.weight - mockWeightHistory[index - 1].weight).toFixed(1)} lbs
                    </Badge>
                  )}
                  {entry.note && (
                    <Text size="xs" c="dimmed" mt={4}>
                      "{entry.note}"
                    </Text>
                  )}
                </div>
              </Group>
            ))}
          </Stack>
        </Card>

        {/* Weight Entry Modal */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Log Your Weight"
          size="md"
        >
          <Stack gap="md">
            <NumberInput
              label="Weight (lbs)"
              placeholder="Enter your weight"
              value={newWeight}
              onChange={setNewWeight}
              min={50}
              max={500}
              decimalScale={1}
              required
              leftSection={<IconScale size={16} />}
            />
            
            <DateInput
              label="Date"
              placeholder="Select date"
              value={selectedDate}
              onChange={setSelectedDate}
              maxDate={new Date()}
              required
              leftSection={<IconCalendar size={16} />}
            />
            
            <Select
              label="Time of Day"
              placeholder="Select time"
              value={timeOfDay}
              onChange={setTimeOfDay}
              data={[
                { value: 'morning', label: 'Morning (before breakfast)' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'evening', label: 'Evening (before dinner)' },
                { value: 'night', label: 'Night (before bed)' },
              ]}
            />
            
            <Textarea
              label="Notes (optional)"
              placeholder="How are you feeling? Any observations?"
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
              minRows={2}
              maxRows={4}
            />
            
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!newWeight || !selectedDate}>
                Save Weight
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default WeightTracking;