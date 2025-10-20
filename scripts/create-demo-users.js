#!/usr/bin/env node

/**
 * Demo User Creation Script for Telehealth System
 * 
 * This script creates demo users by directly calling the Medplum admin API
 * to set up users that can be used for testing the telehealth application.
 * 
 * Usage:
 *   node scripts/create-demo-users.js
 */

import fetch from 'node-fetch';

// Polyfill fetch for Node.js
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

// Configuration
const MEDPLUM_BASE_URL = process.env.MEDPLUM_BASE_URL || 'https://api.medplum.com';

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
    return false;
  }
}

/**
 * Create a super admin setup
 */
async function setupSuperAdmin() {
  try {
    log('Setting up super admin...');
    
    const response = await fetch(`${MEDPLUM_BASE_URL}/admin/super/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@telehealth.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        projectName: 'Telehealth System'
      })
    });

    if (response.ok) {
      const result = await response.json();
      log('✅ Super admin created successfully!');
      return result;
    } else if (response.status === 400) {
      const error = await response.text();
      if (error.includes('already exists') || error.includes('Super Admin already configured')) {
        log('ℹ️  Super admin already exists');
        return { alreadyExists: true };
      }
      throw new Error(`Setup failed: ${error}`);
    } else {
      throw new Error(`Setup failed with status: ${response.status}`);
    }
  } catch (error) {
    log(`❌ Super admin setup failed: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  log('🔧 Setting up Demo Users for Telehealth System');
  log(`Server: ${MEDPLUM_BASE_URL}`);
  log('');

  // Check server connectivity
  const serverHealthy = await checkMedplumServer();
  if (!serverHealthy) {
    log('');
    log('Make sure the Medplum server is running:');
    log('  cd medplum');
    log('  docker-compose -f docker-compose.full-stack.yml up -d');
    process.exit(1);
  }

  try {
    // Setup super admin
    const adminResult = await setupSuperAdmin();
    
    log('');
    log('🎉 Demo user setup completed!');
    log('');
    log('📋 Available Login Credentials:');
    log('');
    
    if (!adminResult.error) {
      log('👤 System Administrator');
      log('   Email: admin@telehealth.com');
      log('   Password: admin123');
      log('   Access: Full admin privileges');
      log('');
    }
    
    log('🔐 Login Instructions:');
    log('');
    log('1. For your Telehealth Application:');
    log('   - Open: http://localhost:3001');
    log('   - Use: admin@telehealth.com / admin123');
    log('   - Note: This will use mock authentication fallback');
    log('');
    log('2. For Medplum Admin Interface:');
    log('   - Open: http://localhost:3000');
    log('   - Use: admin@telehealth.com / admin123');
    log('   - Access: Full Medplum admin interface');
    log('');
    log('3. Additional Mock Users (for telehealth app only):');
    log('   - doctor@example.com / doctor123');
    log('   - nurse@example.com / nurse123');
    log('');
    log('💡 Tips:');
    log('- The telehealth app has fallback mock authentication');
    log('- Use the Medplum admin interface to create more users');
    log('- All mock users work in the telehealth application');
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});