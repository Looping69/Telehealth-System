/**
 * Data Generators for FHIR Resources
 * 
 * Purpose: Generate realistic healthcare data for seeding the telehealth system
 * Inputs: Configuration parameters and reference resources
 * Outputs: FHIR-compliant resource objects
 */

const crypto = require('crypto');

// Sample data pools for realistic generation
const SAMPLE_DATA = {
  organizations: [
    {
      name: 'Springfield General Hospital',
      type: 'prov',
      typeDisplay: 'Healthcare Provider',
      address: {
        line: ['1234 Medical Center Drive'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US'
      },
      phone: '+1-555-0100'
    },
    {
      name: 'Riverside Medical Clinic',
      type: 'prov',
      typeDisplay: 'Healthcare Provider',
      address: {
        line: ['567 Riverside Avenue'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62702',
        country: 'US'
      },
      phone: '+1-555-0200'
    },
    {
      name: 'Community Health Center',
      type: 'prov',
      typeDisplay: 'Healthcare Provider',
      address: {
        line: ['890 Community Way'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62703',
        country: 'US'
      },
      phone: '+1-555-0300'
    }
  ],

  practitionerNames: [
    { family: 'Smith', given: ['John', 'Michael'], prefix: 'Dr.', specialty: 'Internal Medicine' },
    { family: 'Johnson', given: ['Sarah', 'Elizabeth'], prefix: 'Dr.', specialty: 'Cardiology' },
    { family: 'Williams', given: ['Robert', 'James'], prefix: 'Dr.', specialty: 'Pediatrics' },
    { family: 'Brown', given: ['Emily', 'Rose'], prefix: 'Dr.', specialty: 'Dermatology' },
    { family: 'Davis', given: ['Michael', 'Anthony'], prefix: 'Dr.', specialty: 'Orthopedics' },
    { family: 'Miller', given: ['Jessica', 'Marie'], prefix: 'Dr.', specialty: 'Psychiatry' },
    { family: 'Wilson', given: ['David', 'Christopher'], prefix: 'Dr.', specialty: 'Neurology' },
    { family: 'Moore', given: ['Amanda', 'Nicole'], prefix: 'Dr.', specialty: 'Oncology' },
    { family: 'Taylor', given: ['James', 'William'], prefix: 'Dr.', specialty: 'Emergency Medicine' },
    { family: 'Anderson', given: ['Lisa', 'Ann'], prefix: 'Dr.', specialty: 'Family Medicine' },
    { family: 'Thomas', given: ['Christopher', 'Lee'], prefix: 'Dr.', specialty: 'Radiology' },
    { family: 'Jackson', given: ['Michelle', 'Lynn'], prefix: 'Dr.', specialty: 'Anesthesiology' },
    { family: 'White', given: ['Kevin', 'Paul'], prefix: 'Dr.', specialty: 'Gastroenterology' },
    { family: 'Harris', given: ['Jennifer', 'Kay'], prefix: 'Dr.', specialty: 'Endocrinology' },
    { family: 'Martin', given: ['Daniel', 'Scott'], prefix: 'Dr.', specialty: 'Pulmonology' }
  ],

  patientNames: [
    { family: 'Johnson', given: ['Sarah', 'Marie'], gender: 'female' },
    { family: 'Williams', given: ['Michael', 'James'], gender: 'male' },
    { family: 'Brown', given: ['Emily', 'Rose'], gender: 'female' },
    { family: 'Davis', given: ['Christopher', 'Lee'], gender: 'male' },
    { family: 'Miller', given: ['Ashley', 'Nicole'], gender: 'female' },
    { family: 'Wilson', given: ['Matthew', 'David'], gender: 'male' },
    { family: 'Moore', given: ['Jessica', 'Lynn'], gender: 'female' },
    { family: 'Taylor', given: ['Joshua', 'Michael'], gender: 'male' },
    { family: 'Anderson', given: ['Amanda', 'Kay'], gender: 'female' },
    { family: 'Thomas', given: ['Andrew', 'Scott'], gender: 'male' },
    { family: 'Jackson', given: ['Stephanie', 'Ann'], gender: 'female' },
    { family: 'White', given: ['Ryan', 'Paul'], gender: 'male' },
    { family: 'Harris', given: ['Megan', 'Elizabeth'], gender: 'female' },
    { family: 'Martin', given: ['Brandon', 'William'], gender: 'male' },
    { family: 'Garcia', given: ['Nicole', 'Marie'], gender: 'female' },
    { family: 'Martinez', given: ['Tyler', 'James'], gender: 'male' },
    { family: 'Robinson', given: ['Samantha', 'Rose'], gender: 'female' },
    { family: 'Clark', given: ['Justin', 'Christopher'], gender: 'male' },
    { family: 'Rodriguez', given: ['Brittany', 'Michelle'], gender: 'female' },
    { family: 'Lewis', given: ['Zachary', 'David'], gender: 'male' }
  ],

  cities: [
    { city: 'Springfield', state: 'IL', postalCode: '62701' },
    { city: 'Springfield', state: 'IL', postalCode: '62702' },
    { city: 'Springfield', state: 'IL', postalCode: '62703' },
    { city: 'Springfield', state: 'IL', postalCode: '62704' },
    { city: 'Springfield', state: 'IL', postalCode: '62705' }
  ],

  specialties: [
    { code: 'internal-medicine', display: 'Internal Medicine' },
    { code: 'cardiology', display: 'Cardiology' },
    { code: 'pediatrics', display: 'Pediatrics' },
    { code: 'dermatology', display: 'Dermatology' },
    { code: 'orthopedics', display: 'Orthopedics' },
    { code: 'psychiatry', display: 'Psychiatry' },
    { code: 'neurology', display: 'Neurology' },
    { code: 'oncology', display: 'Oncology' },
    { code: 'emergency-medicine', display: 'Emergency Medicine' },
    { code: 'family-medicine', display: 'Family Medicine' }
  ]
};

/**
 * Generate a unique identifier
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique identifier
 */
function generateId(prefix = 'id') {
  return `${prefix}-${crypto.randomUUID().substring(0, 8)}`;
}

/**
 * Generate a random phone number
 * @returns {string} Formatted phone number
 */
function generatePhoneNumber() {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1-${area}-${exchange}-${number}`;
}

/**
 * Generate a random email address
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Email address
 */
function generateEmail(firstName, lastName) {
  const domains = ['email.com', 'gmail.com', 'yahoo.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

/**
 * Generate a random date within a range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} ISO date string
 */
function generateRandomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString().split('T')[0];
}

/**
 * Generate Organization resources
 * @param {number} count - Number of organizations to generate
 * @returns {Array} Array of Organization FHIR resources
 */
function generateOrganizations(count = 3) {
  const organizations = [];
  
  for (let i = 0; i < Math.min(count, SAMPLE_DATA.organizations.length); i++) {
    const orgData = SAMPLE_DATA.organizations[i];
    const organization = {
      resourceType: 'Organization',
      id: generateId('org'),
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'PRN',
                display: 'Provider number'
              }
            ]
          },
          value: `ORG${String(i + 1).padStart(6, '0')}`
        }
      ],
      active: true,
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/organization-type',
              code: orgData.type,
              display: orgData.typeDisplay
            }
          ]
        }
      ],
      name: orgData.name,
      telecom: [
        {
          system: 'phone',
          value: orgData.phone,
          use: 'work'
        }
      ],
      address: [
        {
          use: 'work',
          type: 'physical',
          line: orgData.address.line,
          city: orgData.address.city,
          state: orgData.address.state,
          postalCode: orgData.address.postalCode,
          country: orgData.address.country
        }
      ]
    };
    
    organizations.push(organization);
  }
  
  return organizations;
}

/**
 * Generate Practitioner resources
 * @param {Array} organizations - Array of organization resources
 * @param {number} count - Number of practitioners to generate
 * @returns {Array} Array of Practitioner FHIR resources
 */
function generatePractitioners(organizations, count = 15) {
  const practitioners = [];
  
  for (let i = 0; i < count; i++) {
    const practitionerData = SAMPLE_DATA.practitionerNames[i % SAMPLE_DATA.practitionerNames.length];
    const organization = organizations[i % organizations.length];
    
    const practitioner = {
      resourceType: 'Practitioner',
      id: generateId('prac'),
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'NPI',
                display: 'National Provider Identifier'
              }
            ]
          },
          value: `${1000000000 + i}`
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          family: practitionerData.family,
          given: practitionerData.given,
          prefix: [practitionerData.prefix]
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: generatePhoneNumber(),
          use: 'work'
        },
        {
          system: 'email',
          value: generateEmail(practitionerData.given[0], practitionerData.family)
        }
      ],
      qualification: [
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                code: 'MD',
                display: 'Doctor of Medicine'
              }
            ]
          },
          period: {
            start: generateRandomDate(new Date('2000-01-01'), new Date('2020-01-01'))
          }
        }
      ]
    };

    // Add specialty qualification
    const specialty = SAMPLE_DATA.specialties.find(s => s.display === practitionerData.specialty) || 
                     SAMPLE_DATA.specialties[0];
    
    practitioner.qualification.push({
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: specialty.code,
            display: specialty.display
          }
        ]
      }
    });
    
    practitioners.push(practitioner);
  }
  
  return practitioners;
}

/**
 * Generate Patient resources
 * @param {number} count - Number of patients to generate
 * @returns {Array} Array of Patient FHIR resources
 */
function generatePatients(count = 50) {
  const patients = [];
  
  for (let i = 0; i < count; i++) {
    const patientData = SAMPLE_DATA.patientNames[i % SAMPLE_DATA.patientNames.length];
    const cityData = SAMPLE_DATA.cities[i % SAMPLE_DATA.cities.length];
    
    // Generate random birth date (18-80 years old)
    const minAge = 18;
    const maxAge = 80;
    const today = new Date();
    const birthYear = today.getFullYear() - minAge - Math.floor(Math.random() * (maxAge - minAge));
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    
    const patient = {
      resourceType: 'Patient',
      id: generateId('pat'),
      identifier: [
        {
          use: 'usual',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical Record Number'
              }
            ]
          },
          value: `MRN${String(i + 1).padStart(6, '0')}`
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          family: patientData.family,
          given: patientData.given
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: generatePhoneNumber(),
          use: 'mobile'
        },
        {
          system: 'email',
          value: generateEmail(patientData.given[0], patientData.family)
        }
      ],
      gender: patientData.gender,
      birthDate: birthDate,
      address: [
        {
          use: 'home',
          type: 'physical',
          line: [`${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Maple'][Math.floor(Math.random() * 5)]} Street`],
          city: cityData.city,
          state: cityData.state,
          postalCode: cityData.postalCode,
          country: 'US'
        }
      ],
      maritalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
            code: ['M', 'S', 'D', 'W'][Math.floor(Math.random() * 4)],
            display: ['Married', 'Single', 'Divorced', 'Widowed'][Math.floor(Math.random() * 4)]
          }
        ]
      }
    };
    
    patients.push(patient);
  }
  
  return patients;
}

module.exports = {
  generateOrganizations,
  generatePractitioners,
  generatePatients,
  generateId,
  generatePhoneNumber,
  generateEmail,
  generateRandomDate,
  SAMPLE_DATA
};