/**
 * Main application layout component
 * Provides sidebar navigation, header, and content area with responsive design
 */

import React, { useState } from 'react';
import {
  AppShell,
  Text,
  Group,
  Avatar,
  Menu,
  Burger,
  ScrollArea,
  Stack,
  Divider,
  Badge,
  Button,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
  Video,
  FolderOpen,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  CheckSquare,
  Shield,
  MessageSquare,
  UserCheck,
  Building2,
  Tag,
  Percent,
  Package,
  BookOpen,
  Cog,
  FileSearch,
  LucideIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NavigationItem } from './NavigationItem';
import { getNavigationItems } from '../../utils/permissions';

export function AppLayout() {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavigationItemData {
    path: string;
    label: string;
    icon: LucideIcon;
    category: string;
  }

  // Icon mapping for navigation items
  const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Calendar: Video, // Using Video icon for Sessions
    FileText,
    ShoppingCart: FileText, // Using FileText icon for Orders
    Receipt: CreditCard, // Using CreditCard icon for Invoices
    CheckSquare,
    Shield,
    MessageSquare,
    UserCheck,
    Building: Building2, // Using Building2 icon for Pharmacies
    Tag,
    Percent,
    Package,
    BookOpen: FolderOpen, // Using FolderOpen icon for Resources
    Settings,
    FileSearch,
  };

  // Get navigation items based on user role and permissions
  const allowedNavItems = user?.role ? getNavigationItems(user.role) : [];
  
  // Map allowed navigation items to our component format with icons and categories
  const navigationItems: NavigationItemData[] = allowedNavItems.map(item => {
    const icon = iconMap[item.icon] || FileText; // Fallback to FileText icon
    
    // Determine category based on the item path/module
    let category = 'overview';
    if (['patients', 'sessions'].includes(item.module)) {
      category = 'patientCare';
    } else if (['orders', 'invoices', 'insurance'].includes(item.module)) {
      category = 'ordersBilling';
    } else if (['tasks', 'messages', 'providers', 'pharmacies'].includes(item.module)) {
      category = 'management';
    } else if (['forms', 'tags', 'discounts', 'products', 'resources'].includes(item.module)) {
      category = 'productsContent';
    } else if (['settings', 'audit'].includes(item.module)) {
      category = 'admin';
    }
    
    return {
      path: item.path,
      label: item.label,
      icon,
      category,
    };
  });

  // Group navigation items by category
  const groupedNavigation = {
    overview: navigationItems.filter(item => item.category === 'overview'),
    patientCare: navigationItems.filter(item => item.category === 'patientCare'),
    ordersBilling: navigationItems.filter(item => item.category === 'ordersBilling'),
    management: navigationItems.filter(item => item.category === 'management'),
    admin: navigationItems.filter(item => item.category === 'admin'),
    productsContent: navigationItems.filter(item => item.category === 'productsContent'),
    system: navigationItems.filter(item => item.category === 'system'),
  };

  const renderNavigationGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    
    return (
      <div key={title}>
        <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb="xs" px="md">
          {title}
        </Text>
        <Stack gap={2}>
          {items.map((item) => (
            <NavigationItem
              key={item.path}
              path={item.path}
              label={item.label}
              icon={item.icon}
              isActive={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (opened) toggle();
              }}
            />
          ))}
        </Stack>
      </div>
    );
  };

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      header={{ height: 70 }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              color={theme.colors.gray[6]}
              hiddenFrom="sm"
            />
            
            <Group gap="xs">
              <Heart size={28} color="#2563eb" />
              <Text size="xl" fw={700} c="#2563eb">
                Telehealth Dashboard
              </Text>
            </Group>
          </Group>

          <Group>
            {/* Notifications */}
            <Button variant="subtle" size="sm" p="xs">
              <Bell size={18} />
            </Button>

            {/* User Menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Avatar size={32} color="blue">
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {user?.name || 'User'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {user?.role?.replace('_', ' ') || 'User'}
                      </Text>
                    </div>
                    <ChevronDown size={14} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<User size={14} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<Settings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<LogOut size={14} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Sidebar Navigation */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="xl">
            {/* Navigation Groups */}
            <Stack gap="lg">
              {renderNavigationGroup('Overview', groupedNavigation.overview)}
              {renderNavigationGroup('Patient Care', groupedNavigation.patientCare)}
              {renderNavigationGroup('Orders & Billing', groupedNavigation.ordersBilling)}
              {renderNavigationGroup('Management', groupedNavigation.management)}
              {renderNavigationGroup('Admin', groupedNavigation.admin)}
              {renderNavigationGroup('Products & Content', groupedNavigation.productsContent)}
              {renderNavigationGroup('System', groupedNavigation.system)}
            </Stack>
          </Stack>
        </AppShell.Section>

        {/* Footer */}
        <AppShell.Section>
          <Divider mb="md" />
          <Group justify="center">
            <Text size="xs" c="dimmed">
              Telehealth Dashboard v1.0
            </Text>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}