/**
 * Expression Parsing Utilities for Keep-Change-Change Drawing Validation
 *
 * Provides functions for:
 * - Parsing mathematical expressions ("7 - 3")
 * - Measuring KaTeX element positions via DOM
 * - Calculating target regions for validation
 * - Fallback estimation when DOM measurement fails
 *
 * Used to determine where marks should be drawn in SubtractingIntegersLesson.
 */

/**
 * Parse expression string into components
 *
 * @param {string} step1 - Expression like "7 - 3" or "5 - (-3)"
 * @returns {{firstNum: number, operator: string, secondNum: number}}
 *
 * @example
 * parseExpression("9 - 2")
 * // Returns: {firstNum: 9, operator: '-', secondNum: 2}
 *
 * parseExpression("5 - (-3)")
 * // Returns: {firstNum: 5, operator: '-', secondNum: -3}
 */
export function parseExpression(step1) {
  if (!step1 || typeof step1 !== 'string') {
    console.error('[KCC Validation] Invalid expression:', step1);
    return { firstNum: 0, operator: '-', secondNum: 0 };
  }

  // Match pattern: number - number or number - (number)
  // Handles negative numbers in parentheses
  const regex = /^(-?\d+)\s*(-)\s*\(?(-?\d+)\)?$/;
  const match = step1.match(regex);

  if (!match) {
    console.error('[KCC Validation] Could not parse expression:', step1);
    return { firstNum: 0, operator: '-', secondNum: 0 };
  }

  return {
    firstNum: parseInt(match[1], 10),
    operator: match[2],
    secondNum: parseInt(match[3], 10),
  };
}

/**
 * Measure KaTeX element positions via DOM
 *
 * Queries KaTeX DOM structure and uses getBoundingClientRect to get
 * precise pixel positions of minus sign and second number.
 *
 * @param {React.RefObject} katexRef - Ref to KaTeX container element
 * @param {number} canvasWidth - Canvas width for coordinate transformation
 * @param {number} canvasHeight - Canvas height
 * @returns {{mark1Region: object, mark2Region: object, isNum2Negative: boolean} | null}
 *
 * @example
 * const positions = measureKaTeXPositions(katexRef, 600, 250);
 * // Returns: {mark1Region: {x, y, width, height}, mark2Region: {...}, isNum2Negative: false}
 */
export function measureKaTeXPositions(katexRef, canvasWidth, canvasHeight) {
  // Guard clause: ref must be valid
  if (!katexRef || !katexRef.current) {
    console.warn('[KCC Validation] ❌ KaTeX ref not available');
    return null;
  }

  try {
    const katexContainer = katexRef.current;
    console.log('[KCC Validation] katexContainer:', katexContainer);
    console.log('[KCC Validation] katexContainer innerHTML:', katexContainer.innerHTML?.substring(0, 100));

    // The KaTeX container is absolutely positioned with transform: translate(-50%, -50%)
    // The parent element is the CanvasContainer (styled component)
    const canvasContainer = katexContainer.parentElement; // Direct parent is CanvasContainer
    if (!canvasContainer) {
      console.warn('[KCC Validation] ❌ Could not find canvas container');
      return null;
    }

    const containerRect = canvasContainer.getBoundingClientRect();
    console.log('[KCC Validation] Container rect:', containerRect);
    console.log('[KCC Validation] Container width/height:', containerRect.width, 'x', containerRect.height);

    // Account for border width - getBoundingClientRect includes border,
    // but Stage coordinates start after the border
    const borderWidth = 3; // 3px border from CanvasContainer

    // Additional check: bounds must be valid
    if (containerRect.width === 0 || containerRect.height === 0) {
      console.warn('[KCC Validation] KaTeX bounds are zero');
      return null;
    }

    // Find minus operator (subtraction sign)
    const minusOperator = katexContainer.querySelector('.mbin');
    if (!minusOperator) {
      console.warn('[KCC Validation] Could not find minus operator (.mbin)');
      return null;
    }

    const minusRect = minusOperator.getBoundingClientRect();

    // Transform to canvas-relative coordinates
    // Account for: border (3px) and the fact that Stage starts at (0, 0) inside the border
    const mark1Region = {
      x: minusRect.left - containerRect.left - borderWidth,
      y: minusRect.top - containerRect.top - borderWidth,
      width: minusRect.width,
      height: minusRect.height,
      centerX: (minusRect.left - containerRect.left - borderWidth) + minusRect.width / 2,
      centerY: (minusRect.top - containerRect.top - borderWidth) + minusRect.height / 2,
    };

    console.log('[KCC Validation] DOM measured Mark 1:', {
      minusRect: { left: minusRect.left, top: minusRect.top, width: minusRect.width, height: minusRect.height },
      containerRect: { left: containerRect.left, top: containerRect.top },
      mark1Region,
    });

    // Determine if second number is negative (has parentheses)
    const hasParentheses = katexContainer.querySelector('.mopen') !== null;
    const isNum2Negative = hasParentheses;

    console.log('[KCC Validation] Checking for parentheses:');
    console.log('[KCC Validation]   - Found .mopen element:', hasParentheses);
    console.log('[KCC Validation]   - isNum2Negative:', isNum2Negative);
    console.log('[KCC Validation]   - KaTeX innerHTML:', katexContainer.innerHTML.substring(0, 200));

    let mark2Element;
    let mark2Type;

    if (isNum2Negative) {
      // Find negative sign inside parentheses
      // Structure: (−3) where − is a .mord element after .mopen
      const allElements = Array.from(katexContainer.querySelectorAll('*'));
      const openParenIndex = allElements.findIndex(el =>
        el.classList.contains('mopen') && el.textContent === '('
      );

      if (openParenIndex !== -1) {
        // Find next .mord element after opening paren that contains minus sign
        mark2Element = allElements
          .slice(openParenIndex + 1)
          .find(el => el.classList.contains('mord') && el.textContent === '−');
      }

      mark2Type = 'vertical';
    } else {
      // Find last digit (second number)
      const mordElements = Array.from(katexContainer.querySelectorAll('.mord'));
      mark2Element = mordElements
        .filter(el => /\d/.test(el.textContent))
        .pop();

      mark2Type = 'horizontal';
    }

    if (!mark2Element) {
      console.warn('[KCC Validation] Could not find second number element');
      return null;
    }

    const mark2Rect = mark2Element.getBoundingClientRect();

    const mark2Region = {
      x: mark2Rect.left - containerRect.left - borderWidth,
      y: mark2Rect.top - containerRect.top - borderWidth,
      width: mark2Rect.width,
      height: mark2Rect.height,
      type: mark2Type,
      centerX: (mark2Rect.left - containerRect.left - borderWidth) + mark2Rect.width / 2,
      centerY: (mark2Rect.top - containerRect.top - borderWidth) + mark2Rect.height / 2,
    };

    console.log('[KCC Validation] DOM measured Mark 2:', {
      mark2Rect: { left: mark2Rect.left, top: mark2Rect.top, width: mark2Rect.width, height: mark2Rect.height },
      mark2Region,
    });

    return {
      mark1Region,
      mark2Region,
      isNum2Negative,
    };
  } catch (error) {
    console.error('[KCC Validation] Error measuring KaTeX positions:', error);
    return null;
  }
}

/**
 * Estimate positions when DOM measurement fails
 *
 * Fallback strategy using mathematical approximation based on:
 * - Canvas size
 * - Font size (72px)
 * - Expression structure
 * - Centered layout
 *
 * @param {string} expression - Expression string like "9 - 2"
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{mark1Region: object, mark2Region: object, isNum2Negative: boolean}}
 *
 * @example
 * const positions = estimatePositions("7 - 3", 600, 250);
 * // Returns estimated positions (~90% accurate)
 */
export function estimatePositions(expression, canvasWidth, canvasHeight) {
  console.warn('[KCC Validation] Using position estimation with calibrated data');

  const { firstNum, secondNum } = parseExpression(expression);
  const isNum2Negative = secondNum < 0;

  // Based on user-collected data from 10 examples
  // Canvas center at 300px (for 600px width)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Character width estimation at 72px font: ~40-45px per character
  const CHAR_WIDTH = 42;
  const SPACE_WIDTH = 20; // Space between number and minus sign

  // Calculate first number's character count (including minus sign for negatives)
  const firstNumStr = String(firstNum);
  const firstNumChars = firstNumStr.length;

  // Estimate Mark 1 (minus sign) position
  // Based on calibrated data:
  // Single-digit positive (2-9): centerX ranges from 226-301
  // Double-digit positive (14): centerX ~319
  // Single-digit negative (-9): centerX ~272
  // Double-digit negative (-11 to -15): centerX ~292-348

  // Formula: centerX - (chars_before_minus * CHAR_WIDTH / 2) + adjustment
  let mark1CenterX;

  if (firstNum >= 1 && firstNum <= 9) {
    // Single-digit positive: use calibrated average with digit-specific offset
    // Average for 2,3,6,9: ~268, but varies by digit
    // Simplified: smaller digits further left
    mark1CenterX = centerX - (10 - firstNum) * 7.5;
  } else if (firstNum >= 10 && firstNum <= 99) {
    // Double-digit positive: ~319 for 14
    mark1CenterX = centerX + 19;
  } else if (firstNum >= -9 && firstNum < 0) {
    // Single-digit negative: ~272 for -9
    mark1CenterX = centerX - 28;
  } else if (firstNum >= -99 && firstNum <= -10) {
    // Double-digit negative: average ~320 (between 292 and 346)
    // Varies by specific number, use middle estimate
    mark1CenterX = centerX + 20;
  } else {
    // Fallback to simple estimation
    mark1CenterX = centerX - (firstNumChars * CHAR_WIDTH / 2) + SPACE_WIDTH;
  }

  const FONT_SIZE = 72;
  const mark1Region = {
    x: mark1CenterX - 28, // Width ~56px
    y: centerY - 51, // Height ~102px
    width: 56,
    height: 102,
    centerX: mark1CenterX,
    centerY: centerY,
  };

  // Estimate Mark 2 (second number) position
  // Based on calibrated data:
  // Horizontal marks (positive nums): centerX ranges from 336-388
  // Vertical marks (negative nums): centerX ranges from 370-435

  const secondNumStr = String(Math.abs(secondNum));
  const totalExpressionChars = firstNumStr.length + 3 + secondNumStr.length; // +3 for " - "

  // Position based on total expression length
  const mark2CenterX = centerX + (totalExpressionChars * CHAR_WIDTH / 2) - 60;

  const mark2Region = {
    x: mark2CenterX - 20,
    y: isNum2Negative ? centerY - 51 : centerY - 36, // Higher for horizontal marks
    width: 40,
    height: isNum2Negative ? 102 : 20, // Taller for vertical marks
    type: isNum2Negative ? 'vertical' : 'horizontal',
    centerX: mark2CenterX,
    centerY: isNum2Negative ? centerY : centerY - 26,
  };

  console.log('[KCC Validation] Calibrated estimation:', {
    firstNum,
    secondNum,
    mark1CenterX,
    mark2CenterX,
  });

  return {
    mark1Region,
    mark2Region,
    isNum2Negative,
  };
}

/**
 * Calculate target regions for validation
 *
 * Orchestrates DOM measurement with fallback estimation and applies
 * hit box expansion for forgiving touch input validation.
 *
 * @param {object} visualData - Problem visual data with step1 expression
 * @param {React.RefObject} katexRef - Ref to KaTeX container
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{mark1Region: object, mark2Region: object, isNum2Negative: boolean}}
 *
 * @example
 * const targetRegions = calculateTargetRegions(visualData, katexRef, 600, 250);
 * // Returns expanded hit boxes for validation
 */
export function calculateTargetRegions(visualData, katexRef, canvasWidth, canvasHeight) {
  if (!visualData || !visualData.step1) {
    console.error('[KCC Validation] Invalid visualData:', visualData);
    return null;
  }

  console.log('[KCC Validation] ========================================');
  console.log('[KCC Validation] calculateTargetRegions called');
  console.log('[KCC Validation] Expression:', visualData.step1);
  console.log('[KCC Validation] Canvas size:', { canvasWidth, canvasHeight });
  console.log('[KCC Validation] Has katexRef:', !!katexRef);
  console.log('[KCC Validation] katexRef.current:', katexRef?.current);

  // Try DOM measurement first
  let positions = measureKaTeXPositions(katexRef, canvasWidth, canvasHeight);

  // Fallback to estimation if measurement fails
  if (!positions) {
    console.log('[KCC Validation] ❌ DOM measurement FAILED - using estimation');
    positions = estimatePositions(visualData.step1, canvasWidth, canvasHeight);
  } else {
    console.log('[KCC Validation] ✓ DOM measurement SUCCEEDED');
  }

  const { mark1Region, mark2Region, isNum2Negative } = positions;

  // Apply hit box expansion for forgiving validation
  // From plan: ±15px vertical, ±8px horizontal for mark 1

  const expandedMark1Region = {
    x: mark1Region.x - 8,
    y: mark1Region.y - 15,
    width: mark1Region.width + 16,  // +8 on each side
    height: mark1Region.height + 30, // +15 on each side
    centerX: mark1Region.centerX,
    centerY: mark1Region.centerY,
    type: 'vertical',
  };

  let expandedMark2Region;

  if (mark2Region.type === 'horizontal') {
    // Mark 2A: Horizontal above positive number
    // Target: 15px above digit, ±10px vertical tolerance
    expandedMark2Region = {
      x: mark2Region.x,
      y: mark2Region.y - 15 - 10, // 15px above, 10px tolerance
      width: mark2Region.width,
      height: 20, // ±10px tolerance band
      type: 'horizontal',
      centerX: mark2Region.centerX,
      centerY: mark2Region.y - 15, // 15px above digit
    };
  } else {
    // Mark 2B: Vertical through negative sign (same as mark 1)
    expandedMark2Region = {
      x: mark2Region.x - 6,
      y: mark2Region.y - 12,
      width: mark2Region.width + 12,
      height: mark2Region.height + 24,
      centerX: mark2Region.centerX,
      centerY: mark2Region.centerY,
      type: 'vertical',
    };
  }

  const result = {
    mark1Region: expandedMark1Region,
    mark2Region: expandedMark2Region,
    isNum2Negative,
  };

  console.log('[KCC Validation] ========================================');
  console.log('[KCC Validation] FINAL TARGET REGIONS:');
  console.log('[KCC Validation] Mark 1 (minus):', expandedMark1Region);
  console.log('[KCC Validation] Mark 2 (number):', expandedMark2Region);
  console.log('[KCC Validation] ========================================');

  return result;
}
