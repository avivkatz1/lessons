import { DataLesson } from "../DataLesson";
import React, { useEffect, Suspense, useCallback, useRef } from "react";
import Hints from "../../../shared/helpers/Hints";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import {
  changeLessonProps,
  toggleAnswer,
  changeScreenSize,
  getNextQuestionFromArray,
  setLessonError,
  clearLessonError,
  setLessonLoading,
} from "../../../store/lessonSlice";
import { useParams } from "react-router-dom";
import LessonHeader from "../components/LessonHeader";
import lessonContext from "../../../api/lessonContext";
// Removed InstructionComponent import - no longer used to save vertical space
import { getCurrentDimensions } from "../../../shared/helpers/functions/getScreenSize";
import LessonErrorBoundary from "../../../shared/components/LessonErrorBoundary";
import { logBatchStatus, logLessonResponse } from "../../../utils/batchDebug";
// Phase 2.5: Progress tracking and completion modal
import ProgressTracker from "../components/ProgressTracker";
import BatchCompletionModal from "../components/BatchCompletionModal";
// Production Monitoring: Track lesson performance
import { trackLessonLoad, captureError } from "../../../services/monitoring";

function LessonGeneral() {
  const dispatch = useDispatch();
  const { lessonName, hints, problemNumber, lessonString, levelNum, width, height } = useSelector(
    (state) => {
      return state.lesson.lessonProps;
    }
  );

  // Phase 2.5: Get batch caching state
  // Phase 2 - Stage 1: Get error and loading states
  const { questionAnswerArray, currentQuestionIndex, lessonError, isLoading, lessonProps } =
    useSelector((state) => state.lesson);

  const params = useParams();

  // Use levelNum from Redux to determine which component to show
  // levelNum is 1-indexed (1, 2, 3...), but array is 0-indexed
  const parsedLevel = levelNum ? parseInt(levelNum) : 1;
  const lessonPicker = Math.max(0, parsedLevel - 1); // Ensure at least 0

  // Phase 2 - Stage 4: Debounced resize handler to improve performance
  const resizeTimeoutRef = useRef(null);

  const updateDimensions = useCallback(() => {
    const screenSize = getCurrentDimensions();
    dispatch(changeScreenSize(screenSize));
  }, [dispatch]);

  const debouncedUpdateDimensions = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      updateDimensions();
    }, 150); // 150ms debounce delay
  }, [updateDimensions]);

  const triggerNewProblem = async () => {
    // Phase 2.5: Check if we have cached questions first
    if (questionAnswerArray.length > 0 && currentQuestionIndex < questionAnswerArray.length - 1) {
      // Use next question from cache (instant, no API call)
      dispatch(getNextQuestionFromArray());
    } else {
      // Either not in batch mode or cache exhausted - fetch from API
      // Phase 2 - Stage 1: Add error handling
      try {
        dispatch(setLessonLoading(true));
        dispatch(clearLessonError());

        const answer = await lessonContext({
          lesson: lessonString ? lessonString : params.lesson,
          levelNum: levelNum ? levelNum : 1,
          problemNumber: problemNumber ? problemNumber + 1 : 1,
        });

        // Debug: Log the response to see if batch is included
        logLessonResponse(answer, "API Response (triggerNewProblem)");

        const screenSize = getCurrentDimensions();
        const allProps = { ...answer, ...screenSize, order: [] };
        dispatch(changeLessonProps(allProps));
        dispatch(setLessonLoading(false));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error("Error loading new problem:", error);
        }
        dispatch(setLessonError(error.message || "Failed to load new problem"));
        dispatch(setLessonLoading(false));

        // If we have cached questions, fall back to those
        if (questionAnswerArray.length > 0) {
          dispatch(getNextQuestionFromArray());
        }
      }
    }
  };

  // Load initial lesson data when component mounts or lesson changes
  useEffect(() => {
    const loadInitialLesson = async () => {
      // Production Monitoring: Track lesson load time
      const startTime = performance.now();

      // Phase 2 - Stage 1: Add error handling
      try {
        dispatch(setLessonLoading(true));
        dispatch(clearLessonError());

        const answer = await lessonContext({
          lesson: params.lesson,
          levelNum: 1,
          problemNumber: 1,
        });

        // Debug: Log the response to see if batch is included
        logLessonResponse(answer, "API Response (loadInitialLesson)");

        const screenSize = getCurrentDimensions();
        const allProps = { ...answer, ...screenSize, order: [] };
        dispatch(changeLessonProps(allProps));
        dispatch(setLessonLoading(false));

        // Production Monitoring: Track successful lesson load
        const loadTime = performance.now() - startTime;
        trackLessonLoad(params.lesson, loadTime);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error("Error loading initial lesson:", error);
        }
        dispatch(setLessonError(error.message || "Failed to load lesson"));
        dispatch(setLessonLoading(false));

        // Production Monitoring: Track lesson load errors
        captureError(error, {
          context: "lesson-loading",
          lessonName: params.lesson,
          levelNum: 1,
        });
      }
    };

    loadInitialLesson();
  }, [params.lesson, dispatch]);

  useEffect(() => {
    window.addEventListener("resize", debouncedUpdateDimensions);
    return () => {
      window.removeEventListener("resize", debouncedUpdateDimensions);
      // Clear any pending timeout on unmount
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [debouncedUpdateDimensions]);

  // Debug: Log batch status whenever it changes (Phase 2.5)
  useEffect(() => {
    logBatchStatus(
      {
        isBatchMode: questionAnswerArray?.length > 0 || false,
        questionQueue: questionAnswerArray || [],
        currentQuestionIndex,
      },
      `Batch Status Update (Problem #${problemNumber})`
    );
  }, [questionAnswerArray, currentQuestionIndex, problemNumber]);

  // Phase 2 - Stage 1: Handle loading state
  if (isLoading && !lessonProps.lessonName) {
    return (
      <Wrapper>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading lesson...</LoadingText>
        </LoadingContainer>
      </Wrapper>
    );
  }

  // Phase 2 - Stage 1: Handle error state
  if (lessonError && !lessonProps.lessonName) {
    return (
      <Wrapper>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Unable to Load Lesson</ErrorTitle>
          <ErrorMessage>{lessonError}</ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>Try Again</RetryButton>
          <BackButton onClick={() => (window.location.href = "/")}>Back to Lessons</BackButton>
        </ErrorContainer>
      </Wrapper>
    );
  }

  // Phase 2 - Stage 1: Handle missing lesson (empty state)
  if (!DataLesson[params.lesson]) {
    return (
      <Wrapper>
        <EmptyStateContainer>
          <EmptyStateIcon>📚</EmptyStateIcon>
          <EmptyStateTitle>No lessons made yet</EmptyStateTitle>
          <EmptyStateMessage>
            The lesson "{params.lesson}" hasn't been created yet.
            <br />
            Please choose a different lesson from the menu.
          </EmptyStateMessage>
          <BackButton onClick={() => (window.location.href = "/")}>Back to Lessons</BackButton>
        </EmptyStateContainer>
      </Wrapper>
    );
  }

  const { lessonImage, LessonComponent } = DataLesson[params.lesson];
  // Ensure lessonPicker is within bounds
  const validLessonPicker = Math.min(lessonPicker, LessonComponent.length - 1);
  const ShownElement = LessonComponent[validLessonPicker];

  // Safety check: don't render until we have valid data
  if (!ShownElement) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to load component for ${params.lesson} at level ${levelNum} (picker: ${validLessonPicker}). ` +
          `Available components: ${LessonComponent.length}`
      );
    }
    return (
      <Wrapper>
        <LoadingContainer>
          <LoadingText>Loading lesson component...</LoadingText>
        </LoadingContainer>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* back button */}
      <div className="header-container">
        <LessonHeader
          lessonImage={lessonImage}
          lessonName={lessonName}
          LessonComponent={LessonComponent}
        />
      </div>

      {/* Removed InstructionComponent to save vertical space on iPad */}

      {/* <div className="hint-container">
        {hints?.map((hint, index) => {
          return (
            <div className="hint-text" key={`${index * 34904}`}>
              <Hints
                hint={hint}
                index={index}
                key={index}
                newProblem={triggerNewProblem}
              />
            </div>
          );
        })}
      </div> */}

      <div className="lesson-container">
        {/* Phase 2 - Stage 1: Wrap lesson in error boundary */}
        {/* Phase 2 - Stage 4: Wrap lazy-loaded component in Suspense */}
        <LessonErrorBoundary lessonName={lessonName} onTryAnother={triggerNewProblem}>
          <Suspense
            fallback={
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading lesson component...</LoadingText>
              </LoadingContainer>
            }
          >
            <ShownElement triggerNewProblem={triggerNewProblem} />
          </Suspense>
        </LessonErrorBoundary>
      </div>

      {/* Phase 2.5: Progress tracker moved to bottom to save top space */}
      <ProgressTracker />

      {/* Phase 2.5: Show completion modal when batch is finished */}
      <BatchCompletionModal />
    </Wrapper>
  );
}

export default LessonGeneral;
const Wrapper = styled.div`
  background-color: rgba(215, 224, 229, 0.3);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;
  padding-bottom: 20px;
  box-sizing: border-box;

  .header-container {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
  }

  .hint-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: stretch;
    padding: 0 10px;
  }

  .lesson-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  /* Center input and buttons in all lesson components */
  .lesson-container .practice-container,
  .lesson-container .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;
  }

  .instructions {
    display: flex;
    justify-content: center;
    padding: 5px 10px;
  }

  @media (min-width: 480px) {
    .lesson-container {
      padding: 15px;
    }
    .instructions {
      padding: 10px 15px;
    }
  }

  @media (min-width: 768px) {
    .lesson-container {
      padding: 20px;
    }
    .instructions {
      padding: 10px 20px;
    }
  }
`;

// Phase 2 - Stage 1: Styled components for loading, error, and empty states
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-top: 20px;
  font-size: 16px;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
  max-width: 500px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin: 0 8px;

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

const BackButton = styled(Button)`
  background-color: #e0e0e0;
  color: #333;

  &:hover {
    background-color: #d0d0d0;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.7;
`;

const EmptyStateTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const EmptyStateMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
  max-width: 500px;
`;

// const Wrapper = styled.div`
//   grid-gap: 30px;

//   .lesson-container {
//     grid-row: 3/4;
//   }

//   button {
//     background-color: lightgreen;
//     height: 50px;
//     border-radius: 7px;
//     font-size: 24px;
//   }

//   .lesson {
//     margin: 20px;
//   }

//   .hint-container {
//     grid-row: 4/5;
//     width: 100vw;
//     overflow: wrap;
//     display: flex;
//     justify-content: space-evenly;
//   }
//   .hint-text {
//     width: 200px;
//     overflow: wrap;
//   }

//   .stage-background {
//     border-width: 2px;
//     border-radius: 2px;
//     border-color: black;
//     border-style: solid;
//   }

//   .practice-container {
//     grid-row: 2/4;
//     grid-column: 1/5;
//     display: flex;
//     justify-content: center;
//     flex-direction: column;
//   }
//   .problem-text {
//     font-size: x-large;
//     font-weight: 700;
//     text-transform: lowercase;
//     margin-left: 50px;
//   }
// `;
