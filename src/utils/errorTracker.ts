// Frontend Error Tracking and Logging Utility
import { API_BASE_URL } from './api';

export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  componentStack?: string;
  errorType: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 50;

  private constructor() {
    this.initializeGlobalErrorHandlers();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  // Initialize global error handlers
  private initializeGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        errorType: 'UncaughtError',
        url: event.filename || window.location.href,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        errorType: 'UnhandledRejection',
        url: window.location.href,
      });
    });
  }

  // Log error to local storage and send to backend
  public logError(error: {
    message: string;
    stack?: string;
    errorType: string;
    url?: string;
    componentStack?: string;
    userId?: string;
  }) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      userId: error.userId || this.getCurrentUserId(),
      componentStack: error.componentStack,
      errorType: error.errorType,
    };

    // Add to queue
    this.errorQueue.push(errorLog);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }

    // Save to localStorage for persistence
    this.saveToLocalStorage(errorLog);

    // Send to backend
    this.sendToBackend(errorLog);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracker]', errorLog);
    }
  }

  // Save error to localStorage
  private saveToLocalStorage(errorLog: ErrorLog) {
    try {
      const existingErrors = this.getLocalErrors();
      existingErrors.push(errorLog);

      // Keep only last 100 errors
      const limitedErrors = existingErrors.slice(-100);
      localStorage.setItem('app_error_logs', JSON.stringify(limitedErrors));
    } catch (err) {
      console.error('Failed to save error to localStorage:', err);
    }
  }

  // Get errors from localStorage
  public getLocalErrors(): ErrorLog[] {
    try {
      const errors = localStorage.getItem('app_error_logs');
      return errors ? JSON.parse(errors) : [];
    } catch (err) {
      return [];
    }
  }

  // Clear local error logs
  public clearLocalErrors() {
    localStorage.removeItem('app_error_logs');
    this.errorQueue = [];
  }

  // Send error to backend
  private async sendToBackend(errorLog: ErrorLog) {
    try {
      const token = localStorage.getItem('auth_token');
      
      await fetch(`${API_BASE_URL}/error-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          error_message: errorLog.message,
          error_stack: errorLog.stack,
          error_type: errorLog.errorType,
          http_method: 'FRONTEND',
          endpoint: errorLog.url,
          user_agent: errorLog.userAgent,
          request_body: JSON.stringify({
            componentStack: errorLog.componentStack,
            timestamp: errorLog.timestamp,
          }),
        }),
      });
    } catch (err) {
      // Silently fail - don't want error logging to cause more errors
      console.error('Failed to send error to backend:', err);
    }
  }

  // Get current user ID from localStorage
  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('auth_user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData._id;
      }
    } catch (err) {
      return undefined;
    }
  }

  // Get recent errors from queue
  public getRecentErrors(): ErrorLog[] {
    return [...this.errorQueue];
  }

  // Format error for display
  public formatError(error: ErrorLog): string {
    return `
[${error.timestamp}] ${error.errorType}
Message: ${error.message}
URL: ${error.url}
User Agent: ${error.userAgent}
${error.stack ? `Stack: ${error.stack}` : ''}
${error.componentStack ? `Component Stack: ${error.componentStack}` : ''}
    `.trim();
  }

  // Export errors as JSON for download
  public exportErrors(): string {
    const allErrors = this.getLocalErrors();
    return JSON.stringify(allErrors, null, 2);
  }

  // Download errors as file
  public downloadErrors() {
    const json = this.exportErrors();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Helper function to track API errors
export function trackApiError(error: any, endpoint: string) {
  errorTracker.logError({
    message: error.message || 'API Error',
    stack: error.stack,
    errorType: 'APIError',
    url: endpoint,
  });
}

// Helper function to track component errors
export function trackComponentError(error: Error, componentStack?: string, componentName?: string) {
  errorTracker.logError({
    message: error.message,
    stack: error.stack,
    errorType: 'ComponentError',
    componentStack: componentStack || `Component: ${componentName}`,
  });
}

export default errorTracker;
