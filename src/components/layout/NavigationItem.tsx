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
  collapsed?: boolean;
}

export function NavigationItem({ 
  label, 
  icon: IconComponent, 
  isActive, 
  onClick,
  collapsed = false,
}: NavigationItemProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
        padding: collapsed ? theme.spacing.xs : theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: isActive ? '#7cb8ff' : '#c9d7f2',
        backgroundColor: isActive ? '#12284e' : 'transparent',
        transition: 'background-color 180ms ease, transform 150ms ease, color 150ms ease',
        '&:hover': {
          backgroundColor: isActive ? '#12284e' : '#0a1a36',
          color: isActive ? '#e6edf7' : '#e6edf7',
          transform: collapsed ? 'scale(1.03)' : 'translateX(2px)',
        },
      })}
    >
      <Group gap={collapsed ? 0 : 'sm'} justify={collapsed ? 'center' : 'flex-start'}>
        <ThemeIcon
          variant={isActive ? 'light' : 'subtle'}
          color={isActive ? 'blue' : 'indigo'}
          size={collapsed ? 'md' : 'sm'}
        >
          <IconComponent size={collapsed ? 18 : 16} />
        </ThemeIcon>
        {!collapsed && (
          <Text size="sm" fw={isActive ? 500 : 400} c={isActive ? '#e6edf7' : '#c9d7f2'}
            style={{ transition: 'color 150ms ease' }}
          >
            {label}
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
}