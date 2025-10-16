/**
 * Mode Indicator Component
 * Shows visual indicators for the current mode (Mock/FHIR) on pages
 */

import React from 'react';
import { Alert, Badge, Group, Text } from '@mantine/core';
import { Database, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { useMode } from '../../contexts/ModeContext';

interface ModeIndicatorProps {
  variant?: 'alert' | 'badge' | 'inline';
  showDescription?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({ 
  variant = 'badge',
  showDescription = false,
  size = 'sm'
}) => {
  const { mode } = useMode();

  if (variant === 'alert') {
    return (
      <Alert
        icon={mode === 'fhir' ? <Database size={16} /> : <TestTube size={16} />}
        color={mode === 'fhir' ? 'green' : 'blue'}
        variant="light"
        title={mode === 'fhir' ? 'Live FHIR Data' : 'Mock Data Mode'}
      >
        {mode === 'fhir' 
          ? 'This page is displaying real-time data from your FHIR server.'
          : 'This page is displaying simulated data for demonstration purposes.'
        }
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <Group gap="xs" align="center">
        {mode === 'fhir' ? (
          <CheckCircle size={14} color="#10b981" />
        ) : (
          <AlertCircle size={14} color="#3b82f6" />
        )}
        <Text size={size} c={mode === 'fhir' ? 'green' : 'blue'} fw={500}>
          {mode === 'fhir' ? 'Live FHIR' : 'Mock Data'}
        </Text>
        {showDescription && (
          <Text size="xs" c="dimmed">
            {mode === 'fhir' ? '(Real-time)' : '(Simulated)'}
          </Text>
        )}
      </Group>
    );
  }

  // Default badge variant
  return (
    <Badge
      color={mode === 'fhir' ? 'green' : 'blue'}
      variant="light"
      size={size}
      leftSection={mode === 'fhir' ? <Database size={12} /> : <TestTube size={12} />}
    >
      {mode === 'fhir' ? 'Live FHIR Data' : 'Mock Data'}
    </Badge>
  );
};