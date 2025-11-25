/**
 * Mode Switcher Component
 * Allows users to toggle between Mock Data and Live FHIR modes
 */

import React from 'react';
import { Group, Switch, Text, Badge, Tooltip } from '@mantine/core';
import { Database, TestTube } from 'lucide-react';
import { useMode } from '../../contexts/ModeContext';

interface ModeSwitcherProps {
  // Control the visual size of labels; supports Mantine text sizes
  // Inputs: 'xs' | 'sm' | 'md' | 'lg'
  // Output: Adjusted typography and spacing
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'compact';
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ 
  size = 'md', 
  showLabel = true,
  variant = 'default'
}) => {
  const { mode, toggleMode } = useMode();

  if (variant === 'compact') {
    return (
      <Tooltip 
        label={mode === 'fhir' ? 'Switch to Mock Data' : 'Switch to Live FHIR'}
        position="bottom"
      >
        <Badge
          color={mode === 'fhir' ? 'green' : 'blue'}
          variant="light"
          style={{ cursor: 'pointer' }}
          onClick={toggleMode}
          leftSection={mode === 'fhir' ? <Database size={12} /> : <TestTube size={12} />}
        >
          {mode === 'fhir' ? 'Live FHIR' : 'Mock Data'}
        </Badge>
      </Tooltip>
    );
  }

  return (
    <Group gap="sm" align="center">
      {showLabel && (
        <Group gap="xs">
          <TestTube size={16} color={mode === 'mock' ? '#3b82f6' : '#9ca3af'} />
          <Text 
            size={size} 
            c={mode === 'mock' ? 'blue' : 'dimmed'}
            fw={mode === 'mock' ? 500 : 400}
          >
            Mock
          </Text>
        </Group>
      )}
      
      <Switch
        checked={mode === 'fhir'}
        onChange={toggleMode}
        size={size}
        color="green"
        thumbIcon={
          mode === 'fhir' ? (
            <Database size={12} color="white" />
          ) : (
            <TestTube size={12} color="gray" />
          )
        }
      />
      
      {showLabel && (
        <Group gap="xs">
          <Database size={16} color={mode === 'fhir' ? '#10b981' : '#9ca3af'} />
          <Text 
            size={size} 
            c={mode === 'fhir' ? 'green' : 'dimmed'}
            fw={mode === 'fhir' ? 500 : 400}
          >
            FHIR
          </Text>
        </Group>
      )}
    </Group>
  );
};