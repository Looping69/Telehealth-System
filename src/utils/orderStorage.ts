/**
 * Utility functions for managing orders in localStorage
 * This ensures newly created orders persist and appear in the orders list
 */

const ORDERS_STORAGE_KEY = 'medplum_created_orders';

export interface StoredOrder {
  resourceType: 'ServiceRequest' | 'MedicationRequest';
  id: string;
  status: string;
  intent: string;
  priority: string;
  subject: {
    reference: string;
    display: string;
  };
  code?: {
    text: string;
    coding?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  medicationCodeableConcept?: {
    text: string;
    coding?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  authoredOn: string;
  requester?: {
    display: string;
  };
  note?: Array<{
    text: string;
  }>;
  dosageInstruction?: Array<{
    text: string;
  }>;
}

/**
 * Get all stored orders from localStorage
 */
export function getStoredOrders(): StoredOrder[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!stored) return [];
    
    const orders = JSON.parse(stored);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error('Error reading stored orders:', error);
    return [];
  }
}

/**
 * Add a new order to localStorage
 */
export function addStoredOrder(order: StoredOrder): void {
  try {
    const existingOrders = getStoredOrders();
    
    // Check if order already exists (avoid duplicates)
    const orderExists = existingOrders.some(existing => existing.id === order.id);
    if (orderExists) {
      console.log('Order already exists in storage:', order.id);
      return;
    }
    
    // Add new order to the beginning of the array (most recent first)
    const updatedOrders = [order, ...existingOrders];
    
    // Keep only the last 50 orders to prevent localStorage from growing too large
    const trimmedOrders = updatedOrders.slice(0, 50);
    
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(trimmedOrders));
    console.log('Order stored successfully:', order.id);
  } catch (error) {
    console.error('Error storing order:', error);
  }
}

/**
 * Remove an order from localStorage
 */
export function removeStoredOrder(orderId: string): void {
  try {
    const existingOrders = getStoredOrders();
    const filteredOrders = existingOrders.filter(order => order.id !== orderId);
    
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filteredOrders));
    console.log('Order removed from storage:', orderId);
  } catch (error) {
    console.error('Error removing stored order:', error);
  }
}

/**
 * Clear all stored orders
 */
export function clearStoredOrders(): void {
  try {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    console.log('All stored orders cleared');
  } catch (error) {
    console.error('Error clearing stored orders:', error);
  }
}

/**
 * Update an existing stored order
 */
export function updateStoredOrder(orderId: string, updates: Partial<StoredOrder>): void {
  try {
    const existingOrders = getStoredOrders();
    const orderIndex = existingOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      console.warn('Order not found for update:', orderId);
      return;
    }
    
    // Update the order
    existingOrders[orderIndex] = { ...existingOrders[orderIndex], ...updates };
    
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existingOrders));
    console.log('Order updated in storage:', orderId);
  } catch (error) {
    console.error('Error updating stored order:', error);
  }
}