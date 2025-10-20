#!/usr/bin/env node

/**
 * Medplum User Seeding Script
 * 
 * This script creates users in the Medplum database with proper authentication
 * and FHIR Practitioner resources for the telehealth system.
 * 
 * Usage:
 *   node scripts/seed-users.js [options]
 * 
 * Options:
 *   --dry-run    Show what would be created without actually creating users
 *   --verbose    Show detailed output
 *   --help       Show this help message
 */

import { MedplumClient } from '@medplum/core';
import fetch from 'node-fetch';

// Polyfill fetch for Node.js
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

// Configuration
const MEDPLUM_BASE_URL = process.env.MEDPLUM_BASE_URL || 'https://api.medplum.com';
const MEDPLUM_CLIENT_ID = process.env.MEDPLUM_CLIENT_ID || 'demo-client-id';

// User data to seed
const USERS_TO_CREATE = [
  {
    email: 'admin@telehealth.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    specialty: 'Administration',
    phone: '+1-555-0101',
    npi: '1234567890'
  },
  {
    email: 'doctor@telehealth.com',
    password: 'doctor123',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'doctor',
    specialty: 'Internal Medicine',
    phone: '+1-555-0102',
    npi: '1234567891'
  },
  {
    email: 'nurse@telehealth.com',
    password: 'nurse123',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'nurse',
    specialty: 'Registered Nurse',
    phone: '+1-555-0103',
    npi: '1234567892'
  }
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    verbose: false,
    help: false
  };

  for (const arg of args) {
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        console.warn(`Unknown option: ${arg}`);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Medplum User Seeding Script

This script creates users in the Medplum database with proper authentication
and FHIR Practitioner resources for the telehealth system.

Usage:
  node scripts/seed-users.js [options]

Options:
  --dry-run    Show what would be created without actually creating users
  --verbose    Show detailed output
  --help       Show this help message

Default Users Created:
  - admin@telehealth.com / admin123 (System Administrator)
  - doctor@telehealth.com / doctor123 (Dr. Sarah Johnson - Internal Medicine)
  - nurse@telehealth.com / nurse123 (Emily Davis - Registered Nurse)

Environment Variables:
  MEDPLUM_BASE_URL    Medplum service URL (default: https://api.medplum.com)
  MEDPLUM_CLIENT_ID   Medplum client ID (default: demo-client-id)
`);
}

/**
 * Log message with timestamp
 */
function log(message, verbose = false, options = {}) {
  if (verbose && !options.verbose) return;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Create a FHIR Practitioner resource
 */
function createPractitionerResource(userData) {
  return {
    resourceType: 'Practitioner',
    active: true,
    name: [
      {
        use: 'official',
        family: userData.lastName,
        given: [userData.firstName]
      }
    ],
    telecom: [
      {
        system: 'email',
        value: userData.email,
        use: 'work'
      },
      {
        system: 'phone',
        value: userData.phone,
        use: 'work'
      }
    ],
    identifier: [
      {
        use: 'official',
        system: 'http://hl7.org/fhir/sid/us-npi',
        value: userData.npi
      }
    ],
    qualification: [
      {
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: userData.role === 'doctor' ? 'MD' : userData.role === 'nurse' ? 'RN' : 'ADMIN',
              display: userData.specialty
            }
          ]
        }
      }
    ]
  };
}

/**
 * Create a FHIR PractitionerRole resource
 */
function createPractitionerRoleResource(practitionerId, userData) {
  return {
    resourceType: 'PractitionerRole',
    active: true,
    practitioner: {
      reference: `Practitioner/${practitionerId}`
    },
    code: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/practitioner-role',
            code: userData.role,
            display: userData.specialty
          }
        ]
      }
    ],
    specialty: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: userData.role === 'doctor' ? '419772000' : userData.role === 'nurse' ? '224535009' : '224608005',
            display: userData.specialty
          }
        ]
      }
    ],
    telecom: [
      {
        system: 'email',
        value: userData.email,
        use: 'work'
      },
      {
        system: 'phone',
        value: userData.phone,
        use: 'work'
      }
    ]
  };
}

/**
 * Check if Medplum server is accessible
 */
async function checkMedplumServer(options) {
  try {
    log('Checking Medplum server connectivity...', false, options);
    const response = await fetch(`${MEDPLUM_BASE_URL}/healthcheck`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const health = await response.json();
    log(`✅ Medplum server is healthy: ${health.status}`, false, options);
    return true;
  } catch (error) {
    log(`❌ Failed to connect to Medplum server at ${MEDPLUM_BASE_URL}`, false, options);
    log(`Error: ${error.message}`, false, options);
    log('', false, options);
    log('Make sure the Medplum server is running:', false, options);
    log('  cd medplum', false, options);
    log('  docker-compose -f docker-compose.full-stack.yml up -d', false, options);
    return false;
  }
}

/**
 * Initialize Medplum client with super admin credentials
 */
async function initializeMedplumClient(options) {
  try {
    log('Initializing Medplum client...', false, options);
    
    const medplum = new MedplumClient({
      baseUrl: MEDPLUM_BASE_URL,
      clientId: MEDPLUM_CLIENT_ID
    });

    // For user creation, we need to authenticate as a super admin
    // In a real setup, you would use proper super admin credentials
    log('Note: Using demo client for user creation', true, options);
    
    return medplum;
  } catch (error) {
    log(`❌ Failed to initialize Medplum client: ${error.message}`, false, options);
    throw error;
  }
}

/**
 * Create a single user with Practitioner resource
 */
async function createUser(medplum, userData, options) {
  try {
    log(`Creating user: ${userData.email}`, false, options);
    
    if (options.dryRun) {
      log(`  [DRY RUN] Would create user: ${userData.firstName} ${userData.lastName}`, false, options);
      log(`  [DRY RUN] Email: ${userData.email}`, false, options);
      log(`  [DRY RUN] Role: ${userData.role}`, false, options);
      log(`  [DRY RUN] Specialty: ${userData.specialty}`, false, options);
      return { success: true, dryRun: true };
    }

    // Create Practitioner resource first
    const practitionerResource = createPractitionerResource(userData);
    log(`  Creating Practitioner resource...`, true, options);
    
    const practitioner = await medplum.createResource(practitionerResource);
    log(`  ✅ Created Practitioner: ${practitioner.id}`, true, options);

    // Create PractitionerRole resource
    const practitionerRoleResource = createPractitionerRoleResource(practitioner.id, userData);
    log(`  Creating PractitionerRole resource...`, true, options);
    
    const practitionerRole = await medplum.createResource(practitionerRoleResource);
    log(`  ✅ Created PractitionerRole: ${practitionerRole.id}`, true, options);

    // Note: User account creation with authentication typically requires
    // super admin privileges and may need to be done through the Medplum admin interface
    // or using the Medplum CLI with proper credentials
    
    log(`  ✅ Successfully created resources for ${userData.email}`, false, options);
    log(`     Practitioner ID: ${practitioner.id}`, true, options);
    log(`     PractitionerRole ID: ${practitionerRole.id}`, true, options);
    
    return {
      success: true,
      practitioner,
      practitionerRole,
      userData
    };

  } catch (error) {
    log(`  ❌ Failed to create user ${userData.email}: ${error.message}`, false, options);
    return { success: false, error: error.message, userData };
  }
}

/**
 * Main seeding function
 */
async function seedUsers() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }

  log('🌱 Starting Medplum User Seeding Process', false, options);
  log(`Server: ${MEDPLUM_BASE_URL}`, false, options);
  log(`Client ID: ${MEDPLUM_CLIENT_ID}`, false, options);
  
  if (options.dryRun) {
    log('🔍 DRY RUN MODE - No actual changes will be made', false, options);
  }
  
  log('', false, options);

  // Check server connectivity
  const serverHealthy = await checkMedplumServer(options);
  if (!serverHealthy) {
    process.exit(1);
  }

  try {
    // Initialize Medplum client
    const medplum = await initializeMedplumClient(options);
    
    log('', false, options);
    log(`📝 Creating ${USERS_TO_CREATE.length} users...`, false, options);
    
    const results = [];
    
    // Create each user
    for (const userData of USERS_TO_CREATE) {
      const result = await createUser(medplum, userData, options);
      results.push(result);
      log('', false, options);
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    log('📊 Seeding Summary:', false, options);
    log(`  ✅ Successful: ${successful}`, false, options);
    log(`  ❌ Failed: ${failed}`, false, options);
    
    if (failed > 0) {
      log('', false, options);
      log('Failed users:', false, options);
      results.filter(r => !r.success).forEach(r => {
        log(`  - ${r.userData.email}: ${r.error}`, false, options);
      });
    }
    
    if (!options.dryRun && successful > 0) {
      log('', false, options);
      log('🎉 User seeding completed!', false, options);
      log('', false, options);
      log('📋 Created Users (FHIR Resources Only):', false, options);
      log('Note: For full authentication, users need to be created through Medplum admin interface', false, options);
      log('', false, options);
      results.filter(r => r.success && !r.dryRun).forEach(r => {
        log(`👤 ${r.userData.firstName} ${r.userData.lastName}`, false, options);
        log(`   Email: ${r.userData.email}`, false, options);
        log(`   Role: ${r.userData.role}`, false, options);
        log(`   Practitioner ID: ${r.practitioner.id}`, false, options);
        log('', false, options);
      });
      
      log('🔐 Authentication Setup:', false, options);
      log('To enable login for these users, you need to:', false, options);
      log('1. Access the Medplum admin interface at https://app.medplum.com', false, options);
      log('2. Create user accounts linked to the Practitioner resources', false, options);
      log('3. Or use the Medplum CLI with super admin credentials', false, options);
    }
    
  } catch (error) {
    log(`❌ Seeding process failed: ${error.message}`, false, options);
    process.exit(1);
  }
}

// Run the seeding process
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { seedUsers, USERS_TO_CREATE };