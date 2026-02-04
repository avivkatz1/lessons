/**
 * Tests for ErrorBoundary component
 * Phase 2 - Stage 1: Error handling infrastructure
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

// Suppress console.error for these tests (errors are expected)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe("ErrorBoundary", () => {
  describe("when no error occurs", () => {
    test("should render children normally", () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
  });

  describe("when error occurs", () => {
    test("should catch error and display fallback UI", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test("should display default error message", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });

    test("should display custom error message when provided", () => {
      render(
        <ErrorBoundary errorMessage="Custom error message for testing">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Custom error message for testing")).toBeInTheDocument();
    });

    test('should display "Try Again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    test('should display "Go Home" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });
  });

  describe("error recovery", () => {
    test("should call onReset callback when provided", () => {
      const onReset = jest.fn();

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText("Try Again");
      fireEvent.click(tryAgainButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("custom fallback UI", () => {
    test("should render custom fallback when provided", () => {
      const customFallback = <div>Custom fallback UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Custom fallback UI")).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });
});
