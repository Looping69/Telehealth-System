/**
 * Type definitions for the Telehealth Dashboard application
 * Defines user roles, authentication state, and common data structures
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
}

export type UserRole = 
  | 'super_admin'
  | 'healthcare_provider' 
  | 'practice_manager'
  | 'receptionist'
  | 'billing_specialist';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Patient {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  address?: string | Address;
  insurance?: string | Insurance;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
  lastVisit?: Date;
  nextAppointment?: Date | null;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expirationDate?: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  providerId: string;
  providerName?: string;
  title?: string;
  description?: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type: 'consultation' | 'follow-up' | 'emergency' | 'mental-health' | 'chronic-care' | 'specialist' | 'sports-medicine' | 'pain-management';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  sessionType?: 'video' | 'phone' | 'in-person';
  meetingLink?: string | null;
  symptoms?: string[];
  diagnosis?: string | null;
  prescription?: string | null;
  followUpRequired?: boolean;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  provider: string;
  type: 'lab' | 'prescription' | 'referral' | 'imaging';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'approved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  orderDate: string;
  dueDate?: Date | string;
  notes?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  createdBy?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date | string;
  createdDate?: Date | string;
  completedDate?: Date | string;
  patientId?: string;
  patientName?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  availability?: ProviderAvailability[];
}

export interface ProviderAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Message {
  id: string;
  threadId?: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  recipientId: string;
  recipientName?: string;
  recipientRole?: string;
  subject?: string;
  content: string;
  type: 'text' | 'file' | 'image';
  timestamp?: string;
  status?: 'delivered' | 'read' | 'pending';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  attachments?: any[];
  messageType?: 'clinical' | 'administrative';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface DashboardMetrics {
  totalPatients: number;
  todayAppointments: number;
  pendingOrders: number;
  monthlyRevenue: number;
  patientGrowth: number;
  appointmentTrends: ChartData[];
  revenueData: ChartData[];
}

export interface ChartData {
  label: string;
  value: number;
  date?: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}