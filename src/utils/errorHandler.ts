/**
 * Error handling utilities for the Telehealth System
 * Provides centralized error handling and suppression for browser extension errors
 */

/**
 * Suppresses browser extension errors that we cannot control
 * These errors are typically from React DevTools or other browser extensions
 */
export function suppressBrowserExtensionErrors(): void {
  // Store the original console.error function
  const originalConsoleError = console.error;

  // Override console.error to filter out browser extension errors
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // List of error patterns to suppress
    const suppressedPatterns = [
      'Attempting to use a disconnected port object',
      'proxy.js',
      'backendManager.js',
      'bridge.js',
      'Extension context invalidated',
      'Could not establish connection',
      'The message port closed before a response was received',
      'chrome-extension://',
      'moz-extension://',
      'Medplum client already initialized',
      'handleMessageFromPage',
      'postMessage',
      'send @',
    ];

    // Check if the error matches any suppressed patterns
    const shouldSuppress = suppressedPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    // Only log the error if it's not a browser extension error
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };

  // Also handle window.onerror for uncaught errors
  const originalWindowError = window.onerror;
  
  window.onerror = (message, source, lineno, colno, error) => {
    const errorString = message?.toString() || '';
    const sourceString = source?.toString() || '';
    
    // Suppress browser extension errors
    const suppressedPatterns = [
      'Attempting to use a disconnected port object',
      'proxy.js',
      'backendManager.js',
      'bridge.js',
      'chrome-extension://',
      'moz-extension://',
      'Medplum client already initialized',
      'handleMessageFromPage',
      'postMessage',
      'send @',
    ];

    const shouldSuppress = suppressedPatterns.some(pattern => 
      errorString.toLowerCase().includes(pattern.toLowerCase()) ||
      sourceString.toLowerCase().includes(pattern.toLowerCase())
    );

    if (!shouldSuppress && originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error);
    }

    // Return true to prevent the default browser error handling
    return shouldSuppress;
  };

  // Handle unhandled promise rejections
  const originalUnhandledRejection = window.onunhandledrejection;
  
  window.addEventListener('unhandledrejection', function(event: PromiseRejectionEvent) {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    
    const suppressedPatterns = [
      'Attempting to use a disconnected port object',
      'proxy.js',
      'backendManager.js',
      'bridge.js',
      'chrome-extension://',
      'moz-extension://',
      'Medplum client already initialized',
      'handleMessageFromPage',
      'postMessage',
      'send @',
    ];

    const shouldSuppress = suppressedPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    if (shouldSuppress) {
      event.preventDefault();
      return;
    }

    if (originalUnhandledRejection) {
      originalUnhandledRejection.call(this, event);
    }
  });
}

/**
 * Initialize error handling for the application
 * Call this once at application startup
 */
export function initializeErrorHandling(): void {
  suppressBrowserExtensionErrors();
  
  console.log('Error handling initialized - browser extension errors will be suppressed');
}