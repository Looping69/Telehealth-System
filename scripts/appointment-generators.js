/**
 * Appointment, Communication, and Service Request Generators
 * 
 * Purpose: Generate realistic healthcare interaction data with proper FHIR references
 * Inputs: Patient and Practitioner resources for reference integrity
 * Outputs: FHIR-compliant Appointment, Communication, and ServiceRequest resources
 */

const { generateId, generateRandomDate } = require('./data-generators');

/**
 * Generate Appointment resources with realistic scheduling patterns
 * @param {Array} patients - Array of patient resources
 * @param {Array} practitioners - Array of practitioner resources
 * @param {number} count - Number of appointments to generate
 * @returns {Array} Array of Appointment FHIR resources
 */
function generateAppointments(patients, practitioners, count = 200) {
  const appointments = [];
  const appointmentTypes = [
    { code: 'ROUTINE', display: 'Routine appointment', duration: 30 },
    { code: 'WALKIN', display: 'Walk-in appointment', duration: 15 },
    { code: 'CHECKUP', display: 'Check-up', duration: 45 },
    { code: 'FOLLOWUP', display: 'Follow-up', duration: 20 },
    { code: 'EMERGENCY', display: 'Emergency', duration: 60 }
  ];

  const appointmentStatuses = [
    { status: 'booked', weight: 40 },
    { status: 'fulfilled', weight: 35 },
    { status: 'cancelled', weight: 10 },
    { status: 'noshow', weight: 8 },
    { status: 'pending', weight: 7 }
  ];

  const serviceCategories = [
    { code: '17', display: 'General Practice' },
    { code: '394579002', display: 'Cardiology' },
    { code: '394537008', display: 'Pediatrics' },
    { code: '394582007', display: 'Dermatology' },
    { code: '394609007', display: 'Surgery' }
  ];

  // Helper function to get weighted random status
  function getRandomStatus() {
    const totalWeight = appointmentStatuses.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of appointmentStatuses) {
      random -= item.weight;
      if (random <= 0) return item.status;
    }
    return appointmentStatuses[0].status;
  }

  // Generate appointments across different time periods
  const now = new Date();
  const pastStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  const futureEnd = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

  for (let i = 0; i < count; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const practitioner = practitioners[Math.floor(Math.random() * practitioners.length)];
    const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
    const serviceCategory = serviceCategories[Math.floor(Math.random() * serviceCategories.length)];
    
    // Generate appointment time
    const appointmentDate = new Date(pastStart.getTime() + Math.random() * (futureEnd.getTime() - pastStart.getTime()));
    
    // Round to nearest 15 minutes and set to business hours (8 AM - 5 PM)
    appointmentDate.setMinutes(Math.floor(appointmentDate.getMinutes() / 15) * 15);
    appointmentDate.setSeconds(0);
    appointmentDate.setMilliseconds(0);
    
    const hour = appointmentDate.getHours();
    if (hour < 8) {
      appointmentDate.setHours(8);
    } else if (hour >= 17) {
      appointmentDate.setHours(16);
    }

    const startTime = appointmentDate.toISOString();
    const endTime = new Date(appointmentDate.getTime() + appointmentType.duration * 60000).toISOString();

    // Determine status based on appointment time
    let status;
    if (appointmentDate < now) {
      // Past appointments
      status = Math.random() < 0.8 ? 'fulfilled' : (Math.random() < 0.6 ? 'cancelled' : 'noshow');
    } else {
      // Future appointments
      status = Math.random() < 0.9 ? 'booked' : (Math.random() < 0.5 ? 'pending' : 'cancelled');
    }

    const appointment = {
      resourceType: 'Appointment',
      id: generateId('appt'),
      status: status,
      serviceCategory: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/service-category',
              code: serviceCategory.code,
              display: serviceCategory.display
            }
          ]
        }
      ],
      serviceType: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/service-type',
              code: serviceCategory.code,
              display: serviceCategory.display
            }
          ]
        }
      ],
      appointmentType: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
            code: appointmentType.code,
            display: appointmentType.display
          }
        ]
      },
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '185349003',
              display: 'Encounter for check up'
            }
          ]
        }
      ],
      description: `${appointmentType.display} with ${practitioner.name[0].prefix[0]} ${practitioner.name[0].given[0]} ${practitioner.name[0].family}`,
      start: startTime,
      end: endTime,
      minutesDuration: appointmentType.duration,
      participant: [
        {
          actor: {
            reference: `Patient/${patient.id}`,
            display: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`
          },
          required: 'required',
          status: status === 'noshow' ? 'declined' : 'accepted'
        },
        {
          actor: {
            reference: `Practitioner/${practitioner.id}`,
            display: `${practitioner.name[0].prefix[0]} ${practitioner.name[0].given[0]} ${practitioner.name[0].family}`
          },
          required: 'required',
          status: 'accepted'
        }
      ]
    };

    // Add comment for cancelled or no-show appointments
    if (status === 'cancelled') {
      appointment.comment = 'Patient requested cancellation';
    } else if (status === 'noshow') {
      appointment.comment = 'Patient did not show up for appointment';
    }

    appointments.push(appointment);
  }

  return appointments;
}

/**
 * Generate Communication resources (secure messages)
 * @param {Array} patients - Array of patient resources
 * @param {Array} practitioners - Array of practitioner resources
 * @param {number} count - Number of communications to generate
 * @returns {Array} Array of Communication FHIR resources
 */
function generateCommunications(patients, practitioners, count = 100) {
  const communications = [];
  
  const messageTemplates = [
    {
      category: 'appointment',
      subject: 'Appointment Reminder',
      content: 'This is a reminder that you have an appointment scheduled for {date} at {time}. Please arrive 15 minutes early.'
    },
    {
      category: 'results',
      subject: 'Lab Results Available',
      content: 'Your recent lab results are now available. Please log in to your patient portal to review them or contact our office if you have questions.'
    },
    {
      category: 'medication',
      subject: 'Prescription Refill Reminder',
      content: 'Your prescription for {medication} is due for refill. Please contact our office to arrange pickup or delivery.'
    },
    {
      category: 'general',
      subject: 'Follow-up Care Instructions',
      content: 'Thank you for your recent visit. Please follow the care instructions provided and contact us if you have any concerns.'
    },
    {
      category: 'billing',
      subject: 'Insurance Information Update',
      content: 'We need to update your insurance information. Please bring your current insurance card to your next appointment.'
    }
  ];

  const communicationStatuses = ['completed', 'in-progress', 'on-hold'];

  for (let i = 0; i < count; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const practitioner = practitioners[Math.floor(Math.random() * practitioners.length)];
    const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    const status = communicationStatuses[Math.floor(Math.random() * communicationStatuses.length)];

    // Generate sent time (within last 30 days)
    const sentDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    const communication = {
      resourceType: 'Communication',
      id: generateId('comm'),
      status: status,
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/communication-category',
              code: template.category,
              display: template.category.charAt(0).toUpperCase() + template.category.slice(1)
            }
          ]
        }
      ],
      medium: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationMode',
              code: 'ELECTRONIC',
              display: 'Electronic'
            }
          ]
        }
      ],
      subject: {
        reference: `Patient/${patient.id}`,
        display: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`
      },
      sent: sentDate.toISOString(),
      recipient: [
        {
          reference: `Patient/${patient.id}`,
          display: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`
        }
      ],
      sender: {
        reference: `Practitioner/${practitioner.id}`,
        display: `${practitioner.name[0].prefix[0]} ${practitioner.name[0].given[0]} ${practitioner.name[0].family}`
      },
      payload: [
        {
          contentString: template.subject
        },
        {
          contentString: template.content
            .replace('{date}', sentDate.toLocaleDateString())
            .replace('{time}', sentDate.toLocaleTimeString())
            .replace('{medication}', ['Lisinopril', 'Metformin', 'Atorvastatin', 'Amlodipine'][Math.floor(Math.random() * 4)])
        }
      ]
    };

    communications.push(communication);
  }

  return communications;
}

/**
 * Generate ServiceRequest resources (orders)
 * @param {Array} patients - Array of patient resources
 * @param {Array} practitioners - Array of practitioner resources
 * @param {number} count - Number of service requests to generate
 * @returns {Array} Array of ServiceRequest FHIR resources
 */
function generateServiceRequests(patients, practitioners, count = 75) {
  const serviceRequests = [];

  const orderTypes = [
    {
      category: 'laboratory',
      code: '33747003',
      display: 'Complete Blood Count',
      system: 'http://snomed.info/sct'
    },
    {
      category: 'laboratory',
      code: '14682004',
      display: 'Comprehensive Metabolic Panel',
      system: 'http://snomed.info/sct'
    },
    {
      category: 'radiology',
      code: '168537006',
      display: 'Chest X-ray',
      system: 'http://snomed.info/sct'
    },
    {
      category: 'radiology',
      code: '241615005',
      display: 'MRI Brain',
      system: 'http://snomed.info/sct'
    },
    {
      category: 'medication',
      code: '182836005',
      display: 'Prescription',
      system: 'http://snomed.info/sct'
    }
  ];

  const requestStatuses = ['active', 'completed', 'on-hold', 'cancelled'];
  const priorities = ['routine', 'urgent', 'asap', 'stat'];

  for (let i = 0; i < count; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const practitioner = practitioners[Math.floor(Math.random() * practitioners.length)];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const status = requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    // Generate authored date (within last 60 days)
    const authoredDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);

    const serviceRequest = {
      resourceType: 'ServiceRequest',
      id: generateId('sr'),
      status: status,
      intent: 'order',
      priority: priority,
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: orderType.category,
              display: orderType.category.charAt(0).toUpperCase() + orderType.category.slice(1)
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: orderType.system,
            code: orderType.code,
            display: orderType.display
          }
        ]
      },
      subject: {
        reference: `Patient/${patient.id}`,
        display: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`
      },
      authoredOn: authoredDate.toISOString(),
      requester: {
        reference: `Practitioner/${practitioner.id}`,
        display: `${practitioner.name[0].prefix[0]} ${practitioner.name[0].given[0]} ${practitioner.name[0].family}`
      },
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '182836005',
              display: 'Review of systems'
            }
          ]
        }
      ]
    };

    // Add occurrence timing for future orders
    if (status === 'active' && Math.random() < 0.5) {
      const occurrenceDate = new Date(authoredDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
      serviceRequest.occurrenceDateTime = occurrenceDate.toISOString();
    }

    serviceRequests.push(serviceRequest);
  }

  return serviceRequests;
}

module.exports = {
  generateAppointments,
  generateCommunications,
  generateServiceRequests
};