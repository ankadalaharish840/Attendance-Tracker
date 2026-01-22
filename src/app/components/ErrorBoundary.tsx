// Error Boundary Component for React
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTracker, trackComponentError } from '../utils/errorTracker';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to tracking system
    trackComponentError(error, errorInfo.componentStack, 'ErrorBoundary');

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleDownloadLogs = () => {
    errorTracker.downloadErrors();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="text-lg font-semibold mb-2">
                ⚠️ Something went wrong
              </AlertTitle>
              <AlertDescription>
                <p className="mb-4">
                  An unexpected error occurred. The error has been logged and our team will investigate.
                </p>
                
                {import.meta.env.DEV && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
                    <p className="font-semibold text-red-800 mb-2">Error Details (Development Mode):</p>
                    <pre className="text-red-700 whitespace-pre-wrap overflow-auto max-h-48">
                      {this.state.error.message}
                      {this.state.error.stack && `\n\n${this.state.error.stack}`}
                    </pre>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-red-800 font-semibold">
                          Component Stack
                        </summary>
                        <pre className="text-red-700 whitespace-pre-wrap overflow-auto max-h-32 mt-2">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button onClick={this.handleReset} variant="default">
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload} variant="outline">
                    Reload Page
                  </Button>
                  <Button onClick={this.handleDownloadLogs} variant="outline">
                    Download Error Logs
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                  >
                    Go to Home
                  </Button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Error ID:</strong> {new Date().getTime()}
                  </p>
                  <p className="mt-1">
                    If this problem persists, please contact support with the error ID above.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
