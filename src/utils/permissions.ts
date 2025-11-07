/**
 * Role-based access control utilities
 * Defines permissions for different user roles and provides helper functions
 */

import { UserRole } from '../types';

export interface Permission {
  module: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'health', actions: ['read', 'update'] },
    { module: 'resources', actions: ['read'] },
    { module: 'support', actions: ['create', 'read', 'update'] },
    { module: 'shop', actions: ['read', 'create'] },
  ],
  
  super_admin: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'patients', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'sessions', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'forms', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'form-builder', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'orders', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'insurance', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'messages', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'providers', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'pharmacies', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'tags', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'discounts', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'resources', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'settings', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'audit', actions: ['read'] },
  ],
  
  healthcare_provider: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'patients', actions: ['create', 'read', 'update'] },
    { module: 'sessions', actions: ['create', 'read', 'update'] },
    { module: 'forms', actions: ['create', 'read', 'update'] },
    { module: 'form-builder', actions: ['create', 'read', 'update'] },
    { module: 'orders', actions: ['create', 'read', 'update'] },
    { module: 'tasks', actions: ['create', 'read', 'update'] },
    { module: 'messages', actions: ['create', 'read', 'update'] },
    { module: 'resources', actions: ['read'] },
  ],
  
  practice_manager: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'patients', actions: ['read', 'update'] },
    { module: 'sessions', actions: ['read', 'update'] },
    { module: 'forms', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'form-builder', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'orders', actions: ['read', 'update'] },
    { module: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'insurance', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'messages', actions: ['create', 'read', 'update'] },
    { module: 'providers', actions: ['create', 'read', 'update'] },
    { module: 'pharmacies', actions: ['create', 'read', 'update'] },
    { module: 'discounts', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'products', actions: ['read', 'update'] },
    { module: 'settings', actions: ['read', 'update'] },
  ],
  
  receptionist: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'patients', actions: ['create', 'read', 'update'] },
    { module: 'sessions', actions: ['create', 'read', 'update'] },
    { module: 'forms', actions: ['create', 'read', 'update'] },
    { module: 'tasks', actions: ['read', 'update'] },
    { module: 'messages', actions: ['create', 'read', 'update'] },
  ],
  
  billing_specialist: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'patients', actions: ['read'] },
    { module: 'orders', actions: ['read', 'update'] },
    { module: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'insurance', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'tasks', actions: ['read', 'update'] },
  ],
};

/**
 * Check if a user role has permission to perform an action on a module
 */
export function hasPermission(
  userRole: UserRole,
  module: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  const modulePermission = permissions.find(p => p.module === module);
  const result = modulePermission?.actions.includes(action) || false;
  
  console.log(`hasPermission(${userRole}, ${module}, ${action}) = ${result}`);
  if (!modulePermission) {
    console.log(`No module permission found for ${module} in role ${userRole}`);
  }
  
  return result;
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routeModuleMap: Record<string, string> = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/patients': 'patients',
    '/sessions': 'sessions',
    '/forms': 'forms',
    '/orders': 'orders',
    '/invoices': 'invoices',
    '/tasks': 'tasks',
    '/insurance': 'insurance',
    '/messages': 'messages',
    '/providers': 'providers',
    '/pharmacies': 'pharmacies',
    '/tags': 'tags',
    '/discounts': 'discounts',
    '/products': 'products',
    '/resources': 'resources',
    '/settings': 'settings',
    '/audit': 'audit',
  };

  const module = routeModuleMap[route];
  if (!module) return false;

  return hasPermission(userRole, module, 'read');
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole: UserRole) {
  const allItems = [
    { path: '/', label: 'Dashboard', module: 'dashboard', icon: 'LayoutDashboard' },
    { path: '/patients', label: 'Patients', module: 'patients', icon: 'Users' },
    { path: '/sessions', label: 'Sessions', module: 'sessions', icon: 'Calendar' },
    { path: '/forms', label: 'Forms', module: 'forms', icon: 'FileText' },

    { path: '/orders', label: 'Orders', module: 'orders', icon: 'ShoppingCart' },
    { path: '/invoices', label: 'Invoices', module: 'invoices', icon: 'Receipt' },
    { path: '/tasks', label: 'Tasks', module: 'tasks', icon: 'CheckSquare' },
    { path: '/insurance', label: 'Insurance', module: 'insurance', icon: 'Shield' },
    { path: '/messages', label: 'Messages', module: 'messages', icon: 'MessageSquare' },
    { path: '/providers', label: 'Providers', module: 'providers', icon: 'UserCheck' },
    { path: '/pharmacies', label: 'Pharmacies', module: 'pharmacies', icon: 'Building' },
    { path: '/tags', label: 'Tags', module: 'tags', icon: 'Tag' },
    { path: '/discounts', label: 'Discounts', module: 'discounts', icon: 'Percent' },
    { path: '/products', label: 'Products', module: 'products', icon: 'Package' },
    { path: '/resources', label: 'Resources', module: 'resources', icon: 'BookOpen' },
    { path: '/settings', label: 'Settings', module: 'settings', icon: 'Settings' },
    { path: '/audit', label: 'Audit Log', module: 'audit', icon: 'FileSearch' },
  ];

  // For super_admin, return all items without filtering
  if (userRole === 'super_admin') {
    console.log('Super admin detected - returning all navigation items');
    return allItems;
  }

  console.log('getNavigationItems called with userRole:', userRole);
  console.log('Total items available:', allItems.length);
  
  const filteredItems = allItems.filter(item => {
    const hasReadPermission = hasPermission(userRole, item.module, 'read');
    console.log(`Item ${item.label} (${item.module}): ${hasReadPermission ? 'ALLOWED' : 'DENIED'}`);
    return hasReadPermission;
  });
  
  console.log('Filtered items count:', filteredItems.length);
  console.log('Filtered items:', filteredItems.map(item => item.label));
  
  return filteredItems;
}