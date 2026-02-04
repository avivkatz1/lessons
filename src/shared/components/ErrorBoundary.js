import React from "react";
import styled from "styled-components";

/**
 * Generic Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI from props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            <ErrorMessage>
              {this.props.errorMessage || "An unexpected error occurred. Please try again."}
            </ErrorMessage>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <ErrorDetails>
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </ErrorDetails>
            )}

            <ButtonGroup>
              <RetryButton onClick={this.handleReset}>Try Again</RetryButton>
              <HomeButton onClick={() => (window.location.href = "/")}>Go Home</HomeButton>
            </ButtonGroup>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Styled Components
const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(215, 224, 229, 0.3);
  padding: 20px;
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const ErrorDetails = styled.details`
  text-align: left;
  margin: 20px 0;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
  }

  pre {
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #d32f2f;
    margin: 8px 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RetryButton = styled(Button)`
  background-color: #4a90e2;
  color: white;

  &:hover {
    background-color: #357abd;
  }
`;

const HomeButton = styled(Button)`
  background-color: #e0e0e0;
  color: #333;

  &:hover {
    background-color: #d0d0d0;
  }
`;
