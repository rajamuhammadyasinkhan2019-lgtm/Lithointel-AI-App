import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Something went wrong</h1>
          <p className="text-neutral-500 text-sm max-w-xs mb-8 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all"
          >
            <RefreshCw size={18} />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
