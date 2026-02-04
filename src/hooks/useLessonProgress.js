/**
 * useLessonProgress Hook
 * Phase 2 - Stage 2: Lesson progress tracking
 *
 * This hook provides a unified interface for tracking lesson progress,
 * including problem counts, scores, and completion status.
 *
 * @example
 * const {
 *   problemNumber,
 *   stars,
 *   incrementProblem,
 *   updateStars,
 *   resetProgress
 * } = useLessonProgress();
 */

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { newProblem, changeStars } from "../store/lessonSlice";
import {
  selectProblemNumber,
  selectStars,
  selectLessonName,
  selectAnswerFeedback,
} from "../store/selectors";

/**
 * Hook for managing lesson progress and scoring
 *
 * @returns {Object} Progress state and action handlers
 */
export const useLessonProgress = () => {
  const dispatch = useAppDispatch();

  // Progress state
  const problemNumber = useAppSelector(selectProblemNumber);
  const stars = useAppSelector(selectStars);
  const lessonName = useAppSelector(selectLessonName);
  const answerFeedback = useAppSelector(selectAnswerFeedback);

  // Computed metrics
  const isFirstProblem = useMemo(() => problemNumber === 0, [problemNumber]);

  const hasStarted = useMemo(() => problemNumber > 0, [problemNumber]);

  const correctAnswers = useMemo(() => {
    // Stars typically represent correct answers in the lesson system
    return stars || 0;
  }, [stars]);

  const accuracy = useMemo(() => {
    if (problemNumber === 0) return 0;
    return Math.round((correctAnswers / problemNumber) * 100);
  }, [correctAnswers, problemNumber]);

  // Progress categorization
  const progressLevel = useMemo(() => {
    if (problemNumber === 0) return "not_started";
    if (problemNumber < 5) return "beginner";
    if (problemNumber < 10) return "intermediate";
    if (problemNumber < 20) return "advanced";
    return "expert";
  }, [problemNumber]);

  // Achievement thresholds
  const achievements = useMemo(() => {
    return {
      firstProblem: problemNumber >= 1,
      fiveInARow: problemNumber >= 5,
      tenInARow: problemNumber >= 10,
      perfectAccuracy: accuracy === 100 && problemNumber >= 5,
      highAccuracy: accuracy >= 80 && problemNumber >= 5,
    };
  }, [problemNumber, accuracy]);

  // Action handlers
  const incrementProblem = useCallback(() => {
    dispatch(newProblem());
  }, [dispatch]);

  const updateStars = useCallback(
    (newStars) => {
      dispatch(changeStars(newStars));
    },
    [dispatch]
  );

  const addStar = useCallback(() => {
    dispatch(changeStars((stars || 0) + 1));
  }, [dispatch, stars]);

  // Progress tracking for analytics
  const getProgressSummary = useCallback(() => {
    return {
      lessonName,
      problemNumber,
      stars: stars || 0,
      accuracy,
      progressLevel,
      achievements,
      timestamp: new Date().toISOString(),
    };
  }, [lessonName, problemNumber, stars, accuracy, progressLevel, achievements]);

  // Check if user is on a streak
  const getStreakInfo = useCallback(() => {
    // This could be expanded to track consecutive correct answers
    // For now, we'll use a simple implementation
    const isOnStreak = answerFeedback === "correct";

    return {
      isOnStreak,
      currentFeedback: answerFeedback,
    };
  }, [answerFeedback]);

  return {
    // Raw progress state
    problemNumber,
    stars: stars || 0,
    lessonName,

    // Computed metrics
    isFirstProblem,
    hasStarted,
    correctAnswers,
    accuracy,
    progressLevel,
    achievements,

    // Actions
    incrementProblem,
    updateStars,
    addStar,

    // Utility functions
    getProgressSummary,
    getStreakInfo,
  };
};
