/**
 * PatientsExample Page
 * Purpose: Demonstrates retrieving patients via backend FHIR API using the provided FHIR Patient structure.
 * Inputs: None (internally uses `usePatients` hook with default params)
 * Outputs: Renders a list of FHIR Patient resources or appropriate loading/error states
 */
import React from 'react';
import { Card, Group, Title, Text, Divider, Button } from '@mantine/core';
import { usePatients } from '../hooks/useBackendFHIR';

/**
 * formatPatientName
 * Purpose: Format FHIR Patient name for display
 * Inputs: `name` array from Patient resource
 * Outputs: String display name
 */
function formatPatientName(name?: Array<{ given?: string[]; family?: string }>): string {
  if (!name || name.length === 0) return 'Unknown';
  const primary = name[0];
  const given = (primary.given ?? []).join(' ');
  const family = primary.family ?? '';
  const full = `${given} ${family}`.trim();
  return full || 'Unknown';
}

/**
 * PatientCard
 * Purpose: Render a single Patient resource in a card
 * Inputs: `patient`: any FHIR Patient
 * Outputs: JSX Card displaying key Patient fields
 */
function PatientCard({ patient }: { patient: any }) {
  return (
    <Card shadow="sm" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Title order={4}>{formatPatientName(patient?.name)}</Title>
        {patient?.id && <Text size="sm" c="dimmed">ID: {patient.id}</Text>}
      </Group>
      <Divider my="sm" />
      <Text>Gender: {patient?.gender ?? 'unknown'}</Text>
      {patient?.birthDate && <Text>Birth Date: {patient.birthDate}</Text>}
      {patient?.active !== undefined && <Text>Active: {String(patient.active)}</Text>}
    </Card>
  );
}

/**
 * PatientsExample
 * Purpose: Fetch and display patients via backend FHIR service.
 * Inputs: none
 * Outputs: UI rendering list of patients or helpful messages
 */
export default function PatientsExample(): JSX.Element {
  const { data, isLoading, isError, error, refetch } = usePatients({ page: 1, limit: 10 });

  if (isLoading) {
    return (
      <Group justify="center" p="lg">
        <Text>Loading patients…</Text>
      </Group>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return (
      <Card p="lg" radius="md" withBorder>
        <Title order={3}>Failed to load patients</Title>
        <Text c="red">{msg}</Text>
        <Button mt="md" onClick={() => refetch()}>Retry</Button>
      </Card>
    );
  }

  const patients = data?.data ?? [];

  return (
    <Card p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={2}>Patients (FHIR)</Title>
        <Button variant="light" onClick={() => refetch()}>Refresh</Button>
      </Group>
      {patients.length === 0 ? (
        <Text>No patients found. If you’re in demo mode, seed users or create a Patient.</Text>
      ) : (
        <Group gap="md">
          {patients.map((p: any) => (
            <PatientCard key={p.id ?? Math.random()} patient={p} />
          ))}
        </Group>
      )}
    </Card>
  );
}