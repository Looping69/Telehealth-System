# Authentication Profiles for Telehealth System

This document describes the available authentication profiles for the Telehealth System and how to use them.

## Available Authentication Profiles

The system includes the following pre-configured authentication profiles that match between mock and real authentication:

### 1. Dr. Admin (Healthcare Provider)
- **Email:** `admin@example.com`
- **Password:** `medplum_admin`
- **Role:** `healthcare_provider`
- **Resource Type:** `Practitioner`
- **Specialty:** Administration
- **Phone:** +1-555-0001
- **NPI:** 1234567801

### 2. Dr. Smith (Healthcare Provider)
- **Email:** `doctor@example.com`
- **Password:** `doctor123`
- **Role:** `healthcare_provider`
- **Resource Type:** `Practitioner`
- **Specialty:** Internal Medicine
- **Phone:** +1-555-0002
- **NPI:** 1234567802

### 3. Nurse Johnson (Receptionist)
- **Email:** `nurse@example.com`
- **Password:** `nurse123`
- **Role:** `receptionist`
- **Resource Type:** `Person`
- **Specialty:** Nursing
- **Phone:** +1-555-0003

### 4. Super Administrator
- **Email:** `superadmin@example.com`
- **Password:** `superadmin123`
- **Role:** `super_admin`
- **Resource Type:** `Practitioner`
- **Specialty:** System Administration
- **Phone:** +1-555-0004
- **NPI:** 1234567804

## How to Use Authentication Profiles

### Mock Authentication (Always Available)

The Telehealth application includes built-in mock authentication that works even when the Medplum server is unavailable:

1. **Open the application:** 
   - **Live Demo:** https://telehealth-system-woad.vercel.app/
   - **Local Development:** http://localhost:5173
2. **Use any of the credentials above**
3. **Automatic fallback:** The app automatically uses mock data when real authentication fails

### Real Medplum Authentication (Requires Setup)

To use real Medplum authentication, you need to manually create these profiles in the Medplum database:

1. **Access Medplum Admin Interface:** https://app.medplum.com
2. **Create users manually** with the exact email/password combinations listed above
3. **Match the resource types** (Practitioner or Person) as specified
4. **Include the same contact information** for consistency

## Running the Seeding Script

To see the available authentication profiles and get setup instructions:

```bash
node scripts/seed-auth-profiles.js
```

This script will:
- ✅ Display all available authentication profiles
- ✅ Show how to use mock authentication
- ✅ Provide instructions for setting up real Medplum authentication
- ✅ Confirm that mock authentication fallback is working

## Authentication Flow

The Telehealth System uses a robust authentication flow with automatic fallback:

1. **Primary:** Attempts to authenticate with real Medplum server
2. **Fallback:** Uses mock authentication if Medplum is unavailable
3. **Seamless:** Users experience no interruption during fallback

## Current Status

- **Mock Authentication:** ✅ Ready to use immediately
- **Real Medplum Authentication:** ⚠️ Requires manual setup in Medplum admin interface
- **Application Fallback:** ✅ Automatically uses mock data when needed
- **Data Consistency:** ✅ Same profiles available in both modes

## Tips for Development

1. **Start with mock authentication** for immediate development
2. **Use the Medplum admin interface** to create real users when needed
3. **Test both authentication modes** to ensure fallback works correctly
4. **Keep credentials consistent** between mock and real authentication

## Security Notes

- These are **development credentials only**
- **Never use these credentials in production**
- **Change all passwords** before deploying to production
- **Use proper secret management** for production environments