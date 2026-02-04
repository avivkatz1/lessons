/**
 * useAnswerValidation Hook
 * Phase 2 - Stage 2: Centralized answer validation logic
 *
 * This hook manages answer input, validation, and feedback state.
 * Replaces 25+ instances of repetitive validation code.
 *
 * @example
 * const { userAnswer, answerFeedback, isCorrect, validateAnswer, setAnswer, resetAnswer } =
 *   useAnswerValidation({ lessonName: 'triangle_sum', correctAnswer: [60] });
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectUserAnswer,
  selectAnswerFeedback,
  selectIsAnswerCorrect,
  selectIsAnswerIncorrect,
  selectCanSubmitAnswer,
  selectLessonName,
  selectIsUsingBatch,
} from "../store/selectors";
import { setUserAnswer, setAnswerFeedback, resetUserAnswer, recordAnswer } from "../store/lessonSlice";
import validateAnswerUtil from "../shared/helpers/validateAnswer";

/**
 * Hook for managing answer validation
 *
 * @param {Object} options - Configuration options
 * @param {string} options.lessonName - Name of the current lesson (optional, uses Redux state if not provided)
 * @param {*} options.correctAnswer - The correct answer to validate against
 * @param {string} options.answerType - Type of answer ('number', 'text', 'coordinate', 'array')
 * @returns {Object} Answer state and validation handlers
 */
export const useAnswerValidation = ({
  lessonName: lessonNameProp,
  correctAnswer,
  answerType = "number",
} = {}) => {
  const dispatch = useAppDispatch();

  // Get lesson name from props or Redux state
  const lessonNameFromState = useAppSelector(selectLessonName);
  const lessonName = lessonNameProp || lessonNameFromState;

  // Answer state
  const userAnswer = useAppSelector(selectUserAnswer);
  const answerFeedback = useAppSelector(selectAnswerFeedback);
  const isCorrect = useAppSelector(selectIsAnswerCorrect);
  const isIncorrect = useAppSelector(selectIsAnswerIncorrect);
  const canSubmit = useAppSelector(selectCanSubmitAnswer);
  // Phase 2.5: Check if we're in batch mode for accuracy tracking
  const isUsingBatch = useAppSelector(selectIsUsingBatch);

  /**
   * Validate the user's answer
   * @param {string} answer - Answer to validate (optional, uses current userAnswer if not provided)
   * @returns {boolean} True if answer is correct
   */
  const validateAnswer = useCallback(
    (answer) => {
      const answerToValidate = answer !== undefined ? answer : userAnswer;

      if (!answerToValidate || !correctAnswer) {
        return false;
      }

      const result = validateAnswerUtil({
        userAnswer: answerToValidate,
        correctAnswer,
        lessonName,
        answerType,
      });

      dispatch(setAnswerFeedback(result ? "correct" : "incorrect"));

      // Phase 2.5: Record answer for batch accuracy tracking
      if (isUsingBatch) {
        dispatch(recordAnswer({ isCorrect: result }));
      }

      return result;
    },
    [userAnswer, correctAnswer, lessonName, answerType, dispatch, isUsingBatch]
  );

  /**
   * Set the user's answer
   * @param {string} answer - The answer value
   */
  const setAnswer = useCallback(
    (answer) => {
      dispatch(setUserAnswer(answer));
    },
    [dispatch]
  );

  /**
   * Reset the answer and feedback
   */
  const resetAnswer = useCallback(() => {
    dispatch(resetUserAnswer());
  }, [dispatch]);

  /**
   * Check if answer is correct without updating feedback state
   * Useful for validation without side effects
   * @param {string} answer - Answer to check
   * @returns {boolean} True if answer is correct
   */
  const checkAnswer = useCallback(
    (answer) => {
      if (!answer || !correctAnswer) {
        return false;
      }

      return validateAnswerUtil({
        userAnswer: answer,
        correctAnswer,
        lessonName,
        answerType,
      });
    },
    [correctAnswer, lessonName, answerType]
  );

  return {
    // State
    userAnswer,
    answerFeedback,
    isCorrect,
    isIncorrect,
    canSubmit,

    // Actions
    validateAnswer,
    setAnswer,
    resetAnswer,
    checkAnswer,
  };
};
