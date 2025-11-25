# Medplum Demo Users Creation Script

This script creates demo users as real Medplum users with proper FHIR resources and authentication setup.

## Features

- Creates Practitioner resources for healthcare providers (Admin, Doctor, Nurse)
- Creates Patient resources for patient users
- Sets up role-based permissions for each user type
- Supports both dry-run and actual creation modes
- Comprehensive error handling and logging
- Automatic environment variable loading from server configuration

## Prerequisites

- Node.js (v14 or higher)
- Medplum account with API access
- Valid Medplum OAuth client credentials (Client ID and Secret)

## Usage

### Basic Usage

```bash
# Create demo users with actual Medplum API
node scripts/create-medplum-demo-users.js

# Dry run (preview what would be created)
node scripts/create-medplum-demo-users.js --dry-run

# Verbose output
node scripts/create-medplum-demo-users.js --verbose

# Dry run with verbose output
node scripts/create-medplum-demo-users.js --dry-run --verbose
```

### Environment Variables

The script automatically loads environment variables from `server/.env` file. Required variables:

```bash
MEDPLUM_BASE_URL=https://api.medplum.com
MEDPLUM_CLIENT_ID=your-client-id
MEDPLUM_CLIENT_SECRET=your-client-secret
```

### Demo Users Created

The script creates the following demo users:

#### Healthcare Providers (Practitioner resources)
- **Admin**: `admin@telehealth.com` / `admin123` - System Administrator
- **Doctor**: `doctor@telehealth.com` / `doctor123` - Family Medicine
- **Nurse**: `nurse@telehealth.com` / `nurse123` - General Nursing

#### Patients (Patient resources)
- **Patient 1**: `patient1@telehealth.com` / `patient123` - Emma Davis (Female, DOB: 1985-03-15)
- **Patient 2**: `patient2@telehealth.com` / `patient456` - James Wilson (Male, DOB: 1978-11-22)

## Role-Based Permissions

Each user type has specific permissions:

- **Admin**: Full access (read, write, delete, admin)
- **Doctor**: Clinical access (read, write, prescribe)
- **Nurse**: Care team access (read, write, assist)
- **Patient**: Self-service access (read, self)

## FHIR Resources Created

### Practitioner Resource Structure
```json
{
  "resourceType": "Practitioner",
  "identifier": [{
    "system": "http://telehealth.com/users",
    "value": "user@email.com"
  }],
  "active": true,
  "name": [{
    "use": "official",
    "family": "LastName",
    "given": ["FirstName"]
  }],
  "telecom": [{
    "system": "email",
    "value": "user@email.com",
    "use": "work"
  }],
  "qualification": [{
    "code": {
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "specialty-code",
        "display": "Specialty Name"
      }]
    }
  }]
}
```

### Patient Resource Structure
```json
{
  "resourceType": "Patient",
  "identifier": [{
    "system": "http://telehealth.com/users",
    "value": "patient@email.com"
  }],
  "active": true,
  "name": [{
    "use": "official",
    "family": "LastName",
    "given": ["FirstName"]
  }],
  "telecom": [{
    "system": "email",
    "value": "patient@email.com",
    "use": "home"
  }],
  "gender": "male|female",
  "birthDate": "YYYY-MM-DD"
}
```

## Error Handling

The script includes comprehensive error handling:

- **Authentication failures**: Falls back to demo mode
- **API errors**: Detailed logging with error messages
- **Network issues**: Timeout handling and retry logic
- **Validation errors**: Input validation for all user data

## Testing

### Test Script Functionality
```bash
# Test dry-run mode
node scripts/create-medplum-demo-users.js --dry-run --verbose

# Test with actual API (requires valid credentials)
node scripts/create-medplum-demo-users.js --verbose
```

### Verify Created Users
After running the script, you can verify the created users by:

1. **Medplum Admin Interface**: Log in to your Medplum admin panel
2. **API Testing**: Use the OAuth endpoints to test authentication
3. **FHIR Resource Search**: Query for Practitioner and Patient resources

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify MEDPLUM_CLIENT_ID and MEDPLUM_CLIENT_SECRET are correct
   - Check that your Medplum account has admin privileges
   - Ensure the base URL is correct

2. **Permission Denied**
   - Ensure your Medplum account has permission to create resources
   - Check project-level permissions in Medplum

3. **Network Timeouts**
   - Check your internet connection
   - Verify Medplum API is accessible
   - Consider increasing timeout values

### Demo Mode

If authentication fails, the script automatically falls back to demo mode:
- Creates mock FHIR resources with demo IDs
- Provides user credentials for testing
- Skips actual API calls to Medplum

This allows you to test the script functionality without requiring live Medplum credentials.

## Next Steps

After creating demo users:

1. **Test Authentication**: Use the OAuth login endpoints
2. **Verify Permissions**: Test role-based access controls
3. **Create Sample Data**: Add appointments, prescriptions, etc.
4. **Test Workflows**: Verify healthcare provider and patient workflows

## Support

For issues with the script:
1. Check the verbose output for detailed error messages
2. Verify your Medplum account configuration
3. Ensure all environment variables are properly set
4. Check Medplum API documentation for any API changes