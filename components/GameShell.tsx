"use client";

import React, { Component, Suspense, type ReactNode } from "react";
import Link from "next/link";

// --- Error Boundary ---

interface ErrorBoundaryProps {
  children: ReactNode;
  gameName: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GameErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[GameShell] Error in "${this.props.gameName}":`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-lg border border-red-900 bg-red-950/50 p-8">
            <h2 className="text-xl font-semibold text-red-400">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              The game &ldquo;{this.props.gameName}&rdquo; encountered an error.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-w-lg overflow-auto rounded bg-neutral-900 p-3 text-left text-xs text-neutral-500">
                {this.state.error.message}
              </pre>
            )}
            <Link
              href="/"
              className="mt-6 inline-block rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Back to Games
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Loading Fallback ---

function GameLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-brand-500" />
        <p className="text-sm text-neutral-500">Loading game...</p>
      </div>
    </div>
  );
}

// --- Shell ---

interface GameShellProps {
  children: ReactNode;
  gameName: string;
}

export default function GameShell({ children, gameName }: GameShellProps) {
  return (
    <GameErrorBoundary gameName={gameName}>
      <Suspense fallback={<GameLoading />}>{children}</Suspense>
    </GameErrorBoundary>
  );
}
