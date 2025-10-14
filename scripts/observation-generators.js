/**
 * Observation Generators for Vital Signs and Lab Results
 * 
 * Purpose: Generate realistic clinical observation data including vital signs and lab results
 * Inputs: Patient and Practitioner resources for reference integrity
 * Outputs: FHIR-compliant Observation resources with realistic medical values
 */

const { generateId, generateRandomDate } = require('./data-generators');

/**
 * Generate Observation resources for vital signs and lab results
 * @param {Array} patients - Array of patient resources
 * @param {Array} practitioners - Array of practitioner resources
 * @param {number} count - Number of observations to generate
 * @returns {Array} Array of Observation FHIR resources
 */
function generateObservations(patients, practitioners, count = 300) {
  const observations = [];
  
  // Define observation types with realistic value ranges
  const observationTypes = [
    // Vital Signs
    {
      category: 'vital-signs',
      code: '8480-6',
      display: 'Systolic blood pressure',
      system: 'http://loinc.org',
      unit: 'mmHg',
      valueRange: { min: 90, max: 180 },
      normalRange: { min: 90, max: 140 }
    },
    {
      category: 'vital-signs',
      code: '8462-4',
      display: 'Diastolic blood pressure',
      system: 'http://loinc.org',
      unit: 'mmHg',
      valueRange: { min: 60, max: 120 },
      normalRange: { min: 60, max: 90 }
    },
    {
      category: 'vital-signs',
      code: '8867-4',
      display: 'Heart rate',
      system: 'http://loinc.org',
      unit: '/min',
      valueRange: { min: 50, max: 120 },
      normalRange: { min: 60, max: 100 }
    },
    {
      category: 'vital-signs',
      code: '8310-5',
      display: 'Body temperature',
      system: 'http://loinc.org',
      unit: 'Cel',
      valueRange: { min: 35.0, max: 40.0 },
      normalRange: { min: 36.1, max: 37.2 },
      decimal: true
    },
    {
      category: 'vital-signs',
      code: '29463-7',
      display: 'Body weight',
      system: 'http://loinc.org',
      unit: 'kg',
      valueRange: { min: 40, max: 150 },
      normalRange: { min: 50, max: 100 },
      decimal: true
    },
    {
      category: 'vital-signs',
      code: '8302-2',
      display: 'Body height',
      system: 'http://loinc.org',
      unit: 'cm',
      valueRange: { min: 140, max: 200 },
      normalRange: { min: 150, max: 190 }
    },
    
    // Laboratory Results
    {
      category: 'laboratory',
      code: '718-7',
      display: 'Hemoglobin',
      system: 'http://loinc.org',
      unit: 'g/dL',
      valueRange: { min: 8.0, max: 18.0 },
      normalRange: { min: 12.0, max: 16.0 },
      decimal: true
    },
    {
      category: 'laboratory',
      code: '4544-3',
      display: 'Hematocrit',
      system: 'http://loinc.org',
      unit: '%',
      valueRange: { min: 25, max: 55 },
      normalRange: { min: 36, max: 48 },
      decimal: true
    },
    {
      category: 'laboratory',
      code: '2339-0',
      display: 'Glucose',
      system: 'http://loinc.org',
      unit: 'mg/dL',
      valueRange: { min: 60, max: 300 },
      normalRange: { min: 70, max: 100 }
    },
    {
      category: 'laboratory',
      code: '2093-3',
      display: 'Cholesterol, Total',
      system: 'http://loinc.org',
      unit: 'mg/dL',
      valueRange: { min: 120, max: 350 },
      normalRange: { min: 120, max: 200 }
    },
    {
      category: 'laboratory',
      code: '2571-8',
      display: 'Triglycerides',
      system: 'http://loinc.org',
      unit: 'mg/dL',
      valueRange: { min: 50, max: 400 },
      normalRange: { min: 50, max: 150 }
    },
    {
      category: 'laboratory',
      code: '33747003',
      display: 'White blood cell count',
      system: 'http://snomed.info/sct',
      unit: '10*3/uL',
      valueRange: { min: 3.0, max: 15.0 },
      normalRange: { min: 4.0, max: 11.0 },
      decimal: true
    }
  ];

  const observationStatuses = ['final', 'preliminary', 'amended'];

  for (let i = 0; i < count; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const practitioner = practitioners[Math.floor(Math.random() * practitioners.length)];
    const obsType = observationTypes[Math.floor(Math.random() * observationTypes.length)];
    const status = observationStatuses[Math.floor(Math.random() * observationStatuses.length)];

    // Generate effective date (within last 180 days)
    const effectiveDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);

    // Generate realistic value within range
    let value;
    if (Math.random() < 0.8) {
      // 80% chance of normal values
      value = obsType.normalRange.min + Math.random() * (obsType.normalRange.max - obsType.normalRange.min);
    } else {
      // 20% chance of abnormal values
      if (Math.random() < 0.5) {
        // Below normal
        value = obsType.valueRange.min + Math.random() * (obsType.normalRange.min - obsType.valueRange.min);
      } else {
        // Above normal
        value = obsType.normalRange.max + Math.random() * (obsType.valueRange.max - obsType.normalRange.max);
      }
    }

    // Round value appropriately
    if (obsType.decimal) {
      value = Math.round(value * 10) / 10;
    } else {
      value = Math.round(value);
    }

    const observation = {
      resourceType: 'Observation',
      id: generateId('obs'),
      status: status,
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: obsType.category,
              display: obsType.category === 'vital-signs' ? 'Vital Signs' : 'Laboratory'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: obsType.system,
            code: obsType.code,
            display: obsType.display
          }
        ]
      },
      subject: {
        reference: `Patient/${patient.id}`,
        display: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`
      },
      effectiveDateTime: effectiveDate.toISOString(),
      performer: [
        {
          reference: `Practitioner/${practitioner.id}`,
          display: `${practitioner.name[0].prefix[0]} ${practitioner.name[0].given[0]} ${practitioner.name[0].family}`
        }
      ],
      valueQuantity: {
        value: value,
        unit: obsType.unit,
        system: 'http://unitsofmeasure.org',
        code: obsType.unit
      }
    };

    // Add reference range
    observation.referenceRange = [
      {
        low: {
          value: obsType.normalRange.min,
          unit: obsType.unit,
          system: 'http://unitsofmeasure.org',
          code: obsType.unit
        },
        high: {
          value: obsType.normalRange.max,
          unit: obsType.unit,
          system: 'http://unitsofmeasure.org',
          code: obsType.unit
        },
        text: 'Normal Range'
      }
    ];

    // Add interpretation for abnormal values
    if (value < obsType.normalRange.min) {
      observation.interpretation = [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'L',
              display: 'Low'
            }
          ]
        }
      ];
    } else if (value > obsType.normalRange.max) {
      observation.interpretation = [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'H',
              display: 'High'
            }
          ]
        }
      ];
    } else {
      observation.interpretation = [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'N',
              display: 'Normal'
            }
          ]
        }
      ];
    }

    // Add note for abnormal values
    if (value < obsType.normalRange.min || value > obsType.normalRange.max) {
      observation.note = [
        {
          text: `${obsType.display} is ${value < obsType.normalRange.min ? 'below' : 'above'} normal range. Follow-up recommended.`
        }
      ];
    }

    observations.push(observation);
  }

  return observations;
}

/**
 * Generate BMI observations based on height and weight
 * @param {Array} patients - Array of patient resources
 * @param {Array} practitioners - Array of practitioner resources
 * @param {Array} heightWeightObs - Array of height and weight observations
 * @returns {Array} Array of BMI Observation FHIR resources
 */
function generateBMIObservations(patients, practitioners, heightWeightObs) {
  const bmiObservations = [];
  
  // Group observations by patient
  const patientObs = {};
  heightWeightObs.forEach(obs => {
    const patientRef = obs.subject.reference;
    if (!patientObs[patientRef]) {
      patientObs[patientRef] = {};
    }
    
    if (obs.code.coding[0].code === '8302-2') { // Height
      patientObs[patientRef].height = obs;
    } else if (obs.code.coding[0].code === '29463-7') { // Weight
      patientObs[patientRef].weight = obs;
    }
  });

  // Generate BMI for patients with both height and weight
  Object.entries(patientObs).forEach(([patientRef, obs]) => {
    if (obs.height && obs.weight) {
      const patient = patients.find(p => `Patient/${p.id}` === patientRef);
      const practitioner = practitioners[Math.floor(Math.random() * practitioners.length)];
      
      const heightCm = obs.height.valueQuantity.value;
      const weightKg = obs.weight.valueQuantity.value;
      const heightM = heightCm / 100;
      const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

      const bmiObservation = {
        resourceType: 'Observation',
        id: generateId('obs'),
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '39156-5',
              display: 'Body mass index (BMI) [Ratio]'
            }
          ]
        },
        subject: {
          reference: patientRef,
          display: patient ? `${patient.name[0].given.join(' ')} ${patient.name[0].family}` : 'Unknown Patient'
        },
        effectiveDateTime: obs.weight.effectiveDateTime,
        performer: [
          {
            reference: `Practitioner/${practitioner.id}`,
            display: `${practitioner.name[0].prefix[0]} ${practitioner.name[0].given[0]} ${practitioner.name[0].family}`
          }
        ],
        valueQuantity: {
          value: bmi,
          unit: 'kg/m2',
          system: 'http://unitsofmeasure.org',
          code: 'kg/m2'
        },
        derivedFrom: [
          {
            reference: `Observation/${obs.height.id}`
          },
          {
            reference: `Observation/${obs.weight.id}`
          }
        ]
      };

      // Add BMI interpretation
      if (bmi < 18.5) {
        bmiObservation.interpretation = [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'L',
                display: 'Low'
              }
            ]
          }
        ];
        bmiObservation.note = [{ text: 'BMI indicates underweight' }];
      } else if (bmi >= 18.5 && bmi < 25) {
        bmiObservation.interpretation = [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'N',
                display: 'Normal'
              }
            ]
          }
        ];
      } else if (bmi >= 25 && bmi < 30) {
        bmiObservation.interpretation = [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'H',
                display: 'High'
              }
            ]
          }
        ];
        bmiObservation.note = [{ text: 'BMI indicates overweight' }];
      } else {
        bmiObservation.interpretation = [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'HH',
                display: 'Critical high'
              }
            ]
          }
        ];
        bmiObservation.note = [{ text: 'BMI indicates obesity' }];
      }

      bmiObservations.push(bmiObservation);
    }
  });

  return bmiObservations;
}

module.exports = {
  generateObservations,
  generateBMIObservations
};