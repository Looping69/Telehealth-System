/**
 * Navigation item component
 * Individual navigation link with icon and active state styling
 */

import React from 'react';
import { UnstyledButton, Group, Text, ThemeIcon } from '@mantine/core';
import { LucideIcon } from 'lucide-react';

interface NavigationItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function NavigationItem({ 
  label, 
  icon: IconComponent, 
  isActive, 
  onClick 
}: NavigationItemProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: isActive ? '#2563eb' : theme.colors.gray[7],
        backgroundColor: isActive ? '#eff6ff' : 'transparent',
        '&:hover': {
          backgroundColor: isActive ? '#eff6ff' : theme.colors.gray[0],
        },
      })}
    >
      <Group gap="sm">
        <ThemeIcon
          variant={isActive ? 'light' : 'subtle'}
          color={isActive ? '#2563eb' : 'gray'}
          size="sm"
        >
          <IconComponent size={16} />
        </ThemeIcon>
        <Text size="sm" fw={isActive ? 500 : 400}>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}