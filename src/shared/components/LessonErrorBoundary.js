import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

/**
 * Lesson-Specific Error Boundary
 * Catches errors in lesson components and provides lesson-specific fallback UI
 * with options to try another problem or return to lesson selection
 */
class LessonErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("LessonErrorBoundary caught an error:", error, errorInfo);
    }

    this.setState((prevState) => ({
      error,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to error tracking service in production
    // Example: logErrorToService(error, errorInfo, this.props.lessonName);
  }

  handleTryAnother = () => {
    this.setState({
      hasError: false,
      error: null,
    });

    // Call the triggerNewProblem function if provided
    if (this.props.onTryAnother) {
      this.props.onTryAnother();
    }
  };

  handleGoBack = () => {
    // Navigate back to lesson selection
    if (this.props.navigate) {
      this.props.navigate("/");
    } else {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      const isRepeatedError = this.state.errorCount > 2;

      return (
        <LessonErrorContainer>
          <LessonErrorCard>
            <ErrorIcon>🔧</ErrorIcon>
            <ErrorTitle>Problem Loading Question</ErrorTitle>
            <ErrorMessage>
              {isRepeatedError ? (
                <>
                  This lesson is experiencing repeated errors.
                  <br />
                  Please try a different lesson or contact support.
                </>
              ) : (
                <>
                  We encountered an error while loading this problem.
                  <br />
                  Don't worry - your progress is saved!
                </>
              )}
            </ErrorMessage>

            {this.props.lessonName && (
              <LessonInfo>
                Lesson: <strong>{this.props.lessonName.replace(/_/g, " ")}</strong>
              </LessonInfo>
            )}

            {process.env.NODE_ENV === "development" && this.state.error && (
              <ErrorDetails>
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
              </ErrorDetails>
            )}

            <ButtonGroup>
              {!isRepeatedError && (
                <TryAnotherButton onClick={this.handleTryAnother}>
                  Try Another Problem
                </TryAnotherButton>
              )}
              <BackButton onClick={this.handleGoBack}>
                {isRepeatedError ? "Choose Different Lesson" : "Back to Lessons"}
              </BackButton>
            </ButtonGroup>

            {this.state.errorCount > 1 && (
              <ErrorHint>Error count: {this.state.errorCount}</ErrorHint>
            )}
          </LessonErrorCard>
        </LessonErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper to provide navigate hook
export default function LessonErrorBoundary(props) {
  const navigate = useNavigate();
  return <LessonErrorBoundaryClass {...props} navigate={navigate} />;
}

// Styled Components
const LessonErrorContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LessonErrorCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 2px solid #ffa726;
`;

const ErrorIcon = styled.div`
  font-size: 56px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
`;

const ErrorMessage = styled.p`
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const LessonInfo = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 24px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  text-transform: capitalize;

  strong {
    color: #555;
  }
`;

const ErrorDetails = styled.details`
  text-align: left;
  margin: 16px 0;
  padding: 12px;
  background: #fff3e0;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid #ffb74d;

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #f57c00;
    margin-bottom: 8px;
  }

  pre {
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #e64a19;
    margin: 4px 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TryAnotherButton = styled(Button)`
  background-color: #66bb6a;
  color: white;

  &:hover {
    background-color: #57a05a;
  }
`;

const BackButton = styled(Button)`
  background-color: #e0e0e0;
  color: #333;

  &:hover {
    background-color: #d0d0d0;
  }
`;

const ErrorHint = styled.div`
  margin-top: 16px;
  font-size: 12px;
  color: #999;
`;
