import React from 'react';
import { Card, Group, Text, ThemeIcon } from '@mantine/core';

/**
 * SummaryMetricCard
 * Purpose: Render a standardized summary metric card matching the style guide.
 * Inputs:
 * - label: string — short descriptor shown at the top-left of the card.
 * - value: React.ReactNode — primary metric value rendered prominently.
 * - color: string — Mantine color used for the icon background and value text.
 * - icon: React.ReactNode — icon element rendered inside ThemeIcon on the top-right.
 * - helperText?: string — optional small helper line under the value.
 * Outputs:
 * - JSX.Element — a styled card component with consistent layout and theming.
 */
export interface SummaryMetricCardProps {
  label: string;
  value: React.ReactNode;
  color: string;
  icon: React.ReactNode;
  helperText?: string;
}

export const SummaryMetricCard: React.FC<SummaryMetricCardProps> = ({
  label,
  value,
  color,
  icon,
  helperText,
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="summary-card-metric">
      <Group justify="space-between" align="center" mb="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
      <Text size="xl" fw={700} c={color}>
        {value}
      </Text>
      {helperText && (
        <Text size="xs" c="dimmed" mt={4}>
          {helperText}
        </Text>
      )}
    </Card>
  );
};

export default SummaryMetricCard;