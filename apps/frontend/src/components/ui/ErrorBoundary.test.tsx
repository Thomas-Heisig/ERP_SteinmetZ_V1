// apps/frontend/src/components/ui/ErrorBoundary.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary, withErrorBoundary } from "./ErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should catch errors and display fallback UI", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it("should display custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("should reset error state when reset button is clicked", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();

    // Change the component to not throw
    shouldThrow = false;

    const resetButton = screen.getByText(/Erneut versuchen/i);
    await user.click(resetButton);

    // Re-render with the new prop
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Etwas ist schiefgelaufen/i)).not.toBeInTheDocument();
  });

  it("should use custom fallbackRender function", () => {
    const fallbackRender = (error: Error, reset: () => void) => (
      <div>
        <p>Custom: {error.message}</p>
        <button onClick={reset}>Custom reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallbackRender={fallbackRender}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Custom: Test error/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom reset/i)).toBeInTheDocument();
  });

  it("should show error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/Fehlerdetails \(nur in Entwicklung sichtbar\)/i)
    ).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should display both buttons in fallback UI", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Erneut versuchen/i)).toBeInTheDocument();
    expect(screen.getByText(/Seite neu laden/i)).toBeInTheDocument();
  });

  it("should reset when resetKeys change", () => {
    let shouldThrow = true;
    const { rerender } = render(
      <ErrorBoundary resetKeys={["key1"]}>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();

    // Change resetKeys and component behavior
    shouldThrow = false;
    rerender(
      <ErrorBoundary resetKeys={["key2"]}>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Etwas ist schiefgelaufen/i)).not.toBeInTheDocument();
    expect(screen.getByText("No error")).toBeInTheDocument();
  });
});

describe("withErrorBoundary HOC", () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("should wrap component with ErrorBoundary", () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent />);

    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
  });

  it("should pass props to wrapped component", () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    );
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Test message" />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should accept ErrorBoundary props", () => {
    const onError = vi.fn();
    const WrappedComponent = withErrorBoundary(ThrowError, { onError });

    render(<WrappedComponent />);

    expect(onError).toHaveBeenCalled();
  });
});
