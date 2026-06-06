"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-950">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-teal-900 dark:text-gray-100 mb-1">Something went wrong</p>
            <p className="text-sm text-teal-600/70 dark:text-gray-400 max-w-xs">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
          </div>
          <Button
            onClick={this.reset}
            variant="outline"
            className="gap-2 cursor-pointer border-teal-200 dark:border-gray-700 text-teal-700 dark:text-teal-400"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
