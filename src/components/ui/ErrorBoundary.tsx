import React from "react";
import * as Sentry from "@sentry/react";
import { Button } from "./button";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { ...errorInfo } });
    console.error("Erreur non catchée :", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="text-2xl font-bold text-destructive mb-2">Oups…</div>
            <div className="mb-4">Une erreur critique est survenue.<br />Veuillez réessayer plus tard.</div>
            <Button
              className="px-4 py-2 rounded bg-primary text-white cursor-pointer"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}