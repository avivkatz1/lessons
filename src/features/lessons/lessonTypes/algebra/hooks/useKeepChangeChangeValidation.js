/**
 * Keep-Change-Change Drawing Validation Hook
 *
 * Orchestrates real-time validation of user-drawn marks for the
 * Keep-Change-Change method in SubtractingIntegersLesson levels 1-4.
 *
 * Triggers validation automatically when lines array changes (after each stroke).
 * Returns validation state for canvas border styling and user feedback.
 *
 * @example
 * const validation = useKeepChangeChangeValidation(lines, targetRegions);
 * // Returns: {
 * //   validationState: 'complete' | 'incomplete',
 * //   mark1Valid: boolean,
 * //   mark2Valid: boolean,
 * //   feedbackMessage: string,
 * //   borderColor: 'success' | 'default'
 * // }
 */

import { useState, useEffect } from 'react';
import { validateKeepChangeChange } from '../utils/markValidation';

/**
 * Hook for Keep-Change-Change drawing validation
 *
 * Validates user-drawn strokes against target regions in real-time.
 * Early exits when both marks are found for optimal performance (<50ms).
 *
 * @param {Array<{tool: string, points: number[]}>} lines - All drawn lines from canvas
 * @param {object} targetRegions - {mark1Region, mark2Region, isNum2Negative}
 * @returns {object} Validation result with state, feedback, and border color
 */
export function useKeepChangeChangeValidation(lines, targetRegions) {
  const [validationResult, setValidationResult] = useState({
    validationState: 'incomplete',
    mark1Valid: false,
    mark2Valid: false,
    feedbackMessage: 'Draw a vertical line through the minus sign.',
    borderColor: 'default',
  });

  useEffect(() => {
    // Skip validation if target regions not ready
    if (!targetRegions) {
      setValidationResult({
        validationState: 'incomplete',
        mark1Valid: false,
        mark2Valid: false,
        feedbackMessage: '',
        borderColor: 'default',
      });
      return;
    }

    // Run validation
    const result = validateKeepChangeChange(lines, targetRegions);
    setValidationResult(result);
  }, [lines, targetRegions]);

  return validationResult;
}
