// Debug navigation items for super admin
const fs = require('fs');
const path = require('path');

// Read the permissions file
const permissionsPath = path.join(__dirname, 'src', 'utils', 'permissions.ts');
const permissionsContent = fs.readFileSync(permissionsPath, 'utf8');

console.log('=== DEBUGGING NAVIGATION ITEMS ===');

// Extract ROLE_PERMISSIONS from the file
const rolePermissionsMatch = permissionsContent.match(/export const ROLE_PERMISSIONS[^}]+}[^}]+}/s);
if (rolePermissionsMatch) {
  console.log('Found ROLE_PERMISSIONS definition');
  
  // Check if super_admin has all required permissions
  const superAdminMatch = permissionsContent.match(/super_admin: \[([\s\S]*?)\]/);
  if (superAdminMatch) {
    const superAdminPerms = superAdminMatch[1];
    console.log('\nSuper admin permissions found:');
    
    const modules = [
      'dashboard', 'patients', 'sessions', 'forms', 'orders', 'invoices',
      'tasks', 'insurance', 'messages', 'providers', 'pharmacies', 'tags',
      'discounts', 'products', 'resources', 'settings', 'audit'
    ];
    
    modules.forEach(module => {
      const hasModule = superAdminPerms.includes(`module: '${module}'`);
      const hasRead = superAdminPerms.includes(`module: '${module}'`) && 
                     superAdminPerms.match(new RegExp(`module: '${module}'[^}]*actions: \\[[^\\]]*'read'`));
      console.log(`- ${module}: ${hasModule ? 'EXISTS' : 'MISSING'} ${hasRead ? '(has read)' : '(no read)'}`);
    });
  }
}

// Check getNavigationItems function
const getNavMatch = permissionsContent.match(/export function getNavigationItems\(userRole: UserRole\) \{([\s\S]*?)\}/);
if (getNavMatch) {
  console.log('\n=== getNavigationItems function found ===');
  const functionBody = getNavMatch[1];
  
  // Extract allItems array
  const allItemsMatch = functionBody.match(/const allItems = \[([\s\S]*?)\];/);
  if (allItemsMatch) {
    const allItemsContent = allItemsMatch[1];
    const itemCount = (allItemsContent.match(/\{[^}]*path:[^}]*\}/g) || []).length;
    console.log(`Total navigation items defined: ${itemCount}`);
    
    // Extract each item
    const items = allItemsContent.match(/\{[^}]*path:[^}]*\}/g) || [];
    items.forEach((item, index) => {
      const pathMatch = item.match(/path: '([^']*)'/);
      const labelMatch = item.match(/label: '([^']*)'/);
      const moduleMatch = item.match(/module: '([^']*)'/);
      
      if (pathMatch && labelMatch && moduleMatch) {
        console.log(`${index + 1}. ${labelMatch[1]} (${pathMatch[1]}) - module: ${moduleMatch[1]}`);
      }
    });
  }
}

console.log('\n=== DONE ===');