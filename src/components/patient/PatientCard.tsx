import React from 'react';
import { Card, Group, Text, Badge, ActionIcon, Stack } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

/**
 * PatientCard Component
 * 
 * Purpose: Reusable card component for patient portal interfaces
 * Features:
 * - Mobile-optimized touch targets
 * - Consistent styling across patient portal
 * - Optional badges and actions
 * - Accessible design with proper contrast
 * 
 * Inputs:
 * - title: Card title text
 * - description: Optional description text
 * - badge: Optional badge configuration
 * - onClick: Optional click handler
 * - children: Optional additional content
 * - variant: Card style variant
 * 
 * Outputs: Renders a styled card component
 */

interface BadgeConfig {
  text: string;
  color?: string;
  variant?: 'light' | 'filled' | 'outline';
}

interface PatientCardProps {
  title: string;
  description?: string;
  badge?: BadgeConfig;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'interactive' | 'compact';
  rightSection?: React.ReactNode;
}

const PatientCard: React.FC<PatientCardProps> = ({
  title,
  description,
  badge,
  onClick,
  children,
  variant = 'default',
  rightSection
}) => {
  const isInteractive = onClick || variant === 'interactive';
  const isCompact = variant === 'compact';

  return (
    <Card
      withBorder
      padding={isCompact ? 'sm' : 'md'}
      radius="md"
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        minHeight: isCompact ? 'auto' : '80px',
        ...(isInteractive && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        })
      }}
      onClick={onClick}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={isCompact ? 'xs' : 'sm'} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center" wrap="nowrap">
            <Text 
              fw={500} 
              size={isCompact ? 'sm' : 'md'}
              lineClamp={1}
              style={{ flex: 1 }}
            >
              {title}
            </Text>
            {badge && (
              <Badge
                size={isCompact ? 'xs' : 'sm'}
                color={badge.color || 'blue'}
                variant={badge.variant || 'light'}
              >
                {badge.text}
              </Badge>
            )}
          </Group>
          
          {description && (
            <Text 
              size={isCompact ? 'xs' : 'sm'} 
              c="dimmed" 
              lineClamp={isCompact ? 1 : 2}
            >
              {description}
            </Text>
          )}
          
          {children}
        </Stack>
        
        {rightSection || (isInteractive && (
          <ActionIcon 
            variant="subtle" 
            color="gray"
            size={isCompact ? 'sm' : 'md'}
            style={{ flexShrink: 0 }}
          >
            <IconChevronRight size={isCompact ? '1rem' : '1.2rem'} />
          </ActionIcon>
        ))}
      </Group>
    </Card>
  );
};

export default PatientCard;