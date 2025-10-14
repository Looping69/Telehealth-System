/**
 * Main entry point for the Telehealth System application
 * Uses custom authentication system instead of MedplumProvider
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initializeErrorHandling } from './utils/errorHandler';

// Initialize error handling to suppress browser extension errors
initializeErrorHandling();

/**
 * Render the application with custom authentication
 * Note: We use our own auth store instead of MedplumProvider
 */
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}