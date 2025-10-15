/**
 * Type definitions for the multi-step form system
 * Purpose: Provides type safety for form configuration and data handling
 */

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'scale';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuestionValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  pattern?: string;
  required?: boolean;
}

export interface Question {
  /** Unique identifier for the question */
  id: string;
  /** Question type determines the input control */
  type: QuestionType;
  /** Main question text displayed to user */
  text: string;
  /** Optional description for additional context */
  description?: string;
  /** Placeholder text for input fields */
  placeholder?: string;
  /** Help text shown below the input */
  helpText?: string;
  /** Whether this question is required */
  required: boolean;
  /** Available options for select, radio, checkbox types */
  options?: (string | QuestionOption)[];
  /** Validation rules for the question */
  validation?: QuestionValidation;
  /** Labels for scale endpoints */
  scaleLabels?: {
    min: string;
    max: string;
  };
  /** Conditional logic - show this question only if condition is met */
  condition?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
}

export interface FormAnswer {
  /** ID of the question this answer belongs to */
  questionId: string;
  /** The actual answer value */
  value: string | number | boolean | string[] | Date | null;
  /** Timestamp when answer was provided */
  timestamp: string;
}

export interface FormData {
  /** Unique identifier for the form */
  id: string;
  /** Form title displayed to users */
  title: string;
  /** Optional description of the form's purpose */
  description?: string;
  /** Category for organizing forms */
  category: FormCategory;
  /** Array of questions in the form */
  questions: Question[];
  /** Estimated completion time in minutes */
  estimatedTime?: number;
  /** Form version for tracking changes */
  version: string;
  /** Whether the form is currently active */
  active: boolean;
  /** Form status for management */
  status?: 'active' | 'inactive';
  /** ISO timestamp when form was created */
  createdAt: string;
  /** ISO timestamp when form was last updated */
  updatedAt: string;
}

export type FormCategory = 
  | 'patient_intake'
  | 'symptom_assessment'
  | 'medical_history'
  | 'medication_review'
  | 'follow_up'
  | 'satisfaction_survey'
  | 'consent_form'
  | 'insurance_verification'
  | 'appointment_booking'
  | 'custom';

export interface FormSubmission {
  /** Unique identifier for the submission */
  id: string;
  /** ID of the form that was submitted */
  formId: string;
  /** ID of the patient who submitted the form */
  patientId: string;
  /** All answers provided in the form */
  answers: Record<string, FormAnswer>;
  /** Submission status */
  status: 'draft' | 'submitted' | 'reviewed' | 'archived';
  /** When the form was started */
  startedAt: string;
  /** When the form was submitted */
  submittedAt?: string;
  /** Time taken to complete the form in seconds */
  completionTime?: number;
  /** IP address of the submitter */
  ipAddress?: string;
  /** User agent of the submitter */
  userAgent?: string;
}

export interface FormTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Form category */
  category: FormCategory;
  /** Template form data */
  formData: Omit<FormData, 'id' | 'createdAt' | 'updatedAt'>;
}

// Utility types for form handling
export type FormAnswers = Record<string, FormAnswer>;
export type FormErrors = Record<string, string>;
export type FormValidationResult = {
  isValid: boolean;
  errors: FormErrors;
};

// Event handlers
export type FormSubmitHandler = (answers: FormAnswers) => void | Promise<void>;
export type FormCancelHandler = () => void;
export type FormAnswerChangeHandler = (questionId: string, answer: FormAnswer) => void;