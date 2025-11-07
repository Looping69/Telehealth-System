import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Group, 
  Stack, 
  Button, 
  Grid, 
  Badge,
  Progress,
  ActionIcon,
  Tabs,
  Alert,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Divider,
  RingProgress,
  Center
} from '@mantine/core';
import { PatientCard, PatientButton, PatientForm, PatientFormField, PatientTextInput, PatientNumberInput, PatientSelect } from '@/components/patient';
import { 
  IconHeart, 
  IconScale, 
  IconPill, 
  IconActivity, 
  IconPlus, 
  IconTrendingUp,
  IconAlertTriangle,
  IconCheck,
  IconCalendar,
  IconClock,
  IconDroplet,
  IconThermometer
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

/**
 * PatientHealth Component
 * 
 * Purpose: Main health tracking hub for GLP-1 patients
 * Features:
 * - Vital signs tracking (weight, blood pressure, glucose)
 * - Medication logging and adherence
 * - Side effects reporting
 * - Progress visualization
 * - Quick action buttons for common tasks
 * 
 * Inputs: None (uses patient context from auth store)
 * Outputs: Renders health tracking interface with data entry forms
 */
const PatientHealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [medicationModalOpened, { open: openMedicationModal, close: closeMedicationModal }] = useDisclosure(false);
  const [vitalsModalOpened, { open: openVitalsModal, close: closeVitalsModal }] = useDisclosure(false);
  const [sideEffectsModalOpened, { open: openSideEffectsModal, close: closeSideEffectsModal }] = useDisclosure(false);

  // Mock data - will be replaced with FHIR hooks
  const healthMetrics = {
    weight: { current: 185, target: 170, change: -8 },
    bloodPressure: { systolic: 128, diastolic: 82, status: 'normal' },
    glucose: { current: 95, target: 100, status: 'good' },
    medicationAdherence: 85
  };

  const recentVitals = [
    { date: '2024-01-15', weight: 185, bp: '128/82', glucose: 95 },
    { date: '2024-01-14', weight: 186, bp: '130/84', glucose: 98 },
    { date: '2024-01-13', weight: 187, bp: '125/80', glucose: 92 }
  ];

  const medications = [
    { 
      name: 'Semaglutide', 
      dose: '0.5mg', 
      frequency: 'Weekly', 
      nextDose: '2024-01-16',
      adherence: 90
    },
    { 
      name: 'Metformin', 
      dose: '500mg', 
      frequency: 'Twice daily', 
      nextDose: '2024-01-15',
      adherence: 80
    }
  ];

  const sideEffects = [
    { date: '2024-01-14', effect: 'Mild nausea', severity: 'mild', resolved: true },
    { date: '2024-01-12', effect: 'Fatigue', severity: 'moderate', resolved: false }
  ];

  const handleLogMedication = () => {
    // TODO: Implement medication logging with FHIR
    closeMedicationModal();
  };

  const handleLogVitals = () => {
    // TODO: Implement vitals logging with FHIR
    closeVitalsModal();
  };

  const handleReportSideEffect = () => {
    // TODO: Implement side effect reporting with FHIR
    closeSideEffectsModal();
  };

  return (
    <Container size="lg" p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} mb="xs">Health Tracking</Title>
            <Text c="dimmed" size="sm">Monitor your GLP-1 treatment progress</Text>
          </div>
          <Group gap="xs">
            <Button 
              leftSection={<IconPlus size="1rem" />} 
              size="sm"
              onClick={openVitalsModal}
            >
              Log Vitals
            </Button>
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="overview" leftSection={<IconActivity size="1rem" />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="vitals" leftSection={<IconHeart size="1rem" />}>
              Vitals
            </Tabs.Tab>
            <Tabs.Tab value="medications" leftSection={<IconPill size="1rem" />}>
              Medications
            </Tabs.Tab>
            <Tabs.Tab value="side-effects" leftSection={<IconAlertTriangle size="1rem" />}>
              Side Effects
            </Tabs.Tab>
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Panel value="overview" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <PatientCard
                  title="Weight Progress"
                  description="Last 30 days"
                  badge={{ text: "-8.2 lbs", color: "green" }}
                >
                  <Progress value={65} color="green" size="lg" mb="xs" />
                  <Text size="sm" c="dimmed">65% to goal weight</Text>
                </PatientCard>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Card withBorder p="lg">
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconPill size="1.2rem" color="green" />
                      <Text fw={500}>Medication Adherence</Text>
                    </Group>
                    <Badge color="green" variant="light">
                      {healthMetrics.medicationAdherence}%
                    </Badge>
                  </Group>
                  <Text size="xl" fw={700} mb="xs">
                    On Track
                  </Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Last dose: Today 8:00 AM
                  </Text>
                  <Progress 
                    value={healthMetrics.medicationAdherence} 
                    color="green" 
                    size="sm" 
                  />
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <PatientCard
                  title="Blood Pressure"
                  badge={{ text: "Normal", color: "green" }}
                >
                  <Text size="xl" fw={700} mb="xs">
                    {healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Last reading: Today
                  </Text>
                </PatientCard>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Card withBorder p="lg">
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconDroplet size="1.2rem" color="orange" />
                      <Text fw={500}>Blood Glucose</Text>
                    </Group>
                    <Badge color="green" variant="light">
                      Good
                    </Badge>
                  </Group>
                  <Text size="xl" fw={700} mb="xs">
                    {healthMetrics.glucose.current} mg/dL
                  </Text>
                  <Text size="sm" c="dimmed">
                    Target: &lt; {healthMetrics.glucose.target} mg/dL
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Quick Actions */}
            <Grid>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <PatientButton
                  fullWidth
                  patientVariant="secondary"
                  size="lg"
                  leftSection={<IconPlus size="1.2rem" />}
                  onClick={openVitalsModal}
                  style={{ minHeight: '80px' }}
                >
                  <Stack gap="xs" align="center">
                    <Text size="sm" fw={500}>Log Vitals</Text>
                  </Stack>
                </PatientButton>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <PatientButton
                  fullWidth
                  patientVariant="secondary"
                  size="lg"
                  leftSection={<IconPill size="1.2rem" />}
                  onClick={openMedicationModal}
                  style={{ minHeight: '80px' }}
                >
                  <Stack gap="xs" align="center">
                    <Text size="sm" fw={500}>Log Medication</Text>
                  </Stack>
                </PatientButton>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <PatientButton
                  fullWidth
                  patientVariant="secondary"
                  size="lg"
                  leftSection={<IconAlertTriangle size="1.2rem" />}
                  onClick={openSideEffectsModal}
                  style={{ minHeight: '80px' }}
                >
                  <Stack gap="xs" align="center">
                    <Text size="sm" fw={500}>Report Side Effects</Text>
                  </Stack>
                </PatientButton>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <PatientButton
                  fullWidth
                  patientVariant="secondary"
                  size="lg"
                  leftSection={<IconTrendingUp size="1.2rem" />}
                  style={{ minHeight: '80px' }}
                >
                  <Stack gap="xs" align="center">
                    <Text size="sm" fw={500}>View Progress</Text>
                  </Stack>
                </PatientButton>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Vitals Tab */}
          <Tabs.Panel value="vitals" pt="md">
            <Stack gap="md">
              {recentVitals.map((vital, index) => (
                <Card key={index} withBorder p="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{vital.date}</Text>
                      <Group gap="lg" mt="xs">
                        <Group gap="xs">
                          <IconScale size="1rem" />
                          <Text size="sm">{vital.weight} lbs</Text>
                        </Group>
                        <Group gap="xs">
                          <IconHeart size="1rem" />
                          <Text size="sm">{vital.bp} mmHg</Text>
                        </Group>
                        <Group gap="xs">
                          <IconDroplet size="1rem" />
                          <Text size="sm">{vital.glucose} mg/dL</Text>
                        </Group>
                      </Group>
                    </div>
                    <ActionIcon variant="light" color="blue">
                      <IconTrendingUp size="1rem" />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          {/* Medications Tab */}
          <Tabs.Panel value="medications" pt="md">
            <Stack gap="md">
              {medications.map((med, index) => (
                <Card key={index} withBorder p="md">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{med.name}</Text>
                        <Badge color="blue" variant="light">
                          {med.adherence}% adherence
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed" mb="xs">
                        {med.dose} • {med.frequency}
                      </Text>
                      <Group gap="xs">
                        <IconCalendar size="0.9rem" />
                        <Text size="sm">Next dose: {med.nextDose}</Text>
                      </Group>
                    </div>
                    <Button size="xs" variant="light">
                      Take Now
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          {/* Side Effects Tab */}
          <Tabs.Panel value="side-effects" pt="md">
            <Stack gap="md">
              {sideEffects.length === 0 ? (
                <Alert color="green" icon={<IconCheck size="1rem" />}>
                  No side effects reported recently. Keep monitoring your symptoms.
                </Alert>
              ) : (
                sideEffects.map((effect, index) => (
                  <Card key={index} withBorder p="md">
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Group gap="xs" mb="xs">
                          <Text fw={500}>{effect.effect}</Text>
                          <Badge 
                            color={effect.severity === 'mild' ? 'yellow' : effect.severity === 'moderate' ? 'orange' : 'red'}
                            variant="light"
                          >
                            {effect.severity}
                          </Badge>
                          {effect.resolved && (
                            <Badge color="green" variant="light">
                              Resolved
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" c="dimmed">{effect.date}</Text>
                      </div>
                    </Group>
                  </Card>
                ))
              )}
              <Button 
                leftSection={<IconPlus size="1rem" />} 
                variant="light"
                onClick={openSideEffectsModal}
              >
                Report New Side Effect
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Modals */}
        <Modal opened={vitalsModalOpened} onClose={closeVitalsModal} title="Log Vitals" centered>
          <Stack gap="md">
            <NumberInput
              label="Weight (lbs)"
              placeholder="Enter your weight"
              min={50}
              max={500}
            />
            <Group grow>
              <NumberInput
                label="Systolic BP"
                placeholder="120"
                min={70}
                max={200}
              />
              <NumberInput
                label="Diastolic BP"
                placeholder="80"
                min={40}
                max={120}
              />
            </Group>
            <NumberInput
              label="Blood Glucose (mg/dL)"
              placeholder="Enter glucose level"
              min={50}
              max={400}
            />
            <NumberInput
              label="Temperature (°F)"
              placeholder="98.6"
              min={95}
              max={110}
              step={0.1}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeVitalsModal}>
                Cancel
              </Button>
              <Button onClick={handleLogVitals}>
                Save Vitals
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={medicationModalOpened} onClose={closeMedicationModal} title="Log Medication" centered>
          <Stack gap="md">
            <Select
              label="Medication"
              placeholder="Select medication"
              data={medications.map(med => ({ value: med.name, label: `${med.name} (${med.dose})` }))}
            />
            <TextInput
              label="Time Taken"
              placeholder="e.g., 8:00 AM"
            />
            <Textarea
              label="Notes (optional)"
              placeholder="Any observations or notes..."
              rows={3}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeMedicationModal}>
                Cancel
              </Button>
              <Button onClick={handleLogMedication}>
                Log Medication
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={sideEffectsModalOpened} onClose={closeSideEffectsModal} title="Report Side Effect" centered>
          <Stack gap="md">
            <TextInput
              label="Side Effect"
              placeholder="e.g., Nausea, Fatigue, Headache"
              required
            />
            <Select
              label="Severity"
              placeholder="Select severity"
              data={[
                { value: 'mild', label: 'Mild - Barely noticeable' },
                { value: 'moderate', label: 'Moderate - Noticeable but manageable' },
                { value: 'severe', label: 'Severe - Significantly impacts daily activities' }
              ]}
              required
            />
            <Textarea
              label="Description"
              placeholder="Describe the side effect in detail..."
              rows={4}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeSideEffectsModal}>
                Cancel
              </Button>
              <Button onClick={handleReportSideEffect}>
                Report Side Effect
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default PatientHealth;