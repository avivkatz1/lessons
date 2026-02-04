/**
 * useLessonState Hook
 * Phase 2 - Stage 2: Centralized lesson state management
 *
 * This hook provides a unified interface for lesson state and actions.
 * Replaces 44+ instances of repetitive useSelector and useDispatch code.
 *
 * @example
 * const { showAnswer, lessonName, isLoading, revealAnswer, hideAnswer } = useLessonState();
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectShowAnswer,
  selectLessonProps,
  selectLessonName,
  selectIsLoading,
  selectLessonError,
  selectHasError,
  selectIsUsingBatch,
  selectQuestionAnswerArray,
  selectCurrentQuestionIndex,
  selectHasQuestionsInCache,
  selectRemainingQuestions,
} from "../store/selectors";
import { toggleAnswer, clearLessonError } from "../store/lessonSlice";

/**
 * Hook for managing lesson state and actions
 *
 * @returns {Object} Lesson state and action handlers
 */
export const useLessonState = () => {
  const dispatch = useAppDispatch();

  // Lesson display state
  const showAnswer = useAppSelector(selectShowAnswer);
  const lessonProps = useAppSelector(selectLessonProps);
  const lessonName = useAppSelector(selectLessonName);

  // Loading and error state
  const isLoading = useAppSelector(selectIsLoading);
  const lessonError = useAppSelector(selectLessonError);
  const hasError = useAppSelector(selectHasError);

  // Phase 2.5: Batch caching state
  const isUsingBatch = useAppSelector(selectIsUsingBatch);
  const questionAnswerArray = useAppSelector(selectQuestionAnswerArray);
  const currentQuestionIndex = useAppSelector(selectCurrentQuestionIndex);
  const hasQuestionsInCache = useAppSelector(selectHasQuestionsInCache);
  const remainingQuestions = useAppSelector(selectRemainingQuestions);

  // Action handlers
  const revealAnswer = useCallback(() => {
    dispatch(toggleAnswer(true));
  }, [dispatch]);

  const hideAnswer = useCallback(() => {
    dispatch(toggleAnswer(false));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearLessonError());
  }, [dispatch]);

  return {
    // Display state
    showAnswer,
    lessonProps,
    lessonName,

    // Loading and error state
    isLoading,
    lessonError,
    hasError,

    // Phase 2.5: Batch caching state
    isUsingBatch,
    questionAnswerArray,
    currentQuestionIndex,
    hasQuestionsInCache,
    remainingQuestions,

    // Actions
    revealAnswer,
    hideAnswer,
    clearError,
  };
};
