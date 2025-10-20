/**
 * Mock Data Hooks for Non-Medplum Pages
 * Provides mock data for development and testing without API calls
 */

import { useState, useEffect } from 'react';
import { Patient, Appointment, Order, Message, PaginatedResponse } from '../types';

/**
 * Mock Patient Data
 */
const mockPatients: Patient[] = [
  {
    id: 'PAT-001',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'female',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'USA'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789',
      groupNumber: 'GRP001'
    },
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10'),
    emergencyContact: 'John Johnson - (555) 987-6543',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Shellfish'],
    lastVisit: new Date('2024-01-05'),
    nextAppointment: new Date('2024-02-15')
  },
  {
    id: 'PAT-002',
    name: 'Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1978-07-22',
    gender: 'male',
    address: {
      street: '456 Oak Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET987654321',
      groupNumber: 'GRP002'
    },
    status: 'active',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-08'),
    emergencyContact: 'Lisa Chen - (555) 876-5432',
    medicalHistory: ['Asthma'],
    allergies: ['Pollen'],
    lastVisit: new Date('2023-12-20'),
    nextAppointment: new Date('2024-01-25')
  },
  {
    id: 'PAT-003',
    name: 'Emma Davis',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1992-11-08',
    gender: 'female',
    address: {
      street: '789 Pine St',
      city: 'Rockford',
      state: 'IL',
      zipCode: '61101',
      country: 'USA'
    },
    insurance: {
      provider: 'United Healthcare',
      policyNumber: 'UHC456789123',
      groupNumber: 'GRP003'
    },
    status: 'active',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2024-01-12'),
    emergencyContact: 'Robert Davis - (555) 765-4321',
    medicalHistory: ['Migraine'],
    allergies: ['Latex'],
    lastVisit: new Date('2024-01-10'),
    nextAppointment: null
  },
  {
    id: 'PAT-004',
    name: 'James Wilson',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: '1965-05-30',
    gender: 'male',
    address: {
      street: '321 Elm St',
      city: 'Peoria',
      state: 'IL',
      zipCode: '61602',
      country: 'USA'
    },
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG789123456',
      groupNumber: 'GRP004'
    },
    status: 'active',
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2024-01-15'),
    emergencyContact: 'Mary Wilson - (555) 654-3210',
    medicalHistory: ['High Cholesterol', 'Arthritis'],
    allergies: ['Aspirin'],
    lastVisit: new Date('2023-12-15'),
    nextAppointment: new Date('2024-02-01')
  }
];

/**
 * Mock Appointment Data
 */
const mockAppointments: Appointment[] = [
  {
    id: 'APT-001',
    patientId: 'PAT-001',
    patientName: 'Sarah Johnson',
    providerId: 'DR-001',
    providerName: 'Dr. Smith',
    title: 'Annual Checkup',
    description: 'Routine annual physical examination',
    date: new Date('2024-01-25T10:00:00'),
    duration: 60,
    status: 'scheduled',
    type: 'consultation',
    sessionType: 'video',
    notes: 'Patient requested video consultation',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    meetingLink: 'https://meet.example.com/room/apt001',
    symptoms: ['General checkup'],
    followUpRequired: false
  },
  {
    id: 'APT-002',
    patientId: 'PAT-002',
    patientName: 'Michael Chen',
    providerId: 'DR-002',
    providerName: 'Dr. Johnson',
    title: 'Follow-up Visit',
    description: 'Follow-up for asthma management',
    date: new Date('2024-01-20T14:30:00'),
    duration: 30,
    status: 'completed',
    type: 'follow-up',
    sessionType: 'in-person',
    notes: 'Patient doing well on current medication',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
    symptoms: ['Shortness of breath'],
    diagnosis: 'Asthma - well controlled',
    prescription: 'Continue current inhaler',
    followUpRequired: true
  },
  {
    id: 'APT-003',
    patientId: 'PAT-003',
    patientName: 'Emma Davis',
    providerId: 'DR-003',
    providerName: 'Dr. Brown',
    title: 'Migraine Consultation',
    description: 'Consultation for recurring migraines',
    date: new Date('2024-01-30T09:00:00'),
    duration: 45,
    status: 'scheduled',
    type: 'specialist',
    sessionType: 'video',
    notes: 'New patient referral for migraine management',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    meetingLink: 'https://meet.example.com/room/apt003',
    symptoms: ['Severe headaches', 'Light sensitivity'],
    followUpRequired: false
  },
  {
    id: 'APT-004',
    patientId: 'PAT-004',
    patientName: 'James Wilson',
    providerId: 'DR-001',
    providerName: 'Dr. Smith',
    title: 'Cholesterol Review',
    description: 'Review cholesterol levels and medication',
    date: new Date('2024-02-01T11:00:00'),
    duration: 30,
    status: 'scheduled',
    type: 'follow-up',
    sessionType: 'phone',
    notes: 'Phone consultation for lab results review',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    symptoms: ['High cholesterol'],
    followUpRequired: true
  }
];

/**
 * Mock Order Data
 */
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    patientId: 'PAT-001',
    patientName: 'Sarah Johnson',
    providerId: 'DR-001',
    provider: 'Dr. Smith',
    type: 'lab',
    title: 'Complete Blood Count',
    description: 'CBC with differential and platelet count',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2024-01-15'),
    orderDate: '2024-01-15',
    dueDate: '2024-01-22',
    notes: 'Fasting required - patient informed'
  },
  {
    id: 'ORD-002',
    patientId: 'PAT-002',
    patientName: 'Michael Chen',
    providerId: 'DR-002',
    provider: 'Dr. Johnson',
    type: 'prescription',
    title: 'Albuterol Inhaler',
    description: 'Albuterol sulfate HFA inhaler 90mcg',
    status: 'approved',
    priority: 'high',
    createdAt: new Date('2024-01-18'),
    orderDate: '2024-01-18',
    dueDate: '2024-01-25',
    notes: 'Patient needs refill before current inhaler expires'
  },
  {
    id: 'ORD-003',
    patientId: 'PAT-003',
    patientName: 'Emma Davis',
    providerId: 'DR-003',
    provider: 'Dr. Brown',
    type: 'imaging',
    title: 'Brain MRI',
    description: 'MRI brain with and without contrast',
    status: 'pending',
    priority: 'urgent',
    createdAt: new Date('2024-01-20'),
    orderDate: '2024-01-20',
    dueDate: '2024-01-27',
    notes: 'Rule out secondary causes of headache'
  },
  {
    id: 'ORD-004',
    patientId: 'PAT-004',
    patientName: 'James Wilson',
    providerId: 'DR-001',
    provider: 'Dr. Smith',
    type: 'lab',
    title: 'Lipid Panel',
    description: 'Comprehensive lipid panel with cholesterol ratios',
    status: 'completed',
    priority: 'medium',
    createdAt: new Date('2024-01-10'),
    orderDate: '2024-01-10',
    dueDate: '2024-01-17',
    notes: 'Follow-up for cholesterol management'
  }
];

/**
 * Mock Message Data
 */
const mockMessages: Message[] = [
  {
    id: 'MSG-001',
    threadId: 'THREAD-001',
    senderId: 'DR-001',
    recipientId: 'PAT-001',
    content: 'Hi Sarah, your recent blood work results are in. Overall, everything looks good. Your cholesterol levels have improved since your last visit.',
    type: 'text',
    isRead: false,
    createdAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: 'MSG-002',
    threadId: 'THREAD-001',
    senderId: 'PAT-001',
    recipientId: 'DR-001',
    content: 'Thank you for the update, Dr. Smith. Should I continue with my current medication regimen?',
    type: 'text',
    isRead: true,
    createdAt: new Date('2024-01-15T14:20:00')
  },
  {
    id: 'MSG-003',
    threadId: 'THREAD-002',
    senderId: 'STAFF-001',
    recipientId: 'PAT-002',
    content: 'This is a reminder that you have an appointment scheduled for tomorrow at 2:00 PM with Dr. Johnson.',
    type: 'text',
    isRead: false,
    createdAt: new Date('2024-01-15T16:00:00')
  },
  {
    id: 'MSG-004',
    threadId: 'THREAD-003',
    senderId: 'DR-002',
    recipientId: 'PAT-003',
    content: 'Your prescription refill request has been approved. You can pick up your medication at the pharmacy.',
    type: 'text',
    isRead: true,
    createdAt: new Date('2024-01-15T11:45:00')
  }
];

/**
 * Mock usePatients Hook
 * Returns paginated patient data without API calls
 */
export const usePatients = (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter patients based on search and status
  let filteredPatients = mockPatients;
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredPatients = filteredPatients.filter(patient => 
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(params.search || '')
    );
  }

  if (params?.status && params.status !== 'all') {
    filteredPatients = filteredPatients.filter(patient => patient.status === params.status);
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const data: PaginatedResponse<Patient> = {
    data: paginatedPatients,
    total: filteredPatients.length,
    page,
    limit,
    hasNext: endIndex < filteredPatients.length,
    hasPrev: page > 1
  };

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };
};

/**
 * Mock useAppointments Hook
 * Returns appointment data without API calls
 */
export const useAppointments = (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter appointments based on search and status
  let filteredAppointments = mockAppointments;
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredAppointments = filteredAppointments.filter(appointment => 
      appointment.patientName?.toLowerCase().includes(searchLower) ||
      appointment.providerName?.toLowerCase().includes(searchLower) ||
      appointment.title?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.status && params.status !== 'all') {
    filteredAppointments = filteredAppointments.filter(appointment => appointment.status === params.status);
  }

  return {
    data: filteredAppointments,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };
};

/**
 * Mock useOrders Hook
 * Returns order data without API calls
 */
export const useOrders = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter orders based on search, status, and type
  let filteredOrders = mockOrders;
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredOrders = filteredOrders.filter(order => 
      order.patientName.toLowerCase().includes(searchLower) ||
      order.title.toLowerCase().includes(searchLower) ||
      order.description.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  }

  if (params?.status && params.status !== 'all') {
    filteredOrders = filteredOrders.filter(order => order.status === params.status);
  }

  if (params?.type && params.type !== 'all') {
    filteredOrders = filteredOrders.filter(order => order.type === params.type);
  }

  return {
    data: filteredOrders,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };
};

/**
 * Mock useMessages Hook
 * Returns message data without API calls
 */
export const useMessages = (params?: { page?: number; limit?: number; search?: string; threadId?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter messages based on search and thread
  let filteredMessages = mockMessages;
  
  if (params?.threadId) {
    filteredMessages = filteredMessages.filter(message => message.threadId === params.threadId);
  }

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredMessages = filteredMessages.filter(message => 
      message.content.toLowerCase().includes(searchLower)
    );
  }

  return {
    data: filteredMessages,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };
};