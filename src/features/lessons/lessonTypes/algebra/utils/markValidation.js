/**
 * Mark Validation Utilities for Keep-Change-Change Drawing Validation
 *
 * Provides functions for:
 * - Checking stroke-region intersection
 * - Validating individual marks (Mark 1, Mark 2)
 * - Complete Keep-Change-Change validation
 * - Generating user feedback messages
 *
 * Used to validate user-drawn marks in SubtractingIntegersLesson levels 1-4.
 */

import { classifyStrokeOrientation, calculateStrokeBounds } from './strokeAnalysis';

/**
 * Check if stroke intersects with target region
 *
 * For vertical marks: Check if stroke's X position is within target's horizontal span
 * and there's any vertical overlap.
 *
 * @param {{x: number, y: number, width: number, height: number}} strokeBounds - Stroke bounding box
 * @param {{x: number, y: number, width: number, height: number}} targetRegion - Target region
 * @param {string} orientation - 'vertical' or 'horizontal'
 * @returns {boolean} True if stroke passes through target region
 */
export function checkStrokeIntersection(strokeBounds, targetRegion, orientation = 'vertical') {
  if (!strokeBounds || !targetRegion) {
    return false;
  }

  console.log('[KCC Validation] Checking intersection:', {
    strokeBounds,
    targetRegion,
    orientation,
  });

  if (orientation === 'vertical') {
    // For vertical marks: stroke must be within horizontal span of target
    // and have some vertical overlap
    const strokeCenterX = strokeBounds.x + strokeBounds.width / 2;
    const targetLeft = targetRegion.x;
    const targetRight = targetRegion.x + targetRegion.width;

    const isWithinHorizontalSpan = strokeCenterX >= targetLeft && strokeCenterX <= targetRight;

    // Check for any vertical overlap
    const verticalOverlap = !(
      strokeBounds.y + strokeBounds.height < targetRegion.y ||
      strokeBounds.y > targetRegion.y + targetRegion.height
    );

    console.log('[KCC Validation] Vertical check:', {
      strokeCenterX,
      targetLeft,
      targetRight,
      isWithinHorizontalSpan,
      verticalOverlap,
      result: isWithinHorizontalSpan && verticalOverlap,
    });

    return isWithinHorizontalSpan && verticalOverlap;
  } else {
    // For horizontal marks: stroke must be within vertical span of target
    // and have some horizontal overlap
    const strokeCenterY = strokeBounds.y + strokeBounds.height / 2;
    const targetTop = targetRegion.y;
    const targetBottom = targetRegion.y + targetRegion.height;

    const isWithinVerticalSpan = strokeCenterY >= targetTop && strokeCenterY <= targetBottom;

    // Check for any horizontal overlap
    const horizontalOverlap = !(
      strokeBounds.x + strokeBounds.width < targetRegion.x ||
      strokeBounds.x > targetRegion.x + targetRegion.width
    );

    return isWithinVerticalSpan && horizontalOverlap;
  }
}

/**
 * Validate Mark 1 (vertical line through minus sign)
 *
 * Checks if any drawn line is:
 * - Vertical orientation (aspect ratio < 0.4)
 * - Intersects with mark1Region (minus sign area)
 * - Minimum length requirement (25px)
 *
 * @param {Array<{tool: string, points: number[]}>} lines - All drawn lines
 * @param {object} mark1Region - Target region for mark 1
 * @returns {boolean} True if valid mark 1 found
 */
export function validateMark1(lines, mark1Region) {
  if (!lines || lines.length === 0 || !mark1Region) {
    console.log('[KCC Validation] validateMark1: No lines or mark1Region');
    return false;
  }

  console.log('[KCC Validation] validateMark1: Checking', lines.length, 'lines');
  console.log('[KCC Validation] mark1Region:', mark1Region);

  // Minimum stroke length to prevent accidental dots
  const MIN_STROKE_LENGTH = 25;

  for (const line of lines) {
    // Skip eraser strokes
    if (line.tool === 'eraser') {
      continue;
    }

    const { points } = line;

    // Check minimum length
    const bounds = calculateStrokeBounds(points);
    console.log('[KCC Validation] Stroke bounds:', bounds);

    if (!bounds || bounds.height < MIN_STROKE_LENGTH) {
      console.log('[KCC Validation] Stroke too short:', bounds?.height, 'min:', MIN_STROKE_LENGTH);
      continue;
    }

    // Check orientation
    const orientation = classifyStrokeOrientation(points);
    console.log('[KCC Validation] Stroke orientation:', orientation);

    if (orientation !== 'vertical') {
      console.log('[KCC Validation] Not vertical, skipping');
      continue;
    }

    // Check intersection with target region
    const intersects = checkStrokeIntersection(bounds, mark1Region, 'vertical');
    console.log('[KCC Validation] Intersection result:', intersects);

    if (intersects) {
      console.log('[KCC Validation] ✓ Found valid mark 1!');
      return true; // Found valid mark 1!
    }
  }

  console.log('[KCC Validation] ✗ No valid mark 1 found');
  return false; // No valid mark 1 found
}

/**
 * Validate Mark 2 (mark on second number)
 *
 * Context-dependent validation:
 * - If mark2Region.type === 'horizontal': Check for horizontal line above number
 * - If mark2Region.type === 'vertical': Check for vertical line through negative sign
 *
 * @param {Array<{tool: string, points: number[]}>} lines - All drawn lines
 * @param {object} mark2Region - Target region for mark 2
 * @returns {boolean} True if valid mark 2 found
 */
export function validateMark2(lines, mark2Region) {
  if (!lines || lines.length === 0 || !mark2Region) {
    return false;
  }

  const MIN_STROKE_LENGTH = 25;
  const expectedOrientation = mark2Region.type; // 'horizontal' or 'vertical'

  for (const line of lines) {
    // Skip eraser strokes
    if (line.tool === 'eraser') {
      continue;
    }

    const { points } = line;
    const bounds = calculateStrokeBounds(points);

    if (!bounds) {
      continue;
    }

    // Check minimum length
    const minDimension = expectedOrientation === 'horizontal' ? bounds.width : bounds.height;
    if (minDimension < MIN_STROKE_LENGTH) {
      continue;
    }

    // Check orientation
    const orientation = classifyStrokeOrientation(points);
    if (orientation !== expectedOrientation) {
      continue;
    }

    // Check intersection with target region
    if (checkStrokeIntersection(bounds, mark2Region, expectedOrientation)) {
      return true; // Found valid mark 2!
    }
  }

  return false; // No valid mark 2 found
}

/**
 * Generate feedback message based on validation state
 *
 * @param {boolean} mark1Valid
 * @param {boolean} mark2Valid
 * @param {string} mark2Type - 'horizontal' or 'vertical'
 * @returns {string} User-friendly feedback message
 */
function generateFeedback(mark1Valid, mark2Valid, mark2Type) {
  if (mark1Valid && mark2Valid) {
    return 'Perfect! Both marks are correct.';
  } else if (mark1Valid && !mark2Valid) {
    const mark2Hint = mark2Type === 'horizontal'
      ? 'Now draw a horizontal line above the second number.'
      : 'Now draw a vertical line through the negative sign.';
    return `Good! ${mark2Hint}`;
  } else if (!mark1Valid && mark2Valid) {
    return 'Good! Now draw a vertical line through the minus sign.';
  } else {
    return 'Draw a vertical line through the minus sign.';
  }
}

/**
 * Main validation function for Keep-Change-Change marks
 *
 * Validates all user-drawn strokes and returns comprehensive result.
 * Implements early exit optimization when both marks are found.
 *
 * @param {Array<{tool: string, points: number[]}>} lines - All drawn lines from canvas
 * @param {object} targetRegions - {mark1Region, mark2Region, isNum2Negative}
 * @returns {object} Validation result with state, feedback, and border color
 *
 * @example
 * const result = validateKeepChangeChange(lines, targetRegions);
 * // Returns: {
 * //   validationState: 'complete' | 'incomplete',
 * //   mark1Valid: boolean,
 * //   mark2Valid: boolean,
 * //   feedbackMessage: string,
 * //   borderColor: 'success' | 'default'
 * // }
 */
export function validateKeepChangeChange(lines, targetRegions) {
  // Early exit: no strokes yet
  if (!lines || lines.length === 0) {
    return {
      validationState: 'incomplete',
      mark1Valid: false,
      mark2Valid: false,
      feedbackMessage: 'Draw a vertical line through the minus sign.',
      borderColor: 'default',
    };
  }

  // Early exit: no target regions (error state)
  if (!targetRegions || !targetRegions.mark1Region || !targetRegions.mark2Region) {
    return {
      validationState: 'incomplete',
      mark1Valid: false,
      mark2Valid: false,
      feedbackMessage: '',
      borderColor: 'default',
    };
  }

  const { mark1Region, mark2Region } = targetRegions;

  // Validate both marks with early exit
  const mark1Valid = validateMark1(lines, mark1Region);
  const mark2Valid = validateMark2(lines, mark2Region);

  // Early exit: both marks found!
  if (mark1Valid && mark2Valid) {
    return {
      validationState: 'complete',
      mark1Valid: true,
      mark2Valid: true,
      feedbackMessage: 'Perfect! Both marks are correct.',
      borderColor: 'success',
    };
  }

  // Partial success: first mark only
  if (mark1Valid && !mark2Valid) {
    const mark2Hint = mark2Region.type === 'horizontal'
      ? 'Now draw a horizontal line above the second number.'
      : 'Now draw a vertical line through the negative sign.';
    return {
      validationState: 'partial',
      mark1Valid: true,
      mark2Valid: false,
      feedbackMessage: `Good! ${mark2Hint}`,
      borderColor: 'warning',
    };
  }

  // Generate appropriate feedback for incomplete state
  const feedbackMessage = generateFeedback(mark1Valid, mark2Valid, mark2Region.type);

  return {
    validationState: 'incomplete',
    mark1Valid,
    mark2Valid,
    feedbackMessage,
    borderColor: 'default',
  };
}
