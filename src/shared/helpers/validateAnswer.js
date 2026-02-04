/**
 * Validates user answer against the correct answer
 * Phase 2 - Stage 3: Refactored to use ValidationService
 *
 * DEPRECATED: This file is kept for backward compatibility.
 * New code should import from '../../services/validationService' directly.
 *
 * @param {string} userAnswer - The user's typed answer
 * @param {*} correctAnswer - The correct answer (various formats)
 * @param {string} answerType - Type of answer: "number", "coordinate", "text", "array"
 * @param {string} lessonName - Lesson name for special handling
 * @returns {boolean} - Whether the answer is correct
 */

import { validateAnswer as validateAnswerService } from "../../services/validationService";

/**
 * Backward-compatible wrapper for the old API
 * Maps old function signature to new validation service
 */
export const validateAnswer = (
  userAnswer,
  correctAnswer,
  answerType = "number",
  lessonName = ""
) => {
  return validateAnswerService(userAnswer, correctAnswer, {
    answerType,
    lessonName,
  });
};

export default validateAnswer;
