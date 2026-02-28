/**
 * Stroke Analysis Utilities for Keep-Change-Change Drawing Validation
 *
 * Provides functions for analyzing drawn strokes on canvas:
 * - Orientation detection (horizontal vs vertical)
 * - Bounding box calculation
 * - Stroke measurements
 *
 * Used to validate user-drawn marks for the Keep-Change-Change method
 * in SubtractingIntegersLesson levels 1-4.
 */

/**
 * Calculate bounding box for a stroke
 *
 * @param {number[]} points - Konva points array [x1, y1, x2, y2, ...]
 * @returns {{x: number, y: number, width: number, height: number} | null}
 *
 * @example
 * const bounds = calculateStrokeBounds([10, 20, 50, 60, 90, 100]);
 * // Returns: {x: 10, y: 20, width: 80, height: 80}
 */
export function calculateStrokeBounds(points) {
  if (!points || points.length < 4) {
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Classify stroke orientation based on aspect ratio
 *
 * Uses bounding box aspect ratio to determine if stroke is horizontal,
 * vertical, or diagonal. Tolerances are set for iPad touch input.
 *
 * @param {number[]} points - Konva points array [x1, y1, x2, y2, ...]
 * @returns {'horizontal' | 'vertical' | 'diagonal' | 'unknown'}
 *
 * @example
 * const orientation = classifyStrokeOrientation([10, 50, 200, 50]);
 * // Returns: 'horizontal' (aspect ratio = 190/0 >> 2.5)
 */
export function classifyStrokeOrientation(points) {
  const bounds = calculateStrokeBounds(points);

  if (!bounds) {
    return 'unknown';
  }

  const { width, height } = bounds;

  // Avoid division by zero
  if (width === 0 && height === 0) {
    return 'unknown';
  }

  // Calculate aspect ratio
  const aspectRatio = height === 0 ? Infinity : width / height;

  console.log('[KCC Validation] Stroke dimensions:', { width, height, aspectRatio });

  // Thresholds calibrated for iPad touch input
  const HORIZONTAL_THRESHOLD = 2.5; // width/height > 2.5 = horizontal
  const VERTICAL_THRESHOLD = 0.4;   // width/height < 0.4 = vertical

  if (aspectRatio > HORIZONTAL_THRESHOLD) {
    console.log('[KCC Validation] Classified as HORIZONTAL');
    return 'horizontal';
  } else if (aspectRatio < VERTICAL_THRESHOLD) {
    console.log('[KCC Validation] Classified as VERTICAL');
    return 'vertical';
  } else {
    console.log('[KCC Validation] Classified as DIAGONAL');
    return 'diagonal';
  }
}

/**
 * Get midpoint (center) of a stroke
 *
 * @param {number[]} points - Konva points array [x1, y1, x2, y2, ...]
 * @returns {{x: number, y: number} | null}
 *
 * @example
 * const midpoint = getStrokeMidpoint([10, 20, 90, 60]);
 * // Returns: {x: 50, y: 40} (center of bounding box)
 */
export function getStrokeMidpoint(points) {
  const bounds = calculateStrokeBounds(points);

  if (!bounds) {
    return null;
  }

  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Calculate total length of a stroke
 *
 * Measures the sum of distances between consecutive points.
 * Useful for detecting very short strokes (accidental dots).
 *
 * @param {number[]} points - Konva points array [x1, y1, x2, y2, ...]
 * @returns {number} Total stroke length in pixels
 *
 * @example
 * const length = calculateStrokeLength([0, 0, 3, 4]);
 * // Returns: 5 (Pythagorean theorem: sqrt(3^2 + 4^2))
 */
export function calculateStrokeLength(points) {
  if (!points || points.length < 4) {
    return 0;
  }

  let totalLength = 0;

  for (let i = 0; i < points.length - 2; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[i + 2];
    const y2 = points[i + 3];

    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    totalLength += segmentLength;
  }

  return totalLength;
}
