/**
 * Pre-defined form templates for common healthcare scenarios
 * Purpose: Provides ready-to-use form configurations for medical data collection
 */

import { FormTemplate, FormData } from '../types/forms';

/**
 * Patient Intake Form Template
 * Comprehensive form for new patient registration and basic information
 */
export const patientIntakeTemplate: FormTemplate = {
  id: 'patient-intake',
  name: 'Patient Intake Form',
  description: 'Comprehensive intake form for new patients',
  category: 'patient_intake',
  formData: {
    title: 'Patient Intake Form',
    description: 'Please provide your basic information and medical history to help us serve you better.',
    category: 'patient_intake',
    questions: [
      {
        id: 'full-name',
        type: 'text',
        text: 'What is your full name?',
        placeholder: 'Enter your full name',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
      },
      {
        id: 'date-of-birth',
        type: 'date',
        text: 'What is your date of birth?',
        required: true,
      },
      {
        id: 'gender',
        type: 'radio',
        text: 'What is your gender?',
        required: true,
        options: [
          'Male',
          'Female',
          'Non-binary',
          'Prefer not to say',
        ],
      },
      {
        id: 'phone',
        type: 'text',
        text: 'What is your phone number?',
        placeholder: '(555) 123-4567',
        required: true,
        validation: {
          pattern: '^[\\+]?[1-9]?[0-9]{7,15}$',
        },
      },
      {
        id: 'email',
        type: 'email',
        text: 'What is your email address?',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: 'address',
        type: 'textarea',
        text: 'What is your home address?',
        placeholder: 'Street address, City, State, ZIP code',
        required: true,
        validation: {
          minLength: 10,
          maxLength: 200,
        },
      },
      {
        id: 'emergency-contact-name',
        type: 'text',
        text: 'Emergency contact name',
        placeholder: 'Full name of emergency contact',
        required: true,
      },
      {
        id: 'emergency-contact-phone',
        type: 'text',
        text: 'Emergency contact phone number',
        placeholder: '(555) 123-4567',
        required: true,
      },
      {
        id: 'insurance-provider',
        type: 'text',
        text: 'What is your insurance provider?',
        placeholder: 'e.g., Blue Cross Blue Shield',
        required: false,
      },
      {
        id: 'primary-care-physician',
        type: 'text',
        text: 'Who is your primary care physician?',
        placeholder: 'Dr. Name or clinic name',
        required: false,
      },
    ],
    estimatedTime: 8,
    version: '1.0',
    active: true,
  },
};

/**
 * Symptom Assessment Form Template
 * For evaluating patient symptoms and severity
 */
export const symptomAssessmentTemplate: FormTemplate = {
  id: 'symptom-assessment',
  name: 'Symptom Assessment',
  description: 'Detailed assessment of current symptoms',
  category: 'symptom_assessment',
  formData: {
    title: 'Symptom Assessment',
    description: 'Help us understand your current symptoms so we can provide the best care.',
    category: 'symptom_assessment',
    questions: [
      {
        id: 'chief-complaint',
        type: 'textarea',
        text: 'What is your main concern or symptom today?',
        placeholder: 'Describe your primary symptom or reason for visit',
        required: true,
        validation: {
          minLength: 10,
          maxLength: 500,
        },
      },
      {
        id: 'symptom-duration',
        type: 'select',
        text: 'How long have you been experiencing this symptom?',
        required: true,
        options: [
          'Less than 1 day',
          '1-3 days',
          '4-7 days',
          '1-2 weeks',
          '2-4 weeks',
          '1-3 months',
          'More than 3 months',
        ],
      },
      {
        id: 'pain-scale',
        type: 'scale',
        text: 'On a scale of 1-10, how would you rate your pain or discomfort?',
        required: true,
        validation: {
          min: 1,
          max: 10,
        },
        scaleLabels: {
          min: 'No pain',
          max: 'Worst pain',
        },
      },
      {
        id: 'symptom-frequency',
        type: 'radio',
        text: 'How often do you experience this symptom?',
        required: true,
        options: [
          'Constantly',
          'Several times a day',
          'Once a day',
          'Several times a week',
          'Once a week',
          'Occasionally',
        ],
      },
      {
        id: 'associated-symptoms',
        type: 'checkbox',
        text: 'Are you experiencing any of these additional symptoms?',
        required: false,
        options: [
          'Fever',
          'Nausea',
          'Headache',
          'Fatigue',
          'Dizziness',
          'Shortness of breath',
          'Chest pain',
          'Abdominal pain',
        ],
      },
      {
        id: 'triggers',
        type: 'textarea',
        text: 'What makes your symptoms better or worse?',
        placeholder: 'Describe any triggers, activities, or treatments that affect your symptoms',
        required: false,
        validation: {
          maxLength: 300,
        },
      },
      {
        id: 'medications-taken',
        type: 'textarea',
        text: 'Have you taken any medications for this symptom?',
        placeholder: 'List any over-the-counter or prescription medications',
        required: false,
        validation: {
          maxLength: 200,
        },
      },
      {
        id: 'previous-episodes',
        type: 'boolean',
        text: 'Have you experienced this symptom before?',
        required: true,
      },
    ],
    estimatedTime: 6,
    version: '1.0',
    active: true,
  },
};

/**
 * Medical History Form Template
 * Comprehensive medical history collection
 */
export const medicalHistoryTemplate: FormTemplate = {
  id: 'medical-history',
  name: 'Medical History',
  description: 'Complete medical history assessment',
  category: 'medical_history',
  formData: {
    title: 'Medical History',
    description: 'Please provide information about your medical history to ensure safe and effective care.',
    category: 'medical_history',
    questions: [
      {
        id: 'chronic-conditions',
        type: 'checkbox',
        text: 'Do you have any of the following chronic conditions?',
        required: false,
        options: [
          'Diabetes',
          'High blood pressure',
          'Heart disease',
          'Asthma',
          'COPD',
          'Arthritis',
          'Depression',
          'Anxiety',
          'Thyroid disorder',
          'Kidney disease',
          'Liver disease',
          'Cancer',
        ],
      },
      {
        id: 'current-medications',
        type: 'textarea',
        text: 'List all medications you are currently taking',
        placeholder: 'Include prescription medications, over-the-counter drugs, and supplements',
        required: false,
        validation: {
          maxLength: 500,
        },
      },
      {
        id: 'allergies',
        type: 'textarea',
        text: 'Do you have any known allergies?',
        placeholder: 'List any drug allergies, food allergies, or environmental allergies',
        required: false,
        validation: {
          maxLength: 300,
        },
      },
      {
        id: 'surgeries',
        type: 'textarea',
        text: 'Have you had any surgeries or hospitalizations?',
        placeholder: 'List surgeries with approximate dates',
        required: false,
        validation: {
          maxLength: 400,
        },
      },
      {
        id: 'family-history',
        type: 'checkbox',
        text: 'Does anyone in your immediate family have any of these conditions?',
        required: false,
        options: [
          'Heart disease',
          'Stroke',
          'Diabetes',
          'Cancer',
          'High blood pressure',
          'Mental health conditions',
          'Genetic disorders',
        ],
      },
      {
        id: 'smoking-status',
        type: 'radio',
        text: 'What is your smoking status?',
        required: true,
        options: [
          'Never smoked',
          'Former smoker',
          'Current smoker',
        ],
      },
      {
        id: 'alcohol-consumption',
        type: 'radio',
        text: 'How often do you consume alcohol?',
        required: true,
        options: [
          'Never',
          'Rarely (less than once a month)',
          'Occasionally (1-3 times per month)',
          'Regularly (1-2 times per week)',
          'Frequently (3+ times per week)',
          'Daily',
        ],
      },
      {
        id: 'exercise-frequency',
        type: 'radio',
        text: 'How often do you exercise?',
        required: true,
        options: [
          'Never',
          'Rarely (less than once a week)',
          '1-2 times per week',
          '3-4 times per week',
          '5+ times per week',
          'Daily',
        ],
      },
    ],
    estimatedTime: 10,
    version: '1.0',
    active: true,
  },
};

/**
 * Follow-up Visit Form Template
 * For tracking progress and ongoing care
 */
export const followUpTemplate: FormTemplate = {
  id: 'follow-up',
  name: 'Follow-up Visit',
  description: 'Progress assessment for ongoing care',
  category: 'follow_up',
  formData: {
    title: 'Follow-up Visit',
    description: 'Let us know how you\'re doing since your last visit.',
    category: 'follow_up',
    questions: [
      {
        id: 'overall-feeling',
        type: 'scale',
        text: 'Overall, how are you feeling compared to your last visit?',
        required: true,
        validation: {
          min: 1,
          max: 10,
        },
        scaleLabels: {
          min: 'Much worse',
          max: 'Much better',
        },
      },
      {
        id: 'medication-compliance',
        type: 'radio',
        text: 'How well have you been taking your prescribed medications?',
        required: true,
        options: [
          'Taking as prescribed',
          'Missing occasional doses',
          'Missing frequent doses',
          'Not taking medications',
          'No medications prescribed',
        ],
      },
      {
        id: 'side-effects',
        type: 'boolean',
        text: 'Have you experienced any side effects from your medications?',
        required: true,
      },
      {
        id: 'side-effects-description',
        type: 'textarea',
        text: 'Please describe any side effects you\'ve experienced',
        placeholder: 'Describe the side effects and their severity',
        required: false,
        condition: {
          questionId: 'side-effects',
          operator: 'equals',
          value: true,
        },
        validation: {
          maxLength: 300,
        },
      },
      {
        id: 'symptom-improvement',
        type: 'radio',
        text: 'How have your symptoms changed since your last visit?',
        required: true,
        options: [
          'Significantly improved',
          'Somewhat improved',
          'No change',
          'Somewhat worse',
          'Significantly worse',
        ],
      },
      {
        id: 'new-concerns',
        type: 'textarea',
        text: 'Do you have any new concerns or symptoms?',
        placeholder: 'Describe any new issues you\'d like to discuss',
        required: false,
        validation: {
          maxLength: 400,
        },
      },
      {
        id: 'lifestyle-changes',
        type: 'textarea',
        text: 'Have you made any lifestyle changes as recommended?',
        placeholder: 'Diet, exercise, sleep, stress management, etc.',
        required: false,
        validation: {
          maxLength: 300,
        },
      },
      {
        id: 'questions-concerns',
        type: 'textarea',
        text: 'What questions or concerns would you like to discuss today?',
        placeholder: 'Any questions about your condition, treatment, or care',
        required: false,
        validation: {
          maxLength: 400,
        },
      },
    ],
    estimatedTime: 5,
    version: '1.0',
    active: true,
  },
};

/**
 * All available form templates
 */
export const formTemplates: FormTemplate[] = [
  patientIntakeTemplate,
  symptomAssessmentTemplate,
  medicalHistoryTemplate,
  followUpTemplate,
];

/**
 * Get form template by ID
 */
export function getFormTemplate(id: string): FormTemplate | undefined {
  return formTemplates.find(template => template.id === id);
}

/**
 * Get form templates by category
 */
export function getFormTemplatesByCategory(category: string): FormTemplate[] {
  return formTemplates.filter(template => template.category === category);
}

/**
 * Create a new form from template
 */
export function createFormFromTemplate(templateId: string, customizations?: Partial<FormData>): FormData | null {
  const template = getFormTemplate(templateId);
  if (!template) return null;

  const now = new Date().toISOString();
  return {
    id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...template.formData,
    ...customizations,
    createdAt: now,
    updatedAt: now,
  };
}