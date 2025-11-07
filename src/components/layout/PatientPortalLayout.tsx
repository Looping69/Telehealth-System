/**
 * PatientPortalLayout - Mobile-first layout for GLP-1 patient portal
 * 
 * Features:
 * - Mobile-first responsive design
 * - Bottom navigation for mobile
 * - Touch-friendly interface
 * - Patient-specific branding
 */

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Container,
  Group,
  Text,
  ActionIcon,
  Avatar,
  Badge,
  UnstyledButton,
  Stack,
  Box,
} from '@mantine/core';
import {
  IconHome,
  IconActivity,
  IconBook,
  IconHeadset,
  IconShoppingBag,
  IconUser,
  IconLogout,
  IconBell,
} from '@tabler/icons-react';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from '@mantine/hooks';

const PatientPortalLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navigationItems = [
    {
      icon: IconHome,
      label: 'Dashboard',
      path: '/patient/dashboard',
      color: 'blue',
    },
    {
      icon: IconActivity,
      label: 'Health',
      path: '/patient/health',
      color: 'green',
    },
    {
      icon: IconBook,
      label: 'Resources',
      path: '/patient/resources',
      color: 'violet',
    },
    {
      icon: IconHeadset,
      label: 'Support',
      path: '/patient/support',
      color: 'orange',
    },
    {
      icon: IconShoppingBag,
      label: 'Shop',
      path: '/patient/shop',
      color: 'pink',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const PatientHeader = () => (
    <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
      <Group>
        <Avatar size="sm" color="blue" radius="xl">
          {user?.name?.split(' ').map(n => n[0]).join('') || 'P'}
        </Avatar>
        <div>
          <Text size="sm" fw={500}>
            {user?.name || 'Patient'}
          </Text>
          <Badge size="xs" variant="light" color="green">
            GLP-1 Treatment
          </Badge>
        </div>
      </Group>
      
      <Group gap="xs">
        <ActionIcon variant="light" color="blue" size="sm">
          <IconBell size={16} />
        </ActionIcon>
        <ActionIcon variant="light" color="gray" size="sm" onClick={handleLogout}>
          <IconLogout size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );

  const BottomNavigation = () => (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e9ecef',
        padding: '8px 0',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        minHeight: '70px',
      }}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.path);
        
        return (
          <UnstyledButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: isActive ? `var(--mantine-color-${item.color}-0)` : 'transparent',
              minWidth: '60px',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon
              size={24}
              color={isActive ? `var(--mantine-color-${item.color}-6)` : '#6c757d'}
            />
            <Text
              size="xs"
              mt={4}
              c={isActive ? item.color : 'dimmed'}
              fw={isActive ? 600 : 400}
              ta="center"
            >
              {item.label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Box>
  );

  const DesktopSidebar = () => (
    <Stack gap="xs" p="md">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.path);
        
        return (
          <UnstyledButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: isActive ? `var(--mantine-color-${item.color}-0)` : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon
              size={20}
              color={isActive ? `var(--mantine-color-${item.color}-6)` : '#6c757d'}
            />
            <Text
              ml="md"
              size="sm"
              c={isActive ? item.color : 'dimmed'}
              fw={isActive ? 600 : 400}
            >
              {item.label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Stack>
  );

  if (isMobile) {
    return (
      <AppShell
        header={{ height: 70 }}
        padding={0}
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <AppShell.Header>
          <PatientHeader />
        </AppShell.Header>

        <AppShell.Main style={{ paddingBottom: '80px' }}>
          <Container size="sm" p="md">
            <Outlet />
          </Container>
        </AppShell.Main>

        <BottomNavigation />
      </AppShell>
    );
  }

  return (
    <AppShell
      navbar={{ width: 280, breakpoint: 'md' }}
      header={{ height: 70 }}
      padding="md"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <AppShell.Header>
        <PatientHeader />
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ borderRight: '1px solid #e9ecef' }}>
        <DesktopSidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default PatientPortalLayout;