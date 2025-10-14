#!/usr/bin/env node

/**
 * Medplum Admin User Creation Script
 * 
 * This script creates a super admin user that can then be used to create other users.
 * This is typically the first step in setting up a Medplum instance.
 * 
 * Usage:
 *   node scripts/create-admin-user.js
 */

import fetch from 'node-fetch';

// Polyfill fetch for Node.js
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

// Configuration
const MEDPLUM_BASE_URL = process.env.MEDPLUM_BASE_URL || 'http://localhost:8103';

// Super admin user data
const SUPER_ADMIN_USER = {
  email: 'admin@telehealth.com',
  password: 'admin123',
  firstName: 'System',
  lastName: 'Administrator',
  projectName: 'Telehealth System'
};

/**
 * Log message with timestamp
 */
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Check if Medplum server is accessible
 */
async function checkMedplumServer() {
  try {
    log('Checking Medplum server connectivity...');
    const response = await fetch(`${MEDPLUM_BASE_URL}/healthcheck`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const health = await response.json();
    log(`✅ Medplum server is healthy: ${health.status}`);
    return true;
  } catch (error) {
    log(`❌ Failed to connect to Medplum server at ${MEDPLUM_BASE_URL}`);
    log(`Error: ${error.message}`);
    log('');
    log('Make sure the Medplum server is running:');
    log('  cd medplum');
    log('  docker-compose -f docker-compose.full-stack.yml up -d');
    return false;
  }
}

/**
 * Create super admin user and project
 */
async function createSuperAdmin() {
  try {
    log('Creating super admin user and project...');
    
    const response = await fetch(`${MEDPLUM_BASE_URL}/admin/super/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: SUPER_ADMIN_USER.email,
        password: SUPER_ADMIN_USER.password,
        firstName: SUPER_ADMIN_USER.firstName,
        lastName: SUPER_ADMIN_USER.lastName,
        projectName: SUPER_ADMIN_USER.projectName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create super admin: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    log('✅ Super admin user created successfully!');
    log(`   Email: ${SUPER_ADMIN_USER.email}`);
    log(`   Password: ${SUPER_ADMIN_USER.password}`);
    log(`   Project: ${SUPER_ADMIN_USER.projectName}`);
    
    return result;
  } catch (error) {
    if (error.message.includes('409') || error.message.includes('already exists')) {
      log('ℹ️  Super admin user already exists');
      return { alreadyExists: true };
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  log('🔧 Setting up Medplum Super Admin User');
  log(`Server: ${MEDPLUM_BASE_URL}`);
  log('');

  // Check server connectivity
  const serverHealthy = await checkMedplumServer();
  if (!serverHealthy) {
    process.exit(1);
  }

  try {
    // Create super admin
    const result = await createSuperAdmin();
    
    log('');
    log('🎉 Setup completed!');
    log('');
    log('You can now:');
    log('1. Log into the Medplum app at http://localhost:3000');
    log(`2. Use credentials: ${SUPER_ADMIN_USER.email} / ${SUPER_ADMIN_USER.password}`);
    log('3. Create additional users through the admin interface');
    log('4. Or run the user seeding script to create more users programmatically');
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { createSuperAdmin, SUPER_ADMIN_USER };