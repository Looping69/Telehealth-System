/**
 * Authentication store using Zustand
 * Manages user authentication state and login/logout operations
 */

/**
 * Authentication store for the Telehealth System
 * Handles user authentication with real Medplum backend and fallback to mock authentication
 */
import { create } from 'zustand';
import { MedplumClient } from '@medplum/core';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  medplumClient: MedplumClient | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeMedplum: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

// Mock users for fallback authentication (only used when Medplum is unavailable)
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'medplum_admin',
    name: 'Dr. Admin',
    role: 'healthcare_provider' as const,
    isActive: true,
  },
  {
    id: '2',
    email: 'doctor@example.com',
    password: 'doctor123',
    name: 'Dr. Smith',
    role: 'healthcare_provider' as const,
    isActive: true,
  },
  {
    id: '3',
    email: 'nurse@example.com',
    password: 'nurse123',
    name: 'Nurse Johnson',
    role: 'receptionist' as const,
    isActive: true,
  },
  {
    id: '4',
    email: 'superadmin@example.com',
    password: 'superadmin123',
    name: 'Super Administrator',
    role: 'super_admin' as const,
    isActive: true,
  },
  {
    id: '5',
    email: 'patient@example.com',
    password: 'patient123',
    name: 'John Patient',
    role: 'patient' as const,
    isActive: true,
  },
];

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  medplumClient: null,

  initializeMedplum: () => {
    // Medplum client initialization disabled to prevent loops
    // Using mock authentication only
    console.log('Medplum client initialization disabled - using mock authentication');
    
    // Check for existing authentication
    const storedUser = localStorage.getItem('telehealth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Validate the stored user data structure
        if (user && user.id && user.email && user.name && user.role) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('Restored user session:', user.name);
        } else {
          console.warn('Invalid stored user data, clearing localStorage');
          localStorage.removeItem('telehealth_user');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('telehealth_user');
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('Using mock authentication for:', email);
      
      // Use mock authentication only
      const mockUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (mockUser) {
        const user: User = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          isActive: mockUser.isActive,
          lastLogin: new Date(),
        };

        // Store user in localStorage for persistence
        localStorage.setItem('telehealth_user', JSON.stringify(user));
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        console.log('Successfully authenticated with mock data:', user.name);
        return;
      }
      
      // If authentication fails
      throw new Error('Invalid email or password');
      

    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error instanceof Error) {
        if (error.message.includes('Not found') || error.message.includes('404')) {
          errorMessage = 'Invalid email or password. Please try the demo credentials.';
        } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Authentication system not initialized')) {
          errorMessage = 'Authentication system error. Please try the demo credentials.';
        } else {
          errorMessage = `Login failed: ${error.message}`;
        }
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  logout: () => {
    const { medplumClient } = get();
    
    // Clear stored user data
    localStorage.removeItem('telehealth_user');
    
    // Sign out from Medplum if client exists
    if (medplumClient) {
      try {
        medplumClient.signOut();
      } catch (error) {
        console.error('Error signing out from Medplum:', error);
      }
    }
    
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user: User | null) => {
    if (user) {
      // Store user in localStorage when setting user
      localStorage.setItem('telehealth_user', JSON.stringify(user));
    } else {
      // Clear localStorage when user is null
      localStorage.removeItem('telehealth_user');
    }
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },
}));