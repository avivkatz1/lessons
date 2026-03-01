import { useCallback } from 'react';

/**
 * Hook for converting between mathematical and grid coordinate systems
 *
 * Mathematical Coordinates:
 *   - Origin (0,0) at center of grid
 *   - x ranges from negative (left) to positive (right)
 *   - y ranges from negative (bottom) to positive (top)
 *   - Example for 11×11 grid: x ∈ [-5, 5], y ∈ [-5, 5]
 *
 * Grid Coordinates:
 *   - Origin (0,0) at top-left corner
 *   - col (x-axis) ranges [0, gridSize-1]
 *   - row (y-axis) ranges [0, gridSize-1]
 *   - Used for Konva rendering and array indexing
 *
 * @param {number} gridSize - Total grid size (e.g., 11 for 11×11 grid)
 * @param {number} originGridX - Grid column position of mathematical origin (default: center)
 * @param {number} originGridY - Grid row position of mathematical origin (default: center)
 * @returns {object} { mathToGrid, gridToMath } transformation functions
 *
 * @example
 * const { mathToGrid, gridToMath } = useCoordinateTransform(11, 5, 5);
 *
 * // Convert math coords to grid coords
 * mathToGrid(0, 0)    // → { gridCol: 5, gridRow: 5 } (center)
 * mathToGrid(-5, 5)   // → { gridCol: 0, gridRow: 0 } (top-left)
 * mathToGrid(5, -5)   // → { gridCol: 10, gridRow: 10 } (bottom-right)
 *
 * // Convert grid coords to math coords
 * gridToMath(5, 5)    // → { mathX: 0, mathY: 0 } (origin)
 * gridToMath(0, 0)    // → { mathX: -5, mathY: 5 } (top-left in math coords)
 */
export function useCoordinateTransform(
  gridSize = 11,
  originGridX = Math.floor(gridSize / 2),
  originGridY = Math.floor(gridSize / 2)
) {
  /**
   * Transform mathematical coordinates to grid coordinates
   * @param {number} mathX - Mathematical x-coordinate
   * @param {number} mathY - Mathematical y-coordinate
   * @returns {{ gridCol: number, gridRow: number }}
   */
  const mathToGrid = useCallback((mathX, mathY) => {
    return {
      gridCol: mathX + originGridX,
      gridRow: originGridY - mathY
    };
  }, [originGridX, originGridY]);

  /**
   * Transform grid coordinates to mathematical coordinates
   * @param {number} gridCol - Grid column (0-indexed)
   * @param {number} gridRow - Grid row (0-indexed)
   * @returns {{ mathX: number, mathY: number }}
   */
  const gridToMath = useCallback((gridCol, gridRow) => {
    return {
      mathX: gridCol - originGridX,
      mathY: originGridY - gridRow
    };
  }, [originGridX, originGridY]);

  /**
   * Check if mathematical coordinates are within valid bounds
   * @param {number} mathX - Mathematical x-coordinate
   * @param {number} mathY - Mathematical y-coordinate
   * @returns {boolean} true if coordinates are within grid bounds
   */
  const isInBounds = useCallback((mathX, mathY) => {
    const { gridCol, gridRow } = mathToGrid(mathX, mathY);
    return gridCol >= 0 && gridCol < gridSize &&
           gridRow >= 0 && gridRow < gridSize;
  }, [mathToGrid, gridSize]);

  return {
    mathToGrid,
    gridToMath,
    isInBounds,
    originGridX,
    originGridY,
    gridSize,
  };
}

export default useCoordinateTransform;
