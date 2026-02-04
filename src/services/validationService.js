/**
 * Validation Service
 * Phase 2 - Stage 3: Refactored validation system
 *
 * Pure function validators for different answer types.
 * All validators follow the same signature:
 * (userAnswer: string, correctAnswer: any, options?: object) => boolean
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_NUMERIC_TOLERANCE = 0.01;
const DEFAULT_FRACTION_TOLERANCE = 0.0001;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalizes user input (trim and lowercase)
 * @param {string} input - User input
 * @returns {string} Normalized input
 */
export const normalizeInput = (input) => {
  if (!input || typeof input !== "string") return "";
  return input.trim().toLowerCase();
};

/**
 * Checks if two numbers are equal within a tolerance
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} tolerance - Acceptable difference
 * @returns {boolean} Whether numbers are equal within tolerance
 */
export const numbersEqual = (a, b, tolerance = DEFAULT_NUMERIC_TOLERANCE) => {
  if (isNaN(a) || isNaN(b)) return false;
  return Math.abs(a - b) < tolerance;
};

/**
 * Parses a fraction string like "1/2" or "3/4" into a decimal
 * Handles mixed numbers like "1 1/2"
 * @param {string} str - Fraction string
 * @returns {number|null} Decimal value or null if invalid
 */
export const parseFraction = (str) => {
  if (!str || typeof str !== "string") return null;

  const trimmed = str.trim();

  // Handle mixed numbers like "1 1/2"
  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den === 0) return null;
    return whole + (whole < 0 ? -num / den : num / den);
  }

  // Handle simple fractions like "1/2"
  const fractionMatch = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10);
    const den = parseInt(fractionMatch[2], 10);
    if (den === 0) return null;
    return num / den;
  }

  // Handle plain numbers
  const num = parseFloat(trimmed);
  if (!isNaN(num)) return num;

  return null;
};

// ============================================================================
// VALIDATOR FUNCTIONS
// ============================================================================

/**
 * Validates numeric answers with floating point tolerance
 * @param {string} userAnswer - User's answer
 * @param {number|string} correctAnswer - Correct answer
 * @param {object} options - Validation options
 * @param {number} options.tolerance - Acceptable difference
 * @returns {boolean} Whether answer is correct
 */
export const validateNumber = (userAnswer, correctAnswer, options = {}) => {
  const { tolerance = DEFAULT_NUMERIC_TOLERANCE } = options;

  const userNum = parseFloat(userAnswer);
  const correctNum = parseFloat(correctAnswer);

  return numbersEqual(userNum, correctNum, tolerance);
};

/**
 * Validates coordinate answers like "(3, 4)" or "3, 4"
 * @param {string} userAnswer - User's answer
 * @param {Array<number>} correctAnswer - Correct [x, y] coordinates
 * @param {object} options - Validation options
 * @param {number} options.tolerance - Acceptable difference
 * @returns {boolean} Whether answer is correct
 */
export const validateCoordinate = (userAnswer, correctAnswer, options = {}) => {
  const { tolerance = DEFAULT_NUMERIC_TOLERANCE } = options;

  // Parse user input - accept formats like "(3, 4)", "3,4", "3 4"
  const cleaned = userAnswer.replace(/[()]/g, "").trim();
  const parts = cleaned.split(/[,\s]+/).filter((p) => p !== "");

  if (parts.length !== 2) return false;

  const userX = parseFloat(parts[0]);
  const userY = parseFloat(parts[1]);

  if (isNaN(userX) || isNaN(userY)) return false;

  // correctAnswer should be an array [x, y]
  if (!Array.isArray(correctAnswer) || correctAnswer.length !== 2) {
    return false;
  }

  const correctX = parseFloat(correctAnswer[0]);
  const correctY = parseFloat(correctAnswer[1]);

  return numbersEqual(userX, correctX, tolerance) && numbersEqual(userY, correctY, tolerance);
};

/**
 * Validates text answers (case-insensitive by default)
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @param {object} options - Validation options
 * @param {boolean} options.caseSensitive - Whether to match case
 * @returns {boolean} Whether answer is correct
 */
export const validateText = (userAnswer, correctAnswer, options = {}) => {
  const { caseSensitive = false } = options;

  const userText = caseSensitive ? userAnswer.trim() : normalizeInput(userAnswer);
  const correctText = caseSensitive
    ? String(correctAnswer).trim()
    : normalizeInput(String(correctAnswer));

  return userText === correctText;
};

/**
 * Validates fraction answers
 * @param {string} userAnswer - User's answer (e.g., "1/2", "0.5")
 * @param {string|number|object} correctAnswer - Correct answer in various formats
 * @param {object} options - Validation options
 * @param {number} options.tolerance - Acceptable difference
 * @param {boolean} options.exactMatch - Whether to require exact fraction match (no decimal comparison)
 * @returns {boolean} Whether answer is correct
 */
export const validateFraction = (userAnswer, correctAnswer, options = {}) => {
  const { tolerance = DEFAULT_FRACTION_TOLERANCE, exactMatch = false } = options;

  let correctValue;

  // Handle different correct answer formats
  if (typeof correctAnswer === "number") {
    correctValue = correctAnswer;
  } else if (typeof correctAnswer === "object" && correctAnswer.numerator !== undefined) {
    // Fraction object with numerator/denominator
    if (correctAnswer.denominator === 0) return false;
    correctValue = correctAnswer.numerator / correctAnswer.denominator;
  } else if (typeof correctAnswer === "string") {
    correctValue = parseFraction(correctAnswer);
  } else {
    return false;
  }

  // Parse user answer
  const userValue = parseFraction(userAnswer);

  if (userValue === null || correctValue === null) return false;

  // For exact match mode (like reducing fractions), compare strings
  if (exactMatch) {
    return normalizeInput(userAnswer) === normalizeInput(String(correctAnswer));
  }

  // Otherwise compare numerically
  return numbersEqual(userValue, correctValue, tolerance);
};

/**
 * Validates expression answers (handles LaTeX formatting)
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer (may include LaTeX)
 * @param {object} options - Validation options
 * @param {boolean} options.ignoreWhitespace - Whether to ignore whitespace
 * @returns {boolean} Whether answer is correct
 */
export const validateExpression = (userAnswer, correctAnswer, options = {}) => {
  const { ignoreWhitespace = true } = options;

  let userText = normalizeInput(userAnswer);
  let correctText = normalizeInput(String(correctAnswer));

  if (ignoreWhitespace) {
    userText = userText.replace(/\s+/g, "");
    correctText = correctText.replace(/\s+/g, "");
  }

  return userText === correctText;
};

/**
 * Validates array-type answers (complex lesson-specific format)
 * @param {string} userAnswer - User's answer
 * @param {Array} correctAnswer - Array containing answer data
 * @param {object} options - Validation options
 * @param {string} options.lessonName - Lesson name for special handling
 * @returns {boolean} Whether answer is correct
 */
export const validateArray = (userAnswer, correctAnswer, options = {}) => {
  const { lessonName = "" } = options;

  if (!Array.isArray(correctAnswer) || correctAnswer.length === 0) {
    return false;
  }

  const firstElement = correctAnswer[0];

  // Check if firstElement is a fraction object (handle this first)
  if (firstElement?.numerator !== undefined && firstElement?.denominator !== undefined) {
    return validateFraction(userAnswer, firstElement);
  }

  let correctText;

  // Handle fractions in lesson name
  if (lessonName.includes("fractions")) {
    const fractionText = correctAnswer[0].text
      .replace(/\\frac{/, "")
      .replace(/}{/, "/")
      .replace(/}/, "");
    correctText = normalizeInput(fractionText);
  } else {
    correctText = firstElement?.text || firstElement;
    correctText = normalizeInput(String(correctText));
  }

  const normalizedUser = normalizeInput(userAnswer);

  // Direct string match first
  if (normalizedUser === correctText) {
    return true;
  }

  // Handle reducing_fractions (exact match required)
  if (lessonName === "reducing_fractions") {
    return validateFraction(userAnswer, correctText, { exactMatch: true });
  }

  // Handle evaluating_expressions
  if (lessonName === "evaluating_expressions") {
    return validateExpression(userAnswer, correctAnswer[0].text);
  }

  // Handle fraction comparison
  if (normalizedUser.includes("/") || correctText.includes("/")) {
    return validateFraction(userAnswer, correctText);
  }

  // Try numeric comparison as fallback
  const userNum = parseFloat(normalizedUser);
  const correctNum = parseFloat(correctText);
  if (!isNaN(userNum) && !isNaN(correctNum)) {
    return validateNumber(userAnswer, correctText);
  }

  return false;
};

// ============================================================================
// MAIN VALIDATION SERVICE
// ============================================================================

/**
 * Main validation function that routes to appropriate validator
 * @param {string} userAnswer - User's typed answer
 * @param {*} correctAnswer - Correct answer (various formats)
 * @param {object} options - Validation options
 * @param {string} options.answerType - Type: "number", "coordinate", "text", "array", "fraction", "expression"
 * @param {string} options.lessonName - Lesson name for special handling
 * @param {number} options.tolerance - Numeric tolerance
 * @returns {boolean} Whether the answer is correct
 */
export const validateAnswer = (userAnswer, correctAnswer, options = {}) => {
  const { answerType = "number", lessonName = "", ...validatorOptions } = options;

  // Empty answer is always wrong
  if (!userAnswer || userAnswer.trim() === "") {
    return false;
  }

  // Don't normalize here - let individual validators handle normalization
  // This allows options like caseSensitive to work properly
  switch (answerType) {
    case "number":
      return validateNumber(userAnswer, correctAnswer, validatorOptions);

    case "coordinate":
      return validateCoordinate(userAnswer, correctAnswer, validatorOptions);

    case "text":
      return validateText(userAnswer, correctAnswer, validatorOptions);

    case "fraction":
      return validateFraction(userAnswer, correctAnswer, validatorOptions);

    case "expression":
      return validateExpression(userAnswer, correctAnswer, validatorOptions);

    case "array":
      return validateArray(userAnswer, correctAnswer, { lessonName, ...validatorOptions });

    default:
      // Default to text comparison
      return validateText(userAnswer, correctAnswer, validatorOptions);
  }
};

// ============================================================================
// SERVICE OBJECT (for class-like usage)
// ============================================================================

export const ValidationService = {
  validateAnswer,
  validateNumber,
  validateCoordinate,
  validateText,
  validateFraction,
  validateExpression,
  validateArray,
  parseFraction,
  normalizeInput,
  numbersEqual,
};

export default ValidationService;
